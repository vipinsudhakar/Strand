import { motion, useReducedMotion } from "motion/react";

import { AnimatedNumber } from "../../motion/AnimatedNumber";
import { Reveal } from "../../motion/Reveal";
import { EASE_EXPO, fadeUp } from "../../motion/variants";
import type { ProteinAnalysis } from "../../types/protein";

const integer = (value: number) => Math.round(value).toLocaleString();
const oneDecimal = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

type Tile = {
  label: string;
  value: number;
  decimals?: number;
  format?: (value: number) => string;
  unit?: string;
  note?: string;
};

type CompositionBar = {
  label: string;
  pct: number;
  color: string;
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

function CompositionRow({ bar }: { bar: CompositionBar }) {
  const reduce = useReducedMotion();
  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="font-sans text-sm text-ink">{bar.label}</span>
        <span className="font-mono text-sm text-ash-500">
          <AnimatedNumber value={bar.pct} decimals={1} />%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-hairline">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: bar.color }}
          initial={{ width: reduce ? `${bar.pct}%` : 0 }}
          animate={{ width: `${bar.pct}%` }}
          transition={
            reduce ? { duration: 0 } : { duration: 0.9, ease: EASE_EXPO }
          }
        />
      </div>
    </motion.div>
  );
}

/**
 * The protein result panel: animated numeric tiles (count-up) plus spring-in
 * composition bars. v1 shows the core set — length, MW, pI, extinction
 * coefficient, composition. instability/aromaticity/gravy come from the API too
 * but are deferred to a later tile pass.
 */
export function ProteinStatsCard({ analysis }: { analysis: ProteinAnalysis }) {
  const tiles: Tile[] = [
    { label: "Length", value: analysis.length, unit: "aa" },
    {
      label: "Molecular weight",
      value: analysis.molecular_weight,
      format: oneDecimal,
      unit: "Da",
    },
    {
      label: "Isoelectric point",
      value: analysis.isoelectric_point,
      decimals: 2,
      note: "Biopython full pKa model",
    },
    {
      label: "Extinction coefficient",
      value: analysis.extinction_coefficient_reduced,
      format: integer,
      unit: "M⁻¹cm⁻¹",
      note: `${integer(analysis.extinction_coefficient_oxidized)} oxidized (cystines)`,
    },
  ];

  const bars: CompositionBar[] = [
    {
      label: "Hydrophobic",
      pct: analysis.composition.hydrophobic_pct,
      color: "var(--color-comp-hydrophobic)",
    },
    {
      label: "Charged",
      pct: analysis.composition.charged_pct,
      color: "var(--color-comp-charged)",
    },
    {
      label: "Polar",
      pct: analysis.composition.polar_pct,
      color: "var(--color-comp-polar)",
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <Reveal stagger className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {tiles.map((tile) => (
          <StatTile key={tile.label} tile={tile} />
        ))}
      </Reveal>

      <Reveal stagger className="flex flex-col gap-4">
        <motion.span
          variants={fadeUp}
          className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500"
        >
          Composition
        </motion.span>
        {bars.map((bar) => (
          <CompositionRow key={bar.label} bar={bar} />
        ))}
      </Reveal>
    </div>
  );
}
