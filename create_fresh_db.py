#!/usr/bin/env python3
"""
创建全新的数据库，包含所有失败惩罚字段
"""
import sys
import os

# 添加当前目录到路径
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sultan_game'))

from sqlalchemy import create_engine
from core.database import Base
from models.scene import Scene
from models.scene_requirements import SceneRewardExtended, SceneRequirement, SceneCardBinding, PlayerNPCReward, CardReward
from models.npc import NPC, PlayerNPCInstance
from models.card import Card
from models.ai_config import AIConfig
from models.template import Template

def create_database():
    """创建数据库和所有表"""
    print("正在创建数据库...")
    
    # 创建数据库引擎
    engine = create_engine('sqlite:///sultan_game.db', echo=True)
    
    try:
        # 删除所有现有表
        print("删除现有表...")
        Base.metadata.drop_all(engine)
        
        # 创建所有表
        print("创建新表...")
        Base.metadata.create_all(engine)
        
        print("数据库创建成功！")
        print("已创建的表:")
        for table_name in Base.metadata.tables.keys():
            print(f"  - {table_name}")
            
        return True
        
    except Exception as e:
        print(f"数据库创建失败: {e}")
        return False

if __name__ == "__main__":
    success = create_database()
    sys.exit(0 if success else 1)