# Lancer le prototype

## Prérequis (une seule fois)

- Docker Desktop installé et **ouvert** (l'appli doit tourner, pas juste être installée)
- `backend/venv` et `backend/db/venv` créés avec leurs dépendances :
  ```bash
  cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && deactivate
  cd db && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && deactivate
  ```
- `frontend` : `cd frontend && npm install`
- Ollama installé avec le modèle `llama3.2:1b` (`ollama pull llama3.2:1b`)

## Lancer la démo

Une seule commande, depuis la racine du projet :

```bash
./scripts/run_demo.sh
```

Ce script, dans l'ordre :
1. reset complet de Postgres (docker compose, depuis la racine — **pas** `backend/`)
2. attend que Postgres soit prêt
3. applique les migrations Alembic
4. remplit la base avec 3 cours de démo dans 3 états différents (voir plus bas)
5. démarre le backend (port 8000, logs dans `backend.log`)
6. démarre `frontend` (port 5173)

Ouvre ensuite **http://localhost:5173**. `Ctrl+C` arrête les deux serveurs.

## Se connecter

- **Professeur** : clique "🧑‍🏫 Espace professeur" (pas de login, accès direct).
- **Élève** : clique "🎓 Espace élève" → un écran demande ton nom la première fois (créé côté backend et gardé en mémoire du navigateur), puis "Mes cours" s'affiche.

## Les 3 cours de démo

| Cours | État | Pour montrer |
|---|---|---|
| 3ème A - Mathématiques | séance **déjà en cours**, questions + un PDF déjà présents | "Rejoindre" direct + génération de synthèse immédiate |
| 4ème B - Mathématiques | séance **planifiée**, pas encore démarrée | le bouton "Lancer le cours" |
| Seconde 2 - Physique-Chimie | **aucune séance** | la création d'une toute première séance + upload de document |

## En cas de problème

- `curl http://localhost:8000/cours` doit renvoyer un tableau JSON avec 3 cours. Si erreur de connexion → le backend n'est pas lancé (relance `./scripts/run_demo.sh` ou regarde `backend.log`).
- Erreur "Load failed" / "Failed to fetch" côté navigateur alors que `curl` fonctionne → problème CORS. Vérifie que `backend/.env` contient bien `http://localhost:5173` dans `FRONTEND_ORIGINS`.
- `alembic: command not found` → ne pas activer `backend/venv`, alembic vit dans `backend/db/venv` (géré automatiquement par `scripts/run_demo.sh`).
- Pour revider juste les données sans tout relancer (Postgres et backend restent allumés) : `cd backend/db && venv/bin/python reset_demo.py`.
