import type { Transition } from "framer-motion";

/**
 * Apple Fluid Interface spring physics (WWDC "Designing Fluid Interfaces").
 * Never a fixed duration: a spring has no prescribed timeline — it settles
 * when the physics settle, so it stays interruptible from the live value.
 */

/** Default UI motion — critically damped, zero overshoot. */
export const appleSpring: Transition = {
  type: "spring",
  damping: 30,
  stiffness: 300,
};

/** Momentum motion — under-damped with a subtle, natural bounce. */
export const appleFlickSpring: Transition = {
  type: "spring",
  damping: 20,
  stiffness: 260,
};

/** Shared viewport config: reveal once, slightly before entering view. */
export const revealViewport = { once: true, amount: 0.25 } as const;
