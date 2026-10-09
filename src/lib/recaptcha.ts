"use client";

import { useEffect } from "react";

/**
 * Google reCAPTCHA v3 helper — drops the script once and exposes
 * window.getRecaptchaToken(action) via a promise.
 *
 * Works fully offline of Google when SITE KEY is not configured:
 * getRecaptchaToken then resolves with null, and server routes skip
 * verification (graceful degradation until keys are added).
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, opts: { action: string }) => Promise<string>;
    };
    __recaptchaSiteKey?: string;
    __recaptchaPromise?: Promise<string | null>;
  }
}

export function initializeRecaptcha() {
  if (typeof window === "undefined") return;

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  if (!siteKey) return; // graceful skip when keys are not yet configured

  window.__recaptchaSiteKey = siteKey;

  if (document.querySelector('script[src*="recaptcha/api.js"]')) {
    return; // already injected
  }

  const script = document.createElement("script");
  script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * Returns a reCAPTCHA token, or null if captcha is disabled / unavailable.
 * Safe to call repeatedly: caches the promise after the first call.
 */
export function getRecaptchaToken(action: string): Promise<string | null> {
  if (typeof window === "undefined") return Promise.resolve(null);

  const siteKey = window.__recaptchaSiteKey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";
  if (!siteKey) return Promise.resolve(null);

  if (!window.grecaptcha) {
    // Script not yet loaded (e.g. blocked); degrade gracefully.
    console.warn("[recaptcha] script not ready; skipping captcha check.");
    return Promise.resolve(null);
  }

  if (window.__recaptchaPromise) return window.__recaptchaPromise;

  window.__recaptchaPromise = new Promise<string | null>((resolve) => {
    window.grecaptcha!.ready(() => {
      window
        .grecaptcha!.execute(siteKey, { action })
        .then((token) => resolve(token))
        .catch(() => resolve(null)); // never block voting on captcha failure
    });
  });
  return window.__recaptchaPromise;
}

/** Convenience hook so page components can call this once on mount. */
export function useRecaptchaInit() {
  useEffect(() => {
    initializeRecaptcha();
  }, []);
}
