"""remplacement du schema par le modele seance : professeur, eleve, cours,
seance, contenu, question, synthese_questions, synthese_cours
Revision ID: 0002
Revises: 0001
Create Date: 2026-07-01
"""
from alembic import op

# revision identifiers for Alembic.
revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- Suppression de l'ancien schema (classes/chapitres/ressources) ---
    op.execute("""
        DROP TABLE IF EXISTS resources;
        DROP TABLE IF EXISTS chapters;
        DROP TABLE IF EXISTS course_classes;
        DROP TABLE IF EXISTS courses;
        DROP TABLE IF EXISTS students;
        DROP TABLE IF EXISTS classes;
        DROP TABLE IF EXISTS professors;
    """)

    # --- Nouveau schema ---
    op.execute("""
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

        CREATE TABLE contenu (
            id            SERIAL PRIMARY KEY,
            seance_id     INTEGER NOT NULL REFERENCES seance(id) ON DELETE CASCADE,
            type          VARCHAR(50) NOT NULL,
            donnees       JSONB,
            created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        );

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

        CREATE INDEX idx_cours_professeur ON cours(professeur_id);
        CREATE INDEX idx_seance_cours ON seance(cours_id);
        CREATE INDEX idx_contenu_seance ON contenu(seance_id);
        CREATE INDEX idx_question_seance ON question(seance_id);
        CREATE INDEX idx_question_eleve ON question(eleve_id);
        CREATE INDEX idx_synthese_questions_seance ON synthese_questions(seance_id);
        CREATE INDEX idx_synthese_cours_seance ON synthese_cours(seance_id);
    """)


def downgrade() -> None:
    # --- Suppression du nouveau schema ---
    op.execute("""
        DROP TABLE IF EXISTS synthese_cours;
        DROP TABLE IF EXISTS synthese_questions;
        DROP TABLE IF EXISTS question;
        DROP TABLE IF EXISTS contenu;
        DROP TABLE IF EXISTS seance;
        DROP TABLE IF EXISTS cours;
        DROP TABLE IF EXISTS eleve;
        DROP TABLE IF EXISTS professeur;
    """)

    # --- Restauration de l'ancien schema ---
    op.execute("""
        CREATE EXTENSION IF NOT EXISTS pgcrypto;

        CREATE TABLE professors (
            id            SERIAL PRIMARY KEY,
            email         VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name     VARCHAR(255) NOT NULL,
            created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE classes (
            id            SERIAL PRIMARY KEY,
            professor_id  INTEGER NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
            name          VARCHAR(255) NOT NULL,
            created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE students (
            id            SERIAL PRIMARY KEY,
            class_id      INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
            full_name     VARCHAR(255) NOT NULL,
            email         VARCHAR(255),
            created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE courses (
            id            SERIAL PRIMARY KEY,
            professor_id  INTEGER NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
            title         VARCHAR(255) NOT NULL,
            description   TEXT,
            created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
            share_token   UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE
        );

        CREATE TABLE course_classes (
            course_id     INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            class_id      INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
            PRIMARY KEY (course_id, class_id)
        );

        CREATE TABLE chapters (
            id            SERIAL PRIMARY KEY,
            course_id     INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
            title         VARCHAR(255) NOT NULL,
            position      INTEGER NOT NULL DEFAULT 0,
            created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE TABLE resources (
            id            SERIAL PRIMARY KEY,
            chapter_id    INTEGER NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
            type          VARCHAR(50) NOT NULL,
            title         VARCHAR(255) NOT NULL,
            content       TEXT,
            file_path     VARCHAR(500),
            position      INTEGER NOT NULL DEFAULT 0,
            created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
        );

        CREATE INDEX idx_classes_professor ON classes(professor_id);
        CREATE INDEX idx_students_class ON students(class_id);
        CREATE INDEX idx_courses_professor ON courses(professor_id);
        CREATE INDEX idx_chapters_course ON chapters(course_id);
        CREATE INDEX idx_resources_chapter ON resources(chapter_id);
    """)
