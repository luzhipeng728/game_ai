from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, Enum
from sqlalchemy.dialects.postgresql import UUID
from core.database import Base
import uuid
import enum

class CardRarity(enum.Enum):
    COMMON = "common"
    RARE = "rare" 
    EPIC = "epic"
    LEGENDARY = "legendary"

class CardType(enum.Enum):
    PASS = "pass"           # 通行证
    ATTRIBUTE = "attribute" # 属性加成
    INFLUENCE = "influence" # 影响力
    SPECIAL = "special"     # 特殊效果

class UseTiming(enum.Enum):
    SCENE_ENTRY = "scene_entry"
    DIALOGUE = "dialogue"
    ANYTIME = "anytime"

class Card(Base):
    __tablename__ = "cards"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    card_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    rarity = Column(Enum(CardRarity), nullable=False)
    card_type = Column(Enum(CardType), nullable=False)
    sub_type = Column(String(50))  # 子分类
    
    # 外观
    icon = Column(String(255))
    card_art = Column(String(255))
    flavor_text = Column(Text)
    
    # 效果配置
    primary_effects = Column(JSON, default=list)      # 主要效果
    conditional_effects = Column(JSON, default=list)  # 条件效果
    side_effects = Column(JSON, default=list)         # 副作用
    
    # 使用限制
    use_timing = Column(Enum(UseTiming), default=UseTiming.ANYTIME)
    consumable = Column(Boolean, default=True)
    stack_limit = Column(Integer, default=1)
    use_requirements = Column(JSON, default=dict)
    cooldown = Column(Integer, default=0)  # 冷却回合数
    
    # 获取方式
    shop_config = Column(JSON, default=dict)      # 商店配置
    drop_sources = Column(JSON, default=list)     # 掉落来源
    crafting_recipe = Column(JSON, default=dict)  # 合成配方
    quest_rewards = Column(JSON, default=list)    # 任务奖励
    
    # 特殊交互
    set_bonus = Column(JSON, default=dict)        # 套装效果
    synergies = Column(JSON, default=list)        # 卡片联动
    story_impact = Column(JSON, default=dict)     # 故事影响
    
    # 系统字段
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)
    updated_at = Column(Integer)