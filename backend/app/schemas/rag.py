from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class RagQueryRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000, description="Natural language question or search query")
    top_k: int = Field(default=5, ge=1, le=20, description="Number of source chunks to retrieve")
    document_id: Optional[str] = Field(default=None, description="Optional document UUID filter")
    proposal_id: Optional[str] = Field(default=None, description="Optional proposal UUID for project-specific context")
    domain: Optional[str] = Field(default=None, description="Domain filter: STATUTORY_LAW, PROJECT_DOSSIER, or ALL")
    target_state: Optional[str] = Field(default=None, description="Optional target state code for cross-district/state analysis")
    target_district: Optional[str] = Field(default=None, description="Optional target district name")
    target_agency: Optional[str] = Field(default=None, description="Optional target agency/PIA identifier")


class RagRetrieveRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=1000, description="Query for semantic retrieval without LLM synthesis")
    top_k: int = Field(default=5, ge=1, le=50, description="Number of chunks")
    document_id: Optional[str] = Field(default=None, description="Specific document UUID")


class RagChunkSource(BaseModel):
    chunk_id: str
    text: str
    document_id: Optional[str] = None
    filename: Optional[str] = None
    page: Optional[int] = None
    title: Optional[str] = None
    type: Optional[str] = None
    jurisdiction: Optional[str] = None
    state: Optional[str] = None
    authority: Optional[str] = None
    distance: Optional[float] = None


class RagQueryResponse(BaseModel):
    query: str
    answer: str
    sources: List[RagChunkSource]
    total_retrieved: int
    authorized_chunks_count: int
    access_decision: str = "GRANTED"
    audit_event_id: Optional[str] = None


class RagDocumentInfo(BaseModel):
    document_id: str
    filename: str
    title: Optional[str] = None
    type: Optional[str] = None
    jurisdiction: Optional[str] = None
    state: Optional[str] = None
    sector: Optional[str] = None
    domain: Optional[str] = None
    authority: Optional[str] = None
    effective_date: Optional[str] = None
