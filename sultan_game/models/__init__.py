# 重新设计的模型 - 基于游戏设计文档
from .player_redesign import Player
from .npc_redesign import NPC, NPCType, Tier, Faction, GameNPCConfig, PlayerNPCInstance, AttributePointPool, NPCConversionRecord
from .card_redesign import (
    Card, CardRarity, CardCategory, EffectType, EffectTarget, UseTiming,
    CardEffect, CardSet, CardSetMembership, CardSetBonus, CardSynergy,
    PlayerCard, ActiveCardEffect, CardBalanceStandard, CardUsageRecord
)
from .scene_redesign import (
    Scene, SceneCategory, TimeOfDay, SceneStatus,
    SceneEntryRequirement, SceneNPCConfiguration, SceneAIConfiguration,
    SceneReward, SceneDynamicEvent, ScenePlaySession, SceneAnalytics
)
from .scene_requirements import (
    SceneRequirement, RequirementType, ComparisonOperator,
    SceneCardBinding, SceneRewardExtended, PlayerNPCReward, CardReward
)

# 保留的旧模型（用于对话和战斗系统）
from .dialogue import DialogueSession, DialogueRound, DialogueSpeech
from .combat import CombatRecord
from .ai_config import AIConfig, AIType
from .template import ConfigTemplate, TemplateType, TemplateCategory

__all__ = [
    # 核心模型
    "Player", "NPC", "Card", "Scene",
    
    # NPC系统
    "NPCType", "Tier", "Faction", "GameNPCConfig", "PlayerNPCInstance", 
    "AttributePointPool", "NPCConversionRecord",
    
    # 卡片系统
    "CardRarity", "CardCategory", "EffectType", "EffectTarget", "UseTiming",
    "CardEffect", "CardSet", "CardSetMembership", "CardSetBonus", "CardSynergy",
    "PlayerCard", "ActiveCardEffect", "CardBalanceStandard", "CardUsageRecord",
    
    # 场景系统
    "SceneCategory", "TimeOfDay", "SceneStatus", "SceneEntryRequirement",
    "SceneNPCConfiguration", "SceneAIConfiguration", "SceneReward",
    "SceneDynamicEvent", "ScenePlaySession", "SceneAnalytics",
    
    # 场景需求和配置系统
    "SceneRequirement", "RequirementType", "ComparisonOperator",
    "SceneCardBinding", "SceneRewardExtended", "PlayerNPCReward", "CardReward",
    
    # 对话和战斗系统
    "DialogueSession", "DialogueRound", "DialogueSpeech", "CombatRecord",
    
    # AI配置系统
    "AIConfig", "AIType",
    
    # 配置模板系统
    "ConfigTemplate", "TemplateType", "TemplateCategory"
]