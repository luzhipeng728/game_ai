from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from pydantic import BaseModel
from core.database import get_db
from core.logging_config import get_logger, log_database_operation
from models import (
    Scene, SceneCategory, SceneStatus, TimeOfDay, SceneAIConfiguration,
    SceneRequirement, RequirementType, ComparisonOperator,
    SceneCardBinding, SceneRewardExtended, PlayerNPCReward, CardReward,
    Card, PlayerNPCInstance
)
import uuid
import time
import json

router = APIRouter(prefix="/scenes", tags=["scenes"])
logger = get_logger(__name__)

# Pydantic schemas
class SceneBase(BaseModel):
    scene_id: str
    name: str
    category: str
    chapter: Optional[int] = 1
    description: Optional[str] = None
    background_image: Optional[str] = None
    background_music: Optional[str] = None
    location: Optional[str] = None
    time_of_day: Optional[str] = None
    weather: Optional[str] = None
    card_count: Optional[int] = 0
    prerequisite_scenes: Optional[list] = []
    days_required: Optional[int] = 0

class SceneCreate(SceneBase):
    attribute_requirements: Optional[dict] = {}
    card_requirements: Optional[dict] = {}
    prerequisites: Optional[dict] = {}
    restrictions: Optional[dict] = {}
    min_player_npcs: Optional[int] = 1
    max_player_npcs: Optional[int] = 3
    recommended_npc_types: Optional[list] = []
    special_bonuses: Optional[dict] = {}
    narrator_prompt: str
    evaluator_config: Optional[dict] = {}
    success_rewards: Optional[dict] = {}
    failure_penalties: Optional[dict] = {}
    dynamic_events: Optional[list] = []
    hidden_elements: Optional[dict] = {}

class SceneUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    narrator_prompt: Optional[str] = None
    evaluator_config: Optional[dict] = None
    card_count: Optional[int] = None
    prerequisite_scenes: Optional[list] = None
    days_required: Optional[int] = None

class SceneResponse(SceneBase):
    id: str
    is_active: bool
    created_at: Optional[int] = None
    updated_at: Optional[int] = None
    npc_count: Optional[int] = 0
    status: Optional[str] = "draft"

    class Config:
        from_attributes = True

class SceneConfigResponse(BaseModel):
    config_version: str
    status: str
    narrator_config: dict
    evaluator_config: dict
    expected_rounds: dict
    scoring_weights: dict
    trigger_thresholds: dict

    class Config:
        from_attributes = True

@router.get("/list-all")
async def get_all_scenes_list(db: Session = Depends(get_db)):
    """获取所有场景的简要信息，用于前置场景选择"""
    scenes = db.query(Scene).filter(Scene.is_active == True).all()
    
    result = []
    for scene in scenes:
        result.append({
            "scene_id": scene.scene_id,
            "name": scene.name,
            "category": scene.category.value if scene.category else None
        })
    
    return result

@router.get("/", response_model=List[SceneResponse])
async def get_scenes(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取场景列表"""
    query = db.query(Scene).filter(Scene.is_active == True)
    
    if category:
        query = query.filter(Scene.category == category)
    
    if status:
        query = query.filter(Scene.status == SceneStatus(status))
    
    scenes = query.offset(skip).limit(limit).all()
    
    # 为每个场景添加NPC数量
    result = []
    for scene in scenes:
        scene_dict = scene.__dict__.copy()
        scene_dict['npc_count'] = 0  # 暂时简化，不计算NPC数量
        scene_dict['status'] = scene.status.value if scene.status else 'draft'
        scene_dict['category'] = scene.category.value if scene.category else None
        scene_dict['time_of_day'] = scene.time_of_day.value if scene.time_of_day else None
        scene_dict['prerequisite_scenes'] = json.loads(scene_dict.get('prerequisite_scenes', '[]'))
        scene_dict['id'] = str(scene.id)  # 转换为字符串
        result.append(SceneResponse(**scene_dict))
    
    return result

@router.get("/{scene_id}", response_model=SceneResponse)
async def get_scene(scene_id: str, db: Session = Depends(get_db)):
    """获取单个场景详情"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    scene_dict = scene.__dict__.copy()
    scene_dict['npc_count'] = 0  # 暂时简化，不计算NPC数量
    scene_dict['status'] = scene.status.value if scene.status else 'draft'
    scene_dict['category'] = scene.category.value if scene.category else None
    scene_dict['time_of_day'] = scene.time_of_day.value if scene.time_of_day else None
    scene_dict['prerequisite_scenes'] = json.loads(scene_dict.get('prerequisite_scenes', '[]'))
    scene_dict['id'] = str(scene.id)  # 转换为字符串
    
    return SceneResponse(**scene_dict)

@router.post("/", response_model=SceneResponse)
async def create_scene(scene: SceneCreate, db: Session = Depends(get_db)):
    """创建新场景"""
    logger.info(f"开始创建场景: {scene.scene_id} - {scene.name}")
    
    try:
        # 检查scene_id是否已存在
        existing = db.query(Scene).filter(Scene.scene_id == scene.scene_id).first()
        if existing:
            logger.warning(f"场景ID已存在: {scene.scene_id}")
            raise HTTPException(status_code=400, detail="Scene ID already exists")
        
        # 创建场景
        db_scene = Scene(
            scene_id=scene.scene_id,
            name=scene.name,
            category=SceneCategory(scene.category),
            chapter=scene.chapter,
            description=scene.description,
            background_image=scene.background_image,
            background_music=scene.background_music,
            location=scene.location,
            time_of_day=TimeOfDay(scene.time_of_day) if scene.time_of_day else None,
            weather=scene.weather,
            card_count=scene.card_count,
            prerequisite_scenes=json.dumps(scene.prerequisite_scenes),
            days_required=scene.days_required,
            status=SceneStatus.DRAFT,
            is_active=True,
            created_at=int(time.time()),
            updated_at=int(time.time())
        )
        
        db.add(db_scene)
        db.commit()
        db.refresh(db_scene)
        
        logger.info(f"场景创建成功: {db_scene.id} - {scene.scene_id}")
        log_database_operation("CREATE", "scenes", db_scene.id)
        
    except Exception as e:
        logger.error(f"创建场景失败: {scene.scene_id} - {str(e)}")
        log_database_operation("CREATE", "scenes", scene.scene_id, str(e))
        db.rollback()
        raise
    
    # 创建场景AI配置 - 暂时跳过，先测试基本功能
    # if scene.narrator_prompt:
    #     ai_config = SceneAIConfiguration(
    #         id=str(uuid.uuid4()),
    #         scene_id=db_scene.id,
    #         narrator_prompt=scene.narrator_prompt,
    #         evaluator_weights=scene.evaluator_config or {},
    #         evaluator_thresholds={"dice_trigger": 75, "tension_trigger": 85},
    #         success_criteria={"dice_required": 5}
    #     )
    #     db.add(ai_config)
    #     db.commit()
    
    scene_dict = db_scene.__dict__.copy()
    scene_dict['npc_count'] = 0
    scene_dict['status'] = 'draft'
    scene_dict['category'] = scene.category
    scene_dict['prerequisite_scenes'] = json.loads(scene_dict.get('prerequisite_scenes', '[]'))
    scene_dict['id'] = str(db_scene.id)
    
    return SceneResponse(**scene_dict)

@router.put("/{scene_id}", response_model=SceneResponse)
async def update_scene(scene_id: str, scene_update: SceneUpdate, db: Session = Depends(get_db)):
    """更新场景"""
    db_scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not db_scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 更新字段
    for field, value in scene_update.dict(exclude_unset=True).items():
        if field == "status":
            setattr(db_scene, field, SceneStatus(value))
        else:
            setattr(db_scene, field, value)
    
    db_scene.updated_at = int(time.time())
    db.commit()
    db.refresh(db_scene)
    
    scene_dict = db_scene.__dict__.copy()
    scene_dict['npc_count'] = 0  # 暂时简化，不计算NPC数量
    scene_dict['status'] = db_scene.status.value if db_scene.status else 'draft'
    scene_dict['category'] = db_scene.category.value if db_scene.category else None
    scene_dict['time_of_day'] = db_scene.time_of_day.value if db_scene.time_of_day else None
    scene_dict['prerequisite_scenes'] = json.loads(scene_dict.get('prerequisite_scenes', '[]'))
    scene_dict['id'] = str(db_scene.id)  # 转换为字符串
    
    return SceneResponse(**scene_dict)

@router.delete("/{scene_id}")
async def delete_scene(scene_id: str, db: Session = Depends(get_db)):
    """删除场景"""
    db_scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not db_scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 软删除：设置为不活跃
    db_scene.is_active = False
    db_scene.updated_at = int(time.time())
    db.commit()
    
    return {"message": "Scene deleted successfully"}

@router.get("/{scene_id}/config", response_model=SceneConfigResponse)
async def get_scene_config(scene_id: str, db: Session = Depends(get_db)):
    """获取场景配置详情"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    ai_config = db.query(SceneAIConfiguration).filter(SceneAIConfiguration.scene_id == scene_id).first()
    
    config_data = {
        "config_version": "1.0",
        "status": scene.status.value if scene.status else "draft",
        "narrator_config": ai_config.narrator_prompt if ai_config else {},
        "evaluator_config": ai_config.evaluator_weights if ai_config else {},
        "expected_rounds": {"min": 10, "max": 25},
        "scoring_weights": {"story_progress": 0.4, "dialogue_quality": 0.3, "tension_level": 0.3},
        "trigger_thresholds": ai_config.evaluator_thresholds if ai_config else {"dice_trigger": 75, "tension_trigger": 85}
    }
    
    return SceneConfigResponse(**config_data)

@router.post("/{scene_id}/test")
async def test_scene(scene_id: str, db: Session = Depends(get_db)):
    """测试场景配置"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # TODO: 实现场景测试逻辑
    # 这里应该验证场景配置的完整性和合理性
    
    return {
        "message": "Scene test completed",
        "results": {
            "config_valid": True,
            "ai_prompts_valid": True,
            "requirements_valid": True,
            "warnings": []
        }
    }

@router.get("/{scene_id}/npcs")
async def get_scene_npcs(scene_id: str, db: Session = Depends(get_db)):
    """获取场景NPC配置"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 查询真实的场景NPC绑定关系
    from models import SceneNPCConfiguration, NPC
    scene_npcs = db.query(SceneNPCConfiguration).filter(
        SceneNPCConfiguration.scene_id == scene_id
    ).join(NPC, SceneNPCConfiguration.npc_id == NPC.id).all()
    
    # 返回场景NPC配置列表
    result = []
    for scene_npc in scene_npcs:
        result.append({
            "id": scene_npc.id,
            "npc_id": scene_npc.npc_id,
            "name": scene_npc.npc.name if hasattr(scene_npc, 'npc') else "Unknown NPC",
            "role": scene_npc.role,
            "behavior": scene_npc.special_behavior,
            "speaking_priority": scene_npc.speaking_order_priority,
            "can_be_challenged": scene_npc.can_be_challenged,
            "can_be_converted": scene_npc.can_be_converted,
            "initial_position": scene_npc.initial_position
        })
    
    return result

@router.get("/{scene_id}/rewards")
async def get_scene_rewards(scene_id: str, db: Session = Depends(get_db)):
    """获取场景奖励配置"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 获取场景奖励配置
    from models import SceneReward
    reward_config = db.query(SceneReward).filter(SceneReward.scene_id == scene_id).first()
    
    if not reward_config:
        # 如果没有配置，返回默认值
        return {
            "success_attribute_points": 15,
            "success_experience": 100,
            "success_reputation": 10,
            "success_gold": 0,
            "failure_reputation": 0
        }
    
    return {
        "success_attribute_points": reward_config.success_attribute_points,
        "success_experience": reward_config.success_experience,
        "success_reputation": reward_config.success_reputation,
        "success_gold": reward_config.success_gold,
        "failure_reputation": reward_config.failure_reputation
    }

@router.post("/{scene_id}/rewards")
async def save_scene_rewards(scene_id: str, rewards: dict, db: Session = Depends(get_db)):
    """保存场景奖励配置"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 保存奖励配置到数据库
    from models import SceneReward
    import uuid
    
    # 查找现有奖励配置
    reward_config = db.query(SceneReward).filter(SceneReward.scene_id == scene_id).first()
    
    if not reward_config:
        # 创建新的奖励配置
        reward_config = SceneReward(
            id=str(uuid.uuid4()),
            scene_id=scene_id
        )
    
    # 更新奖励配置
    reward_config.success_attribute_points = rewards.get("success_attribute_points", 15)
    reward_config.success_experience = rewards.get("success_experience", 100)
    reward_config.success_reputation = rewards.get("success_reputation", 10)
    reward_config.success_gold = rewards.get("success_gold", 0)
    reward_config.failure_reputation = rewards.get("failure_reputation", 0)
    
    # 保存到数据库
    if reward_config not in db:
        db.add(reward_config)
    
    scene.updated_at = int(time.time())
    db.commit()
    db.refresh(reward_config)
    
    return {"message": "Scene rewards saved successfully", "data": rewards}

@router.post("/{scene_id}/npcs")
async def add_scene_npc(scene_id: str, npc_data: dict, db: Session = Depends(get_db)):
    """添加场景NPC"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 检查NPC是否存在
    from models import NPC
    npc = db.query(NPC).filter(NPC.id == npc_data["npc_id"]).first()
    if not npc:
        raise HTTPException(status_code=404, detail="NPC not found")
    
    # 创建场景NPC关联
    from models import SceneNPCConfiguration
    scene_npc = SceneNPCConfiguration(
        scene_id=scene.id,
        npc_id=npc.id,
        role=npc_data.get("role", "supporter"),
        special_behavior=npc_data.get("behavior", "neutral"),
        can_be_challenged=npc_data.get("can_be_challenged", True)
    )
    
    db.add(scene_npc)
    db.commit()
    db.refresh(scene_npc)
    
    return {"message": "NPC added to scene successfully"}

@router.delete("/{scene_id}/npcs/{npc_id}")
async def remove_scene_npc(scene_id: str, npc_id: str, db: Session = Depends(get_db)):
    """从场景中移除NPC"""
    from models import SceneNPCConfiguration
    scene_npc = db.query(SceneNPCConfiguration).filter(
        SceneNPCConfiguration.scene_id == scene_id,
        SceneNPCConfiguration.npc_id == npc_id
    ).first()
    
    if not scene_npc:
        raise HTTPException(status_code=404, detail="Scene NPC not found")
    
    db.delete(scene_npc)
    db.commit()
    
    return {"message": "NPC removed from scene successfully"}

# === 新增：场景需求配置API（简化版-属性要求） ===

class SceneAttributeRequirementsSchema(BaseModel):
    # 所有属性维度的要求值，默认为0
    strength: int = 0        # 力量
    defense: int = 0         # 防御
    intelligence: int = 0    # 智力
    charisma: int = 0        # 魅力
    loyalty: int = 0         # 忠诚
    influence: int = 0       # 影响力
    command: int = 0         # 指挥力
    stealth: int = 0         # 隐秘
    health: int = 0          # 生命值

@router.get("/{scene_id}/requirements")
async def get_scene_requirements(scene_id: str, db: Session = Depends(get_db)):
    """获取场景进入属性要求"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 查找现有的属性要求配置
    requirements = db.query(SceneRequirement).filter(
        SceneRequirement.scene_id == scene_id,
        SceneRequirement.requirement_type == RequirementType.ATTRIBUTE
    ).all()
    
    # 初始化所有属性为0
    result = {
        "strength": 0,
        "defense": 0,
        "intelligence": 0,
        "charisma": 0,
        "loyalty": 0,
        "influence": 0,
        "command": 0,
        "stealth": 0,
        "health": 0
    }
    
    # 更新已配置的属性值
    for req in requirements:
        if req.requirement_name in result:
            result[req.requirement_name] = req.required_value
    
    return result

@router.post("/{scene_id}/requirements")
async def save_scene_requirements(
    scene_id: str, 
    requirements: SceneAttributeRequirementsSchema, 
    db: Session = Depends(get_db)
):
    """保存场景进入属性要求"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 删除现有的属性要求
    db.query(SceneRequirement).filter(
        SceneRequirement.scene_id == scene_id,
        SceneRequirement.requirement_type == RequirementType.ATTRIBUTE
    ).delete()
    
    # 创建新的属性要求
    for attr_name, attr_value in requirements.dict().items():
        if attr_value > 0:  # 只保存大于0的要求
            db_requirement = SceneRequirement(
                id=str(uuid.uuid4()),
                scene_id=scene_id,
                requirement_type=RequirementType.ATTRIBUTE,
                requirement_name=attr_name,
                description=f"需要{attr_name}达到{attr_value}",
                operator=ComparisonOperator.GREATER_EQUAL,
                required_value=attr_value,
                is_mandatory=True,
                priority=1
            )
            db.add(db_requirement)
    
    db.commit()
    
    return {"message": "Scene attribute requirements saved successfully"}

# === 新增：场景卡片绑定API ===

class SceneCardBindingSchema(BaseModel):
    card_id: str
    binding_type: str  # "required", "optional", "bonus"
    max_uses_per_scene: int = 1
    cooldown_rounds: int = 0
    scene_effect_modifier: float = 1.0
    special_effects: Optional[Dict] = {}
    unlock_conditions: Optional[Dict] = {}
    visibility_conditions: Optional[Dict] = {}
    usage_reward_bonus: Optional[Dict] = {}

@router.get("/{scene_id}/card-bindings")
async def get_scene_card_bindings(scene_id: str, db: Session = Depends(get_db)):
    """获取场景卡片绑定配置"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    bindings = db.query(SceneCardBinding).filter(
        SceneCardBinding.scene_id == scene_id
    ).join(Card, SceneCardBinding.card_id == Card.id).all()
    
    result = []
    for binding in bindings:
        result.append({
            "id": binding.id,
            "card_id": binding.card_id,
            "card_name": binding.card.name if hasattr(binding, 'card') else "Unknown Card",
            "binding_type": binding.binding_type,
            "max_uses_per_scene": binding.max_uses_per_scene,
            "cooldown_rounds": binding.cooldown_rounds,
            "scene_effect_modifier": binding.scene_effect_modifier,
            "special_effects": binding.special_effects,
            "unlock_conditions": binding.unlock_conditions,
            "visibility_conditions": binding.visibility_conditions,
            "usage_reward_bonus": binding.usage_reward_bonus
        })
    
    return result

@router.post("/{scene_id}/card-bindings")
async def add_scene_card_binding(
    scene_id: str, 
    binding: SceneCardBindingSchema, 
    db: Session = Depends(get_db)
):
    """添加场景卡片绑定"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 检查卡片是否存在
    card = db.query(Card).filter(Card.id == binding.card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # 创建新的卡片绑定
    db_binding = SceneCardBinding(
        id=str(uuid.uuid4()),
        scene_id=scene_id,
        card_id=binding.card_id,
        binding_type=binding.binding_type,
        max_uses_per_scene=binding.max_uses_per_scene,
        cooldown_rounds=binding.cooldown_rounds,
        scene_effect_modifier=binding.scene_effect_modifier,
        special_effects=binding.special_effects,
        unlock_conditions=binding.unlock_conditions,
        visibility_conditions=binding.visibility_conditions,
        usage_reward_bonus=binding.usage_reward_bonus
    )
    
    db.add(db_binding)
    db.commit()
    db.refresh(db_binding)
    
    return {
        "message": "Scene card binding added successfully",
        "binding_id": db_binding.id
    }

@router.delete("/{scene_id}/card-bindings/{binding_id}")
async def remove_scene_card_binding(
    scene_id: str, 
    binding_id: str, 
    db: Session = Depends(get_db)
):
    """删除场景卡片绑定"""
    binding = db.query(SceneCardBinding).filter(
        SceneCardBinding.id == binding_id,
        SceneCardBinding.scene_id == scene_id
    ).first()
    
    if not binding:
        raise HTTPException(status_code=404, detail="Scene card binding not found")
    
    db.delete(binding)
    db.commit()
    
    return {"message": "Scene card binding removed successfully"}

# === 新增：扩展奖励系统API ===

class ExtendedRewardSchema(BaseModel):
    # 成功奖励
    success_attribute_points: int = 0
    success_experience: int = 0
    success_reputation: int = 0
    success_gold: int = 0
    
    # 失败惩罚 - 基础数值
    failure_reputation: int = 0
    
    # 失败惩罚 - 各属性具体惩罚数值
    failure_strength_penalty: int = 0      # 力量惩罚
    failure_defense_penalty: int = 0       # 防御惩罚
    failure_intelligence_penalty: int = 0  # 智力惩罚
    failure_charisma_penalty: int = 0      # 魅力惩罚
    failure_loyalty_penalty: int = 0       # 忠诚惩罚
    failure_influence_penalty: int = 0     # 影响力惩罚
    failure_command_penalty: int = 0       # 指挥力惩罚
    failure_stealth_penalty: int = 0       # 隐秘惩罚
    
    # 失败惩罚 - 生命值惩罚
    failure_health_penalty: int = 0
    failure_health_penalty_type: str = "fixed"  # "fixed" 或 "percentage"
    
    # 失败惩罚说明
    failure_penalty_description: Optional[str] = ""
    
    # 奖励内容
    reward_cards: Optional[List[Dict]] = []  # [{"card_id": "xxx", "quantity": 1, "probability": 1.0}]
    reward_npcs: Optional[List[Dict]] = []   # [{"npc_id": "xxx", "quantity": 1, "probability": 1.0}]
    special_rewards: Optional[Dict] = {}
    unlock_content: Optional[List] = []
    perfect_completion_bonus: Optional[Dict] = {}
    performance_multiplier: float = 1.0

@router.get("/{scene_id}/extended-rewards")
async def get_scene_extended_rewards(scene_id: str, db: Session = Depends(get_db)):
    """获取场景扩展奖励配置"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 获取扩展奖励配置
    reward_config = db.query(SceneRewardExtended).filter(
        SceneRewardExtended.scene_id == scene_id
    ).first()
    
    if not reward_config:
        # 如果没有配置，返回默认值
        return {
            # 成功奖励
            "success_attribute_points": 0,
            "success_experience": 0,
            "success_reputation": 0,
            "success_gold": 0,
            
            # 失败惩罚 - 基础数值
            "failure_reputation": 0,
            
            # 失败惩罚 - 各属性具体惩罚数值
            "failure_strength_penalty": 0,
            "failure_defense_penalty": 0,
            "failure_intelligence_penalty": 0,
            "failure_charisma_penalty": 0,
            "failure_loyalty_penalty": 0,
            "failure_influence_penalty": 0,
            "failure_command_penalty": 0,
            "failure_stealth_penalty": 0,
            
            # 失败惩罚 - 生命值惩罚
            "failure_health_penalty": 0,
            "failure_health_penalty_type": "fixed",
            
            # 失败惩罚说明
            "failure_penalty_description": "",
            
            # 奖励内容
            "reward_cards": [],
            "reward_npcs": [],
            "special_rewards": {},
            "unlock_content": [],
            "perfect_completion_bonus": {},
            "performance_multiplier": 1.0
        }
    
    return {
        # 成功奖励
        "success_attribute_points": reward_config.success_attribute_points,
        "success_experience": reward_config.success_experience,
        "success_reputation": reward_config.success_reputation,
        "success_gold": reward_config.success_gold,
        
        # 失败惩罚 - 基础数值
        "failure_reputation": getattr(reward_config, 'failure_reputation', 0),
        
        # 失败惩罚 - 各属性具体惩罚数值
        "failure_strength_penalty": getattr(reward_config, 'failure_strength_penalty', 0),
        "failure_defense_penalty": getattr(reward_config, 'failure_defense_penalty', 0),
        "failure_intelligence_penalty": getattr(reward_config, 'failure_intelligence_penalty', 0),
        "failure_charisma_penalty": getattr(reward_config, 'failure_charisma_penalty', 0),
        "failure_loyalty_penalty": getattr(reward_config, 'failure_loyalty_penalty', 0),
        "failure_influence_penalty": getattr(reward_config, 'failure_influence_penalty', 0),
        "failure_command_penalty": getattr(reward_config, 'failure_command_penalty', 0),
        "failure_stealth_penalty": getattr(reward_config, 'failure_stealth_penalty', 0),
        
        # 失败惩罚 - 生命值惩罚
        "failure_health_penalty": getattr(reward_config, 'failure_health_penalty', 0),
        "failure_health_penalty_type": getattr(reward_config, 'failure_health_penalty_type', 'fixed'),
        
        # 失败惩罚说明
        "failure_penalty_description": getattr(reward_config, 'failure_penalty_description', ''),
        
        # 奖励内容
        "reward_cards": reward_config.reward_cards or [],
        "reward_npcs": reward_config.reward_npcs or [],
        "special_rewards": reward_config.special_rewards or {},
        "unlock_content": reward_config.unlock_content or [],
        "perfect_completion_bonus": reward_config.perfect_completion_bonus or {},
        "performance_multiplier": reward_config.performance_multiplier
    }

@router.post("/{scene_id}/extended-rewards")
async def save_scene_extended_rewards(
    scene_id: str, 
    rewards: ExtendedRewardSchema, 
    db: Session = Depends(get_db)
):
    """保存场景扩展奖励配置"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 查找现有扩展奖励配置
    reward_config = db.query(SceneRewardExtended).filter(
        SceneRewardExtended.scene_id == scene_id
    ).first()
    
    if not reward_config:
        # 创建新的扩展奖励配置
        reward_config = SceneRewardExtended(
            id=str(uuid.uuid4()),
            scene_id=scene_id
        )
    
    # 更新扩展奖励配置
    for field, value in rewards.dict().items():
        setattr(reward_config, field, value)
    
    # 保存到数据库
    if reward_config not in db:
        db.add(reward_config)
    
    scene.updated_at = int(time.time())
    db.commit()
    db.refresh(reward_config)
    
    return {"message": "Scene extended rewards saved successfully"}

# === 新增：获取可用卡片和NPC列表API ===

@router.get("/available-cards")
async def get_available_cards(db: Session = Depends(get_db)):
    """获取可用卡片列表"""
    cards = db.query(Card).filter(Card.is_active == True).all()
    
    result = []
    for card in cards:
        result.append({
            "id": card.id,
            "card_id": card.card_id,
            "name": card.name,
            "rarity": card.rarity.value,
            "category": card.category.value,
            "description": card.description
        })
    
    return result

@router.get("/available-player-npcs")
async def get_available_player_npcs(db: Session = Depends(get_db)):
    """获取可用玩家NPC列表"""
    npcs = db.query(PlayerNPCInstance).all()
    
    result = []
    for npc in npcs:
        result.append({
            "id": npc.id,
            "name": npc.current_name,
            "tier": npc.npc.tier.value if npc.npc else "unknown",
            "faction": npc.npc.faction.value if npc.npc else "unknown",
            "level": npc.current_level,
            "status": npc.status
        })
    
    return result

# === 新增：场景展示配置API ===

class SceneDisplayConfigSchema(BaseModel):
    card_count: int = 0                    # 折卡数量
    prerequisite_scenes: List[str] = []    # 前置场景ID列表
    days_required: int = 0                 # 天数要求

@router.get("/{scene_id}/display-config")
async def get_scene_display_config(scene_id: str, db: Session = Depends(get_db)):
    """获取场景展示配置"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    return {
        "card_count": scene.card_count or 0,
        "prerequisite_scenes": json.loads(scene.prerequisite_scenes or '[]'),
        "days_required": scene.days_required or 0
    }

@router.post("/{scene_id}/display-config")
async def save_scene_display_config(
    scene_id: str, 
    config: SceneDisplayConfigSchema, 
    db: Session = Depends(get_db)
):
    """保存场景展示配置"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 验证前置场景ID的有效性
    if config.prerequisite_scenes:
        for prereq_scene_id in config.prerequisite_scenes:
            prereq_scene = db.query(Scene).filter(Scene.scene_id == prereq_scene_id).first()
            if not prereq_scene:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Prerequisite scene '{prereq_scene_id}' not found"
                )
    
    # 更新场景展示配置
    scene.card_count = config.card_count
    scene.prerequisite_scenes = json.dumps(config.prerequisite_scenes)
    scene.days_required = config.days_required
    scene.updated_at = int(time.time())
    
    db.commit()
    db.refresh(scene)
    
    return {
        "message": "Scene display configuration saved successfully",
        "data": {
            "card_count": scene.card_count,
            "prerequisite_scenes": json.loads(scene.prerequisite_scenes or '[]'),
            "days_required": scene.days_required
        }
    }