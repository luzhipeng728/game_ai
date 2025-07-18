from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from core.database import get_db
from models import Card, CardRarity, CardCategory, EffectType, CardEffect
import uuid
import time

router = APIRouter(prefix="/cards", tags=["cards"])

# Pydantic schemas
class CardBase(BaseModel):
    card_id: str
    name: str
    rarity: str
    category: str
    sub_category: Optional[str] = None
    description: Optional[str] = None
    flavor_text: Optional[str] = None
    image_url: Optional[str] = None

class CardCreate(CardBase):
    base_cost: Optional[int] = 0
    is_consumable: Optional[bool] = True
    max_stack: Optional[int] = 1
    use_conditions: Optional[dict] = {}

class CardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    base_cost: Optional[int] = None
    is_active: Optional[bool] = None

class CardResponse(CardBase):
    id: str
    base_cost: int
    is_consumable: bool
    max_stack: int
    is_active: bool
    created_at: Optional[int] = None
    updated_at: Optional[int] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[CardResponse])
async def get_cards(
    skip: int = 0,
    limit: int = 100,
    rarity: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取卡片列表"""
    query = db.query(Card).filter(Card.is_active == True)
    
    if rarity:
        query = query.filter(Card.rarity == CardRarity(rarity))
    
    if category:
        query = query.filter(Card.category == CardCategory(category))
    
    cards = query.offset(skip).limit(limit).all()
    
    # 转换enum值为字符串
    result = []
    for card in cards:
        card_dict = card.__dict__.copy()
        card_dict['rarity'] = card.rarity.value
        card_dict['category'] = card.category.value
        result.append(CardResponse(**card_dict))
    
    return result

@router.get("/{card_id}", response_model=CardResponse)
async def get_card(card_id: str, db: Session = Depends(get_db)):
    """获取单个卡片详情"""
    card = db.query(Card).filter(Card.id == card_id).first()
    if not card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    card_dict = card.__dict__.copy()
    card_dict['rarity'] = card.rarity.value
    card_dict['category'] = card.category.value
    
    return CardResponse(**card_dict)

@router.post("/", response_model=CardResponse)
async def create_card(card: CardCreate, db: Session = Depends(get_db)):
    """创建新卡片"""
    # 检查card_id是否已存在
    existing = db.query(Card).filter(Card.card_id == card.card_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Card ID already exists")
    
    # 创建卡片
    db_card = Card(
        id=str(uuid.uuid4()),
        card_id=card.card_id,
        name=card.name,
        rarity=CardRarity(card.rarity),
        category=CardCategory(card.category),
        sub_category=card.sub_category,
        description=card.description,
        flavor_text=card.flavor_text,
        base_cost=card.base_cost,
        is_consumable=card.is_consumable,
        max_stack=card.max_stack,
        use_conditions=card.use_conditions,
        is_active=True,
        created_at=int(time.time()),
        updated_at=int(time.time())
    )
    
    db.add(db_card)
    db.commit()
    db.refresh(db_card)
    
    card_dict = db_card.__dict__.copy()
    card_dict['rarity'] = db_card.rarity.value
    card_dict['category'] = db_card.category.value
    
    return CardResponse(**card_dict)

@router.put("/{card_id}", response_model=CardResponse)
async def update_card(card_id: str, card_update: CardUpdate, db: Session = Depends(get_db)):
    """更新卡片"""
    db_card = db.query(Card).filter(Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # 更新字段
    for field, value in card_update.dict(exclude_unset=True).items():
        if value is not None:
            setattr(db_card, field, value)
    
    db_card.updated_at = int(time.time())
    db.commit()
    db.refresh(db_card)
    
    card_dict = db_card.__dict__.copy()
    card_dict['rarity'] = db_card.rarity.value
    card_dict['category'] = db_card.category.value
    
    return CardResponse(**card_dict)

@router.delete("/{card_id}")
async def delete_card(card_id: str, db: Session = Depends(get_db)):
    """删除卡片"""
    db_card = db.query(Card).filter(Card.id == card_id).first()
    if not db_card:
        raise HTTPException(status_code=404, detail="Card not found")
    
    # 软删除：设置为不活跃
    db_card.is_active = False
    db_card.updated_at = int(time.time())
    db.commit()
    
    return {"message": "Card deleted successfully"}

@router.get("/types/enum")
async def get_card_enums():
    """获取卡片相关的枚举值"""
    return {
        "rarities": [e.value for e in CardRarity],
        "categories": [e.value for e in CardCategory],
        "effect_types": [e.value for e in EffectType]
    }