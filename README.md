# Strand

Strand is a web app for analyzing protein and DNA sequences. You paste in a sequence and
it works out the properties that matter — molecular weight, isoelectric point, GC
content, melting temperature — and for proteins, it predicts the 3D structure and renders
it in the browser.

**Live:** https://strand-0rgw.onrender.com

## Why I rebuilt it

The first version of this was a single HTML file. All the math ran in the browser in
hand-written JavaScript, and it called the ESMFold API straight from the client.

It worked, but the numbers weren't trustworthy. The isoelectric point was a linear
guess clamped between 4 and 10. The DNA molecular weight formula was off by roughly a
factor of a thousand. And putting the folding API call in the browser meant there was
nowhere to validate input or store anything.

So I rewrote it as a proper full-stack app. The calculations now run server-side with
Biopython, the structure prediction is proxied through my backend, and every analysis
gets saved.

## What it does

**Proteins**
- Molecular weight, isoelectric point, and extinction coefficient (reduced and oxidized)
- Composition breakdown — hydrophobic, charged, polar
- 3D structure prediction with ESMFold, rendered with 3Dmol and colored by per-residue
  confidence (pLDDT), so you can see which parts of the fold to trust

**DNA**
- GC content, melting temperature (nearest-neighbor), and double-stranded molecular weight
- Transcription to RNA and translation to protein, with start/stop codon detection
- Hands the translated protein straight over to the folding tool

Both tools come with sample sequences, and every analysis is saved to a history. There's
no login — history is scoped to your browser with an anonymous id kept in local storage.

## How it works

**Backend** — FastAPI. Biopython does the science, SQLModel and SQLite store the history,
and httpx proxies the ESMFold API so the browser never calls it directly.

**Frontend** — React, Vite, and TypeScript, with Tailwind for styling, Framer Motion for
the animation, and 3Dmol for the structure viewer.

It deploys as a single Docker service: FastAPI serves the API *and* the built frontend
from the same origin, so there's one URL and no CORS to configure.

## Running it locally

Two terminals. Start the backend first — the frontend expects it on port 8000.

```bash
# terminal 1 — API on http://localhost:8000
cd backend
python -m venv .venv
./.venv/Scripts/pip install -r requirements.txt   # macOS/Linux: .venv/bin/pip
./.venv/Scripts/python -m uvicorn app.main:app --reload
```

```bash
# terminal 2 — app on http://localhost:5173
cd frontend
npm install
npm run dev
```

The defaults work as-is, so you don't need to set anything up. The SQLite database is
created on first run. If you want to change something, see `backend/.env.example` and
`frontend/.env.example`.

Tests:

```bash
cd backend && ./.venv/Scripts/python -m pytest tests   # 14 tests
cd frontend && npm run build                           # type-check + build
```

## The API

Everything lives under `/api`. Apart from `/health` and the sample endpoints, requests
need an `X-Client-Id` header — any UUID. The frontend generates one and stores it.

| Method | Route | What it does |
| --- | --- | --- |
| `GET` | `/api/health` | health check |
| `GET` | `/api/protein/samples` | 6 example protein sequences |
| `POST` | `/api/protein/analyze` | full protein statistics |
| `POST` | `/api/protein/fold` | ESMFold structure, 10–400 residues |
| `GET` | `/api/protein/history` | your past analyses |
| `GET` | `/api/protein/history/{id}` | one analysis |
| `GET` | `/api/protein/fold/{id}` | a saved structure |
| `GET` | `/api/dna/samples` | 4 example DNA sequences |
| `POST` | `/api/dna/analyze` | full DNA statistics, plus RNA and protein |
| `GET` | `/api/dna/history` | your past analyses |
| `GET` | `/api/dna/history/{id}` | one analysis |

## A note on the numbers

Moving the math to Biopython changed some of the outputs from the original version. These
are fixes, not bugs:

- **Isoelectric point** — was a linear heuristic clamped to 4–10. Now it uses a real
  pKa-based model, so the value can land anywhere and will differ from the old tool.
- **DNA melting temperature** — was one Wallace-style formula for everything. Now it's
  nearest-neighbor thermodynamics, which drifts further from the old number the longer
  the sequence gets.
- **DNA molecular weight** — the old `length × 0.65` was wrong by about 1000×. It now
  reports actual double-stranded mass.
- **Extinction coefficient** — the reduced value matches the old one. The oxidized value
  is new.

Protein molecular weight, GC content, and the composition percentages should still line
up with the original.

## Known limitations

- Switching between the two tools resets that tool's state, so you have to re-fold a
  structure if you navigate away and come back.
- The live version runs on a free tier, so the first request after it's been idle takes
  30–60 seconds to wake up, and the analysis history is cleared whenever the service
  restarts.
