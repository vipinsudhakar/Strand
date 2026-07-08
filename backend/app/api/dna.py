from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_client_id
from app.models import DnaAnalysis
from app.schemas.common import SampleItem
from app.schemas.dna import DnaAnalyzeRequest, DnaAnalyzeResponse, DnaHistoryItem
from app.services import dna_service
from app.services.samples import get_dna_samples

router = APIRouter(prefix="/api/dna", tags=["dna"])


def _to_response(row: DnaAnalysis) -> DnaAnalyzeResponse:
    return DnaAnalyzeResponse(
        id=row.id,
        sequence=row.sequence,
        length=row.length,
        gc_content=row.gc_content,
        melting_temp=row.melting_temp,
        melting_temp_method=row.melting_temp_method,
        molecular_weight=row.molecular_weight,
        rna=row.rna,
        protein=row.protein,
        markers=row.markers,
        created_at=row.created_at,
    )


@router.get("/samples", response_model=List[SampleItem])
def samples():
    return get_dna_samples()


@router.post("/analyze", response_model=DnaAnalyzeResponse, status_code=201)
def analyze(
    payload: DnaAnalyzeRequest,
    client_id: str = Depends(get_client_id),
    session: Session = Depends(get_session),
):
    try:
        stats = dna_service.analyze_dna(payload.sequence)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    row = DnaAnalysis(
        client_id=client_id,
        sequence=stats.sequence,
        length=stats.length,
        gc_content=stats.gc_content,
        melting_temp=stats.melting_temp,
        melting_temp_method=stats.melting_temp_method,
        molecular_weight=stats.molecular_weight,
        rna=stats.rna,
        protein=stats.protein,
        markers=stats.markers,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return _to_response(row)


@router.get("/history", response_model=List[DnaHistoryItem])
def history(
    limit: int = Query(20, ge=1, le=100),
    client_id: str = Depends(get_client_id),
    session: Session = Depends(get_session),
):
    rows = session.exec(
        select(DnaAnalysis)
        .where(DnaAnalysis.client_id == client_id)
        .order_by(DnaAnalysis.created_at.desc(), DnaAnalysis.id.desc())
        .limit(limit)
    ).all()
    return [
        DnaHistoryItem(
            id=r.id,
            sequence=r.sequence,
            length=r.length,
            gc_content=r.gc_content,
            melting_temp=r.melting_temp,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/history/{analysis_id}", response_model=DnaAnalyzeResponse)
def history_item(
    analysis_id: int,
    client_id: str = Depends(get_client_id),
    session: Session = Depends(get_session),
):
    row = session.get(DnaAnalysis, analysis_id)
    if row is None or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return _to_response(row)
