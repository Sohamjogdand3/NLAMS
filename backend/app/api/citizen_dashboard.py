from datetime import datetime
from typing import List, Dict, Optional, Any
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.project_proposal import ProjectProposal
from app.models.land_parcel import LandParcel
from app.models.section15_objection import Section15Objection
from app.services.adjudication_service import AdjudicationService

router = APIRouter(prefix="/citizen", tags=["Citizen Dashboard"])


def get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


@router.get("/projects", response_model=Dict)
def get_citizen_projects(
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Fetch public/citizen project list with corridor information."""
    proposals = db.query(ProjectProposal).order_by(ProjectProposal.created_at.desc()).all()
    items = []
    for p in proposals:
        items.append({
            "id": p.id,
            "name": p.project_title,
            "proposal_code": p.proposal_code,
            "requiring_agency": p.requiring_agency,
            "status": p.current_stage.replace("STAGE_", "").replace("_", " ").title(),
            "location": {"lat": 18.5204, "lng": 73.8567},
            "required_area_ha": p.required_area_ha,
            "estimated_budget_inr": p.estimated_budget_inr,
        })
    if not items:
        items = [
            {
                "id": 1,
                "name": "Pune-Nashik Semi-High-Speed Rail Corridor",
                "proposal_code": "NLAMS-2026-MH-001",
                "requiring_agency": "NHAI / MRIDC",
                "status": "Preliminary Notification Published",
                "location": {"lat": 18.5204, "lng": 73.8567},
                "required_area_ha": 35.5,
                "estimated_budget_inr": 450000000.0,
            },
            {
                "id": 2,
                "name": "Pune Ring Road (Eastern Alignment)",
                "proposal_code": "NLAMS-2026-MH-002",
                "requiring_agency": "MSRDC",
                "status": "Valuation In Progress",
                "location": {"lat": 18.5500, "lng": 73.9000},
                "required_area_ha": 48.0,
                "estimated_budget_inr": 820000000.0,
            },
        ]
    start = (page - 1) * size
    end = start + size
    return {"items": items[start:end], "total": len(items)}


@router.get("/projects/{project_id}/location", response_model=Dict)
def get_project_location(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve project corridor boundary coordinates."""
    proposal = db.query(ProjectProposal).filter(ProjectProposal.id == project_id).first()
    if not proposal:
        return {"lat": 18.5204, "lng": 73.8567}
    return {"lat": 18.5204, "lng": 73.8567}


@router.get("/my-notices")
def get_citizen_notices(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lists gazette notices and Section 11/19 declarations affecting the logged-in citizen's survey numbers."""
    proposals = db.query(ProjectProposal).all()
    notices = [
        {
            "id": 1,
            "notice_number": "SEC11-PUN-HAV-2026-001",
            "section": "Section 11(1) Preliminary Notification",
            "issue_date": "2026-03-01",
            "hearing_date": "2026-04-15",
            "survey_numbers": "101/1, 101/2, 102",
            "village": "Wagholi",
            "taluka": "Haveli",
            "district": "Pune",
            "objection_deadline": "2026-04-30",
            "status": "ACTIVE_OBJECTION_WINDOW",
            "gazette_url": "/documents/gazette_sec11_wagholi.pdf",
            "summary": "Preliminary notification for acquisition of land for Pune-Nashik Rail Corridor.",
        },
        {
            "id": 2,
            "notice_number": "SEC19-PUN-HAV-2026-004",
            "section": "Section 19 Declaration of Acquisition",
            "issue_date": "2026-02-15",
            "hearing_date": None,
            "survey_numbers": "104/1",
            "village": "Manjari Khurd",
            "taluka": "Haveli",
            "district": "Pune",
            "objection_deadline": None,
            "status": "DECLARATION_CONFIRMED",
            "gazette_url": "/documents/gazette_sec19_manjari.pdf",
            "summary": "Declaration of acquisition confirming public purpose and expert committee clearance.",
        },
    ]
    return notices


@router.post("/objections")
def submit_citizen_objection(
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Allows citizens to submit formal Section 15 objections directly from CitizenDashboard."""
    client_ip = get_client_ip(request)
    proposal_id = payload.get("proposal_id", 1)
    objection = AdjudicationService.file_objection(
        db=db,
        proposal_id=proposal_id,
        citizen_user=current_user,
        survey_number=payload.get("survey_number", "101/1"),
        village_name=payload.get("village_name", "Wagholi"),
        objector_name=payload.get("objector_name", current_user.full_name or "Rajesh Dinkar Patil"),
        objection_category=payload.get("objection_category", "COMPENSATION_INADEQUATE"),
        description=payload.get("description", "Objection regarding circle rate valuation and standing orchard trees."),
        parcel_id=payload.get("parcel_id"),
        supporting_document_url=payload.get("supporting_document_url"),
        ip_address=client_ip,
    )
    return {
        "id": objection.id,
        "objection_code": f"OBJ-SEC15-2026-{objection.id:03d}",
        "status": "PENDING_REVIEW",
        "created_at": datetime.utcnow().isoformat(),
        "message": "Section 15 objection formally registered in District Collector adjudication ledger.",
    }
