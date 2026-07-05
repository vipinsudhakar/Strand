from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, Index, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ProteinAnalysis(SQLModel, table=True):
    __tablename__ = "protein_analysis"
    __table_args__ = (Index("ix_protein_client_created", "client_id", "created_at"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    client_id: str = Field(index=True)
    sequence: str
    length: int
    molecular_weight: float
    isoelectric_point: float
    extinction_coefficient_reduced: int
    extinction_coefficient_oxidized: int
    instability_index: float
    aromaticity: float
    gravy: float
    hydrophobic_pct: float
    charged_pct: float
    polar_pct: float
    created_at: datetime = Field(default_factory=_utcnow, index=True)
