from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, ForeignKey, Enum, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from core.database import Base
import uuid
import enum

class SceneStatus(enum.Enum):
    DRAFT = "draft"          # 草稿
    ACTIVE = "active"        # 激活
    TESTING = "testing"      # 测试中
    ARCHIVED = "archived"    # 已归档

class SceneTemplate(Base):
    """场景配置模板"""
    __tablename__ = "scene_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(String(50), unique=True, nullable=False)
    template_name = Column(String(100), nullable=False)
    template_type = Column(String(50))  # 政治、军事、外交等
    
    # 模板描述
    description = Column(Text)
    usage_guide = Column(Text)
    
    # 默认AI配置
    default_ai_configs = Column(JSON, default=dict)
    
    # 默认场景参数
    default_parameters = Column(JSON, default=dict)
    
    # 创建信息
    created_by = Column(String(100))
    created_at = Column(Integer)
    is_public = Column(Boolean, default=True)

class SceneConfig(Base):
    """场景完整配置表 (扩展原scene表)"""
    __tablename__ = "scene_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scene_id = Column(UUID(as_uuid=True), ForeignKey("scenes.id"), nullable=False)
    
    # 配置版本管理
    config_version = Column(String(20), default="1.0")
    status = Column(Enum(SceneStatus), default=SceneStatus.DRAFT)
    
    # 详细的AI配置
    narrator_config = Column(JSON, default=dict)      # 旁白AI配置
    evaluator_config = Column(JSON, default=dict)     # 评分AI配置
    option_generator_config = Column(JSON, default=dict)  # 话术生成AI配置
    
    # 场景流程配置
    expected_rounds = Column(JSON, default={"min": 10, "max": 25})
    key_milestones = Column(JSON, default=list)       # 关键节点配置
    
    # 评分标准详细配置
    scoring_weights = Column(JSON, default=dict)
    trigger_thresholds = Column(JSON, default=dict)
    success_criteria = Column(JSON, default=dict)
    
    # 动态事件配置
    dynamic_events = Column(JSON, default=list)
    event_triggers = Column(JSON, default=dict)
    
    # 奖励配置详细
    reward_formulas = Column(JSON, default=dict)      # 奖励计算公式
    bonus_conditions = Column(JSON, default=list)     # 额外奖励条件
    
    # 测试配置
    test_scenarios = Column(JSON, default=list)       # 测试用例
    balance_parameters = Column(JSON, default=dict)   # 平衡性参数
    
    # 元数据
    last_tested = Column(Integer)
    test_results = Column(JSON, default=dict)
    
    # 关联关系
    scene = relationship("Scene", backref="config")

class NPCBehaviorConfig(Base):
    """NPC行为配置表"""
    __tablename__ = "npc_behavior_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scene_npc_id = Column(UUID(as_uuid=True), ForeignKey("scene_npcs.id"), nullable=False)
    
    # AI行为配置
    dialogue_strategy = Column(JSON, default=dict)    # 对话策略
    emotion_progression = Column(JSON, default=dict)  # 情绪变化规律
    reaction_patterns = Column(JSON, default=dict)    # 反应模式
    
    # 特殊行为
    special_triggers = Column(JSON, default=list)     # 特殊触发条件
    combat_behavior = Column(JSON, default=dict)      # 战斗行为
    
    # 关系网络
    relationship_modifiers = Column(JSON, default=dict)  # 与其他NPC的关系影响
    
    # 关联关系
    scene_npc = relationship("SceneNPC")

class SceneAnalytics(Base):
    """场景数据分析表"""
    __tablename__ = "scene_analytics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scene_id = Column(UUID(as_uuid=True), ForeignKey("scenes.id"), nullable=False)
    
    # 统计周期
    date_start = Column(Integer, nullable=False)
    date_end = Column(Integer, nullable=False)
    
    # 基础统计
    total_plays = Column(Integer, default=0)
    success_rate = Column(Float, default=0.0)
    average_rounds = Column(Float, default=0.0)
    average_duration = Column(Integer, default=0)  # 秒
    
    # 详细统计
    player_choices_distribution = Column(JSON, default=dict)  # 玩家选择分布
    npc_interaction_stats = Column(JSON, default=dict)        # NPC交互统计
    trigger_frequency = Column(JSON, default=dict)            # 触发频率
    
    # 平衡性分析
    difficulty_rating = Column(Float, default=0.0)
    balance_score = Column(Float, default=0.0)
    
    # 问题记录
    common_failures = Column(JSON, default=list)
    improvement_suggestions = Column(JSON, default=list)
    
    # 关联关系
    scene = relationship("Scene")

class ConfigTemplate(Base):
    """配置模板系统"""
    __tablename__ = "config_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    template_id = Column(String(50), unique=True, nullable=False)
    template_name = Column(String(100), nullable=False)
    template_type = Column(String(50))  # scene/npc/ai/card
    
    # 模板内容
    template_content = Column(JSON, nullable=False)
    
    # 模板元数据
    description = Column(Text)
    usage_count = Column(Integer, default=0)
    tags = Column(JSON, default=list)
    
    # 版本控制
    version = Column(String(20), default="1.0")
    parent_template_id = Column(UUID(as_uuid=True), ForeignKey("config_templates.id"))
    
    # 权限控制
    is_public = Column(Boolean, default=True)
    created_by = Column(String(100))
    created_at = Column(Integer)
    
    # 自引用关系
    children = relationship("ConfigTemplate", backref="parent", remote_side=[id])

class ConfigValidation(Base):
    """配置验证记录"""
    __tablename__ = "config_validations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_type = Column(String(50), nullable=False)  # scene/npc/ai/card
    config_id = Column(String(100), nullable=False)   # 被验证的配置ID
    
    # 验证结果
    is_valid = Column(Boolean, nullable=False)
    validation_errors = Column(JSON, default=list)
    validation_warnings = Column(JSON, default=list)
    
    # 验证规则
    rules_applied = Column(JSON, default=list)
    validation_context = Column(JSON, default=dict)
    
    # 自动修复建议
    auto_fix_suggestions = Column(JSON, default=list)
    
    # 验证元数据
    validated_at = Column(Integer, nullable=False)
    validator_version = Column(String(20))
    
    # 索引
    __table_args__ = (
        {"schema": None}  # 可以根据需要设置schema
    )