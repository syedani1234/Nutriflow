from sqlalchemy.orm import Session

from app.models.user import User
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token
)


# ==========================================================
# REGISTER USER
# ==========================================================

def register_user(
    db: Session,
    full_name: str,
    email: str,
    password: str
):
    # Check whether email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    if existing_user:
        return None

    # Hash password before storing it
    hashed_password = hash_password(password)

    user = User(
        full_name=full_name,
        email=email,
        password=hashed_password
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


# ==========================================================
# LOGIN USER
# ==========================================================

def login_user(
    db: Session,
    email: str,
    password: str
):
    # Find user by email
    user = (
        db.query(User)
        .filter(User.email == email)
        .first()
    )

    # User does not exist
    if not user:
        return None

    # Password is incorrect
    if not verify_password(password, user.password):
        return None

    # Create JWT access token
    access_token = create_access_token({
        "sub": str(user.id),
        "email": user.email
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }