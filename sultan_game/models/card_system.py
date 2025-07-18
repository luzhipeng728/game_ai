from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, ForeignKey, Enum, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from core.database import Base
import uuid
import enum

class EffectType(enum.Enum):
    IMMEDIATE = "immediate"      # 立即效果
    DURATION = "duration"        # 持续效果
    PERMANENT = "permanent"      # 永久效果
    CONDITIONAL = "conditional"  # 条件效果

class EffectTarget(enum.Enum):
    SELF = "self"               # 自己
    NPC = "npc"                 # 目标NPC
    SCENE = "scene"             # 场景
    GLOBAL = "global"           # 全局

class CardEffect(Base):
    """卡片效果配置表"""
    __tablename__ = "card_effects"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    effect_id = Column(String(50), unique=True, nullable=False)
    effect_name = Column(String(100), nullable=False)
    
    # 效果类型
    effect_type = Column(Enum(EffectType), nullable=False)
    effect_target = Column(Enum(EffectTarget), nullable=False)
    
    # 效果计算
    effect_formula = Column(Text)               # 效果计算公式
    base_value = Column(Float, default=0.0)     # 基础数值
    scaling_factor = Column(Float, default=1.0) # 缩放因子
    
    # 条件配置
    trigger_conditions = Column(JSON, default=list)
    target_conditions = Column(JSON, default=list)
    
    # 持续时间配置
    duration_type = Column(String(20))          # rounds/scenes/permanent
    duration_value = Column(Integer, default=1)
    
    # 效果描述
    description = Column(Text)
    hidden_description = Column(Text)           # 隐藏描述(玩家不可见)
    
    # 关联关系
    card_effect_configs = relationship("CardEffectConfig", back_populates="effect")

class CardEffectConfig(Base):
    """卡片-效果关联配置"""
    __tablename__ = "card_effect_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    card_id = Column(UUID(as_uuid=True), ForeignKey("cards.id"), nullable=False)
    effect_id = Column(UUID(as_uuid=True), ForeignKey("card_effects.id"), nullable=False)
    
    # 效果在此卡片中的配置
    effect_priority = Column(Integer, default=0)    # 执行优先级
    effect_multiplier = Column(Float, default=1.0)  # 效果倍数
    
    # 覆盖配置
    override_config = Column(JSON, default=dict)
    
    # 关联关系
    card = relationship("Card")
    effect = relationship("CardEffect", back_populates="card_effect_configs")

class CardSet(Base):
    """卡片套装配置"""
    __tablename__ = "card_sets"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    set_id = Column(String(50), unique=True, nullable=False)
    set_name = Column(String(100), nullable=False)
    
    # 套装描述
    description = Column(Text)
    theme = Column(String(50))
    
    # 套装配置
    required_cards = Column(JSON, default=list)    # 需要的卡片
    set_bonuses = Column(JSON, default=dict)       # 套装奖励配置
    
    # 激活条件
    min_cards_required = Column(Integer, default=2)
    
    # 关联关系
    set_bonuses_rel = relationship("CardSetBonus", back_populates="card_set")

class CardSetBonus(Base):
    """套装奖励配置"""
    __tablename__ = "card_set_bonuses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    set_id = Column(UUID(as_uuid=True), ForeignKey("card_sets.id"), nullable=False)
    
    # 激活条件
    cards_required = Column(Integer, nullable=False)  # 需要套装中几张卡
    
    # 奖励效果
    bonus_effects = Column(JSON, default=list)
    bonus_description = Column(Text)
    
    # 关联关系
    card_set = relationship("CardSet", back_populates="set_bonuses_rel")

class CardSynergy(Base):
    """卡片联动效果"""
    __tablename__ = "card_synergies"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    synergy_id = Column(String(50), unique=True, nullable=False)
    synergy_name = Column(String(100), nullable=False)
    
    # 联动条件
    required_cards = Column(JSON, nullable=False)      # 需要的卡片组合
    required_context = Column(JSON, default=dict)      # 需要的上下文条件
    
    # 联动效果
    synergy_effects = Column(JSON, default=list)
    synergy_description = Column(Text)
    
    # 激活统计
    activation_count = Column(Integer, default=0)
    
class CardUsageRecord(Base):
    """卡片使用记录"""
    __tablename__ = "card_usage_records"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    card_id = Column(UUID(as_uuid=True), ForeignKey("cards.id"), nullable=False)
    scene_id = Column(UUID(as_uuid=True), ForeignKey("scenes.id"), nullable=True)
    
    # 使用情况
    used_at = Column(Integer, nullable=False)
    use_context = Column(JSON, default=dict)
    
    # 效果结果
    effects_applied = Column(JSON, default=list)
    success = Column(Boolean, default=True)
    
    # 关联关系
    player = relationship("Player")
    card = relationship("Card")
    scene = relationship("Scene")

class EffectInstance(Base):
    """效果实例(正在生效的效果)"""
    __tablename__ = "effect_instances"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    effect_id = Column(UUID(as_uuid=True), ForeignKey("card_effects.id"), nullable=False)
    player_id = Column(UUID(as_uuid=True), ForeignKey("players.id"), nullable=False)
    
    # 效果来源
    source_card_id = Column(UUID(as_uuid=True), ForeignKey("cards.id"))
    source_type = Column(String(50))  # card/set_bonus/synergy
    
    # 目标信息
    target_id = Column(String(100))   # 目标ID
    target_type = Column(String(50))  # npc/scene/global
    
    # 效果状态
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer, nullable=False)
    expires_at = Column(Integer)  # 过期时间，NULL为永久
    
    # 效果数值
    current_value = Column(Float)
    stacks = Column(Integer, default=1)  # 叠加层数
    
    # 效果上下文
    effect_context = Column(JSON, default=dict)
    
    # 关联关系
    effect = relationship("CardEffect")
    player = relationship("Player")
    source_card = relationship("Card")

class CardBalanceConfig(Base):
    """卡片平衡配置"""
    __tablename__ = "card_balance_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_name = Column(String(100), nullable=False)
    
    # 稀有度数值标准
    rarity_standards = Column(JSON, default=dict)
    
    # 效果数值范围
    effect_value_ranges = Column(JSON, default=dict)
    
    # 使用限制标准
    usage_restrictions = Column(JSON, default=dict)
    
    # 成本标准
    cost_standards = Column(JSON, default=dict)
    
    # 平衡测试结果
    balance_test_results = Column(JSON, default=dict)
    
    # 配置元数据
    version = Column(String(20), default="1.0")
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)

class CardMetrics(Base):
    """卡片使用统计"""
    __tablename__ = "card_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    card_id = Column(UUID(as_uuid=True), ForeignKey("cards.id"), nullable=False)
    
    # 统计周期
    date_start = Column(Integer, nullable=False)
    date_end = Column(Integer, nullable=False)
    
    # 使用统计
    total_usage = Column(Integer, default=0)
    unique_users = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    
    # 效果统计
    average_effect_value = Column(Float, default=0.0)
    effect_distribution = Column(JSON, default=dict)
    
    # 场景使用分布
    scene_usage_distribution = Column(JSON, default=dict)
    
    # 平衡性指标
    power_level = Column(Float, default=0.0)
    versatility_score = Column(Float, default=0.0)
    
    # 关联关系
    card = relationship("Card")