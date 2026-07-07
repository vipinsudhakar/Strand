from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class ProteinAnalyzeRequest(BaseModel):
    sequence: str


class ProteinComposition(BaseModel):
    hydrophobic_pct: float
    charged_pct: float
    polar_pct: float


class ProteinAnalyzeResponse(BaseModel):
    id: int
    sequence: str
    length: int
    molecular_weight: float
    isoelectric_point: float
    extinction_coefficient_reduced: int
    extinction_coefficient_oxidized: int
    instability_index: float
    aromaticity: float
    gravy: float
    composition: ProteinComposition
    created_at: datetime


class ProteinHistoryItem(BaseModel):
    id: int
    sequence: str
    length: int
    molecular_weight: float
    isoelectric_point: float
    created_at: datetime


class FoldRequest(BaseModel):
    sequence: str


class FoldResponse(BaseModel):
    id: int
    protein_analysis_id: Optional[int]
    sequence: str
    pdb: str
    created_at: datetime


class FoldSummary(BaseModel):
    id: int
    sequence: str
    pdb: str
    created_at: datetime
