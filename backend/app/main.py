from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.db.session import get_db
from app.api.auth import router as auth_router
from app.api.test_rbac import router as test_rbac_router
from app.api.citizen_dashboard import router as citizen_dashboard_router
from app.api.proposals import router as proposals_router
from app.api.escrow import router as escrow_router
from app.api.state_gateway import router as state_gateway_router
from app.api.adjudication import router as adjudication_router
from app.api.rnr import router as rnr_router
from app.api.gis import router as gis_router
from app.api.surveyor import router as surveyor_router
from app.api.possession import router as possession_router
from app.api.rag import router as rag_router

from app.db.base import Base
from app.db.session import engine
from app.db.seed import seed_database

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="DHARAA - Digital Land Acquisition & Management System Backend API",
    version="0.5.0",
)

@app.on_event("startup")
def on_startup():
    try:
        if "postgresql" in settings.sync_database_url:
            with engine.connect() as conn:
                conn.execute(text("CREATE EXTENSION IF NOT EXISTS postgis;"))
                conn.commit()
        Base.metadata.create_all(bind=engine)
        seed_database()
    except Exception as e:
        print(f"Startup DB init notice: {e}")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers under /api/v1
app.include_router(auth_router, prefix=settings.API_V1_STR)
app.include_router(test_rbac_router, prefix=settings.API_V1_STR)
app.include_router(citizen_dashboard_router, prefix=settings.API_V1_STR)
app.include_router(proposals_router, prefix=settings.API_V1_STR)
app.include_router(escrow_router, prefix=settings.API_V1_STR)
app.include_router(state_gateway_router, prefix=settings.API_V1_STR)
app.include_router(adjudication_router, prefix=settings.API_V1_STR)
app.include_router(rnr_router, prefix=settings.API_V1_STR)
app.include_router(surveyor_router, prefix=settings.API_V1_STR)
app.include_router(possession_router, prefix=settings.API_V1_STR)
app.include_router(gis_router, prefix=settings.API_V1_STR)
app.include_router(gis_router, prefix="/api", tags=["GIS Location Intelligence"])
app.include_router(rag_router, prefix=settings.API_V1_STR)

# Direct fallback mounts for legacy compatibility
app.include_router(auth_router)
app.include_router(test_rbac_router)
app.include_router(citizen_dashboard_router)
app.include_router(proposals_router)
app.include_router(escrow_router)
app.include_router(state_gateway_router)
app.include_router(adjudication_router)
app.include_router(rnr_router)
app.include_router(surveyor_router)
app.include_router(possession_router)
app.include_router(gis_router)
app.include_router(rag_router)


@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint that verifies API is alive and database connectivity works."""
    try:
        result = db.execute(text("SELECT 1")).scalar()
        if result != 1:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database query returned unexpected result",
            )
        return {
            "status": "healthy",
            "database": "connected",
            "project": settings.PROJECT_NAME,
            "environment": settings.ENVIRONMENT,
            "version": "0.2.0 (Phase 2 Ready)",
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Database health check failed: {str(e)}",
        )


@app.get("/", tags=["Root"])
def root():
    """Root landing endpoint."""
    return {
        "message": "Welcome to NLAMS API (Phase 2 Enabled)",
        "docs_url": "/docs",
        "health_url": "/health",
    }
