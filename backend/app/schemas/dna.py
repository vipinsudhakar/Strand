from datetime import datetime
from typing import List

from pydantic import BaseModel


class DnaAnalyzeRequest(BaseModel):
    sequence: str


class DnaAnalyzeResponse(BaseModel):
    id: int
    sequence: str
    length: int
    gc_content: float
    melting_temp: float
    melting_temp_method: str
    molecular_weight: float
    rna: str
    protein: str
    markers: List[str]
    created_at: datetime


class DnaHistoryItem(BaseModel):
    id: int
    sequence: str
    length: int
    gc_content: float
    melting_temp: float
    created_at: datetime
