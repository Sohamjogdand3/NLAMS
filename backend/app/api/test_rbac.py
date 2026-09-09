from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.db.session import get_db
from app.models.user import User
from app.models.land_record import LandRecord
from app.models.acquisition_case import AcquisitionCase
from app.core.permissions import require_permission
from app.core.jurisdiction import scope_query_to_jurisdiction

router = APIRouter(prefix="/api/v1", tags=["RBAC & Jurisdiction Scoping Test"])


class LandRecordOut(BaseModel):
    id: int
    survey_number: str
    owner_name: str
    area_acres: float
    jurisdiction_id: int

    class Config:
        from_attributes = True


class AcquisitionCaseOut(BaseModel):
    id: int
    case_number: str
    project_name: str
    status: str
    jurisdiction_id: int

    class Config:
        from_attributes = True


@router.get("/land-records", response_model=List[LandRecordOut])
def list_land_records(
    current_user: User = Depends(require_permission("village_land_register", "view")),
    db: Session = Depends(get_db),
):
    """Endpoint 1: View village land records.

    - Protected by RBAC: resource 'village_land_register', action 'view'.
    - Automatically scoped to the user's jurisdiction subtree.
    """
    query = db.query(LandRecord)
    scoped_query = scope_query_to_jurisdiction(
        query=query,
        user=current_user,
        db=db,
        jurisdiction_column=LandRecord.jurisdiction_id,
    )
    return scoped_query.all()


@router.get("/cases", response_model=List[AcquisitionCaseOut])
def list_acquisition_cases(
    current_user: User = Depends(require_permission("acquisition_case_file", "view")),
    db: Session = Depends(get_db),
):
    """Endpoint 2: View acquisition case files.

    - Protected by RBAC: resource 'acquisition_case_file', action 'view'.
    - Automatically scoped to the user's jurisdiction subtree.
    """
    query = db.query(AcquisitionCase)
    scoped_query = scope_query_to_jurisdiction(
        query=query,
        user=current_user,
        db=db,
        jurisdiction_column=AcquisitionCase.jurisdiction_id,
    )
    return scoped_query.all()
