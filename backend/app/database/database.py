from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.config.settings import settings
from app.database.base import Base

DATABASE_URL = (
    f"mysql+pymysql://{settings.MYSQL_USER}:"
    f"{settings.MYSQL_PASSWORD}@"
    f"{settings.MYSQL_HOST}:"
    f"{settings.MYSQL_PORT}/"
    f"{settings.MYSQL_DATABASE}"
)

print("Database URL:", DATABASE_URL)

engine = create_engine(
    DATABASE_URL,
    echo=True,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

# Import all models AFTER Base is imported
from app.models import *

# Create all tables
Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()