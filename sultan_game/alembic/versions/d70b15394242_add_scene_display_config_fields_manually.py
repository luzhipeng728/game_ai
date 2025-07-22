"""Add scene display config fields manually

Revision ID: d70b15394242
Revises: b0426e074550
Create Date: 2025-07-22 12:25:12.003861

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd70b15394242'
down_revision: Union[str, Sequence[str], None] = '738f05485e83'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('scenes', sa.Column('card_count', sa.Integer(), nullable=True, default=0))
    op.add_column('scenes', sa.Column('prerequisite_scenes', sa.JSON(), nullable=True, default=[]))
    op.add_column('scenes', sa.Column('days_required', sa.Integer(), nullable=True, default=0))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('scenes', 'days_required')
    op.drop_column('scenes', 'prerequisite_scenes')
    op.drop_column('scenes', 'card_count')
