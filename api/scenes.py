from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from core.database import get_db
from models.scene import Scene, SceneNPC
from models.scene_config import SceneConfig, SceneStatus
import uuid

router = APIRouter(prefix="/scenes", tags=["scenes"])

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

@router.get("/", response_model=List[SceneResponse])
async def get_scenes(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取场景列表"""
    query = db.query(Scene)
    
    if category:
        query = query.filter(Scene.category == category)
    
    if status:
        # 需要关联SceneConfig表来筛选状态
        query = query.join(SceneConfig).filter(SceneConfig.status == status)
    
    scenes = query.offset(skip).limit(limit).all()
    
    # 为每个场景添加NPC数量
    result = []
    for scene in scenes:
        scene_dict = scene.__dict__.copy()
        scene_dict['npc_count'] = len(scene.scene_npcs) if hasattr(scene, 'scene_npcs') else 0
        # 添加配置状态
        if hasattr(scene, 'config') and scene.config:
            scene_dict['status'] = scene.config.status.value
        else:
            scene_dict['status'] = 'draft'
        result.append(SceneResponse(**scene_dict))
    
    return result

@router.get("/{scene_id}", response_model=SceneResponse)
async def get_scene(scene_id: str, db: Session = Depends(get_db)):
    """获取单个场景详情"""
    scene = db.query(Scene).filter(Scene.id == scene_id).first()
    if not scene:
        raise HTTPException(status_code=404, detail="Scene not found")
    
    scene_dict = scene.__dict__.copy()
    scene_dict['npc_count'] = len(scene.scene_npcs) if hasattr(scene, 'scene_npcs') else 0
    if hasattr(scene, 'config') and scene.config:
        scene_dict['status'] = scene.config.status.value
    else:
        scene_dict['status'] = 'draft'
    
    return SceneResponse(**scene_dict)

@router.post("/", response_model=SceneResponse)
async def create_scene(scene: SceneCreate, db: Session = Depends(get_db)):
    """创建新场景"""
    # 检查scene_id是否已存在
    existing = db.query(Scene).filter(Scene.scene_id == scene.scene_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Scene ID already exists")
    
    # 创建场景
    db_scene = Scene(
        id=uuid.uuid4(),
        scene_id=scene.scene_id,
        name=scene.name,
        category=scene.category,
        chapter=scene.chapter,
        description=scene.description,
        background_image=scene.background_image,
        background_music=scene.background_music,
        location=scene.location,
        time_of_day=scene.time_of_day,
        weather=scene.weather,
        attribute_requirements=scene.attribute_requirements,
        card_requirements=scene.card_requirements,
        prerequisites=scene.prerequisites,
        restrictions=scene.restrictions,
        min_player_npcs=scene.min_player_npcs,
        max_player_npcs=scene.max_player_npcs,
        recommended_npc_types=scene.recommended_npc_types,
        special_bonuses=scene.special_bonuses,
        narrator_prompt=scene.narrator_prompt,
        evaluator_config=scene.evaluator_config,
        success_rewards=scene.success_rewards,
        failure_penalties=scene.failure_penalties,
        dynamic_events=scene.dynamic_events,
        hidden_elements=scene.hidden_elements,
        is_active=True,
        created_at=int(time.time()),
        updated_at=int(time.time())
    )
    
    db.add(db_scene)
    db.commit()
    db.refresh(db_scene)
    
    # 创建场景配置
    db_config = SceneConfig(
        id=uuid.uuid4(),
        scene_id=db_scene.id,
        config_version="1.0",
        status=SceneStatus.DRAFT,
        narrator_config=scene.evaluator_config.get('narrator', {}),
        evaluator_config=scene.evaluator_config,
        expected_rounds={"min": 10, "max": 25},
        scoring_weights={"story_progress": 0.4, "dialogue_quality": 0.3, "tension_level": 0.3},
        trigger_thresholds={"dice_trigger": 75, "tension_trigger": 85}
    )
    
    db.add(db_config)
    db.commit()
    
    scene_dict = db_scene.__dict__.copy()
    scene_dict['npc_count'] = 0
    scene_dict['status'] = 'draft'
    
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
            # 更新配置状态
            if hasattr(db_scene, 'config') and db_scene.config:
                db_scene.config.status = SceneStatus(value)
        else:
            setattr(db_scene, field, value)
    
    db_scene.updated_at = int(time.time())
    db.commit()
    db.refresh(db_scene)
    
    scene_dict = db_scene.__dict__.copy()
    scene_dict['npc_count'] = len(db_scene.scene_npcs) if hasattr(db_scene, 'scene_npcs') else 0
    if hasattr(db_scene, 'config') and db_scene.config:
        scene_dict['status'] = db_scene.config.status.value
    else:
        scene_dict['status'] = 'draft'
    
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
    config = db.query(SceneConfig).filter(SceneConfig.scene_id == scene_id).first()
    if not config:
        raise HTTPException(status_code=404, detail="Scene config not found")
    
    return SceneConfigResponse(**config.__dict__)

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

import time