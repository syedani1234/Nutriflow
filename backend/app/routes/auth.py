from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.orm import Session

from app.database.database import SessionLocal
from app.schemas.auth_schema import RegisterRequest
from app.services.auth_service import (
    register_user,
    login_user
)

from app.dependencies.auth import get_current_user


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
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
# REGISTER
# ==========================================================

@router.post("/register")
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):
    user = register_user(
        db=db,
        full_name=request.full_name,
        email=request.email,
        password=request.password
    )

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    return {
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    }


# ==========================================================
# LOGIN
# ==========================================================

@router.post("/login")
def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    result = login_user(
        db=db,
        email=form_data.username,
        password=form_data.password
    )

    if result is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={
                "WWW-Authenticate": "Bearer"
            }
        )

    user = result["user"]

    return {
        "access_token": result["access_token"],
        "token_type": result["token_type"],
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email
        }
    }


# ==========================================================
# CURRENT USER
# ==========================================================

@router.get("/me")
def get_me(
    current_user = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email
    }