import { createViewer, type AtomSpec, type GLViewer } from "3dmol";
import { useEffect, useRef } from "react";

/** Matches --color-paper in index.css; the viewer sits on the page background. */
const BACKGROUND = "#F7F6F3";

const ZOOM_FACTOR = 1.2;
const ZOOM_DURATION_MS = 1000;

/**
 * ESMFold stores per-residue pLDDT confidence in the PDB B-factor column. The
 * bands (and the 0–1 vs 0–100 scale fix) are ported verbatim from
 * legacy/biology.html — these are the one place functional color is meaningful.
 */
function plddtColor(atom: AtomSpec): string {
  const raw = atom.b ?? 0;
  const plddt = raw <= 1 ? raw * 100 : raw;
  if (plddt < 50) return "OrangeRed";
  if (plddt < 70) return "Gold";
  if (plddt < 90) return "MediumTurquoise";
  return "Blue";
}

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Renders a PDB structure with 3Dmol into a container div, colored by pLDDT.
 * Returns the ref to attach to that div. Pass `null` to render nothing.
 *
 * 3Dmol owns a WebGL canvas inside the container, so this tears the viewer down
 * and clears the node on every `pdb` change — leaving a stale canvas behind
 * leaks the GL context.
 */
export function useMolViewer(pdb: string | null) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || !pdb) return;

    el.innerHTML = "";
    let viewer: GLViewer;
    try {
      viewer = createViewer(el, { backgroundColor: BACKGROUND });
    } catch {
      // No WebGL context available (headless, blocked, or exhausted).
      return;
    }

    viewer.addModel(pdb, "pdb");
    viewer.setStyle({}, { cartoon: { colorfunc: plddtColor } });
    viewer.zoomTo();
    viewer.render();
    // The animated zoom is the viewer's entrance flourish; skip it when the OS
    // asks for reduced motion (0ms lands on the same final framing).
    viewer.zoom(ZOOM_FACTOR, prefersReducedMotion() ? 0 : ZOOM_DURATION_MS);

    // 3Dmol sizes its canvas to the container at creation, not on layout change.
    const observer = new ResizeObserver(() => viewer.resize());
    observer.observe(el);

    return () => {
      observer.disconnect();
      viewer.clear();
      el.innerHTML = "";
    };
  }, [pdb]);

  return containerRef;
}
