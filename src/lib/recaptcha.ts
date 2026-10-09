"use client";

import { useEffect } from "react";

/**
 * Google reCAPTCHA v3 helper — injects the script once on mount and
 * executes it per-call. When the site key is not configured, tokens
 * resolve to null and server routes skip verification (graceful
 * degradation until keys are added).
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

/** Injects the reCAPTCHA script once; no-op when the key is missing. */
export function initializeRecaptcha(): void {
  if (typeof window === "undefined" || !SITE_KEY) return;
  if (document.querySelector('script[src*="recaptcha/api.js"]')) return;

  const script = document.createElement("script");
  script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Returns a fresh reCAPTCHA token for the action, or null when captcha
 * is disabled or unavailable. Never rejects — a captcha failure must not
 * block a subscriber from voting.
 */
export function getRecaptchaToken(action: string): Promise<string | null> {
  if (typeof window === "undefined" || !SITE_KEY) {
    return Promise.resolve(null);
  }
  if (!window.grecaptcha) {
    console.warn("[recaptcha] script not ready; skipping captcha check.");
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    window.grecaptcha!.ready(() => {
      window
        .grecaptcha!.execute(SITE_KEY, { action })
        .then((token) => resolve(token))
        .catch(() => resolve(null));
    });
  });
}

/** Convenience hook so page components can call this once on mount. */
export function useRecaptchaInit(): void {
  useEffect(() => {
    initializeRecaptcha();
  }, []);
}
