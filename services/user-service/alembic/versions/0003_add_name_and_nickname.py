"""add first_name and nickname to user_profiles

Revision ID: 0003_add_name_and_nickname
Revises: 0002_add_weight_history
Create Date: 2026-03-28

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "0003_add_name_and_nickname"
down_revision: Union[str, None] = "0002_add_weight_history"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("user_profiles", sa.Column("first_name", sa.String(length=100), nullable=True))
    op.add_column("user_profiles", sa.Column("nickname", sa.String(length=100), nullable=True))


def downgrade() -> None:
    op.drop_column("user_profiles", "nickname")
    op.drop_column("user_profiles", "first_name")
