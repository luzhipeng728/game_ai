from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from core.database import Base
import uuid
import enum

class CardRarity(enum.Enum):
    COMMON = "common"      # 普通（白色）
    RARE = "rare"          # 稀有（蓝色）
    EPIC = "epic"          # 史诗（紫色）
    LEGENDARY = "legendary" # 传说（橙色）

class CardCategory(enum.Enum):
    PASS = "pass"           # 通行证类
    ATTRIBUTE = "attribute" # 属性增强类
    INFLUENCE = "influence" # 影响判定类
    SPECIAL = "special"     # 特殊功能类

class EffectType(enum.Enum):
    IMMEDIATE = "immediate"    # 立即效果
    DURATION = "duration"      # 持续效果
    PERMANENT = "permanent"    # 永久效果

class EffectTarget(enum.Enum):
    SELF = "self"           # 自己
    NPC = "npc"             # 目标NPC
    SCENE = "scene"         # 场景
    GLOBAL = "global"       # 全局

class UseTiming(enum.Enum):
    SCENE_START = "scene_start"     # 场景开始前
    DIALOGUE = "dialogue"           # 对话过程中
    COMBAT = "combat"               # 战斗触发时
    ANYTIME = "anytime"             # 任意时刻

class Card(Base):
    """卡片基础信息"""
    __tablename__ = "cards"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    card_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    
    # 基础分类
    rarity = Column(Enum(CardRarity), nullable=False)
    category = Column(Enum(CardCategory), nullable=False)
    sub_category = Column(String(50))  # 如 "social", "military", "political"
    
    # 外观和描述
    icon = Column(String(255))
    card_art = Column(String(255))
    flavor_text = Column(Text)  # 风味文本
    description = Column(Text)  # 效果描述
    
    # 平衡参数（基于稀有度）
    attribute_bonus_min = Column(Integer, default=0)  # 属性加成最小值
    attribute_bonus_max = Column(Integer, default=0)  # 属性加成最大值
    base_duration = Column(String(50))  # 基础持续时间
    cooldown_turns = Column(Integer, default=0)  # 冷却回合数
    base_cost = Column(Integer, default=0)  # 基础价格
    
    # 使用限制
    max_stack = Column(Integer, default=3)  # 最多携带数量
    use_timing = Column(Enum(UseTiming), default=UseTiming.ANYTIME)
    is_consumable = Column(Boolean, default=True)  # 是否为消耗品
    
    # 使用条件
    use_conditions = Column(JSON, default=dict)
    # 格式: {"level_min": 1, "reputation_min": 20, "faction_required": "military"}
    
    # 系统字段
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)
    updated_at = Column(Integer)
    
    # 关联关系
    effects = relationship("CardEffect", back_populates="card")
    player_cards = relationship("PlayerCard", back_populates="card")
    set_memberships = relationship("CardSetMembership", back_populates="card")

class CardEffect(Base):
    """卡片效果配置"""
    __tablename__ = "card_effects"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    card_id = Column(String(36), ForeignKey("cards.id"), nullable=False)
    
    # 效果基础信息
    effect_name = Column(String(100), nullable=False)
    effect_type = Column(Enum(EffectType), nullable=False)
    effect_target = Column(Enum(EffectTarget), nullable=False)
    
    # 效果数值
    effect_value = Column(Float)  # 效果数值
    target_attribute = Column(String(50))  # 目标属性 (STR, INT, DEF, etc.)
    
    # 持续时间配置
    duration_type = Column(String(50))  # "single_scene", "3_scenes", "permanent", "turns"
    duration_value = Column(Integer)    # 持续数值（回合数、场景数等）
    
    # 触发条件
    trigger_conditions = Column(JSON, default=list)
    # 格式: [{"type": "target_is_greedy", "value": true}]
    
    # 效果计算公式
    effect_formula = Column(Text)  # 可选的复杂计算公式
    
    # 效果优先级
    priority = Column(Integer, default=0)
    
    # 关联关系
    card = relationship("Card", back_populates="effects")

class CardSet(Base):
    """卡片套装定义"""
    __tablename__ = "card_sets"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    set_id = Column(String(50), unique=True, nullable=False)
    set_name = Column(String(100), nullable=False)
    
    # 套装信息
    description = Column(Text)
    theme = Column(String(50))  # "diplomatic", "military", "stealth"
    
    # 套装配置
    min_cards_for_bonus = Column(Integer, default=2)
    
    # 关联关系
    memberships = relationship("CardSetMembership", back_populates="card_set")
    bonuses = relationship("CardSetBonus", back_populates="card_set")

class CardSetMembership(Base):
    """卡片套装成员关系"""
    __tablename__ = "card_set_memberships"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    set_id = Column(String(36), ForeignKey("card_sets.id"), nullable=False)
    card_id = Column(String(36), ForeignKey("cards.id"), nullable=False)
    
    # 在套装中的位置
    position = Column(Integer, default=0)
    is_core_card = Column(Boolean, default=False)  # 是否为核心卡片
    
    # 关联关系
    card_set = relationship("CardSet", back_populates="memberships")
    card = relationship("Card", back_populates="set_memberships")

class CardSetBonus(Base):
    """套装奖励效果"""
    __tablename__ = "card_set_bonuses"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    set_id = Column(String(36), ForeignKey("card_sets.id"), nullable=False)
    
    # 激活条件
    required_cards_count = Column(Integer, nullable=False)  # 需要几张套装卡片
    
    # 奖励效果
    bonus_type = Column(String(50))  # "attribute_multiplier", "special_ability", "unlock"
    bonus_description = Column(Text)
    bonus_config = Column(JSON, default=dict)
    # 格式: {"effect": "all_diplomatic_options_no_hostility", "value": 1.0}
    
    # 关联关系
    card_set = relationship("CardSet", back_populates="bonuses")

class CardSynergy(Base):
    """卡片联动效果"""
    __tablename__ = "card_synergies"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    synergy_id = Column(String(50), unique=True, nullable=False)
    synergy_name = Column(String(100), nullable=False)
    
    # 联动卡片
    required_cards = Column(JSON, nullable=False)  # [card_id1, card_id2, ...]
    
    # 联动效果
    synergy_type = Column(String(50))  # "enhancement", "new_ability", "cost_reduction"
    synergy_description = Column(Text)
    synergy_config = Column(JSON, default=dict)
    
    # 激活统计
    times_activated = Column(Integer, default=0)

class PlayerCard(Base):
    """玩家持有的卡片"""
    __tablename__ = "player_cards"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    card_id = Column(String(36), ForeignKey("cards.id"), nullable=False)
    
    # 持有信息
    quantity = Column(Integer, default=1)
    obtained_at = Column(Integer)
    obtained_from = Column(String(100))  # "npc_drop", "shop", "reward", "craft"
    
    # 使用统计
    times_used = Column(Integer, default=0)
    last_used_at = Column(Integer)
    
    # 当前状态（对于有冷却的卡片）
    cooldown_until = Column(Integer)  # 冷却结束时间戳
    
    # 关联关系
    player = relationship("Player")
    card = relationship("Card", back_populates="player_cards")

class ActiveCardEffect(Base):
    """当前生效的卡片效果"""
    __tablename__ = "active_card_effects"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    card_id = Column(String(36), ForeignKey("cards.id"), nullable=False)
    effect_id = Column(String(36), ForeignKey("card_effects.id"), nullable=False)
    
    # 效果来源
    source_usage_id = Column(String(100))  # 使用记录ID
    activated_at = Column(Integer, nullable=False)
    
    # 效果目标
    target_type = Column(String(50))  # "player", "npc_instance", "scene", "global"
    target_id = Column(String(100))   # 目标ID
    
    # 效果状态
    is_active = Column(Boolean, default=True)
    expires_at = Column(Integer)  # 过期时间，NULL为永久
    
    # 效果数值（可能被修饰符改变）
    current_value = Column(Float)
    original_value = Column(Float)
    stacks = Column(Integer, default=1)  # 叠加层数
    
    # 效果上下文
    effect_context = Column(JSON, default=dict)
    
    # 关联关系
    player = relationship("Player")
    card = relationship("Card")
    effect = relationship("CardEffect")

class CardBalanceStandard(Base):
    """卡片平衡标准配置"""
    __tablename__ = "card_balance_standards"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    rarity = Column(Enum(CardRarity), nullable=False, unique=True)
    
    # 属性加成范围
    attribute_bonus_min = Column(Integer, nullable=False)
    attribute_bonus_max = Column(Integer, nullable=False)
    
    # 持续时间标准
    standard_duration = Column(String(50), nullable=False)  # "single_scene", "3_scenes", "permanent"
    
    # 使用限制
    standard_cooldown = Column(Integer, default=0)  # 标准冷却回合数
    
    # 价格范围
    cost_min = Column(Integer, nullable=False)
    cost_max = Column(Integer, nullable=False)
    
    # 获取方式
    obtainable_from = Column(JSON, default=list)  # ["shop", "npc_drop", "scene_reward"]
    
    # 使用限制标准
    max_stack_standard = Column(Integer, default=3)
    usage_restrictions = Column(JSON, default=dict)

class CardUsageRecord(Base):
    """卡片使用记录"""
    __tablename__ = "card_usage_records"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    card_id = Column(String(36), ForeignKey("cards.id"), nullable=False)
    
    # 使用情况
    used_at = Column(Integer, nullable=False)
    scene_id = Column(String(36), ForeignKey("scenes.id"))
    use_context = Column(JSON, default=dict)  # 使用时的上下文信息
    
    # 使用结果
    effects_applied = Column(JSON, default=list)  # 实际生效的效果
    was_successful = Column(Boolean, default=True)
    failure_reason = Column(String(200))
    
    # 关联关系
    player = relationship("Player")
    card = relationship("Card")
    scene = relationship("Scene")