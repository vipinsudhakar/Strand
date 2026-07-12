import { motion } from "motion/react";

import type { Section } from "../layout/Nav";
import { Reveal } from "../../motion/Reveal";
import { fadeUp } from "../../motion/variants";
import { FeatureCard } from "./FeatureCard";

type DashboardProps = {
  onLaunch: (section: Section) => void;
};

/**
 * The landing section: a staggered editorial header, then the two tool cards.
 * Cards launch their tool by lifting `onLaunch` up to App's section state.
 */
export function Dashboard({ onLaunch }: DashboardProps) {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      <Reveal stagger className="max-w-2xl">
        <motion.p
          variants={fadeUp}
          className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500"
        >
          Strand
        </motion.p>
        <motion.h1
          variants={fadeUp}
          className="mt-6 font-display text-4xl leading-[1.05] text-ink sm:text-5xl md:text-6xl"
        >
          Protein and DNA analysis, done properly.
        </motion.h1>
        <motion.p
          variants={fadeUp}
          className="mt-6 font-sans text-lg leading-relaxed text-ash-500"
        >
          Real Biopython calculations, server-side structure prediction, and a
          history that remembers — in one quiet, focused workspace.
        </motion.p>
      </Reveal>

      <Reveal stagger className="mt-16 grid gap-5 md:grid-cols-2">
        <FeatureCard
          index="01 / Protein"
          title="Analysis & folding"
          description="Molecular weight, isoelectric point, extinction coefficient, composition, and ESMFold 3D structure prediction."
          onLaunch={() => onLaunch("protein")}
        />
        <FeatureCard
          index="02 / DNA"
          title="The central dogma"
          description="GC content, nearest-neighbor melting temperature, transcription to RNA, and translation to protein."
          onLaunch={() => onLaunch("dna")}
        />
      </Reveal>
    </section>
  );
}
