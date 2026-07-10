/**
 * Quiet closing rule. Editorial, understated — a wordmark, one line on what the
 * app is, and the honest note that calculations run on Biopython server-side.
 */
export function Footer() {
  return (
    <footer className="border-t border-hairline">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-6 py-10 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="font-display text-lg text-ink">Strand</span>
        <p className="font-sans text-sm text-ash-500">
          Protein &amp; DNA analysis, computed with Biopython.
        </p>
      </div>
    </footer>
  );
}
