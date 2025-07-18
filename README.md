# 苏丹的游戏 - AI多智能体游戏系统

一个基于AI多智能体技术的大型叙事驱动游戏，featuring 6大阵营和复杂的角色互动系统。

## 🎮 游戏概述

**苏丹的游戏**是一个复杂的政治策略游戏，玩家需要在6个不同的阵营中周旋，通过智慧和策略来达成目标。

### 🏛️ 六大阵营

1. **苏丹王** - 至高无上的统治者
2. **大臣** - 宰相和朝臣集团
3. **将军** - 军事势力与武装部队
4. **黑鸭会** - 控制黑市和监狱的秘密组织
5. **平民阵营** - 商人公会、手工业者、农民代表
6. **学者阵营** - 宫廷学者、法官、医生

## 🛠️ 技术架构

### 后端 (FastAPI + SQLAlchemy)
- **框架**: FastAPI
- **数据库**: PostgreSQL + SQLAlchemy ORM
- **包管理**: uv (推荐) / pip
- **测试**: pytest + pytest-asyncio
- **迁移**: Alembic

### 前端 (Next.js 15 + TypeScript)
- **框架**: Next.js 15
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Hooks
- **API通信**: Axios

### 核心系统
- **AI智能体系统**: 多个AI代理控制不同角色
- **属性系统**: 9维属性模型 (力量、防御、智力、魅力、忠诚、影响力、指挥力、隐秘、生命值)
- **卡片系统**: 4种稀有度、多种效果类型的卡片
- **场景系统**: 动态场景生成与AI驱动的故事情节

## 📁 项目结构

```
game_ai/
├── sultan_game/                    # 后端核心
│   ├── api/                        # API路由
│   │   ├── scenes.py              # 场景管理API
│   │   ├── npcs.py                # NPC管理API
│   │   ├── cards.py               # 卡片管理API
│   │   └── ai_configs.py          # AI配置API
│   ├── models/                     # 数据模型
│   │   ├── scene_redesign.py      # 场景系统模型
│   │   ├── npc_redesign.py        # NPC系统模型
│   │   ├── card_redesign.py       # 卡片系统模型
│   │   └── scene_requirements.py  # 场景需求模型
│   ├── core/                       # 核心配置
│   │   └── database.py            # 数据库配置
│   ├── alembic/                    # 数据库迁移
│   ├── static/                     # 静态文件
│   ├── main.py                     # 应用入口
│   └── admin-panel/                # 管理后台
│       ├── src/
│       │   ├── app/               # Next.js页面
│       │   │   ├── scenes/        # 场景管理页面
│       │   │   ├── npcs/          # NPC管理页面
│       │   │   ├── cards/         # 卡片管理页面
│       │   │   └── ai-configs/    # AI配置页面
│       │   ├── components/        # 共享组件
│       │   └── lib/              # 工具库
│       └── package.json
├── game_design_docs/              # 游戏设计文档
├── CLAUDE.md                      # AI助手配置
└── README.md
```

## 🚀 快速开始

### 环境要求
- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- UV包管理器 (推荐)

### 后端设置

1. **克隆项目**
```bash
git clone https://github.com/luzhipeng728/game_ai.git
cd game_ai/sultan_game
```

2. **安装依赖**
```bash
# 使用uv (推荐)
uv init
uv add fastapi uvicorn sqlalchemy alembic psycopg2-binary pydantic python-multipart pytest pytest-asyncio httpx

# 或使用pip
pip install -r requirements.txt
```

3. **数据库设置**
```bash
# 创建数据库
createdb sultan_game

# 运行迁移
uv run alembic upgrade head
```

4. **启动服务**
```bash
uv run uvicorn main:app --reload --port 8001
```

### 前端设置

1. **进入前端目录**
```bash
cd admin-panel
```

2. **安装依赖**
```bash
npm install
```

3. **启动开发服务器**
```bash
npm run dev
```

4. **访问管理后台**
打开浏览器访问 `http://localhost:3000`

## 📖 核心功能

### 🎯 场景管理系统
- **属性要求配置**: 设置进入场景所需的9维属性要求
- **卡片绑定系统**: 为场景绑定特定卡片，增强游戏体验
- **奖励系统**: 丰富的奖励机制，包括属性点、经验值、卡片奖励、NPC奖励
- **AI配置**: 每个场景都可以配置独立的AI旁白和评分系统

### 🃏 卡片系统
- **稀有度体系**: 普通/稀有/史诗/传说四个等级
- **效果类型**: 立即效果、持续效果、永久效果
- **使用限制**: 支持复杂的使用条件和限制
- **套装系统**: 支持卡片组合和协同效果

### 🤖 NPC系统
- **双轨制设计**: 场景固定NPC vs 玩家拥有NPC
- **属性成长**: 完整的属性点分配和成长系统
- **AI行为**: 每个NPC都有独特的AI行为模式
- **转化机制**: 场景NPC可以转化为玩家NPC

### 🎮 AI智能体系统
- **多层AI架构**: 旁白AI、评分AI、对话AI
- **动态故事生成**: 基于玩家行为的动态剧情
- **个性化体验**: 每个玩家都有独特的游戏体验

## 🔧 开发命令

### 后端
```bash
# 启动开发服务器
uv run uvicorn main:app --reload --port 8001

# 运行测试
uv run pytest

# 创建数据库迁移
uv run alembic revision --autogenerate -m "description"

# 应用迁移
uv run alembic upgrade head
```

### 前端
```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm run start

# 类型检查
npm run type-check
```

## 📈 项目状态

- ✅ 核心数据模型设计完成
- ✅ 场景管理系统完成
- ✅ NPC管理系统完成
- ✅ 卡片管理系统完成
- ✅ AI配置系统完成
- ✅ 管理后台界面完成
- ✅ 属性要求配置系统完成
- ✅ 扩展奖励系统完成
- 🔄 AI智能体集成进行中
- 🔄 游戏逻辑引擎开发中

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 作者

- **Lu Zhipeng** - *项目创建者* - [luzhipeng728](https://github.com/luzhipeng728)

## 🙏 致谢

感谢所有为本项目做出贡献的开发者们！

---

**苏丹的游戏** - 在权力的游戏中展现你的智慧 🎭