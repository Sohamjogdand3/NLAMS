import logging
from app.db.session import SessionLocal
from app.models.role import Role
from app.models.jurisdiction import Jurisdiction, JurisdictionType
from app.models.user import User
from app.models.user_role_jurisdiction import UserRoleJurisdiction
from app.models.land_record import LandRecord
from app.models.acquisition_case import AcquisitionCase
from app.core.security import hash_password

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

FIXED_ROLES = [
    {
        "name": "Citizen",
        "code": "CITIZEN",
        "description": "Land owner / General Citizen with view access to own records and acquisition status",
    },
    {
        "name": "Surveyor",
        "code": "SURVEYOR",
        "description": "Field Surveyor responsible for GPS cadastral mapping, boundary surveys, and verification",
    },
    {
        "name": "Talathi",
        "code": "TALATHI",
        "description": "Village Revenue Official handling 7/12 land records, mutation entries, and field inquiries",
    },
    {
        "name": "Tehsildar",
        "code": "TEHSILDAR",
        "description": "Taluka Executive Magistrate approving mutations, hearing objections, and taluka administration",
    },
    {
        "name": "Land Acquisition Officer",
        "code": "LAO",
        "description": "Competent Authority managing acquisition cases, Section 4/6/11 notices, hearings, and awards",
    },
    {
        "name": "District Collector",
        "code": "DIST_COLLECTOR",
        "description": "District Collector approving final awards, possession orders, and district-wide oversight",
    },
    {
        "name": "Project Implementing Agency",
        "code": "PIA",
        "description": "Project Agency (e.g. NHAI, Railways, CIDCO) submitting acquisition proposals and depositing funds",
    },
    {
        "name": "State Admin",
        "code": "STATE_ADMIN",
        "description": "State Land Revenue Administrator managing district officials, policy configurations, and state MIS",
    },
    {
        "name": "Central Admin",
        "code": "CENTRAL_ADMIN",
        "description": "National System Administrator overseeing state integrations, AI services, and global audit logs",
    },
]


def seed_database():
    db = SessionLocal()
    try:
        logger.info("Starting database seeding...")

        # 1. Seed Roles
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
                logger.info(f"Created role: {role.code} - {role.name}")
            else:
                logger.info(f"Role already exists: {role.code}")
            role_map[role.code] = role

        # 2. Seed Jurisdiction Hierarchy
        # National: India
        india = db.query(Jurisdiction).filter(Jurisdiction.code == "IN").first()
        if not india:
            india = Jurisdiction(name="India", type=JurisdictionType.NATIONAL, code="IN")
            db.add(india)
            db.flush()

        # State: Maharashtra
        mh = db.query(Jurisdiction).filter(Jurisdiction.code == "MH").first()
        if not mh:
            mh = Jurisdiction(name="Maharashtra", type=JurisdictionType.STATE, code="MH", parent_id=india.id)
            db.add(mh)
            db.flush()

        # District 1: Pune
        pune = db.query(Jurisdiction).filter(Jurisdiction.code == "PUN").first()
        if not pune:
            pune = Jurisdiction(name="Pune", type=JurisdictionType.DISTRICT, code="PUN", parent_id=mh.id)
            db.add(pune)
            db.flush()

        # Taluka 1.1: Haveli (under Pune)
        haveli = db.query(Jurisdiction).filter(Jurisdiction.code == "HVL").first()
        if not haveli:
            haveli = Jurisdiction(name="Haveli", type=JurisdictionType.TALUKA, code="HVL", parent_id=pune.id)
            db.add(haveli)
            db.flush()

        # Village 1.1.1: Wagholi (under Haveli)
        wagholi = db.query(Jurisdiction).filter(Jurisdiction.code == "WAG").first()
        if not wagholi:
            wagholi = Jurisdiction(name="Wagholi", type=JurisdictionType.VILLAGE, code="WAG", parent_id=haveli.id)
            db.add(wagholi)
            db.flush()

        # Taluka 1.2: Baramati (under Pune)
        baramati = db.query(Jurisdiction).filter(Jurisdiction.code == "BRM").first()
        if not baramati:
            baramati = Jurisdiction(name="Baramati", type=JurisdictionType.TALUKA, code="BRM", parent_id=pune.id)
            db.add(baramati)
            db.flush()

        # Village 1.2.1: Baramati Rural (under Baramati)
        baramati_rural = db.query(Jurisdiction).filter(Jurisdiction.code == "BRMR").first()
        if not baramati_rural:
            baramati_rural = Jurisdiction(name="Baramati Rural", type=JurisdictionType.VILLAGE, code="BRMR", parent_id=baramati.id)
            db.add(baramati_rural)
            db.flush()

        # District 2: Thane (outside Pune)
        thane = db.query(Jurisdiction).filter(Jurisdiction.code == "THA").first()
        if not thane:
            thane = Jurisdiction(name="Thane", type=JurisdictionType.DISTRICT, code="THA", parent_id=mh.id)
            db.add(thane)
            db.flush()

        # Taluka 2.1: Kalyan (under Thane)
        kalyan = db.query(Jurisdiction).filter(Jurisdiction.code == "KLN").first()
        if not kalyan:
            kalyan = Jurisdiction(name="Kalyan", type=JurisdictionType.TALUKA, code="KLN", parent_id=thane.id)
            db.add(kalyan)
            db.flush()

        # Village 2.1.1: Dombivli Rural (under Kalyan)
        dombivli = db.query(Jurisdiction).filter(Jurisdiction.code == "DOMB").first()
        if not dombivli:
            dombivli = Jurisdiction(name="Dombivli Rural", type=JurisdictionType.VILLAGE, code="DOMB", parent_id=kalyan.id)
            db.add(dombivli)
            db.flush()

        # 3. Seed Users & Assign Roles
        default_pwd_hash = hash_password("Password@123")

        # Citizen User (Wagholi village)
        citizen_user = db.query(User).filter(User.mobile_number == "9876543210").first()
        if not citizen_user:
            citizen_user = User(
                full_name="Ramesh Patil",
                mobile_number="9876543210",
                email="ramesh.patil@example.com",
                is_active=True,
            )
            db.add(citizen_user)
            db.flush()

            urj = UserRoleJurisdiction(
                user_id=citizen_user.id,
                role_id=role_map["CITIZEN"].id,
                jurisdiction_id=wagholi.id,
                is_active=True,
            )
            db.add(urj)

        # Official Users
        officials = [
            ("Arun Deshmukh", "LAO-101", "9876543211", "lao.pune@nlams.gov.in", "LAO", pune.id),
            ("Priya Sharma", "COLL-101", "9876543212", "collector.pune@nlams.gov.in", "DIST_COLLECTOR", pune.id),
            ("Suresh Kulkarni", "TEH-101", "9876543213", "tehsildar.haveli@nlams.gov.in", "TEHSILDAR", haveli.id),
            ("Vikas Shinde", "TAL-101", "9876543214", "talathi.wagholi@nlams.gov.in", "TALATHI", wagholi.id),
            ("Sachin Gaikwad", "SUR-101", "9876543215", "surveyor.pune@nlams.gov.in", "SURVEYOR", pune.id),
            ("NHAI Project Director", "PIA-101", "9876543216", "pia.nhai@nlams.gov.in", "PIA", mh.id),
            ("Rajesh Joshi", "SADM-101", "9876543217", "admin.mh@nlams.gov.in", "STATE_ADMIN", mh.id),
            ("Amit Verma", "CADM-101", "9876543218", "admin.national@nlams.gov.in", "CENTRAL_ADMIN", india.id),
            # Thane Talathi for cross-jurisdiction testing
            ("Ganesh Kadam", "TAL-THA-101", "9876543219", "talathi.dombivli@nlams.gov.in", "TALATHI", dombivli.id),
        ]

        for name, emp_id, mobile, email, role_code, jur_id in officials:
            official = db.query(User).filter(User.emp_id == emp_id).first()
            if not official:
                official = User(
                    full_name=name,
                    emp_id=emp_id,
                    mobile_number=mobile,
                    email=email,
                    hashed_password=default_pwd_hash,
                    is_active=True,
                )
                db.add(official)
                db.flush()

                urj = UserRoleJurisdiction(
                    user_id=official.id,
                    role_id=role_map[role_code].id,
                    jurisdiction_id=jur_id,
                    is_active=True,
                )
                db.add(urj)

        # 4. Seed Land Records across Jurisdictions
        land_records = [
            ("101/1", "Ramesh Patil", 2.5, wagholi.id),
            ("101/2", "Sunil Deshmukh", 1.8, wagholi.id),
            ("55/2", "Sanjay Pawar", 5.0, baramati_rural.id),
            ("302/A", "Ganesh More", 3.2, dombivli.id),
        ]

        for survey, owner, area, jur_id in land_records:
            rec = db.query(LandRecord).filter(LandRecord.survey_number == survey, LandRecord.jurisdiction_id == jur_id).first()
            if not rec:
                rec = LandRecord(
                    survey_number=survey,
                    owner_name=owner,
                    area_acres=area,
                    jurisdiction_id=jur_id,
                )
                db.add(rec)

        # 5. Seed Acquisition Cases across Jurisdictions
        cases = [
            ("CASE-PUN-001", "Pune Ring Road Phase 1", "IN_PROGRESS", pune.id),
            ("CASE-WAG-002", "Wagholi Metro Extension", "HEARING", wagholi.id),
            ("CASE-BRM-003", "Baramati Industrial Corridor", "SURVEY", baramati.id),
            ("CASE-THA-001", "Thane Coastal Highway", "SECTION_4_ISSUED", thane.id),
        ]

        for case_no, proj_name, status_str, jur_id in cases:
            c = db.query(AcquisitionCase).filter(AcquisitionCase.case_number == case_no).first()
            if not c:
                c = AcquisitionCase(
                    case_number=case_no,
                    project_name=proj_name,
                    status=status_str,
                    jurisdiction_id=jur_id,
                )
                db.add(c)

        db.commit()
        logger.info("Database seeding completed successfully!")
    except Exception as e:
        db.rollback()
        logger.error(f"Seeding failed: {str(e)}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
