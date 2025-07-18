from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from core.database import Base
import uuid
import enum

class RequirementType(enum.Enum):
    ATTRIBUTE = "attribute"      # 属性要求
    CARD = "card"               # 卡片要求
    NPC = "npc"                 # NPC要求
    ITEM = "item"               # 道具要求
    RELATIONSHIP = "relationship" # 关系要求

class ComparisonOperator(enum.Enum):
    GREATER_THAN = ">"
    GREATER_EQUAL = ">="
    LESS_THAN = "<"
    LESS_EQUAL = "<="
    EQUAL = "=="
    NOT_EQUAL = "!="
    IN = "in"
    NOT_IN = "not_in"

class SceneRequirement(Base):
    """场景进入要求配置"""
    __tablename__ = "scene_requirements"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    
    # 要求基本信息
    requirement_type = Column(Enum(RequirementType), nullable=False)
    requirement_name = Column(String(100), nullable=False)  # 要求名称，如"力量"、"智慧"
    description = Column(Text)  # 要求描述
    
    # 要求条件
    operator = Column(Enum(ComparisonOperator), nullable=False)
    required_value = Column(JSON)  # 要求的值，可以是数字、字符串、数组等
    
    # 要求配置
    is_mandatory = Column(Boolean, default=True)  # 是否强制要求
    priority = Column(Integer, default=1)  # 优先级
    error_message = Column(Text)  # 不满足时的错误提示
    
    # 特殊配置
    allow_substitution = Column(Boolean, default=False)  # 是否允许替代满足
    substitution_rules = Column(JSON, default=dict)  # 替代规则
    
    # 动态要求
    is_dynamic = Column(Boolean, default=False)  # 是否为动态要求
    dynamic_formula = Column(Text)  # 动态计算公式
    
    # 关联关系
    scene = relationship("Scene")

class SceneCardBinding(Base):
    """场景卡片绑定配置"""
    __tablename__ = "scene_card_bindings"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    card_id = Column(String(36), ForeignKey("cards.id"), nullable=False)
    
    # 绑定类型
    binding_type = Column(String(50), nullable=False)  # required, optional, bonus
    
    # 使用配置
    max_uses_per_scene = Column(Integer, default=1)  # 场景中最大使用次数
    cooldown_rounds = Column(Integer, default=0)  # 冷却轮数
    
    # 效果加成
    scene_effect_modifier = Column(Float, default=1.0)  # 在此场景中的效果倍数
    special_effects = Column(JSON, default=dict)  # 特殊效果
    
    # 条件配置
    unlock_conditions = Column(JSON, default=dict)  # 解锁条件
    visibility_conditions = Column(JSON, default=dict)  # 可见性条件
    
    # 奖励相关
    usage_reward_bonus = Column(JSON, default=dict)  # 使用此卡片的额外奖励
    
    # 关联关系
    scene = relationship("Scene")
    card = relationship("Card")

class SceneRewardExtended(Base):
    """场景扩展奖励配置"""
    __tablename__ = "scene_rewards_extended"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    
    # 基础数值奖励
    success_attribute_points = Column(Integer, default=0)
    success_experience = Column(Integer, default=0)
    success_reputation = Column(Integer, default=0)
    success_gold = Column(Integer, default=0)
    
    # 失败惩罚
    failure_reputation = Column(Integer, default=0)
    failure_gold = Column(Integer, default=0)
    failure_attribute_penalty = Column(Integer, default=0)
    
    # 卡片奖励
    reward_cards = Column(JSON, default=list)  # 奖励的卡片列表
    card_reward_probability = Column(JSON, default=dict)  # 卡片奖励概率
    
    # NPC奖励
    reward_npcs = Column(JSON, default=list)  # 奖励的NPC列表
    npc_reward_conditions = Column(JSON, default=dict)  # NPC奖励条件
    
    # 特殊奖励
    special_rewards = Column(JSON, default=dict)  # 特殊奖励
    unlock_content = Column(JSON, default=list)  # 解锁的内容
    
    # 奖励条件
    perfect_completion_bonus = Column(JSON, default=dict)  # 完美完成奖励
    time_bonus = Column(JSON, default=dict)  # 时间奖励
    efficiency_bonus = Column(JSON, default=dict)  # 效率奖励
    
    # 动态奖励
    dynamic_reward_formula = Column(Text)  # 动态奖励计算公式
    performance_multiplier = Column(Float, default=1.0)  # 表现倍数
    
    # 关联关系
    scene = relationship("Scene")

class PlayerNPCReward(Base):
    """玩家NPC奖励配置"""
    __tablename__ = "player_npc_rewards"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_reward_id = Column(String(36), ForeignKey("scene_rewards_extended.id"), nullable=False)
    
    # NPC选择
    npc_selection_type = Column(String(50), nullable=False)  # specific, random, player_choice
    specific_npc_id = Column(String(36), ForeignKey("player_npc_instances.id"))  # 特定NPC
    npc_faction_filter = Column(String(50))  # 按阵营筛选
    npc_rarity_filter = Column(String(50))  # 按稀有度筛选
    
    # 奖励数量
    min_npc_count = Column(Integer, default=1)
    max_npc_count = Column(Integer, default=1)
    
    # 奖励条件
    reward_conditions = Column(JSON, default=dict)  # 获得NPC的条件
    probability = Column(Float, default=1.0)  # 获得概率
    
    # NPC配置
    npc_level_bonus = Column(Integer, default=0)  # NPC等级加成
    npc_attribute_bonus = Column(JSON, default=dict)  # NPC属性加成
    special_abilities = Column(JSON, default=list)  # 特殊能力
    
    # 关联关系
    scene_reward = relationship("SceneRewardExtended")
    specific_npc = relationship("PlayerNPCInstance", foreign_keys=[specific_npc_id])

class CardReward(Base):
    """卡片奖励配置"""
    __tablename__ = "card_rewards"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_reward_id = Column(String(36), ForeignKey("scene_rewards_extended.id"), nullable=False)
    
    # 卡片选择
    card_selection_type = Column(String(50), nullable=False)  # specific, random, rarity_based
    specific_card_id = Column(String(36), ForeignKey("cards.id"))  # 特定卡片
    card_rarity_filter = Column(String(50))  # 按稀有度筛选
    card_category_filter = Column(String(50))  # 按类别筛选
    
    # 奖励数量
    min_card_count = Column(Integer, default=1)
    max_card_count = Column(Integer, default=1)
    
    # 奖励条件
    reward_conditions = Column(JSON, default=dict)  # 获得卡片的条件
    probability = Column(Float, default=1.0)  # 获得概率
    
    # 卡片配置
    card_level_bonus = Column(Integer, default=0)  # 卡片等级加成
    special_modifiers = Column(JSON, default=dict)  # 特殊修饰符
    
    # 关联关系
    scene_reward = relationship("SceneRewardExtended")
    specific_card = relationship("Card", foreign_keys=[specific_card_id])