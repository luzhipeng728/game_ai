from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, ForeignKey, Enum, Float
from sqlalchemy.orm import relationship
from core.database import Base
import uuid
import enum

class SceneCategory(enum.Enum):
    MAIN_STORY = "main_story"  # 主线剧情
    SIDE_QUEST = "side_quest"  # 支线任务
    FACTION = "faction"        # 阵营场景
    RANDOM = "random"          # 随机事件

class TimeOfDay(enum.Enum):
    MORNING = "morning"
    AFTERNOON = "afternoon"
    EVENING = "evening"
    NIGHT = "night"

class SceneStatus(enum.Enum):
    DRAFT = "draft"          # 草稿
    ACTIVE = "active"        # 激活
    TESTING = "testing"      # 测试中
    ARCHIVED = "archived"    # 已归档

class Scene(Base):
    """场景基础信息"""
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
    
    # 场景设定
    scene_type = Column(String(50))  # "political", "military", "diplomatic", "stealth"
    difficulty_level = Column(Integer, default=1)  # 难度等级
    estimated_duration = Column(Integer)  # 预计时长（分钟）
    
    # 重复设定
    is_repeatable = Column(Boolean, default=False)
    max_attempts = Column(Integer, default=1)
    cooldown_hours = Column(Integer, default=0)
    
    # 系统字段
    status = Column(Enum(SceneStatus), default=SceneStatus.DRAFT)
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)
    updated_at = Column(Integer)
    
    # 关联关系
    entry_requirements = relationship("SceneEntryRequirement", back_populates="scene", uselist=False)
    npc_configurations = relationship("SceneNPCConfiguration", back_populates="scene")
    ai_configurations = relationship("SceneAIConfiguration", back_populates="scene")
    rewards = relationship("SceneReward", back_populates="scene", uselist=False)
    dynamic_events = relationship("SceneDynamicEvent", back_populates="scene")
    analytics = relationship("SceneAnalytics", back_populates="scene")

class SceneEntryRequirement(Base):
    """场景进入条件"""
    __tablename__ = "scene_entry_requirements"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    
    # 属性要求
    player_reputation_min = Column(Integer)
    any_npc_int_min = Column(Integer)  # 任一NPC智力要求
    total_str_min = Column(Integer)    # 所有NPC武力总和要求
    total_cha_min = Column(Integer)    # 所有NPC魅力总和要求
    
    # 卡片要求
    required_cards = Column(JSON, default=list)  # 必需卡片（消耗）
    # 格式: [{"card_id": "court_pass", "consume": true, "quantity": 1}]
    
    optional_cards = Column(JSON, default=list)  # 可选卡片（不消耗）
    # 格式: [{"card_id": "bribe_gold", "effect": "initial_favor+10"}]
    
    # 前置条件
    completed_scenes = Column(JSON, default=list)  # 必须完成的场景
    game_day_min = Column(Integer)  # 游戏天数要求
    faction_relations = Column(JSON, default=dict)  # 阵营关系要求
    # 格式: {"minister": 20, "military": 10}
    
    # 进入限制
    max_player_npcs = Column(Integer, default=3)
    min_player_npcs = Column(Integer, default=1)
    recommended_npc_types = Column(JSON, default=list)  # 推荐NPC类型
    
    # 特殊要求
    special_conditions = Column(JSON, default=list)
    # 格式: [{"type": "time_restriction", "value": "night_only"}]
    
    # 关联关系
    scene = relationship("Scene", back_populates="entry_requirements")

class SceneNPCConfiguration(Base):
    """场景NPC配置"""
    __tablename__ = "scene_npc_configurations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    npc_id = Column(String(36), ForeignKey("npcs.id"), nullable=False)
    
    # 在场景中的角色
    role = Column(String(50))  # "main_antagonist", "supporter", "observer"
    initial_position = Column(String(50))  # "center", "left", "right"
    speaking_order_priority = Column(Integer, default=0)  # 发言顺序优先级
    
    # 行为配置
    special_behavior = Column(String(50))  # "aggressive", "defensive", "neutral"
    can_be_challenged = Column(Boolean, default=True)  # 可被挑战战斗
    can_be_converted = Column(Boolean, default=False)   # 可被转化
    
    # 场景特定属性修饰
    attribute_modifiers = Column(JSON, default=dict)
    # 格式: {"strength": "+10", "charisma": "-5"}
    
    # 特殊触发条件
    special_triggers = Column(JSON, default=list)
    # 格式: [{"trigger": "player_hostility_high", "action": "leave_scene"}]
    
    # 关联关系
    scene = relationship("Scene", back_populates="npc_configurations")
    npc = relationship("NPC")

class SceneAIConfiguration(Base):
    """场景AI配置"""
    __tablename__ = "scene_ai_configurations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    
    # 旁白AI配置
    narrator_prompt = Column(Text, nullable=False)
    narrator_style = Column(String(50))  # "political_intrigue", "military_tension"
    narrator_trigger_frequency = Column(Integer, default=3)  # 每几轮触发一次
    
    # 评分AI配置
    evaluator_weights = Column(JSON, default=dict)
    # 格式: {"story_progress": 0.4, "dialogue_quality": 0.3, "tension_level": 0.3}
    
    evaluator_thresholds = Column(JSON, default=dict)
    # 格式: {"dice_trigger": 75, "tension_trigger": 85}
    
    success_criteria = Column(JSON, default=dict)
    # 格式: {"dice_required": 5, "special_condition": "minister_trust>60"}
    
    # 话术生成AI配置
    option_generation_style = Column(JSON, default=dict)
    # 格式: {"styles": ["diplomatic", "aggressive", "clever"], "bias": "diplomatic"}
    
    effect_value_ranges = Column(JSON, default=dict)
    # 格式: {"emotion_change": [-5, 5], "progress_change": [0, 10]}
    
    # 场景特定AI指令
    scene_specific_instructions = Column(Text)
    
    # 关联关系
    scene = relationship("Scene", back_populates="ai_configurations")

class SceneReward(Base):
    """场景奖励配置"""
    __tablename__ = "scene_rewards"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    
    # 成功奖励
    success_attribute_points = Column(Integer, default=15)
    success_experience = Column(Integer, default=100)
    success_reputation = Column(Integer, default=10)
    success_gold = Column(Integer, default=0)
    
    # 成功物品奖励
    success_guaranteed_items = Column(JSON, default=list)
    # 格式: [{"type": "card", "item_id": "minister_spy", "quantity": 1}]
    
    success_random_items = Column(JSON, default=list)
    # 格式: [{"type": "card", "item_id": "political_leverage", "probability": 0.5}]
    
    # 成功解锁内容
    unlocked_scenes = Column(JSON, default=list)
    unlocked_features = Column(JSON, default=list)
    unlocked_npcs = Column(JSON, default=list)
    
    # 失败惩罚
    failure_reputation = Column(Integer, default=-5)
    failure_faction_relations = Column(JSON, default=dict)
    # 格式: {"minister": -10, "military": -5}
    
    failure_triggered_events = Column(JSON, default=list)
    # 格式: ["minister_suspicion", "increased_security"]
    
    # 完美通关奖励（额外奖励）
    perfect_bonus_conditions = Column(JSON, default=list)
    # 格式: [{"type": "no_combat", "bonus": "extra_card"}]
    
    perfect_bonus_rewards = Column(JSON, default=dict)
    
    # 关联关系
    scene = relationship("Scene", back_populates="rewards")

class SceneDynamicEvent(Base):
    """场景动态事件"""
    __tablename__ = "scene_dynamic_events"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    
    # 事件基础信息
    event_id = Column(String(50), nullable=False)
    event_name = Column(String(100), nullable=False)
    event_description = Column(Text)
    
    # 触发条件
    trigger_type = Column(String(50))  # "round_number", "condition_met", "probability"
    trigger_value = Column(String(100))  # "round_5", "hostility>80", "0.3"
    
    # 事件效果
    event_effects = Column(JSON, default=dict)
    # 格式: {"new_npc": "unexpected_visitor", "scene_modifier": "tension+20"}
    
    # 事件结果选项
    event_choices = Column(JSON, default=list)
    # 格式: [{"text": "欢迎访客", "effect": "favor+10"}, {"text": "拒绝进入", "effect": "tension+5"}]
    
    # 触发概率和限制
    trigger_probability = Column(Float, default=1.0)
    max_triggers = Column(Integer, default=1)  # 最多触发次数
    current_triggers = Column(Integer, default=0)  # 当前触发次数
    
    # 关联关系
    scene = relationship("Scene", back_populates="dynamic_events")

class ScenePlaySession(Base):
    """场景游玩会话"""
    __tablename__ = "scene_play_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    
    # 会话基础信息
    started_at = Column(Integer, nullable=False)
    ended_at = Column(Integer)
    session_status = Column(String(20))  # "ongoing", "success", "failure", "abandoned"
    
    # 玩家配置
    player_npcs_used = Column(JSON, default=list)  # 使用的玩家NPC
    cards_used = Column(JSON, default=list)        # 使用的卡片
    
    # 游戏进程
    total_rounds = Column(Integer, default=0)
    total_speeches = Column(Integer, default=0)
    combats_occurred = Column(Integer, default=0)
    
    # 最终结果
    final_dice_roll = Column(JSON)  # 最终骰子结果
    success_achieved = Column(Boolean, default=False)
    failure_reason = Column(String(100))
    
    # 奖励记录
    rewards_received = Column(JSON, default=dict)
    penalties_applied = Column(JSON, default=dict)
    
    # 统计数据
    avg_round_duration = Column(Float)  # 平均每轮时长
    dialogue_quality_score = Column(Float)
    final_story_progress = Column(Integer)
    final_tension_level = Column(Integer)
    
    # 关联关系
    scene = relationship("Scene")
    player = relationship("Player")

class SceneAnalytics(Base):
    """场景数据分析"""
    __tablename__ = "scene_analytics"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    
    # 统计周期
    analysis_period_start = Column(Integer, nullable=False)
    analysis_period_end = Column(Integer, nullable=False)
    
    # 基础统计
    total_attempts = Column(Integer, default=0)
    successful_completions = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    
    # 游戏进程统计
    avg_rounds_per_session = Column(Float, default=0.0)
    avg_duration_minutes = Column(Float, default=0.0)
    avg_combats_per_session = Column(Float, default=0.0)
    
    # 玩家选择分析
    popular_npc_combinations = Column(JSON, default=dict)
    popular_cards_used = Column(JSON, default=dict)
    common_failure_points = Column(JSON, default=dict)
    
    # 平衡性分析
    difficulty_rating = Column(Float, default=5.0)  # 1-10评分
    balance_score = Column(Float, default=5.0)      # 平衡性评分
    suggested_adjustments = Column(JSON, default=list)
    
    # 关联关系
    scene = relationship("Scene", back_populates="analytics")