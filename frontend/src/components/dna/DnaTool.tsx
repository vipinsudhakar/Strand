import { useCallback, useEffect, useState } from "react";

import { analyzeDna, getDnaAnalysis, getDnaHistory } from "../../api/dna";
import { Reveal } from "../../motion/Reveal";
import type { DnaAnalysis, DnaHistoryItem } from "../../types/dna";
import { DnaCentralDogmaPanel } from "./DnaCentralDogmaPanel";
import { DnaHistoryList } from "./DnaHistoryList";
import { DnaInputPanel } from "./DnaInputPanel";
import { DnaStatsCard } from "./DnaStatsCard";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";

type DnaToolProps = {
  /** Seeds the protein tool with a translated sequence and switches to it. */
  onTransfer: (sequence: string) => void;
};

export function DnaTool({ onTransfer }: DnaToolProps) {
  const [sequence, setSequence] = useState("");
  const [analysis, setAnalysis] = useState<DnaAnalysis | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<DnaHistoryItem[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const refreshHistory = useCallback(() => {
    getDnaHistory().then(setHistory).catch(() => {
      /* history is non-critical */
    });
  }, []);

  useEffect(refreshHistory, [refreshHistory]);

  const handleAnalyze = useCallback(async () => {
    setError(null);
    setAnalyzing(true);
    try {
      const result = await analyzeDna(sequence);
      setAnalysis(result);
      setActiveId(result.id);
      refreshHistory();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  }, [sequence, refreshHistory]);

  const handleSelectHistory = useCallback(async (id: number) => {
    setError(null);
    try {
      const result = await getDnaAnalysis(id);
      setAnalysis(result);
      setSequence(result.sequence);
      setActiveId(result.id);
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const handleTransfer = useCallback(() => {
    if (!analysis) return;
    // Strip stop-codon symbols before handing off, matching legacy behavior.
    onTransfer(analysis.protein.replace(/_/g, ""));
  }, [analysis, onTransfer]);

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <Reveal className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500">
          DNA
        </p>
        <h1 className="mt-6 font-display text-4xl leading-tight text-ink md:text-5xl">
          The central dogma
        </h1>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <DnaInputPanel
          sequence={sequence}
          onSequenceChange={setSequence}
          onAnalyze={handleAnalyze}
          analyzing={analyzing}
          error={error}
        />

        {analysis && (
          <Reveal>
            <DnaStatsCard analysis={analysis} />
          </Reveal>
        )}
      </div>

      {analysis && (
        <div className="mt-12">
          <DnaCentralDogmaPanel
            rna={analysis.rna}
            protein={analysis.protein}
            markers={analysis.markers}
            onTransfer={handleTransfer}
          />
        </div>
      )}

      <div className="mt-16">
        <DnaHistoryList
          items={history}
          onSelect={handleSelectHistory}
          activeId={activeId}
        />
      </div>
    </section>
  );
}
