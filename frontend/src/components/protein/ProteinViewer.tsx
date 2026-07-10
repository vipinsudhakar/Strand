import { useMolViewer } from "../../hooks/useMolViewer";

type ProteinViewerProps = {
  pdb: string | null;
  loading?: boolean;
};

// pLDDT confidence bands — the same thresholds/colors useMolViewer paints the
// cartoon with, surfaced as a legend so the coloring is legible.
const LEGEND = [
  { label: "Very high", range: "> 90", color: "Blue" },
  { label: "Confident", range: "70–90", color: "MediumTurquoise" },
  { label: "Low", range: "50–70", color: "Gold" },
  { label: "Very low", range: "< 50", color: "OrangeRed" },
];

/**
 * Renders an ESMFold structure via the useMolViewer (3Dmol) hook, colored by
 * per-residue pLDDT confidence, with a legend. Shows a folding/empty state when
 * there's no structure yet. Meant to be lazy-loaded so 3Dmol only ships to the
 * protein tool (see ProteinTool).
 */
export function ProteinViewer({ pdb, loading = false }: ProteinViewerProps) {
  const containerRef = useMolViewer(pdb);

  return (
    <div className="flex flex-col gap-4">
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-hairline">
        <div ref={containerRef} className="absolute inset-0" />
        {!pdb && (
          <div className="absolute inset-0 flex items-center justify-center px-8 text-center">
            <p className="font-sans text-sm text-ash-500">
              {loading
                ? "Predicting structure…"
                : "Fold a sequence to see its predicted 3D structure."}
            </p>
          </div>
        )}
      </div>

      {pdb && (
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {LEGEND.map((band) => (
            <span
              key={band.label}
              className="inline-flex items-center gap-2 font-mono text-xs text-ash-500"
            >
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: band.color }}
              />
              {band.label}
              <span className="text-ash-300">{band.range}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
