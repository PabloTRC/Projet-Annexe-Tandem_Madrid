"""ajout de la table inscription : lien eleve <-> cours (inscrire /
desinscrire un eleve d'une classe)
Revision ID: 0003
Revises: 0002
Create Date: 2026-07-03
"""
from alembic import op

# revision identifiers for Alembic.
revision = "0003"
down_revision = "0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE inscription (
            id            SERIAL PRIMARY KEY,
            eleve_id      INTEGER NOT NULL REFERENCES eleve(id) ON DELETE CASCADE,
            cours_id      INTEGER NOT NULL REFERENCES cours(id) ON DELETE CASCADE,
            created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (eleve_id, cours_id)
        );

        CREATE INDEX idx_inscription_eleve ON inscription(eleve_id);
        CREATE INDEX idx_inscription_cours ON inscription(cours_id);
    """)


def downgrade() -> None:
    op.execute("""
        DROP TABLE IF EXISTS inscription;
    """)
