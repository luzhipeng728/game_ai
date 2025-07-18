from sqlalchemy import Column, Integer, String, Boolean, JSON, Text, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
import uuid

class PlayerCharacter(Base):
    """玩家角色属性模型 - 管理玩家自身的属性"""
    __tablename__ = "player_characters"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    
    # 核心属性
    intelligence = Column(Integer, default=10)      # INT 1-20 影响骰子数量
    strength = Column(Integer, default=20)          # STR 1-100 战斗攻击力
    defense = Column(Integer, default=20)           # DEF 1-100 战斗防御力
    hp_max = Column(Integer, default=100)           # HP 1-500 生命值
    hp_current = Column(Integer, default=100)       # 当前生命值
    
    # 社交属性
    charisma = Column(Integer, default=50)          # CHA 1-100 影响对话效果
    
    # 权力属性
    influence = Column(Integer, default=100)        # INF 1-100 权威和影响力（苏丹默认100）
    command = Column(Integer, default=100)          # CMD 1-100 军事指挥能力
    category = Column(Integer, default=1)           # CAT 1=贵族（苏丹）
    
    # 特殊属性
    stealth = Column(Integer, default=0)            # HIDE 1-100 隐蔽能力（玩家专用）
    fear_level = Column(Integer, default=0)         # FEAR 1-100 其他角色对玩家的畏惧程度
    
    # 特殊技能和属性
    special_skills = Column(JSON, default=dict)     # 特殊技能如毒术、医术等
    custom_attributes = Column(JSON, default=dict)  # 自定义属性
    
    # 系统字段
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)
    updated_at = Column(Integer)
    
    # 关联关系
    player = relationship("Player", back_populates="character")
    attribute_history = relationship("PlayerAttributeHistory", back_populates="character")

class PlayerAttributeHistory(Base):
    """玩家属性变更历史"""
    __tablename__ = "player_attribute_history"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    character_id = Column(String(36), ForeignKey("player_characters.id"), nullable=False)
    
    # 变更信息
    attribute_name = Column(String(50), nullable=False)
    old_value = Column(Integer, nullable=False)
    new_value = Column(Integer, nullable=False)
    change_reason = Column(String(200))             # 变更原因
    change_source = Column(String(100))             # 变更来源（如"card_effect", "event_reward"）
    
    # 系统字段
    created_at = Column(Integer, nullable=False)
    
    # 关联关系
    character = relationship("PlayerCharacter", back_populates="attribute_history")

class PlayerGameSession(Base):
    """玩家游戏会话记录"""
    __tablename__ = "player_game_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    
    # 会话信息
    session_start = Column(Integer, nullable=False)
    session_end = Column(Integer)
    current_scene = Column(String(50))              # 当前场景
    game_state = Column(JSON, default=dict)         # 游戏状态
    
    # 统计信息
    scenes_completed = Column(Integer, default=0)   # 完成的场景数
    npcs_killed = Column(Integer, default=0)        # 杀死的NPC数量
    cards_used = Column(Integer, default=0)         # 使用的卡片数量
    attribute_points_gained = Column(Integer, default=0)  # 获得的属性点
    
    # 系统字段
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)
    updated_at = Column(Integer)
    
    # 关联关系
    player = relationship("Player", back_populates="game_sessions")