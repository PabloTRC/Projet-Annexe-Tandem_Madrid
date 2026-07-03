"""
Modeles SQLAlchemy calques sur le schema cree par les migrations Alembic
(db/versions/0001_initial_schema.py + 0002_seance_model.py).

Ces modeles ne creent PAS les tables (pas de Base.metadata.create_all) :
la structure de la base est geree exclusivement par Alembic, cote db/.
"""
from sqlalchemy import Column, ForeignKey, Integer, String, Text, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from .database import Base


class Professeur(Base):
    __tablename__ = "professeur"

    id = Column(Integer, primary_key=True)
    nom = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    cours = relationship("Cours", back_populates="professeur", cascade="all, delete-orphan")


class Eleve(Base):
    __tablename__ = "eleve"

    id = Column(Integer, primary_key=True)
    nom = Column(String(255), nullable=False)
    categorie = Column(String(50), nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    inscriptions = relationship("Inscription", back_populates="eleve", cascade="all, delete-orphan")


class Cours(Base):
    __tablename__ = "cours"

    id = Column(Integer, primary_key=True)
    professeur_id = Column(Integer, ForeignKey("professeur.id", ondelete="CASCADE"), nullable=False)
    titre = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    professeur = relationship("Professeur", back_populates="cours")
    seances = relationship("Seance", back_populates="cours", cascade="all, delete-orphan")
    inscriptions = relationship("Inscription", back_populates="cours", cascade="all, delete-orphan")


class Inscription(Base):
    """Lien eleve <-> cours : inscription/desinscription d'un eleve dans une
    classe, gerée par le professeur."""

    __tablename__ = "inscription"

    id = Column(Integer, primary_key=True)
    eleve_id = Column(Integer, ForeignKey("eleve.id", ondelete="CASCADE"), nullable=False)
    cours_id = Column(Integer, ForeignKey("cours.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    eleve = relationship("Eleve", back_populates="inscriptions")
    cours = relationship("Cours", back_populates="inscriptions")


class Seance(Base):
    __tablename__ = "seance"

    id = Column(Integer, primary_key=True)
    cours_id = Column(Integer, ForeignKey("cours.id", ondelete="CASCADE"), nullable=False)
    date = Column(TIMESTAMP(timezone=True), nullable=False)
    statut = Column(String(50), nullable=False, server_default="planifiee")
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    cours = relationship("Cours", back_populates="seances")
    contenus = relationship("Contenu", back_populates="seance", cascade="all, delete-orphan")
    questions = relationship("Question", back_populates="seance", cascade="all, delete-orphan")
    syntheses_questions = relationship(
        "SyntheseQuestions", back_populates="seance", cascade="all, delete-orphan"
    )
    syntheses_cours = relationship(
        "SyntheseCours", back_populates="seance", cascade="all, delete-orphan"
    )
    presences = relationship("Presence", back_populates="seance", cascade="all, delete-orphan")


class Presence(Base):
    """Suivi de presence "en direct" d'un eleve sur une seance : pas de
    websocket, le frontend eleve envoie un heartbeat periodique (toutes les
    quelques secondes) qui met a jour `derniere_activite`. Le professeur
    considere un eleve "en ligne" si son heartbeat est recent."""

    __tablename__ = "presence"

    id = Column(Integer, primary_key=True)
    eleve_id = Column(Integer, ForeignKey("eleve.id", ondelete="CASCADE"), nullable=False)
    seance_id = Column(Integer, ForeignKey("seance.id", ondelete="CASCADE"), nullable=False)
    derniere_activite = Column(TIMESTAMP(timezone=True), server_default=func.now())

    eleve = relationship("Eleve")
    seance = relationship("Seance", back_populates="presences")


class Contenu(Base):
    __tablename__ = "contenu"

    id = Column(Integer, primary_key=True)
    seance_id = Column(Integer, ForeignKey("seance.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)
    donnees = Column(JSONB, nullable=True)
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())

    seance = relationship("Seance", back_populates="contenus")


class Question(Base):
    __tablename__ = "question"

    id = Column(Integer, primary_key=True)
    seance_id = Column(Integer, ForeignKey("seance.id", ondelete="CASCADE"), nullable=False)
    eleve_id = Column(Integer, ForeignKey("eleve.id", ondelete="SET NULL"), nullable=True)
    texte = Column(Text, nullable=False)
    horodatage = Column(TIMESTAMP(timezone=True), server_default=func.now())
    categorie = Column(String(50), nullable=True)

    seance = relationship("Seance", back_populates="questions")
    eleve = relationship("Eleve")


class SyntheseQuestions(Base):
    __tablename__ = "synthese_questions"

    id = Column(Integer, primary_key=True)
    seance_id = Column(Integer, ForeignKey("seance.id", ondelete="CASCADE"), nullable=False)
    texte_genere = Column(Text, nullable=False)
    horodatage = Column(TIMESTAMP(timezone=True), server_default=func.now())

    seance = relationship("Seance", back_populates="syntheses_questions")


class SyntheseCours(Base):
    __tablename__ = "synthese_cours"

    id = Column(Integer, primary_key=True)
    seance_id = Column(Integer, ForeignKey("seance.id", ondelete="CASCADE"), nullable=False)
    texte_genere = Column(Text, nullable=False)
    horodatage = Column(TIMESTAMP(timezone=True), server_default=func.now())

    seance = relationship("Seance", back_populates="syntheses_cours")
