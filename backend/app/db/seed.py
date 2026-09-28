import logging
import re
from datetime import datetime
from app.core.security import hash_password
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.db.maharashtra_data import MAHARASHTRA_DISTRICTS_AND_TALUKAS
from app.models.acquisition_case import AcquisitionCase
from app.models.audit_log import AuditLog
from app.models.jurisdiction import Jurisdiction, JurisdictionType
from app.models.land_record import LandRecord
from app.models.login_attempt import LoginAttempt
from app.models.official_email_domain import OfficialEmailDomain
from app.models.otp_session import OTPSession
from app.models.role import Role
from app.models.user import User
from app.models.user_role_jurisdiction import UserRoleJurisdiction
from app.models.user_session import UserSession

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

FIXED_ROLES = [
    {
        "name": "Citizen",
        "code": "CITIZEN",
        "description": "Land owner / Citizen with access to track land records and acquisition status",
    },
    {
        "name": "Surveyor",
        "code": "SURVEYOR",
        "description": "Field Surveyor responsible for GPS cadastral mapping and boundary verification",
    },
    {
        "name": "Talathi",
        "code": "TALATHI",
        "description": "Village Revenue Official handling 7/12 land records and mutation entries",
    },
    {
        "name": "Tehsildar",
        "code": "TEHSILDAR",
        "description": "Taluka Executive Magistrate approving revenue matters and objections",
    },
    {
        "name": "Land Acquisition Officer",
        "code": "LAO",
        "description": "Competent Authority managing acquisition cases, Section 4/6/11 notices, and awards",
    },
    {
        "name": "District Collector",
        "code": "DIST_COLLECTOR",
        "description": "District Collector & Magistrate approving final awards and district oversight",
    },
    {
        "name": "Project Implementing Agency",
        "code": "PIA",
        "description": "Acquiring Agency (NHAI, MMRDA, CIDCO, PWD) managing corridors and deposits",
    },
    {
        "name": "State Admin",
        "code": "STATE_ADMIN",
        "description": "State Land Revenue Administrator managing state policies and MIS",
    },
    {
        "name": "Central Admin",
        "code": "CENTRAL_ADMIN",
        "description": "National System Administrator overseeing global security and audit logs",
    },
]


def slugify(text: str) -> str:
    """Helper to convert name to lowercase alphanumeric slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    return re.sub(r"[\s_-]+", ".", text)


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        logger.info("Starting NLAMS Identity and Maharashtra Hierarchy Seeding...")

        # 1. Seed Approved Official Email Domain
        gov_domain = db.query(OfficialEmailDomain).filter(OfficialEmailDomain.domain == "nlams.gov.demo").first()
        if not gov_domain:
            gov_domain = OfficialEmailDomain(
                domain="nlams.gov.demo",
                organization_name="NLAMS National Land Acquisition & Management System (Government Demo IdP)",
                department="Department of Land Resources & Government of Maharashtra",
                active=True,
                created_at=datetime.utcnow(),
            )
            db.add(gov_domain)
            db.flush()
            logger.info("Seeded approved domain: nlams.gov.demo")

        # 2. Seed Standard Roles
        role_map = {}
        for r_data in FIXED_ROLES:
            role = db.query(Role).filter(Role.code == r_data["code"]).first()
            if not role:
                role = Role(
                    name=r_data["name"],
                    code=r_data["code"],
                    description=r_data["description"],
                )
                db.add(role)
                db.flush()
            role_map[role.code] = role

        # 3. Seed National & State Jurisdictions
        india = db.query(Jurisdiction).filter(Jurisdiction.code == "IN").first()
        if not india:
            india = Jurisdiction(name="India", type=JurisdictionType.NATIONAL, code="IN")
            db.add(india)
            db.flush()

        mh = db.query(Jurisdiction).filter(Jurisdiction.code == "MH").first()
        if not mh:
            mh = Jurisdiction(name="Maharashtra", type=JurisdictionType.STATE, code="MH", parent_id=india.id)
            db.add(mh)
            db.flush()

        default_pwd_hash = hash_password("Password@123")

        # 4. Seed Central Admin & State Admin
        central_email = "central.admin@nlams.gov.demo"
        central_user = db.query(User).filter(User.email == central_email).first()
        if not central_user:
            central_user = User(
                full_name="Central Platform Administrator",
                emp_id="CADM-001",
                email=central_email,
                designation="Director General (Land Resources)",
                department_name="Department of Land Resources (DoLR), MoRD",
                hashed_password=default_pwd_hash,
                is_active=True,
            )
            db.add(central_user)
            db.flush()
            db.add(UserRoleJurisdiction(user_id=central_user.id, role_id=role_map["CENTRAL_ADMIN"].id, jurisdiction_id=india.id, is_active=True))

        state_email = "state.maharashtra@nlams.gov.demo"
        state_user = db.query(User).filter(User.email == state_email).first()
        if not state_user:
            state_user = User(
                full_name="Maharashtra State Revenue Secretary",
                emp_id="SADM-MH-001",
                email=state_email,
                designation="Principal Secretary (Revenue)",
                department_name="Revenue and Forest Department, Govt of Maharashtra",
                hashed_password=default_pwd_hash,
                is_active=True,
            )
            db.add(state_user)
            db.flush()
            db.add(UserRoleJurisdiction(user_id=state_user.id, role_id=role_map["STATE_ADMIN"].id, jurisdiction_id=mh.id, is_active=True))

        # 5. Seed PIA Agencies (NHAI, MMRDA, CIDCO, PWD)
        pia_agencies = [
            ("National Highways Authority of India", "officer.nhai@nlams.gov.demo", "PIA-NHAI-001", "NHAI Project Director"),
            ("Mumbai Metropolitan Region Development Authority", "officer.mmrda@nlams.gov.demo", "PIA-MMRDA-001", "MMRDA Land Officer"),
            ("City and Industrial Development Corporation", "officer.cidco@nlams.gov.demo", "PIA-CIDCO-001", "CIDCO Acquisition Manager"),
            ("Maharashtra Public Works Department", "officer.pwd@nlams.gov.demo", "PIA-PWD-001", "PWD Executive Engineer"),
        ]

        for org_name, email, emp_id, designation in pia_agencies:
            pia_user = db.query(User).filter(User.email == email).first()
            if not pia_user:
                pia_user = User(
                    full_name=designation,
                    emp_id=emp_id,
                    email=email,
                    designation=designation,
                    department_name=org_name,
                    hashed_password=default_pwd_hash,
                    is_active=True,
                )
                db.add(pia_user)
                db.flush()
                db.add(UserRoleJurisdiction(user_id=pia_user.id, role_id=role_map["PIA"].id, jurisdiction_id=mh.id, is_active=True))

        # 6. Seed All 36 Districts & 358 Talukas + Official Accounts
        logger.info("Seeding 36 Districts and Taluka administrative accounts...")

        user_records_to_add = []
        urj_records_to_add = []

        for dist_name, talukas in MAHARASHTRA_DISTRICTS_AND_TALUKAS.items():
            dist_slug = slugify(dist_name)
            dist_code = f"DIS-{dist_slug[:4].upper()}"

            district_jur = db.query(Jurisdiction).filter(Jurisdiction.name == dist_name, Jurisdiction.parent_id == mh.id).first()
            if not district_jur:
                district_jur = Jurisdiction(
                    name=dist_name,
                    type=JurisdictionType.DISTRICT,
                    code=dist_code,
                    parent_id=mh.id,
                )
                db.add(district_jur)
                db.flush()

            # 6.1 District Collector
            collector_email = f"collector.{dist_slug}@nlams.gov.demo"
            collector_user = db.query(User).filter(User.email == collector_email).first()
            if not collector_user:
                collector_user = User(
                    full_name=f"District Collector ({dist_name})",
                    emp_id=f"COLL-{dist_slug.upper()}",
                    email=collector_email,
                    designation="District Collector & District Magistrate",
                    department_name=f"Office of District Collector, {dist_name}",
                    hashed_password=default_pwd_hash,
                    is_active=True,
                )
                db.add(collector_user)
                db.flush()
                db.add(UserRoleJurisdiction(user_id=collector_user.id, role_id=role_map["DIST_COLLECTOR"].id, jurisdiction_id=district_jur.id, is_active=True))

            # 6.2 Land Acquisition Officer (LAO)
            lao_email = f"lao.{dist_slug}@nlams.gov.demo"
            lao_user = db.query(User).filter(User.email == lao_email).first()
            if not lao_user:
                lao_user = User(
                    full_name=f"LAO Officer ({dist_name})",
                    emp_id=f"LAO-{dist_slug.upper()}",
                    email=lao_email,
                    designation="Special Land Acquisition Officer (SLAO)",
                    department_name=f"Land Acquisition Office, {dist_name}",
                    hashed_password=default_pwd_hash,
                    is_active=True,
                )
                db.add(lao_user)
                db.flush()
                db.add(UserRoleJurisdiction(user_id=lao_user.id, role_id=role_map["LAO"].id, jurisdiction_id=district_jur.id, is_active=True))

            # 6.3 Talukas under this District
            for taluka_name in talukas:
                taluka_slug = slugify(taluka_name)
                taluka_code = f"TAL-{dist_slug[:3].upper()}-{taluka_slug[:4].upper()}"

                taluka_jur = db.query(Jurisdiction).filter(Jurisdiction.name == taluka_name, Jurisdiction.parent_id == district_jur.id).first()
                if not taluka_jur:
                    taluka_jur = Jurisdiction(
                        name=taluka_name,
                        type=JurisdictionType.TALUKA,
                        code=taluka_code,
                        parent_id=district_jur.id,
                    )
                    db.add(taluka_jur)
                    db.flush()

                # Tehsildar
                tehsildar_email = f"tehsildar.{taluka_slug}.{dist_slug}@nlams.gov.demo"
                tehsildar_user = db.query(User).filter(User.email == tehsildar_email).first()
                if not tehsildar_user:
                    tehsildar_user = User(
                        full_name=f"Tehsildar ({taluka_name})",
                        emp_id=f"TEH-{dist_slug[:3].upper()}-{taluka_slug.upper()}",
                        email=tehsildar_email,
                        designation="Tehsildar & Executive Magistrate",
                        department_name=f"Tehsil Revenue Office, {taluka_name} ({dist_name})",
                        hashed_password=default_pwd_hash,
                        is_active=True,
                    )
                    db.add(tehsildar_user)
                    db.flush()
                    db.add(UserRoleJurisdiction(user_id=tehsildar_user.id, role_id=role_map["TEHSILDAR"].id, jurisdiction_id=taluka_jur.id, is_active=True))

                # Talathi
                talathi_email = f"talathi.{taluka_slug}.{dist_slug}@nlams.gov.demo"
                talathi_user = db.query(User).filter(User.email == talathi_email).first()
                if not talathi_user:
                    talathi_user = User(
                        full_name=f"Talathi Officer ({taluka_name})",
                        emp_id=f"TAL-{dist_slug[:3].upper()}-{taluka_slug.upper()}",
                        email=talathi_email,
                        designation="Talathi Saza Incharge",
                        department_name=f"Talathi Saza, {taluka_name} ({dist_name})",
                        hashed_password=default_pwd_hash,
                        is_active=True,
                    )
                    db.add(talathi_user)
                    db.flush()
                    db.add(UserRoleJurisdiction(user_id=talathi_user.id, role_id=role_map["TALATHI"].id, jurisdiction_id=taluka_jur.id, is_active=True))

        # 7. Seed Demo Citizen
        citizen_user = db.query(User).filter(User.email == "citizen@example.com").first()
        if not citizen_user:
            citizen_user = User(
                full_name="Rajesh Patil (Landowner)",
                mobile_number="9876543210",
                email="citizen@example.com",
                is_active=True,
            )
            db.add(citizen_user)
            db.flush()
            db.add(UserRoleJurisdiction(user_id=citizen_user.id, role_id=role_map["CITIZEN"].id, jurisdiction_id=None, is_active=True))

        # 8. Seed sample Land Records & Acquisition cases if not present
        pune_jur = db.query(Jurisdiction).filter(Jurisdiction.name == "Pune", Jurisdiction.type == JurisdictionType.DISTRICT).first()
        if pune_jur:
            sample_rec = db.query(LandRecord).filter(LandRecord.survey_number == "101/1", LandRecord.jurisdiction_id == pune_jur.id).first()
            if not sample_rec:
                sample_rec = LandRecord(
                    survey_number="101/1",
                    owner_name="Rajesh Patil",
                    area_acres=3.5,
                    jurisdiction_id=pune_jur.id,
                )
                db.add(sample_rec)

            sample_case = db.query(AcquisitionCase).filter(AcquisitionCase.case_number == "CASE-PUN-001").first()
            if not sample_case:
                sample_case = AcquisitionCase(
                    case_number="CASE-PUN-001",
                    project_name="Pune Ring Road Phase 1",
                    status="IN_PROGRESS",
                    jurisdiction_id=pune_jur.id,
                )
                db.add(sample_case)

        db.commit()
        logger.info("NLAMS Database Seeding completed successfully with full Maharashtra Hierarchy!")
    except Exception as e:
        db.rollback()
        logger.error(f"Seeding failed: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
