"""create body make plans

Revision ID: b4d8e5c1f2a3
Revises: 7e1b7d7f4f9d
Create Date: 2026-04-06 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "b4d8e5c1f2a3"
down_revision: Union[str, Sequence[str], None] = "7e1b7d7f4f9d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "body_make_plans",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column(
            "course",
            sa.Enum("maintenance", "diet", "bulk", name="goal_course"),
            nullable=False,
        ),
        sa.Column("effective_from", sa.Date(), nullable=False),
        sa.Column("duration_days", sa.Integer(), nullable=False),
        sa.Column("target_end_date", sa.Date(), nullable=False),
        sa.Column("target_weight_kg", sa.Float(), nullable=False),
        sa.Column("memo", sa.Text(), nullable=True),
        sa.Column("start_weight_kg", sa.Float(), nullable=False),
        sa.Column("maintenance_calories", sa.Integer(), nullable=False),
        sa.Column("daily_calorie_adjustment", sa.Integer(), nullable=False),
        sa.Column("target_calories", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint(
            "user_id",
            "effective_from",
            name="uq_body_make_plans_user_id_effective_from",
        ),
    )
    op.create_index(
        "ix_body_make_plans_user_id",
        "body_make_plans",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("ix_body_make_plans_user_id", table_name="body_make_plans")
    op.drop_table("body_make_plans")
