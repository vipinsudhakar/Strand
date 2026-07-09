/*
 * Mirrors backend/app/schemas/protein.py field-for-field. This is a manual sync
 * point: if the Pydantic schemas change, change these too. (openapi-typescript
 * codegen is the natural later automation.)
 *
 * `created_at` is a Python datetime, serialized to an ISO-8601 string over JSON.
 */

export type ProteinComposition = {
  hydrophobic_pct: number;
  charged_pct: number;
  polar_pct: number;
};

export type ProteinAnalysis = {
  id: number;
  sequence: string;
  length: number;
  molecular_weight: number;
  isoelectric_point: number;
  extinction_coefficient_reduced: number;
  extinction_coefficient_oxidized: number;
  instability_index: number;
  aromaticity: number;
  gravy: number;
  composition: ProteinComposition;
  created_at: string;
};

export type ProteinHistoryItem = {
  id: number;
  sequence: string;
  length: number;
  molecular_weight: number;
  isoelectric_point: number;
  created_at: string;
};

/** POST /api/protein/fold — also runs & persists an analysis server-side. */
export type FoldResult = {
  id: number;
  protein_analysis_id: number | null;
  sequence: string;
  pdb: string;
  created_at: string;
};

/** GET /api/protein/fold/{id} — no protein_analysis_id on this one. */
export type FoldSummary = {
  id: number;
  sequence: string;
  pdb: string;
  created_at: string;
};
