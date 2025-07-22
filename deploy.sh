#!/bin/bash

# 苏丹的游戏后端服务部署脚本
# 使用方法: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 开始部署苏丹的游戏后端服务..."

# 检查环境
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 未安装，请先安装 Python3"
    exit 1
fi

if ! command -v uv &> /dev/null; then
    echo "📦 uv 未安装，正在安装..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    source ~/.bashrc
fi

# 进入项目目录
cd "$(dirname "$0")/sultan_game"

echo "📦 安装依赖..."
uv sync

echo "🗄️ 设置数据库..."
# 创建数据库（如果不存在）
if [ ! -f "sultan_game.db" ]; then
    echo "创建数据库表..."
    uv run python -c "
from core.database import Base, engine
from models import *
Base.metadata.create_all(engine)
print('数据库初始化完成')
"
fi

echo "🔧 创建服务配置..."

# 创建 systemd 服务文件
sudo tee /etc/systemd/system/sultan-game.service > /dev/null <<EOF
[Unit]
Description=Sultan Game Backend API
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
ExecStart=$(which uv) run uvicorn main:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=3
Environment=PATH=$(uv run python -c "import sys; print(':'.join(sys.path))")

[Install]
WantedBy=multi-user.target
EOF

# 重新加载 systemd
sudo systemctl daemon-reload

# 启用和启动服务
sudo systemctl enable sultan-game
sudo systemctl start sultan-game

echo "✅ 部署完成！"
echo "📊 服务状态："
sudo systemctl status sultan-game --no-pager

echo ""
echo "🔗 服务管理命令："
echo "启动: sudo systemctl start sultan-game"
echo "停止: sudo systemctl stop sultan-game" 
echo "重启: sudo systemctl restart sultan-game"
echo "状态: sudo systemctl status sultan-game"
echo "日志: sudo journalctl -f -u sultan-game"
echo ""
echo "🌐 API访问地址: http://localhost:8001"
echo "🩺 健康检查: curl http://localhost:8001/health"