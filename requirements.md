# Requirements Python

| Fichier | Portée | Setup |
|---|---|---|
| `backend/requirements.txt` | API FastAPI | `cd backend && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt` |
| `backend/db/requirements.txt` | Migrations Alembic | `cd backend/db && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt` |

## `backend/requirements.txt`

| Paquet | Version |
|---|---|
| fastapi | 0.115.0 |
| uvicorn[standard] | 0.30.6 |
| sqlalchemy | 2.0.35 |
| psycopg2-binary | 2.9.10 |
| python-dotenv | 1.0.1 |
| pydantic | 2.9.2 |
| email-validator | 2.2.0 |
| ollama | 0.3.3 |
| python-multipart | 0.0.12 |

## `backend/db/requirements.txt`

| Paquet | Version |
|---|---|
| alembic | 1.13.2 |
| psycopg2-binary | 2.9.10 |
| python-dotenv | 1.0.1 |
