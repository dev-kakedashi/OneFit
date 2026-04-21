"""add water logs and daily water goal

Revision ID: 7e1b7d7f4f9d
Revises: c09a4adaba3b
Create Date: 2026-04-02 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "7e1b7d7f4f9d"
down_revision: Union[str, Sequence[str], None] = "c09a4adaba3b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column("daily_water_goal_ml", sa.Integer(), nullable=True),
    )

    op.create_table(
        "water_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("amount_ml", sa.Integer(), nullable=False),
        sa.Column("drank_at", sa.DateTime(), nullable=False),
        sa.Column("memo", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("water_logs")
    op.drop_column("users", "daily_water_goal_ml")
