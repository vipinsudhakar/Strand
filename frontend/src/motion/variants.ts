import type { Transition, Variants } from "motion/react";

/*
 * Shared motion tokens for Strand. These mirror the CSS motion tokens in
 * index.css (--ease-expo, --duration-base) so JS-driven and CSS-driven motion
 * stay in lockstep. Framer Motion wants easing as a cubic-bezier array.
 */
export const EASE_EXPO = [0.16, 1, 0.3, 1] as const; // expo-out, the house easing

export const DURATION = {
  fast: 0.4,
  base: 0.6,
  slow: 0.8,
} as const;

export const STAGGER = 0.07; // 70ms — inside the 60–80ms band

export const baseTransition: Transition = {
  duration: DURATION.base,
  ease: EASE_EXPO,
};

/** A single element rising into place. Used directly by <Reveal> and as the
 *  child variant under a staggered container. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: baseTransition },
};

/** Opacity-only fallback for `prefers-reduced-motion` — no vertical travel. */
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: DURATION.fast } },
};

/** Parent container that reveals its children in sequence. Children should use
 *  `fadeUp` (or `fadeIn`) and inherit the animation state from this parent. */
export const staggerContainer: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: STAGGER, delayChildren: 0.05 },
  },
};
