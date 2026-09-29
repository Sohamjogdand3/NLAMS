from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class InfrastructureItem(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    category: str
    distance_m: float
    latitude: float
    longitude: float

class ProjectItem(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    status: str
    distance_m: float
    latitude: float
    longitude: float
    source: Optional[str] = None

class NewsItem(BaseModel):
    title: str
    source: str
    date: str
    url: str
    snippet: Optional[str] = None

class AIAnalysis(BaseModel):
    summary: str
    connectivity_score: int
    development_potential: str
    key_risks: List[str]
    strategic_value: str

class LocationIntelligenceResponse(BaseModel):
    latitude: float
    longitude: float
    radius_m: float
    infrastructure: List[InfrastructureItem]
    nearby_projects: List[ProjectItem]
    news: List[NewsItem]
    ai_analysis: AIAnalysis
