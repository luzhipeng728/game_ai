from fastapi import FastAPI, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from api import scenes, npcs, cards, ai_configs, templates
from core.database import Base, engine
import time

# 创建数据库表
Base.metadata.create_all(bind=engine)

# 创建FastAPI应用
app = FastAPI(
    title="苏丹的游戏 - 后端API",
    description="AI多智能体游戏后端管理系统",
    version="1.0.0"
)

# 添加CORS中间件
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 挂载静态文件
app.mount("/static", StaticFiles(directory="static"), name="static")

# 包含API路由
app.include_router(scenes.router, prefix="/api")
app.include_router(npcs.router, prefix="/api")
app.include_router(cards.router, prefix="/api")
app.include_router(ai_configs.router, prefix="/api")
app.include_router(templates.router, prefix="/api")

# 根路径重定向到管理界面
@app.get("/")
async def root():
    return RedirectResponse(url="/static/admin/index.html")

# 健康检查
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": int(time.time())}

# 仪表板API
@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """获取仪表板统计数据"""
    # TODO: 从数据库获取真实统计数据
    return {
        "scenes": 12,
        "npcs": 45,
        "cards": 78,
        "ai_configs": 8,
        "active_players": 156,
        "total_sessions": 2340
    }

@app.get("/api/dashboard/activities")
async def get_recent_activities():
    """获取最近活动"""
    # TODO: 从数据库获取真实活动数据
    current_time = int(time.time())
    return [
        {
            "timestamp": current_time - 3600,
            "description": "创建了新场景'宰相的试探'",
            "type": "scene_created",
            "user": "admin"
        },
        {
            "timestamp": current_time - 7200,
            "description": "更新了NPC'将军哲巴尔'的配置",
            "type": "npc_updated", 
            "user": "admin"
        },
        {
            "timestamp": current_time - 10800,
            "description": "新增了卡片'贿赂金币'",
            "type": "card_created",
            "user": "admin"
        },
        {
            "timestamp": current_time - 14400,
            "description": "配置了新的AI智能体'政治场景旁白'",
            "type": "ai_config_created",
            "user": "admin"
        }
    ]

# 系统信息API
@app.get("/api/system/info")
async def get_system_info():
    """获取系统信息"""
    return {
        "version": "1.0.0",
        "database_status": "connected",
        "api_status": "running",
        "ai_service_status": "pending_configuration",
        "last_backup": int(time.time()) - 86400,
        "uptime": 3600  # 秒
    }

# 配置验证API
@app.post("/api/validate/config")
async def validate_config(config_type: str, config_data: dict):
    """验证配置数据"""
    validation_results = {
        "is_valid": True,
        "errors": [],
        "warnings": [],
        "suggestions": []
    }
    
    if config_type == "scene":
        # 验证场景配置
        required_fields = ["scene_id", "name", "narrator_prompt"]
        for field in required_fields:
            if field not in config_data:
                validation_results["errors"].append(f"Missing required field: {field}")
                validation_results["is_valid"] = False
        
        # 检查场景ID格式
        if "scene_id" in config_data and not config_data["scene_id"].replace("_", "").isalnum():
            validation_results["warnings"].append("Scene ID should only contain letters, numbers, and underscores")
    
    elif config_type == "npc":
        # 验证NPC配置
        required_fields = ["npc_id", "name", "intelligence", "strength", "defense", "hp_max"]
        for field in required_fields:
            if field not in config_data:
                validation_results["errors"].append(f"Missing required field: {field}")
                validation_results["is_valid"] = False
        
        # 验证属性范围
        if "intelligence" in config_data and not (1 <= config_data["intelligence"] <= 20):
            validation_results["errors"].append("Intelligence must be between 1 and 20")
            validation_results["is_valid"] = False
    
    elif config_type == "card":
        # 验证卡片配置
        required_fields = ["card_id", "name", "rarity", "card_type"]
        for field in required_fields:
            if field not in config_data:
                validation_results["errors"].append(f"Missing required field: {field}")
                validation_results["is_valid"] = False
    
    return validation_results

# 批量操作API
@app.post("/api/batch/import")
async def batch_import(import_type: str, data: list):
    """批量导入数据"""
    results = {
        "total": len(data),
        "success": 0,
        "failed": 0,
        "errors": []
    }
    
    for item in data:
        try:
            # TODO: 根据import_type处理不同类型的数据导入
            if import_type == "scenes":
                # 导入场景
                pass
            elif import_type == "npcs":
                # 导入NPC
                pass
            elif import_type == "cards":
                # 导入卡片
                pass
            
            results["success"] += 1
        except Exception as e:
            results["failed"] += 1
            results["errors"].append(str(e))
    
    return results

@app.post("/api/batch/export")
async def batch_export(export_type: str, filters: dict = None):
    """批量导出数据"""
    # TODO: 实现数据导出功能
    return {
        "export_url": f"/api/downloads/{export_type}_{int(time.time())}.json",
        "expires_at": int(time.time()) + 3600
    }

# 错误处理
from fastapi.responses import JSONResponse

@app.exception_handler(404)
async def not_found_handler(request, exc):
    return JSONResponse(status_code=404, content={"error": "Resource not found", "status_code": 404})

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return JSONResponse(status_code=500, content={"error": "Internal server error", "status_code": 500})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)