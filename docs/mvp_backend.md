# Assistant de cours — Plan MVP Backend

> Mise à jour : le modèle de données initial (cours/chapitres/ressources avec
> accès public par lien) a été abandonné au profit d'un modèle centré sur la
> **séance en direct** : un prof anime une séance, les élèves posent des
> questions en temps réel, un LLM local (Ollama / llama3.1) catégorise ces
> questions et génère des synthèses. Ce document reflète l'état actuel.

Périmètre MVP retenu : gestion de séances de cours en direct, questions
élèves catégorisées par LLM, synthèses générées automatiquement.
Un compte "prof" minimal existe (sans auth complète) pour rattacher les
cours à quelqu'un. Pas de compte élève (les questions peuvent être
anonymes, `eleve_id` est optionnel).

## 1. Schéma Postgres (actuel)

Géré par Alembic, deux migrations chaînées :
- `0001_initial_schema.py` : ancien schéma (professors/classes/students/courses/chapters/resources), conservé dans l'historique
- `0002_seance_model.py` : supprime l'ancien schéma et crée le modèle actuel

```sql
CREATE TABLE professeur (
    id            SERIAL PRIMARY KEY,
    nom           VARCHAR(255) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE eleve (
    id            SERIAL PRIMARY KEY,
    nom           VARCHAR(255) NOT NULL,
    categorie     VARCHAR(50),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cours (
    id            SERIAL PRIMARY KEY,
    professeur_id INTEGER NOT NULL REFERENCES professeur(id) ON DELETE CASCADE,
    titre         VARCHAR(255) NOT NULL,
    description   TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE seance (
    id            SERIAL PRIMARY KEY,
    cours_id      INTEGER NOT NULL REFERENCES cours(id) ON DELETE CASCADE,
    date          TIMESTAMPTZ NOT NULL,
    statut        VARCHAR(50) NOT NULL DEFAULT 'planifiee',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Contenu diffuse pendant la seance (slide, pdf, note...). `donnees` est du
-- JSONB : structure libre selon `type` (ex: {"file_path": "...", "file_name": "..."}
-- pour un fichier telechargeable).
CREATE TABLE contenu (
    id            SERIAL PRIMARY KEY,
    seance_id     INTEGER NOT NULL REFERENCES seance(id) ON DELETE CASCADE,
    type          VARCHAR(50) NOT NULL,
    donnees       JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- `categorie` est remplie automatiquement par le LLM a la creation
-- (cours_precedent / elementaire / approfondie).
CREATE TABLE question (
    id            SERIAL PRIMARY KEY,
    seance_id     INTEGER NOT NULL REFERENCES seance(id) ON DELETE CASCADE,
    eleve_id      INTEGER REFERENCES eleve(id) ON DELETE SET NULL,
    texte         TEXT NOT NULL,
    horodatage    TIMESTAMPTZ NOT NULL DEFAULT now(),
    categorie     VARCHAR(50)
);

CREATE TABLE synthese_questions (
    id            SERIAL PRIMARY KEY,
    seance_id     INTEGER NOT NULL REFERENCES seance(id) ON DELETE CASCADE,
    texte_genere  TEXT NOT NULL,
    horodatage    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE synthese_cours (
    id            SERIAL PRIMARY KEY,
    seance_id     INTEGER NOT NULL REFERENCES seance(id) ON DELETE CASCADE,
    texte_genere  TEXT NOT NULL,
    horodatage    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

Points à retenir :
- Toutes les FK sont en `ON DELETE CASCADE`, sauf `question.eleve_id` en
  `ON DELETE SET NULL` (on garde la question meme si l'eleve est supprime)
- Pas de `RESTRICT` dans ce schema : choix assume pour le MVP (voir
  `db/tests_manuels_contraintes.md` pour le detail de l'audit)
- `contenu.donnees` en JSONB permet de stocker des structures differentes
  selon `type` sans avoir a faire evoluer le schema a chaque nouveau format

## 2. Docker / infra

- `docker-compose.yml` (racine `backend/`) : service `postgres` (image
  `postgres:16`), volume persistant `pgdata`, port hote `5433` (le `5432`
  standard etait deja pris en local)
- `.env` / `.env.example` a la racine (`POSTGRES_USER`, `POSTGRES_PASSWORD`,
  `POSTGRES_DB`) et dans `db/` (`DATABASE_URL`) et dans `backend/`
  (`DATABASE_URL` pour l'app FastAPI, `OLLAMA_MODEL` optionnel)

## 3. Migrations & seed (`db/`)

- Alembic configure dans `db/` (`alembic.ini`, `env.py`, `versions/`)
- `alembic upgrade head` applique `0001` puis `0002`
- `reset_demo.py` : vide et remplit la base avec un jeu de donnees de demo
  (3 cours dans 3 etats differents, eleves, inscriptions, contenus, questions
  deja categorisees "a la main" (simulation), syntheses)
- `tests_manuels_contraintes.md` : plan de tests manuels (cascade delete,
  unicite email, integrite referentielle) — deja valides au niveau SQL

## 4. API FastAPI (`app/`)

- `database.py` : session SQLAlchemy, lecture de `DATABASE_URL`
- `models.py` : modeles ORM calques sur le schema (aucune creation de table
  cote SQLAlchemy — la structure est geree exclusivement par Alembic)
- `schemas.py` : schemas Pydantic Create/Read/Update/Full par entite
- `main.py` : 30+ routes

Endpoints principaux :
- CRUD `professeur` / `eleve` / `cours` / `seance`
- `GET /cours/{id}/full`, `GET /seances/{id}/full` : vues composites
  (preloading via `selectinload`, une seule requete groupee)
- `POST/GET /seances/{id}/contenus`
- `GET /seances/{id}/contenus/{id}/download` : telechargement securise
  (verification appartenance seance, protection anti path-traversal,
  jamais servi en acces statique direct)
- `POST /seances/{id}/contenus/upload` : upload direct d'un fichier
  (multipart/form-data) — sauvegarde sous un nom genere (`uuid4`, pas le nom
  original) pour eviter collisions et path-traversal, limite de taille
  configurable (`MAX_UPLOAD_SIZE_BYTES`, 10 Mo par defaut), nettoyage
  automatique si la limite est depassee en cours d'ecriture
- `POST/GET /seances/{id}/questions`, `PATCH /questions/{id}`
- `POST/GET /seances/{id}/synthese-questions` et `/synthese-cours`
- Gestion d'erreurs : `404` sur entite manquante, `409 Conflict` propre sur
  email professeur duplique (pas de `500` brut)

## 5. LLM / Ollama (`app/llm.py`)

- Modele local via Ollama, `llama3.1` par defaut (`OLLAMA_MODEL` en env) —
  alternative plus legere recommandee sur machine modeste : `llama3.2:3b`
  ou `llama3.2:1b`, sans changement de code
- `categoriser_question(texte)` : appelee automatiquement dans
  `POST /seances/{id}/questions` — best-effort, ne bloque pas la creation
  de la question si Ollama est indisponible (`categorie` reste `None`)
- `generer_synthese_questions(questions)` / `generer_synthese_cours(contenus)` :
  declenchees a la demande via `POST /seances/{id}/synthese-questions/generer`
  et `/synthese-cours/generer` — bloquant (`503`) si Ollama indisponible,
  car c'est le but explicite de l'appel
- `reduire_questions(textes)` : deduplique/reformule des questions similaires,
  exposee via `POST /seances/{id}/questions/reduire`

Necessite `ollama serve` lance en local + modele deja telecharge
(`ollama pull llama3.1`).

## 6. Prochaines étapes suggérées

1. Decider si la generation des syntheses doit aussi se declencher
   automatiquement (ex: quand `seance.statut` passe a `"terminee"`), en plus
   du declenchement manuel actuel
2. Frontend : consommer `/seances/{id}/full` pour la vue prof, et les
   endpoints `questions`/`contenus` pour le flux temps reel eleve
3. Authentification prof (actuellement aucune — n'importe qui peut appeler
   n'importe quel endpoint)
