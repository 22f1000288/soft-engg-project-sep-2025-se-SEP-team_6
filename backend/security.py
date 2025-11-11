import os
from datetime import datetime, timedelta
from typing import Any, Dict

import jwt
from jwt import PyJWTError

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me")
JWT_REFRESH_SECRET_KEY = os.getenv("JWT_REFRESH_SECRET_KEY", JWT_SECRET_KEY)
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", str(60 * 24 * 7))
)


class TokenValidationError(Exception):
    """Raised when a JWT cannot be validated."""


def _create_token(
    payload: Dict[str, Any], expires_delta: timedelta, secret_key: str
) -> str:
    to_encode = payload.copy()
    expire = datetime.utcnow() + expires_delta
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, secret_key, algorithm=JWT_ALGORITHM)


def create_access_token(subject: str, role: str) -> str:
    """Return a signed access token for the provided principal."""
    payload = {"sub": subject, "role": role, "type": "access"}
    return _create_token(
        payload, timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES), JWT_SECRET_KEY
    )


def create_refresh_token(subject: str, role: str) -> str:
    """Return a signed refresh token for the provided principal."""
    payload = {"sub": subject, "role": role, "type": "refresh"}
    return _create_token(
        payload, timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES), JWT_REFRESH_SECRET_KEY
    )


def _decode_token(token: str, expected_type: str, secret_key: str) -> Dict[str, Any]:
    try:
        payload = jwt.decode(token, secret_key, algorithms=[JWT_ALGORITHM])
    except PyJWTError as exc:
        raise TokenValidationError("Invalid token") from exc

    token_type = payload.get("type")
    if token_type != expected_type:
        raise TokenValidationError(f"Expected {expected_type} token, got {token_type}")
    return payload


def decode_access_token(token: str) -> Dict[str, Any]:
    return _decode_token(token, "access", JWT_SECRET_KEY)


def decode_refresh_token(token: str) -> Dict[str, Any]:
    return _decode_token(token, "refresh", JWT_REFRESH_SECRET_KEY)
