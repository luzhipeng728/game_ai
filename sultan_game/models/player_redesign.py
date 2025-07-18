from sqlalchemy import Column, Integer, String, JSON, Boolean
from sqlalchemy.orm import relationship
from core.database import Base
import uuid

class Player(Base):
    """玩家基础信息"""
    __tablename__ = "players"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    username = Column(String(50), unique=True, nullable=False, index=True)
    
    # 游戏进度
    current_chapter = Column(Integer, default=1)
    game_day = Column(Integer, default=1)  # 游戏内天数
    reputation = Column(Integer, default=0)
    total_experience = Column(Integer, default=0)
    level = Column(Integer, default=1)
    
    # 资源
    gold = Column(Integer, default=100)
    
    # 阵营关系
    faction_relations = Column(JSON, default=dict)
    # 格式: {"sultan": 0, "minister": 0, "military": 0, "blackduck": 0}
    
    # 解锁内容
    unlocked_scenes = Column(JSON, default=list)
    unlocked_features = Column(JSON, default=list)
    unlocked_npcs = Column(JSON, default=list)
    achievements = Column(JSON, default=list)
    
    # 游戏标记和状态
    story_flags = Column(JSON, default=dict)
    reputation_type = Column(String(50))  # "diplomatic", "aggressive", "cunning"
    
    # 统计信息
    total_scenes_completed = Column(Integer, default=0)
    total_scenes_failed = Column(Integer, default=0)
    total_npcs_defeated = Column(Integer, default=0)
    total_npcs_converted = Column(Integer, default=0)
    
    # 系统字段
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)
    last_login = Column(Integer)
    
    # 关联关系（将在其他模型中定义反向关系）
    # player_npcs = relationship("PlayerNPCInstance", back_populates="player")
    # player_cards = relationship("PlayerCard", back_populates="player")
    # attribute_point_pool = relationship("AttributePointPool", back_populates="player", uselist=False)