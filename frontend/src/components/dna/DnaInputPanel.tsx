import { useEffect, useState } from "react";

import { getDnaSamples } from "../../api/dna";
import type { SampleItem } from "../../types/common";
import { MagneticButton } from "../../motion/MagneticButton";

type DnaInputPanelProps = {
  /** Controlled sequence — owned by DnaTool so history and samples can set it. */
  sequence: string;
  onSequenceChange: (sequence: string) => void;
  onAnalyze: () => void;
  analyzing?: boolean;
  error?: string | null;
};

/**
 * Sequence entry for the DNA tool: sample chips fetched from the API, a mono-
 * space textarea, and a single Analyze action (DNA has no fold step). Mirrors
 * ProteinInputPanel; the container runs the request.
 */
export function DnaInputPanel({
  sequence,
  onSequenceChange,
  onAnalyze,
  analyzing = false,
  error = null,
}: DnaInputPanelProps) {
  const [samples, setSamples] = useState<SampleItem[]>([]);

  useEffect(() => {
    let active = true;
    getDnaSamples()
      .then((items) => {
        if (active) setSamples(items);
      })
      .catch(() => {
        /* samples are a convenience; leave chips empty on failure */
      });
    return () => {
      active = false;
    };
  }, []);

  const bases = sequence.replace(/\s/g, "").length;

  return (
    <div className="flex flex-col gap-6">
      {samples.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500">
            Samples
          </span>
          <div className="flex flex-wrap gap-2">
            {samples.map((sample) => (
              <button
                key={sample.key}
                type="button"
                onClick={() => onSequenceChange(sample.sequence)}
                className="rounded-full border border-hairline px-3.5 py-1.5 font-sans text-sm text-ash-500 transition-colors hover:border-ink hover:text-ink"
              >
                {sample.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <textarea
          value={sequence}
          onChange={(event) => onSequenceChange(event.target.value)}
          spellCheck={false}
          rows={5}
          placeholder="Paste a DNA sequence (A/T/C/G), or pick a sample above…"
          className="w-full resize-y rounded-xl border border-hairline bg-white/40 p-4 font-mono text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ash-300 focus:border-accent"
        />
        <span className="font-mono text-xs text-ash-500">
          {bases} {bases === 1 ? "base" : "bases"}
        </span>
      </div>

      {error && (
        <p className="font-sans text-sm text-comp-hydrophobic" role="alert">
          {error}
        </p>
      )}

      <div>
        <MagneticButton
          type="button"
          onClick={onAnalyze}
          disabled={analyzing || bases === 0}
          className="rounded-full bg-ink px-6 py-3 font-sans text-sm font-medium text-paper transition-opacity disabled:opacity-40"
        >
          {analyzing ? "Analyzing…" : "Analyze"}
        </MagneticButton>
      </div>
    </div>
  );
}
