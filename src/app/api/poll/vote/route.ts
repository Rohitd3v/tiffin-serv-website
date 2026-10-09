import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { verifyRecaptcha } from "@/lib/server-recaptcha";

// In-memory sliding-window IP rate limiting with TTL pruning
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const ipLimiter = new Map<string, RateLimitEntry>();

function checkIpRateLimit(ip: string, maxRequests = 10, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  // Prevent unbounded memory growth by pruning expired entries
  if (ipLimiter.size > 500) {
    for (const [key, val] of ipLimiter.entries()) {
      if (now > val.resetAt) ipLimiter.delete(key);
    }
  }
  const entry = ipLimiter.get(ip);
  if (!entry || now > entry.resetAt) {
    ipLimiter.set(ip, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) {
    return false;
  }
  entry.count += 1;
  return true;
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return "91" + digits;
  if (digits.startsWith("91") && digits.length === 12) return digits;
  return digits.length > 10 ? "91" + digits.slice(-10) : digits;
}

/**
 * Direct phone verification & ballot casting for active subscribers.
 * 
 * Protections:
 * 1. IP sliding-window limit (in-memory, immediate exit before network calls)
 * 2. Invisible reCAPTCHA v3 (bot protection)
 * 3. Active poll deadline & status guard
 * 4. Active subscriber validation (customers + subscriptions.status = 'active')
 * 5. Phone-level rate limit (spam protection)
 * 6. Duplicate vote protection (PostgreSQL UNIQUE constraint unique_customer_poll_vote)
 */
export async function POST(req: NextRequest) {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured" }, { status: 500 });
  }

  try {
    const { phone, pollId, optionId, recaptchaToken } = await req.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "Valid 10-digit phone number is required" }, { status: 400 });
    }
    if (!pollId || typeof pollId !== "string") {
      return NextResponse.json({ error: "Poll ID is required" }, { status: 400 });
    }
    if (!optionId || typeof optionId !== "string") {
      return NextResponse.json({ error: "Dish option is required" }, { status: 400 });
    }

    const cleanPhone = normalizePhone(phone);
    if (cleanPhone.length < 10) {
      return NextResponse.json({ error: "Please enter a valid 10-digit phone number" }, { status: 400 });
    }

    // 1. IP Rate Limiting (checked first to reject network floods without outbound API latency)
    const forwarded = req.headers.get("x-forwarded-for");
    const clientIp = (forwarded ? forwarded.split(",")[0].trim() : null) || req.headers.get("x-real-ip") || "unknown";
    if (clientIp !== "unknown" && !checkIpRateLimit(clientIp)) {
      return NextResponse.json(
        { error: "Too many requests from your network. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    // 2. Bot Protection: reCAPTCHA v3 (graceful skip when keys are not configured)
    const captcha = await verifyRecaptcha(recaptchaToken, "poll_vote");
    if (!captcha.ok) {
      return NextResponse.json(
        { error: "Security check failed. Please refresh the page and try again." },
        { status: 403 }
      );
    }

    // 3. Guard: Poll must still be active and its deadline not passed
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

    // Validate that optionId exists in this poll
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

    // 4. Phone-level Rate Limiting: max 5 attempts per phone per 10 mins
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: recentAttempts } = await supabase
      .from("poll_otps")
      .select("id")
      .eq("phone", cleanPhone)
      .gte("created_at", tenMinutesAgo)
      .limit(5);

    if (recentAttempts && recentAttempts.length >= 5) {
      return NextResponse.json(
        { error: "Too many voting attempts for this phone number. Please wait 10 minutes." },
        { status: 429 }
      );
    }

    // 5. Verify Customer exists
    const { data: customer, error: custErr } = await supabase
      .from("customers")
      .select("id")
      .or(`phone.eq.${cleanPhone},phone.eq.${cleanPhone.slice(-10)}`)
      .limit(1)
      .maybeSingle();

    if (custErr || !customer) {
      return NextResponse.json({
        code: "NO_ACTIVE_PLAN",
        message: "Voting is an exclusive perk for active subscribers. Subscribe to any meal plan today to vote on upcoming menus!",
      }, { status: 403 });
    }

    // 6. Verify Customer has an active meal plan subscription
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

    // 7. Duplicate Vote Guard: Check if customer already voted
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

    // Record verified attempt in poll_otps for multi-worker distributed rate limiting
    await supabase.from("poll_otps").insert({
      phone: cleanPhone,
      otp_code: "DIRECT_VOTE",
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      attempts: 1,
    });

    // 8. Insert Vote (Protected by PostgreSQL UNIQUE constraint unique_customer_poll_vote)
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
