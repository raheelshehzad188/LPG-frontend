"""
Lahore Property Guide — Database models & connection
properties table: id, title, location, price, size, beds, baths, type, status, roi_percentage
"""
import os
from sqlalchemy import create_engine, text, Column, Integer, String, Float, Boolean
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy.pool import StaticPool

Base = declarative_base()


class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, autoincrement=True)
    title = Column(String(255), nullable=False)
    location = Column(String(100), nullable=False)
    price = Column(Integer, nullable=False)  # rupees
    size = Column(String(50), nullable=True)   # e.g. "1 kanal", "5 marla"
    beds = Column(Integer, nullable=True)
    baths = Column(Integer, nullable=True)
    type = Column(String(50), nullable=False)  # plot, house
    status = Column(String(100), nullable=True)  # LDA approved, not
    roi_percentage = Column(Float, nullable=True)


def get_engine():
    """PostgreSQL ya SQLite — DATABASE_URL se"""
    url = os.getenv("DATABASE_URL", "sqlite:///./lpg.db")
    if url.startswith("sqlite"):
        return create_engine(url, connect_args={"check_same_thread": False}, poolclass=StaticPool)
    return create_engine(url)


engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_unique_locations(db) -> list[str]:
    """DB se sirf allowed locations list lo"""
    result = db.execute(text("SELECT DISTINCT location FROM properties ORDER BY location"))
    return [row[0] for row in result if row[0]]
