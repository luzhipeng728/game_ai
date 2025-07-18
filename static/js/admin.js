// 管理界面JavaScript
class AdminPanel {
    constructor() {
        this.apiBase = '/api';
        this.currentSection = 'dashboard';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadDashboard();
    }

    bindEvents() {
        // 侧边栏导航
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.switchSection(e.target.dataset.section);
            });
        });

        // 搜索框事件
        this.bindSearchEvents();
        
        // 筛选器事件
        this.bindFilterEvents();
    }

    switchSection(section) {
        // 隐藏所有内容区域
        document.querySelectorAll('.content-section').forEach(el => {
            el.style.display = 'none';
        });

        // 显示目标区域
        const targetSection = document.getElementById(section);
        if (targetSection) {
            targetSection.style.display = 'block';
            this.currentSection = section;
        }

        // 更新导航状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // 加载对应数据
        this.loadSectionData(section);
    }

    async loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                await this.loadDashboard();
                break;
            case 'scenes':
                await this.loadScenes();
                break;
            case 'npcs':
                await this.loadNPCs();
                break;
            case 'cards':
                await this.loadCards();
                break;
            case 'ai-configs':
                await this.loadAIConfigs();
                break;
            case 'templates':
                await this.loadTemplates();
                break;
            case 'analytics':
                await this.loadAnalytics();
                break;
        }
    }

    async loadDashboard() {
        try {
            // 加载统计数据
            const stats = await this.apiRequest('/dashboard/stats');
            
            document.getElementById('total-scenes').textContent = stats.scenes || 0;
            document.getElementById('total-npcs').textContent = stats.npcs || 0;
            document.getElementById('total-cards').textContent = stats.cards || 0;
            document.getElementById('total-ai-configs').textContent = stats.ai_configs || 0;

            // 加载最近活动
            const activities = await this.apiRequest('/dashboard/activities');
            this.renderActivities(activities);

        } catch (error) {
            console.error('Failed to load dashboard:', error);
            this.showError('加载仪表板数据失败');
        }
    }

    async loadScenes() {
        try {
            const scenes = await this.apiRequest('/scenes');
            this.renderScenesTable(scenes);
        } catch (error) {
            console.error('Failed to load scenes:', error);
            this.showError('加载场景数据失败');
        }
    }

    async loadNPCs() {
        try {
            const npcs = await this.apiRequest('/npcs');
            this.renderNPCsTable(npcs);
        } catch (error) {
            console.error('Failed to load NPCs:', error);
            this.showError('加载NPC数据失败');
        }
    }

    async loadCards() {
        try {
            const cards = await this.apiRequest('/cards');
            this.renderCardsTable(cards);
        } catch (error) {
            console.error('Failed to load cards:', error);
            this.showError('加载卡片数据失败');
        }
    }

    async loadAIConfigs() {
        try {
            const configs = await this.apiRequest('/ai-configs');
            this.renderAIConfigsTable(configs);
        } catch (error) {
            console.error('Failed to load AI configs:', error);
            this.showError('加载AI配置失败');
        }
    }

    renderActivities(activities) {
        const container = document.getElementById('recent-activities');
        if (!activities || activities.length === 0) {
            container.innerHTML = '<p class="text-muted">暂无活动记录</p>';
            return;
        }

        container.innerHTML = activities.map(activity => `
            <div class="mb-2">
                <small class="text-muted">${this.formatDate(activity.timestamp)}</small>
                <div>${activity.description}</div>
            </div>
        `).join('');
    }

    renderScenesTable(scenes) {
        const tbody = document.getElementById('scenes-table-body');
        
        if (!scenes || scenes.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">暂无场景数据</td></tr>';
            return;
        }

        tbody.innerHTML = scenes.map(scene => `
            <tr>
                <td><code>${scene.scene_id}</code></td>
                <td>${scene.name}</td>
                <td><span class="badge bg-primary">${this.formatCategory(scene.category)}</span></td>
                <td><span class="badge ${this.getStatusClass(scene.status)}">${this.formatStatus(scene.status)}</span></td>
                <td>${scene.chapter || '-'}</td>
                <td>${scene.npc_count || 0}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editScene('${scene.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="testScene('${scene.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteScene('${scene.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderNPCsTable(npcs) {
        const tbody = document.getElementById('npcs-table-body');
        
        if (!npcs || npcs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">暂无NPC数据</td></tr>';
            return;
        }

        tbody.innerHTML = npcs.map(npc => `
            <tr>
                <td><code>${npc.npc_id}</code></td>
                <td>${npc.name}</td>
                <td><span class="badge ${npc.npc_type === 'game_npc' ? 'bg-warning' : 'bg-info'}">${this.formatNPCType(npc.npc_type)}</span></td>
                <td><span class="badge ${this.getTierClass(npc.tier)}">${this.formatTier(npc.tier)}</span></td>
                <td><span class="badge bg-secondary">${this.formatFaction(npc.faction)}</span></td>
                <td>${npc.intelligence}/${npc.strength}/${npc.defense}</td>
                <td><span class="status-indicator ${npc.is_active ? 'status-active' : 'status-archived'}"></span>${npc.is_active ? '激活' : '禁用'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editNPC('${npc.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteNPC('${npc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderCardsTable(cards) {
        const tbody = document.getElementById('cards-table-body');
        
        if (!cards || cards.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">暂无卡片数据</td></tr>';
            return;
        }

        tbody.innerHTML = cards.map(card => `
            <tr>
                <td><code>${card.card_id}</code></td>
                <td>${card.name}</td>
                <td><span class="badge ${this.getRarityClass(card.rarity)}">${this.formatRarity(card.rarity)}</span></td>
                <td><span class="badge bg-info">${this.formatCardType(card.card_type)}</span></td>
                <td>${card.consumable ? '是' : '否'}</td>
                <td>${card.usage_count || 0}</td>
                <td><span class="status-indicator ${card.is_active ? 'status-active' : 'status-archived'}"></span>${card.is_active ? '激活' : '禁用'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editCard('${card.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteCard('${card.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    renderAIConfigsTable(configs) {
        const tbody = document.getElementById('ai-configs-table-body');
        
        if (!configs || configs.length === 0) {
            tbody.innerHTML = '<tr><td colspan="7" class="text-center text-muted">暂无AI配置</td></tr>';
            return;
        }

        tbody.innerHTML = configs.map(config => `
            <tr>
                <td><code>${config.config_id}</code></td>
                <td>${config.name}</td>
                <td><span class="badge bg-primary">${this.formatAIType(config.ai_type)}</span></td>
                <td>${config.version}</td>
                <td><span class="status-indicator ${config.is_active ? 'status-active' : 'status-archived'}"></span>${config.is_active ? '激活' : '禁用'}</td>
                <td>${config.created_by || '-'}</td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editAIConfig('${config.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success" onclick="testAIConfig('${config.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteAIConfig('${config.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    // 搜索和筛选功能
    bindSearchEvents() {
        const searchInputs = ['scene-search', 'npc-search', 'card-search', 'ai-search'];
        searchInputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.filterTable(inputId);
                });
            }
        });
    }

    bindFilterEvents() {
        const filters = [
            'scene-category-filter', 'scene-status-filter',
            'npc-type-filter', 'npc-tier-filter', 'npc-faction-filter',
            'card-rarity-filter', 'card-type-filter',
            'ai-type-filter'
        ];
        
        filters.forEach(filterId => {
            const filter = document.getElementById(filterId);
            if (filter) {
                filter.addEventListener('change', () => {
                    this.filterTable(filterId);
                });
            }
        });
    }

    filterTable(filterId) {
        // 根据不同的筛选器实现表格筛选逻辑
        console.log('Filtering table with:', filterId);
        // TODO: 实现具体的筛选逻辑
    }

    // API请求方法
    async apiRequest(endpoint, options = {}) {
        try {
            const response = await fetch(this.apiBase + endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            // 返回模拟数据用于演示
            return this.getMockData(endpoint);
        }
    }

    // 模拟数据 (用于演示)
    getMockData(endpoint) {
        switch(endpoint) {
            case '/dashboard/stats':
                return { scenes: 12, npcs: 45, cards: 78, ai_configs: 8 };
            case '/dashboard/activities':
                return [
                    { timestamp: Date.now() - 3600000, description: '创建了新场景"宰相的试探"' },
                    { timestamp: Date.now() - 7200000, description: '更新了NPC"将军哲巴尔"的配置' },
                    { timestamp: Date.now() - 10800000, description: '新增了卡片"贿赂金币"' }
                ];
            case '/scenes':
                return [
                    { id: '1', scene_id: 'minister_test', name: '宰相的试探', category: 'main_story', status: 'active', chapter: 2, npc_count: 3 },
                    { id: '2', scene_id: 'palace_intrigue', name: '朝堂密谋', category: 'main_story', status: 'draft', chapter: 3, npc_count: 5 }
                ];
            case '/npcs':
                return [
                    { id: '1', npc_id: 'minister_chen', name: '宰相陈', npc_type: 'game_npc', tier: 'gold', faction: 'minister', intelligence: 15, strength: 40, defense: 60, is_active: true },
                    { id: '2', npc_id: 'general_zhang', name: '将军张', npc_type: 'game_npc', tier: 'gold', faction: 'military', intelligence: 10, strength: 100, defense: 100, is_active: true }
                ];
            case '/cards':
                return [
                    { id: '1', card_id: 'court_pass', name: '朝廷通行证', rarity: 'common', card_type: 'pass', consumable: false, usage_count: 15, is_active: true },
                    { id: '2', card_id: 'bribe_gold', name: '贿赂金币', rarity: 'rare', card_type: 'influence', consumable: true, usage_count: 8, is_active: true }
                ];
            case '/ai-configs':
                return [
                    { id: '1', config_id: 'narrator_political', name: '政治场景旁白', ai_type: 'narrator', version: '1.0', is_active: true, created_by: 'admin' },
                    { id: '2', config_id: 'minister_ai', name: '宰相AI', ai_type: 'npc', version: '1.2', is_active: true, created_by: 'admin' }
                ];
            default:
                return [];
        }
    }

    // 格式化方法
    formatDate(timestamp) {
        return new Date(timestamp).toLocaleString('zh-CN');
    }

    formatCategory(category) {
        const map = {
            'main_story': '主线剧情',
            'side_quest': '支线任务',
            'faction': '阵营场景',
            'random': '随机事件'
        };
        return map[category] || category;
    }

    formatStatus(status) {
        const map = {
            'active': '激活',
            'draft': '草稿',
            'testing': '测试中',
            'archived': '已归档'
        };
        return map[status] || status;
    }

    getStatusClass(status) {
        const map = {
            'active': 'bg-success',
            'draft': 'bg-warning',
            'testing': 'bg-info',
            'archived': 'bg-secondary'
        };
        return map[status] || 'bg-secondary';
    }

    formatNPCType(type) {
        return type === 'game_npc' ? '游戏NPC' : '玩家NPC';
    }

    formatTier(tier) {
        const map = {
            'bronze': '青铜',
            'silver': '白银',
            'gold': '黄金',
            'legendary': '传说'
        };
        return map[tier] || tier;
    }

    getTierClass(tier) {
        const map = {
            'bronze': 'bg-secondary',
            'silver': 'bg-light text-dark',
            'gold': 'bg-warning text-dark',
            'legendary': 'bg-danger'
        };
        return map[tier] || 'bg-secondary';
    }

    formatFaction(faction) {
        const map = {
            'sultan': '苏丹王',
            'minister': '大臣',
            'military': '将军',
            'blackduck': '黑鸭会'
        };
        return map[faction] || faction;
    }

    formatRarity(rarity) {
        const map = {
            'common': '普通',
            'rare': '稀有',
            'epic': '史诗',
            'legendary': '传说'
        };
        return map[rarity] || rarity;
    }

    getRarityClass(rarity) {
        const map = {
            'common': 'bg-secondary',
            'rare': 'bg-primary',
            'epic': 'bg-warning text-dark',
            'legendary': 'bg-danger'
        };
        return map[rarity] || 'bg-secondary';
    }

    formatCardType(type) {
        const map = {
            'pass': '通行证',
            'attribute': '属性',
            'influence': '影响',
            'special': '特殊'
        };
        return map[type] || type;
    }

    formatAIType(type) {
        const map = {
            'narrator': '旁白AI',
            'npc': 'NPC AI',
            'evaluator': '评分AI',
            'option_generator': '话术生成AI'
        };
        return map[type] || type;
    }

    showError(message) {
        // TODO: 实现错误提示
        console.error(message);
    }

    showSuccess(message) {
        // TODO: 实现成功提示
        console.log(message);
    }
}

// 全局函数
function openSceneModal() {
    const modal = new bootstrap.Modal(document.getElementById('sceneModal'));
    modal.show();
}

function openNpcModal() {
    // TODO: 实现NPC模态框
    console.log('Open NPC modal');
}

function openCardModal() {
    // TODO: 实现卡片模态框
    console.log('Open card modal');
}

function openAiConfigModal() {
    // TODO: 实现AI配置模态框
    console.log('Open AI config modal');
}

function editScene(id) {
    console.log('Edit scene:', id);
}

function testScene(id) {
    console.log('Test scene:', id);
}

function deleteScene(id) {
    if (confirm('确定要删除这个场景吗？')) {
        console.log('Delete scene:', id);
    }
}

function editNPC(id) {
    console.log('Edit NPC:', id);
}

function deleteNPC(id) {
    if (confirm('确定要删除这个NPC吗？')) {
        console.log('Delete NPC:', id);
    }
}

function editCard(id) {
    console.log('Edit card:', id);
}

function deleteCard(id) {
    if (confirm('确定要删除这个卡片吗？')) {
        console.log('Delete card:', id);
    }
}

function editAIConfig(id) {
    console.log('Edit AI config:', id);
}

function testAIConfig(id) {
    console.log('Test AI config:', id);
}

function deleteAIConfig(id) {
    if (confirm('确定要删除这个AI配置吗？')) {
        console.log('Delete AI config:', id);
    }
}

function saveScene() {
    // TODO: 实现保存场景逻辑
    console.log('Save scene');
}

// 初始化管理面板
document.addEventListener('DOMContentLoaded', function() {
    window.adminPanel = new AdminPanel();
});