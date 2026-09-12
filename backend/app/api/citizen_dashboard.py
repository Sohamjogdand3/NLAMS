from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from typing import List, Dict

# Placeholder authentication dependency (replace with real auth in production)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    # Stub: assume token is valid and user has role 'citizen'
    return {"username": "citizen_user", "role": "citizen"}

router = APIRouter(prefix="/citizen", tags=["Citizen Dashboard"])

# Mock project data – replace with real DB queries
MOCK_PROJECTS = [
    {
        "id": 1,
        "name": "Riverfront Development",
        "status": "In Progress",
        "location": {"lat": 12.9716, "lng": 77.5946},
    },
    {
        "id": 2,
        "name": "Urban Expansion Phase II",
        "status": "Completed",
        "location": {"lat": 13.0827, "lng": 80.2707},
    },
]

@router.get("/projects", response_model=Dict)
def get_citizen_projects(page: int = 1, size: int = 20, user: dict = Depends(get_current_user)):
    if user["role"] != "citizen":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    start = (page - 1) * size
    end = start + size
    total = len(MOCK_PROJECTS)
    return {"items": MOCK_PROJECTS[start:end], "total": total}

@router.get("/projects/{project_id}/location", response_model=Dict)
def get_project_location(project_id: int, user: dict = Depends(get_current_user)):
    if user["role"] != "citizen":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    for proj in MOCK_PROJECTS:
        if proj["id"] == project_id:
            return proj["location"]
    raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
