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

    async loadTemplates() {
        try {
            // 模板页面已经有静态内容，不需要额外加载
            console.log('Templates page loaded');
        } catch (error) {
            console.error('Failed to load templates:', error);
            this.showError('加载配置模板失败');
        }
    }

    async loadAnalytics() {
        try {
            // 数据分析页面已经有静态内容，不需要额外加载
            console.log('Analytics page loaded');
        } catch (error) {
            console.error('Failed to load analytics:', error);
            this.showError('加载数据分析失败');
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
                <td><span class="badge bg-info">${this.formatCardType(card.category)}</span></td>
                <td>${card.is_consumable ? '是' : '否'}</td>
                <td>${card.base_cost || 0}</td>
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
                // 如果是404或500错误，使用模拟数据
                if (response.status === 404 || response.status >= 500) {
                    console.warn(`API ${endpoint} not available, using mock data`);
                    return this.getMockData(endpoint);
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            // 只有在网络错误时才返回模拟数据
            if (error.name === 'TypeError' || error.message.includes('Failed to fetch')) {
                console.warn(`Network error for ${endpoint}, using mock data`);
                return this.getMockData(endpoint);
            }
            throw error;
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
                    { id: '1', card_id: 'court_pass', name: '朝廷通行证', rarity: 'common', category: 'pass', is_consumable: false, base_cost: 5, is_active: true },
                    { id: '2', card_id: 'bribe_gold', name: '贿赂金币', rarity: 'rare', category: 'influence', is_consumable: true, base_cost: 15, is_active: true }
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

    formatCardType(category) {
        const map = {
            'pass': '通行证',
            'attribute': '属性增强',
            'influence': '影响判定',
            'special': '特殊功能'
        };
        return map[category] || category;
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
        // 创建错误提示
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 5秒后自动消失
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 5000);
        
        console.error(message);
    }

    showSuccess(message) {
        // 创建成功提示
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alertDiv.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        alertDiv.innerHTML = `
            <i class="fas fa-check-circle"></i> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        // 3秒后自动消失
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 3000);
        
        console.log(message);
    }
}

// 全局函数
function openSceneModal() {
    // 重置表单为创建模式
    resetSceneModal();
    
    // 显示模态框
    const modal = new bootstrap.Modal(document.getElementById('sceneModal'));
    modal.show();
}

function resetSceneModal() {
    const basicForm = document.getElementById('scene-basic-form');
    const aiForm = document.getElementById('scene-ai-form');
    const modalTitle = document.querySelector('#sceneModal .modal-title');
    const saveButton = document.querySelector('#sceneModal .btn-primary');
    
    // 清空表单
    basicForm.reset();
    aiForm.reset();
    
    // 移除编辑状态
    basicForm.dataset.editingId = '';
    
    // 恢复场景ID字段为可编辑
    basicForm.elements['scene_id'].readOnly = false;
    
    // 恢复标题和按钮
    modalTitle.textContent = '场景配置';
    saveButton.textContent = '保存场景';
    saveButton.onclick = saveScene;
}

function openNpcModal() {
    try {
        console.log('Opening NPC modal...');
        
        // 检查表单是否存在
        const form = document.getElementById('npc-form');
        if (!form) {
            console.error('NPC form not found!');
            window.adminPanel.showError('NPC表单未找到');
            return;
        }
        
        // 重置表单为创建模式
        resetNPCModal();
        
        // 检查模态框是否存在
        const modalElement = document.getElementById('npcModal');
        if (!modalElement) {
            console.error('NPC modal not found!');
            window.adminPanel.showError('NPC模态框未找到');
            return;
        }
        
        // 显示模态框
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        console.log('NPC modal opened successfully');
    } catch (error) {
        console.error('Error opening NPC modal:', error);
        window.adminPanel.showError('打开NPC模态框时发生错误: ' + error.message);
    }
}

function resetNPCModal() {
    const form = document.getElementById('npc-form');
    const modalTitle = document.querySelector('#npcModal .modal-title');
    const saveButton = document.querySelector('#npcModal .btn-primary');
    
    // 清空表单
    form.reset();
    
    // 移除编辑状态
    form.dataset.editingId = '';
    
    // 恢复NPC ID字段为可编辑
    form.elements['npc_id'].readOnly = false;
    
    // 恢复标题和按钮
    modalTitle.textContent = 'NPC配置';
    saveButton.textContent = '保存NPC';
    saveButton.onclick = saveNPC;
}

function openCardModal() {
    try {
        console.log('Opening Card modal...');
        
        // 检查表单是否存在
        const form = document.getElementById('card-form');
        if (!form) {
            console.error('Card form not found!');
            window.adminPanel.showError('卡片表单未找到');
            return;
        }
        
        // 重置表单为创建模式
        resetCardModal();
        
        // 检查模态框是否存在
        const modalElement = document.getElementById('cardModal');
        if (!modalElement) {
            console.error('Card modal not found!');
            window.adminPanel.showError('卡片模态框未找到');
            return;
        }
        
        // 显示模态框
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
        console.log('Card modal opened successfully');
    } catch (error) {
        console.error('Error opening Card modal:', error);
        window.adminPanel.showError('打开卡片模态框时发生错误: ' + error.message);
    }
}

function resetCardModal() {
    const form = document.getElementById('card-form');
    const modalTitle = document.querySelector('#cardModal .modal-title');
    const saveButton = document.querySelector('#cardModal .btn-primary');
    
    // 清空表单
    form.reset();
    
    // 移除编辑状态
    form.dataset.editingId = '';
    
    // 恢复卡片ID字段为可编辑
    form.elements['card_id'].readOnly = false;
    
    // 恢复标题和按钮
    modalTitle.textContent = '卡片配置';
    saveButton.textContent = '保存卡片';
    saveButton.onclick = saveCard;
}

function openAiConfigModal() {
    // TODO: 实现AI配置模态框
    window.adminPanel.showError('AI配置功能正在开发中，敬请期待！');
}

function openTemplateModal() {
    // TODO: 实现模板模态框
    window.adminPanel.showError('模板功能正在开发中，敬请期待！');
}

async function editScene(id) {
    try {
        console.log('Edit Scene:', id);
        
        // 获取场景数据
        const response = await fetch(`/api/scenes/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch scene data');
        }
        
        const scene = await response.json();
        
        // 填充基础表单
        const basicForm = document.getElementById('scene-basic-form');
        const aiForm = document.getElementById('scene-ai-form');
        
        if (!basicForm || !aiForm) {
            window.adminPanel.showError('场景表单未找到');
            return;
        }
        
        // 设置标题为编辑模式
        document.querySelector('#sceneModal .modal-title').textContent = '编辑场景';
        
        // 填充基础表单字段
        basicForm.elements['scene_id'].value = scene.scene_id;
        basicForm.elements['scene_id'].readOnly = true; // 场景ID不允许修改
        basicForm.elements['name'].value = scene.name;
        basicForm.elements['category'].value = scene.category;
        basicForm.elements['chapter'].value = scene.chapter || 1;
        basicForm.elements['description'].value = scene.description || '';
        basicForm.elements['location'].value = scene.location || '';
        basicForm.elements['time_of_day'].value = scene.time_of_day || '';
        basicForm.elements['weather'].value = scene.weather || '';
        
        // 获取AI配置
        try {
            const configResponse = await fetch(`/api/scenes/${id}/config`);
            if (configResponse.ok) {
                const config = await configResponse.json();
                aiForm.elements['narrator_prompt'].value = config.narrator_config || '';
            }
        } catch (error) {
            console.warn('Failed to load AI config:', error);
        }
        
        // 保存场景ID到表单的data属性
        basicForm.dataset.editingId = id;
        
        // 更新保存按钮
        const saveButton = document.querySelector('#sceneModal .btn-primary');
        saveButton.textContent = '更新场景';
        saveButton.onclick = () => updateScene(id);
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('sceneModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error editing scene:', error);
        window.adminPanel.showError('加载场景数据失败: ' + error.message);
    }
}

async function updateScene(id) {
    const basicForm = document.getElementById('scene-basic-form');
    const aiForm = document.getElementById('scene-ai-form');
    
    // 验证表单
    if (!basicForm.checkValidity() || !aiForm.checkValidity()) {
        basicForm.reportValidity();
        aiForm.reportValidity();
        return;
    }
    
    // 收集表单数据
    const basicData = new FormData(basicForm);
    const aiData = new FormData(aiForm);
    
    const sceneData = {
        name: basicData.get('name'),
        description: basicData.get('description'),
        narrator_prompt: aiData.get('narrator_prompt')
    };
    
    try {
        const response = await fetch(`/api/scenes/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sceneData)
        });
        
        if (response.ok) {
            const result = await response.json();
            window.adminPanel.showSuccess('场景更新成功！');
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('sceneModal'));
            modal.hide();
            
            // 刷新场景列表
            if (window.adminPanel.currentSection === 'scenes') {
                await window.adminPanel.loadScenes();
            }
        } else {
            const error = await response.json();
            window.adminPanel.showError('更新失败: ' + (error.detail || '未知错误'));
        }
    } catch (error) {
        console.error('Update scene error:', error);
        window.adminPanel.showError('网络错误，请稍后重试');
    }
}

function testScene(id) {
    console.log('Test scene:', id);
}

async function deleteScene(id) {
    if (confirm('确定要删除这个场景吗？此操作不可恢复。')) {
        try {
            const response = await fetch(`/api/scenes/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                window.adminPanel.showSuccess('场景删除成功！');
                // 刷新场景列表
                if (window.adminPanel.currentSection === 'scenes') {
                    await window.adminPanel.loadScenes();
                }
            } else {
                const error = await response.json();
                window.adminPanel.showError('删除失败: ' + (error.detail || '未知错误'));
            }
        } catch (error) {
            console.error('Delete scene error:', error);
            window.adminPanel.showError('网络错误，请稍后重试');
        }
    }
}

async function editNPC(id) {
    try {
        console.log('Edit NPC:', id);
        
        // 获取NPC数据
        const response = await fetch(`/api/npcs/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch NPC data');
        }
        
        const npc = await response.json();
        
        // 填充表单
        const form = document.getElementById('npc-form');
        if (!form) {
            window.adminPanel.showError('NPC表单未找到');
            return;
        }
        
        // 设置标题为编辑模式
        document.querySelector('#npcModal .modal-title').textContent = '编辑NPC';
        
        // 填充表单字段
        form.elements['npc_id'].value = npc.npc_id;
        form.elements['npc_id'].readOnly = true; // NPC ID不允许修改
        form.elements['name'].value = npc.name;
        form.elements['npc_type'].value = npc.npc_type;
        form.elements['tier'].value = npc.tier;
        form.elements['faction'].value = npc.faction;
        form.elements['intelligence'].value = npc.intelligence;
        form.elements['strength'].value = npc.strength;
        form.elements['defense'].value = npc.defense;
        form.elements['hp_max'].value = npc.hp_max;
        form.elements['charisma'].value = npc.charisma || 50;
        form.elements['loyalty'].value = npc.loyalty || 50;
        form.elements['fear'].value = npc.fear || 0;
        form.elements['appearance'].value = npc.appearance || '';
        form.elements['description'].value = npc.description || '';
        
        // 保存NPC ID到表单的data属性，用于更新时识别
        form.dataset.editingId = id;
        
        // 更新保存按钮的onclick事件
        const saveButton = document.querySelector('#npcModal .btn-primary');
        saveButton.textContent = '更新NPC';
        saveButton.onclick = () => updateNPC(id);
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('npcModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error editing NPC:', error);
        window.adminPanel.showError('加载NPC数据失败: ' + error.message);
    }
}

async function deleteNPC(id) {
    if (confirm('确定要删除这个NPC吗？此操作不可恢复。')) {
        try {
            const response = await fetch(`/api/npcs/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                window.adminPanel.showSuccess('NPC删除成功！');
                // 刷新NPC列表
                if (window.adminPanel.currentSection === 'npcs') {
                    await window.adminPanel.loadNPCs();
                }
            } else {
                const error = await response.json();
                window.adminPanel.showError('删除失败: ' + (error.detail || '未知错误'));
            }
        } catch (error) {
            console.error('Delete NPC error:', error);
            window.adminPanel.showError('网络错误，请稍后重试');
        }
    }
}

async function updateNPC(id) {
    const form = document.getElementById('npc-form');
    
    // 验证表单
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // 收集表单数据
    const formData = new FormData(form);
    
    const npcData = {
        name: formData.get('name'),
        intelligence: parseInt(formData.get('intelligence')),
        strength: parseInt(formData.get('strength')),
        defense: parseInt(formData.get('defense')),
        hp_max: parseInt(formData.get('hp_max')),
        charisma: parseInt(formData.get('charisma')) || 50,
        loyalty: parseInt(formData.get('loyalty')) || 50,
        fear: parseInt(formData.get('fear')) || 0,
        appearance: formData.get('appearance'),
        description: formData.get('description')
    };
    
    try {
        const response = await fetch(`/api/npcs/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(npcData)
        });
        
        if (response.ok) {
            const result = await response.json();
            window.adminPanel.showSuccess('NPC更新成功！');
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('npcModal'));
            modal.hide();
            
            // 刷新NPC列表
            if (window.adminPanel.currentSection === 'npcs') {
                await window.adminPanel.loadNPCs();
            }
        } else {
            const error = await response.json();
            window.adminPanel.showError('更新失败: ' + (error.detail || '未知错误'));
        }
    } catch (error) {
        console.error('Update NPC error:', error);
        window.adminPanel.showError('网络错误，请稍后重试');
    }
}

async function editCard(id) {
    try {
        console.log('Edit Card:', id);
        
        // 获取卡片数据
        const response = await fetch(`/api/cards/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch card data');
        }
        
        const card = await response.json();
        
        // 填充表单
        const form = document.getElementById('card-form');
        if (!form) {
            window.adminPanel.showError('卡片表单未找到');
            return;
        }
        
        // 设置标题为编辑模式
        document.querySelector('#cardModal .modal-title').textContent = '编辑卡片';
        
        // 填充表单字段
        form.elements['card_id'].value = card.card_id;
        form.elements['card_id'].readOnly = true; // 卡片ID不允许修改
        form.elements['name'].value = card.name;
        form.elements['rarity'].value = card.rarity;
        form.elements['category'].value = card.category;
        form.elements['sub_category'].value = card.sub_category || '';
        form.elements['base_cost'].value = card.base_cost || 0;
        form.elements['max_stack'].value = card.max_stack || 1;
        form.elements['is_consumable'].checked = card.is_consumable;
        form.elements['description'].value = card.description || '';
        form.elements['flavor_text'].value = card.flavor_text || '';
        
        // 保存卡片ID到表单的data属性
        form.dataset.editingId = id;
        
        // 更新保存按钮
        const saveButton = document.querySelector('#cardModal .btn-primary');
        saveButton.textContent = '更新卡片';
        saveButton.onclick = () => updateCard(id);
        
        // 显示模态框
        const modal = new bootstrap.Modal(document.getElementById('cardModal'));
        modal.show();
        
    } catch (error) {
        console.error('Error editing card:', error);
        window.adminPanel.showError('加载卡片数据失败: ' + error.message);
    }
}

async function updateCard(id) {
    const form = document.getElementById('card-form');
    
    // 验证表单
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // 收集表单数据
    const formData = new FormData(form);
    
    const cardData = {
        name: formData.get('name'),
        description: formData.get('description'),
        base_cost: parseInt(formData.get('base_cost')) || 0
    };
    
    try {
        const response = await fetch(`/api/cards/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cardData)
        });
        
        if (response.ok) {
            const result = await response.json();
            window.adminPanel.showSuccess('卡片更新成功！');
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('cardModal'));
            modal.hide();
            
            // 刷新卡片列表
            if (window.adminPanel.currentSection === 'cards') {
                await window.adminPanel.loadCards();
            }
        } else {
            const error = await response.json();
            window.adminPanel.showError('更新失败: ' + (error.detail || '未知错误'));
        }
    } catch (error) {
        console.error('Update card error:', error);
        window.adminPanel.showError('网络错误，请稍后重试');
    }
}

async function deleteCard(id) {
    if (confirm('确定要删除这个卡片吗？此操作不可恢复。')) {
        try {
            const response = await fetch(`/api/cards/${id}`, {
                method: 'DELETE'
            });
            
            if (response.ok) {
                window.adminPanel.showSuccess('卡片删除成功！');
                // 刷新卡片列表
                if (window.adminPanel.currentSection === 'cards') {
                    await window.adminPanel.loadCards();
                }
            } else {
                const error = await response.json();
                window.adminPanel.showError('删除失败: ' + (error.detail || '未知错误'));
            }
        } catch (error) {
            console.error('Delete card error:', error);
            window.adminPanel.showError('网络错误，请稍后重试');
        }
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

async function saveScene() {
    const basicForm = document.getElementById('scene-basic-form');
    const aiForm = document.getElementById('scene-ai-form');
    
    // 验证表单
    if (!basicForm.checkValidity() || !aiForm.checkValidity()) {
        basicForm.reportValidity();
        aiForm.reportValidity();
        return;
    }
    
    // 收集表单数据
    const basicData = new FormData(basicForm);
    const aiData = new FormData(aiForm);
    
    const sceneData = {
        scene_id: basicData.get('scene_id'),
        name: basicData.get('name'),
        category: basicData.get('category'),
        chapter: parseInt(basicData.get('chapter')) || 1,
        description: basicData.get('description'),
        location: basicData.get('location'),
        time_of_day: basicData.get('time_of_day'),
        weather: basicData.get('weather'),
        narrator_prompt: aiData.get('narrator_prompt')
    };
    
    try {
        const response = await fetch('/api/scenes/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sceneData)
        });
        
        if (response.ok) {
            const result = await response.json();
            window.adminPanel.showSuccess('场景创建成功！');
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('sceneModal'));
            modal.hide();
            
            // 刷新场景列表
            if (window.adminPanel.currentSection === 'scenes') {
                await window.adminPanel.loadScenes();
            }
        } else {
            const error = await response.json();
            window.adminPanel.showError('创建失败: ' + (error.detail || '未知错误'));
        }
    } catch (error) {
        console.error('Save scene error:', error);
        window.adminPanel.showError('网络错误，请稍后重试');
    }
}

async function saveNPC() {
    const form = document.getElementById('npc-form');
    
    // 验证表单
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // 收集表单数据
    const formData = new FormData(form);
    
    const npcData = {
        npc_id: formData.get('npc_id'),
        name: formData.get('name'),
        npc_type: formData.get('npc_type'),
        tier: formData.get('tier'),
        faction: formData.get('faction'),
        intelligence: parseInt(formData.get('intelligence')),
        strength: parseInt(formData.get('strength')),
        defense: parseInt(formData.get('defense')),
        hp_max: parseInt(formData.get('hp_max')),
        charisma: parseInt(formData.get('charisma')) || 50,
        loyalty: parseInt(formData.get('loyalty')) || 50,
        fear: parseInt(formData.get('fear')) || 0,
        appearance: formData.get('appearance'),
        description: formData.get('description')
    };
    
    try {
        const response = await fetch('/api/npcs/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(npcData)
        });
        
        if (response.ok) {
            const result = await response.json();
            window.adminPanel.showSuccess('NPC创建成功！');
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('npcModal'));
            modal.hide();
            
            // 刷新NPC列表
            if (window.adminPanel.currentSection === 'npcs') {
                await window.adminPanel.loadNPCs();
            }
        } else {
            const error = await response.json();
            window.adminPanel.showError('创建失败: ' + (error.detail || '未知错误'));
        }
    } catch (error) {
        console.error('Save NPC error:', error);
        window.adminPanel.showError('网络错误，请稍后重试');
    }
}

async function saveCard() {
    const form = document.getElementById('card-form');
    
    // 验证表单
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // 收集表单数据
    const formData = new FormData(form);
    
    const cardData = {
        card_id: formData.get('card_id'),
        name: formData.get('name'),
        rarity: formData.get('rarity'),
        category: formData.get('category'),
        sub_category: formData.get('sub_category'),
        description: formData.get('description'),
        flavor_text: formData.get('flavor_text'),
        base_cost: parseInt(formData.get('base_cost')) || 0,
        max_stack: parseInt(formData.get('max_stack')) || 1,
        is_consumable: formData.get('is_consumable') === 'on'
    };
    
    try {
        const response = await fetch('/api/cards/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(cardData)
        });
        
        if (response.ok) {
            const result = await response.json();
            window.adminPanel.showSuccess('卡片创建成功！');
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('cardModal'));
            modal.hide();
            
            // 刷新卡片列表
            if (window.adminPanel.currentSection === 'cards') {
                await window.adminPanel.loadCards();
            }
        } else {
            const error = await response.json();
            window.adminPanel.showError('创建失败: ' + (error.detail || '未知错误'));
        }
    } catch (error) {
        console.error('Save card error:', error);
        window.adminPanel.showError('网络错误，请稍后重试');
    }
}

// 初始化管理面板
document.addEventListener('DOMContentLoaded', function() {
    window.adminPanel = new AdminPanel();
});