from datetime import datetime, timezone
from typing import List, Optional

from sqlmodel import JSON, Column, Field, Index, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class DnaAnalysis(SQLModel, table=True):
    __tablename__ = "dna_analysis"
    __table_args__ = (Index("ix_dna_client_created", "client_id", "created_at"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    client_id: str = Field(index=True)
    sequence: str
    length: int
    gc_content: float
    melting_temp: float
    melting_temp_method: str
    molecular_weight: float
    rna: str
    protein: str
    markers: List[str] = Field(default_factory=list, sa_column=Column(JSON))
    created_at: datetime = Field(default_factory=_utcnow, index=True)
