import uuid
from datetime import datetime
from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.schemas.gis import CoordinateInput, IdentifyLandResponse
from app.services.cadastral.overpass_engine import gis_engine
from app.services.intelligence.analyzer import location_analyzer

router = APIRouter(prefix="", tags=["GIS Location Intelligence"])


class AnalyzeLocationRequest(BaseModel):
    latitude: float
    longitude: float
    radius_m: float = 3000.0
    district: str = "Raigad"
    state: str = "Maharashtra"


class ParcelInput(BaseModel):
    parcel_id: Optional[str] = None
    survey_number: str
    area_sqm: float
    village: Optional[str] = "Kharghar"
    taluka: Optional[str] = "Panvel"
    district: Optional[str] = "Raigad"
    state: Optional[str] = "Maharashtra"
    owner_name: Optional[str] = None
    land_use: Optional[str] = "Agricultural / Irrigated"


class CompensationCalculateRequest(BaseModel):
    parcels: List[ParcelInput]
    region_type: str = "Urban"


class GenerateNoticeRequest(BaseModel):
    parcels: List[ParcelInput]
    district: str = "Raigad"
    state: str = "Maharashtra"


@router.post("/gis/identify-land", response_model=IdentifyLandResponse)
@router.post("/identify-land", response_model=IdentifyLandResponse)
async def identify_land(input_data: CoordinateInput):
    """
    Phase 1: Reverse geocodes coordinates and returns live cadastral parcel boundaries
    from OpenStreetMap Standard Core API with pyproj Geodesic calculations.
    """
    return await gis_engine.identify_land_corridor(
        lat=input_data.latitude,
        lng=input_data.longitude,
        radius_m=input_data.radius_m or 150.0,
    )


@router.post("/intelligence/analyze")
@router.post("/gis/intelligence/analyze")
async def analyze_location(req: AnalyzeLocationRequest):
    """
    Phase 2: Location Intelligence & News Scraper
    - Concentric proximity queries: 3km for clinics/schools, 10km for major transport/airport construction.
    - Pyproj exact geodesic distance calculations.
    - Live Google News RSS XML scraper for hyper-local infrastructure developments.
    """
    return await location_analyzer.analyze(
        lat=req.latitude,
        lng=req.longitude,
        radius_m=req.radius_m,
        district=req.district,
        state=req.state,
    )


@router.post("/acquisition/calculate")
@router.post("/gis/acquisition/calculate")
async def calculate_gis_compensation(req: CompensationCalculateRequest):
    """
    Phase 3: Statutory LARR Act 2013 Financial Valuation
    Applies base rate per sqm, Urban/Rural multiplier, and 100% statutory solatium
    with a parcel-by-parcel financial breakdown.
    """
    is_rural = req.region_type.lower() == "rural"
    multiplier = 2.0 if is_rural else 1.0
    base_rate_sqm = 12000.0  # Baseline circle rate: Rs 12,000 per sqm

    total_area_sqm = sum(p.area_sqm for p in req.parcels)
    parcel_breakdown = []
    total_base_val = 0.0
    total_solatium_val = 0.0
    grand_total_val = 0.0

    for idx, p in enumerate(req.parcels):
        p_id = p.parcel_id or f"parcel-{idx+1}"
        p_area = p.area_sqm
        base_val = p_area * base_rate_sqm
        multiplied_val = base_val * multiplier
        solatium_val = multiplied_val * 1.0  # 100% Solatium
        total_p_comp = multiplied_val + solatium_val

        total_base_val += base_val
        total_solatium_val += solatium_val
        grand_total_val += total_p_comp

        parcel_breakdown.append({
            "parcel_id": str(p_id),
            "survey_number": p.survey_number or f"191/{idx+1}",
            "area_sqm": round(p_area, 2),
            "base_value": round(base_val, 2),
            "multiplier": multiplier,
            "solatium": round(solatium_val, 2),
            "total_compensation": round(total_p_comp, 2),
        })

    return {
        "region_type": req.region_type,
        "total_area_sqm": round(total_area_sqm, 2),
        "base_rate_per_sqm": base_rate_sqm,
        "multiplier_applied": multiplier,
        "solatium_percentage": 100,
        "total_base_value": round(total_base_val, 2),
        "total_solatium": round(total_solatium_val, 2),
        "grand_total": round(grand_total_val, 2),
        "parcel_breakdown": parcel_breakdown,
    }


@router.post("/acquisition/generate-notice")
@router.post("/gis/acquisition/generate-notice")
async def generate_gis_notice(req: GenerateNoticeRequest):
    """
    Phase 3: Statutory Document Automation
    Generates official Form-II Section 11 Preliminary Notification under RFCTLARR Act 2013
    with dynamic table rows for selected cart parcels, unique Gazette notice ID, and print-ready styling.
    """
    today_str = datetime.utcnow().strftime("%d-%m-%Y")
    today_formal = datetime.utcnow().strftime("%B %d, %Y")
    notice_id = f"SEC11-NOTIF-{datetime.utcnow().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    
    total_area_sqm = sum(p.area_sqm for p in req.parcels)
    total_area_ha = total_area_sqm / 10000.0

    table_rows_html = ""
    table_rows_md = ""

    for idx, p in enumerate(req.parcels):
        s_no = p.survey_number or f"191/{idx+1}"
        v_name = p.village or "Kharghar"
        t_name = p.taluka or "Panvel"
        sqm_str = f"{p.area_sqm:.2f}"
        ha_str = f"{(p.area_sqm / 10000.0):.4f}"
        owner_str = p.owner_name or "Revenue Cadastre / Private Landholder"
        l_use = p.land_use or "Agricultural"

        table_rows_html += f"""
        <tr style="border-bottom: 1px solid #cbd5e1;">
            <td style="padding: 8px 12px; text-align: center;">{idx+1}</td>
            <td style="padding: 8px 12px; font-weight: 700; color: #0f172a;">{s_no}</td>
            <td style="padding: 8px 12px;">{v_name}</td>
            <td style="padding: 8px 12px;">{t_name}</td>
            <td style="padding: 8px 12px; text-align: right; font-weight: 600;">{sqm_str}</td>
            <td style="padding: 8px 12px; text-align: right; font-weight: 600;">{ha_str}</td>
            <td style="padding: 8px 12px;">{l_use}</td>
            <td style="padding: 8px 12px; font-size: 11px;">{owner_str}</td>
        </tr>
        """

        table_rows_md += f"| {idx+1} | {s_no} | {v_name} | {t_name} | {sqm_str} | {ha_str} | {l_use} | {owner_str} |\n"

    document_html = f"""
    <div style="font-family: 'Times New Roman', Times, serif; color: #111827; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 24px; background: #ffffff;">
        <div style="text-align: center; border-bottom: 3px double #000; padding-bottom: 16px; margin-bottom: 24px;">
            <p style="font-size: 14px; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px;">The Gazette of India / State Official Gazette</p>
            <p style="font-size: 12px; margin: 2px 0 0 0; color: #475569;">EXTRAORDINARY — PART II — SECTION 3 — SUB-SECTION (ii)</p>
            <p style="font-size: 12px; margin: 2px 0 0 0; color: #475569;">PUBLISHED BY AUTHORITY OF THE COLLECTOR & DISTRICT MAGISTRATE, {req.district.upper()}</p>
        </div>

        <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; margin-bottom: 16px;">
            <span>Ref No: {notice_id}</span>
            <span>Date of Notification: {today_formal}</span>
        </div>

        <div style="text-align: center; margin-bottom: 20px;">
            <h2 style="font-size: 17px; font-weight: 900; text-transform: uppercase; margin: 0 0 6px 0; text-decoration: underline;">
                FORM - II
            </h2>
            <p style="font-size: 13px; font-weight: bold; margin: 0; text-transform: uppercase;">
                Preliminary Notification under Section 11(1) of the Right to Fair Compensation and Transparency in Land Acquisition, Rehabilitation and Resettlement Act, 2013 (Act 30 of 2013)
            </p>
        </div>

        <div style="font-size: 13px; text-align: justify; margin-bottom: 16px;">
            <p style="margin-bottom: 12px;">
                <strong>WHEREAS</strong> it appears to the Appropriate Government that a total of <strong>{total_area_ha:.4f} Hectares ({total_area_sqm:.2f} Sq. Meters)</strong> of land described in the Schedule below is required for a public purpose, namely for the <strong>Construction of National Multi-Modal Infrastructure & Transportation Corridor</strong> under the PM GatiShakti National Master Plan in the District of <strong>{req.district}</strong>, State of <strong>{req.state}</strong>.
            </p>
            <p style="margin-bottom: 12px;">
                <strong>AND WHEREAS</strong>, in exercise of powers conferred under Section 11(1) of the RFCTLARR Act 2013, the Appropriate Government hereby notifies the particulars of the land proposed to be acquired as detailed below:
            </p>
        </div>

        <div style="margin-bottom: 24px; overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #94a3b8;">
                <thead>
                    <tr style="background: #f1f5f9; border-bottom: 2px solid #475569; font-weight: bold; text-align: left;">
                        <th style="padding: 8px 12px; text-align: center;">Sl.</th>
                        <th style="padding: 8px 12px;">Survey / CTS No.</th>
                        <th style="padding: 8px 12px;">Village</th>
                        <th style="padding: 8px 12px;">Taluka</th>
                        <th style="padding: 8px 12px; text-align: right;">Area (Sq.M)</th>
                        <th style="padding: 8px 12px; text-align: right;">Area (Ha)</th>
                        <th style="padding: 8px 12px;">Classification</th>
                        <th style="padding: 8px 12px;">Recorded Title Holder</th>
                    </tr>
                </thead>
                <tbody>
                    {table_rows_html}
                </tbody>
                <tfoot>
                    <tr style="background: #f8fafc; font-weight: 800; border-top: 2px solid #334155;">
                        <td colspan="4" style="padding: 10px 12px; text-align: right;">TOTAL ACQUISITION CORRIDOR:</td>
                        <td style="padding: 10px 12px; text-align: right; color: #1e3a8a;">{total_area_sqm:.2f} Sq.M</td>
                        <td style="padding: 10px 12px; text-align: right; color: #1e3a8a;">{total_area_ha:.4f} Ha</td>
                        <td colspan="2" style="padding: 10px 12px; text-align: left; color: #475569;">({len(req.parcels)} Selected Cadastral Units)</td>
                    </tr>
                </tfoot>
            </table>
        </div>

        <div style="font-size: 12px; text-align: justify; margin-bottom: 24px;">
            <p style="margin-bottom: 8px;">
                <strong>NOTICE IS HEREBY GIVEN THAT:</strong>
            </p>
            <ol style="padding-left: 20px; margin: 0; space-y: 6px;">
                <li style="margin-bottom: 6px;">Any person interested in the said land may, within a period of <strong>60 (sixty) days</strong> from the date of publication of this notification, file objections in writing to the acquisition under Section 15 of the Act before the Competent Authority.</li>
                <li style="margin-bottom: 6px;">No person shall make any transaction or cause any encumbrances whatsoever regarding the said land from the date of publication of this notification as provided under Section 11(4) of the Act without prior sanction of the Collector.</li>
                <li style="margin-bottom: 6px;">The designated Administrator for Rehabilitation & Resettlement shall conduct a comprehensive survey of affected families as per Section 16 of the Act.</li>
            </ol>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 16px; font-size: 12px;">
            <div>
                <p style="margin: 0;"><strong>Place:</strong> {req.district}, {req.state}</p>
                <p style="margin: 2px 0 0 0;"><strong>Date:</strong> {today_str}</p>
                <p style="margin: 2px 0 0 0; color: #64748b; font-size: 10px;">NLAMS Cryptographic Token: {uuid.uuid4().hex}</p>
            </div>
            <div style="text-align: right;">
                <div style="height: 35px;"></div>
                <p style="margin: 0; font-weight: bold; text-decoration: overline;">Competent Authority for Land Acquisition (CALA)</p>
                <p style="margin: 2px 0 0 0;">Sub-Divisional Magistrate & Revenue Officer</p>
                <p style="margin: 2px 0 0 0;">District of {req.district}, {req.state}</p>
            </div>
        </div>
    </div>
    """

    document_markdown = f"""
# FORM - II
## PRELIMINARY NOTIFICATION UNDER SECTION 11(1)
### RFCTLARR ACT, 2013 (ACT 30 OF 2013)

**Gazette Reference:** {notice_id}  
**Date:** {today_formal}  
**District:** {req.district}, {req.state}  
**Total Land Area:** {total_area_ha:.4f} Hectares ({total_area_sqm:.2f} Sq.M) across {len(req.parcels)} parcels.

---

### Schedule of Proposed Land Parcels

| Sl. | Survey No. | Village | Taluka | Area (Sq.M) | Area (Ha) | Land Use | Owner / Title |
|---|---|---|---|---|---|---|---|
{table_rows_md}

**Statutory Directives:**
1. Objections under Section 15 must be submitted within 60 days to the CALA / SDM, {req.district}.
2. Section 11(4) transaction bar is active upon this land.
3. R&R Census initiated under Section 16.
"""

    return {
        "document_html": document_html,
        "document_markdown": document_markdown,
        "generated_date": today_str,
        "reference_number": notice_id,
    }
