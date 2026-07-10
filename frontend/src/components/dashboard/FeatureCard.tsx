import { motion } from "motion/react";

import { MagneticButton } from "../../motion/MagneticButton";
import { fadeUp } from "../../motion/variants";

type FeatureCardProps = {
  index: string;
  title: string;
  description: string;
  onLaunch: () => void;
};

/**
 * A dashboard entry card. Rises in as part of a staggered container (inherits
 * the `fadeUp` variant), pulls gently toward the cursor via MagneticButton, and
 * nudges its arrow on hover. `index`/`title`/`description` are the tool blurb.
 */
export function FeatureCard({
  index,
  title,
  description,
  onLaunch,
}: FeatureCardProps) {
  return (
    <motion.div variants={fadeUp}>
      <MagneticButton
        type="button"
        onClick={onLaunch}
        strength={0.15}
        className="group flex h-full w-full flex-col rounded-2xl border border-hairline p-8 text-left transition-colors duration-300 hover:border-ink"
      >
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500">
          {index}
        </span>
        <span className="mt-8 font-display text-3xl leading-tight text-ink">
          {title}
        </span>
        <span className="mt-3 font-sans text-ash-500">{description}</span>
        <span className="mt-10 inline-flex items-center gap-2 font-sans text-sm font-medium text-accent">
          Open tool
          <span className="transition-transform duration-300 ease-out group-hover:translate-x-1">
            →
          </span>
        </span>
      </MagneticButton>
    </motion.div>
  );
}
