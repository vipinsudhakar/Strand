# Strand

A full-stack workspace for protein and DNA sequence analysis. Real bioinformatics
calculations run server-side on Biopython; protein structure prediction is proxied to
ESMFold; every analysis is persisted so you can pull it back out of your history.

## What it does

**Protein** — molecular weight, isoelectric point, molar extinction coefficient
(reduced + oxidized), and a hydrophobic/charged/polar composition breakdown. Fold a
sequence and the predicted 3D structure renders in the browser, colored by per-residue
pLDDT confidence.

**DNA** — GC content, nearest-neighbor melting temperature, double-stranded molecular
weight, plus the central dogma: transcription to RNA, translation to protein, and
start/stop marker detection. The translated protein can be handed straight to the
protein tool for folding.

History is scoped per browser via an anonymous client id — no accounts, no login.

## Stack

- **Backend** — FastAPI, SQLModel (SQLite), Biopython, httpx
- **Frontend** — React, Vite, TypeScript, Tailwind v4, Framer Motion, 3Dmol.js
- **Structure prediction** — the public ESMFold API, proxied through the backend so the
  browser never calls it directly

## Running it

Two terminals. Backend first — the frontend expects it on `:8000`.

```bash
# terminal 1 — API on http://localhost:8000
cd backend
python -m venv .venv
./.venv/Scripts/pip install -r requirements.txt   # posix: .venv/bin/pip
./.venv/Scripts/python -m uvicorn app.main:app --reload
```

```bash
# terminal 2 — app on http://localhost:5173
cd frontend
npm install
npm run dev
```

Both sides read optional `.env` files; the defaults work as-is. See
`backend/.env.example` (database URL, ESMFold endpoint, CORS origins) and
`frontend/.env.example` (`VITE_API_BASE_URL`). The SQLite database is created on first
start — there are no migrations to run.

Tests:

```bash
cd backend && ./.venv/Scripts/python -m pytest tests   # 14 tests
cd frontend && npm run build                           # type-check + production build
```

## API

All routes are under `/api`. Everything except `/health` and the `samples` endpoints
requires an `X-Client-Id` header (any UUID — the frontend generates and stores one).

| Method | Route | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | liveness |
| `GET` | `/api/protein/samples` | 6 example protein sequences |
| `POST` | `/api/protein/analyze` | full protein statistics |
| `POST` | `/api/protein/fold` | ESMFold structure (10–400 residues); also stores an analysis |
| `GET` | `/api/protein/history` | past analyses for this client |
| `GET` | `/api/protein/history/{id}` | one full analysis |
| `GET` | `/api/protein/fold/{id}` | a stored structure |
| `GET` | `/api/dna/samples` | 4 example DNA sequences |
| `POST` | `/api/dna/analyze` | full DNA statistics + transcription/translation |
| `GET` | `/api/dna/history` | past analyses for this client |
| `GET` | `/api/dna/history/{id}` | one full analysis |

## Layout

```
backend/app/
  api/        routers (health, protein, dna)
  models/     SQLModel tables — all scoped by client_id
  schemas/    request/response models
  services/   Biopython calculations, ESMFold proxy, sample sequences
frontend/src/
  api/        typed client (injects X-Client-Id)
  types/      mirrors the backend schemas
  motion/     shared motion primitives + design tokens
  hooks/      client id, 3Dmol viewer
  components/ layout, dashboard, protein, dna
legacy/       the original single-file prototype
```

## A note on the numbers

Strand began as a single HTML file (kept in `legacy/`) that did its math in hand-rolled
JavaScript. Moving the calculations to Biopython deliberately changed some outputs:

- **Isoelectric point** — was a linear heuristic clamped to 4–10; now a real pKa-based
  model, so values can land anywhere and will differ from the prototype.
- **DNA melting temperature** — was a single Wallace-style formula; now nearest-neighbor
  thermodynamics (`Tm_NN`), which diverges more on longer sequences.
- **DNA molecular weight** — the prototype's `length × 0.65` was off by roughly a factor
  of a thousand. It now reports true double-stranded mass.
- **Extinction coefficient** — the reduced value matches the prototype; the oxidized
  (cystine) value is new.

Protein molecular weight, GC content, and the composition percentages should line up
with the original.
