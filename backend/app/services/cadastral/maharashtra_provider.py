from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.cadastral.base import CadastralService
from app.schemas.gis import ParcelResponse

class MaharashtraCadastralProvider(CadastralService):
    async def find_parcel_by_point(self, lat: float, lng: float, db_session: AsyncSession) -> Optional[ParcelResponse]:
        raise NotImplementedError("Maharashtra cadastral provider requires official Mahabhumi API authorization. Contact State Land Records Department for API access.")

    async def find_parcels_nearby(self, lat: float, lng: float, radius_m: float, db_session: AsyncSession) -> List[ParcelResponse]:
        raise NotImplementedError("Maharashtra cadastral provider requires official Mahabhumi API authorization. Contact State Land Records Department for API access.")

    async def get_parcel_by_id(self, parcel_id: str, db_session: AsyncSession) -> Optional[ParcelResponse]:
        raise NotImplementedError("Maharashtra cadastral provider requires official Mahabhumi API authorization. Contact State Land Records Department for API access.")