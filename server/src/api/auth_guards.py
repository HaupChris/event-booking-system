"""Role-based authorization for API routes, based on the JWT `role` claim.

- `protect_blueprint(bp, "admin")` protects every route of a blueprint (secure by default).
- `@roles_required("user", "admin")` protects a single route.
"""

from collections.abc import Callable
from functools import wraps
from typing import Any

from flask import Blueprint, request
from flask_jwt_extended import get_jwt, verify_jwt_in_request

from src.utils.logger import log_security_event

ForbiddenResponse = tuple[dict[str, str], int]


def _check_roles(allowed_roles: tuple[str, ...]) -> ForbiddenResponse | None:
    """Raise 401 for a missing/invalid token, return a 403 response for a wrong role."""
    verify_jwt_in_request()
    role = get_jwt().get("role")
    if role in allowed_roles:
        return None

    log_security_event(
        "UNAUTHORIZED_ROLE",
        {"endpoint": request.endpoint, "role": role, "allowed_roles": list(allowed_roles)},
    )
    return {"msg": "Unauthorized"}, 403


def roles_required(*allowed_roles: str) -> Callable:
    def decorator(view: Callable) -> Callable:
        @wraps(view)
        def wrapper(*args: Any, **kwargs: Any) -> Any:
            return _check_roles(allowed_roles) or view(*args, **kwargs)

        return wrapper

    return decorator


def protect_blueprint(blueprint: Blueprint, *allowed_roles: str) -> None:
    @blueprint.before_request
    def require_roles() -> ForbiddenResponse | None:
        if request.method == "OPTIONS":  # CORS preflight carries no token
            return None
        return _check_roles(allowed_roles)
