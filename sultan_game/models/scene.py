from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from core.database import Base
import uuid
import enum

class SceneCategory(enum.Enum):
    MAIN_STORY = "main_story"
    SIDE_QUEST = "side_quest" 
    FACTION = "faction"
    RANDOM = "random"

class TimeOfDay(enum.Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"

class SceneStatus(enum.Enum):
    DRAFT = "draft"
    ACTIVE = "active"
    COMPLETED = "completed"
    DISABLED = "disabled"

class Scene(Base):
    __tablename__ = "scenes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scene_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    category = Column(Enum(SceneCategory), nullable=False)
    chapter = Column(Integer, default=1)
    
    # 场景描述
    description = Column(Text)
    background_image = Column(String(255))
    background_music = Column(String(255))
    location = Column(String(100))
    time_of_day = Column(Enum(TimeOfDay))
    weather = Column(String(50))
    
    # 进入条件
    attribute_requirements = Column(JSON, default=dict)  # 属性要求
    card_requirements = Column(JSON, default=dict)      # 卡片要求
    prerequisites = Column(JSON, default=dict)          # 前置条件
    restrictions = Column(JSON, default=dict)           # 进入限制
    
    # 玩家NPC配置
    min_player_npcs = Column(Integer, default=1)
    max_player_npcs = Column(Integer, default=3)
    recommended_npc_types = Column(JSON, default=list)
    special_bonuses = Column(JSON, default=dict)
    
    # AI Prompt配置
    narrator_prompt = Column(Text, nullable=False)
    evaluator_config = Column(JSON, default=dict)
    
    # 奖励配置
    success_rewards = Column(JSON, default=dict)
    failure_penalties = Column(JSON, default=dict)
    
    # 特殊机制
    dynamic_events = Column(JSON, default=list)
    hidden_elements = Column(JSON, default=dict)
    
    # 系统字段
    status = Column(Enum(SceneStatus), default=SceneStatus.DRAFT)
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)
    updated_at = Column(Integer)
    
    # 关联关系
    scene_npcs = relationship("SceneNPC", back_populates="scene")

class SceneNPC(Base):
    __tablename__ = "scene_npcs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scene_id = Column(UUID(as_uuid=True), ForeignKey("scenes.id"), nullable=False)
    npc_id = Column(UUID(as_uuid=True), ForeignKey("npcs.id"), nullable=False)
    
    # 场景中的角色设定
    role = Column(String(50))  # main_antagonist, supporter, etc.
    initial_position = Column(String(50))
    special_behavior = Column(String(50))
    can_be_challenged = Column(Boolean, default=True)
    
    # 关联关系
    scene = relationship("Scene", back_populates="scene_npcs")
    npc = relationship("NPC")