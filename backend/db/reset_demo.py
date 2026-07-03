"""
Script de reset + seed "démo complète" : vide toutes les tables (sans toucher
au schéma, donc pas besoin de relancer Alembic) et les remplit avec un jeu de
données pensé pour dérouler une démo de bout en bout avec le frontend.

Ce script crée 3 cours dans 3
états différents pour pouvoir montrer les 3 parcours possibles côté prof :

  1. "3eme A - Mathematiques"      -> une seance deja EN COURS, avec des
                                       questions et un document deja presents
                                       (pour "Rejoindre" direct + generer une
                                       synthese immediatement)
  2. "4eme B - Mathematiques"      -> une seance PLANIFIEE, sans contenu
                                       (pour montrer le bouton "Lancer le
                                       cours" qui bascule la seance en direct)
  3. "Seconde 2 - Physique-Chimie" -> AUCUNE seance encore
                                       (pour montrer la creation d'une toute
                                       premiere seance)

Usage (depuis backend/, venv actif) :
    python db/reset_demo.py
"""
import json
import os
import shutil
import uuid
from pathlib import Path

import psycopg2

try:
    from dotenv import load_dotenv
    # backend/.env (partage avec l'app FastAPI et Alembic, pas de copie locale).
    load_dotenv(Path(__file__).resolve().parent.parent / ".env")
except ImportError:
    pass

DATABASE_URL = os.environ.get("DATABASE_URL")
if not DATABASE_URL:
    raise SystemExit("DATABASE_URL n'est pas defini (verifie ton fichier backend/.env)")

UPLOAD_DIR = os.path.abspath(os.environ.get("UPLOAD_DIR", "uploads"))
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Fichier utilise pour simuler un vrai document televersable dans la demo.
# Genere par le script lui-meme s'il n'existe pas deja (evite de dependre
# d'un PDF particulier present sur le disque de la personne qui lance ca).
SOURCE_PDF_CANDIDATES = [
    os.path.join(UPLOAD_DIR, "cours_example.pdf"),
]


def _demo_pdf_bytes():
    # PDF minimal valide (une page blanche) genere a la volee si aucun
    # fichier d'exemple n'est trouve sur le disque.
    return (
        b"%PDF-1.1\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n"
        b"2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n"
        b"3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\n"
        b"trailer<</Root 1 0 R>>\n"
    )


def _copy_demo_pdf():
    """Copie un PDF d'exemple dans UPLOAD_DIR sous un nom UUID (comme le
    ferait l'endpoint d'upload) et renvoie les infos a stocker dans
    `donnees`."""
    source = next((p for p in SOURCE_PDF_CANDIDATES if os.path.isfile(p)), None)
    stored_name = f"{uuid.uuid4().hex}.pdf"
    destination = os.path.join(UPLOAD_DIR, stored_name)

    if source:
        shutil.copyfile(source, destination)
    else:
        with open(destination, "wb") as f:
            f.write(_demo_pdf_bytes())

    return {
        "file_path": stored_name,
        "file_name": "Chapitre 4 - Pythagore.pdf",
        "content_type": "application/pdf",
    }


def reset_demo():
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = False
    cur = conn.cursor()

    try:
        # --- Nettoyage complet (schema conserve, juste les donnees) ---
        cur.execute(
            "TRUNCATE TABLE synthese_cours, synthese_questions, question, "
            "inscription, contenu, seance, cours, eleve, professeur RESTART IDENTITY CASCADE"
        )

        # --- Professeur ---
        cur.execute(
            "INSERT INTO professeur (nom, email) VALUES (%s, %s) RETURNING id",
            ("Mme Laurent", "mme.laurent@lycee-demo.fr"),
        )
        professeur_id = cur.fetchone()[0]

        # --- Eleves ---
        eleves = [
            "Alice Martin", "Bruno Petit", "Chloe Durand",
            "David Leroy", "Emma Roux", "Farid Bensaid",
        ]
        cur.execute(
            f"INSERT INTO eleve (nom) VALUES {', '.join(['(%s)'] * len(eleves))} RETURNING id",
            eleves,
        )
        eleve_ids = [row[0] for row in cur.fetchall()]
        alice, bruno, chloe, david, emma, farid = eleve_ids

        # --- Cours 1 : seance deja en cours ---
        cur.execute(
            "INSERT INTO cours (professeur_id, titre, description) VALUES (%s, %s, %s) RETURNING id",
            (
                professeur_id,
                "3eme A - Mathematiques",
                "Theoreme de Pythagore : applications et exercices. "
                "Introduction a la trigonometrie en fin de semaine.",
            ),
        )
        cours1_id = cur.fetchone()[0]

        cur.execute(
            "INSERT INTO seance (cours_id, date, statut) VALUES (%s, now(), 'en_cours') RETURNING id",
            (cours1_id,),
        )
        seance1_id = cur.fetchone()[0]

        cur.executemany(
            "INSERT INTO contenu (seance_id, type, donnees) VALUES (%s, %s, %s)",
            [
                (seance1_id, "slide", json.dumps({"titre": "Theoreme de Pythagore", "texte": "a^2 + b^2 = c^2"})),
                (seance1_id, "pdf", json.dumps(_copy_demo_pdf())),
            ],
        )

        questions_cours1 = [
            (alice, "Pourquoi le theoreme ne marche que sur un triangle rectangle ?"),
            (bruno, "Comment reconnait-on l'hypotenuse dans un triangle rectangle ?"),
            (chloe, "On avait deja vu une demonstration proche au college non ?"),
        ]
        cur.executemany(
            "INSERT INTO question (seance_id, eleve_id, texte) VALUES (%s, %s, %s)",
            [(seance1_id, e, t) for e, t in questions_cours1],
        )
        cur.execute(
            "UPDATE question SET categorie = 'approfondie' "
            "WHERE seance_id = %s AND texte LIKE %s",
            (seance1_id, "Pourquoi le theoreme%"),
        )
        cur.execute(
            "UPDATE question SET categorie = 'elementaire' "
            "WHERE seance_id = %s AND texte LIKE %s",
            (seance1_id, "Comment reconnait-on%"),
        )
        cur.execute(
            "UPDATE question SET categorie = 'cours_precedent' "
            "WHERE seance_id = %s AND texte LIKE %s",
            (seance1_id, "On avait deja vu%"),
        )

        # --- Cours 2 : seance planifiee, pas encore lancee ---
        cur.execute(
            "INSERT INTO cours (professeur_id, titre, description) VALUES (%s, %s, %s) RETURNING id",
            (
                professeur_id,
                "4eme B - Mathematiques",
                "Fractions, priorites operatoires, resolution d'equations du premier degre.",
            ),
        )
        cours2_id = cur.fetchone()[0]
        cur.execute(
            "INSERT INTO seance (cours_id, date, statut) VALUES (%s, now(), 'planifiee')",
            (cours2_id,),
        )

        # --- Cours 3 : aucune seance encore ---
        cur.execute(
            "INSERT INTO cours (professeur_id, titre, description) VALUES (%s, %s, %s) RETURNING id",
            (
                professeur_id,
                "Seconde 2 - Physique-Chimie",
                "Reactions acide-base, mesure du pH, securite au laboratoire.",
            ),
        )
        cours3_id = cur.fetchone()[0]

        # --- Inscriptions : Alice/Bruno/Chloe dans le cours 1, David/Emma dans
        # le cours 2. Farid n'est inscrit nulle part (pour tester l'ajout). ---
        inscriptions = [
            (alice, cours1_id), (bruno, cours1_id), (chloe, cours1_id),
            (david, cours2_id), (emma, cours2_id),
        ]
        cur.executemany(
            "INSERT INTO inscription (eleve_id, cours_id) VALUES (%s, %s)",
            inscriptions,
        )

        conn.commit()
        print("Reset + seed demo termine avec succes.")
        print(f"  professeur_id = {professeur_id}")
        print(f"  eleve_ids     = {eleve_ids}")
        print(f"  cours1_id     = {cours1_id}  (seance {seance1_id} EN COURS, 3 eleves inscrits)")
        print(f"  cours2_id     = {cours2_id}  (seance PLANIFIEE, 2 eleves inscrits)")
        print(f"  cours3_id     = {cours3_id}  (aucune seance, aucun eleve inscrit)")

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    reset_demo()
