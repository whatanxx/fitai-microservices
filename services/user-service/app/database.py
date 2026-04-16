import os
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL")

# Robust connection string builder for GCP/Local
if not DATABASE_URL:
    db_user = os.getenv("DB_USER", "postgres")
    db_pass = os.getenv("DB_PASSWORD")
    db_name = os.getenv("DB_NAME", "fitai_db")
    db_host = os.getenv("DB_HOST", "/cloudsql/gen-lang-client-0145356180:us-central1:fitai-instance")
    
    if db_pass:
        DATABASE_URL = f"postgresql+psycopg2://{db_user}:{db_pass}@/ {db_name}?host={db_host}"
    else:
        raise ValueError("Neither DATABASE_URL nor DB_PASSWORD environment variable is set!")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
