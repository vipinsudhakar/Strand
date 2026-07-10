import { Suspense, lazy, useCallback, useEffect, useState } from "react";

import {
  analyzeProtein,
  foldProtein,
  getProteinAnalysis,
  getProteinHistory,
} from "../../api/protein";
import { Reveal } from "../../motion/Reveal";
import type { ProteinAnalysis, ProteinHistoryItem } from "../../types/protein";
import { ProteinInputPanel } from "./ProteinInputPanel";
import { ProteinStatsCard } from "./ProteinStatsCard";
import { ProteinHistoryList } from "./ProteinHistoryList";

// 3Dmol is heavy (~pushes the bundle past 500 kB); load the viewer — and with it
// 3Dmol — only once the user actually renders a structure.
const ProteinViewer = lazy(() =>
  import("./ProteinViewer").then((m) => ({ default: m.ProteinViewer })),
);

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : "Something went wrong.";

type ProteinToolProps = {
  /** Optional sequence handed over from the DNA tool's translate output. */
  initialSequence?: string;
};

export function ProteinTool({ initialSequence = "" }: ProteinToolProps) {
  const [sequence, setSequence] = useState(initialSequence);
  const [analysis, setAnalysis] = useState<ProteinAnalysis | null>(null);
  const [pdb, setPdb] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [folding, setFolding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<ProteinHistoryItem[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);

  const refreshHistory = useCallback(() => {
    getProteinHistory().then(setHistory).catch(() => {
      /* history is non-critical; leave the last good list in place */
    });
  }, []);

  useEffect(refreshHistory, [refreshHistory]);

  const handleAnalyze = useCallback(async () => {
    setError(null);
    setAnalyzing(true);
    try {
      const result = await analyzeProtein(sequence);
      setAnalysis(result);
      setActiveId(result.id);
      setPdb(null); // a fresh analysis invalidates any shown structure
      refreshHistory();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setAnalyzing(false);
    }
  }, [sequence, refreshHistory]);

  const handleFold = useCallback(async () => {
    setError(null);
    setFolding(true);
    try {
      const result = await foldProtein(sequence);
      setPdb(result.pdb);
      // Fold persists an analysis server-side; pull it so the stats show too.
      if (result.protein_analysis_id !== null) {
        const stats = await getProteinAnalysis(result.protein_analysis_id);
        setAnalysis(stats);
        setActiveId(stats.id);
      }
      refreshHistory();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setFolding(false);
    }
  }, [sequence, refreshHistory]);

  const handleSelectHistory = useCallback(async (id: number) => {
    setError(null);
    try {
      const stats = await getProteinAnalysis(id);
      setAnalysis(stats);
      setSequence(stats.sequence);
      setActiveId(stats.id);
      setPdb(null); // structure isn't stored against the analysis row
    } catch (err) {
      setError(errorMessage(err));
    }
  }, []);

  const showViewer = pdb !== null || folding;

  return (
    <section className="mx-auto max-w-5xl px-6 py-16 md:py-24">
      <Reveal className="max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-ash-500">
          Protein
        </p>
        <h1 className="mt-6 font-display text-4xl leading-tight text-ink md:text-5xl">
          Analysis &amp; folding
        </h1>
      </Reveal>

      <div className="mt-12 grid gap-12 lg:grid-cols-2">
        <ProteinInputPanel
          sequence={sequence}
          onSequenceChange={setSequence}
          onAnalyze={handleAnalyze}
          onFold={handleFold}
          analyzing={analyzing}
          folding={folding}
          error={error}
        />

        {(analysis || showViewer) && (
          <div className="flex flex-col gap-10">
            {analysis && (
              <Reveal>
                <ProteinStatsCard analysis={analysis} />
              </Reveal>
            )}
            {showViewer && (
              <Reveal>
                <Suspense
                  fallback={
                    <div className="aspect-square w-full rounded-2xl border border-hairline" />
                  }
                >
                  <ProteinViewer pdb={pdb} loading={folding} />
                </Suspense>
              </Reveal>
            )}
          </div>
        )}
      </div>

      <div className="mt-16">
        <ProteinHistoryList
          items={history}
          onSelect={handleSelectHistory}
          activeId={activeId}
        />
      </div>
    </section>
  );
}
