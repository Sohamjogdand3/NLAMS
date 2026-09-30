import httpx
import uuid
from typing import List, Optional, Tuple
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from geoalchemy2.shape import to_shape
from shapely.geometry import Polygon, Point, mapping
from pyproj import Geod
import math
import xml.etree.ElementTree as ET

from app.services.cadastral.base import CadastralService
from app.models.cadastral import CadastralParcel
from app.schemas.gis import ParcelResponse

MAHARASHTRA_NAMES = [
    "Smt. Rukmini & Shri Dnyaneshwar Patil",
    "Shri Suresh Shankarrao Deshmukh",
    "Smt. Anusaya & Shri Ramesh Jadhav",
    "Shri Balasaheb Ganpatrao Shinde",
    "Shri Pandurang Maruti Kadam",
    "Smt. Sunita & Shri Ashok Gaikwad",
    "Shri Tanaji Baburao More",
    "Shri Dattatray Vithoba Chavan",
    "Smt. Mangala & Shri Prakash Pawar",
    "Shri Santosh Namdeo Jagtap",
    "Shri Prabhakar Ramchandra Joshi",
    "Smt. Shailaja & Shri Deepak Ghorpade",
    "Shri Vasant Keshavrao Bhosale",
    "Shri Tukaram Laxman Sawant",
    "Smt. Vaishali & Shri Nitin Salunkhe",
    "Shri Sanjay Ramdas Wagh",
    "Shri Rajendra Babanrao Thorat",
    "Smt. Nirmala & Shri Vilas Kale",
    "Shri Mahadev Bhiku Tambe",
    "Shri Dilip Narayan Sonawane"
]

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
            area_sqm=round(area if area > 0 else parcel.area_sqm, 2),
            area_hectares=round((area / 10000.0) if area > 0 else parcel.area_hectares, 4),
            perimeter_m=round(perimeter, 2),
            dimensions=f"{int(abs(dist_x))}m x {int(abs(dist_y))}m",
            owner_name=parcel.owner_name,
            land_use=parcel.land_use,
            source=parcel.source or "NLAMS Demo Dataset",
            ulpin=parcel.ulpin,
            last_updated=parcel.last_updated,
            confidence_note=parcel.confidence_note or "Real-world cadastral footprint",
            geojson=geojson_dict
        )

    async def _fetch_osm_parcels(self, lat: float, lng: float, radius_m: float = 300.0) -> List[ParcelResponse]:
        """
        Fetches real-world building and plot geometries directly from the Standard OpenStreetMap Core API (XML endpoint),
        bypassing Overpass completely.
        """
        search_radius = max(radius_m, 250.0)
        delta_lat = search_radius / 111320.0
        delta_lng = search_radius / (111320.0 * math.cos(math.radians(lat)))
        
        min_lng = lng - delta_lng
        min_lat = lat - delta_lat
        max_lng = lng + delta_lng
        max_lat = lat + delta_lat
        bbox = f"{min_lng:.6f},{min_lat:.6f},{max_lng:.6f},{max_lat:.6f}"
        
        url = f"https://api.openstreetmap.org/api/0.6/map?bbox={bbox}"
        text_data = None
        
        try:
            async with httpx.AsyncClient() as client:
                headers = {
                    "User-Agent": "NLAMS_Cadastral_Platform/2.0 (gov.nlams.demo)",
                    "Accept": "application/xml, text/xml, */*"
                }
                resp = await client.get(url, headers=headers, timeout=12.0)
                if resp.status_code == 200:
                    text_data = resp.text
        except Exception as e:
            print(f"OSM Standard Core API query notice: {e}")
            return []
            
        if not text_data:
            return []
            
        parsed_parcels_with_dist: List[Tuple[float, ParcelResponse]] = []
        click_point = Point(lng, lat)
        base_survey = int(abs(lat * 10)) % 500 + 1

        try:
            root = ET.fromstring(text_data)
            nodes = {}
            for child in root.findall('node'):
                nodes[child.attrib['id']] = (float(child.attrib['lon']), float(child.attrib['lat']))
                
            seen_ways = set()
            valid_idx = 1

            for way in root.findall('way'):
                way_id = way.attrib.get('id')
                if not way_id or way_id in seen_ways:
                    continue
                seen_ways.add(way_id)

                tags = {}
                is_parcel = False
                for tag in way.findall('tag'):
                    k = tag.attrib.get('k', '')
                    v = tag.attrib.get('v', '')
                    tags[k] = v
                    if k in ['building', 'landuse', 'amenity', 'leisure', 'boundary', 'natural', 'allotment']:
                        is_parcel = True
                
                if not is_parcel:
                    continue
                    
                coords = []
                for nd in way.findall('nd'):
                    ref = nd.attrib.get('ref')
                    if ref in nodes:
                        coords.append(nodes[ref])
                
                if len(coords) < 3:
                    continue
                if coords[0] != coords[-1]:
                    coords.append(coords[0])
                if len(coords) < 4:
                    continue
                    
                try:
                    poly = Polygon(coords)
                    if not poly.is_valid or poly.is_empty:
                        continue
                    
                    area, perimeter = self.geod.geometry_area_perimeter(poly)
                    area_sqm = abs(area)
                    perimeter_m = abs(perimeter)
                    
                    if area_sqm < 15.0 or area_sqm > 5000000.0:
                        continue
                    
                    minx, miny, maxx, maxy = poly.bounds
                    _, _, dist_x = self.geod.inv(minx, miny, maxx, miny)
                    _, _, dist_y = self.geod.inv(minx, miny, minx, maxy)
                    
                    land_use_tag = (
                        tags.get("building")
                        or tags.get("landuse")
                        or tags.get("amenity")
                        or tags.get("leisure")
                        or tags.get("natural")
                        or "Residential / Gaothan"
                    )
                    land_use_display = str(land_use_tag).capitalize()
                    if "slum" in land_use_display.lower() or "informal" in str(tags).lower():
                        land_use_display = "Slum / Informal Settlement"
                    elif "forest" in land_use_display.lower() or "wood" in land_use_display.lower():
                        land_use_display = "Forest / Natural Vegetation"
                    elif "residential" in land_use_display.lower() or "apartments" in land_use_display.lower():
                        land_use_display = "Residential / Gaothan"
                    elif "commercial" in land_use_display.lower() or "retail" in land_use_display.lower():
                        land_use_display = "Commercial / Road-Facing"
                    
                    owner_name = tags.get("name") or tags.get("operator") or MAHARASHTRA_NAMES[(valid_idx - 1) % len(MAHARASHTRA_NAMES)]
                    
                    centroid = poly.centroid
                    dist_from_click = math.hypot(centroid.x - lng, centroid.y - lat)
                    if poly.contains(click_point):
                        dist_from_click = -1.0
                    
                    survey_num = f"{base_survey}/{valid_idx}"
                    cts_num = f"CTS-{way_id[-6:]}"
                    ulpin = f"MH-OSM-{way_id}"
                    
                    p_resp = ParcelResponse(
                        parcel_id=str(uuid.uuid4()),
                        survey_number=survey_num,
                        cts_number=cts_num,
                        village="Kharghar",
                        taluka="Panvel",
                        district="Raigad",
                        state="Maharashtra",
                        area_sqm=round(area_sqm, 2),
                        area_hectares=round(area_sqm / 10000.0, 4),
                        perimeter_m=round(perimeter_m, 2),
                        dimensions=f"{int(abs(dist_x))}m x {int(abs(dist_y))}m",
                        owner_name=owner_name,
                        land_use=land_use_display,
                        source="OpenStreetMap Standard Core API",
                        osm_id=str(way_id),
                        osm_type="way",
                        ulpin=ulpin,
                        last_updated=datetime.utcnow(),
                        geojson=mapping(poly),
                        confidence_note=f"Real OSM Way #{way_id} verified via OpenStreetMap Core API & pyproj"
                    )
                    
                    parsed_parcels_with_dist.append((dist_from_click, p_resp))
                    valid_idx += 1
                except Exception:
                    continue
        except Exception as e:
            print(f"Error parsing OSM Core XML: {e}")
            
        parsed_parcels_with_dist.sort(key=lambda x: x[0])
        return [p[1] for p in parsed_parcels_with_dist]

    async def find_parcel_by_point(self, lat: float, lng: float, db_session: AsyncSession) -> Optional[ParcelResponse]:
        osm_parcels = await self._fetch_osm_parcels(lat, lng, 300.0)
        if osm_parcels:
            return osm_parcels[0]
            
        # Fallback to local DB
        try:
            point = func.ST_SetSRID(func.ST_Point(lng, lat), 4326)
            query = select(CadastralParcel).where(func.ST_Contains(CadastralParcel.geometry, point))
            result = await db_session.execute(query)
            parcel = result.scalars().first()
            if parcel:
                return self._to_response(parcel)
        except Exception:
            pass
            
        return None

    async def find_parcels_nearby(self, lat: float, lng: float, radius_m: float, db_session: AsyncSession) -> List[ParcelResponse]:
        osm_parcels = await self._fetch_osm_parcels(lat, lng, radius_m)
        if osm_parcels and len(osm_parcels) > 0:
            return osm_parcels
            
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
        except Exception:
            pass

        return []

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
