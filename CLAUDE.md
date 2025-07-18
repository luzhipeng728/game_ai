# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Sultan's Game - AI Multi-Agent Game Project

## Project Overview
苏丹的游戏 - A large narrative-driven game with 6 faction camps featuring AI agents and complex character interactions.

## Factions (阵营)
1. **苏丹王 (Sultan)** - The Sultan himself
2. **大臣 (Ministers)** - 宰相 (Prime Minister) + 朝臣 (Courtiers)  
3. **将军 (Generals)** - Military faction with armies
4. **黑鸭会 (Black Duck Society)** - Controls black market and prisons
5. **平民阵营 (Commoners)** - 商人公会 (Merchant Guild) + 手工业者 (Craftsmen) + 农民代表 (Farmer Representatives)
6. **学者阵营 (Scholars)** - 宫廷学者 (Court Scholars) + 法官 (Judges) + 医生 (Physicians)

## Character Attributes System

### Core Attributes (1-20 or 1-100 scale)
- **CAT (Category)**: Noble status (0=commoner, 1=noble)
- **INT (Intelligence)**: Determines dice count, affects decisions (1-20)
- **STR (Strength)**: Combat power (1-100)  
- **DEF (Defense)**: Defensive capability (1-100)
- **CHA (Charisma)**: Social/diplomatic effectiveness (1-100)
- **LOY (Loyalty)**: Loyalty to player (1-100, partially visible)
- **FEAR**: Fear of player (1-100)
- **INF (Influence)**: Authority and leadership in scenarios
- **CMD (Command)**: Military leadership capability
- **HIDE (Stealth)**: Player character only (1-100)
- **HP (Health Points)**: Physical condition (1-500)

### Character Types & Initial Values

#### Sultan King (金色)
- CAT: 1, INT: 10, STR: 20, DEF: 20
- FEAR: 1-100 (growth), INF: 100, CMD: 100 (growth)
- HP: 100

#### Sultan's Concubines (白银-黄金)
- CAT: 1, INT: 3/6, STR: 1/2, DEF: 1/2
- CHA: 30/60, LOY: growth, FEAR: growth
- HP: 80/120

#### Prime Minister (黄金, 不可击杀)
- CAT: 1, INT: 15, LOY: growth, FEAR: growth
- INF: 50

#### General (黄金)
- CAT: 1, INT: 10, STR: 100, DEF: 100
- LOY: growth, FEAR: growth, INF: 50, CMD: 100
- HP: 300

#### Black Duck Leader (黄金)
- CAT: 0, INT: 15, STR: 80, DEF: 60
- LOY: growth, FEAR: growth
- INF: 0/100 (Black Duck army), CMD: 0/100 (Black Duck army)
- HP: 100

#### Merchant Guild Leader (白银-黄金)
- CAT: 0, INT: 12, STR: 40, DEF: 30
- CHA: 80, LOY: growth, FEAR: growth
- WEALTH: 80-100, INF: 30 (economic influence)
- HP: 150

#### Craftsman Master (白银)
- CAT: 0, INT: 10, STR: 60, DEF: 50
- CHA: 50, LOY: growth, FEAR: growth
- CRAFT: 90-100, INF: 20
- HP: 120

#### Farmer Leader (铜-白银)
- CAT: 0, INT: 8, STR: 70, DEF: 40
- CHA: 60, LOY: growth, FEAR: growth
- FOLK: 70-90, INF: 25 (popular influence)
- HP: 100

#### Court Scholar (黄金)
- CAT: 1, INT: 18, STR: 20, DEF: 20
- CHA: 70, LOY: growth, FEAR: growth
- KNOWLEDGE: 95-100, INF: 40 (wisdom influence)
- HP: 80

#### Chief Judge (黄金)
- CAT: 1, INT: 16, STR: 30, DEF: 40
- CHA: 75, LOY: growth, FEAR: growth
- JUSTICE: 80-95, INF: 45 (legal influence)
- HP: 100

#### Royal Physician (白银-黄金)
- CAT: 0/1, INT: 14, STR: 25, DEF: 35
- CHA: 55, LOY: growth, FEAR: growth
- HEALING: 85-95, POISON: 60-80, INF: 30
- HP: 90

## Special Events System

### Event Examples
1. **甜蜜欢愉 (Sweet Pleasure)**: Triggered by luxury cards + high affection
2. **将军的夜猎 (General's Night Hunt)**: Complex branching event with military implications
3. **荣誉杀戮 (Honor Killing)**: Random duel events with probability formula
4. **虚荣作祟 (Vanity's Folly)**: Palace intrigue with multiple outcomes
5. **处理尸体 (Body Disposal)**: Consequence management events

## NPC Categories
- **Game NPCs**: Fixed attributes, don't change during gameplay
- **Player NPCs**: Dynamic attributes that grow/change during gameplay

## Technical Stack
- **Backend**: Python FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Package Manager**: uv (preferred) or pip
- **Testing**: pytest + pytest-asyncio

## Development Commands
**Using uv (preferred):**
- Setup project: `cd sultan_game && uv init`
- Install dependencies: `cd sultan_game && uv add fastapi uvicorn sqlalchemy alembic psycopg2-binary pydantic python-multipart pytest pytest-asyncio httpx`
- Create database: `createdb sultan_game`
- Initialize database: `cd sultan_game && uv run alembic upgrade head`
- Start server: `cd sultan_game && uv run uvicorn main:app --reload`
- Run tests: `cd sultan_game && uv run pytest`

**Alternative with pip:**
- Install dependencies: `cd sultan_game && pip install -r requirements.txt`
- Create database: `createdb sultan_game`
- Initialize database: `cd sultan_game && alembic upgrade head`
- Start server: `cd sultan_game && uvicorn main:app --reload`
- Run tests: `cd sultan_game && pytest`

## Project Structure
```
sultan_game/
├── alembic/          # Database migrations
├── api/              # API endpoints
│   ├── scenes.py     # 场景管理API
│   ├── npcs.py       # NPC管理API
│   └── __init__.py
├── core/             # Core configurations
│   └── database.py   # 数据库连接配置
├── models/           # SQLAlchemy models
│   ├── npc.py        # NPC模型
│   ├── scene.py      # 场景模型
│   ├── card.py       # 卡片模型
│   ├── player.py     # 玩家模型
│   ├── dialogue.py   # 对话系统模型
│   ├── combat.py     # 战斗记录模型
│   ├── ai_config.py  # AI配置模型
│   ├── scene_config.py # 场景配置模型
│   ├── card_system.py  # 卡片系统模型
│   └── __init__.py
├── static/           # 前端管理界面
│   ├── admin/
│   │   └── index.html # 管理后台主页面
│   ├── css/
│   │   └── admin.css  # 管理界面样式
│   └── js/
│       └── admin.js   # 管理界面逻辑
├── main.py           # FastAPI应用主文件
├── requirements.txt  # Python依赖
├── pyproject.toml    # uv项目配置
└── uv.lock           # uv锁定文件
```

## 新增功能

### 1. 完全重新设计的数据库系统（基于游戏设计文档）

#### NPC双轨制系统
- **game_npc（场景固定NPC）**: 
  - 完整的死亡掉落配置（属性点、卡片、解锁内容）
  - 转化配置（转化为玩家NPC的条件和成本）
  - AI行为配置（性格、说话风格、情绪阈值）
- **player_npc（玩家拥有NPC）**: 
  - 属性点分配和成长系统
  - 获得方式追踪（转化、奖励、特殊事件）
  - 完整的状态管理（血量、等级、经验）

#### 精密的卡片系统
- **稀有度体系**: 普通/稀有/史诗/传说，每级有不同的数值标准
- **卡片分类**: 通行证类/属性增强类/影响判定类/特殊功能类
- **效果系统**: 立即效果/持续效果/永久效果，支持复杂的目标选择
- **使用限制**: 数量限制/时机限制/条件限制
- **套装和联动**: 多卡片组合效果和特殊协同
- **平衡标准**: 基于设计文档的严格数值平衡

#### 完整的场景配置系统
- **进入条件管理**: 属性要求/卡片要求/前置条件/特殊限制
- **AI配置**: 旁白AI/评分AI/话术生成AI的完整配置
- **动态事件**: 基于条件的场景事件触发
- **奖励体系**: 成功奖励/失败惩罚/完美通关奖励
- **数据分析**: 场景平衡性分析和优化建议

#### 属性点分配系统
- **属性点池**: 从game_npc死亡获得，自由分配给player_npc
- **分配历史**: 完整的属性点获得和使用记录
- **成长追踪**: 玩家NPC的成长轨迹

### 2. 管理员配置界面
- **可视化配置**: 网页界面管理所有游戏内容
- **场景配置**: 完整的场景创建和编辑功能
- **NPC管理**: NPC属性、AI行为配置
- **卡片管理**: 卡片效果、使用限制配置
- **AI配置**: 智能体prompt和参数管理
- **数据分析**: 场景使用统计、平衡性分析

### 3. 完整的API系统
- **CRUD操作**: 所有模型的增删改查
- **数据验证**: 配置验证和错误提示
- **批量操作**: 导入导出功能
- **系统监控**: 健康检查和状态监控

## 重要更新说明

**2025年7月13日**: 根据游戏设计文档完全重新设计了数据库系统
- ✅ 修复了之前设计与文档不匹配的问题
- ✅ 实现了真正的NPC双轨制（game_npc vs player_npc）
- ✅ 按照文档标准实现了卡片稀有度和效果系统
- ✅ 完整支持属性点分配和NPC成长机制
- ✅ 实现了复杂的场景配置和AI管理系统