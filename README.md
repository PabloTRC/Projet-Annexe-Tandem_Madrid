# Projet-Annexe-Tandem_Madrid
# Assistant de Cours — Application compagnon pour enseignants

## 1. Objectif

Application web compagnon pour les enseignants, permettant :
- au **professeur** de déposer des contenus pédagogiques et de piloter une séance en direct (questions des élèves, synthèses générées par LLM) ;
- à l'**élève** de suivre le cours et de poser des questions en temps réel.

Le cœur du produit est la boucle **question élève → synthèse LLM → réponse/suivi professeur**, appliquée à l'échelle d'une séance puis d'un cours complet.

## 2. Périmètre fonctionnel

### 2.1 MVP

**Frontend professeur**
- Créer une séance et y déposer des contenus pédagogiques (texte, fichiers, liens).
- Visualiser en direct les questions posées par les élèves pendant la séance.
- Déclencher, via un bouton, une synthèse LLM qui regroupe les questions similaires (même réponse attendue) pour éviter les doublons.

**Frontend élève**
- Rejoindre une séance et suivre le contenu du cours.
- Poser des questions à tout moment pendant la séance.

**Backend**
- API REST exposant : séances, contenus, questions, synthèses.
- Persistance PostgreSQL.
- Appel au LLM (Ollama, local) pour la synthèse des questions.

### 2.2 Extensions (post-MVP)

| Extension | Description |
|---|---|
| **Synthèse des questions** | Regroupement par le LLM des questions équivalentes posées pendant une séance, pour éviter au professeur de répondre plusieurs fois à la même chose. |
| **Suivi des élèves** | Chaque question est associée à l'identifiant de l'élève qui l'a posée. Le professeur peut consulter l'historique par élève. |
| **Classification des questions par le LLM** | Le LLM catégorise chaque question : élémentaire / approfondie / porte sur un cours antérieur. |
| **Détection de difficultés** | À partir de la classification, le système signale les élèves qui semblent en difficulté (questions récurrentes sur des notions déjà vues) versus ceux qui progressent bien. |
| **Synthèse de fin de cours** | Génération par LLM d'un résumé de séance, mis à disposition des élèves après le cours. |

Ces extensions dépendent toutes du MVP (contenu + questions + identifiant élève) et peuvent être développées indépendamment les unes des autres une fois le MVP stable.

## 3. Architecture

```
┌─────────────────────┐      ┌─────────────────────┐
│  Frontend Professeur │      │   Frontend Élève     │
│  (HTML/CSS/JS)        │      │   (HTML/CSS/JS)       │
└──────────┬───────────┘      └──────────┬───────────┘
           │            REST / WebSocket             │
           └───────────────────┬──────────────────────┘
                                │
                       ┌────────▼────────┐
                       │   Backend API     │
                       │   (Python)         │
                       └───┬──────────┬────┘
                            │          │
                  ┌─────────▼──┐   ┌───▼─────────┐
                  │ PostgreSQL │   │ Ollama (LLM) │
                  └────────────┘   └──────────────┘
```

- Les questions en direct nécessitent une mise à jour en temps réel côté professeur : prévoir WebSocket 
- Ollama tourne en local/serveur dédié ; le backend l'appelle via son API HTTP.

## 4. Stack technique

| Couche | Techno |
|---|---|
| Langage principal | Python |
| LLM | Ollama (modèle à définir, ex. llama3 / mistral) |
| Frontend | HTML, CSS, JavaScript (vanilla dans un premier temps) |
| Style (phase 2) | Tailwind CSS |
| Backend | Python (framework FastAPI) |
| Base de données | PostgreSQL |


## 5. Modèle de données (esquisse)

- `professeur (id, nom, email, ...)`
- `eleve (id, nom, identifiant_anonyme, ...)`
- `cours (id, professeur_id, titre, description)`
- `seance (id, cours_id, date, statut)`
- `contenu (id, seance_id, type, donnees)`
- `question (id, seance_id, eleve_id, texte, horodatage, categorie)` — `categorie` = élémentaire / approfondie / cours antérieur, remplie par le LLM
- `synthese_questions (id, seance_id, texte_genere, horodatage)`
- `synthese_cours (id, seance_id, texte_genere, horodatage)`


## 6. Endpoints API (esquisse)

```
POST   /api/cours                        Créer un cours
POST   /api/cours/{id}/seances            Créer une séance
POST   /api/seances/{id}/contenus         Déposer un contenu pédagogique
GET    /api/seances/{id}                  Détail séance + contenus

POST   /api/seances/{id}/questions        Élève pose une question
GET    /api/seances/{id}/questions        Professeur liste les questions

POST   /api/seances/{id}/synthese-questions   Déclenche la synthèse LLM des questions
GET    /api/seances/{id}/synthese-cours       Récupère la synthèse de fin de cours (élève)
POST   /api/seances/{id}/synthese-cours       Génère la synthèse de fin de cours (professeur)

GET    /api/eleves/{id}/suivi             Historique des questions/catégories d'un élève
```

## 7. Points à trancher avant / pendant le développement

L'IA assistante doit signaler ces choix plutôt que les prendre silencieusement :

1. **Temps réel** : WebSocket (mise à jour instantanée des questions côté professeur)
2. **Authentification** : comptes professeur/élève réels, ou lien de séance + pseudonyme pour les élèves ?
3. **Modèle Ollama** : quel modèle par défaut, et fallback si le modèle n'est pas installé localement ?
4. **Anonymat élève** : le "suivi des élèves" implique de conserver un identifiant nominatif ou pseudonymisé — à clarifier pour la conformité RGPD si déploiement en établissement scolaire.

## 8. Structure du dépôt

```
assistant-de-cours/
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── models/          # modèles PostgreSQL (SQLAlchemy ou équivalent)
│   │   ├── routers/         # endpoints REST par domaine (cours, seances, questions...)
│   │   ├── services/        # logique métier, appels LLM
│   │   └── llm/             # client Ollama, prompts de synthèse/classification
│   ├── requirements.txt
│   └── alembic/ (ou migrations équivalentes)
├── frontend-professeur/
│   ├── index.html
│   ├── css/
│   └── js/
├── frontend-eleve/
│   ├── index.html
│   ├── css/
│   └── js/
├── docker-compose.yml
├── .env.example
└── README.md
```

## 9. Déploiement

### 9.1 Prérequis
- Python 3.11+
- PostgreSQL 14+
- Ollama installé avec au moins un modèle téléchargé (`ollama pull <modele>`)

### 9.2 Variables d'environnement (`.env`)

```
DATABASE_URL=postgresql://user:password@localhost:5432/assistant_cours
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
APP_SECRET_KEY=change-me
ENV=production
```

### 9.3 Environnement de développement local

```bash
python -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
uvicorn app.main:app --reload   # backend
# ouvrir frontend-professeur/index.html et frontend-eleve/index.html dans le navigateur
```

## 10. Feuille de route

| Phase | Contenu |
|---|---|
| Phase 1 | MVP : dépôt de contenu, questions élèves, synthèse LLM des questions |
| Phase 2 | Suivi élève + classification des questions + détection de difficultés |
| Phase 3 | Synthèse de fin de cours |
| Phase 4 (esthétique) | Intégration Tailwind CSS sur les deux frontends |

