"""
DB tables create karo + sample data (SQLite dev ke liye)
Run: python init_db.py
"""
import os
from database import engine, Base
from sqlalchemy import text

# Create tables
Base.metadata.create_all(bind=engine)

# Sample data (SQLite dev)
db_url = os.getenv("DATABASE_URL", "sqlite:///./lpg.db")
if "sqlite" in db_url:
    with engine.connect() as conn:
        conn.execute(text("DELETE FROM properties"))
        conn.execute(text("""
            INSERT INTO properties (title, location, price, size, beds, baths, type, status, roi_percentage)
            VALUES
            ('1 Kanal Plot DHA 9', 'DHA 9', 25000000, '1 kanal', NULL, NULL, 'plot', 'LDA approved', 12.5),
            ('5 Marla Plot Gulberg', 'Gulberg', 15000000, '5 marla', NULL, NULL, 'plot', 'LDA approved', 10.2),
            ('3 Bed House Bahria', 'Bahria', 18000000, '1 kanal', 3, 3, 'house', 'LDA approved', 8.5),
            ('2 Kanal Plot DHA 9', 'DHA 9', 45000000, '2 kanal', NULL, NULL, 'plot', 'not', 11.0),
            ('8 Marla Plot LSC', 'LSC', 8000000, '8 marla', NULL, NULL, 'plot', 'LDA approved', 9.0)
        """))
        conn.commit()
    print("DB initialized with sample properties.")
