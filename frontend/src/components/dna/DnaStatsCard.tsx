import { motion, useReducedMotion } from "motion/react";

import { AnimatedNumber } from "../../motion/AnimatedNumber";
import { Reveal } from "../../motion/Reveal";
import { EASE_EXPO, fadeUp } from "../../motion/variants";
import type { DnaAnalysis } from "../../types/dna";

// Force en-US grouping so large values read as 205,843 rather than the machine
// locale's grouping (e.g. Indian 2,05,843).
const integer = (value: number) => Math.round(value).toLocaleString("en-US");

type Tile = {
  label: string;
  value: number;
  decimals?: number;
  format?: (value: number) => string;
  unit?: string;
  note?: string;
};

function StatTile({ tile }: { tile: Tile }) {
  return (
    <motion.div
      variants={fadeUp}
      className="flex flex-col gap-2 border-t border-hairline pt-4"
    >
      <span className="font-mono text-xs uppercase tracking-[0.15em] text-ash-500">
        {tile.label}
      </span>
      <span className="font-display text-3xl text-ink md:text-4xl">
        <AnimatedNumber
          value={tile.value}
          decimals={tile.decimals}
          format={tile.format}
        />
        {tile.unit && (
          <span className="ml-1.5 font-sans text-sm text-ash-500">
            {tile.unit}
          </span>
        )}
      </span>
      {tile.note && (
        <span className="font-sans text-xs text-ash-300">{tile.note}</span>
      )}
    </motion.div>
  );
}

/**
 * DNA metrics: animated tiles plus a GC-vs-AT proportion bar. Two values differ
 * intentionally from the legacy tool (see the plan's migration notes): the
 * melting temp uses Biopython's nearest-neighbor model, and the molecular weight
 * is real double-stranded mass (~1000× the legacy length×0.65 estimate).
 */
export function DnaStatsCard({ analysis }: { analysis: DnaAnalysis }) {
  const reduce = useReducedMotion();
  const gc = analysis.gc_content;

  const tiles: Tile[] = [
    { label: "Length", value: analysis.length, unit: "bp" },
    { label: "GC content", value: gc, decimals: 1, unit: "%" },
    {
      label: "Melting temp",
      value: analysis.melting_temp,
      decimals: 1,
      unit: "°C",
      note: "nearest-neighbor (Tm_NN)",
    },
    {
      label: "Molecular weight",
      value: analysis.molecular_weight,
      format: integer,
      unit: "Da",
      note: "double-stranded",
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <Reveal stagger className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {tiles.map((tile) => (
          <StatTile key={tile.label} tile={tile} />
        ))}
      </Reveal>

      <Reveal stagger className="flex flex-col gap-3">
        <motion.div
          variants={fadeUp}
          className="flex items-baseline justify-between"
        >
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500">
            GC / AT
          </span>
          <span className="font-mono text-sm text-ash-500">
            <AnimatedNumber value={gc} decimals={1} />% ·{" "}
            <AnimatedNumber value={100 - gc} decimals={1} />%
          </span>
        </motion.div>
        <motion.div
          variants={fadeUp}
          className="flex h-1.5 overflow-hidden rounded-full bg-hairline"
        >
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: "var(--color-comp-charged)" }}
            initial={{ width: reduce ? `${gc}%` : 0 }}
            animate={{ width: `${gc}%` }}
            transition={reduce ? { duration: 0 } : { duration: 0.9, ease: EASE_EXPO }}
          />
        </motion.div>
      </Reveal>
    </div>
  );
}
