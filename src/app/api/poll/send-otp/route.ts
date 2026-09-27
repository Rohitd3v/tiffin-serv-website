import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendWhatsAppOtp } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { phone, pollId } = await req.json();
    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Valid phone number is required" }, { status: 400 });
    }
    if (!pollId || typeof pollId !== "string") {
      return NextResponse.json({ error: "Poll ID is required" }, { status: 400 });
    }

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

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

    // Delete existing OTPs for this phone to avoid stacking
    await supabase.from("poll_otps").delete().eq("phone", cleanPhone);

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
