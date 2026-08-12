from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Float,
    DateTime,
    ForeignKey,
    Text
)

from app.database.base import Base


class NutritionProfile(Base):
    __tablename__ = "nutrition_profiles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    # ======================================================
    # BASIC INFORMATION
    # ======================================================

    age = Column(
        Integer,
        nullable=False
    )

    gender = Column(
        String(20),
        nullable=False
    )

    # ======================================================
    # BODY INFORMATION
    # ======================================================

    height_cm = Column(
        Float,
        nullable=False
    )

    weight_kg = Column(
        Float,
        nullable=False
    )

    # ======================================================
    # FITNESS / ACTIVITY
    # ======================================================

    activity_level = Column(
        String(30),
        nullable=False
    )

    goal = Column(
        String(30),
        nullable=False
    )

    # ======================================================
    # DIETARY INFORMATION
    # ======================================================

    dietary_preference = Column(
        String(50),
        nullable=True
    )

    allergies = Column(
        Text,
        nullable=True
    )

    # ======================================================
    # TIMESTAMPS
    # ======================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )