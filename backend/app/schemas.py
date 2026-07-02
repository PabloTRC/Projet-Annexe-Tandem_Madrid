from datetime import datetime
from typing import Any, Optional

from pydantic import BaseModel, ConfigDict, EmailStr


# ---------- Professeur ----------

class ProfesseurCreate(BaseModel):
    nom: str
    email: EmailStr


class ProfesseurRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nom: str
    email: str
    created_at: datetime


# ---------- Eleve ----------

class EleveCreate(BaseModel):
    nom: str
    categorie: Optional[str] = None


class EleveRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nom: str
    categorie: Optional[str] = None
    created_at: datetime


# ---------- Cours ----------

class CoursCreate(BaseModel):
    professeur_id: int
    titre: str
    description: Optional[str] = None


class CoursRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    professeur_id: int
    titre: str
    description: Optional[str] = None
    created_at: datetime


class CoursFull(CoursRead):
    seances: list["SeanceRead"] = []


# ---------- Seance ----------

class SeanceCreate(BaseModel):
    cours_id: int
    date: datetime
    statut: Optional[str] = "planifiee"


class SeanceUpdate(BaseModel):
    date: Optional[datetime] = None
    statut: Optional[str] = None


class SeanceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    cours_id: int
    date: datetime
    statut: str
    created_at: datetime


class SeanceFull(SeanceRead):
    contenus: list["ContenuRead"] = []
    questions: list["QuestionRead"] = []
    syntheses_questions: list["SyntheseQuestionsRead"] = []
    syntheses_cours: list["SyntheseCoursRead"] = []


# ---------- Contenu ----------

class ContenuCreate(BaseModel):
    type: str
    donnees: Optional[dict[str, Any]] = None


class ContenuRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seance_id: int
    type: str
    donnees: Optional[dict[str, Any]] = None
    created_at: datetime


# ---------- Question ----------

class QuestionCreate(BaseModel):
    texte: str
    eleve_id: Optional[int] = None


class QuestionUpdate(BaseModel):
    categorie: Optional[str] = None


class QuestionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seance_id: int
    eleve_id: Optional[int] = None
    texte: str
    horodatage: datetime
    categorie: Optional[str] = None


# ---------- Synthese questions ----------

class SyntheseQuestionsCreate(BaseModel):
    texte_genere: str


class SyntheseQuestionsRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seance_id: int
    texte_genere: str
    horodatage: datetime


# ---------- Synthese cours ----------

class SyntheseCoursCreate(BaseModel):
    texte_genere: str


class SyntheseCoursRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    seance_id: int
    texte_genere: str
    horodatage: datetime


CoursFull.model_rebuild()
SeanceFull.model_rebuild()
