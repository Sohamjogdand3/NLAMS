from abc import ABC, abstractmethod
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.gis import ParcelResponse

class CadastralService(ABC):
    @abstractmethod
    async def find_parcel_by_point(self, lat: float, lng: float, db_session: AsyncSession) -> Optional[ParcelResponse]:
        pass

    @abstractmethod
    async def find_parcels_nearby(self, lat: float, lng: float, radius_m: float, db_session: AsyncSession) -> List[ParcelResponse]:
        pass

    @abstractmethod
    async def get_parcel_by_id(self, parcel_id: str, db_session: AsyncSession) -> Optional[ParcelResponse]:
        pass