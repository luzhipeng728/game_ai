from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel
from core.database import get_db
from models import AIConfig, AIType
import uuid
import time

router = APIRouter(prefix="/ai-configs", tags=["ai-configs"])

# Pydantic schemas
class AIConfigBase(BaseModel):
    config_id: str
    name: str
    ai_type: str
    base_prompt: str
    system_prompt: Optional[str] = None
    model_settings: Optional[dict] = None
    character_config: Optional[dict] = None
    evaluation_config: Optional[dict] = None
    generation_config: Optional[dict] = None
    narration_config: Optional[dict] = None
    version: str = "1.0"
    created_by: Optional[str] = None

class AIConfigCreate(AIConfigBase):
    pass

class AIConfigUpdate(BaseModel):
    name: Optional[str] = None
    base_prompt: Optional[str] = None
    system_prompt: Optional[str] = None
    model_settings: Optional[dict] = None
    character_config: Optional[dict] = None
    evaluation_config: Optional[dict] = None
    generation_config: Optional[dict] = None
    narration_config: Optional[dict] = None
    is_active: Optional[bool] = None

class AIConfigResponse(AIConfigBase):
    id: str
    is_active: bool
    created_at: Optional[int] = None
    updated_at: Optional[int] = None

    class Config:
        from_attributes = True

@router.get("/", response_model=List[AIConfigResponse])
async def get_ai_configs(
    skip: int = 0,
    limit: int = 100,
    ai_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取AI配置列表"""
    query = db.query(AIConfig).filter(AIConfig.is_active == True)
    
    if ai_type:
        query = query.filter(AIConfig.ai_type == AIType(ai_type))
    
    configs = query.offset(skip).limit(limit).all()
    
    # 转换enum值为字符串
    result = []
    for config in configs:
        config_dict = config.__dict__.copy()
        config_dict['ai_type'] = config.ai_type.value
        config_dict['id'] = str(config.id)  # 转换UUID为字符串
        # 修复字段名不匹配问题
        config_dict['model_settings'] = config.model_config
        result.append(AIConfigResponse(**config_dict))
    
    return result

@router.get("/{config_id}", response_model=AIConfigResponse)
async def get_ai_config(config_id: str, db: Session = Depends(get_db)):
    """获取单个AI配置详情"""
    try:
        config_uuid = uuid.UUID(config_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    
    config = db.query(AIConfig).filter(AIConfig.id == config_uuid).first()
    if not config:
        raise HTTPException(status_code=404, detail="AI config not found")
    
    config_dict = config.__dict__.copy()
    config_dict['ai_type'] = config.ai_type.value
    config_dict['id'] = str(config.id)  # 转换UUID为字符串
    # 修复字段名不匹配问题
    config_dict['model_settings'] = config.model_config
    
    return AIConfigResponse(**config_dict)

@router.post("/", response_model=AIConfigResponse)
async def create_ai_config(config: AIConfigCreate, db: Session = Depends(get_db)):
    """创建新AI配置"""
    # 检查config_id是否已存在
    existing = db.query(AIConfig).filter(AIConfig.config_id == config.config_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="AI config ID already exists")
    
    # 创建AI配置
    db_config = AIConfig(
        id=uuid.uuid4(),  # 明确设置UUID
        config_id=config.config_id,
        name=config.name,
        ai_type=AIType(config.ai_type),
        base_prompt=config.base_prompt,
        system_prompt=config.system_prompt,
        model_config=config.model_settings or {},
        character_config=config.character_config or {},
        evaluation_config=config.evaluation_config or {},
        generation_config=config.generation_config or {},
        narration_config=config.narration_config or {},
        version=config.version,
        created_by=config.created_by,
        is_active=True,
        created_at=int(time.time()),
        updated_at=int(time.time())
    )
    
    db.add(db_config)
    db.commit()
    db.refresh(db_config)
    
    config_dict = db_config.__dict__.copy()
    config_dict['ai_type'] = db_config.ai_type.value
    config_dict['id'] = str(db_config.id)  # 转换UUID为字符串
    # 修复字段名不匹配问题
    config_dict['model_settings'] = db_config.model_config
    
    return AIConfigResponse(**config_dict)

@router.put("/{config_id}", response_model=AIConfigResponse)
async def update_ai_config(config_id: str, config_update: AIConfigUpdate, db: Session = Depends(get_db)):
    """更新AI配置"""
    try:
        config_uuid = uuid.UUID(config_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    
    db_config = db.query(AIConfig).filter(AIConfig.id == config_uuid).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="AI config not found")
    
    # 更新字段
    for field, value in config_update.dict(exclude_unset=True).items():
        if value is not None:
            # 修复字段名不匹配问题
            if field == 'model_settings':
                setattr(db_config, 'model_config', value)
            else:
                setattr(db_config, field, value)
    
    db_config.updated_at = int(time.time())
    db.commit()
    db.refresh(db_config)
    
    config_dict = db_config.__dict__.copy()
    config_dict['ai_type'] = db_config.ai_type.value
    config_dict['id'] = str(db_config.id)  # 转换UUID为字符串
    # 修复字段名不匹配问题
    config_dict['model_settings'] = db_config.model_config
    
    return AIConfigResponse(**config_dict)

@router.delete("/{config_id}")
async def delete_ai_config(config_id: str, db: Session = Depends(get_db)):
    """删除AI配置"""
    try:
        config_uuid = uuid.UUID(config_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    
    db_config = db.query(AIConfig).filter(AIConfig.id == config_uuid).first()
    if not db_config:
        raise HTTPException(status_code=404, detail="AI config not found")
    
    # 软删除：设置为不活跃
    db_config.is_active = False
    db_config.updated_at = int(time.time())
    db.commit()
    
    return {"message": "AI config deleted successfully"}

@router.get("/{config_id}/performance")
async def get_ai_performance(config_id: str, db: Session = Depends(get_db)):
    """获取AI配置性能指标"""
    try:
        config_uuid = uuid.UUID(config_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    
    config = db.query(AIConfig).filter(AIConfig.id == config_uuid).first()
    if not config:
        raise HTTPException(status_code=404, detail="AI config not found")
    
    # 这里应该从实际的性能数据表中获取数据
    # 现在返回模拟数据
    return {
        "avg_response_time": 1250,
        "success_rate": 0.95,
        "total_calls": 1542,
        "total_tokens": 145860,
        "recent_responses": [
            {
                "created_at": int(time.time()) - 3600,
                "request_type": "dialogue",
                "response_time_ms": 1100,
                "tokens_used": 85,
                "success": True
            },
            {
                "created_at": int(time.time()) - 7200,
                "request_type": "evaluation",
                "response_time_ms": 800,
                "tokens_used": 42,
                "success": True
            }
        ]
    }

@router.post("/{config_id}/test")
async def test_ai_config(config_id: str, test_data: dict, db: Session = Depends(get_db)):
    """测试AI配置"""
    try:
        config_uuid = uuid.UUID(config_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    
    config = db.query(AIConfig).filter(AIConfig.id == config_uuid).first()
    if not config:
        raise HTTPException(status_code=404, detail="AI config not found")
    
    # 模拟AI测试
    # 在实际实现中，这里应该调用实际的AI服务
    return {
        "success": True,
        "response_time_ms": 1200,
        "tokens_used": 76,
        "response_text": f"这是使用配置 {config.name} 生成的测试响应。输入: {test_data.get('prompt', 'No prompt')}"
    }

@router.post("/{config_id}/optimize")
async def optimize_ai_config(config_id: str, db: Session = Depends(get_db)):
    """优化AI配置"""
    try:
        config_uuid = uuid.UUID(config_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    
    config = db.query(AIConfig).filter(AIConfig.id == config_uuid).first()
    if not config:
        raise HTTPException(status_code=404, detail="AI config not found")
    
    # 模拟优化过程
    # 在实际实现中，这里应该根据历史数据调整配置
    return {
        "success": True,
        "message": "AI配置已优化",
        "optimizations": [
            "调整了temperature参数",
            "优化了prompt结构",
            "更新了响应长度限制"
        ]
    }

@router.get("/types/enum")
async def get_ai_types():
    """获取AI类型枚举值"""
    return {
        "ai_types": [e.value for e in AIType]
    }