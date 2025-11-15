ROLE_ADMIN = "admin"
ROLE_HR = "hr"
ROLE_CANDIDATE = "candidate"

ALL_ROLES = (ROLE_ADMIN, ROLE_HR, ROLE_CANDIDATE)

ROLE_LABELS = {
    ROLE_ADMIN: "Administrator",
    ROLE_HR: "HR Manager",
    ROLE_CANDIDATE: "Candidate",
}


def is_valid_role(value: str) -> bool:
    """Return True when the supplied role exists in the system."""
    return value in ALL_ROLES
