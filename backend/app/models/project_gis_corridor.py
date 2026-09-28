from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class ProjectGisCorridor(Base):
    """
    GIS Spatial Alignment Corridor for Land Acquisition Proposals.
    Stores the interactive boundary polygon (GeoJSON) used to query Cadastral Land Records.
    """
    __tablename__ = "project_gis_corridors"

    id = Column(Integer, primary_key=True, index=True)
    proposal_id = Column(Integer, ForeignKey("project_proposals.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    geojson_data = Column(Text, nullable=False)  # GeoJSON FeatureCollection / Polygon string
    bounding_box = Column(String(200), nullable=True)  # min_lon,min_lat,max_lon,max_lat
    total_corridor_length_km = Column(Float, nullable=True)
    corridor_width_meters = Column(Float, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    proposal = relationship("ProjectProposal", back_populates="gis_corridor")

    def __repr__(self) -> str:
        return f"<ProjectGisCorridor(id={self.id}, proposal_id={self.proposal_id}, length_km={self.total_corridor_length_km})>"
