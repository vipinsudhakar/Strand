/*
 * Mirrors backend/app/schemas/dna.py field-for-field. Manual sync point.
 *
 * Note `melting_temp_method` is returned alongside `melting_temp` so the API is
 * self-documenting about which Tm model produced the number (Biopython Tm_NN).
 */

export type DnaAnalysis = {
  id: number;
  sequence: string;
  length: number;
  gc_content: number;
  melting_temp: number;
  melting_temp_method: string;
  molecular_weight: number;
  /** Transcribed RNA. */
  rna: string;
  /** Translated protein; stop codons are normalized to `_` (not Biopython's `*`). */
  protein: string;
  markers: string[];
  created_at: string;
};

export type DnaHistoryItem = {
  id: number;
  sequence: string;
  length: number;
  gc_content: number;
  melting_temp: number;
  created_at: string;
};
