import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { phone, pollId, optionId, otp } = await req.json();

    if (!phone || !pollId || !optionId || !otp) {
      return NextResponse.json({ error: "Missing required voting parameters" }, { status: 400 });
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

    if (otpRow.otp_code.trim() !== String(otp).trim()) {
      await supabase.from("poll_otps").update({ attempts: otpRow.attempts + 1 }).eq("id", otpRow.id);
      return NextResponse.json({ error: "Incorrect verification code. Please check your WhatsApp." }, { status: 400 });
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
    await supabase.from("poll_otps").delete().eq("id", otpRow.id);

    return NextResponse.json({
      ok: true,
      message: "Vote cast successfully! Thank you for choosing this week's special.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || "Internal server error" }, { status: 500 });
  }
}
