import { useEffect, useState } from "react";

import { getProteinSamples } from "../../api/protein";
import type { SampleItem } from "../../types/common";
import { MagneticButton } from "../../motion/MagneticButton";

type ProteinInputPanelProps = {
  /** Controlled sequence value — owned by the ProteinTool container so history
   *  rows and the DNA→protein transfer can populate it. */
  sequence: string;
  onSequenceChange: (sequence: string) => void;
  onAnalyze: () => void;
  onFold: () => void;
  analyzing?: boolean;
  folding?: boolean;
  /** Surfaced by the container from a failed analyze/fold call. */
  error?: string | null;
};

/**
 * Sequence entry for the protein tool: a set of sample chips fetched from the
 * API, a monospace textarea, and the Analyze / Fold actions. Purely presenta-
 * tional beyond loading its own sample list — the container runs the requests.
 */
export function ProteinInputPanel({
  sequence,
  onSequenceChange,
  onAnalyze,
  onFold,
  analyzing = false,
  folding = false,
  error = null,
}: ProteinInputPanelProps) {
  const [samples, setSamples] = useState<SampleItem[]>([]);

  useEffect(() => {
    let active = true;
    getProteinSamples()
      .then((items) => {
        if (active) setSamples(items);
      })
      .catch(() => {
        // Samples are a convenience; a fetch failure just leaves the chips empty.
      });
    return () => {
      active = false;
    };
  }, []);

  const busy = analyzing || folding;
  const residues = sequence.trim().length;

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
          placeholder="Paste an amino-acid sequence, or pick a sample above…"
          className="w-full resize-y rounded-xl border border-hairline bg-white/40 p-4 font-mono text-sm leading-relaxed text-ink outline-none transition-colors placeholder:text-ash-300 focus:border-accent"
        />
        <span className="font-mono text-xs text-ash-500">
          {residues} {residues === 1 ? "residue" : "residues"}
        </span>
      </div>

      {error && (
        <p className="font-sans text-sm text-comp-hydrophobic" role="alert">
          {error}
        </p>
      )}

      <div className="flex flex-wrap gap-3">
        <MagneticButton
          type="button"
          onClick={onAnalyze}
          disabled={busy || residues === 0}
          className="rounded-full bg-ink px-6 py-3 font-sans text-sm font-medium text-paper transition-opacity disabled:opacity-40"
        >
          {analyzing ? "Analyzing…" : "Analyze"}
        </MagneticButton>
        <MagneticButton
          type="button"
          onClick={onFold}
          disabled={busy || residues === 0}
          className="rounded-full border border-ink px-6 py-3 font-sans text-sm font-medium text-ink transition-opacity disabled:opacity-40"
        >
          {folding ? "Folding…" : "Fold 3D"}
        </MagneticButton>
      </div>
    </div>
  );
}
