from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from core.database import Base
import uuid
import enum

class AIType(enum.Enum):
    NARRATOR = "narrator"
    NPC = "npc"
    EVALUATOR = "evaluator"
    OPTION_GENERATOR = "option_generator"

class AIConfig(Base):
    """AI智能体配置表"""
    __tablename__ = "ai_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    config_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    ai_type = Column(Enum(AIType), nullable=False)
    
    # 基础prompt模板
    base_prompt = Column(Text, nullable=False)
    system_prompt = Column(Text)
    
    # AI参数配置
    model_config = Column(JSON, default=dict)  # 模型参数 (temperature, max_tokens等)
    
    # 角色设定 (适用于NPC AI)
    character_config = Column(JSON, default=dict)  # 性格、目标、说话风格等
    
    # 评分标准 (适用于评分AI)
    evaluation_config = Column(JSON, default=dict)  # 评分权重、触发阈值等
    
    # 生成配置 (适用于话术生成AI)
    generation_config = Column(JSON, default=dict)  # 话术风格、效果范围等
    
    # 旁白配置 (适用于旁白AI)
    narration_config = Column(JSON, default=dict)  # 描述风格、触发时机等
    
    # 版本控制
    version = Column(String(10), default="1.0")
    is_active = Column(Boolean, default=True)
    
    # 系统字段
    created_by = Column(String(100))  # 创建者
    created_at = Column(Integer)
    updated_at = Column(Integer)
    
    # 关联关系
    scene_ai_configs = relationship("SceneAIConfig", back_populates="ai_config")

class SceneAIConfig(Base):
    """场景AI配置关联表"""
    __tablename__ = "scene_ai_configs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    scene_id = Column(UUID(as_uuid=True), ForeignKey("scenes.id"), nullable=False)
    ai_config_id = Column(UUID(as_uuid=True), ForeignKey("ai_configs.id"), nullable=False)
    
    # 场景特定配置覆盖
    scene_specific_config = Column(JSON, default=dict)
    
    # 执行顺序和优先级
    execution_order = Column(Integer, default=0)
    is_required = Column(Boolean, default=True)
    
    # 触发条件
    trigger_conditions = Column(JSON, default=dict)
    
    # 关联关系
    scene = relationship("Scene")
    ai_config = relationship("AIConfig", back_populates="scene_ai_configs")

class AISession(Base):
    """AI会话状态跟踪"""
    __tablename__ = "ai_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dialogue_session_id = Column(UUID(as_uuid=True), ForeignKey("dialogue_sessions.id"), nullable=False)
    ai_config_id = Column(UUID(as_uuid=True), ForeignKey("ai_configs.id"), nullable=False)
    
    # 当前AI状态
    current_state = Column(JSON, default=dict)
    
    # AI记忆/上下文
    context_memory = Column(JSON, default=dict)
    
    # 统计信息
    total_responses = Column(Integer, default=0)
    last_response_time = Column(Integer)
    
    # 关联关系
    dialogue_session = relationship("DialogueSession")
    ai_config = relationship("AIConfig")

class AIResponse(Base):
    """AI响应记录"""
    __tablename__ = "ai_responses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ai_session_id = Column(UUID(as_uuid=True), ForeignKey("ai_sessions.id"), nullable=False)
    speech_id = Column(UUID(as_uuid=True), ForeignKey("dialogue_speeches.id"), nullable=True)
    
    # 请求信息
    request_prompt = Column(Text, nullable=False)
    request_context = Column(JSON, default=dict)
    
    # 响应信息
    response_text = Column(Text)
    response_data = Column(JSON, default=dict)  # 结构化响应数据
    
    # AI评估信息 (用于评分AI)
    evaluation_scores = Column(JSON, default=dict)
    trigger_decisions = Column(JSON, default=dict)
    
    # 元数据
    model_used = Column(String(50))
    tokens_used = Column(Integer)
    response_time_ms = Column(Integer)
    
    # 系统字段
    created_at = Column(Integer)
    
    # 关联关系
    ai_session = relationship("AISession")
    speech = relationship("DialogueSpeech")