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
 * Requests a fresh reCAPTCHA token labeled with the action. Returns null outside
 * the browser, without a site key or loaded API, or when execute rejects.
 * A synchronous error from ready rejects the returned promise; synchronous
 * errors in a deferred ready callback are not caught here.
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

/**
 * Loads reCAPTCHA lazily on user interaction (scroll, touch, click) or
 * after an idle delay, ensuring third-party scripts never block initial
 * page render, LCP, or main-thread performance.
 */
export function useRecaptchaInit(): void {
  useEffect(() => {
    if (typeof window === "undefined" || !SITE_KEY) return;

    let executed = false;
    const trigger = () => {
      if (executed) return;
      executed = true;
      cleanup();
      initializeRecaptcha();
    };

    const cleanup = () => {
      window.removeEventListener("scroll", trigger);
      window.removeEventListener("click", trigger);
      window.removeEventListener("touchstart", trigger);
      window.removeEventListener("keydown", trigger);
    };

    window.addEventListener("scroll", trigger, { passive: true, once: true });
    window.addEventListener("click", trigger, { passive: true, once: true });
    window.addEventListener("touchstart", trigger, { passive: true, once: true });
    window.addEventListener("keydown", trigger, { passive: true, once: true });

    const timer = setTimeout(trigger, 4000);

    return () => {
      cleanup();
      clearTimeout(timer);
    };
  }, []);
}
