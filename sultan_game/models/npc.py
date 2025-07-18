from sqlalchemy import Column, Integer, String, Boolean, JSON, Text, Enum
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base
import uuid
import enum

class NPCType(enum.Enum):
    GAME_NPC = "game_npc"
    PLAYER_NPC = "player_npc"

class Tier(enum.Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    LEGENDARY = "legendary"

class Faction(enum.Enum):
    SULTAN = "sultan"
    MINISTER = "minister" 
    MILITARY = "military"
    BLACKDUCK = "blackduck"

class NPC(Base):
    __tablename__ = "npcs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    npc_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    npc_type = Column(Enum(NPCType), nullable=False)
    tier = Column(Enum(Tier), nullable=False)
    faction = Column(Enum(Faction), nullable=False)
    
    # 外观描述
    avatar = Column(String(255))
    description = Column(Text)
    appearance = Column(Text)
    
    # 核心属性
    intelligence = Column(Integer, nullable=False)  # INT 1-20
    strength = Column(Integer, nullable=False)      # STR 1-100
    defense = Column(Integer, nullable=False)       # DEF 1-100  
    hp_max = Column(Integer, nullable=False)        # HP 1-500
    
    # 社交属性 (可选)
    charisma = Column(Integer, default=50)          # CHA 1-100
    loyalty = Column(Integer, default=50)           # LOY 1-100
    fear = Column(Integer, default=0)               # FEAR 1-100
    
    # 特殊属性
    custom_attributes = Column(JSON, default=dict)  # 自定义属性
    
    # AI行为配置
    personality_traits = Column(JSON, default=list)  # 性格特征
    speaking_style = Column(JSON, default=dict)      # 说话风格
    emotion_thresholds = Column(JSON, default=dict)  # 情绪阈值
    dialogue_goals = Column(JSON, default=dict)      # 对话目标
    
    # 死亡掉落配置 (仅游戏NPC)
    attribute_points_drop = Column(Integer, default=0)
    guaranteed_drops = Column(JSON, default=list)
    random_drops = Column(JSON, default=list)
    special_rewards = Column(JSON, default=dict)
    
    # 转化配置
    can_convert = Column(Boolean, default=False)
    convert_conditions = Column(JSON, default=list)
    convert_cost = Column(JSON, default=dict)
    
    # 系统字段
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)  # 时间戳
    updated_at = Column(Integer)  # 时间戳