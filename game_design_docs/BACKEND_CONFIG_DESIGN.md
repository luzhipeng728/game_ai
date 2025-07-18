# 后端配置系统设计

## 一、NPC配置维度

### 1.1 基础信息配置
```yaml
NPC基础配置:
  # 身份标识
  npc_id: "npc_001"  # 唯一ID
  name: "将军哲巴尔"  # 显示名称
  npc_type: "game_npc"  # game_npc(场景固定) / player_npc(可获取)
  tier: "gold"  # 稀有度: bronze/silver/gold/legendary
  faction: "military"  # 所属阵营: sultan/minister/military/blackduck
  
  # 外观描述
  avatar: "general_01.png"  # 头像
  description: "苏丹的忠诚将军，掌管王国军队"
  appearance: "身材魁梧，满脸胡须，眼神锐利"
```

### 1.2 属性值配置
```yaml
属性配置:
  # 核心属性（所有NPC必须配置）
  INT: 10      # 智力(1-20) - 影响骰子数量
  STR: 100     # 武力(1-100) - 战斗攻击力
  DEF: 100     # 防御(1-100) - 战斗防御力
  HP: 300      # 生命值(1-500) - 血量
  
  # 社交属性（可选）
  CHA: 50      # 魅力(1-100) - 影响对话效果
  LOY: 70      # 忠诚度(1-100) - 对玩家的初始态度
  FEAR: 30     # 恐惧度(1-100) - 对玩家的畏惧
  
  # 特殊属性（可扩展）
  custom_attributes:
    军事指挥: 90
    政治敏感: 40
```

### 1.3 AI行为配置
```yaml
AI配置:
  # 性格设定
  personality:
    traits: ["忠诚", "直率", "暴躁"]
    description: "重视荣誉，说话直接，容易被激怒"
    
  # 说话风格
  speaking_style:
    tone: "military"  # 军人风格
    vocabulary: "formal"  # 正式用语
    examples:
      - "士兵的天职就是服从！"
      - "在我的军队里，没有懦夫！"
      
  # 情绪阈值
  emotion_thresholds:
    anger_threshold: 60    # 愤怒触发值
    trust_threshold: 80    # 信任触发值
    fear_threshold: 40     # 恐惧触发值
    
  # 对话目标
  dialogue_goals:
    primary: "维护军队利益"
    secondary: "试探玩家立场"
    hidden: "寻找可以利用的弱点"
```

### 1.4 死亡掉落配置（仅游戏NPC）
```yaml
死亡配置:
  # 掉落属性点
  attribute_points: 20  # 玩家可自由分配
  
  # 固定掉落物品
  guaranteed_drops:
    - item_type: "card"
      item_id: "military_token"
      quantity: 1
    - item_type: "info"
      item_id: "military_secret"
      quantity: 1
      
  # 概率掉落
  random_drops:
    - item_type: "card"
      item_id: "elite_troops"
      probability: 0.3
    - item_type: "equipment"
      item_id: "general_sword"
      probability: 0.2
      
  # 特殊奖励
  special_rewards:
    unlock_scenes: ["military_camp_advanced"]
    unlock_npcs: ["lieutenant_01"]
    achievements: ["general_slayer"]
```

### 1.5 可转化配置（特殊NPC）
```yaml
转化配置:
  can_convert: true  # 是否可转化为玩家NPC
  convert_conditions:
    - type: "loyalty"
      value: 90
    - type: "special_event"
      event_id: "general_submission"
  convert_cost:
    cards: ["persuasion_master"]
    attribute_requirements:
      player_CHA: 80
```

## 二、场景配置维度

### 2.1 场景基础信息
```yaml
场景基础配置:
  # 标识信息
  scene_id: "palace_intrigue_01"
  name: "朝堂密谋"
  category: "main_story"  # main_story/side_quest/faction/random
  chapter: 2  # 所属章节
  
  # 场景描述
  description: "在朝堂上与宰相展开智慧较量"
  background_image: "palace_hall.jpg"
  background_music: "tense_politics.mp3"
  
  # 场景设定
  location: "皇宫大殿"
  time_of_day: "morning"  # morning/afternoon/evening/night
  weather: "clear"  # 天气影响氛围
```

### 2.2 进入条件配置
```yaml
进入条件:
  # 属性要求
  attribute_requirements:
    player_reputation: 30  # 玩家声望
    any_npc_INT: 8  # 任一NPC智力>=8
    total_STR: 100  # 所有NPC武力总和
    
  # 卡片要求
  card_requirements:
    required:  # 必需卡片（消耗）
      - card_id: "court_pass"
        consume: true
    optional:  # 可选卡片（不消耗）
      - card_id: "bribe_gold"
        effect: "initial_favor+10"
        
  # 前置条件
  prerequisites:
    completed_scenes: ["intro_scene"]
    game_day_min: 5
    faction_relation:
      minister: 20  # 与大臣阵营关系
      
  # 进入限制
  restrictions:
    max_attempts: 3  # 最多尝试次数
    cooldown_days: 2  # 失败后冷却时间
```

### 2.3 场景角色配置
```yaml
场景角色:
  # 固定NPC配置
  fixed_npcs:
    - npc_id: "minister_chen"
      role: "main_antagonist"  # 主要对手
      initial_position: "center"  # 初始位置
      special_behavior: "aggressive"  # 特殊行为模式
      
    - npc_id: "minister_assistant"
      role: "supporter"
      can_be_challenged: true  # 可被挑战战斗
      
  # 玩家NPC配置
  player_npc_config:
    min_count: 1
    max_count: 3
    recommended_types: ["智谋型", "外交型"]
    special_bonus:
      diplomat_type: "dialogue_bonus+10"
```

### 2.4 智能体Prompt配置
```yaml
AI_prompts:
  # 旁白AI配置
  narrator_prompt: |
    场景：朝堂之上，文武百官齐聚
    氛围：表面平静，暗流涌动
    你的任务：
    1. 描述场景变化和人物细微动作
    2. 在关键时刻营造紧张氛围
    3. 适时补充背景信息
    注意：保持客观中立，不要过度描述
    
  # 评分AI配置
  evaluator_config:
    # 评分权重
    weights:
      story_progress: 0.4
      dialogue_quality: 0.3
      tension_level: 0.3
      
    # 触发阈值
    triggers:
      dice_trigger:
        story_progress: 75
        OR_tension: 85
      
    # 成功条件
    success_criteria:
      dice_required: 5
      special_condition: "minister_trust>60"
      
    # 评分指导
    evaluation_guide: |
      重点关注：
      1. 玩家是否成功获取关键信息
      2. 是否维持了适当的政治平衡
      3. 对话是否推进了主线剧情
```

### 2.5 奖励配置
```yaml
奖励配置:
  # 成功奖励
  success_rewards:
    fixed:
      attribute_points: 15
      experience: 100
      reputation: 10
      
    items:
      - type: "npc_card"
        npc_id: "minister_spy"
        probability: 1.0
      - type: "item_card"
        card_id: "political_leverage"
        probability: 0.5
        
    unlocks:
      scenes: ["minister_private_meeting"]
      features: ["political_influence_system"]
      
  # 失败惩罚
  failure_penalties:
    reputation: -5
    faction_relation:
      minister: -10
    trigger_events: ["minister_suspicion"]
```

### 2.6 特殊机制配置
```yaml
特殊机制:
  # 动态事件
  dynamic_events:
    - trigger: "round_5"
      event: "unexpected_visitor"
      description: "将军突然闯入朝堂"
      
  # 隐藏要素
  hidden_elements:
    secret_objective: "discover_minister_conspiracy"
    bonus_condition: "no_combat"
    easter_eggs: ["mention_blackduck"]
```

## 三、卡片配置维度

### 3.1 卡片基础信息
```yaml
卡片基础配置:
  # 标识信息
  card_id: "bribe_gold"
  name: "贿赂金币"
  rarity: "rare"  # common/rare/epic/legendary
  
  # 分类
  card_type: "influence"  # pass/attribute/influence/special
  sub_type: "social"  # 子分类
  
  # 外观
  icon: "gold_coins.png"
  card_art: "bribe_scene.jpg"
  flavor_text: "金钱能打开许多紧闭的大门"
```

### 3.2 效果配置
```yaml
效果配置:
  # 主要效果
  primary_effects:
    - effect_type: "scene_modifier"
      target: "npc_initial_attitude"
      value: "+10"
      duration: "current_scene"
      
    - effect_type: "reduce_requirement"
      target: "entry_reputation"
      value: "-10"
      
  # 条件效果
  conditional_effects:
    - condition: "target_is_greedy"
      effect: "double_effectiveness"
    - condition: "target_is_honest"
      effect: "negative_reaction"
      
  # 副作用
  side_effects:
    - type: "reputation"
      value: -5
      trigger: "on_use"
```

### 3.3 使用限制
```yaml
使用配置:
  # 使用时机
  use_timing: "scene_entry"  # scene_entry/dialogue/anytime
  
  # 消耗性
  consumable: true
  stack_limit: 5  # 最多持有数量
  
  # 使用条件
  use_requirements:
    min_reputation: 20
    cannot_use_on: ["sultan", "honest_npcs"]
    
  # 冷却
  cooldown: 0  # 使用后冷却回合数
```

### 3.4 获取方式配置
```yaml
获取配置:
  # 商店
  shop:
    available: true
    price: 500
    unlock_requirement: "chapter_2"
    
  # 掉落
  drop_sources:
    - source: "merchant_npc"
      probability: 0.3
    - source: "corruption_scene"
      probability: 0.5
      
  # 合成
  crafting:
    recipe:
      - "gold_coin" x 3
      - "influence_token" x 1
    success_rate: 0.8
    
  # 任务奖励
  quest_rewards:
    - quest_id: "merchant_favor"
      guaranteed: true
```

### 3.5 特殊交互
```yaml
特殊交互:
  # 套装效果
  set_bonus:
    set_name: "corruption_set"
    required_cards: ["bribe_gold", "blackmail_letter", "false_evidence"]
    bonus_effect: "all_influence_cards_effectiveness+50%"
    
  # 卡片联动
  synergies:
    - with_card: "merchant_connection"
      effect: "bribe_cost_reduced_50%"
    - with_npc: "greedy_types"
      effect: "auto_success"
      
  # 故事影响
  story_impact:
    flags_set: ["player_uses_bribes"]
    reputation_type: "cunning"
    unlock_dialogue: ["bribe_master_options"]
```

## 四、配置验证规则

### 4.1 NPC配置验证
```python
NPC_VALIDATION = {
    "required_fields": ["npc_id", "name", "npc_type", "INT", "STR", "DEF", "HP"],
    "attribute_ranges": {
        "INT": (1, 20),
        "STR": (1, 100),
        "DEF": (1, 100),
        "HP": (1, 500),
        "CHA": (1, 100)
    },
    "npc_type_values": ["game_npc", "player_npc"],
    "tier_values": ["bronze", "silver", "gold", "legendary"]
}
```

### 4.2 场景配置验证
```python
SCENE_VALIDATION = {
    "required_fields": ["scene_id", "name", "fixed_npcs", "narrator_prompt"],
    "min_fixed_npcs": 1,
    "max_player_npcs": 5,
    "category_values": ["main_story", "side_quest", "faction", "random"]
}
```

### 4.3 卡片配置验证
```python
CARD_VALIDATION = {
    "required_fields": ["card_id", "name", "rarity", "card_type", "effects"],
    "rarity_values": ["common", "rare", "epic", "legendary"],
    "card_type_values": ["pass", "attribute", "influence", "special"],
    "max_stack_limit": 99
}
```

这个配置系统设计提供了完整的后端配置维度，确保游戏内容的灵活性和可扩展性。