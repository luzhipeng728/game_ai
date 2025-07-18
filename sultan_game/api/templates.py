from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from core.database import get_db
from models import ConfigTemplate, TemplateType, TemplateCategory, Scene, AIConfig, NPC
import uuid
import time
import json

router = APIRouter(prefix="/templates", tags=["templates"])

# Pydantic schemas
class TemplateBase(BaseModel):
    template_id: str
    name: str
    template_type: str
    category: str
    description: Optional[str] = None
    author: Optional[str] = None
    version: Optional[str] = "1.0"
    tags: Optional[List[str]] = []
    template_data: dict
    is_public: Optional[bool] = False

class TemplateResponse(BaseModel):
    id: str
    template_id: str
    name: str
    template_type: str
    category: str
    description: Optional[str]
    author: Optional[str]
    version: str
    tags: List[str]
    usage_count: int
    is_active: bool
    is_public: bool
    is_official: bool
    created_at: Optional[int]
    updated_at: Optional[int]

class TemplateCreateFromScene(BaseModel):
    scene_id: str
    template_name: str
    description: Optional[str] = None
    tags: Optional[List[str]] = []

@router.get("/", response_model=List[TemplateResponse])
async def get_templates(
    template_type: Optional[str] = None,
    category: Optional[str] = None,
    is_public: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """获取模板列表"""
    query = db.query(ConfigTemplate).filter(ConfigTemplate.is_active == True)
    
    if template_type:
        query = query.filter(ConfigTemplate.template_type == template_type)
    if category:
        query = query.filter(ConfigTemplate.category == category)
    if is_public is not None:
        query = query.filter(ConfigTemplate.is_public == is_public)
    
    templates = query.order_by(ConfigTemplate.usage_count.desc()).all()
    return [template.to_dict() for template in templates]

@router.get("/{template_id}")
async def get_template(template_id: str, db: Session = Depends(get_db)):
    """获取单个模板详情"""
    template = db.query(ConfigTemplate).filter(
        ConfigTemplate.id == template_id,
        ConfigTemplate.is_active == True
    ).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    return template.to_dict()

@router.post("/")
async def create_template(template_data: TemplateBase, db: Session = Depends(get_db)):
    """创建新模板"""
    # 检查template_id是否唯一
    existing = db.query(ConfigTemplate).filter(
        ConfigTemplate.template_id == template_data.template_id
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Template ID already exists")
    
    template = ConfigTemplate(
        id=str(uuid.uuid4()),
        template_id=template_data.template_id,
        name=template_data.name,
        template_type=TemplateType(template_data.template_type),
        category=TemplateCategory(template_data.category),
        description=template_data.description,
        author=template_data.author,
        version=template_data.version,
        tags=template_data.tags or [],
        template_data=template_data.template_data,
        is_public=template_data.is_public,
        created_by="admin",
        created_at=int(time.time()),
        updated_at=int(time.time())
    )
    
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return {"message": "Template created successfully", "id": template.id}

@router.put("/{template_id}")
async def update_template(template_id: str, template_data: TemplateBase, db: Session = Depends(get_db)):
    """更新模板"""
    template = db.query(ConfigTemplate).filter(ConfigTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    # 更新字段
    template.name = template_data.name
    template.template_type = TemplateType(template_data.template_type)
    template.category = TemplateCategory(template_data.category)
    template.description = template_data.description
    template.author = template_data.author
    template.version = template_data.version
    template.tags = template_data.tags or []
    template.template_data = template_data.template_data
    template.is_public = template_data.is_public
    template.updated_at = int(time.time())
    
    db.commit()
    db.refresh(template)
    
    return {"message": "Template updated successfully"}

@router.delete("/{template_id}")
async def delete_template(template_id: str, db: Session = Depends(get_db)):
    """删除模板（软删除）"""
    template = db.query(ConfigTemplate).filter(ConfigTemplate.id == template_id).first()
    
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    template.is_active = False
    template.updated_at = int(time.time())
    
    db.commit()
    
    return {"message": "Template deleted successfully"}

@router.post("/from-scene")
async def create_template_from_scene(data: TemplateCreateFromScene, db: Session = Depends(get_db)):
    """从现有场景创建模板"""
    # 获取场景信息
    scene = db.query(Scene).filter(Scene.id == data.scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    # 获取场景的相关配置
    from models import SceneNPCConfiguration, SceneAIConfiguration, SceneReward
    
    # 获取NPC配置
    npc_configs = db.query(SceneNPCConfiguration).filter(
        SceneNPCConfiguration.scene_id == data.scene_id
    ).all()
    
    # 获取AI配置
    ai_configs = db.query(SceneAIConfiguration).filter(
        SceneAIConfiguration.scene_id == data.scene_id
    ).all()
    
    # 获取奖励配置
    reward_config = db.query(SceneReward).filter(
        SceneReward.scene_id == data.scene_id
    ).first()
    
    # 构建模板数据
    template_data = {
        "scene_config": {
            "category": scene.category.value,
            "scene_type": scene.scene_type,
            "difficulty_level": scene.difficulty_level,
            "estimated_duration": scene.estimated_duration,
            "is_repeatable": scene.is_repeatable,
            "max_attempts": scene.max_attempts,
            "cooldown_hours": scene.cooldown_hours,
            "location": scene.location,
            "time_of_day": scene.time_of_day.value if scene.time_of_day else None,
            "weather": scene.weather
        },
        "npc_configs": [
            {
                "role": npc.role,
                "initial_position": npc.initial_position,
                "speaking_order_priority": npc.speaking_order_priority,
                "special_behavior": npc.special_behavior,
                "can_be_challenged": npc.can_be_challenged,
                "can_be_converted": npc.can_be_converted,
                "attribute_modifiers": npc.attribute_modifiers
            } for npc in npc_configs
        ],
        "ai_configs": [
            {
                "narrator_prompt": ai.narrator_prompt,
                "narrator_style": ai.narrator_style,
                "narrator_trigger_frequency": ai.narrator_trigger_frequency,
                "evaluator_weights": ai.evaluator_weights
            } for ai in ai_configs
        ],
        "reward_config": {
            "success_attribute_points": reward_config.success_attribute_points if reward_config else 15,
            "success_experience": reward_config.success_experience if reward_config else 100,
            "success_reputation": reward_config.success_reputation if reward_config else 10,
            "success_gold": reward_config.success_gold if reward_config else 0,
            "failure_reputation": reward_config.failure_reputation if reward_config else 0
        }
    }
    
    # 创建模板
    template = ConfigTemplate(
        id=str(uuid.uuid4()),
        template_id=f"scene_template_{int(time.time())}",
        name=data.template_name,
        template_type=TemplateType.SCENE,
        category=TemplateCategory(scene.category.value) if hasattr(scene.category, 'value') else TemplateCategory.DIALOGUE,
        description=data.description or f"从场景 '{scene.name}' 生成的模板",
        author="admin",
        version="1.0",
        tags=data.tags or [],
        template_data=template_data,
        is_public=False,
        created_by="admin",
        created_at=int(time.time()),
        updated_at=int(time.time())
    )
    
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return {"message": "Template created from scene successfully", "id": template.id}

@router.post("/from-ai-config/{ai_config_id}")
async def create_template_from_ai_config(
    ai_config_id: str, 
    template_name: str,
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """从AI配置创建模板"""
    ai_config = db.query(AIConfig).filter(AIConfig.id == ai_config_id).first()
    if not ai_config:
        raise HTTPException(status_code=404, detail="AI Config not found")
    
    # 构建模板数据
    template_data = {
        "ai_type": ai_config.ai_type.value,
        "base_prompt": ai_config.base_prompt,
        "system_prompt": ai_config.system_prompt,
        "model_settings": ai_config.model_settings,
        "character_config": ai_config.character_config,
        "evaluation_config": ai_config.evaluation_config,
        "generation_config": ai_config.generation_config,
        "narration_config": ai_config.narration_config,
        "version": ai_config.version
    }
    
    template = ConfigTemplate(
        id=str(uuid.uuid4()),
        template_id=f"ai_template_{int(time.time())}",
        name=template_name,
        template_type=TemplateType.AI_CONFIG,
        category=TemplateCategory.DIALOGUE,  # 默认分类
        description=description or f"从AI配置 '{ai_config.name}' 生成的模板",
        author="admin",
        version="1.0",
        tags=[ai_config.ai_type.value],
        template_data=template_data,
        is_public=False,
        created_by="admin",
        created_at=int(time.time()),
        updated_at=int(time.time())
    )
    
    db.add(template)
    db.commit()
    db.refresh(template)
    
    return {"message": "Template created from AI config successfully", "id": template.id}

@router.post("/{template_id}/apply-to-scene/{scene_id}")
async def apply_template_to_scene(template_id: str, scene_id: str, db: Session = Depends(get_db)):
    """将模板应用到场景"""
    template = db.query(ConfigTemplate).filter(ConfigTemplate.id == template_id).first()
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    if template.template_type != TemplateType.SCENE:
        raise HTTPException(status_code=400, detail="Template type must be SCENE")
    
    # 应用模板数据到场景
    template_data = template.template_data
    scene_config = template_data.get("scene_config", {})
    
    # 更新场景基础配置
    if "scene_type" in scene_config:
        scene.scene_type = scene_config["scene_type"]
    if "difficulty_level" in scene_config:
        scene.difficulty_level = scene_config["difficulty_level"]
    if "estimated_duration" in scene_config:
        scene.estimated_duration = scene_config["estimated_duration"]
    
    scene.updated_at = int(time.time())
    
    # 更新使用统计
    template.usage_count += 1
    template.last_used_at = int(time.time())
    
    db.commit()
    
    return {"message": "Template applied to scene successfully"}

@router.get("/categories/enum")
async def get_template_categories():
    """获取模板分类枚举"""
    return [{"value": cat.value, "label": cat.value.title()} for cat in TemplateCategory]

@router.get("/types/enum")
async def get_template_types():
    """获取模板类型枚举"""
    return [{"value": typ.value, "label": typ.value.replace("_", " ").title()} for typ in TemplateType]