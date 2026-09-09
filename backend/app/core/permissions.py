from typing import Dict, Set, List
from fastapi import Depends, HTTPException, status
from app.models.user import User
from app.core.deps import get_current_user

# Resource × Action × Allowed Role Codes Matrix
# Derived from NLAMS Blueprint (Sections 5.1 & 5.2)
PERMISSIONS: Dict[str, Dict[str, Set[str]]] = {
    "own_land_record": {
        "view": {"CITIZEN"},
    },
    "village_land_register": {
        "view": {
            "SURVEYOR",
            "TALATHI",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
        "create": {"TALATHI"},
        "edit": {"TALATHI"},
    },
    "survey_boundary_data": {
        "view": {
            "SURVEYOR",
            "TALATHI",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
        "create": {"SURVEYOR"},
        "edit": {"SURVEYOR"},
    },
    "mutation_entries": {
        "view": {
            "TALATHI",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
        "create": {"TALATHI"},
        "edit": {"TALATHI"},
        "approve": {"TEHSILDAR"},
    },
    "encroachment_flags": {
        "view": {
            "SURVEYOR",
            "TALATHI",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
        "create": {"SURVEYOR"},
        "edit": {"TALATHI"},
        "approve": {"TEHSILDAR"},
    },
    "acquisition_case_file": {
        "view": {
            "CITIZEN",
            "TALATHI",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "PIA",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
        "create": {"LAO"},
        "edit": {"LAO"},
        "manage": {"LAO"},
        "approve": {"DIST_COLLECTOR"},
    },
    "notices": {
        "view": {
            "CITIZEN",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "PIA",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
        "create": {"LAO"},
    },
    "compensation_award": {
        "view": {
            "CITIZEN",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "PIA",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
        "create": {"LAO"},
        "edit": {"LAO"},
        "approve": {"DIST_COLLECTOR"},
    },
    "fund_deposit": {
        "view": {"LAO", "DIST_COLLECTOR", "STATE_ADMIN", "CENTRAL_ADMIN", "PIA"},
        "create": {"PIA"},
    },
    "possession_order": {
        "view": {
            "CITIZEN",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "PIA",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
        "create": {"DIST_COLLECTOR"},
        "edit": {"LAO"},
        "approve": {"DIST_COLLECTOR"},
    },
    "user_provisioning": {
        "view": {"STATE_ADMIN", "CENTRAL_ADMIN"},
        "create": {"STATE_ADMIN", "CENTRAL_ADMIN"},
        "manage": {"STATE_ADMIN", "CENTRAL_ADMIN"},
    },
    "audit_logs": {
        "view": {"DIST_COLLECTOR", "STATE_ADMIN", "CENTRAL_ADMIN"},
        "manage": {"CENTRAL_ADMIN"},
    },
    # 5.2 AI Features
    "location_intelligence": {
        "create": {
            "SURVEYOR",
            "TALATHI",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "PIA",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
        "view": {
            "SURVEYOR",
            "TALATHI",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "PIA",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
    },
    "project_status_rag": {
        "view": {
            "SURVEYOR",
            "TALATHI",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "PIA",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
        "trigger": {
            "SURVEYOR",
            "TALATHI",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "PIA",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
    },
    "regulatory_procedural_rag": {
        "view": {
            "CITIZEN",
            "SURVEYOR",
            "TALATHI",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "PIA",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
        "trigger": {
            "CITIZEN",
            "SURVEYOR",
            "TALATHI",
            "TEHSILDAR",
            "LAO",
            "DIST_COLLECTOR",
            "PIA",
            "STATE_ADMIN",
            "CENTRAL_ADMIN",
        },
    },
}


def require_permission(resource: str, action: str):
    """FastAPI dependency factory that verifies if the authenticated user's active role

    has permission to perform the specified action on the resource.
    """
    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        active_role = getattr(current_user, "active_role", None)
        if not active_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied: No active role found for user.",
            )

        role_code = active_role.code

        resource_perms = PERMISSIONS.get(resource)
        if not resource_perms:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied: Undefined permission resource '{resource}'.",
            )

        allowed_roles = resource_perms.get(action)
        if allowed_roles is None or role_code not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=(
                    f"Access denied: Role '{role_code}' does not have permission "
                    f"to perform '{action}' on '{resource}'."
                ),
            )

        return current_user

    return permission_checker
