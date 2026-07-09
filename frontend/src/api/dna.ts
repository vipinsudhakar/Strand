import type { SampleItem } from "../types/common";
import type { DnaAnalysis, DnaHistoryItem } from "../types/dna";
import { request } from "./client";

export function getDnaSamples(): Promise<SampleItem[]> {
  return request("/api/dna/samples", { anonymous: true });
}

export function analyzeDna(sequence: string): Promise<DnaAnalysis> {
  return request("/api/dna/analyze", { method: "POST", body: { sequence } });
}

export function getDnaHistory(limit = 20): Promise<DnaHistoryItem[]> {
  return request(`/api/dna/history?limit=${limit}`);
}

export function getDnaAnalysis(id: number): Promise<DnaAnalysis> {
  return request(`/api/dna/history/${id}`);
}
