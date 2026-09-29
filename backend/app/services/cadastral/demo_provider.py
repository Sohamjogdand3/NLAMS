import httpx
import uuid
from typing import List, Optional
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from geoalchemy2.shape import to_shape
from shapely.geometry import Polygon, mapping
from pyproj import Geod
import math
import xml.etree.ElementTree as ET

from app.services.cadastral.base import CadastralService
from app.models.cadastral import CadastralParcel
from app.schemas.gis import ParcelResponse

class DemoCadastralProvider(CadastralService):
    def __init__(self):
        self.geod = Geod(ellps="WGS84")

    def _to_response(self, parcel: CadastralParcel) -> ParcelResponse:
        geom_shape = to_shape(parcel.geometry)
        geojson_dict = mapping(geom_shape)
        
        area, perimeter = self.geod.geometry_area_perimeter(geom_shape)
        area = abs(area)
        perimeter = abs(perimeter)
        
        minx, miny, maxx, maxy = geom_shape.bounds
        _, _, dist_x = self.geod.inv(minx, miny, maxx, miny)
        _, _, dist_y = self.geod.inv(minx, miny, minx, maxy)
        
        return ParcelResponse(
            parcel_id=str(parcel.parcel_id),
            survey_number=parcel.survey_number,
            cts_number=parcel.cts_number,
            village=parcel.village,
            taluka=parcel.taluka,
            district=parcel.district,
            state=parcel.state,
            area_sqm=area if area > 0 else parcel.area_sqm,
            area_hectares=(area / 10000.0) if area > 0 else parcel.area_hectares,
            perimeter_m=perimeter,
            dimensions=f"{int(dist_x)}m x {int(dist_y)}m",
            owner_name=parcel.owner_name,
            land_use=parcel.land_use,
            source=parcel.source or "NLAMS Demo Dataset",
            ulpin=parcel.ulpin,
            last_updated=parcel.last_updated,
            confidence_note=parcel.confidence_note or "Demo grid layout",
            geojson=geojson_dict
        )

    async def _fetch_osm_parcels(self, lat: float, lng: float, radius_m: float) -> List[ParcelResponse]:
        delta_lat = radius_m / 111000.0
        delta_lng = radius_m / (111000.0 * math.cos(math.radians(lat)))
        bbox = f"{lng - delta_lng},{lat - delta_lat},{lng + delta_lng},{lat + delta_lat}"
        
        url = f"https://api.openstreetmap.org/api/0.6/map?bbox={bbox}"
        text_data = None
        
        try:
            async with httpx.AsyncClient() as client:
                headers = {"User-Agent": "NLAMS_Cadastral_App/2.0"}
                resp = await client.get(url, headers=headers, timeout=15.0)
                resp.raise_for_status()
                text_data = resp.text
        except Exception as e:
            print(f"OSM Standard API error: {e}")
            return []
            
        if not text_data:
            return []
            
        parcels = []
        try:
            root = ET.fromstring(text_data)
            nodes = {}
            for child in root.findall('node'):
                nodes[child.attrib['id']] = (float(child.attrib['lon']), float(child.attrib['lat']))
                
            for way in root.findall('way'):
                tags = {}
                is_building = False
                for tag in way.findall('tag'):
                    k = tag.attrib['k']
                    v = tag.attrib['v']
                    tags[k] = v
                    if k == 'building':
                        is_building = True
                
                if not is_building:
                    continue
                    
                coords = []
                for nd in way.findall('nd'):
                    ref = nd.attrib['ref']
                    if ref in nodes:
                        coords.append(nodes[ref])
                
                if len(coords) < 3:
                    continue
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                if len(coords) < 4:
                    continue
                    
                poly = Polygon(coords)
                
                area, perimeter = self.geod.geometry_area_perimeter(poly)
                area = abs(area)
                perimeter = abs(perimeter)
                
                land_use = tags.get("landuse") or tags.get("building") or tags.get("amenity") or tags.get("leisure") or "Unknown"
                owner = tags.get("name", "Unknown Owner")
                
                minx, miny, maxx, maxy = poly.bounds
                _, _, dist_x = self.geod.inv(minx, miny, maxx, miny)
                _, _, dist_y = self.geod.inv(minx, miny, minx, maxy)
                
                parcels.append(ParcelResponse(
                    parcel_id=str(uuid.uuid4()),
                    survey_number=f"OSM-{way.attrib['id']}",
                    cts_number=None,
                    village="Pan-India DB",
                    taluka="N/A",
                    district="N/A",
                    state="India",
                    area_sqm=area,
                    area_hectares=area / 10000.0,
                    perimeter_m=perimeter,
                    dimensions=f"{int(dist_x)}m x {int(dist_y)}m",
                    owner_name=owner,
                    land_use=land_use.capitalize(),
                    source="OpenStreetMap API",
                    ulpin=None,
                    last_updated=datetime.utcnow(),
                    geojson=mapping(poly),
                    confidence_note="Real-world geometry from OSM"
                ))
        except Exception as e:
            print(f"Error parsing OSM XML: {e}")
            
        return parcels

    async def find_parcel_by_point(self, lat: float, lng: float, db_session: AsyncSession) -> Optional[ParcelResponse]:
        # Try local DB first (our demo grids)
        try:
            point = func.ST_SetSRID(func.ST_Point(lng, lat), 4326)
            query = select(CadastralParcel).where(func.ST_Contains(CadastralParcel.geometry, point))
            result = await db_session.execute(query)
            parcel = result.scalars().first()
            if parcel:
                return self._to_response(parcel)
        except Exception as e:
            print(f"Database error (fallback to OSM): {e}")
            
        # Fallback to OSM for exact point by using a tiny radius
        osm_parcels = await self._fetch_osm_parcels(lat, lng, 5.0)
        if osm_parcels:
            return osm_parcels[0]
            
        # Ultimate fallback: generate dynamic block
        ox = 0.00008  # ~8 meters east/west
        oy = 0.00010  # ~10 meters north/south
        poly = Polygon([
            (lng - ox, lat - oy),
            (lng + ox, lat - oy * 0.8),
            (lng + ox, lat + oy),
            (lng - ox * 0.8, lat + oy),
            (lng - ox, lat - oy)
        ])
        
        area, perimeter = self.geod.geometry_area_perimeter(poly)
        area, perimeter = abs(area), abs(perimeter)
        minx, miny, maxx, maxy = poly.bounds
        _, _, dist_x = self.geod.inv(minx, miny, maxx, miny)
        _, _, dist_y = self.geod.inv(minx, miny, minx, maxy)
        
        return ParcelResponse(
            parcel_id=str(uuid.uuid4()),
            survey_number=f"CTS-MOCK-{int(lat*1000)}",
            cts_number="MOCK/1",
            village="Hypothetical Area",
            taluka="Local Taluka",
            district="Local District",
            state="Maharashtra",
            area_sqm=area,
            area_hectares=area / 10000.0,
            perimeter_m=perimeter,
            dimensions=f"{int(dist_x)}m x {int(dist_y)}m",
            owner_name="Demo User (Hypothetical)",
            land_use="Commercial / Educational",
            source="NLAMS Dynamic Mock",
            ulpin=None,
            last_updated=datetime.utcnow(),
            confidence_note="Dynamically generated hypothetical parcel.",
            geojson=mapping(poly)
        )

    def _generate_mock_grid(self, lat: float, lng: float, radius_m: float) -> List[ParcelResponse]:
        parcels = []
        grid_size = min(max(int(radius_m / 40), 2), 6)
        ox_step = 0.00025
        oy_step = 0.00025
        
        start_lat = lat - (grid_size / 2) * oy_step
        start_lng = lng - (grid_size / 2) * ox_step
        
        count = 1
        for i in range(grid_size):
            for j in range(grid_size):
                plat = start_lat + i * oy_step
                plng = start_lng + j * ox_step
                
                ox = 0.00010
                oy = 0.00010
                poly = Polygon([
                    (plng - ox, plat - oy),
                    (plng + ox, plat - oy * 0.9),
                    (plng + ox, plat + oy),
                    (plng - ox * 0.9, plat + oy),
                    (plng - ox, plat - oy)
                ])
                
                area, perimeter = self.geod.geometry_area_perimeter(poly)
                area, perimeter = abs(area), abs(perimeter)
                minx, miny, maxx, maxy = poly.bounds
                _, _, dist_x = self.geod.inv(minx, miny, maxx, miny)
                _, _, dist_y = self.geod.inv(minx, miny, minx, maxy)
                
                parcels.append(ParcelResponse(
                    parcel_id=str(uuid.uuid4()),
                    survey_number=f"CTS-MOCK-{int(plat*1000)}-{count}",
                    cts_number=f"MOCK/{count}",
                    village="Hypothetical Area",
                    taluka="Local Taluka",
                    district="Local District",
                    state="Maharashtra",
                    area_sqm=area,
                    area_hectares=area / 10000.0,
                    perimeter_m=perimeter,
                    dimensions=f"{int(dist_x)}m x {int(dist_y)}m",
                    owner_name="Saraswati College" if count % 3 == 0 else "Private Owner",
                    land_use="Educational" if count % 3 == 0 else "Residential",
                    source="NLAMS Dynamic Grid",
                    ulpin=None,
                    last_updated=datetime.utcnow(),
                    confidence_note="Generated grid layout.",
                    geojson=mapping(poly)
                ))
                count += 1
                
        return parcels

    async def find_parcels_nearby(self, lat: float, lng: float, radius_m: float, db_session: AsyncSession) -> List[ParcelResponse]:
        # Try fetching real world parcels from OSM Standard API first
        osm_parcels = await self._fetch_osm_parcels(lat, lng, radius_m)
        if osm_parcels and len(osm_parcels) > 0:
            return osm_parcels
            
        # If OSM is empty, fallback to local DB (our demo grids)
        try:
            point = func.ST_SetSRID(func.ST_Point(lng, lat), 4326)
            query = select(CadastralParcel).where(
                func.ST_DWithin(
                    CadastralParcel.geometry,
                    point,
                    radius_m / 105000.0
                )
            )
            result = await db_session.execute(query)
            db_parcels = result.scalars().all()
            if db_parcels:
                return [self._to_response(p) for p in db_parcels]
            else:
                return self._generate_mock_grid(lat, lng, radius_m)
        except Exception as e:
            print(f"Database error in nearby (fallback empty): {e}")
            return self._generate_mock_grid(lat, lng, radius_m)

    async def get_parcel_by_id(self, parcel_id: str, db_session: AsyncSession) -> Optional[ParcelResponse]:
        try:
            query = select(CadastralParcel).where(CadastralParcel.parcel_id == parcel_id)
            result = await db_session.execute(query)
            parcel = result.scalars().first()
            if parcel:
                return self._to_response(parcel)
        except Exception:
            pass
        return None
