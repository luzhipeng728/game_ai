from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
import uuid

class CombatRecord(Base):
    __tablename__ = "combat_records"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String(36), ForeignKey("dialogue_sessions.id"), nullable=False)
    round_id = Column(String(36), ForeignKey("dialogue_rounds.id"), nullable=False)
    speech_id = Column(String(36), ForeignKey("dialogue_speeches.id"), nullable=False)
    
    # 参战者
    attacker_id = Column(String(100), nullable=False)
    attacker_name = Column(String(100), nullable=False)
    defender_id = Column(String(100), nullable=False)
    defender_name = Column(String(100), nullable=False)
    
    # 战前状态
    attacker_hp_before = Column(Integer, nullable=False)
    attacker_str = Column(Integer, nullable=False)
    attacker_def = Column(Integer, nullable=False)
    
    defender_hp_before = Column(Integer, nullable=False)
    defender_str = Column(Integer, nullable=False)
    defender_def = Column(Integer, nullable=False)
    
    # 战斗过程
    combat_rounds = Column(JSON, default=list)  # 详细战斗回合
    total_rounds = Column(Integer)
    
    # 战斗结果
    winner_id = Column(String(100), nullable=False)
    loser_id = Column(String(100), nullable=False)
    
    # 战后状态
    attacker_hp_after = Column(Integer, nullable=False)
    defender_hp_after = Column(Integer, nullable=False)
    
    # 后果
    loser_removed = Column(Boolean, default=False)  # 败者是否退场
    scene_impact = Column(JSON, default=dict)       # 对场景的影响
    
    # 系统字段
    occurred_at = Column(Integer)
    
    # 关联关系
    session = relationship("DialogueSession")
    round = relationship("DialogueRound")
    speech = relationship("DialogueSpeech")