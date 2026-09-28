import logging
import random
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.jurisdiction import Jurisdiction, JurisdictionType
from app.models.land_parcel import LandParcel

logger = logging.getLogger("nlams.national.simulation")

# National Simulation Spatial Dataset Matrix (India -> States -> Key Industrial/Corridor Districts & Talukas)
NATIONAL_DATASET_HIERARCHY = {
    "Maharashtra": {
        "code": "MH",
        "districts": {
            "Pune": {
                "code": "DIS-PUN",
                "talukas": {
                    "Haveli": ["Wagholi", "Manjari Khurd", "Kharadi", "Loni Kalbhor", "Uruli Kanchan"],
                    "Mulshi": ["Hinjawadi", "Pirangut", "Maan", "Marunji", "Paud"],
                    "Khed": ["Chakan", "Alandi", "Khed", "Mahalunge", "Kurali"],
                    "Baramati": ["Baramati", "Malegaon", "Supi", "Someshwar", "Morgaon"],
                },
            },
            "Thane": {
                "code": "DIS-THA",
                "talukas": {
                    "Thane": ["Kopar", "Majhiwada", "Kausa", "Balkum", "Kalwa"],
                    "Kalyan": ["Dombivli", "Titwala", "Kalyan Rural", "Manda", "Ambivli"],
                    "Bhiwandi": ["Anjur", "Dapode", "Val", "Padgha", "Kharbav"],
                },
            },
            "Nagpur": {
                "code": "DIS-NAG",
                "talukas": {
                    "Nagpur Rural": ["MIHAN Special Economic Zone", "Butibori", "Hingna", "Wadi", "Besa"],
                    "Kamptee": ["Kamptee", "Kanhan", "Gondegaon", "Tekadi", "Waregaon"],
                },
            },
        },
    },
    "Gujarat": {
        "code": "GJ",
        "districts": {
            "Ahmedabad": {
                "code": "DIS-AHM",
                "talukas": {
                    "Sanand": ["Sanand GIDC", "Charal", "Rampura", "Nidhrad", "Vasna"],
                    "Dholera": ["Dholera SIR Phase 1", "Bhangadh", "Kadipur", "Navagam", "Otariya"],
                },
            },
            "Surat": {
                "code": "DIS-SUR",
                "talukas": {
                    "Chorasi": ["Hazira Port Corridor", "Ichhapore", "Mora", "Bhatpore", "Damka"],
                    "Olpad": ["Olpad", "Sayan", "Karanj", "Masma", "Kim"],
                },
            },
        },
    },
    "Uttar Pradesh": {
        "code": "UP",
        "districts": {
            "Gautam Buddha Nagar": {
                "code": "DIS-GBN",
                "talukas": {
                    "Jewar": ["Noida International Airport Hub", "Dayanatpur", "Ranhera", "Rohi", "Kishorepur"],
                    "Dadri": ["Greater Noida West", "Ecotech Corridor", "Bhangel", "Surajpur", "Tugalpur"],
                },
            },
            "Varanasi": {
                "code": "DIS-VAR",
                "talukas": {
                    "Pindra": ["Pindra Rural", "Baburahi", "Babatpur Corridor", "Karkaon", "Anei"],
                    "Varanasi Sadar": ["Shivpur", "Manduadih", "Ramnagar", "Lohta", "Kashi Logistics"],
                },
            },
        },
    },
    "Karnataka": {
        "code": "KA",
        "districts": {
            "Bengaluru Urban": {
                "code": "DIS-BLR",
                "talukas": {
                    "Bengaluru East": ["Whitefield Extension", "Varthur", "Bellandur Outer", "Kadugodi", "Hoodi"],
                    "Anekal": ["Electronic City Phase 2", "Jigani Industrial Area", "Attibele Corridor", "Hebbagodi", "Bommasandra"],
                },
            },
        },
    },
    "Tamil Nadu": {
        "code": "TN",
        "districts": {
            "Kanchipuram": {
                "code": "DIS-KCH",
                "talukas": {
                    "Sriperumbudur": ["Sriperumbudur Industrial Hub", "Mambakkam", "Oragadam Corridor", "Vallam", "Irungattukottai"],
                },
            },
        },
    },
    "Delhi": {
        "code": "DL",
        "districts": {
            "South West Delhi": {
                "code": "DIS-SWD",
                "talukas": {
                    "Dwarka": ["Dwarka Expressway Corridor", "Bijwasan", "Kapashera", "Dhulsiras", "Bamnoli"],
                },
            },
        },
    },
}


class NationalSimulationService:
    """
    National Administrative Hierarchy and Synthetic Simulation Dataset Service.
    Seeds and manages India -> State -> District -> Taluka -> Village -> Synthetic Parcels architecture.
    """

    @classmethod
    def seed_national_hierarchy(cls, db: Session) -> Dict[str, int]:
        """
        Seeds national administrative hierarchy (India -> States -> Districts -> Talukas -> Villages).
        Returns count of seeded jurisdictions.
        """
        # 1. National
        india = db.query(Jurisdiction).filter(Jurisdiction.code == "IN").first()
        if not india:
            india = Jurisdiction(name="India", type=JurisdictionType.NATIONAL, code="IN")
            db.add(india)
            db.flush()

        counts = {"states": 0, "districts": 0, "talukas": 0, "villages": 0}

        for state_name, s_info in NATIONAL_DATASET_HIERARCHY.items():
            state_code = s_info["code"]
            state_jur = db.query(Jurisdiction).filter(Jurisdiction.name == state_name, Jurisdiction.type == JurisdictionType.STATE).first()
            if not state_jur:
                state_jur = Jurisdiction(
                    name=state_name,
                    type=JurisdictionType.STATE,
                    code=state_code,
                    parent_id=india.id,
                )
                db.add(state_jur)
                db.flush()
                counts["states"] += 1

            for dist_name, d_info in s_info["districts"].items():
                dist_code = d_info["code"]
                dist_jur = db.query(Jurisdiction).filter(Jurisdiction.name == dist_name, Jurisdiction.parent_id == state_jur.id).first()
                if not dist_jur:
                    dist_jur = Jurisdiction(
                        name=dist_name,
                        type=JurisdictionType.DISTRICT,
                        code=dist_code,
                        parent_id=state_jur.id,
                    )
                    db.add(dist_jur)
                    db.flush()
                    counts["districts"] += 1

                for taluka_name, villages in d_info["talukas"].items():
                    taluka_code = f"TAL-{dist_code[4:]}-{taluka_name[:4].upper()}"
                    taluka_jur = db.query(Jurisdiction).filter(Jurisdiction.name == taluka_name, Jurisdiction.parent_id == dist_jur.id).first()
                    if not taluka_jur:
                        taluka_jur = Jurisdiction(
                            name=taluka_name,
                            type=JurisdictionType.TALUKA,
                            code=taluka_code,
                            parent_id=dist_jur.id,
                        )
                        db.add(taluka_jur)
                        db.flush()
                        counts["talukas"] += 1

                    for village_name in villages:
                        v_code = f"VIL-{taluka_name[:3].upper()}-{village_name[:4].upper()}"
                        v_jur = db.query(Jurisdiction).filter(Jurisdiction.name == village_name, Jurisdiction.parent_id == taluka_jur.id).first()
                        if not v_jur:
                            v_jur = Jurisdiction(
                                name=village_name,
                                type=JurisdictionType.VILLAGE,
                                code=v_code,
                                parent_id=taluka_jur.id,
                            )
                            db.add(v_jur)
                            db.flush()
                            counts["villages"] += 1

        db.commit()
        logger.info(f"National simulation hierarchy populated: {counts}")
        return counts

    @classmethod
    def get_states(cls, db: Session) -> List[Jurisdiction]:
        """Returns all States in the National Simulation Dataset."""
        return db.query(Jurisdiction).filter(Jurisdiction.type == JurisdictionType.STATE).order_by(Jurisdiction.name.asc()).all()

    @classmethod
    def get_districts(cls, db: Session, state_id: Optional[int] = None) -> List[Jurisdiction]:
        """Returns Districts, optionally filtered by parent state."""
        q = db.query(Jurisdiction).filter(Jurisdiction.type == JurisdictionType.DISTRICT)
        if state_id:
            q = q.filter(Jurisdiction.parent_id == state_id)
        return q.order_by(Jurisdiction.name.asc()).all()

    @classmethod
    def get_talukas(cls, db: Session, district_id: Optional[int] = None) -> List[Jurisdiction]:
        """Returns Talukas, optionally filtered by parent district."""
        q = db.query(Jurisdiction).filter(Jurisdiction.type == JurisdictionType.TALUKA)
        if district_id:
            q = q.filter(Jurisdiction.parent_id == district_id)
        return q.order_by(Jurisdiction.name.asc()).all()

    @classmethod
    def get_villages(cls, db: Session, taluka_id: Optional[int] = None) -> List[Jurisdiction]:
        """Returns Villages, optionally filtered by parent taluka."""
        q = db.query(Jurisdiction).filter(Jurisdiction.type == JurisdictionType.VILLAGE)
        if taluka_id:
            q = q.filter(Jurisdiction.parent_id == taluka_id)
        return q.order_by(Jurisdiction.name.asc()).all()

    @classmethod
    def generate_synthetic_parcels(
        cls,
        village_name: str,
        taluka_name: str,
        district_name: str,
        count: int = 6,
    ) -> List[Dict[str, Any]]:
        """
        Generates authentic synthetic cadastral parcels for any village in the national dataset.
        """
        surnames = ["Patil", "Deshmukh", "Chavan", "Pawar", "Shinde", "Jadhav", "Kadam", "Gaikwad", "More", "Bhosale", "Sharma", "Verma", "Singh", "Reddy", "Rao", "Kumar"]
        firstnames = ["Ramesh", "Suresh", "Sunil", "Anil", "Santosh", "Vikas", "Prakash", "Dattatray", "Ganesh", "Vijay", "Sandip", "Kishore", "Rajesh", "Pooja", "Sunita"]
        categories = ["DRY_CROP", "BAGAYAT_IRRIGATED", "NON_AGRICULTURAL", "COMMERCIAL"]

        parcels = []
        base_survey = random.randint(101, 380)

        for i in range(1, count + 1):
            sub_div = f"{base_survey + i}/{random.randint(1, 4)}"
            owner = f"{random.choice(firstnames)} {random.choice(surnames)}"
            total_ha = round(random.uniform(0.8, 3.5), 2)
            affected_ha = round(min(total_ha, random.uniform(0.4, 2.2)), 2)
            cat = random.choice(categories)
            khatedars = random.randint(1, 4)

            parcels.append({
                "survey_number": sub_div,
                "gut_number": f"GUT-{base_survey + i}",
                "sub_division": f"Hissa {i}",
                "village_name": village_name,
                "taluka_name": taluka_name,
                "district_name": district_name,
                "land_category": cat,
                "total_area_ha": total_ha,
                "affected_area_ha": affected_ha,
                "owner_name": owner,
                "aadhaar_vault_ref": f"UID-VAULT-XXXX-XXXX-{random.randint(1000, 9999)}",
                "khatedar_count": khatedars,
                "data_source": "SIMULATED_NATIONAL_LAND_REGISTRY_ADAPTER",
                "api_version": "v2.4-sim",
            })

        return parcels
