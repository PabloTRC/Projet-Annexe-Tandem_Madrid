"""schema initial (version SQL brut) : professors, classes, students, courses, chapters, resources
Revision ID: 0001
Revises:
Create Date: 2026-07-01
"""
from alembic import op

# revision identifiers for Alembic.
revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
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


def downgrade() -> None:
    op.execute("""
        DROP TABLE IF EXISTS resources;
        DROP TABLE IF EXISTS chapters;
        DROP TABLE IF EXISTS course_classes;
        DROP TABLE IF EXISTS courses;
        DROP TABLE IF EXISTS students;
        DROP TABLE IF EXISTS classes;
        DROP TABLE IF EXISTS professors;
    """)