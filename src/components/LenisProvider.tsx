"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/** Singleton holder so pinned-scroll sections can coordinate with the scroller. */
export const lenisStore: { current: Lenis | null } = { current: null };

/**
 * Apple-style momentum scrolling via Lenis, integrated with GSAP's ticker so
 * ScrollTrigger reads the smoothed scroll position. Skipped entirely under
 * prefers-reduced-motion, where native scrolling is the accessible default.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // iOS deceleration
      touchMultiplier: 1.6,
    });
    lenisStore.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisStore.current = null;
    };
  }, []);

  return <>{children}</>;
}
