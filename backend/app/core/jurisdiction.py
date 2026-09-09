from typing import List, Optional, Any
from sqlalchemy.orm import Session, Query
from sqlalchemy import select
from app.models.jurisdiction import Jurisdiction, JurisdictionType
from app.models.user import User


def get_jurisdiction_subtree_ids(db: Session, root_jurisdiction_id: int) -> List[int]:
    """Retrieve all jurisdiction IDs within the subtree rooted at root_jurisdiction_id

    (e.g., District -> all its Talukas and Villages).
    Uses a recursive CTE for optimal database performance.
    """
    if not root_jurisdiction_id:
        return []

    # Base case: Root jurisdiction
    hierarchy_cte = (
        select(Jurisdiction.id)
        .where(Jurisdiction.id == root_jurisdiction_id)
        .cte(name="jurisdiction_subtree", recursive=True)
    )

    # Recursive step: Children whose parent_id matches any in hierarchy_cte
    children = select(Jurisdiction.id).join(
        hierarchy_cte, Jurisdiction.parent_id == hierarchy_cte.c.id
    )

    hierarchy_cte = hierarchy_cte.union_all(children)

    # Execute query
    result = db.scalars(select(hierarchy_cte.c.id)).all()
    return list(result)


def scope_query_to_jurisdiction(
    query: Query,
    user: User,
    db: Session,
    jurisdiction_column: Any,
) -> Query:
    """Narrows any SQLAlchemy query to the user's jurisdiction subtree.

    - Central Admin (National): sees all records across India.
    - State Admin (State): sees their state and all nested districts, talukas, villages.
    - District Collector / LAO / Surveyor (District): sees their district and all nested talukas and villages.
    - Tehsildar (Taluka): sees their taluka and all nested villages.
    - Talathi (Village): sees only their specific village.
    """
    active_role = getattr(user, "active_role", None)
    active_jurisdiction = getattr(user, "active_jurisdiction", None)

    # Central Admin with National scope sees everything
    if active_role and active_role.code == "CENTRAL_ADMIN" and (
        not active_jurisdiction or active_jurisdiction.type == JurisdictionType.NATIONAL
    ):
        return query

    if not active_jurisdiction:
        # If user has no assigned jurisdiction, return an empty set for safety
        return query.filter(jurisdiction_column.in_([]))

    # Fetch all descendant IDs in the user's jurisdiction tree
    subtree_ids = get_jurisdiction_subtree_ids(db, active_jurisdiction.id)

    if not subtree_ids:
        subtree_ids = [active_jurisdiction.id]

    return query.filter(jurisdiction_column.in_(subtree_ids))
