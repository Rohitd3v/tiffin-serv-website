import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyRecaptcha } from "@/lib/server-recaptcha";

/** A code is toast once it has absorbed five wrong entries. */
const MAX_OTP_ATTEMPTS = 5;

const MISSING_FIELDS_ERROR = "Missing required fields: phone, pollId, optionId, otp";

/**
 * Vote casting bounded by the WhatsApp OTP issued by POST /api/poll/send-otp.
 *
 * Flow:
 * 1. phone/pollId/optionId/otp must all be present before any verification.
 * 2. reCAPTCHA v3 runs before any database touch (bot protection; skipped
 *    gracefully when keys are not configured).
 * 3. The poll must be active and its deadline not passed.
 * 4. The freshest poll_otps row for the WhatsApp phone is pulled, checked for
 *    expiry, and compared against the submitted code. Wrong entries bump the
 *    attempts counter, five burn the code.
 * 5. The verified customer record is required and the option must belong to
 *    the active poll. The ballot is inserted and the code consumed; the
 *    unique constraint on poll_votes is the race-safe agent against
 *    double-voting, and the OTP is retained whenever a write fails so the
 *    subscriber can retry without a fresh code.
 *
 * Returns 400 for missing fields, unavailable/expired/incorrect codes; 403 for
 * captcha failures or unrecognized subscribers; 409 for duplicate insert 23505
 * or unique-constraint text; 410 for closed or expired polls; 500 for missed
 * configuration, insert exceptions, and transport errors.
 */
export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { phone, pollId, optionId, otp, recaptchaToken } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: MISSING_FIELDS_ERROR }, { status: 400 });
    }
    if (!pollId || typeof pollId !== "string") {
      return NextResponse.json({ error: MISSING_FIELDS_ERROR }, { status: 400 });
    }
    if (!optionId || typeof optionId !== "string") {
      return NextResponse.json({ error: MISSING_FIELDS_ERROR }, { status: 400 });
    }
    if (!otp && otp !== 0) {
      return NextResponse.json({ error: MISSING_FIELDS_ERROR }, { status: 400 });
    }

    // reCAPTCHA v3 (graceful skip when keys are not configured).
    const captcha = await verifyRecaptcha(recaptchaToken, "poll_vote");
    if (!captcha.ok) {
      return NextResponse.json(
        { error: "Security check failed. Please refresh the page and try again." },
        { status: 403 }
      );
    }

    // Guard: the poll must still be active and its deadline not passed.
    const { data: activePoll } = await supabase
      .from("polls")
      .select("id, status, closes_at, options")
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

    // Validate that optionId exists in this poll.
    const pollOptions = Array.isArray(activePoll.options)
      ? (activePoll.options as Array<{ id?: string }>)
      : [];
    const isValidOption = pollOptions.some((opt) => opt && opt.id === optionId);
    if (!isValidOption) {
      return NextResponse.json(
        { error: "Invalid dish option selected for this poll." },
        { status: 400 }
      );
    }

    // The freshest code issued to this WhatsApp phone.
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length === 10) cleanPhone = "91" + cleanPhone;

    const { data: codeRow } = await supabase
      .from("poll_otps")
      .select("id, otp_code, attempts, expires_at")
      .eq("phone", cleanPhone)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!codeRow) {
      return NextResponse.json(
        {
          code: "OTP_REQUIRED",
          error: "No active verification code. Open the voting flow again to request a fresh WhatsApp code.",
        },
        { status: 400 }
      );
    }

    // Codes die exactly at their timestamp, mirroring send-otp.
    if (new Date(codeRow.expires_at).getTime() < Date.now()) {
      await supabase.from("poll_otps").delete().eq("id", codeRow.id);
      return NextResponse.json(
        {
          code: "OTP_EXPIRED",
          error: "This verification code has expired. Please request a fresh code on WhatsApp.",
        },
        { status: 400 }
      );
    }

    if (String(otp).trim() !== String(codeRow.otp_code).trim()) {
      const nextAttempts = (codeRow.attempts ?? 0) + 1;
      if (nextAttempts >= MAX_OTP_ATTEMPTS) {
        await supabase.from("poll_otps").delete().eq("id", codeRow.id);
        return NextResponse.json(
          {
            code: "OTP_EXHAUSTED",
            error: "Too many incorrect attempts. Please request a fresh code on WhatsApp.",
          },
          { status: 400 }
        );
      }
      await supabase.from("poll_otps").update({ attempts: nextAttempts }).eq("id", codeRow.id);
      return NextResponse.json(
        { error: "Incorrect verification code. Please try again." },
        { status: 400 }
      );
    }

    // Resolve the vetted subscriber so the ballot attaches to their record.
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .or(`phone.eq.${cleanPhone},phone.eq.${cleanPhone.slice(-10)}`)
      .limit(1)
      .maybeSingle();

    if (!customer) {
      return NextResponse.json({ error: "Customer not recognized" }, { status: 403 });
    }

    // Record the ballot. The poll_votes unique constraint on
    // (customer_id, poll_id) is the race-safe agent against double-voting.
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
      // Keep the OTP so the subscriber can retry without a fresh code.
      return NextResponse.json({ error: voteErr.message }, { status: 500 });
    }

    // Consume the code only after a successful write.
    await supabase.from("poll_otps").delete().eq("id", codeRow.id);

    return NextResponse.json({
      ok: true,
      message: "Vote cast successfully! Thank you for choosing this week's special.",
      votedOptionId: optionId,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
