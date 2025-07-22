"""
测试数据生成脚本
用于添加NPC、卡片、AI配置等测试数据
"""

import requests
import json
import time

# API基础URL
BASE_URL = "http://localhost:8001/api"

def create_test_npcs():
    """创建测试NPC"""
    npcs = [
        {
            "npc_id": "prime_minister_01",
            "name": "宰相·哈桑",
            "npc_type": "game_npc",
            "tier": "legendary",
            "faction": "minister",
            "intelligence": 18,
            "strength": 30,
            "defense": 40,
            "charisma": 85,
            "loyalty": 60,
            "influence": 80,
            "command": 70,
            "stealth": 20,
            "hp_max": 150,
            "description": "苏丹王朝的首席宰相，智慧超群，擅长政治谋略"
        },
        {
            "npc_id": "general_01",
            "name": "将军·卡里姆",
            "npc_type": "game_npc",
            "tier": "legendary",
            "faction": "military",
            "intelligence": 12,
            "strength": 95,
            "defense": 90,
            "charisma": 60,
            "loyalty": 70,
            "influence": 70,
            "command": 95,
            "stealth": 15,
            "hp_max": 300,
            "description": "苏丹的忠诚战将，武艺高强，统兵有方"
        },
        {
            "npc_id": "black_duck_leader_01", 
            "name": "黑鸭会首领·阿米尔",
            "npc_type": "game_npc",
            "tier": "legendary",
            "faction": "blackduck",
            "intelligence": 16,
            "strength": 80,
            "defense": 65,
            "charisma": 45,
            "loyalty": 30,
            "influence": 60,
            "command": 80,
            "stealth": 90,
            "hp_max": 180,
            "description": "控制黑市和监狱的神秘组织首领"
        },
        {
            "npc_id": "merchant_guild_leader_01",
            "name": "商人公会会长·法蒂玛",
            "npc_type": "game_npc",
            "tier": "gold",
            "faction": "commoner",
            "intelligence": 14,
            "strength": 25,
            "defense": 35,
            "charisma": 80,
            "loyalty": 50,
            "influence": 65,
            "command": 40,
            "stealth": 30,
            "hp_max": 120,
            "description": "精明的女商人，控制着王国的商业贸易"
        },
        {
            "npc_id": "court_scholar_01",
            "name": "宫廷学者·优素福",
            "npc_type": "game_npc",
            "tier": "gold",
            "faction": "scholar",
            "intelligence": 20,
            "strength": 15,
            "defense": 25,
            "charisma": 70,
            "loyalty": 75,
            "influence": 60,
            "command": 20,
            "stealth": 40,
            "hp_max": 100,
            "description": "博学的宫廷学者，熟知古今历史和法理"
        }
    ]
    
    print("开始创建测试NPC...")
    for npc in npcs:
        try:
            response = requests.post(f"{BASE_URL}/npcs/", json=npc)
            if response.status_code == 200:
                print(f"✅ 创建NPC成功: {npc['name']}")
            else:
                print(f"❌ 创建NPC失败: {npc['name']} - {response.text}")
        except Exception as e:
            print(f"❌ 网络错误: {npc['name']} - {e}")
    
    print("NPC创建完成\n")

def create_test_cards():
    """创建测试卡片"""
    cards = [
        {
            "card_id": "bribe_gold_01",
            "name": "贿赂金币",
            "rarity": "common",
            "category": "influence",
            "sub_category": "social",
            "description": "用金钱收买人心，提升魅力判定",
            "effects": {
                "charisma_boost": 10,
                "duration": "temporary"
            },
            "usage_cost": 50,
            "max_uses_per_scene": 2,
            "usage_restrictions": {
                "scene_types": ["political", "social"],
                "target_types": ["npc"]
            }
        },
        {
            "card_id": "royal_decree_01",
            "name": "皇家诏书",
            "rarity": "legendary",
            "category": "special",
            "sub_category": "authority",
            "description": "以苏丹的名义发布命令，获得绝对权威",
            "effects": {
                "influence_boost": 50,
                "loyalty_impact": 20,
                "duration": "permanent"
            },
            "usage_cost": 0,
            "max_uses_per_scene": 1,
            "usage_restrictions": {
                "scene_types": ["political", "faction"],
                "required_attributes": {"influence": 70}
            }
        },
        {
            "card_id": "spy_network_01",
            "name": "间谍网络",
            "rarity": "epic",
            "category": "special",
            "sub_category": "intelligence",
            "description": "动用间谍网络获取关键信息",
            "effects": {
                "stealth_boost": 25,
                "intelligence_boost": 15,
                "duration": "scene"
            },
            "usage_cost": 100,
            "max_uses_per_scene": 1,
            "usage_restrictions": {
                "scene_types": ["intrigue", "investigation"],
                "required_attributes": {"stealth": 40}
            }
        },
        {
            "card_id": "diplomatic_gift_01",
            "name": "外交礼品",
            "rarity": "rare",
            "category": "influence",
            "sub_category": "diplomacy",
            "description": "精美的礼品赢得好感，改善关系",
            "effects": {
                "loyalty_boost": 15,
                "charisma_boost": 10,
                "duration": "permanent"
            },
            "usage_cost": 75,
            "max_uses_per_scene": 3,
            "usage_restrictions": {
                "scene_types": ["diplomatic", "social"],
                "target_types": ["npc", "faction"]
            }
        },
        {
            "card_id": "military_threat_01",
            "name": "武力威胁",
            "rarity": "rare",
            "category": "influence",
            "sub_category": "intimidation",
            "description": "以武力威慑对手，强制其服从",
            "effects": {
                "fear_boost": 30,
                "loyalty_penalty": -10,
                "duration": "temporary"
            },
            "usage_cost": 0,
            "max_uses_per_scene": 2,
            "usage_restrictions": {
                "scene_types": ["conflict", "negotiation"],
                "required_attributes": {"strength": 60}
            }
        }
    ]
    
    print("开始创建测试卡片...")
    for card in cards:
        try:
            response = requests.post(f"{BASE_URL}/cards/", json=card)
            if response.status_code == 200:
                print(f"✅ 创建卡片成功: {card['name']}")
            else:
                print(f"❌ 创建卡片失败: {card['name']} - {response.text}")
        except Exception as e:
            print(f"❌ 网络错误: {card['name']} - {e}")
    
    print("卡片创建完成\n")

def create_test_ai_configs():
    """创建测试AI配置"""
    ai_configs = [
        {
            "config_id": "political_narrator_01",
            "name": "政治场景旁白AI",
            "ai_type": "narrator",
            "base_prompt": """你是苏丹王朝的宫廷记录官，负责记录政治场景中的对话和事件。

场景背景：{scene_background}
参与角色：{characters}
当前情况：{current_situation}

请以第三人称视角描述场景，风格要求：
1. 充满中东古典宫廷氛围
2. 语言优雅但不失紧张感
3. 突出权力斗争的复杂性
4. 适当描述环境和角色神态

输出格式：直接输出场景描述，无需其他格式化""",
            "model_config": {
                "temperature": 0.8,
                "max_tokens": 800,
                "top_p": 0.9
            }
        },
        {
            "config_id": "combat_evaluator_01",
            "name": "战斗评估AI",
            "ai_type": "evaluator",
            "base_prompt": """你是苏丹王朝的军事顾问，负责评估战斗中的战术和效果。

战斗情况：{combat_situation}
角色属性：{character_stats}
使用卡片：{used_cards}
行动描述：{action_description}

评估标准：
1. 战术合理性 (30%)
2. 属性适配度 (25%)
3. 卡片使用效果 (25%)
4. 创意和风险评估 (20%)

输出JSON格式：
{
  "success_probability": 0.75,
  "attribute_bonus": 10,
  "explanation": "评估理由",
  "consequences": ["后果1", "后果2"]
}""",
            "model_config": {
                "temperature": 0.3,
                "max_tokens": 500,
                "top_p": 0.8
            }
        },
        {
            "config_id": "dialogue_generator_01",
            "name": "对话生成AI",
            "ai_type": "npc",
            "base_prompt": """你需要为以下NPC生成对话：

NPC信息：{npc_info}
场景情况：{scene_context}
对话主题：{dialogue_topic}
情绪状态：{emotional_state}

要求：
1. 符合角色性格和身份
2. 反映当前场景气氛
3. 推动剧情发展
4. 语言要有中东古典风格

直接输出对话内容，无需引号或格式化。""",
            "model_config": {
                "temperature": 0.9,
                "max_tokens": 300,
                "top_p": 0.95
            }
        }
    ]
    
    print("开始创建测试AI配置...")
    for config in ai_configs:
        try:
            response = requests.post(f"{BASE_URL}/ai-configs/", json=config)
            if response.status_code == 200:
                print(f"✅ 创建AI配置成功: {config['name']}")
            else:
                print(f"❌ 创建AI配置失败: {config['name']} - {response.text}")
        except Exception as e:
            print(f"❌ 网络错误: {config['name']} - {e}")
    
    print("AI配置创建完成\n")

def test_scene_creation():
    """测试场景创建"""
    test_scene = {
        "scene_id": "test_political_meeting_01",
        "name": "宰相的试探",
        "category": "faction",
        "chapter": 1,
        "description": "宰相哈桑在私人书房中与苏丹进行秘密会谈，试探苏丹对近期政治风波的态度",
        "location": "宰相府书房",
        "time_of_day": "evening",
        "weather": "calm",
        "card_count": 3,
        "prerequisite_scenes": [],
        "days_required": 1,
        "narrator_prompt": "政治阴谋场景，突出权力斗争"
    }
    
    print("开始测试场景创建...")
    try:
        response = requests.post(f"{BASE_URL}/scenes/", json=test_scene)
        if response.status_code == 200:
            print(f"✅ 创建测试场景成功: {test_scene['name']}")
            return response.json()
        else:
            print(f"❌ 创建测试场景失败: {response.text}")
            return None
    except Exception as e:
        print(f"❌ 网络错误: {e}")
        return None

def get_logs():
    """获取最新日志"""
    try:
        response = requests.get(f"{BASE_URL}/logs?log_type=error&lines=50")
        if response.status_code == 200:
            logs = response.json().get("logs", [])
            print(f"\n📋 最新错误日志 (最近50条):")
            for log in logs[-10:]:  # 只显示最后10条
                print(f"  {log}")
        else:
            print(f"❌ 获取日志失败: {response.text}")
    except Exception as e:
        print(f"❌ 获取日志错误: {e}")

def main():
    """主函数"""
    print("🎮 苏丹的游戏 - 测试数据生成\n")
    
    # 等待服务启动
    print("等待服务启动...")
    time.sleep(2)
    
    # 创建测试数据
    create_test_npcs()
    create_test_cards() 
    create_test_ai_configs()
    
    # 测试场景创建
    scene_result = test_scene_creation()
    
    # 获取日志
    get_logs()
    
    print("\n🎉 测试数据创建完成！")
    print("请查看前端管理界面验证数据是否正确创建")
    print("如有错误，请查看日志文件：logs/sultan_game_*.log")

if __name__ == "__main__":
    main()