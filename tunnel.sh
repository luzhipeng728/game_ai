#!/bin/bash

# SSH隧道脚本 - 将服务器的8001端口映射到本地8001端口
# 这样前端可以通过 localhost:8001 直接访问服务器API

# 配置变量 - 请修改为你的服务器信息
SERVER_USER="your_username"           # 服务器用户名
SERVER_HOST="your_server_ip"          # 服务器IP地址
SERVER_PORT="22"                      # SSH端口，通常是22
LOCAL_PORT="8001"                     # 本地端口
REMOTE_PORT="8001"                    # 服务器端口

echo "🔗 建立SSH隧道连接..."
echo "服务器: $SERVER_USER@$SERVER_HOST:$SERVER_PORT"
echo "端口映射: localhost:$LOCAL_PORT -> $SERVER_HOST:$REMOTE_PORT"
echo ""
echo "连接成功后，前端可以通过 http://localhost:8001 访问服务器API"
echo "按 Ctrl+C 断开连接"
echo ""

# 建立SSH隧道
# -L: 本地端口转发
# -N: 不执行远程命令，只转发端口
# -T: 不分配伪终端
ssh -L $LOCAL_PORT:localhost:$REMOTE_PORT -N -T $SERVER_USER@$SERVER_HOST -p $SERVER_PORT