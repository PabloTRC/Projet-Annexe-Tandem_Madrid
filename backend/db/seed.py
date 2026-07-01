"""
Script de seed : remplit la base avec des donnees d'exemple pour tester le pipeline.
Cree : 1 prof, 2 classes, quelques etudiants, 1 cours avec 2 chapitres et des ressources.

Usage (depuis db/, venv active) :
    python seed.py
"""
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
        # --- Prof ---
        cur.execute(
            """
            INSERT INTO professors (email, password_hash, full_name)
            VALUES (%s, %s, %s)
            RETURNING id
            """,
            ("prof.demo@example.com", "fake_hashed_password", "Jean Dupont"),
        )
        professor_id = cur.fetchone()[0]

        # --- Classes ---
        cur.execute(
            """
            INSERT INTO classes (professor_id, name)
            VALUES (%s, %s), (%s, %s)
            RETURNING id
            """,
            (professor_id, "Terminale A", professor_id, "Terminale B"),
        )
        class_ids = [row[0] for row in cur.fetchall()]
        class_a_id, class_b_id = class_ids

        # --- Etudiants ---
        students = [
            (class_a_id, "Alice Martin", "alice.martin@example.com"),
            (class_a_id, "Bruno Petit", "bruno.petit@example.com"),
            (class_a_id, "Chloe Bernard", None),
            (class_b_id, "David Roux", "david.roux@example.com"),
            (class_b_id, "Emma Fontaine", None),
        ]
        cur.executemany(
            """
            INSERT INTO students (class_id, full_name, email)
            VALUES (%s, %s, %s)
            """,
            students,
        )

        # --- Cours ---
        cur.execute(
            """
            INSERT INTO courses (professor_id, title, description)
            VALUES (%s, %s, %s)
            RETURNING id, share_token
            """,
            (
                professor_id,
                "Introduction aux suites numeriques",
                "Cours de mathematiques sur les suites arithmetiques et geometriques.",
            ),
        )
        course_id, share_token = cur.fetchone()

        # --- Rattachement du cours aux 2 classes ---
        cur.executemany(
            """
            INSERT INTO course_classes (course_id, class_id)
            VALUES (%s, %s)
            """,
            [(course_id, class_a_id), (course_id, class_b_id)],
        )

        # --- Chapitres ---
        cur.execute(
            """
            INSERT INTO chapters (course_id, title, position)
            VALUES (%s, %s, %s), (%s, %s, %s)
            RETURNING id
            """,
            (
                course_id, "Suites arithmetiques", 0,
                course_id, "Suites geometriques", 1,
            ),
        )
        chapter_ids = [row[0] for row in cur.fetchall()]
        chapter_1_id, chapter_2_id = chapter_ids

        # --- Ressources ---
        resources = [
            (chapter_1_id, "note", "Definition et formule du terme general",
             "Une suite (u_n) est arithmetique de raison r si u(n+1) = u_n + r pour tout n.", None, 0),
            (chapter_1_id, "link", "Video explicative",
             "https://example.com/videos/suites-arithmetiques", None, 1),
            (chapter_2_id, "note", "Definition et formule du terme general",
             "Une suite (u_n) est geometrique de raison q si u(n+1) = u_n * q pour tout n.", None, 0),
            (chapter_2_id, "pdf", "Fiche d'exercices",
             None, "/uploads/fiche-suites-geometriques.pdf", 1),
        ]
        cur.executemany(
            """
            INSERT INTO resources (chapter_id, type, title, content, file_path, position)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            resources,
        )

        conn.commit()
        print("Seed termine avec succes.")
        print(f"  professor_id = {professor_id}")
        print(f"  class_ids    = {class_ids}")
        print(f"  course_id    = {course_id}")
        print(f"  share_token  = {share_token}")
        print(f"  URL publique de test : /public/courses/{share_token}")

    except Exception:
        conn.rollback()
        raise
    finally:
        cur.close()
        conn.close()


if __name__ == "__main__":
    seed()
