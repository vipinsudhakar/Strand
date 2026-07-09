import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react";
import type { ComponentProps, PointerEvent } from "react";
import { useRef } from "react";

type MagneticButtonProps = ComponentProps<typeof motion.button> & {
  /** How far the button drifts toward the cursor, as a fraction of the cursor
   *  offset from center. ~0.2–0.4 reads as a subtle magnetic pull. */
  strength?: number;
};

const SPRING = { stiffness: 150, damping: 15, mass: 0.1 } as const;

/**
 * A button that eases toward the pointer on hover and springs back on leave,
 * with a gentle scale on hover/press. The magnetic pull is disabled under
 * `prefers-reduced-motion`.
 */
export function MagneticButton({
  strength = 0.3,
  children,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const reduce = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, SPRING);
  const springY = useSpring(y, SPRING);

  function handlePointerMove(event: PointerEvent<HTMLButtonElement>) {
    const el = ref.current;
    if (reduce || !el) return;
    const rect = el.getBoundingClientRect();
    x.set((event.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((event.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.button
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ x: springX, y: springY }}
      whileHover={reduce ? undefined : { scale: 1.03 }}
      whileTap={reduce ? undefined : { scale: 0.97 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
