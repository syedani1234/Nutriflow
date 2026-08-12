from datetime import datetime

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    Integer,
    String,
    Text,
)

from app.database.base import Base


class Food(Base):
    __tablename__ = "foods"

    # ==========================================================
    # PRIMARY KEY
    # ==========================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True,
        autoincrement=True,
    )

    # ==========================================================
    # BASIC FOOD INFORMATION
    # ==========================================================

    name = Column(
        String(150),
        nullable=False,
        index=True,
    )

    category = Column(
        String(100),
        nullable=True,
        index=True,
    )

    description = Column(
        Text,
        nullable=True,
    )

    # ==========================================================
    # SERVING INFORMATION
    # ==========================================================

    serving_size = Column(
        Float,
        nullable=False,
        default=100,
    )

    serving_unit = Column(
        String(30),
        nullable=False,
        default="g",
    )

    # ==========================================================
    # NUTRITION INFORMATION
    # ==========================================================

    calories = Column(
        Float,
        nullable=False,
        default=0,
    )

    protein = Column(
        Float,
        nullable=False,
        default=0,
    )

    carbohydrates = Column(
        Float,
        nullable=False,
        default=0,
    )

    fat = Column(
        Float,
        nullable=False,
        default=0,
    )

    fiber = Column(
        Float,
        nullable=False,
        default=0,
    )

    # ==========================================================
    # STATUS
    # ==========================================================

    is_active = Column(
        Boolean,
        nullable=False,
        default=True,
    )

    # ==========================================================
    # TIMESTAMPS
    # ==========================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )