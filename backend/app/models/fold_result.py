from datetime import datetime, timezone
from typing import Optional

from sqlmodel import Field, Index, SQLModel


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class FoldResult(SQLModel, table=True):
    __tablename__ = "fold_result"
    __table_args__ = (Index("ix_fold_client_created", "client_id", "created_at"),)

    id: Optional[int] = Field(default=None, primary_key=True)
    client_id: str = Field(index=True)
    protein_analysis_id: Optional[int] = Field(default=None, foreign_key="protein_analysis.id")
    sequence: str
    pdb_data: str
    created_at: datetime = Field(default_factory=_utcnow, index=True)
