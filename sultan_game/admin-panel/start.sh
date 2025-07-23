#!/bin/bash

# 苏丹的游戏 - Next.js 管理后台启动脚本

echo "🎮 苏丹的游戏 - Next.js 管理后台"
echo "=================================="

# 检查Node.js是否安装
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 检查npm是否安装
if ! command -v npm &> /dev/null; then
    echo "❌ npm 未安装，请先安装 npm"
    exit 1
fi

echo "📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo "📥 安装依赖..."
    npm install
fi

echo "🔧 检查后端API服务..."
if curl -s http://82.157.9.52:8001/docs > /dev/null; then
    echo "✅ 后端API服务正常运行 (http://82.157.9.52:8001)"
else
    echo "⚠️  后端API服务未运行，请检查线上服务状态"
    echo "   线上API地址: http://82.157.9.52:8001"
    echo ""
    echo "🚀 仍然启动前端服务..."
fi

echo "🚀 启动Next.js开发服务器..."
echo "📱 前端地址: http://localhost:3000"
echo "🔗 后端API: http://82.157.9.52:8001"
echo "📚 API文档: http://82.157.9.52:8001/docs"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm run dev