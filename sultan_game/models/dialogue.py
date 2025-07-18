from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, ForeignKey, Enum
from sqlalchemy.orm import relationship
from core.database import Base
import uuid
import enum

class SessionStatus(enum.Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    FAILED = "failed"
    ABANDONED = "abandoned"

class SpeakerType(enum.Enum):
    NARRATOR = "narrator"
    SCENE_NPC = "scene_npc"
    PLAYER_NPC = "player_npc"
    EVALUATOR = "evaluator"

class DialogueSession(Base):
    __tablename__ = "dialogue_sessions"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    scene_id = Column(String(36), ForeignKey("scenes.id"), nullable=False)
    
    # 会话状态
    status = Column(Enum(SessionStatus), default=SessionStatus.ACTIVE)
    current_round = Column(Integer, default=0)
    total_speeches = Column(Integer, default=0)
    
    # 参与者
    scene_npcs = Column(JSON, default=list)    # 场景NPC ID列表
    player_npcs = Column(JSON, default=list)   # 玩家NPC ID列表
    active_participants = Column(JSON, default=list)  # 当前活跃参与者
    
    # 当前状态
    current_speaking_order = Column(JSON, default=list)
    current_speaker_index = Column(Integer, default=0)
    waiting_for_player = Column(Boolean, default=False)
    
    # 累计评分
    total_story_progress = Column(Integer, default=0)
    total_tension_level = Column(Integer, default=0)
    
    # 特殊状态
    combat_occurred = Column(Boolean, default=False)
    npcs_removed = Column(JSON, default=list)  # 已退场的NPC
    
    # 结果
    final_result = Column(String(50))  # success/failure/timeout
    dice_triggered = Column(Boolean, default=False)
    dice_result = Column(JSON, default=dict)
    
    # 系统字段
    started_at = Column(Integer)
    ended_at = Column(Integer, nullable=True)
    
    # 关联关系
    player = relationship("Player")
    scene = relationship("Scene")
    rounds = relationship("DialogueRound", back_populates="session")

class DialogueRound(Base):
    __tablename__ = "dialogue_rounds"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("dialogue_sessions.id"), nullable=False)
    round_number = Column(Integer, nullable=False)
    
    # 轮次配置
    speaking_order = Column(JSON, default=list)
    participants_count = Column(Integer)
    
    # 轮次状态
    is_complete = Column(Boolean, default=False)
    speeches_count = Column(Integer, default=0)
    
    # 轮次评分
    story_progress = Column(Integer, default=0)
    dialogue_quality = Column(Integer, default=0)
    tension_level = Column(Integer, default=0)
    special_flags = Column(JSON, default=list)
    
    # 评分结果
    evaluation_result = Column(String(50))  # continue/trigger_dice/high_tension
    
    # 系统字段
    started_at = Column(Integer)
    completed_at = Column(Integer, nullable=True)
    
    # 关联关系
    session = relationship("DialogueSession", back_populates="rounds")
    speeches = relationship("DialogueSpeech", back_populates="round")

class DialogueSpeech(Base):
    __tablename__ = "dialogue_speeches"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    round_id = Column(String(36), ForeignKey("dialogue_rounds.id"), nullable=False)
    session_id = Column(String(36), ForeignKey("dialogue_sessions.id"), nullable=False)
    
    # 发言者信息
    speaker_type = Column(Enum(SpeakerType), nullable=False)
    speaker_id = Column(String(100))  # NPC ID或特殊标识
    speaker_name = Column(String(100))
    
    # 发言内容
    speech_text = Column(Text, nullable=False)
    speech_order = Column(Integer)  # 在轮次中的顺序
    
    # 玩家选择 (仅当speaker_type为player_npc时)
    is_player_choice = Column(Boolean, default=False)
    available_options = Column(JSON, default=list)  # 可选项
    selected_option = Column(Integer, nullable=True)  # 选择的选项
    
    # 效果
    hidden_effects = Column(JSON, default=dict)     # 隐藏效果
    combat_target = Column(String(100), nullable=True)  # 战斗目标
    combat_triggered = Column(Boolean, default=False)
    
    # 系统字段
    created_at = Column(Integer)
    
    # 关联关系
    round = relationship("DialogueRound", back_populates="speeches")
    session = relationship("DialogueSession")