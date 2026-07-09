import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

import { fadeIn, fadeUp, staggerContainer } from "./variants";

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** When true, act as a container that reveals direct children in sequence.
   *  Those children must be `motion` elements using the `fadeUp`/`fadeIn`
   *  variants so they inherit this container's animation state. */
  stagger?: boolean;
  /** Delay before this element (not its children) begins, in seconds. */
  delay?: number;
  /** Viewport margin passed to whileInView; negative shrinks the trigger area. */
  margin?: string;
};

/**
 * Reveals content as it scrolls into view (once). A single block rises with
 * `fadeUp`; a `stagger` container sequences its children. Under
 * `prefers-reduced-motion` both collapse to an opacity-only fade.
 */
export function Reveal({
  children,
  className,
  stagger = false,
  delay = 0,
  margin = "-10% 0px -10% 0px",
}: RevealProps) {
  const reduce = useReducedMotion();
  const single = reduce ? fadeIn : fadeUp;

  return (
    <motion.div
      className={className}
      variants={stagger ? staggerContainer : single}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin }}
      transition={delay ? { delay } : undefined}
    >
      {children}
    </motion.div>
  );
}
