"""
Database Initialization & Connection Management for AiVoA PharmaQMS.
Supports PostgreSQL (via psycopg2) and SQLite for standalone execution.
"""

import os
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
from database.models import Base

logger = logging.getLogger("DatabaseInit")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./pharma_qms.db")

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
    echo=False
)

SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def init_db():
    """Create tables in the database if they do not exist."""
    try:
        Base.metadata.create_all(bind=engine)
        logger.info("Database tables initialized successfully.")
    except Exception as e:
        logger.error(f"Error initializing database tables: {e}")
        raise e

def get_db():
    """Dependency for FastAPI route handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
