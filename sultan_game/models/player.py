from sqlalchemy import Column, Integer, String, JSON, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from core.database import Base
import uuid

class Player(Base):
    __tablename__ = "players"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(50), unique=True, nullable=False, index=True)
    
    # 游戏进度
    current_chapter = Column(Integer, default=1)
    reputation = Column(Integer, default=0)
    total_experience = Column(Integer, default=0)
    
    # 资源
    attribute_points = Column(Integer, default=0)  # 可分配属性点
    gold = Column(Integer, default=100)
    
    # 阵营关系
    faction_relations = Column(JSON, default=dict)  # 各阵营好感度
    
    # 解锁内容
    unlocked_scenes = Column(JSON, default=list)
    unlocked_features = Column(JSON, default=list)
    achievements = Column(JSON, default=list)
    
    # 游戏标记
    story_flags = Column(JSON, default=dict)     # 故事标记
    reputation_type = Column(String(50))         # 声望类型
    
    # 系统字段
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)
    last_login = Column(Integer)
    
    # 关联关系
    player_npcs = relationship("PlayerNPC", back_populates="player")
    player_cards = relationship("PlayerCard", back_populates="player")

class PlayerNPC(Base):
    __tablename__ = "player_npcs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    npc_id = Column(UUID(as_uuid=True), ForeignKey("npcs.id"), nullable=False)
    
    # 当前属性值 (可以与原始NPC不同)
    current_hp = Column(Integer, nullable=False)
    intelligence = Column(Integer, nullable=False)
    strength = Column(Integer, nullable=False)
    defense = Column(Integer, nullable=False)
    charisma = Column(Integer, default=50)
    loyalty = Column(Integer, default=50)
    fear = Column(Integer, default=0)
    
    # 成长记录
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    allocated_points = Column(JSON, default=dict)  # 已分配的属性点记录
    
    # 状态
    is_alive = Column(Boolean, default=True)
    is_active = Column(Boolean, default=True)  # 是否在队伍中
    obtained_at = Column(Integer)  # 获得时间
    died_at = Column(Integer, nullable=True)    # 死亡时间
    
    # 关联关系
    player = relationship("Player", back_populates="player_npcs")
    npc = relationship("NPC")

class PlayerCard(Base):
    __tablename__ = "player_cards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    card_id = Column(UUID(as_uuid=True), ForeignKey("cards.id"), nullable=False)
    
    # 持有数量
    quantity = Column(Integer, default=1)
    
    # 获得信息
    obtained_at = Column(Integer)
    obtained_from = Column(String(100))  # 获得来源
    
    # 关联关系
    player = relationship("Player", back_populates="player_cards")
    card = relationship("Card")