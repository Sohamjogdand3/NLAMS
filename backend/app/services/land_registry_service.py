import abc
import json
import logging
import random
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.land_parcel import LandParcel
from app.models.jurisdiction import Jurisdiction

logger = logging.getLogger("nlams.land_registry")

# Sample Realistic Landholder Profiles for Maharashtra Revenue Records
SAMPLE_KHATEDARS = [
    ("Rajesh Dinkar Patil", "AV-MHA-PUN-00921", ["Suresh Dinkar Patil (Brother, 1/2 share)"]),
    ("Sunita Ramesh Deshmukh", "AV-MHA-PUN-00814", ["Anand Ramesh Deshmukh (Son, 1/3 share)", "Pooja Ramesh Deshmukh (Daughter, 1/3 share)"]),
    ("Vishnu Bhaurao Jadhav", "AV-MHA-PUN-00755", ["Kavita Vishnu Jadhav (Wife, 1/2 share)"]),
    ("Tukaram Ganpat Shinde", "AV-MHA-PUN-00623", []),
    ("Anusaya Pandurang Kadam", "AV-MHA-PUN-00519", ["Datta Pandurang Kadam (Son, 1/2 share)"]),
    ("Eknath Mahadev Gaikwad", "AV-MHA-PUN-00481", ["Nitin Eknath Gaikwad (Son, 1/2 share)"]),
    ("Baburao Sambhaji Chavan", "AV-MHA-PUN-00392", []),
    ("Parvati Shankar Jagtap", "AV-MHA-PUN-00277", ["Rahul Shankar Jagtap (Son, 1/2 share)"]),
    ("Kishor Nivrutti More", "AV-MHA-PUN-00164", ["Pravin Nivrutti More (Brother, 1/2 share)"]),
    ("Laxman Maruti Pawar", "AV-MHA-PUN-00088", []),
]


class BaseLandRegistryAdapter(abc.ABC):
    """
    Abstract Base Adapter for State Land Registry Integration.
    Defines the contract for querying Village Form VII-XII (7/12 RoR) and Cadastral boundaries.
    """

    @abc.abstractmethod
    def fetch_cadastral_parcels(
        self,
        district_name: str,
        taluka_name: str,
        village_names: List[str],
        estimated_area_ha: float,
    ) -> List[Dict[str, Any]]:
        pass


class MahaBhulekhSimulatorAdapter(BaseLandRegistryAdapter):
    """
    High-Fidelity Simulated Adapter for Maharashtra MahaBhulekh / 7/12 RoR Gateway.
    Used during development and sandbox testing to realistically resolve spatial polygons
    into verified Survey/Gut cadastral parcels, khatedars, soil types, and mutation numbers.
    """
    ADAPTER_NAME = "SIMULATED_MAHABHULEKH_ADAPTER"
    API_VERSION = "v2.4-sim"

    def fetch_cadastral_parcels(
        self,
        district_name: str,
        taluka_name: str,
        village_names: List[str],
        estimated_area_ha: float,
    ) -> List[Dict[str, Any]]:
        villages = village_names or ["Wagholi", "Manjari Khurd", "Kharadi", "Loni Kalbhor", "Uruli Kanchan"]
        parcel_count = max(4, min(25, int(estimated_area_ha / 1.2) + 2))
        extracted_records = []

        for idx in range(1, parcel_count + 1):
            village = villages[(idx - 1) % len(villages)]
            survey_no = f"{100 + idx * 7}"
            gut_no = f"G-{200 + idx * 5}"
            sub_div = f"{((idx - 1) % 4) + 1}/{((idx - 1) % 3) + 1}"

            khatedar_template = SAMPLE_KHATEDARS[(idx - 1) % len(SAMPLE_KHATEDARS)]
            primary_owner, aadhaar_ref, co_owners = khatedar_template

            rand_val = random.random()
            selected_type = "DRY_CROP"
            if rand_val > 0.85:
                selected_type = "COMMERCIAL"
            elif rand_val > 0.70:
                selected_type = "NON_AGRICULTURAL"
            elif rand_val > 0.40:
                selected_type = "BAGAYAT_IRRIGATED"

            tot_ha = round(random.uniform(0.75, 2.50), 4)
            aff_ha = round(min(tot_ha, random.uniform(0.40, tot_ha)), 4)

            roster_data = {
                "village_form": "VII-XII (7/12 RoR)",
                "state_portal": "MahaBhulekh Integrated RoR Gateway (Simulator)",
                "mutation_entry_no": f"ME-{4000 + idx * 12}",
                "co_owners": co_owners,
                "khatedar_count": len(co_owners) + 1,
                "soil_type": "Medium Black Cotton Soil" if selected_type != "COMMERCIAL" else "Industrial Non-Agri",
                "irrigation_source": "Canal / Well" if selected_type == "BAGAYAT_IRRIGATED" else "Rainfed",
                "trees_count": random.randint(2, 18) if selected_type in ["DRY_CROP", "BAGAYAT_IRRIGATED"] else 0,
                "structures_count": 1 if selected_type in ["NON_AGRICULTURAL", "COMMERCIAL"] else 0,
                "last_mutation_date": "2024-03-15",
                "encumbrance_status": "CLEAR_TITLE",
            }

            extracted_records.append({
                "survey_number": survey_no,
                "gut_number": gut_no,
                "sub_division": sub_div,
                "village_name": village,
                "taluka_name": taluka_name or "Haveli",
                "district_name": district_name or "Pune",
                "land_category": selected_type,
                "total_area_ha": tot_ha,
                "affected_area_ha": aff_ha,
                "owner_name": primary_owner,
                "aadhaar_vault_ref": aadhaar_ref,
                "khatedar_count": len(co_owners) + 1,
                "khasra_roster_json": json.dumps(roster_data),
                "data_source": self.ADAPTER_NAME,
                "api_version": self.API_VERSION,
            })

        return extracted_records


class MahaBhulekhProductionAdapter(BaseLandRegistryAdapter):
    """
    Production Adapter hook for live MahaBhulekh / NIC State Land Records API.
    Configured via NIC API credentials, IP whitelisting, and SSL digital certificates.
    """
    ADAPTER_NAME = "NIC_MAHABHULEKH_PRODUCTION_API"
    API_VERSION = "v3.0-live"

    def fetch_cadastral_parcels(
        self,
        district_name: str,
        taluka_name: str,
        village_names: List[str],
        estimated_area_ha: float,
    ) -> List[Dict[str, Any]]:
        # Future live API invocation against NIC MahaBhulekh endpoint
        logger.info(f"Connecting to live NIC MahaBhulekh Gateway for {district_name}/{taluka_name}...")
        raise NotImplementedError("Live NIC MahaBhulekh Production API adapter will be enabled in production deployment.")


class LandRegistryService:
    """
    Orchestration Facade for State Land Registry integrations.
    Selects adapter dynamically based on environment configuration.
    """
    _adapter: BaseLandRegistryAdapter = MahaBhulekhSimulatorAdapter()

    @classmethod
    def set_adapter(cls, adapter: BaseLandRegistryAdapter):
        cls._adapter = adapter

    @classmethod
    def query_and_populate_parcels(
        cls,
        db: Session,
        proposal_id: int,
        district_name: str,
        taluka_name: str,
        village_names: Optional[List[str]] = None,
        estimated_area_ha: float = 12.5,
        jurisdiction_id: Optional[int] = None,
    ) -> List[LandParcel]:
        """
        Intersects corridor polygon parameters with configured Land Registry Adapter
        and commits official LandParcel entries for the proposal.
        """
        # Clear existing draft parcels
        db.query(LandParcel).filter(LandParcel.proposal_id == proposal_id).delete()

        records = cls._adapter.fetch_cadastral_parcels(
            district_name=district_name,
            taluka_name=taluka_name,
            village_names=village_names or [],
            estimated_area_ha=estimated_area_ha,
        )

        created_parcels: List[LandParcel] = []
        for r in records:
            parcel = LandParcel(
                proposal_id=proposal_id,
                survey_number=r["survey_number"],
                gut_number=r["gut_number"],
                sub_division=r["sub_division"],
                village_name=r["village_name"],
                taluka_name=r["taluka_name"],
                district_name=r["district_name"],
                jurisdiction_id=jurisdiction_id,
                land_category=r["land_category"],
                total_area_ha=r["total_area_ha"],
                affected_area_ha=r["affected_area_ha"],
                owner_name=r["owner_name"],
                aadhaar_vault_ref=r["aadhaar_vault_ref"],
                khatedar_count=r["khatedar_count"],
                khasra_roster_json=r["khasra_roster_json"],
                data_source=r["data_source"],
                api_version=r["api_version"],
                is_frozen=False,
            )
            db.add(parcel)
            created_parcels.append(parcel)

        db.commit()
        logger.info(f"Populated {len(created_parcels)} parcels for Proposal #{proposal_id} via {cls._adapter.ADAPTER_NAME}")
        return created_parcels
