# Projet-Annexe-Tandem_Madrid

# El Tandem Educación

> Application compagnon pour enseignants et élèves : les élèves peuvent poser leurs questions en temps réel pendant un cours et le prof leur renvoie une synthèse par IA ce qui permet un meilleur suivi par l'enseignant du niveau de sa classe.

## Fonctionnalités

- **Espace élève** : rejoindre une classe avec un pseudo + choix parmi 9 matières (Mathématiques, Anglais, Français, Histoire, Informatique, Physique, Latin, Espagnol, Chinois).
- **Espace professeur** protégé par code d'accès "TANDEM2025": tableau de bord des questions reçues, filtrés (toutes / non lues / répondues), épinglage des questions prioritaires.
- **Fil en temps réel** des questions envoyées par les élèves (via WebSocket).
- **Catégorisation** des questions (Ollama) (Approfondie/ Élémentaire/ Cours précédent) pour un tri rapide plus visuel.
- **Synthèse LLM**(Ollama) toutes les 20mn, prévue pour regrouper les questions similaires, évite au prof de répondre plusieurs fois à la même chose.


## Stack

| catégorie       | outil                              |
| --------------- | --------------------------------------- |
| Frontend        | React + Vite + Tailwind CSS             |
| Backend         | Python 3.14 + FastAPI                   |
| Temps réel      | WebSocket (Socket.io)                   |
| Base de données | PostgreSQL 16                           |
| LLM             | Ollama (local, modèle llama3 / mistral) |
| Conteneurisation| Docker Compose                          |


## Prérequis

Pour faire fonctionner le code, il faut avoir :

- **Node.js** ≥ 18 et **npm**
- **Python** ≥ 3.14
- **Docker** + **Docker Compose**
- **Ollama** installé avec un modèle téléchargé : `ollama pull llama3`



## Installation

### 1. Cloner le dépôt

```bash
git clone <url-du-repo>
cd Projet-Annexe-Tandem_Madrid
```

### 2. Configurer les variables d'environnement

Copie le fichier d'exemple et adapte-le :

```bash
cp .env.example .env
```

Remplis au minimum :

```env
POSTGRES_USER=tandem
POSTGRES_PASSWORD=un-mot-de-passe-solide
POSTGRES_DB=tandem_db
DATABASE_URL=postgresql://tandem:un-mot-de-passe-solide@localhost:5433/tandem_db
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3
APP_SECRET_KEY=change-me
```

### 3. Base de données (Docker)

```bash
docker compose up -d postgres
```

### 4. Backend (Python / FastAPI)

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Linux/Mac
# venv\Scripts\activate       # Windows

pip install -r requirements.txt
```

> Les migrations Alembic vivent dans un venv separe (`backend/db/venv`, avec
> son propre `requirements.txt`). Voir `docs/LANCEMENT.md` pour le detail des
> deux venvs et le script `scripts/run_demo.sh` qui automatise tout.

### 5. Frontend (React / Vite)

```bash
cd frontend
npm install
```

## Lancer l'application

Ouvre **3 terminaux** :

**Terminal 1 — Base de données**
```bash
docker compose up postgres
```

**Terminal 2 — Backend**
```bash
source .venv/bin/activate
uvicorn app.main:app --reload
```
API disponible sur → http://localhost:8000

**Terminal 3 — Frontend**
```bash
cd frontend
npm run dev
```
Interface disponible sur → http://localhost:5173

## Guide d'utilisation

### Côté élève

1. Cliquer sur l'onglet **Élève** dans la barre latérale rose.
2. Saisir son **nom**.
3. Choisir sa **matière** dans la grille (Mathématiques, Anglais, Français…).
4. Cliquer sur **Rejoindre la classe virtuelle**.
5. Poser des questions via le formulaire de gauche (avec catégorie : Général / Technique / Exercice).
6. Suivre le fil des questions de la classe à droite en temps réel.

### Côté professeur

1. Cliquer sur l'onglet **Professeur** dans la barre latérale rose.
2. Saisir le **code d'accès** (`TANDEM2025`).
3. Le tableau de bord affiche toutes les questions reçues.
4. Actions disponibles :
   - **Épingler** une question prioritaire (icône en haut à droite de chaque carte): ensuite elle s'affiche dans le panneau de droite.
   - **Marquer comme lue** pour la sortir de l'onglet *Non lues*.
   - **Traitée** pour archiver une question épinglée.
5. Filtres rapides en haut : *Toutes* / *Non lues* / *Répondues*.
6. Bouton **Déconnexion prof** dans la barre latérale pour terminer la session.

### Changer le code d'accès prof

Ouvrir `frontend/src/App.jsx` et modifier la constante en haut du fichier :

```js
const CODE_ACCES_PROF = "TON_NOUVEAU_CODE";
```

### Structure du dépôt

```
Projet-Annexe-Tandem_Madrid/
├── backend/
│   ├── app/                 # API FastAPI (main.py, models.py, schemas.py, ws_manager.py, llm.py)
│   ├── db/                  # migrations Alembic (versions/) + script de seed (reset_demo.py)
│   ├── uploads/              # fichiers deposes par le professeur
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # racine + routage espace eleve / professeur
│   │   ├── EspaceEleve.jsx   # ecran de connexion eleve + interface de cours
│   │   ├── EspaceProfesseur.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
├── docs/                    # LANCEMENT.md, mvp_backend.md
├── scripts/
│   └── run_demo.sh          # reset DB + seed + lance backend/frontend en un coup
├── docker-compose.yml
├── PROJECT.md               # démarche et choix techniques
└── README.md
```

## Équipe

Développé par :

- **Keanu Toofa**
- **Amaury Viaud**
- **Pablo Thoumyre**
- **Amandine de Rocca**


## Licence

Voir le fichier [LICENSE](./LICENSE) à la racine du dépôt.



