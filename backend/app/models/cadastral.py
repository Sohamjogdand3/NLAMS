from sqlalchemy import Column, String, Float, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from geoalchemy2 import Geometry
from app.db.base import Base

class CadastralParcel(Base):
    __tablename__ = "cadastral_parcels"
    
    parcel_id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    survey_number = Column(String(50))
    cts_number = Column(String(50), nullable=True)
    village = Column(String(100))
    taluka = Column(String(100))
    district = Column(String(100))
    state = Column(String(100), default="Maharashtra")
    area_sqm = Column(Float)
    area_hectares = Column(Float)
    owner_name = Column(String(200), nullable=True)
    land_use = Column(String(100), nullable=True)
    source = Column(String(200), default="NLAMS Demo Dataset")
    ulpin = Column(String(50), nullable=True)
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())
    geometry = Column(Geometry('POLYGON', srid=4326, spatial_index=True))
    confidence_note = Column(String(500), default="Demo data ? not authoritative cadastral record")