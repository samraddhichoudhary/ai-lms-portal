from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# This tells SQLite to create a database file named lms.db right here
DATABASE_URL = "sqlite:///lms.db"

# Create the engine connection
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

# Create a session factory to handle database operations (Add, Delete, Fetch)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class that our database tables will inherit from
Base = declarative_base()

# Helper function to get a database connection session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()