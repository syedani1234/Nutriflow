from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.database import engine
from app.database.base import Base

# ==========================================================
# IMPORT ALL MODELS
# ==========================================================
# This ensures SQLAlchemy knows about every model before
# create_all() is executed.

import app.models

# ==========================================================
# IMPORT ROUTERS
# ==========================================================

from app.routes.auth import router as auth_router
from app.routes.nutrition import router as nutrition_router
from app.routes.food import router as food_router
from app.routes.meal_planner import router as meal_planner_router

# ==========================================================
# CREATE DATABASE TABLES
# ==========================================================

Base.metadata.create_all(bind=engine)

# ==========================================================
# FASTAPI APPLICATION
# ==========================================================

app = FastAPI(
    title="NutriFlow AI API",
    version="1.0.0",
    description=(
        "AI-powered nutrition and meal planning API "
        "with authentication, nutrition profiles, "
        "food database, calorie calculation, and "
        "personalized meal planning."
    ),
)

# ==========================================================
# CORS
# ==========================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],

    allow_credentials=True,

    allow_methods=[
        "*",
    ],

    allow_headers=[
        "*",
    ],
)

# ==========================================================
# ROUTES
# ==========================================================

# Authentication
app.include_router(
    auth_router
)

# Nutrition profiles
app.include_router(
    nutrition_router
)

# Food database
app.include_router(
    food_router
)

# Meal planning
app.include_router(
    meal_planner_router
)

# ==========================================================
# ROOT ENDPOINT
# ==========================================================

@app.get("/")
def root():
    return {
        "project": "NutriFlow AI",
        "status": "Running",
        "version": "1.0.0",
    }


# ==========================================================
# HEALTH CHECK
# ==========================================================

@app.get("/health")
def health():
    return {
        "status": "Healthy",
    }