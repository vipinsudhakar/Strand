from typing import List

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select

from app.db import get_session
from app.deps import get_client_id
from app.models import FoldResult, ProteinAnalysis
from app.schemas.common import SampleItem
from app.schemas.protein import (
    FoldRequest,
    FoldResponse,
    FoldSummary,
    ProteinAnalyzeRequest,
    ProteinAnalyzeResponse,
    ProteinComposition,
    ProteinHistoryItem,
)
from app.services import protein_service
from app.services.esmfold_client import fold_sequence
from app.services.samples import get_protein_samples

router = APIRouter(prefix="/api/protein", tags=["protein"])

# ESMFold single-request practical bounds (residues).
MIN_FOLD_LEN = 10
MAX_FOLD_LEN = 400


def _to_response(row: ProteinAnalysis) -> ProteinAnalyzeResponse:
    return ProteinAnalyzeResponse(
        id=row.id,
        sequence=row.sequence,
        length=row.length,
        molecular_weight=row.molecular_weight,
        isoelectric_point=row.isoelectric_point,
        extinction_coefficient_reduced=row.extinction_coefficient_reduced,
        extinction_coefficient_oxidized=row.extinction_coefficient_oxidized,
        instability_index=row.instability_index,
        aromaticity=row.aromaticity,
        gravy=row.gravy,
        composition=ProteinComposition(
            hydrophobic_pct=row.hydrophobic_pct,
            charged_pct=row.charged_pct,
            polar_pct=row.polar_pct,
        ),
        created_at=row.created_at,
    )


def _persist_analysis(
    session: Session, client_id: str, stats: protein_service.ProteinStats
) -> ProteinAnalysis:
    row = ProteinAnalysis(
        client_id=client_id,
        sequence=stats.sequence,
        length=stats.length,
        molecular_weight=stats.molecular_weight,
        isoelectric_point=stats.isoelectric_point,
        extinction_coefficient_reduced=stats.extinction_coefficient_reduced,
        extinction_coefficient_oxidized=stats.extinction_coefficient_oxidized,
        instability_index=stats.instability_index,
        aromaticity=stats.aromaticity,
        gravy=stats.gravy,
        hydrophobic_pct=stats.composition.hydrophobic_pct,
        charged_pct=stats.composition.charged_pct,
        polar_pct=stats.composition.polar_pct,
    )
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


@router.get("/samples", response_model=List[SampleItem])
def samples():
    return get_protein_samples()


@router.post("/analyze", response_model=ProteinAnalyzeResponse, status_code=201)
def analyze(
    payload: ProteinAnalyzeRequest,
    client_id: str = Depends(get_client_id),
    session: Session = Depends(get_session),
):
    try:
        stats = protein_service.analyze_protein(payload.sequence)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))
    return _to_response(_persist_analysis(session, client_id, stats))


@router.post("/fold", response_model=FoldResponse, status_code=201)
async def fold(
    payload: FoldRequest,
    client_id: str = Depends(get_client_id),
    session: Session = Depends(get_session),
):
    try:
        stats = protein_service.analyze_protein(payload.sequence)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if stats.length < MIN_FOLD_LEN:
        raise HTTPException(status_code=400, detail=f"Sequence min {MIN_FOLD_LEN} residues")
    if stats.length > MAX_FOLD_LEN:
        raise HTTPException(
            status_code=400,
            detail=f"Sequence exceeds ESMFold single-request limit ({MAX_FOLD_LEN} residues)",
        )

    # Mirror the legacy behavior: folding also computes & stores the stats.
    analysis = _persist_analysis(session, client_id, stats)
    pdb = await fold_sequence(stats.sequence)

    fold_row = FoldResult(
        client_id=client_id,
        protein_analysis_id=analysis.id,
        sequence=stats.sequence,
        pdb_data=pdb,
    )
    session.add(fold_row)
    session.commit()
    session.refresh(fold_row)

    return FoldResponse(
        id=fold_row.id,
        protein_analysis_id=fold_row.protein_analysis_id,
        sequence=fold_row.sequence,
        pdb=fold_row.pdb_data,
        created_at=fold_row.created_at,
    )


@router.get("/history", response_model=List[ProteinHistoryItem])
def history(
    limit: int = Query(20, ge=1, le=100),
    client_id: str = Depends(get_client_id),
    session: Session = Depends(get_session),
):
    rows = session.exec(
        select(ProteinAnalysis)
        .where(ProteinAnalysis.client_id == client_id)
        .order_by(ProteinAnalysis.created_at.desc(), ProteinAnalysis.id.desc())
        .limit(limit)
    ).all()
    return [
        ProteinHistoryItem(
            id=r.id,
            sequence=r.sequence,
            length=r.length,
            molecular_weight=r.molecular_weight,
            isoelectric_point=r.isoelectric_point,
            created_at=r.created_at,
        )
        for r in rows
    ]


@router.get("/history/{analysis_id}", response_model=ProteinAnalyzeResponse)
def history_item(
    analysis_id: int,
    client_id: str = Depends(get_client_id),
    session: Session = Depends(get_session),
):
    row = session.get(ProteinAnalysis, analysis_id)
    if row is None or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return _to_response(row)


@router.get("/fold/{fold_id}", response_model=FoldSummary)
def fold_item(
    fold_id: int,
    client_id: str = Depends(get_client_id),
    session: Session = Depends(get_session),
):
    row = session.get(FoldResult, fold_id)
    if row is None or row.client_id != client_id:
        raise HTTPException(status_code=404, detail="Fold result not found")
    return FoldSummary(
        id=row.id,
        sequence=row.sequence,
        pdb=row.pdb_data,
        created_at=row.created_at,
    )
