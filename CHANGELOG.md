# Changelog

## v1.0.0

First release. Strand began as a single 795-line HTML file that did its bioinformatics
in hand-rolled JavaScript and called the ESMFold API straight from the browser. This
release is a complete rewrite into a full-stack app: the calculations now run on
Biopython server-side, structure prediction is proxied through the backend, and every
analysis is persisted.

### Protein tool

- Molecular weight, isoelectric point, and molar extinction coefficient (reduced and
  oxidized), all computed with Biopython.
- Hydrophobic / charged / polar composition breakdown.
- 3D structure prediction via ESMFold, rendered with 3Dmol and colored by per-residue
  pLDDT confidence, with a legend.
- Six sample sequences (insulin, lysozyme, GFP, hemoglobin, PETase, antifreeze protein).

### DNA tool

- GC content, nearest-neighbor melting temperature (`Tm_NN`), and true double-stranded
  molecular weight.
- The central dogma: transcription to RNA, translation to protein, and start/stop marker
  detection.
- Hands the translated protein straight to the protein tool for folding.
- Four sample sequences (insulin, GFP, hemoglobin beta, TP53).

### Platform

- FastAPI backend with SQLModel/SQLite persistence and an httpx ESMFold proxy, so the
  browser never calls the prediction API directly.
- Analysis history scoped per browser by an anonymous client id — no accounts, no login.
- React + Vite + TypeScript frontend with a typed API client mirroring the backend schemas.
- Ships as a single Docker service: FastAPI serves both the API and the built frontend
  from one origin.
- 14 backend tests.

### Design

- A minimalist, motion-led interface built from scratch — a deliberate break from the
  original prototype's look.
- Editorial serif display type, self-hosted fonts, a single restrained accent, and
  functional color used only where it carries scientific meaning.
- Animated throughout — section transitions, staggered reveals, count-up figures, spring
  bars, magnetic hover — and every animation respects `prefers-reduced-motion`.

### Notes on the numbers

Moving the calculations to Biopython deliberately changed some outputs from the original
prototype. These are corrections, not regressions:

- **Isoelectric point** — was a linear heuristic clamped to 4–10; now a real pKa-based
  model, so values can land anywhere.
- **DNA melting temperature** — was a single Wallace-style formula; now nearest-neighbor
  thermodynamics, which diverges more on longer sequences.
- **DNA molecular weight** — the prototype's `length × 0.65` was off by roughly a factor
  of a thousand. It now reports true double-stranded mass.
- **Extinction coefficient** — the reduced value matches the prototype; the oxidized
  (cystine) value is new.

Protein molecular weight, GC content, and composition percentages are unchanged.

### Known limitations

- Switching between tools resets that tool's state, so a predicted structure has to be
  re-folded after navigating away.
- On a free-tier host the SQLite file sits on ephemeral disk, so history is cleared when
  the service restarts.
