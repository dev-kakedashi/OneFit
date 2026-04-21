"""create body weight logs

Revision ID: e6a7b8c9d0e1
Revises: b4d8e5c1f2a3
Create Date: 2026-04-20 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "e6a7b8c9d0e1"
down_revision: Union[str, Sequence[str], None] = "b4d8e5c1f2a3"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "body_weight_logs",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("measured_on", sa.Date(), nullable=False),
        sa.Column("weight_kg", sa.Float(), nullable=False),
        sa.Column("memo", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "measured_on",
            name="uq_body_weight_logs_user_id_measured_on",
        ),
    )
    op.create_index(
        "ix_body_weight_logs_user_id",
        "body_weight_logs",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_body_weight_logs_user_id", table_name="body_weight_logs")
    op.drop_table("body_weight_logs")
