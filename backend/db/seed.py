"""
Script de seed : remplit la base avec des donnees d'exemple pour tester le pipeline.
Cree : 1 professeur, 3 eleves, 1 cours, 1 seance, du contenu, des questions et des syntheses.

Usage (depuis db/, venv active) :
    python seed.py
"""
import json
import os

import psycopg2

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise SystemExit("DATABASE_URL n'est pas defini (verifie ton fichier .env)")


def seed():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # --- Professeur ---
        cur.execute(
            """
            INSERT INTO professeur (nom, email)
            VALUES (%s, %s)
            RETURNING id
            """,
            ("Jean Dupont", "jean.dupont@lycee-demo.fr"),
        )
        professeur_id = cur.fetchone()[0]

        # --- Eleves ---
        eleves = [
            ("Alice Martin", "terminale_a"),
            ("Bruno Petit", "terminale_a"),
            ("Chloe Bernard", "terminale_b"),
        ]
        cur.execute(
            """
            INSERT INTO eleve (nom, categorie)
            VALUES (%s, %s), (%s, %s), (%s, %s)
            RETURNING id
            """,
            [value for row in eleves for value in row],
        )
        eleve_ids = [row[0] for row in cur.fetchall()]
        alice_id, bruno_id, chloe_id = eleve_ids

        # --- Cours ---
        cur.execute(
            """
            INSERT INTO cours (professeur_id, titre, description)
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            (
                professeur_id,
                "Introduction aux suites numeriques",
                "Cours de mathematiques sur les suites arithmetiques et geometriques.",
            ),
        )
        cours_id = cur.fetchone()[0]

        # --- Seance ---
        cur.execute(
            """
            INSERT INTO seance (cours_id, date, statut)
            VALUES (%s, now(), %s)
            RETURNING id
            """,
            (cours_id, "en_cours"),
        )
        seance_id = cur.fetchone()[0]

        # --- Contenu ---
        contenus = [
            ("slide", {"titre": "Suites arithmetiques", "texte": "u(n+1) = u_n + r"}),
            ("slide", {"titre": "Suites geometriques", "texte": "u(n+1) = u_n * q"}),
            ("pdf", {"file_path": "/uploads/fiche-suites.pdf"}),
        ]
        cur.executemany(
            """
            INSERT INTO contenu (seance_id, type, donnees)
            VALUES (%s, %s, %s)
            """,
            [(seance_id, type_, json.dumps(donnees)) for type_, donnees in contenus],
        )

        # --- Questions (categorie encore vide, sera remplie par le LLM) ---
        questions = [
            (alice_id, "Est-ce que la raison peut etre negative ?"),
            (bruno_id, "Quelle est la difference avec une suite geometrique ?"),
            (chloe_id, "On avait deja vu ca au chapitre precedent non ?"),
        ]
        cur.executemany(
            """
            INSERT INTO question (seance_id, eleve_id, texte)
            VALUES (%s, %s, %s)
            """,
            [(seance_id, eleve_id, texte) for eleve_id, texte in questions],
        )

        # --- Simulation d'une categorisation LLM a posteriori ---
        cur.execute(
            """
            UPDATE question SET categorie = 'elementaire'
            WHERE texte = 'Est-ce que la raison peut etre negative ?'
            """
        )
        cur.execute(
            """
            UPDATE question SET categorie = 'approfondie'
            WHERE texte = 'Quelle est la difference avec une suite geometrique ?'
            """
        )
        cur.execute(
            """
            UPDATE question SET categorie = 'cours_precedent'
            WHERE texte = 'On avait deja vu ca au chapitre precedent non ?'
            """
        )

        # --- Syntheses ---
        cur.execute(
            """
            INSERT INTO synthese_questions (seance_id, texte_genere)
            VALUES (%s, %s)
            """,
            (
                seance_id,
                "3 questions posees : 1 elementaire, 1 approfondie, 1 sur du contenu deja vu.",
            ),
        )
        cur.execute(
            """
            INSERT INTO synthese_cours (seance_id, texte_genere)
            VALUES (%s, %s)
            """,
            (
                seance_id,
                "La seance a couvert les suites arithmetiques et geometriques, "
                "avec un bon niveau de comprehension general.",
            ),
        )

        conn.commit()
        print("Seed termine avec succes.")
        print(f"  professeur_id = {professeur_id}")
        print(f"  eleve_ids     = {eleve_ids}")
        print(f"  cours_id      = {cours_id}")
        print(f"  seance_id     = {seance_id}")

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    seed()
