/**
 * Server-side reCAPTCHA v3 verification.
 * Degraded mode: when RECAPTCHA_SECRET_KEY is not configured, verification
 * is skipped and requests pass through — so the site keeps working until
 * keys are added to .env.local.
 */

const SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY || "";
const MIN_SCORE = Number(process.env.RECAPTCHA_MIN_SCORE || "0.5");

export interface RecaptchaResult {
  ok: boolean;
  skipped: boolean; // true when keys not configured → check bypassed
  score?: number;
}

function denied(score?: number): RecaptchaResult {
  return { ok: false, skipped: false, score };
}

export async function verifyRecaptcha(
  token: unknown,
  action: string
): Promise<RecaptchaResult> {
  if (!SECRET_KEY) return { ok: true, skipped: true };

  if (typeof token !== "string" || token.length < 10) return denied();

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: SECRET_KEY, response: token }).toString(),
      cache: "no-store",
    });
    if (!res.ok) return denied();

    const data = (await res.json()) as {
      success?: boolean;
      score?: number;
      action?: string;
    };

    if (!data.success) return denied();

    // Action mismatch is advisory only; v3 action strings must match exactly.
    if (data.action && data.action !== action) {
      console.warn(`[recaptcha] action mismatch: expected=${action} got=${data.action}`);
    }

    const score = typeof data.score === "number" ? data.score : undefined;
    if (score !== undefined && score < MIN_SCORE) return denied(score);

    return { ok: true, skipped: false, score };
  } catch (err: unknown) {
    // Network failure contacting Google — fail open rather than blocking
    // legitimate subscribers from voting (protect availability).
    console.error("[recaptcha] verification request failed:", err);
    return { ok: true, skipped: true };
  }
}
