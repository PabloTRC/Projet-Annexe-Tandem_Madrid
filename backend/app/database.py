import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL n'est pas défini. Crée un fichier .env dans backend/app/ "
        "(ou backend/) avec DATABASE_URL=postgresql://user:pass@localhost:PORT/dbname"
    )

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()
def get_db():
    """Dependency FastAPI : fournit une session DB et la ferme après la requete"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()