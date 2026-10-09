import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendWhatsAppOtp } from "@/lib/whatsapp";
import { verifyRecaptcha } from "@/lib/server-recaptcha";

/**
 * Accepts JSON phone, pollId, and optional recaptchaToken to create a four-digit
 * OTP for an active subscriber. Strips phone punctuation and prefixes 10-digit
 * numbers with 91. Replaces that phone's stored codes with a five-minute code
 * and attempts WhatsApp delivery; delivery failure results do not prevent a
 * successful response containing phoneMasked. Does not check poll status.
 * Returns 400 for missing/invalid phone or pollId, 403 for failed captcha or
 * subscriber lookup (including query errors), 409 for an existing vote, and
 * 429 when at least three stored codes were created in the last ten minutes.
 * Missing configuration, insert errors, and caught exceptions return 500.
 */
export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { phone, pollId, recaptchaToken } = await req.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });
    }
    if (!pollId || typeof pollId !== "string") {
      return NextResponse.json({ error: "Poll ID is required" }, { status: 400 });
    }

    // reCAPTCHA v3 (graceful skip when keys are not configured).
    const captcha = await verifyRecaptcha(recaptchaToken, "send_otp");
    if (!captcha.ok) {
      return NextResponse.json(
        { error: "Security check failed. Please refresh the page and try again." },
        { status: 403 }
      );
    }

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

    // Rate limit: max 3 OTP sends per phone per 10 minutes (spam protection).
    const { data: recentOtps } = await supabase
      .from("poll_otps")
      .select("id")
      .eq("phone", cleanPhone)
      .gte("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString())
      .order("created_at", { ascending: false });

    if (recentOtps && recentOtps.length >= 3) {
      return NextResponse.json(
        { error: "Too many verification attempts. Please wait 10 minutes and try again." },
        { status: 429 }
      );
    }

    // 1. Verify customer exists and has an active subscription
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .select("id, name, phone")
      .or(`phone.eq.${cleanPhone},phone.eq.${cleanPhone.slice(-10)}`)
      .limit(1)
      .maybeSingle();

    if (custErr || !customer) {
      return NextResponse.json({
        code: "NO_ACTIVE_PLAN",
        message: "Voting is an exclusive perk for active subscribers. Subscribe to any meal plan today to vote on upcoming menus!",
      }, { status: 403 });
    }

    const { data: activeSub, error: subErr } = await supabase
      .from("subscriptions")
      .select("id, status")
      .eq("customer_id", customer.id)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (subErr || !activeSub) {
      return NextResponse.json({
        code: "NO_ACTIVE_PLAN",
        message: "Voting is an exclusive perk for active subscribers. Subscribe to any meal plan today to vote on upcoming menus!",
      }, { status: 403 });
    }

    // 2. Check if customer already voted on this poll
    const { data: existingVote } = await supabase
      .from("poll_votes")
      .select("id, option_id")
      .eq("poll_id", pollId)
      .eq("customer_id", customer.id)
      .maybeSingle();

    if (existingVote) {
      return NextResponse.json({
        code: "ALREADY_VOTED",
        message: "You have already voted on this poll! Here are the community results so far.",
        votedOptionId: existingVote.option_id,
      }, { status: 409 });
    }

    // 3. Generate 4-digit OTP
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 minutes

    // Invalidate/expire previous active OTPs for this phone to avoid stacking while preserving rate limit history
    await supabase
      .from("poll_otps")
      .update({ expires_at: new Date().toISOString() })
      .eq("phone", cleanPhone)
      .gt("expires_at", new Date().toISOString());

    const { error: otpInsertErr } = await supabase.from("poll_otps").insert({
      phone: cleanPhone,
      otp_code: otpCode,
      expires_at: expiresAt,
      attempts: 0,
    });

    if (otpInsertErr) {
      return NextResponse.json({ error: "Failed to create verification code" }, { status: 500 });
    }

    // 4. Send WhatsApp notification
    await sendWhatsAppOtp(cleanPhone, otpCode);

    const maskedPhone = cleanPhone.slice(-10).replace(/(\d{2})\d{4}(\d{4})/, "$1••••$2");

    return NextResponse.json({
      ok: true,
      message: `Verification code sent to WhatsApp number +91 ${maskedPhone}`,
      phoneMasked: `+91 ${maskedPhone}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
