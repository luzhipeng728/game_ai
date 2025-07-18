from sqlalchemy import Column, Integer, String, Text, JSON, Boolean, Enum
from sqlalchemy.orm import relationship
from core.database import Base
import uuid
import enum

class TemplateType(enum.Enum):
    SCENE = "scene"           # 场景模板
    AI_CONFIG = "ai_config"   # AI配置模板  
    NPC_CONFIG = "npc_config" # NPC配置模板
    COMPOSITE = "composite"   # 复合模板（包含场景+AI+NPC）

class TemplateCategory(enum.Enum):
    DIALOGUE = "dialogue"     # 对话类
    COMBAT = "combat"         # 战斗类
    POLITICAL = "political"   # 政治类
    ECONOMIC = "economic"     # 经济类
    STEALTH = "stealth"       # 潜行类
    SOCIAL = "social"         # 社交类

class ConfigTemplate(Base):
    """配置模板表"""
    __tablename__ = "config_templates"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    template_id = Column(String(50), unique=True, nullable=False, index=True)
    name = Column(String(100), nullable=False)
    template_type = Column(Enum(TemplateType), nullable=False)
    category = Column(Enum(TemplateCategory), nullable=False)
    
    # 描述信息
    description = Column(Text)
    author = Column(String(100))
    version = Column(String(20), default="1.0")
    tags = Column(JSON, default=list)  # 标签列表
    
    # 模板内容
    template_data = Column(JSON, nullable=False)
    # 格式示例:
    # scene模板: {"scene_config": {...}, "ai_config": {...}, "npc_configs": [...]}
    # ai_config模板: {"ai_type": "narrator", "base_prompt": "...", ...}
    # npc_config模板: {"tier": "gold", "faction": "minister", ...}
    
    # 使用统计
    usage_count = Column(Integer, default=0)
    last_used_at = Column(Integer)
    
    # 兼容性信息
    min_game_version = Column(String(20))
    max_game_version = Column(String(20))
    dependencies = Column(JSON, default=list)  # 依赖的其他模板
    
    # 状态管理
    is_active = Column(Boolean, default=True)
    is_public = Column(Boolean, default=False)  # 是否公开
    is_official = Column(Boolean, default=False)  # 是否官方模板
    
    # 系统字段
    created_by = Column(String(100))
    created_at = Column(Integer)
    updated_at = Column(Integer)
    
    def to_dict(self):
        return {
            "id": self.id,
            "template_id": self.template_id,
            "name": self.name,
            "template_type": self.template_type.value,
            "category": self.category.value,
            "description": self.description,
            "author": self.author,
            "version": self.version,
            "tags": self.tags,
            "template_data": self.template_data,
            "usage_count": self.usage_count,
            "last_used_at": self.last_used_at,
            "is_active": self.is_active,
            "is_public": self.is_public,
            "is_official": self.is_official,
            "created_by": self.created_by,
            "created_at": self.created_at,
            "updated_at": self.updated_at
        }