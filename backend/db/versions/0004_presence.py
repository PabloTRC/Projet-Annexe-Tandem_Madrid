"""ajout de la table presence : suivi des eleves connectes en direct sur
une seance (pas de websocket, juste un "heartbeat" periodique cote client)
Revision ID: 0004
Revises: 0003
Create Date: 2026-07-03
"""
from alembic import op

# revision identifiers for Alembic.
revision = "0004"
down_revision = "0003"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute("""
        CREATE TABLE presence (
            id                 SERIAL PRIMARY KEY,
            eleve_id           INTEGER NOT NULL REFERENCES eleve(id) ON DELETE CASCADE,
            seance_id          INTEGER NOT NULL REFERENCES seance(id) ON DELETE CASCADE,
            derniere_activite  TIMESTAMPTZ NOT NULL DEFAULT now(),
            UNIQUE (eleve_id, seance_id)
        );

        CREATE INDEX idx_presence_seance ON presence(seance_id);
        CREATE INDEX idx_presence_eleve ON presence(eleve_id);
    """)


def downgrade() -> None:
    op.execute("""
        DROP TABLE IF EXISTS presence;
    """)
