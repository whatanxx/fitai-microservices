"""add preferred_ai_provider to user_profiles

Revision ID: 0004_add_preferred_ai_provider
Revises: 0003_add_name_and_nickname
Create Date: 2026-04-15

"""
from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0004_add_preferred_ai_provider"
down_revision: str | None = "0003_add_name_and_nickname"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.add_column("user_profiles", sa.Column("preferred_ai_provider", sa.String(length=20), nullable=False, server_default="google"))


def downgrade() -> None:
    op.drop_column("user_profiles", "preferred_ai_provider")
