import { animate, useInView, useReducedMotion } from "motion/react";
import { useEffect, useRef } from "react";

import { DURATION, EASE_EXPO } from "./variants";

type AnimatedNumberProps = {
  value: number;
  /** Fixed decimal places when no custom `format` is given. */
  decimals?: number;
  /** Count-up duration in seconds. */
  duration?: number;
  /** Custom formatter (e.g. thousands separators, units). Overrides `decimals`. */
  format?: (value: number) => string;
  className?: string;
};

/**
 * Counts up from 0 to `value` the first time it scrolls into view, writing the
 * formatted result straight to the DOM node to avoid a re-render per frame.
 * Under `prefers-reduced-motion` the final value is shown immediately.
 */
export function AnimatedNumber({
  value,
  decimals = 0,
  duration = DURATION.slow,
  format,
  className,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const reduce = useReducedMotion();

  const fmt = (v: number) => (format ? format(v) : v.toFixed(decimals));

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (reduce) {
      el.textContent = fmt(value);
      return;
    }
    if (!inView) return;

    const controls = animate(0, value, {
      duration,
      ease: EASE_EXPO,
      onUpdate: (v) => {
        el.textContent = fmt(v);
      },
    });
    return () => controls.stop();
    // fmt is derived from value/decimals/format; intentionally not in deps to
    // avoid restarting the animation when an inline `format` prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value, reduce, duration]);

  // Initial paint: the final value when reduced, otherwise the starting 0.
  return <span ref={ref} className={className}>{fmt(reduce ? value : 0)}</span>;
}
