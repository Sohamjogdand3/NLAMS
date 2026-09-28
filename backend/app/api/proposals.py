from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.project_proposal import ProjectProposal
from app.models.project_dpr import ProjectDpr
from app.models.project_gis_corridor import ProjectGisCorridor
from app.models.land_parcel import LandParcel
from app.schemas.proposal import (
    ProposalCreate,
    ProposalUpdate,
    ProposalOut,
    ProjectDprOut,
    GisCorridorIngest,
    GisCorridorOut,
    LandParcelOut,
)
from app.services.proposal_service import ProposalService

router = APIRouter(prefix="/proposals", tags=["Requiring Agency - Proposals"])


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@router.post("", response_model=ProposalOut, status_code=status.HTTP_201_CREATED)
def create_proposal(
    payload: ProposalCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 1: Requiring Agency (NHAI, Railways, MoRTH, PWD, NTPC) creates a new
    Land Acquisition Proposal with estimated budget and requested area.
    """
    client_ip = get_client_ip(request)
    proposal = ProposalService.create_proposal(
        db=db,
        user=current_user,
        project_title=payload.project_title,
        requiring_agency=payload.requiring_agency,
        ministry=payload.ministry,
        public_purpose=payload.public_purpose,
        estimated_budget_inr=payload.estimated_budget_inr,
        required_area_ha=payload.required_area_ha,
        target_district_id=payload.target_district_id,
        target_taluka_ids=payload.target_taluka_ids,
        description=payload.description,
        ip_address=client_ip,
    )
    return proposal


@router.get("", response_model=List[ProposalOut])
def list_proposals(
    agency: Optional[str] = None,
    status_filter: Optional[str] = None,
    district_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all project proposals, with optional filtering by agency or status."""
    query = db.query(ProjectProposal)
    if agency:
        query = query.filter(ProjectProposal.requiring_agency == agency.upper())
    if status_filter:
        query = query.filter(ProjectProposal.status == status_filter.upper())
    if district_id:
        query = query.filter(ProjectProposal.target_district_id == district_id)

    proposals = query.order_by(ProjectProposal.created_at.desc()).all()
    
    # Enrich counts
    result = []
    for prop in proposals:
        p_out = ProposalOut.from_orm(prop)
        p_out.parcels_count = db.query(LandParcel).filter(LandParcel.proposal_id == prop.id).count()
        p_out.dpr_count = db.query(ProjectDpr).filter(ProjectDpr.proposal_id == prop.id).count()
        result.append(p_out)
    return result


@router.get("/{proposal_id}", response_model=ProposalOut)
def get_proposal(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch single proposal details."""
    proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")
    
    p_out = ProposalOut.from_orm(proposal)
    p_out.parcels_count = db.query(LandParcel).filter(LandParcel.proposal_id == proposal.id).count()
    p_out.dpr_count = db.query(ProjectDpr).filter(ProjectDpr.proposal_id == proposal.id).count()
    return p_out


@router.put("/{proposal_id}", response_model=ProposalOut)
def update_proposal(
    proposal_id: int,
    payload: ProposalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Update a draft proposal."""
    proposal = db.query(ProjectProposal).filter(ProjectProposal.id == proposal_id).first()
    if not proposal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Proposal not found")

    if proposal.status not in ["DRAFT", "CONFLICTS_FLAGGED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot edit proposal in '{proposal.status}' status. Only DRAFT proposals can be modified.",
        )

    if payload.project_title is not None:
        proposal.project_title = payload.project_title
    if payload.description is not None:
        proposal.description = payload.description
    if payload.estimated_budget_inr is not None:
        proposal.estimated_budget_inr = payload.estimated_budget_inr
    if payload.required_area_ha is not None:
        proposal.required_area_ha = payload.required_area_ha
    if payload.target_district_id is not None:
        proposal.target_district_id = payload.target_district_id

    db.commit()
    db.refresh(proposal)
    return proposal


@router.post("/{proposal_id}/dpr", response_model=ProjectDprOut)
def upload_dpr_document(
    proposal_id: int,
    document_name: str = Query(..., example="Detailed Project Report Rev 1.4"),
    document_type: str = Query("DPR", example="DPR"),
    file_path: str = Query("/uploads/dpr/pune_nashik_rail_dpr.pdf"),
    request: Request = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Attach a DPR, feasibility report, or administrative cost voucher to the proposal."""
    client_ip = get_client_ip(request)
    try:
        dpr = ProposalService.attach_dpr_document(
            db=db,
            proposal_id=proposal_id,
            user=current_user,
            document_name=document_name,
            document_type=document_type,
            file_path=file_path,
            ip_address=client_ip,
        )
        return dpr
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{proposal_id}/dpr", response_model=List[ProjectDprOut])
def list_dpr_documents(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all DPR documents attached to the proposal."""
    return db.query(ProjectDpr).filter(ProjectDpr.proposal_id == proposal_id).all()


@router.post("/{proposal_id}/gis-corridor", response_model=GisCorridorOut)
def ingest_gis_corridor(
    proposal_id: int,
    payload: GisCorridorIngest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 2: Ingest the interactive GIS boundary polygon and automatically
    trigger the State Land Registry API to extract Survey/Gut numbers and titleholders.
    """
    client_ip = get_client_ip(request)
    try:
        gis, parcels_count = ProposalService.ingest_gis_corridor_and_populate_parcels(
            db=db,
            proposal_id=proposal_id,
            user=current_user,
            geojson_data=payload.geojson_data,
            bounding_box=payload.bounding_box,
            corridor_length_km=payload.corridor_length_km,
            corridor_width_meters=payload.corridor_width_meters,
            ip_address=client_ip,
        )
        return gis
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.get("/{proposal_id}/parcels", response_model=List[LandParcelOut])
def list_auto_populated_parcels(
    proposal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch all cadastral land parcels auto-extracted from State Land Registry."""
    return db.query(LandParcel).filter(LandParcel.proposal_id == proposal_id).order_by(LandParcel.id.asc()).all()


@router.post("/{proposal_id}/submit", response_model=ProposalOut)
def submit_to_state(
    proposal_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Step 3: Requiring Agency formally transmits proposal to State Revenue Nodal Gateway.
    """
    client_ip = get_client_ip(request)
    try:
        proposal = ProposalService.submit_to_state_gateway(
            db=db,
            proposal_id=proposal_id,
            user=current_user,
            ip_address=client_ip,
        )
        return proposal
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
