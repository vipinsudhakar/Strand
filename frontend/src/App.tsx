import { motion } from "motion/react";

import { AnimatedNumber } from "./motion/AnimatedNumber";
import { MagneticButton } from "./motion/MagneticButton";
import { Reveal } from "./motion/Reveal";
import { fadeUp } from "./motion/variants";

// Temporary smoke screen: exercises the design tokens + motion primitives.
// Replaced by the real Nav / Dashboard shell in a later commit.
export default function App() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-8 px-6">
      <Reveal stagger className="flex flex-col gap-6">
        <motion.p
          variants={fadeUp}
          className="font-mono text-sm uppercase tracking-widest text-ash-500"
        >
          Strand
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="font-display text-6xl font-medium leading-tight text-ink"
        >
          Motion primitives are live.
        </motion.h1>
        <motion.p variants={fadeUp} className="font-sans text-lg text-ash-500">
          Staggered reveals, count-up numbers, and a magnetic button — all
          respecting reduced-motion.
        </motion.p>
      </Reveal>

      <Reveal className="flex items-baseline gap-3">
        <AnimatedNumber
          value={5808}
          className="font-display text-5xl font-medium text-ink"
        />
        <span className="font-mono text-sm text-ash-500">Da · insulin MW</span>
      </Reveal>

      <MagneticButton className="w-fit rounded-full border border-ink px-6 py-3 font-sans text-base font-medium text-ink">
        Magnetic button
      </MagneticButton>
    </main>
  );
}
