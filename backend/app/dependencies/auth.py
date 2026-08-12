from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.models.user import User
from app.utils.security import decode_access_token


oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


# ==========================================================
# DATABASE DEPENDENCY
# ==========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# ==========================================================
# GET CURRENT USER
# ==========================================================

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={
            "WWW-Authenticate": "Bearer"
        }
    )

    # Decode JWT
    payload = decode_access_token(token)

    if payload is None:
        raise credentials_exception

    # Get user ID from "sub"
    user_id = payload.get("sub")

    if user_id is None:
        raise credentials_exception

    # Find user in database
    user = (
        db.query(User)
        .filter(User.id == int(user_id))
        .first()
    )

    if user is None:
        raise credentials_exception

    return user