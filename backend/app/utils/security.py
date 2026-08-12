from datetime import datetime, timedelta, timezone

from jose import jwt, JWTError
from passlib.context import CryptContext

from app.config.settings import settings


# ==========================================================
# PASSWORD HASHING
# ==========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        password,
        hashed_password
    )


# ==========================================================
# CREATE JWT ACCESS TOKEN
# ==========================================================

def create_access_token(data: dict) -> str:

    payload = data.copy()

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    )

    payload.update({
        "exp": expire
    })

    return jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )


# ==========================================================
# DECODE JWT ACCESS TOKEN
# ==========================================================

def decode_access_token(token: str):

    try:

        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[
                settings.JWT_ALGORITHM
            ]
        )

        return payload

    except JWTError:
        return None