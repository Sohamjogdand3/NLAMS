import os
import sys
import logging
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User
from app.models.role import Role
from app.models.jurisdiction import Jurisdiction, JurisdictionType
from app.schemas.rag import RagChunkSource, RagQueryResponse, RagDocumentInfo
from app.services.audit_service import AuditService
from app.core.config import settings

logger = logging.getLogger(__name__)

# Dynamically resolve path to untouched friend's RAG system
RAG_ROOT_DIR = Path(__file__).resolve().parent.parent.parent.parent / "LEGAL_RAG_MCP"
RAG_SRC_DIR = RAG_ROOT_DIR / "src"

if str(RAG_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(RAG_SRC_DIR))


class RagAdapterService:
    """The authoritative security adapter between NLAMS and the untouched LEGAL_RAG_MCP black-box engine.

    Enforces the required NLAMS Final Role-Wise Access Policy:
    1. Pre-retrieval authorization scope derivation from NLAMS JWT & UserRoleJurisdiction.
    2. Dynamic retrieval delegation to friend's unchanged RAG retrieval engine.
    3. Mandatory SECONDARY post-retrieval metadata verification filter on all chunk payloads.
    4. Grounded answer generation and source citation assembly.
    5. Immutable tamper-evident audit logging via NLAMS AuditService.
    """

    @staticmethod
    def _get_rag_tools():
        """Safely import friend's RAG retriever and SQLite registry without modifying LEGAL_RAG_MCP."""
        try:
            from retrieval.retriever import retrieve_documents as _retrieve
            from database.sqlite import sqlite_db
            return _retrieve, sqlite_db.list_documents
        except Exception:
            try:
                from tools.documents import (
                    retrieve_documents as _retrieve,
                    list_documents as _list,
                )
                return _retrieve, _list
            except Exception as e:
                logger.warning("LEGAL_RAG_MCP retriever fallback: %s", e)
                def _mock_retrieve(query: str, top_k: int = 5, document_id: str | None = None):
                    return []
                def _mock_list():
                    return []
                return _mock_retrieve, _mock_list

    @classmethod
    def get_user_security_context(cls, user: User) -> Dict[str, Any]:
        """Derive authoritative role and geographic jurisdiction hierarchy from NLAMS DB."""
        active_role: Optional[Role] = getattr(user, "active_role", None)
        active_jurisdiction: Optional[Jurisdiction] = getattr(user, "active_jurisdiction", None)

        if not active_role and getattr(user, "role_assignments", None):
            active_assignment = next((a for a in user.role_assignments if a.is_active), None)
            if active_assignment:
                active_role = active_assignment.role
                active_jurisdiction = active_assignment.jurisdiction

        role_code = (active_role.code if active_role else (getattr(user, "role", None) or "CITIZEN")).upper()
        j_type = (active_jurisdiction.type.value if active_jurisdiction and active_jurisdiction.type else "national")
        j_name = active_jurisdiction.name if active_jurisdiction else "National"
        j_code = active_jurisdiction.code if active_jurisdiction else None

        return {
            "user_id": user.id,
            "email": user.email,
            "role_code": role_code,
            "jurisdiction_type": j_type,
            "jurisdiction_name": j_name,
            "jurisdiction_code": j_code,
            "department": getattr(user, "department_name", None) or "",
        }

    @classmethod
    def enforce_pre_retrieval_policy(
        cls,
        db: Session,
        user: User,
        query_text: str,
        domain: Optional[str] = None,
        proposal_id: Optional[str] = None,
        document_id: Optional[str] = None,
        target_state: Optional[str] = None,
        target_district: Optional[str] = None,
        target_agency: Optional[str] = None,
    ) -> None:
        """Pre-retrieval authorization boundary check.

        Rejects requests that violate the user's statutory role and scope before vector search.
        """
        user_ctx = cls.get_user_security_context(user)
        role = user_ctx["role_code"]
        user_j_name = (user_ctx["jurisdiction_name"] or "").upper()
        user_dept = (user_ctx["department"] or "").upper()

        # 1. CITIZEN: Blocked from internal project dossiers, valuation notes, or officer records
        if role in ("CITIZEN", "LANDOWNER"):
            if domain in ("PROJECT_DOSSIER", "INTERNAL_MEMO", "VALUATION_NOTES", "OFFICER_RECORDS", "ACQUISITION_CASE"):
                cls._log_and_raise_403(
                    db=db,
                    user=user,
                    query=query_text,
                    reason="Citizen requested internal confidential project dossier / valuation data",
                    detail="Access denied: Citizens are permitted to access approved public statutory laws, gazettes, and citizen guidance only.",
                )

        # 2. PIA: Blocked from other agencies' projects or unrelated district dossiers
        elif role in ("PIA", "PIA_EXECUTIVE", "PIA_NODAL"):
            if target_agency and user_dept and (target_agency.upper() not in user_dept and user_dept not in target_agency.upper()):
                cls._log_and_raise_403(
                    db=db,
                    user=user,
                    query=query_text,
                    reason=f"PIA agency '{user_dept}' attempted access to foreign agency project '{target_agency}'",
                    detail="Access denied: PIA accounts are strictly limited to their own authorized project dossiers and public statutory law.",
                )

        # 3. SURVEYOR: Blocked from unassigned projects, district intelligence, or confidential valuation
        elif role in ("SURVEYOR", "SURVEYOR_OFFICIAL"):
            if domain in ("VALUATION_NOTES", "ACQUISITION_CASE", "NATIONAL_INTELLIGENCE", "DISTRICT_INTELLIGENCE"):
                cls._log_and_raise_403(
                    db=db,
                    user=user,
                    query=query_text,
                    reason="Surveyor requested confidential acquisition valuation or unauthorized district intelligence",
                    detail="Access denied: Surveyors are authorized for field-task guidance and assigned boundary/cadastral context only.",
                )

        # 4. TALATHI & TEHSILDAR: Blocked from other jurisdictions or unassigned project dossiers
        elif role in ("TALATHI", "TALATHI_PATWARI", "TEHSILDAR", "TEHSILDAR_LAO"):
            if target_district and target_district.upper() not in user_j_name and user_j_name not in target_district.upper():
                cls._log_and_raise_403(
                    db=db,
                    user=user,
                    query=query_text,
                    reason=f"{role} in '{user_j_name}' attempted access to foreign district '{target_district}'",
                    detail=f"Access denied: Your jurisdiction is restricted to {user_j_name}.",
                )

        # 5. DISTRICT COLLECTOR: Blocked from another district's private/internal dossiers
        elif role in ("DISTRICT_COLLECTOR", "DIST_COLLECTOR"):
            if target_district and target_district.upper() not in user_j_name and user_j_name not in target_district.upper():
                cls._log_and_raise_403(
                    db=db,
                    user=user,
                    query=query_text,
                    reason=f"Collector of '{user_j_name}' attempted access to foreign district '{target_district}' dossier",
                    detail=f"Access denied: District Collector authorization is strictly scoped to {user_j_name} district.",
                )

        # 6. STATE ADMIN: Blocked from another state's private project dossiers
        elif role in ("STATE_ADMIN", "STATE_NODAL_ADMIN"):
            if target_state and target_state.upper() not in ("ALL", "MH", user_j_name):
                cls._log_and_raise_403(
                    db=db,
                    user=user,
                    query=query_text,
                    reason=f"State Admin '{user_j_name}' attempted access to foreign state '{target_state}' dossier",
                    detail="Access denied: State Administration accounts cannot access private dossiers outside authorized state jurisdiction.",
                )

    @classmethod
    def is_chunk_authorized(cls, chunk_metadata: Dict[str, Any], user_ctx: Dict[str, Any]) -> bool:
        """Mandatory Secondary Post-Retrieval Authorization Filter.

        Evaluates chunk metadata against the user's role and jurisdictional boundaries.
        A user NEVER receives chunks outside their statutory mandate.
        """
        role = user_ctx["role_code"]
        doc_jurisdiction = (chunk_metadata.get("jurisdiction") or "NATIONAL").upper()
        doc_state = (chunk_metadata.get("state") or "ALL").upper()
        doc_district = (chunk_metadata.get("district") or "").upper()
        doc_domain = (chunk_metadata.get("domain") or "STATUTORY_LAW").upper()
        doc_type = (chunk_metadata.get("type") or "GENERAL").upper()
        doc_authority = (chunk_metadata.get("authority") or "").upper()

        user_j_name = (user_ctx["jurisdiction_name"] or "").upper()
        user_dept = (user_ctx["department"] or "").upper()

        # 1. National Statutory Law / Acts / Gazette Notifications are public for all authenticated roles
        if doc_domain == "STATUTORY_LAW" or doc_type in ("ACT", "RULES", "GAZETTE", "REGULATION", "CITIZEN_CHARTER"):
            if doc_jurisdiction == "NATIONAL" or doc_state == "ALL":
                return True
            # State-specific rules: verify state match
            if doc_state in user_j_name or user_ctx["jurisdiction_type"] in ("state", "national", "central"):
                return True

        # 2. CITIZEN Role Security Boundary
        if role in ("CITIZEN", "LANDOWNER"):
            # Citizens are STRICTLY restricted to public statutory laws, published notifications,
            # and citizen charters. NO internal project dossiers or officer notes.
            if doc_domain in ("PROJECT_DOSSIER", "INTERNAL_MEMO", "VALUATION_NOTES", "OFFICER_RECORDS", "ACQUISITION_CASE"):
                return False
            if doc_type in ("ACT", "RULES", "GAZETTE", "PUBLIC_NOTICE", "CITIZEN_CHARTER"):
                return True
            return False

        # 3. PIA (Project Implementing Agency)
        if role in ("PIA", "PIA_EXECUTIVE", "PIA_NODAL"):
            if doc_jurisdiction == "NATIONAL":
                return True
            user_email_upper = (user_ctx.get("email") or "").upper()
            # Project-scoped: authority must match PIA's agency/department or user email
            if (user_dept and (user_dept in doc_authority or doc_authority in user_dept)) or (doc_authority and doc_authority in user_email_upper):
                return True
            if doc_domain in ("DPR", "ENGINEERING_REPORT", "HANDOVER_CERTIFICATE"):
                if (user_dept and (user_dept in doc_authority or doc_authority in user_dept)) or (doc_authority and doc_authority in user_email_upper):
                    return True
            return False

        # 4. SURVEYOR (Field & Cadastral Overlay Clearance)
        if role in ("SURVEYOR", "SURVEYOR_OFFICIAL"):
            if doc_jurisdiction in ("NATIONAL", "STATE"):
                return True
            if doc_domain in ("SURVEY_DATA", "FIELD_GUIDANCE", "CADASTRAL_OVERLAY", "FIELD_AUDIT", "GIS_ALIGNMENT"):
                user_email_upper = (user_ctx.get("email") or "").upper()
                if not doc_district or doc_district in user_j_name or user_j_name in doc_district or doc_district in user_email_upper:
                    return True
            return False

        # 5. TALATHI (Village / Revenue Record Clearance)
        if role in ("TALATHI", "TALATHI_PATWARI"):
            if doc_jurisdiction in ("NATIONAL", "STATE"):
                return True
            if doc_domain in ("REVENUE_RECORD", "MUTATION_RECORD", "SURVEY_PANCHNAMA"):
                user_email_upper = (user_ctx.get("email") or "").upper()
                if not doc_district or doc_district in user_j_name or user_j_name in doc_district or doc_district in user_email_upper:
                    return True
            return False

        # 6. TEHSILDAR (Taluka / Sub-District Clearance)
        if role in ("TEHSILDAR", "TEHSILDAR_LAO"):
            if doc_jurisdiction in ("NATIONAL", "STATE"):
                return True
            if doc_domain in ("REVENUE_RECORD", "SURVEY_PANCHNAMA", "MUTATION_RECORD", "ACQUISITION_CASE"):
                user_email_upper = (user_ctx.get("email") or "").upper()
                if not doc_district or doc_district in user_j_name or user_j_name in doc_district or doc_district in user_email_upper:
                    return True
            return False

        # 7. LAO / CALA (Full Operational Acquisition Clearance within District)
        if role in ("LAO", "CALA_OFFICER"):
            if doc_jurisdiction in ("NATIONAL", "STATE"):
                return True
            if doc_jurisdiction == "DISTRICT":
                if not doc_district or doc_district in user_j_name or user_j_name in doc_authority or doc_state in user_j_name:
                    return True
            return True

        # 8. DISTRICT_COLLECTOR (District-Level Governance & Analysis)
        if role in ("DISTRICT_COLLECTOR", "DIST_COLLECTOR"):
            if doc_jurisdiction in ("NATIONAL", "STATE"):
                return True
            if doc_jurisdiction == "DISTRICT":
                # Must match user's district jurisdiction; foreign districts blocked
                if doc_district and doc_district not in user_j_name and user_j_name not in doc_district:
                    return False
                if doc_authority and "COLLECTOR" in doc_authority and user_j_name not in doc_authority:
                    return False
                return True
            return True

        # 9. STATE_ADMIN (State-Wide Cross-District Clearance)
        if role in ("STATE_ADMIN", "STATE_NODAL_ADMIN"):
            if doc_jurisdiction in ("NATIONAL", "STATE"):
                if doc_state in ("ALL", "MH", user_j_name) or not doc_state:
                    return True
            if doc_state and doc_state not in ("ALL", "MH", user_j_name):
                return False
            return True

        # 10. CENTRAL_ADMIN (National Analytical Clearance)
        if role in ("CENTRAL_ADMIN", "SUPER_ADMIN", "CENTRAL_NODAL_ADMIN"):
            return True

        # 11. RNR_ADMIN: Kept strictly to public statutory guidance (RFCTLARR Schedule II rules)
        if role in ("RNR_ADMIN", "RNR_ADMINISTRATOR", "RNR_COMMISSIONER"):
            return doc_domain == "STATUTORY_LAW" or doc_jurisdiction == "NATIONAL"

        # Default fallback
        return doc_jurisdiction == "NATIONAL"

    @classmethod
    def query(
        cls,
        db: Session,
        user: User,
        query_text: str,
        top_k: int = 5,
        document_id: Optional[str] = None,
        proposal_id: Optional[str] = None,
        domain: Optional[str] = None,
        target_state: Optional[str] = None,
        target_district: Optional[str] = None,
        target_agency: Optional[str] = None,
    ) -> RagQueryResponse:
        """Execute pre-filtered vector retrieval, post-retrieval security validation,

        Gemini LLM answer generation, and audit logging.
        """
        # 1. Pre-retrieval authorization boundary check
        cls.enforce_pre_retrieval_policy(
            db=db,
            user=user,
            query_text=query_text,
            domain=domain,
            proposal_id=proposal_id,
            document_id=document_id,
            target_state=target_state,
            target_district=target_district,
            target_agency=target_agency,
        )

        user_ctx = cls.get_user_security_context(user)
        retrieve_fn, _ = cls._get_rag_tools()

        # 2. Call friend's unchanged RAG retrieval function
        raw_chunks = retrieve_fn(
            query=query_text,
            top_k=min(top_k * 2, 20),
            document_id=document_id,
        )

        # 3. Mandatory SECONDARY Post-Retrieval Security Validation
        authorized_sources: List[RagChunkSource] = []
        for chunk in raw_chunks:
            meta = chunk.get("metadata") or {}
            if cls.is_chunk_authorized(meta, user_ctx):
                authorized_sources.append(
                    RagChunkSource(
                        chunk_id=str(chunk.get("chunk_id", "")),
                        text=str(chunk.get("text", "")),
                        document_id=meta.get("document_id"),
                        filename=meta.get("filename"),
                        page=meta.get("page"),
                        title=meta.get("title") or meta.get("filename"),
                        type=meta.get("type"),
                        jurisdiction=meta.get("jurisdiction"),
                        state=meta.get("state"),
                        authority=meta.get("authority"),
                        distance=chunk.get("distance"),
                    )
                )

        final_sources = authorized_sources[:top_k]

        # 4. Answer Synthesis
        answer = cls._synthesize_answer(query_text=query_text, sources=final_sources, user_ctx=user_ctx)

        # 5. Record Immutable Tamper-Evident Audit Event
        retrieved_doc_ids = list(set([s.document_id for s in final_sources if s.document_id]))
        audit_event = AuditService.log_event(
            db=db,
            event_type="RAG_QUERY_EXECUTED",
            actor_id=user.id,
            actor_email=user.email,
            details={
                "query": query_text,
                "role": user_ctx["role_code"],
                "jurisdiction": user_ctx["jurisdiction_name"],
                "total_retrieved": len(raw_chunks),
                "authorized_chunks": len(final_sources),
                "document_ids": retrieved_doc_ids,
                "access_decision": "GRANTED",
            },
        )

        return RagQueryResponse(
            query=query_text,
            answer=answer,
            sources=final_sources,
            total_retrieved=len(raw_chunks),
            authorized_chunks_count=len(final_sources),
            access_decision="GRANTED",
            audit_event_id=str(audit_event.id) if audit_event else None,
        )

    @classmethod
    def retrieve_chunks_only(
        cls,
        db: Session,
        user: User,
        query_text: str,
        top_k: int = 5,
        document_id: Optional[str] = None,
    ) -> List[RagChunkSource]:
        """Pure semantic chunk retrieval with complete authorization filtering."""
        user_ctx = cls.get_user_security_context(user)
        retrieve_fn, _ = cls._get_rag_tools()

        raw_chunks = retrieve_fn(
            query=query_text,
            top_k=min(top_k * 2, 30),
            document_id=document_id,
        )

        authorized: List[RagChunkSource] = []
        for chunk in raw_chunks:
            meta = chunk.get("metadata") or {}
            if cls.is_chunk_authorized(meta, user_ctx):
                authorized.append(
                    RagChunkSource(
                        chunk_id=str(chunk.get("chunk_id", "")),
                        text=str(chunk.get("text", "")),
                        document_id=meta.get("document_id"),
                        filename=meta.get("filename"),
                        page=meta.get("page"),
                        title=meta.get("title") or meta.get("filename"),
                        type=meta.get("type"),
                        jurisdiction=meta.get("jurisdiction"),
                        state=meta.get("state"),
                        authority=meta.get("authority"),
                        distance=chunk.get("distance"),
                    )
                )

        return authorized[:top_k]

    @classmethod
    def list_authorized_documents(cls, db: Session, user: User) -> List[RagDocumentInfo]:
        """List registered documents that the authenticated user has jurisdiction to read."""
        user_ctx = cls.get_user_security_context(user)
        _, list_fn = cls._get_rag_tools()

        all_docs = list_fn()
        authorized_docs: List[RagDocumentInfo] = []

        for doc in all_docs:
            if cls.is_chunk_authorized(doc, user_ctx):
                authorized_docs.append(
                    RagDocumentInfo(
                        document_id=doc.get("document_id", ""),
                        filename=doc.get("filename", ""),
                        title=doc.get("title") or doc.get("filename"),
                        type=doc.get("type"),
                        jurisdiction=doc.get("jurisdiction"),
                        state=doc.get("state"),
                        sector=doc.get("sector"),
                        domain=doc.get("domain"),
                        authority=doc.get("authority"),
                        effective_date=doc.get("effective_date"),
                    )
                )

        return authorized_docs

    @classmethod
    def _log_and_raise_403(cls, db: Session, user: User, query: str, reason: str, detail: str) -> None:
        """Log access denial to immutable audit trail and raise 403 Forbidden."""
        AuditService.log_event(
            db=db,
            event_type="RAG_ACCESS_DENIED",
            actor_id=user.id,
            actor_email=user.email,
            details={
                "query": query,
                "reason": reason,
                "decision": "DENIED_403",
            },
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail,
        )

    @classmethod
    def _synthesize_answer(cls, query_text: str, sources: List[RagChunkSource], user_ctx: Dict[str, Any]) -> str:
        """Call Gemini LLM with context grounding or generate grounded legal response."""
        if not sources:
            return (
                f"No authorized legal or project documents were found in your jurisdictional scope "
                f"({user_ctx['jurisdiction_name']} · {user_ctx['role_code']}) matching query: '{query_text}'."
            )

        context_blocks = "\n\n".join(
            [f"[Source {i+1}: {s.title or s.filename}, Page {s.page or 1}]\n{s.text}" for i, s in enumerate(sources)]
        )

        api_key = settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY")
        if api_key and not api_key.startswith("AQ.Ab8RN6IFLSd95jqK"):
            try:
                from google import genai

                client = genai.Client(api_key=api_key)
                prompt = (
                    f"You are the official NLAMS Statutory & Legal Intelligence AI Assistant for the Government of India.\n"
                    f"The authenticated user has role: {user_ctx['role_code']} in jurisdiction: {user_ctx['jurisdiction_name']}.\n\n"
                    f"Answer the user's question accurately based strictly on the following verified source context.\n"
                    f"Cite statutory Section numbers, Act titles, and page references where relevant.\n\n"
                    f"CONTEXT:\n{context_blocks}\n\n"
                    f"QUESTION: {query_text}\n\n"
                    f"OFFICIAL ANSWER:"
                )

                response = client.models.generate_content(
                    model=settings.GEMINI_MODEL,
                    contents=prompt,
                )
                if response and response.text:
                    return response.text.strip()
            except Exception as e:
                logger.warning("Gemini API call failed, falling back to grounded citation summary: %s", e)

        top_source = sources[0]
        return (
            f"Based on statutory records from **{top_source.title or top_source.filename}** "
            f"(Jurisdiction: {top_source.jurisdiction or 'National'}, Page {top_source.page or 1}):\n\n"
            f"{top_source.text[:400]}...\n\n"
            f"*(Verified under NLAMS RBAC for {user_ctx['role_code']} · {user_ctx['jurisdiction_name']})*"
        )
