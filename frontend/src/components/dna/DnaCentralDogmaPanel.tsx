import { motion } from "motion/react";

import { MagneticButton } from "../../motion/MagneticButton";
import { Reveal } from "../../motion/Reveal";
import { fadeUp } from "../../motion/variants";

type DnaCentralDogmaPanelProps = {
  rna: string;
  protein: string;
  markers: string[];
  /** Hands the translated protein (stops stripped) to the protein tool. */
  onTransfer: () => void;
};

function SequenceBlock({
  eyebrow,
  arrow,
  sequence,
}: {
  eyebrow: string;
  arrow?: string;
  sequence: string;
}) {
  return (
    <motion.div variants={fadeUp} className="flex flex-col gap-2">
      <span className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500">
        {arrow && <span className="mr-2 text-ash-300">{arrow}</span>}
        {eyebrow}
      </span>
      <p className="break-all rounded-xl border border-hairline bg-white/40 p-4 font-mono text-sm leading-relaxed text-ink">
        {sequence}
      </p>
    </motion.div>
  );
}

/**
 * Transcription → translation readout: the RNA and protein Strand computed
 * server-side, the start/stop markers found, and a button that seeds the protein
 * tool with the translated sequence (the one legacy behavior kept intact).
 * Protein uses `_` for stop codons (Biopython's `*`, normalized backend-side).
 */
export function DnaCentralDogmaPanel({
  rna,
  protein,
  markers,
  onTransfer,
}: DnaCentralDogmaPanelProps) {
  return (
    <Reveal stagger className="flex flex-col gap-6">
      <motion.h3
        variants={fadeUp}
        className="font-display text-2xl text-ink"
      >
        The central dogma
      </motion.h3>

      <SequenceBlock eyebrow="RNA · transcription" arrow="→" sequence={rna} />
      <SequenceBlock
        eyebrow="Protein · translation"
        arrow="→"
        sequence={protein}
      />

      {markers.length > 0 && (
        <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
          {markers.map((marker) => (
            <span
              key={marker}
              className="rounded-full border border-hairline px-3 py-1 font-mono text-xs text-ash-500"
            >
              {marker}
            </span>
          ))}
        </motion.div>
      )}

      <motion.div variants={fadeUp}>
        <MagneticButton
          type="button"
          onClick={onTransfer}
          className="inline-flex items-center gap-2 rounded-full border border-ink px-6 py-3 font-sans text-sm font-medium text-ink"
        >
          Send protein to folding
          <span aria-hidden>→</span>
        </MagneticButton>
      </motion.div>
    </Reveal>
  );
}
