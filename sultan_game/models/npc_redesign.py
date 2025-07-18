from sqlalchemy import Column, Integer, String, Boolean, JSON, Text, Enum, ForeignKey
from sqlalchemy.orm import relationship
from core.database import Base
import uuid
import enum

class NPCType(enum.Enum):
    GAME_NPC = "game_npc"      # 场景固定NPC
    PLAYER_NPC = "player_npc"  # 玩家可获取NPC

class Tier(enum.Enum):
    BRONZE = "bronze"
    SILVER = "silver"
    GOLD = "gold"
    LEGENDARY = "legendary"

class Faction(enum.Enum):
    SULTAN = "sultan"      # 苏丹王
    MINISTER = "minister"  # 大臣
    MILITARY = "military"  # 将军
    BLACKDUCK = "blackduck" # 黑鸭会
    COMMONER = "commoner"  # 平民阵营
    SCHOLAR = "scholar"    # 学者阵营

class NPC(Base):
    """NPC基础模型 - 包含所有NPC的通用信息"""
    __tablename__ = "npcs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    npc_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    npc_type = Column(Enum(NPCType), nullable=False)
    tier = Column(Enum(Tier), nullable=False)
    faction = Column(Enum(Faction), nullable=False)
    
    # 外观描述
    avatar = Column(String(255))
    description = Column(Text)
    appearance = Column(Text)
    
    # 核心属性（所有NPC必须配置）
    intelligence = Column(Integer, nullable=False)  # INT 1-20 影响骰子数量
    strength = Column(Integer, nullable=False)      # STR 1-100 战斗攻击力
    defense = Column(Integer, nullable=False)       # DEF 1-100 战斗防御力
    hp_max = Column(Integer, nullable=False)        # HP 1-500 生命值
    
    # 社交属性（可选）
    charisma = Column(Integer, default=50)          # CHA 1-100 影响对话效果
    loyalty = Column(Integer, default=50)           # LOY 1-100 对玩家的初始态度
    fear = Column(Integer, default=0)               # FEAR 1-100 对玩家的畏惧
    
    # 权力属性
    influence = Column(Integer, default=0)          # INF 1-100 权威和影响力
    command = Column(Integer, default=0)            # CMD 1-100 军事指挥能力
    category = Column(Integer, default=0)           # CAT 0=平民, 1=贵族
    
    # 特殊属性（仅特定角色）
    stealth = Column(Integer, default=0)            # HIDE 1-100 隐蔽能力（仅玩家角色）
    
    # 特殊属性（可扩展）
    custom_attributes = Column(JSON, default=dict)  # 如 {"军事指挥": 90, "政治敏感": 40}
    
    # AI行为配置
    personality_traits = Column(JSON, default=list)  # ["忠诚", "直率", "暴躁"]
    personality_description = Column(Text)            # 性格描述
    speaking_style = Column(JSON, default=dict)      # 说话风格配置
    emotion_thresholds = Column(JSON, default=dict)  # 情绪阈值
    dialogue_goals = Column(JSON, default=dict)      # 对话目标
    
    # 系统字段
    is_active = Column(Boolean, default=True)
    created_at = Column(Integer)
    updated_at = Column(Integer)
    
    # 关联关系
    game_npc_config = relationship("GameNPCConfig", back_populates="npc", uselist=False)
    player_npc_instances = relationship("PlayerNPCInstance", back_populates="npc")

class GameNPCConfig(Base):
    """游戏NPC专用配置 - 仅game_npc类型使用"""
    __tablename__ = "game_npc_configs"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    npc_id = Column(String(36), ForeignKey("npcs.id"), nullable=False)
    
    # 死亡掉落配置
    attribute_points_drop = Column(Integer, default=20)  # 掉落的属性点
    
    # 固定掉落物品
    guaranteed_drops = Column(JSON, default=list)  
    # 格式: [{"item_type": "card", "item_id": "military_token", "quantity": 1}]
    
    # 概率掉落物品
    random_drops = Column(JSON, default=list)
    # 格式: [{"item_type": "card", "item_id": "elite_troops", "probability": 0.3}]
    
    # 特殊奖励
    special_rewards = Column(JSON, default=dict)
    # 格式: {"unlock_scenes": ["military_camp_advanced"], "unlock_npcs": ["lieutenant_01"], "achievements": ["general_slayer"]}
    
    # 转化配置
    can_convert = Column(Boolean, default=False)
    convert_conditions = Column(JSON, default=list)
    # 格式: [{"type": "loyalty", "value": 90}, {"type": "special_event", "event_id": "general_submission"}]
    
    convert_cost = Column(JSON, default=dict)
    # 格式: {"cards": ["persuasion_master"], "attribute_requirements": {"player_CHA": 80}}
    
    # 关联关系
    npc = relationship("NPC", back_populates="game_npc_config")

class PlayerNPCInstance(Base):
    """玩家NPC实例 - 玩家拥有的具体NPC"""
    __tablename__ = "player_npc_instances"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    npc_id = Column(String(36), ForeignKey("npcs.id"), nullable=False)
    
    # 当前属性值（可能与原始NPC不同，因为玩家分配了属性点）
    current_intelligence = Column(Integer, nullable=False)
    current_strength = Column(Integer, nullable=False)
    current_defense = Column(Integer, nullable=False)
    current_hp_max = Column(Integer, nullable=False)
    current_charisma = Column(Integer, default=50)
    current_loyalty = Column(Integer, default=50)
    current_fear = Column(Integer, default=0)
    
    # 当前状态
    current_hp = Column(Integer, nullable=False)  # 当前血量
    
    # 成长记录
    level = Column(Integer, default=1)
    experience = Column(Integer, default=0)
    total_attribute_points_allocated = Column(Integer, default=0)  # 已分配的属性点总数
    attribute_allocation_history = Column(JSON, default=list)  # 属性分配历史
    
    # 获得方式
    obtained_method = Column(String(50))  # "initial", "convert", "reward", "special"
    obtained_at = Column(Integer)
    obtained_from = Column(String(100))  # 获得来源描述
    
    # 状态
    is_alive = Column(Boolean, default=True)
    is_in_party = Column(Boolean, default=True)  # 是否在队伍中
    died_at = Column(Integer, nullable=True)
    
    # 关联关系
    player = relationship("Player")
    npc = relationship("NPC", back_populates="player_npc_instances")

class AttributePointPool(Base):
    """玩家属性点池"""
    __tablename__ = "attribute_point_pools"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    
    # 属性点信息
    total_points = Column(Integer, default=0)      # 总获得的属性点
    used_points = Column(Integer, default=0)       # 已使用的属性点
    available_points = Column(Integer, default=0)  # 可用的属性点
    
    # 获得历史
    point_history = Column(JSON, default=list)
    # 格式: [{"source": "npc_death", "source_id": "general_zhang", "points": 20, "timestamp": 1234567890}]
    
    # 使用历史
    usage_history = Column(JSON, default=list)
    # 格式: [{"target_npc": "instance_123", "attribute": "strength", "points": 5, "timestamp": 1234567890}]
    
    # 关联关系
    player = relationship("Player")

class NPCConversionRecord(Base):
    """NPC转化记录"""
    __tablename__ = "npc_conversion_records"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    player_id = Column(String(36), ForeignKey("players.id"), nullable=False)
    game_npc_id = Column(String(36), ForeignKey("npcs.id"), nullable=False)
    player_npc_instance_id = Column(String(36), ForeignKey("player_npc_instances.id"), nullable=False)
    
    # 转化信息
    conversion_method = Column(String(50))  # "loyalty", "special_event", "force"
    conversion_cost = Column(JSON, default=dict)  # 转化消耗的资源
    conversion_conditions_met = Column(JSON, default=dict)  # 满足的条件
    
    # 时间信息
    converted_at = Column(Integer)
    
    # 关联关系
    player = relationship("Player")
    game_npc = relationship("NPC", foreign_keys=[game_npc_id])
    player_npc_instance = relationship("PlayerNPCInstance")