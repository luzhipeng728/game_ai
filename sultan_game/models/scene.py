from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, ForeignKey, Enum
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
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
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
    
    # 额外字段 (为了兼容现有数据库)
    scene_type = Column(String(50))
    difficulty_level = Column(Integer)
    estimated_duration = Column(Integer)
    is_repeatable = Column(Boolean)
    max_attempts = Column(Integer)
    cooldown_hours = Column(Integer)
    
    # 进入条件
    attribute_requirements = Column(Text, default='{}')  # 属性要求
    card_requirements = Column(Text, default='{}')      # 卡片要求
    prerequisites = Column(Text, default='{}')          # 前置条件
    restrictions = Column(Text, default='{}')           # 进入限制
    
    # 玩家NPC配置
    min_player_npcs = Column(Integer, default=1)
    max_player_npcs = Column(Integer, default=3)
    recommended_npc_types = Column(Text, default='[]')
    special_bonuses = Column(Text, default='{}')
    
    # AI Prompt配置
    narrator_prompt = Column(Text, nullable=False)
    evaluator_config = Column(Text, default='{}')
    
    # 奖励配置
    success_rewards = Column(Text, default='{}')
    failure_penalties = Column(Text, default='{}')
    
    # 特殊机制
    dynamic_events = Column(Text, default='[]')
    hidden_elements = Column(Text, default='{}')
    
    # 场景展示配置
    card_count = Column(Integer, default=0)  # 折卡数量
    prerequisite_scenes = Column(JSON, default=list)  # 前置场景列表 (JSON array)
    days_required = Column(Integer, default=0)  # 天数要求
    
    # 系统字段
    status = Column(Enum(SceneStatus), default=SceneStatus.DRAFT)
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)
    updated_at = Column(Integer)
    
    # 关联关系
    scene_npcs = relationship("SceneNPC", back_populates="scene")

class SceneNPC(Base):
    __tablename__ = "scene_npcs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    npc_id = Column(String(36), ForeignKey("npcs.id"), nullable=False)
    
    # 场景中的角色设定
    role = Column(String(50))  # main_antagonist, supporter, etc.
    initial_position = Column(String(50))
    special_behavior = Column(String(50))
    can_be_challenged = Column(Boolean, default=True)
    
    # 关联关系
    scene = relationship("Scene", back_populates="scene_npcs")
    npc = relationship("NPC")