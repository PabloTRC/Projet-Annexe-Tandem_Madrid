#!/usr/bin/env bash
# Reinitialise completement la base et lance le backend, prêt pour la demo.
#
# Usage : depuis n'importe ou,
#   ./run_demo.sh
#
# A savoir : docker-compose.yml est a la RACINE du projet (pas dans backend/),
# c'est pour ca que "cd backend && docker compose ..." ne marchait pas.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

echo "==> [1/5] Reset complet de Postgres (docker compose, depuis la racine)"
docker compose down -v
docker compose up -d

echo "==> Attente que Postgres soit pret..."
until docker compose exec -T postgres pg_isready -U cours_admin -d cours_db >/dev/null 2>&1; do
  sleep 1
  echo "    ... toujours en attente"
done
echo "    Postgres est pret."

echo "==> [2/5] Verification des venvs"
# Il y a DEUX venvs distincts dans ce projet : backend/venv (FastAPI, sans
# alembic) et backend/db/venv (alembic + psycopg2, sans FastAPI). On appelle
# directement le bon python de chacun par son chemin complet, plutot que de
# faire "source activate" (qui se melangeait avec conda "base" et cassait la
# resolution de "alembic" dans le PATH).
DB_PYTHON="$ROOT_DIR/backend/db/venv/bin/python"
APP_PYTHON="$ROOT_DIR/backend/venv/bin/python"

if [ ! -x "$DB_PYTHON" ]; then
  echo "Erreur : backend/db/venv introuvable. Cree-le avec :"
  echo "  cd backend/db && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi
if [ ! -x "$APP_PYTHON" ]; then
  echo "Erreur : backend/venv introuvable. Cree-le avec :"
  echo "  cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

echo "==> [3/5] Migrations Alembic (depuis backend/db, avec backend/db/venv)"
cd "$ROOT_DIR/backend/db"
"$DB_PYTHON" -m alembic upgrade head

echo "==> [4/5] Seed de la base de demo (3 cours, 3 etats differents)"
"$DB_PYTHON" reset_demo.py

echo "==> [5/5] Verification rapide de la base"
"$DB_PYTHON" -c "
import os
from dotenv import load_dotenv
load_dotenv()
import psycopg2
conn = psycopg2.connect(os.environ['DATABASE_URL'])
cur = conn.cursor()
cur.execute('SELECT count(*) FROM cours')
print(f'  -> {cur.fetchone()[0]} cours en base.')
conn.close()
"

echo ""
echo "==> Lancement du backend en arriere-plan (port 8000)..."
cd "$ROOT_DIR/backend"
"$APP_PYTHON" -m uvicorn app.main:app --reload > "$ROOT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

cleanup() {
  echo ""
  echo "==> Arret du backend (pid $BACKEND_PID)"
  kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT

sleep 2
if ! curl -sf http://localhost:8000/cours >/dev/null; then
  echo "Le backend ne repond pas encore, on attend un peu plus..."
  sleep 3
fi
echo "    Backend up: http://localhost:8000  (logs dans backend.log)"

echo "==> Lancement du frontend (port 5173, Ctrl+C pour tout arreter)"
cd "$ROOT_DIR/frontend"
if [ ! -d node_modules ]; then
  npm install
fi
npm run dev
