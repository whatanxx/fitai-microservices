"""add weight_history column to user_profiles

Revision ID: 0002_add_weight_history
Revises: 0001_initial
Create Date: 2026-03-27

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0002_add_weight_history"
down_revision: str | None = "0001_initial"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("user_profiles", sa.Column("weight_history", sa.JSON(), nullable=True, server_default='[]'))


def downgrade() -> None:
    op.drop_column("user_profiles", "weight_history")
