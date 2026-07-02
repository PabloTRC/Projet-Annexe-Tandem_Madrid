import os
import uuid

from fastapi import Depends, FastAPI, File, Form, HTTPException, UploadFile
from fastapi.responses import FileResponse
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload

from . import llm, models, schemas
from .database import get_db

# Dossier ou sont stockés les fichiers uploades (PDF, etc.). Jamais exposé en accès statique direct : tout téléchargement passe par l'endpoint dedié ci-dessous, qui vérifie d'abord que le contenu appartient bien a la séance.
UPLOAD_DIR = os.path.abspath(os.environ.get("UPLOAD_DIR", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Taille max acceptée par upload (10 Mo par defaut) - évite qu'un fichier énorme sature le disque ou la mémoire pendant la lecture.
MAX_UPLOAD_SIZE = int(os.environ.get("MAX_UPLOAD_SIZE_BYTES", 10 * 1024 * 1024))

app = FastAPI(title="Assistant de cours API")

def get_or_404(db: Session, model, obj_id: int, label: str):
    obj = db.get(model, obj_id)
    if obj is None:
        raise HTTPException(status_code=404, detail=f"{label} {obj_id} introuvable")
    return obj



# Professeurs


@app.post("/professeurs", response_model=schemas.ProfesseurRead, status_code=201)
def create_professeur(payload: schemas.ProfesseurCreate, db: Session = Depends(get_db)):
    professeur = models.Professeur(**payload.model_dump())
    db.add(professeur)
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=409, detail="Un compte existe deja avec cet email.")
    db.refresh(professeur)
    return professeur


@app.get("/professeurs", response_model=list[schemas.ProfesseurRead])
def list_professeurs(db: Session = Depends(get_db)):
    return db.query(models.Professeur).order_by(models.Professeur.id).all()


@app.get("/professeurs/{professeur_id}", response_model=schemas.ProfesseurRead)
def get_professeur(professeur_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, models.Professeur, professeur_id, "Professeur")



# Elèves


@app.post("/eleves", response_model=schemas.EleveRead, status_code=201)
def create_eleve(payload: schemas.EleveCreate, db: Session = Depends(get_db)):
    eleve = models.Eleve(**payload.model_dump())
    db.add(eleve)
    db.commit()
    db.refresh(eleve)
    return eleve


@app.get("/eleves", response_model=list[schemas.EleveRead])
def list_eleves(db: Session = Depends(get_db)):
    return db.query(models.Eleve).order_by(models.Eleve.id).all()


@app.get("/eleves/{eleve_id}", response_model=schemas.EleveRead)
def get_eleve(eleve_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, models.Eleve, eleve_id, "Eleve")



# Cours


@app.post("/cours", response_model=schemas.CoursRead, status_code=201)
def create_cours(payload: schemas.CoursCreate, db: Session = Depends(get_db)):
    get_or_404(db, models.Professeur, payload.professeur_id, "Professeur")
    cours = models.Cours(**payload.model_dump())
    db.add(cours)
    db.commit()
    db.refresh(cours)
    return cours


@app.get("/cours", response_model=list[schemas.CoursRead])
def list_cours(db: Session = Depends(get_db)):
    return db.query(models.Cours).order_by(models.Cours.id).all()


@app.get("/cours/{cours_id}", response_model=schemas.CoursRead)
def get_cours(cours_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, models.Cours, cours_id, "Cours")


@app.get("/cours/{cours_id}/full", response_model=schemas.CoursFull)
def get_cours_full(cours_id: int, db: Session = Depends(get_db)):
    cours = (
        db.query(models.Cours)
        .options(selectinload(models.Cours.seances))
        .filter(models.Cours.id == cours_id)
        .first()
    )
    if cours is None:
        raise HTTPException(status_code=404, detail=f"Cours {cours_id} introuvable")
    return cours



# Séances


@app.post("/seances", response_model=schemas.SeanceRead, status_code=201)
def create_seance(payload: schemas.SeanceCreate, db: Session = Depends(get_db)):
    get_or_404(db, models.Cours, payload.cours_id, "Cours")
    seance = models.Seance(**payload.model_dump())
    db.add(seance)
    db.commit()
    db.refresh(seance)
    return seance


@app.get("/seances/{seance_id}", response_model=schemas.SeanceRead)
def get_seance(seance_id: int, db: Session = Depends(get_db)):
    return get_or_404(db, models.Seance, seance_id, "Seance")


@app.patch("/seances/{seance_id}", response_model=schemas.SeanceRead)
def update_seance(seance_id: int, payload: schemas.SeanceUpdate, db: Session = Depends(get_db)):
    seance = get_or_404(db, models.Seance, seance_id, "Seance")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(seance, field, value)
    db.commit()
    db.refresh(seance)
    return seance


@app.get("/seances/{seance_id}/full", response_model=schemas.SeanceFull)
def get_seance_full(seance_id: int, db: Session = Depends(get_db)):
    seance = (
        db.query(models.Seance)
        .options(
            selectinload(models.Seance.contenus),
            selectinload(models.Seance.questions),
            selectinload(models.Seance.syntheses_questions),
            selectinload(models.Seance.syntheses_cours),
        )
        .filter(models.Seance.id == seance_id)
        .first()
    )
    if seance is None:
        raise HTTPException(status_code=404, detail=f"Seance {seance_id} introuvable")
    return seance


# Contenu


@app.post("/seances/{seance_id}/contenus", response_model=schemas.ContenuRead, status_code=201)
def create_contenu(seance_id: int, payload: schemas.ContenuCreate, db: Session = Depends(get_db)):
    get_or_404(db, models.Seance, seance_id, "Seance")
    contenu = models.Contenu(seance_id=seance_id, **payload.model_dump())
    db.add(contenu)
    db.commit()
    db.refresh(contenu)
    return contenu


@app.post("/seances/{seance_id}/contenus/upload",response_model=schemas.ContenuRead, status_code=201,
)
async def upload_contenu(
    seance_id: int,
    file: UploadFile = File(...),
    type: str = Form("fichier"),
    db: Session = Depends(get_db),
):
    """
    Upload direct d'un fichier (PDF, image, etc.) via l'API : crée un
    `contenu` dont `données` pointe vers le fichier sauvegarde sur le disque
    (dans UPLOAD_DIR). Alternative a POST /seances/{id}/contenus quand on a
    un vrai fichier à envoyer plutôt que du texte/JSON.
    """
    get_or_404(db, models.Seance, seance_id, "Seance")

    if not file.filename:
        raise HTTPException(status_code=400, detail="Nom de fichier manquant.")

    # Nom de fichier généré (uuid) pour le stockage sur disque : évite les
    # collisions entre deux uploads du même nom, et empêche tout problème de
    # path-traversal via un nom de fichier fourni par le client (on ne se
    # sert jamais du nom original pour construire un chemin sur le disque).
    extension = os.path.splitext(file.filename)[1]
    stored_name = f"{uuid.uuid4().hex}{extension}"
    destination = os.path.join(UPLOAD_DIR, stored_name)

    taille = 0
    try:
        with open(destination, "wb") as f:
            while chunk := await file.read(1024 * 1024):
                taille += len(chunk)
                if taille > MAX_UPLOAD_SIZE:
                    raise HTTPException(
                        status_code=413,
                        detail=f"Fichier trop volumineux (max {MAX_UPLOAD_SIZE // (1024 * 1024)} Mo).",
                    )
                f.write(chunk)
    except HTTPException:
        # Nettoyage du fichier partiellement écrit avant de remonter l'erreur.
        if os.path.exists(destination):
            os.remove(destination)
        raise
    finally:
        await file.close()

    contenu = models.Contenu(
        seance_id=seance_id,
        type=type,
        donnees={
            "file_path": stored_name,
            "file_name": file.filename,
            "content_type": file.content_type,
        },
    )
    db.add(contenu)
    db.commit()
    db.refresh(contenu)
    return contenu


@app.get("/seances/{seance_id}/contenus", response_model=list[schemas.ContenuRead])
def list_contenus(seance_id: int, db: Session = Depends(get_db)):
    get_or_404(db, models.Seance, seance_id, "Seance")
    return (
        db.query(models.Contenu)
        .filter(models.Contenu.seance_id == seance_id)
        .order_by(models.Contenu.id)
        .all()
    )


@app.get("/seances/{seance_id}/contenus/{contenu_id}/download")
def download_contenu(seance_id: int, contenu_id: int, db: Session = Depends(get_db)):
    """
    Permet à un élève (ou au prof) de télécharger le fichier associé à un
    contenu de type "fichier"/"pdf". `données` doit contenir un champ
    "file_path" (chemin relatif dans UPLOAD_DIR), et optionnellement
    "file_name" (nom affiche au téléchargement).
    """
    contenu = get_or_404(db, models.Contenu, contenu_id, "Contenu")

    # On vérifie que le contenu appartient bien à la séance passée dans l'URL,
    # pas seulement qu'il existe quelque part - sinon un élève pourrait deviner
    # un contenu_id d'une autre seance/cours auquel il n'a pas accès.
    if contenu.seance_id != seance_id:
        raise HTTPException(status_code=404, detail="Contenu introuvable pour cette seance")

    donnees = contenu.donnees or {}
    file_path = donnees.get("file_path")
    if not file_path:
        raise HTTPException(
            status_code=404,
            detail="Ce contenu n'a pas de fichier telechargeable (pas de file_path dans donnees).",
        )

    # file_path est toujours traité comme relatif a UPLOAD_DIR, même s'il
    # commence par "/" (os.path.join ignorerait sinon UPLOAD_DIR sur un chemin
    # absolu) : on retire les "/" de tête avant de joindre.
    file_path = file_path.lstrip("/")

    # Résout le chemin et vérifie qu'il reste bien à l'intérieur de UPLOAD_DIR
    # (protection contre un file_path malveillant du type "../../etc/passwd").
    full_path = os.path.normpath(os.path.join(UPLOAD_DIR, file_path))
    if os.path.commonpath([full_path, UPLOAD_DIR]) != UPLOAD_DIR:
        raise HTTPException(status_code=400, detail="Chemin de fichier invalide.")

    if not os.path.isfile(full_path):
        raise HTTPException(status_code=404, detail="Fichier introuvable sur le serveur.")

    file_name = donnees.get("file_name") or os.path.basename(full_path)
    return FileResponse(full_path, filename=file_name, media_type="application/octet-stream")



# Questions


@app.post("/seances/{seance_id}/questions", response_model=schemas.QuestionRead, status_code=201)
def create_question(seance_id: int, payload: schemas.QuestionCreate, db: Session = Depends(get_db)):
    get_or_404(db, models.Seance, seance_id, "Seance")
    if payload.eleve_id is not None:
        get_or_404(db, models.Eleve, payload.eleve_id, "Eleve")
    question = models.Question(seance_id=seance_id, **payload.model_dump())

    # Catégorisation automatique par le LLM. Best-effort : si Ollama n'est pas
    # joignable, on ne bloque pas la creation de la question, on la laisse
    # simplement sans categorie (categorie=None) pour l'instant.
    try:
        question.categorie = llm.categoriser_question(question.texte)
    except llm.OllamaUnavailableError:
        question.categorie = None

    db.add(question)
    db.commit()
    db.refresh(question)
    return question


@app.get("/seances/{seance_id}/questions", response_model=list[schemas.QuestionRead])
def list_questions(seance_id: int, db: Session = Depends(get_db)):
    get_or_404(db, models.Seance, seance_id, "Seance")
    return (
        db.query(models.Question)
        .filter(models.Question.seance_id == seance_id)
        .order_by(models.Question.id)
        .all()
    )


@app.patch("/questions/{question_id}", response_model=schemas.QuestionRead)
def update_question(question_id: int, payload: schemas.QuestionUpdate, db: Session = Depends(get_db)):
    """Utilisé par le pipeline LLM pour remplir `categorie` a posteriori."""
    question = get_or_404(db, models.Question, question_id, "Question")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(question, field, value)
    db.commit()
    db.refresh(question)
    return question


# ---------------------------------------------------------------------------
# Syntheses
# ---------------------------------------------------------------------------

@app.post(
    "/seances/{seance_id}/synthese-questions",
    response_model=schemas.SyntheseQuestionsRead,
    status_code=201,
)
def create_synthese_questions(
    seance_id: int, payload: schemas.SyntheseQuestionsCreate, db: Session = Depends(get_db)
):
    get_or_404(db, models.Seance, seance_id, "Seance")
    synthese = models.SyntheseQuestions(seance_id=seance_id, **payload.model_dump())
    db.add(synthese)
    db.commit()
    db.refresh(synthese)
    return synthese


@app.get(
    "/seances/{seance_id}/synthese-questions",
    response_model=list[schemas.SyntheseQuestionsRead],
)
def list_synthese_questions(seance_id: int, db: Session = Depends(get_db)):
    get_or_404(db, models.Seance, seance_id, "Seance")
    return (
        db.query(models.SyntheseQuestions)
        .filter(models.SyntheseQuestions.seance_id == seance_id)
        .order_by(models.SyntheseQuestions.id)
        .all()
    )


@app.post(
    "/seances/{seance_id}/synthese-questions/generer",
    response_model=schemas.SyntheseQuestionsRead,
    status_code=201,
)
def generer_synthese_questions(seance_id: int, db: Session = Depends(get_db)):
    """
    Declenche Ollama pour generer la synthese des questions de la seance
    (a partir de toutes les questions deja posees, avec leur categorie) et
    l'enregistre. Utilise pour le bouton "generer la synthese" cote prof.
    """
    get_or_404(db, models.Seance, seance_id, "Seance")
    questions = (
        db.query(models.Question)
        .filter(models.Question.seance_id == seance_id)
        .order_by(models.Question.id)
        .all()
    )
    questions_data = [{"texte": q.texte, "categorie": q.categorie} for q in questions]

    try:
        texte_genere = llm.generer_synthese_questions(questions_data)
    except llm.OllamaUnavailableError as exc:
        raise HTTPException(status_code=503, detail=f"Ollama indisponible : {exc}")

    synthese = models.SyntheseQuestions(seance_id=seance_id, texte_genere=texte_genere)
    db.add(synthese)
    db.commit()
    db.refresh(synthese)
    return synthese


@app.post(
    "/seances/{seance_id}/synthese-cours",
    response_model=schemas.SyntheseCoursRead,
    status_code=201,
)
def create_synthese_cours(
    seance_id: int, payload: schemas.SyntheseCoursCreate, db: Session = Depends(get_db)
):
    get_or_404(db, models.Seance, seance_id, "Seance")
    synthese = models.SyntheseCours(seance_id=seance_id, **payload.model_dump())
    db.add(synthese)
    db.commit()
    db.refresh(synthese)
    return synthese


@app.post(
    "/seances/{seance_id}/synthese-cours/generer",
    response_model=schemas.SyntheseCoursRead,
    status_code=201,
)
def generer_synthese_cours(seance_id: int, db: Session = Depends(get_db)):
    """
    Declenche Ollama pour generer la synthese du contenu de la seance
    (a partir de tous les contenus deja publies) et l'enregistre.
    """
    get_or_404(db, models.Seance, seance_id, "Seance")
    contenus = (
        db.query(models.Contenu)
        .filter(models.Contenu.seance_id == seance_id)
        .order_by(models.Contenu.id)
        .all()
    )
    contenus_data = [{"type": c.type, "donnees": c.donnees} for c in contenus]

    try:
        texte_genere = llm.generer_synthese_cours(contenus_data)
    except llm.OllamaUnavailableError as exc:
        raise HTTPException(status_code=503, detail=f"Ollama indisponible : {exc}")

    synthese = models.SyntheseCours(seance_id=seance_id, texte_genere=texte_genere)
    db.add(synthese)
    db.commit()
    db.refresh(synthese)
    return synthese


@app.get(
    "/seances/{seance_id}/synthese-cours",
    response_model=list[schemas.SyntheseCoursRead],
)
def list_synthese_cours(seance_id: int, db: Session = Depends(get_db)):
    get_or_404(db, models.Seance, seance_id, "Seance")
    return (
        db.query(models.SyntheseCours)
        .filter(models.SyntheseCours.seance_id == seance_id)
        .order_by(models.SyntheseCours.id)
        .all()
    )


@app.post("/seances/{seance_id}/questions/reduire")
def reduire_questions_seance(seance_id: int, db: Session = Depends(get_db)):
    """
    deduplique/reformule les questions d'une seance qui se ressemblent (meme reponse attendue), 
    via le LLM. 
    Contrairement à la version d'origine, travaille directement sur les questions deja en
    base (table `question`) plutot que sur un stockage en memoire separe.
    """
    get_or_404(db, models.Seance, seance_id, "Seance")
    questions = (
        db.query(models.Question)
        .filter(models.Question.seance_id == seance_id)
        .order_by(models.Question.id)
        .all()
    )
    if not questions:
        raise HTTPException(status_code=400, detail="Aucune question pour cette seance")

    try:
        questions_reduites = llm.reduire_questions([q.texte for q in questions])
    except llm.OllamaUnavailableError as exc:
        raise HTTPException(status_code=503, detail=f"Ollama indisponible : {exc}")

    return {"questions_reduites": questions_reduites}









