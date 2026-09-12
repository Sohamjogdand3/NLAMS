from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.config import settings
from app.db.session import get_db
from app.api.auth import router as auth_router
from app.api.test_rbac import router as test_rbac_router
from app.api.citizen_dashboard import router as citizen_dashboard_router

from app.db.base import Base
from app.db.session import engine
from app.db.seed import seed_database

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="NLAMS - National Land Acquisition & Management System Backend API",
    version="0.1.0",
)

@app.on_event("startup")
def on_startup():
    try:
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

# Include Routers
app.include_router(auth_router)
app.include_router(test_rbac_router)
app.include_router(citizen_dashboard_router)


@app.get("/health", tags=["Health"])
def health_check(db: Session = Depends(get_db)):
    """Health check endpoint that verifies API is alive and database connectivity works."""
    try:
        # Execute SELECT 1 to verify database connection
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
        "message": "Welcome to NLAMS API",
        "docs_url": "/docs",
        "health_url": "/health",
    }
