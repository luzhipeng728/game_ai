from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from core.database import get_db
from models.npc import NPC, NPCType, Tier, Faction
import uuid
import time

router = APIRouter(prefix="/npcs", tags=["npcs"])

# Pydantic schemas
class NPCBase(BaseModel):
    npc_id: str
    name: str
    npc_type: str
    tier: str
    faction: str
    avatar: Optional[str] = None
    description: Optional[str] = None
    appearance: Optional[str] = None
    intelligence: int
    strength: int
    defense: int
    hp_max: int
    charisma: Optional[int] = 50
    loyalty: Optional[int] = 50
    fear: Optional[int] = 0

class NPCCreate(NPCBase):
    custom_attributes: Optional[dict] = {}
    personality_traits: Optional[list] = []
    speaking_style: Optional[dict] = {}
    emotion_thresholds: Optional[dict] = {}
    dialogue_goals: Optional[dict] = {}
    attribute_points_drop: Optional[int] = 0
    guaranteed_drops: Optional[list] = []
    random_drops: Optional[list] = []
    special_rewards: Optional[dict] = {}
    can_convert: Optional[bool] = False
    convert_conditions: Optional[list] = []
    convert_cost: Optional[dict] = {}

class NPCUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    intelligence: Optional[int] = None
    strength: Optional[int] = None
    defense: Optional[int] = None
    hp_max: Optional[int] = None
    charisma: Optional[int] = None
    is_active: Optional[bool] = None
    personality_traits: Optional[list] = None
    speaking_style: Optional[dict] = None

class NPCResponse(NPCBase):
    id: str
    is_active: bool
    created_at: Optional[int] = None
    updated_at: Optional[int] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[NPCResponse])
async def get_npcs(
    skip: int = 0,
    limit: int = 100,
    npc_type: Optional[str] = None,
    tier: Optional[str] = None,
    faction: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取NPC列表"""
    query = db.query(NPC).filter(NPC.is_active == True)
    
    if npc_type:
        query = query.filter(NPC.npc_type == NPCType(npc_type))
    
    if tier:
        query = query.filter(NPC.tier == Tier(tier))
    
    if faction:
        query = query.filter(NPC.faction == Faction(faction))
    
    npcs = query.offset(skip).limit(limit).all()
    
    # 转换enum值为字符串
    result = []
    for npc in npcs:
        npc_dict = npc.__dict__.copy()
        npc_dict['npc_type'] = npc.npc_type.value
        npc_dict['tier'] = npc.tier.value
        npc_dict['faction'] = npc.faction.value
        result.append(NPCResponse(**npc_dict))
    
    return result

@router.get("/{npc_id}", response_model=NPCResponse)
async def get_npc(npc_id: str, db: Session = Depends(get_db)):
    """获取单个NPC详情"""
    npc = db.query(NPC).filter(NPC.id == npc_id).first()
    if not npc:
        raise HTTPException(status_code=404, detail="NPC not found")
    
    npc_dict = npc.__dict__.copy()
    npc_dict['npc_type'] = npc.npc_type.value
    npc_dict['tier'] = npc.tier.value
    npc_dict['faction'] = npc.faction.value
    
    return NPCResponse(**npc_dict)

@router.post("/", response_model=NPCResponse)
async def create_npc(npc: NPCCreate, db: Session = Depends(get_db)):
    """创建新NPC"""
    # 检查npc_id是否已存在
    existing = db.query(NPC).filter(NPC.npc_id == npc.npc_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="NPC ID already exists")
    
    # 验证属性值范围
    if not (1 <= npc.intelligence <= 20):
        raise HTTPException(status_code=400, detail="Intelligence must be between 1 and 20")
    if not (1 <= npc.strength <= 100):
        raise HTTPException(status_code=400, detail="Strength must be between 1 and 100")
    if not (1 <= npc.defense <= 100):
        raise HTTPException(status_code=400, detail="Defense must be between 1 and 100")
    if not (1 <= npc.hp_max <= 500):
        raise HTTPException(status_code=400, detail="HP must be between 1 and 500")
    
    # 创建NPC
    db_npc = NPC(
        id=uuid.uuid4(),
        npc_id=npc.npc_id,
        name=npc.name,
        npc_type=NPCType(npc.npc_type),
        tier=Tier(npc.tier),
        faction=Faction(npc.faction),
        avatar=npc.avatar,
        description=npc.description,
        appearance=npc.appearance,
        intelligence=npc.intelligence,
        strength=npc.strength,
        defense=npc.defense,
        hp_max=npc.hp_max,
        charisma=npc.charisma,
        loyalty=npc.loyalty,
        fear=npc.fear,
        custom_attributes=npc.custom_attributes,
        personality_traits=npc.personality_traits,
        speaking_style=npc.speaking_style,
        emotion_thresholds=npc.emotion_thresholds,
        dialogue_goals=npc.dialogue_goals,
        attribute_points_drop=npc.attribute_points_drop,
        guaranteed_drops=npc.guaranteed_drops,
        random_drops=npc.random_drops,
        special_rewards=npc.special_rewards,
        can_convert=npc.can_convert,
        convert_conditions=npc.convert_conditions,
        convert_cost=npc.convert_cost,
        is_active=True,
        created_at=int(time.time()),
        updated_at=int(time.time())
    )
    
    db.add(db_npc)
    db.commit()
    db.refresh(db_npc)
    
    npc_dict = db_npc.__dict__.copy()
    npc_dict['npc_type'] = db_npc.npc_type.value
    npc_dict['tier'] = db_npc.tier.value
    npc_dict['faction'] = db_npc.faction.value
    
    return NPCResponse(**npc_dict)

@router.put("/{npc_id}", response_model=NPCResponse)
async def update_npc(npc_id: str, npc_update: NPCUpdate, db: Session = Depends(get_db)):
    """更新NPC"""
    db_npc = db.query(NPC).filter(NPC.id == npc_id).first()
    if not db_npc:
        raise HTTPException(status_code=404, detail="NPC not found")
    
    # 更新字段
    for field, value in npc_update.dict(exclude_unset=True).items():
        if value is not None:
            setattr(db_npc, field, value)
    
    db_npc.updated_at = int(time.time())
    db.commit()
    db.refresh(db_npc)
    
    npc_dict = db_npc.__dict__.copy()
    npc_dict['npc_type'] = db_npc.npc_type.value
    npc_dict['tier'] = db_npc.tier.value
    npc_dict['faction'] = db_npc.faction.value
    
    return NPCResponse(**npc_dict)

@router.delete("/{npc_id}")
async def delete_npc(npc_id: str, db: Session = Depends(get_db)):
    """删除NPC"""
    db_npc = db.query(NPC).filter(NPC.id == npc_id).first()
    if not db_npc:
        raise HTTPException(status_code=404, detail="NPC not found")
    
    # 软删除：设置为不活跃
    db_npc.is_active = False
    db_npc.updated_at = int(time.time())
    db.commit()
    
    return {"message": "NPC deleted successfully"}

@router.post("/{npc_id}/validate")
async def validate_npc(npc_id: str, db: Session = Depends(get_db)):
    """验证NPC配置"""
    npc = db.query(NPC).filter(NPC.id == npc_id).first()
    if not npc:
        raise HTTPException(status_code=404, detail="NPC not found")
    
    validation_results = {
        "is_valid": True,
        "errors": [],
        "warnings": []
    }
    
    # 验证属性值
    if not (1 <= npc.intelligence <= 20):
        validation_results["errors"].append("Intelligence must be between 1 and 20")
        validation_results["is_valid"] = False
    
    if not (1 <= npc.strength <= 100):
        validation_results["errors"].append("Strength must be between 1 and 100")
        validation_results["is_valid"] = False
    
    if not (1 <= npc.defense <= 100):
        validation_results["errors"].append("Defense must be between 1 and 100")
        validation_results["is_valid"] = False
    
    if not (1 <= npc.hp_max <= 500):
        validation_results["errors"].append("HP must be between 1 and 500")
        validation_results["is_valid"] = False
    
    # 验证personality_traits
    if not npc.personality_traits:
        validation_results["warnings"].append("No personality traits defined")
    
    # 验证speaking_style
    if not npc.speaking_style:
        validation_results["warnings"].append("No speaking style defined")
    
    # 验证对话目标
    if not npc.dialogue_goals:
        validation_results["warnings"].append("No dialogue goals defined")
    
    return validation_results

@router.get("/types/enum")
async def get_npc_enums():
    """获取NPC相关的枚举值"""
    return {
        "npc_types": [e.value for e in NPCType],
        "tiers": [e.value for e in Tier],
        "factions": [e.value for e in Faction]
    }