import type { SampleItem } from "../types/common";
import type {
  FoldResult,
  FoldSummary,
  ProteinAnalysis,
  ProteinHistoryItem,
} from "../types/protein";
import { request } from "./client";

export function getProteinSamples(): Promise<SampleItem[]> {
  return request("/api/protein/samples", { anonymous: true });
}

export function analyzeProtein(sequence: string): Promise<ProteinAnalysis> {
  return request("/api/protein/analyze", { method: "POST", body: { sequence } });
}

/** Folds via the backend's ESMFold proxy; also persists an analysis row.
 *  Rejects sequences outside 10–400 residues with a 400. */
export function foldProtein(sequence: string): Promise<FoldResult> {
  return request("/api/protein/fold", { method: "POST", body: { sequence } });
}

export function getProteinHistory(limit = 20): Promise<ProteinHistoryItem[]> {
  return request(`/api/protein/history?limit=${limit}`);
}

export function getProteinAnalysis(id: number): Promise<ProteinAnalysis> {
  return request(`/api/protein/history/${id}`);
}

/** Replays a stored structure without re-calling ESMFold. */
export function getFoldResult(id: number): Promise<FoldSummary> {
  return request(`/api/protein/fold/${id}`);
}
