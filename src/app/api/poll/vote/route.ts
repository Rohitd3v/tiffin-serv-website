import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyRecaptcha } from "@/lib/server-recaptcha";

/**
 * Accepts JSON phone, pollId, optionId, otp, and optional recaptchaToken to
 * record a customer's vote using their latest phone verification code.
 * Strips phone punctuation and prefixes 10-digit numbers with 91. Rejects
 * polls at or past their deadline and codes strictly past their expiry;
 * attempts to delete expired or successfully used codes and increment attempts
 * on mismatches. Does not recheck subscription
 * status or validate option membership here.
 * Returns 400 for missing fields or invalid codes, 403 for failed captcha or
 * an unrecognized customer, 410 for missing/inactive/expired polls, 409 for
 * duplicate votes, and 500 for missing configuration, other insert errors,
 * or caught exceptions. Success returns { ok: true, message }.
 */
export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { phone, pollId, optionId, otp, recaptchaToken } = await req.json();

    if (!phone || !pollId || !optionId || !otp) {
      return NextResponse.json({ error: "Missing required voting parameters" }, { status: 400 });
    }

    // reCAPTCHA v3 (graceful skip when keys are not configured).
    const captcha = await verifyRecaptcha(recaptchaToken, "poll_vote");
    if (!captcha.ok) {
      return NextResponse.json({ error: "Security check failed. Please try again." }, { status: 403 });
    }

    // Guard: poll must still be active and its deadline not passed.
    const { data: activePoll } = await supabase
      .from("polls")
      .select("id, status, closes_at")
      .eq("id", pollId)
      .maybeSingle();

    if (
      !activePoll ||
      activePoll.status !== "active" ||
      (activePoll.closes_at && new Date(activePoll.closes_at).getTime() <= Date.now())
    ) {
      return NextResponse.json(
        { error: "This poll has ended and is no longer accepting votes." },
        { status: 410 }
      );
    }

    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

    // 1. Verify OTP
    const { data: otpRow, error: otpErr } = await supabase
      .from("poll_otps")
      .select("id, otp_code, expires_at, attempts")
      .eq("phone", cleanPhone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (otpErr || !otpRow) {
      return NextResponse.json({ error: "No active verification code found. Please request a new code." }, { status: 400 });
    }

    if (new Date(otpRow.expires_at).getTime() < Date.now()) {
      await supabase.from("poll_otps").delete().eq("id", otpRow.id);
      return NextResponse.json({ error: "Verification code has expired. Please request a new one." }, { status: 400 });
    }

    const MAX_OTP_ATTEMPTS = 5;

    if (otpRow.attempts >= MAX_OTP_ATTEMPTS) {
      await supabase
        .from("poll_otps")
        .update({ expires_at: new Date().toISOString() })
        .eq("id", otpRow.id);
      return NextResponse.json(
        { error: "Too many failed attempts. This verification code has been locked. Please request a new code." },
        { status: 429 }
      );
    }

    if (otpRow.otp_code.trim() !== String(otp).trim()) {
      const newAttempts = otpRow.attempts + 1;
      const isLocked = newAttempts >= MAX_OTP_ATTEMPTS;
      await supabase
        .from("poll_otps")
        .update({
          attempts: newAttempts,
          ...(isLocked ? { expires_at: new Date().toISOString() } : {}),
        })
        .eq("id", otpRow.id);

      if (isLocked) {
        return NextResponse.json(
          { error: "Too many failed attempts. This verification code has been locked. Please request a new code." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Incorrect verification code. Please check your WhatsApp." },
        { status: 400 }
      );
    }

    // 2. Fetch customer ID
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .or(`phone.eq.${cleanPhone},phone.eq.${cleanPhone.slice(-10)}`)
      .limit(1)
      .maybeSingle();

    if (!customer) {
      return NextResponse.json({ error: "Customer not recognized" }, { status: 403 });
    }

    // 3. Insert vote (Protected by PostgreSQL UNIQUE constraint)
    const { error: voteErr } = await supabase.from("poll_votes").insert({
      poll_id: pollId,
      customer_id: customer.id,
      option_id: optionId,
    });

    if (voteErr) {
      if (voteErr.code === "23505" || voteErr.message.includes("unique")) {
        return NextResponse.json({
          code: "ALREADY_VOTED",
          message: "You have already voted on this poll!",
        }, { status: 409 });
      }
      return NextResponse.json({ error: voteErr.message }, { status: 500 });
    }

    // 4. Invalidate used OTP
    await supabase
      .from("poll_otps")
      .update({ expires_at: new Date().toISOString() })
      .eq("id", otpRow.id);

    return NextResponse.json({
      ok: true,
      message: "Vote cast successfully! Thank you for choosing this week's special.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
