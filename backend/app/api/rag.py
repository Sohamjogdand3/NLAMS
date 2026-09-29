from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request, status, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.schemas.rag import (
    RagQueryRequest,
    RagQueryResponse,
    RagRetrieveRequest,
    RagChunkSource,
    RagDocumentInfo,
)
from app.services.rag_adapter_service import RagAdapterService

router = APIRouter(prefix="/rag", tags=["AI Legal & Statutory Intelligence Copilot"])


@router.post("/query", response_model=RagQueryResponse, summary="Query RAG Copilot with JWT & RBAC Enforcement")
def query_rag(
    payload: RagQueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Execute authenticated and jurisdiction-scoped question answering using the

    integrated LEGAL_RAG_MCP engine with full RBAC and immutable audit logging.
    """
    return RagAdapterService.query(
        db=db,
        user=current_user,
        query_text=payload.query,
        top_k=payload.top_k,
        document_id=payload.document_id,
        proposal_id=payload.proposal_id,
        domain=payload.domain,
        target_state=payload.target_state,
        target_district=payload.target_district,
        target_agency=payload.target_agency,
    )


@router.post("/retrieve", response_model=List[RagChunkSource], summary="Semantic Chunk Retrieval with Security Filtering")
def retrieve_rag_chunks(
    payload: RagRetrieveRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Retrieve raw source chunks matching query text that the authenticated user has

    clearance to inspect within their role and jurisdictional mandate.
    """
    return RagAdapterService.retrieve_chunks_only(
        db=db,
        user=current_user,
        query_text=payload.query,
        top_k=payload.top_k,
        document_id=payload.document_id,
    )


@router.get("/documents", response_model=List[RagDocumentInfo], summary="List Authorized Legal & Project Documents")
def list_authorized_documents(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List registered legal acts, gazettes, DPRs, and project dossiers accessible to

    the authenticated user's assigned role and jurisdiction.
    """
    return RagAdapterService.list_authorized_documents(
        db=db,
        user=current_user,
    )
