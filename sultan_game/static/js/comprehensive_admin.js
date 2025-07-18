/**
 * 苏丹的游戏 - 全面管理后台 JavaScript
 * 支持六大阵营和完整的游戏配置管理
 */

// 全局变量
let currentSection = 'dashboard';
let currentEditingNPC = null;
let currentEditingCard = null;
let currentEditingScene = null;
let currentEditingAI = null;
let factionData = {};
let gameStats = {};

// API基础URL
const API_BASE = '/api';

// 六大阵营配置
const FACTIONS = {
    sultan: { name: '苏丹王', color: '#ffd700', icon: 'fas fa-crown' },
    minister: { name: '大臣阵营', color: '#8b5cf6', icon: 'fas fa-user-tie' },
    military: { name: '将军阵营', color: '#ef4444', icon: 'fas fa-shield-alt' },
    blackduck: { name: '黑鸭会', color: '#374151', icon: 'fas fa-mask' },
    commoner: { name: '平民阵营', color: '#10b981', icon: 'fas fa-users' },
    scholar: { name: '学者阵营', color: '#3b82f6', icon: 'fas fa-graduation-cap' }
};

// 卡片稀有度配置
const CARD_RARITIES = {
    common: { name: '普通', color: '#6c757d', glow: 'none' },
    rare: { name: '稀有', color: '#0d6efd', glow: '0 0 10px #0d6efd' },
    epic: { name: '史诗', color: '#6f42c1', glow: '0 0 15px #6f42c1' },
    legendary: { name: '传说', color: '#fd7e14', glow: '0 0 20px #fd7e14' }
};

// 属性配置
const ATTRIBUTES = {
    intelligence: { name: '智力', abbr: 'INT', range: [1, 20], color: '#3b82f6' },
    strength: { name: '力量', abbr: 'STR', range: [1, 100], color: '#ef4444' },
    defense: { name: '防御', abbr: 'DEF', range: [1, 100], color: '#10b981' },
    charisma: { name: '魅力', abbr: 'CHA', range: [1, 100], color: '#8b5cf6' },
    loyalty: { name: '忠诚', abbr: 'LOY', range: [1, 100], color: '#fbbf24' },
    fear: { name: '恐惧', abbr: 'FEAR', range: [1, 100], color: '#6b7280' },
    influence: { name: '影响力', abbr: 'INF', range: [1, 100], color: '#f59e0b' },
    command: { name: '指挥', abbr: 'CMD', range: [1, 100], color: '#dc2626' },
    stealth: { name: '隐蔽', abbr: 'HIDE', range: [1, 100], color: '#374151' },
    hp_max: { name: '生命值', abbr: 'HP', range: [1, 500], color: '#ef4444' }
};

// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    loadDashboardData();
});

/**
 * 应用初始化
 */
function initializeApp() {
    // 初始化Select2 (jQuery已移除，暂时跳过)
    // $('.select2').select2({
    //     theme: 'bootstrap-5',
    //     width: '100%'
    // });

    // 初始化导航
    initializeNavigation();
    
    // 初始化图表
    initializeCharts();
    
    // 加载初始数据
    loadInitialData();
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
    // 导航事件
    document.querySelectorAll('.nav-link[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    // 搜索事件
    const searchInputs = document.querySelectorAll('input[type="text"][id$="-search"]');
    searchInputs.forEach(input => {
        input.addEventListener('input', debounce(handleSearch, 300));
    });

    // 筛选事件
    const filterSelects = document.querySelectorAll('select[id$="-filter"]');
    filterSelects.forEach(select => {
        select.addEventListener('change', handleFilter);
    });

    // 表单提交事件
    document.addEventListener('submit', function(e) {
        if (e.target.classList.contains('admin-form')) {
            e.preventDefault();
            handleFormSubmit(e.target);
        }
    });

    // 键盘快捷键
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key) {
                case 's':
                    e.preventDefault();
                    saveCurrentData();
                    break;
                case 'f':
                    e.preventDefault();
                    focusSearch();
                    break;
            }
        }
    });
}

/**
 * 导航初始化
 */
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            
            // 更新导航状态
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            // 显示对应部分
            showSection(section);
        });
    });
}

/**
 * 显示指定部分
 */
function showSection(section) {
    // 隐藏所有部分
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.style.display = 'none';
    });
    
    // 显示目标部分
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.style.display = 'block';
        currentSection = section;
        
        // 加载部分数据
        loadSectionData(section);
    }
}

/**
 * 加载部分数据
 */
function loadSectionData(section) {
    switch(section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'scenes':
            loadScenesData();
            break;
        case 'npcs':
            loadNPCsData();
            break;
        case 'cards':
            loadCardsData();
            break;
        case 'ai-configs':
            loadAIConfigsData();
            break;
        case 'players':
            loadPlayersData();
            break;
        case 'factions':
            loadFactionsData();
            break;
        case 'balance':
            loadBalanceData();
            break;
        case 'analytics':
            loadAnalyticsData();
            break;
        case 'system':
            loadSystemData();
            break;
        case 'templates':
            loadTemplatesData();
            break;
    }
}

/**
 * 加载初始数据
 */
async function loadInitialData() {
    try {
        // 并行加载基础数据
        const [factionsResponse, statsResponse] = await Promise.all([
            fetch(`${API_BASE}/factions`),
            fetch(`${API_BASE}/stats`)
        ]);
        
        if (factionsResponse.ok) {
            factionData = await factionsResponse.json();
        }
        
        if (statsResponse.ok) {
            gameStats = await statsResponse.json();
        }
        
        updateFactionOverview();
    } catch (error) {
        console.error('加载初始数据失败:', error);
        showNotification('加载初始数据失败', 'error');
    }
}

/**
 * 加载仪表板数据
 */
async function loadDashboardData() {
    try {
        const response = await fetch(`${API_BASE}/dashboard/stats`);
        if (response.ok) {
            const stats = await response.json();
            updateDashboardStats(stats);
        }
    } catch (error) {
        console.error('加载仪表板数据失败:', error);
    }
}

/**
 * 更新仪表板统计
 */
function updateDashboardStats(stats) {
    // 更新统计数字
    document.getElementById('total-scenes').textContent = stats.scenes || 0;
    document.getElementById('total-npcs').textContent = stats.npcs || 0;
    document.getElementById('total-cards').textContent = stats.cards || 0;
    document.getElementById('total-players').textContent = stats.players || 0;
    document.getElementById('total-ai-configs').textContent = stats.ai_configs || 0;
    
    // 更新阵营统计
    if (stats.factions) {
        Object.keys(FACTIONS).forEach(faction => {
            const npcCount = stats.factions[faction]?.npcs || 0;
            const activity = stats.factions[faction]?.activity || 0;
            
            const npcElement = document.getElementById(`${faction}-npcs`);
            const activityElement = document.getElementById(`${faction}-activity`);
            
            if (npcElement) npcElement.textContent = npcCount;
            if (activityElement) activityElement.textContent = `${activity}%`;
        });
    }
}

/**
 * 加载场景数据
 */
async function loadScenesData() {
    try {
        const response = await fetch(`${API_BASE}/scenes`);
        if (response.ok) {
            const scenes = await response.json();
            renderScenesTable(scenes);
        } else {
            console.error('加载场景数据失败:', response.status);
            showNotification('加载场景数据失败', 'error');
        }
    } catch (error) {
        console.error('加载场景数据失败:', error);
        showNotification('加载场景数据失败', 'error');
    }
}

/**
 * 渲染场景表格
 */
function renderScenesTable(scenes) {
    const tbody = document.getElementById('scenes-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    scenes.forEach(scene => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${scene.scene_id}</td>
            <td>${scene.name}</td>
            <td><span class="badge bg-info">${scene.category}</span></td>
            <td><span class="badge bg-${scene.status === 'active' ? 'success' : 'secondary'}">${scene.status || 'draft'}</span></td>
            <td>${scene.chapter || 1}</td>
            <td><span class="badge bg-${scene.is_active ? 'success' : 'danger'}">${scene.is_active ? '激活' : '禁用'}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editScene('${scene.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="configureSceneNPCs('${scene.id}')">
                        <i class="fas fa-users"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="configureSceneRewards('${scene.id}')">
                        <i class="fas fa-gift"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteScene('${scene.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

/**
 * 加载NPC数据
 */
async function loadNPCsData() {
    try {
        const response = await fetch(`${API_BASE}/npcs`);
        if (response.ok) {
            const npcs = await response.json();
            renderNPCCards(npcs);
        }
    } catch (error) {
        console.error('加载NPC数据失败:', error);
    }
}

/**
 * 渲染NPC表格
 */
function renderNPCCards(npcs) {
    const tbody = document.getElementById('npcs-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    npcs.forEach(npc => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${npc.npc_id}</td>
            <td>${npc.name}</td>
            <td><span class="badge bg-info">${npc.npc_type}</span></td>
            <td><span class="badge bg-${getTierColor(npc.tier)}">${npc.tier}</span></td>
            <td><span class="badge bg-${getFactionColor(npc.faction)}">${FACTIONS[npc.faction]?.name || npc.faction}</span></td>
            <td>${npc.intelligence}/${npc.strength}/${npc.defense}</td>
            <td><span class="badge bg-${npc.is_active ? 'success' : 'danger'}">${npc.is_active ? '激活' : '禁用'}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editNPC('${npc.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="viewNPCDetails('${npc.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteNPC('${npc.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getTierColor(tier) {
    const colors = {
        bronze: 'warning',
        silver: 'secondary',
        gold: 'warning',
        legendary: 'danger'
    };
    return colors[tier] || 'secondary';
}

/**
 * 加载卡片数据
 */
async function loadCardsData() {
    try {
        const response = await fetch(`${API_BASE}/cards`);
        if (response.ok) {
            const cards = await response.json();
            renderCardsGrid(cards);
        }
    } catch (error) {
        console.error('加载卡片数据失败:', error);
    }
}

/**
 * 渲染卡片网格
 */
function renderCardsGrid(cards) {
    const container = document.getElementById('cards-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.className = 'col-md-6 col-lg-4 mb-3';
        cardElement.innerHTML = `
            <div class="card card-item rarity-${card.rarity}" data-rarity="${card.rarity}" data-type="${card.type}">
                <div class="card-header">
                    <h6 class="card-title mb-0">
                        ${card.name}
                        <span class="badge bg-${getRarityColor(card.rarity)} ms-2">${CARD_RARITIES[card.rarity]?.name || card.rarity}</span>
                    </h6>
                </div>
                <div class="card-body">
                    <p class="card-text">${card.description}</p>
                    <div class="row">
                        <div class="col-6">
                            <small class="text-muted">类型:</small> <strong>${card.type}</strong><br>
                            <small class="text-muted">使用限制:</small> <strong>${card.usage_limit || '无限'}</strong>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">获取成本:</small> <strong>${card.acquisition_cost || 0}</strong><br>
                            <small class="text-muted">维护成本:</small> <strong>${card.maintenance_cost || 0}</strong>
                        </div>
                    </div>
                    <div class="mt-2">
                        <span class="badge bg-${card.is_active ? 'success' : 'danger'}">${card.is_active ? '激活' : '禁用'}</span>
                        <span class="badge bg-info">${card.effects?.length || 0} 效果</span>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="btn-group btn-group-sm w-100">
                        <button class="btn btn-outline-primary" onclick="editCard('${card.id}')">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-outline-info" onclick="configureCardEffects('${card.id}')">
                            <i class="fas fa-magic"></i> 效果
                        </button>
                        <button class="btn btn-outline-warning" onclick="testCard('${card.id}')">
                            <i class="fas fa-vial"></i> 测试
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteCard('${card.id}')">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(cardElement);
    });
}

/**
 * 工具函数
 */
function getFactionColor(faction) {
    const colors = {
        sultan: 'warning',
        minister: 'primary',
        military: 'danger',
        blackduck: 'dark',
        commoner: 'success',
        scholar: 'info'
    };
    return colors[faction] || 'secondary';
}

function getDifficultyColor(difficulty) {
    const colors = {
        easy: 'success',
        medium: 'warning',
        hard: 'danger',
        expert: 'dark'
    };
    return colors[difficulty] || 'secondary';
}

function getRarityColor(rarity) {
    const colors = {
        common: 'secondary',
        rare: 'primary',
        epic: 'primary',
        legendary: 'warning'
    };
    return colors[rarity] || 'secondary';
}

/**
 * 防抖函数
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 通知系统
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.zIndex = '9999';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

/**
 * 模态框管理
 */
function openModal(modalId, title, content) {
    const modal = document.getElementById(modalId) || createModal(modalId);
    modal.querySelector('.modal-title').textContent = title;
    modal.querySelector('.modal-body').innerHTML = content;
    
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
}

function createModal(id) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = id;
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title"></h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body"></div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="saveModalData()">保存</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    return modal;
}

/**
 * 事件处理函数
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const section = currentSection;
    
    // 根据当前部分执行搜索
    switch(section) {
        case 'scenes':
            filterScenes();
            break;
        case 'npcs':
            filterNPCs();
            break;
        case 'cards':
            filterCards();
            break;
        // 其他部分...
    }
}

function handleFilter(event) {
    const section = currentSection;
    
    switch(section) {
        case 'scenes':
            filterScenes();
            break;
        case 'npcs':
            filterNPCs();
            break;
        case 'cards':
            filterCards();
            break;
        // 其他部分...
    }
}

function filterScenes() {
    const search = document.getElementById('scene-search').value.toLowerCase();
    const category = document.getElementById('scene-category-filter').value;
    const faction = document.getElementById('scene-faction-filter').value;
    const difficulty = document.getElementById('scene-difficulty-filter').value;
    const status = document.getElementById('scene-status-filter').value;
    
    const rows = document.querySelectorAll('#scenes-table-body tr');
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        const matchesSearch = text.includes(search);
        const matchesCategory = !category || row.querySelector('td:nth-child(3)').textContent.includes(category);
        const matchesFaction = !faction || row.querySelector('td:nth-child(4)').textContent.includes(faction);
        const matchesDifficulty = !difficulty || row.querySelector('td:nth-child(5)').textContent.includes(difficulty);
        const matchesStatus = !status || row.querySelector('td:nth-child(6)').textContent.includes(status);
        
        row.style.display = matchesSearch && matchesCategory && matchesFaction && matchesDifficulty && matchesStatus ? '' : 'none';
    });
}

function filterNPCs() {
    const search = document.getElementById('npc-search').value.toLowerCase();
    const faction = document.getElementById('npc-faction-filter').value;
    const tier = document.getElementById('npc-tier-filter').value;
    const category = document.getElementById('npc-category-filter').value;
    const killable = document.getElementById('npc-killable-filter').value;
    
    const cards = document.querySelectorAll('.npc-card');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const matchesSearch = text.includes(search);
        const matchesFaction = !faction || card.getAttribute('data-faction') === faction;
        const matchesTier = !tier || card.getAttribute('data-tier') === tier;
        // 其他过滤条件...
        
        card.closest('.col-md-6').style.display = matchesSearch && matchesFaction && matchesTier ? '' : 'none';
    });
}

function filterCards() {
    const search = document.getElementById('card-search').value.toLowerCase();
    const rarity = document.getElementById('card-rarity-filter').value;
    const type = document.getElementById('card-type-filter').value;
    const faction = document.getElementById('card-faction-filter').value;
    const status = document.getElementById('card-status-filter').value;
    
    const cards = document.querySelectorAll('.card-item');
    cards.forEach(card => {
        const text = card.textContent.toLowerCase();
        const matchesSearch = text.includes(search);
        const matchesRarity = !rarity || card.getAttribute('data-rarity') === rarity;
        const matchesType = !type || card.getAttribute('data-type') === type;
        // 其他过滤条件...
        
        card.closest('.col-md-6').style.display = matchesSearch && matchesRarity && matchesType ? '' : 'none';
    });
}

// 各种操作函数
function editScene(id) {
    currentEditingScene = id;
    openSceneModal(id);
}

function editNPC(id) {
    currentEditingNPC = id;
    openNPCModal(id);
}

function editCard(id) {
    currentEditingCard = id;
    openCardModal(id);
}

function editAIConfig(id) {
    currentEditingAI = id;
    openAIConfigModal(id);
}

function viewAIConfig(id) {
    fetch(`${API_BASE}/ai-configs/${id}`)
        .then(response => response.json())
        .then(config => {
            const content = `
                <div class="mb-3">
                    <h6>基本信息</h6>
                    <p><strong>配置ID:</strong> ${config.config_id}</p>
                    <p><strong>名称:</strong> ${config.name}</p>
                    <p><strong>AI类型:</strong> ${config.ai_type}</p>
                    <p><strong>版本:</strong> ${config.version}</p>
                    <p><strong>状态:</strong> ${config.is_active ? '激活' : '禁用'}</p>
                </div>
                <div class="mb-3">
                    <h6>基础提示词</h6>
                    <pre class="bg-light p-3 rounded" style="max-height: 200px; overflow-y: auto;">${config.base_prompt}</pre>
                </div>
                ${config.system_prompt ? `
                <div class="mb-3">
                    <h6>系统提示词</h6>
                    <pre class="bg-light p-3 rounded">${config.system_prompt}</pre>
                </div>
                ` : ''}
                <div class="mb-3">
                    <h6>模型配置</h6>
                    <pre class="bg-light p-3 rounded">${JSON.stringify(config.model_config || config.model_settings || {}, null, 2)}</pre>
                </div>
                <div class="mb-3">
                    <h6>评估配置</h6>
                    <pre class="bg-light p-3 rounded">${JSON.stringify(config.evaluation_config || {}, null, 2)}</pre>
                </div>
                <div class="mb-3">
                    <h6>旁白配置</h6>
                    <pre class="bg-light p-3 rounded">${JSON.stringify(config.narration_config || {}, null, 2)}</pre>
                </div>
            `;
            openModal('viewAIModal', 'AI配置详情', content);
        })
        .catch(error => {
            console.error('获取AI配置失败:', error);
            showNotification('获取AI配置失败', 'error');
        });
}

function testAIConfig(id) {
    fetch(`${API_BASE}/ai-configs/${id}/test`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            test_prompt: "这是一个测试消息",
            context: "测试环境"
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('AI配置测试成功', 'success');
            const content = `
                <div class="mb-3">
                    <h6>测试结果</h6>
                    <pre class="bg-light p-3 rounded">${data.response}</pre>
                </div>
                <div class="mb-3">
                    <h6>响应时间</h6>
                    <p>${data.response_time}ms</p>
                </div>
            `;
            openModal('testResultModal', 'AI测试结果', content);
        } else {
            showNotification('AI配置测试失败: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('测试AI配置失败:', error);
        showNotification('测试AI配置失败', 'error');
    });
}

function deleteAIConfig(id) {
    if (confirm('确定要删除这个AI配置吗？')) {
        fetch(`${API_BASE}/ai-configs/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showNotification('AI配置已删除', 'success');
                loadAIConfigsData();
            } else {
                showNotification('删除失败: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('删除AI配置失败:', error);
            showNotification('删除AI配置失败', 'error');
        });
    }
}

function configureSceneNPCs(sceneId) {
    currentEditingScene = sceneId;
    fetch(`${API_BASE}/scenes/${sceneId}/npcs`)
        .then(response => response.json())
        .then(npcs => {
            const content = `
                <div class="mb-3">
                    <h6>场景NPC配置</h6>
                    <div id="scene-npcs-list">
                        ${npcs.map(npc => `
                            <div class="card mb-2">
                                <div class="card-body">
                                    <h6>${npc.name}</h6>
                                    <p>角色: ${npc.role || '未设置'}</p>
                                    <p>行为: ${npc.behavior || '中性'}</p>
                                    <button class="btn btn-sm btn-outline-primary" onclick="editSceneNPC('${npc.id}')">
                                        <i class="fas fa-edit"></i> 编辑
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger" onclick="removeSceneNPC('${npc.id}')">
                                        <i class="fas fa-trash"></i> 移除
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    <button class="btn btn-primary" onclick="addSceneNPC()">
                        <i class="fas fa-plus"></i> 添加NPC
                    </button>
                </div>
            `;
            openModal('sceneNPCModal', '场景NPC配置', content);
        })
        .catch(error => {
            console.error('获取场景NPC失败:', error);
            showNotification('获取场景NPC失败', 'error');
        });
}

function configureSceneRewards(sceneId) {
    currentEditingScene = sceneId;
    fetch(`${API_BASE}/scenes/${sceneId}/rewards`)
        .then(response => response.json())
        .then(rewards => {
            const content = `
                <div class="mb-3">
                    <h6>场景奖励配置</h6>
                    <form id="scene-rewards-form">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">成功奖励 - 属性点</label>
                                    <input type="number" class="form-control" name="success_attribute_points" value="${rewards?.success_attribute_points || 15}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">成功奖励 - 经验值</label>
                                    <input type="number" class="form-control" name="success_experience" value="${rewards?.success_experience || 100}">
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">成功奖励 - 声望</label>
                                    <input type="number" class="form-control" name="success_reputation" value="${rewards?.success_reputation || 10}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label class="form-label">成功奖励 - 金币</label>
                                    <input type="number" class="form-control" name="success_gold" value="${rewards?.success_gold || 0}">
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">失败惩罚 - 声望</label>
                            <input type="number" class="form-control" name="failure_reputation" value="${rewards?.failure_reputation || -5}">
                        </div>
                        <button type="submit" class="btn btn-primary">保存奖励配置</button>
                    </form>
                </div>
            `;
            openModal('sceneRewardsModal', '场景奖励配置', content);
        })
        .catch(error => {
            console.error('获取场景奖励失败:', error);
            showNotification('获取场景奖励失败', 'error');
        });
}

function deleteScene(id) {
    if (confirm('确定要删除这个场景吗？')) {
        fetch(`${API_BASE}/scenes/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showNotification('场景已删除', 'success');
                loadScenesData();
            } else {
                showNotification('删除失败: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('删除场景失败:', error);
            showNotification('删除场景失败', 'error');
        });
    }
}

function deleteNPC(id) {
    if (confirm('确定要删除这个NPC吗？')) {
        fetch(`${API_BASE}/npcs/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showNotification('NPC已删除', 'success');
                loadNPCsData();
            } else {
                showNotification('删除失败: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('删除NPC失败:', error);
            showNotification('删除NPC失败', 'error');
        });
    }
}

function deleteCard(id) {
    if (confirm('确定要删除这个卡片吗？')) {
        fetch(`${API_BASE}/cards/${id}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showNotification('卡片已删除', 'success');
                loadCardsData();
            } else {
                showNotification('删除失败: ' + data.message, 'error');
            }
        })
        .catch(error => {
            console.error('删除卡片失败:', error);
            showNotification('删除卡片失败', 'error');
        });
    }
}

// 模态框打开函数
function openSceneModal(id) {
    // 打开场景配置模态框
    const modal = new bootstrap.Modal(document.getElementById('sceneModal'));
    
    if (id) {
        // 编辑模式：加载现有场景数据
        currentEditingScene = id;
        loadSceneData(id);
    } else {
        // 创建模式：清空表单
        currentEditingScene = null;
        clearSceneForm();
    }
    
    modal.show();
}

function loadSceneData(sceneId) {
    // 加载场景数据到表单
    fetch(`${API_BASE}/scenes/${sceneId}`)
        .then(response => response.json())
        .then(scene => {
            document.querySelector('[name="scene_id"]').value = scene.scene_id;
            document.querySelector('[name="name"]').value = scene.name;
            document.querySelector('[name="category"]').value = scene.category;
            document.querySelector('[name="chapter"]').value = scene.chapter;
            document.querySelector('[name="description"]').value = scene.description || '';
            document.querySelector('[name="location"]').value = scene.location || '';
            document.querySelector('[name="weather"]').value = scene.weather || '';
            document.querySelector('[name="time_of_day"]').value = scene.time_of_day || '';
            
            // 更新模态框标题
            document.querySelector('#sceneModal .modal-title').textContent = '编辑场景';
            
            // 加载场景NPC配置
            loadSceneNPCs(sceneId);
        })
        .catch(error => {
            console.error('加载场景数据失败:', error);
            showNotification('加载场景数据失败', 'error');
        });
}

function loadSceneNPCs(sceneId) {
    // 加载场景NPC配置
    fetch(`${API_BASE}/scenes/${sceneId}/npcs`)
        .then(response => response.json())
        .then(npcs => {
            const container = document.getElementById('current-scene-npcs');
            if (!container) return;
            
            if (npcs.length === 0) {
                container.innerHTML = '<p class="text-muted">暂无NPC配置</p>';
                return;
            }
            
            container.innerHTML = npcs.map(npc => `
                <div class="card mb-2">
                    <div class="card-body">
                        <h6>${npc.name}</h6>
                        <p class="mb-1">角色: ${npc.role || '未设置'}</p>
                        <p class="mb-1">行为: ${npc.behavior || '中性'}</p>
                        <button class="btn btn-sm btn-outline-primary me-2" onclick="editSceneNPC('${npc.id}')">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-sm btn-outline-danger" onclick="removeSceneNPC('${npc.id}')">
                            <i class="fas fa-trash"></i> 移除
                        </button>
                    </div>
                </div>
            `).join('');
        })
        .catch(error => {
            console.error('加载场景NPC失败:', error);
            const container = document.getElementById('current-scene-npcs');
            if (container) {
                container.innerHTML = '<p class="text-danger">加载NPC配置失败</p>';
            }
        });
}

function clearSceneForm() {
    // 清空场景表单
    document.querySelector('[name="scene_id"]').value = '';
    document.querySelector('[name="name"]').value = '';
    document.querySelector('[name="category"]').value = '';
    document.querySelector('[name="chapter"]').value = '1';
    document.querySelector('[name="description"]').value = '';
    document.querySelector('[name="location"]').value = '';
    document.querySelector('[name="weather"]').value = '';
    document.querySelector('[name="time_of_day"]').value = '';
    document.querySelector('[name="narrator_prompt"]').value = '';
    
    // 清空NPC配置
    document.getElementById('scene-npcs-list').innerHTML = '';
    
    // 清空当前场景NPC
    const currentNpcContainer = document.getElementById('current-scene-npcs');
    if (currentNpcContainer) {
        currentNpcContainer.innerHTML = '<p class="text-muted">创建新场景时暂无NPC配置</p>';
    }
    
    // 重置奖励配置
    document.querySelector('[name="success_attribute_points"]').value = '15';
    document.querySelector('[name="success_experience"]').value = '100';
    document.querySelector('[name="success_reputation"]').value = '10';
    document.querySelector('[name="success_gold"]').value = '0';
    document.querySelector('[name="failure_reputation"]').value = '-5';
    
    // 更新模态框标题
    document.querySelector('#sceneModal .modal-title').textContent = '新建场景';
}

function openNPCModal(id) {
    // 打开NPC配置模态框
    const modal = new bootstrap.Modal(document.getElementById('npcModal'));
    
    if (id) {
        // 编辑模式：加载现有NPC数据
        currentEditingNPC = id;
        loadNPCData(id);
    } else {
        // 创建模式：清空表单
        currentEditingNPC = null;
        clearNPCForm();
    }
    
    modal.show();
}

// 修复函数名不匹配的问题
function openNpcModal(id) {
    return openNPCModal(id);
}

function loadNPCData(npcId) {
    // 加载NPC数据到表单
    fetch(`${API_BASE}/npcs/${npcId}`)
        .then(response => response.json())
        .then(npc => {
            document.querySelector('[name="npc_id"]').value = npc.npc_id;
            document.querySelector('[name="name"]').value = npc.name;
            document.querySelector('[name="npc_type"]').value = npc.npc_type;
            document.querySelector('[name="tier"]').value = npc.tier;
            document.querySelector('[name="faction"]').value = npc.faction;
            document.querySelector('[name="intelligence"]').value = npc.intelligence;
            document.querySelector('[name="strength"]').value = npc.strength;
            document.querySelector('[name="defense"]').value = npc.defense;
            document.querySelector('[name="hp_max"]').value = npc.hp_max;
            document.querySelector('[name="charisma"]').value = npc.charisma || 0;
            document.querySelector('[name="loyalty"]').value = npc.loyalty || 0;
            document.querySelector('[name="influence"]').value = npc.influence || 0;
            document.querySelector('[name="command"]').value = npc.command || 0;
            document.querySelector('[name="appearance"]').value = npc.appearance || '';
            document.querySelector('[name="description"]').value = npc.description || '';
            
            // 更新模态框标题
            document.querySelector('#npcModal .modal-title').textContent = '编辑NPC';
        })
        .catch(error => {
            console.error('加载NPC数据失败:', error);
            showNotification('加载NPC数据失败', 'error');
        });
}

function clearNPCForm() {
    // 清空NPC表单
    document.querySelector('[name="npc_id"]').value = '';
    document.querySelector('[name="name"]').value = '';
    document.querySelector('[name="npc_type"]').value = '';
    document.querySelector('[name="tier"]').value = '';
    document.querySelector('[name="faction"]').value = '';
    document.querySelector('[name="intelligence"]').value = '10';
    document.querySelector('[name="strength"]').value = '50';
    document.querySelector('[name="defense"]').value = '50';
    document.querySelector('[name="hp_max"]').value = '100';
    document.querySelector('[name="charisma"]').value = '50';
    document.querySelector('[name="loyalty"]').value = '50';
    document.querySelector('[name="influence"]').value = '30';
    document.querySelector('[name="command"]').value = '30';
    document.querySelector('[name="appearance"]').value = '';
    document.querySelector('[name="description"]').value = '';
    
    // 更新模态框标题
    document.querySelector('#npcModal .modal-title').textContent = '新建NPC';
}

function saveNPC() {
    const npcData = {
        npc_id: document.querySelector('[name="npc_id"]').value,
        name: document.querySelector('[name="name"]').value,
        npc_type: document.querySelector('[name="npc_type"]').value,
        tier: document.querySelector('[name="tier"]').value,
        faction: document.querySelector('[name="faction"]').value,
        intelligence: parseInt(document.querySelector('[name="intelligence"]').value) || 10,
        strength: parseInt(document.querySelector('[name="strength"]').value) || 50,
        defense: parseInt(document.querySelector('[name="defense"]').value) || 50,
        hp_max: parseInt(document.querySelector('[name="hp_max"]').value) || 100,
        charisma: parseInt(document.querySelector('[name="charisma"]').value) || 50,
        loyalty: parseInt(document.querySelector('[name="loyalty"]').value) || 50,
        influence: parseInt(document.querySelector('[name="influence"]').value) || 30,
        command: parseInt(document.querySelector('[name="command"]').value) || 30,
        appearance: document.querySelector('[name="appearance"]').value,
        description: document.querySelector('[name="description"]').value
    };
    
    // 验证必填字段
    if (!npcData.npc_id || !npcData.name || !npcData.npc_type || !npcData.tier || !npcData.faction) {
        showNotification('请填写所有必填字段', 'error');
        return;
    }
    
    const method = currentEditingNPC ? 'PUT' : 'POST';
    const url = currentEditingNPC ? `${API_BASE}/npcs/${currentEditingNPC}` : `${API_BASE}/npcs/`;
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(npcData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id || data.npc_id) {
            showNotification(currentEditingNPC ? 'NPC更新成功' : 'NPC创建成功', 'success');
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('npcModal'));
            if (modal) {
                modal.hide();
            }
            
            // 刷新NPC列表
            loadNPCsData();
        } else {
            showNotification('NPC保存失败: ' + (data.detail || '未知错误'), 'error');
        }
    })
    .catch(error => {
        console.error('NPC保存失败:', error);
        showNotification('NPC保存失败', 'error');
    });
}

function viewNPCDetails(id) {
    fetch(`${API_BASE}/npcs/${id}`)
        .then(response => response.json())
        .then(npc => {
            const content = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>基本信息</h6>
                        <p><strong>NPC ID:</strong> ${npc.npc_id}</p>
                        <p><strong>名称:</strong> ${npc.name}</p>
                        <p><strong>类型:</strong> ${npc.npc_type}</p>
                        <p><strong>稀有度:</strong> ${npc.tier}</p>
                        <p><strong>阵营:</strong> ${npc.faction}</p>
                        <p><strong>状态:</strong> ${npc.is_active ? '激活' : '禁用'}</p>
                    </div>
                    <div class="col-md-6">
                        <h6>属性</h6>
                        <p><strong>智力:</strong> ${npc.intelligence}</p>
                        <p><strong>力量:</strong> ${npc.strength}</p>
                        <p><strong>防御:</strong> ${npc.defense}</p>
                        <p><strong>生命值:</strong> ${npc.hp_max}</p>
                        <p><strong>魅力:</strong> ${npc.charisma || 0}</p>
                        <p><strong>忠诚:</strong> ${npc.loyalty || 0}</p>
                        <p><strong>影响力:</strong> ${npc.influence || 0}</p>
                        <p><strong>指挥:</strong> ${npc.command || 0}</p>
                    </div>
                </div>
                ${npc.appearance ? `
                <div class="mt-3">
                    <h6>外观描述</h6>
                    <p>${npc.appearance}</p>
                </div>
                ` : ''}
                ${npc.description ? `
                <div class="mt-3">
                    <h6>背景描述</h6>
                    <p>${npc.description}</p>
                </div>
                ` : ''}
            `;
            openModal('npcDetailsModal', 'NPC详情', content);
        })
        .catch(error => {
            console.error('获取NPC详情失败:', error);
            showNotification('获取NPC详情失败', 'error');
        });
}

function openCardModal(id) {
    // 实现卡片编辑模态框
    showNotification('卡片编辑功能开发中', 'info');
}

function openAIConfigModal(id) {
    // 打开AI配置模态框
    const modal = new bootstrap.Modal(document.getElementById('aiConfigModal'));
    
    if (id) {
        // 编辑模式：加载现有AI配置数据
        currentEditingAI = id;
        loadAIConfigData(id);
    } else {
        // 创建模式：清空表单
        currentEditingAI = null;
        clearAIConfigForm();
    }
    
    modal.show();
}

function loadAIConfigData(configId) {
    // 加载AI配置数据到表单
    fetch(`${API_BASE}/ai-configs/${configId}`)
        .then(response => response.json())
        .then(config => {
            // 基础信息
            document.querySelector('[name="config_id"]').value = config.config_id;
            document.querySelector('[name="name"]').value = config.name;
            document.querySelector('[name="ai_type"]').value = config.ai_type;
            document.querySelector('[name="version"]').value = config.version || '1.0';
            document.querySelector('[name="created_by"]').value = config.created_by || '';
            document.querySelector('[name="base_prompt"]').value = config.base_prompt || '';
            document.querySelector('[name="system_prompt"]').value = config.system_prompt || '';
            
            // 模型配置
            const modelConfig = config.model_config || config.model_settings || {};
            document.querySelector('[name="temperature"]').value = modelConfig.temperature || 0.7;
            document.querySelector('[name="max_tokens"]').value = modelConfig.max_tokens || 2048;
            document.querySelector('[name="top_p"]').value = modelConfig.top_p || 0.9;
            
            // 角色配置
            const charConfig = config.character_config || {};
            document.querySelector('[name="personality"]').value = charConfig.personality || '';
            document.querySelector('[name="speaking_style"]').value = charConfig.speaking_style || '';
            
            // 评估配置
            const evalConfig = config.evaluation_config || {};
            document.querySelector('[name="story_weight"]').value = evalConfig.story_weight || 0.4;
            document.querySelector('[name="dialogue_weight"]').value = evalConfig.dialogue_weight || 0.3;
            document.querySelector('[name="tension_weight"]').value = evalConfig.tension_weight || 0.3;
            
            // 生成配置
            const genConfig = config.generation_config || {};
            document.querySelector('[name="generation_style"]').value = genConfig.generation_style || '';
            document.querySelector('[name="style_bias"]').value = genConfig.style_bias || '';
            
            // 旁白配置
            const narratorConfig = config.narration_config || {};
            document.querySelector('[name="narrator_style"]').value = narratorConfig.narrator_style || '';
            document.querySelector('[name="trigger_frequency"]').value = narratorConfig.trigger_frequency || 3;
            
            // 更新模态框标题
            document.querySelector('#aiConfigModal .modal-title').textContent = '编辑AI配置';
        })
        .catch(error => {
            console.error('加载AI配置数据失败:', error);
            showNotification('加载AI配置数据失败', 'error');
        });
}

function clearAIConfigForm() {
    // 清空AI配置表单
    document.querySelector('[name="config_id"]').value = '';
    document.querySelector('[name="name"]').value = '';
    document.querySelector('[name="ai_type"]').value = '';
    document.querySelector('[name="version"]').value = '1.0';
    document.querySelector('[name="created_by"]').value = '';
    document.querySelector('[name="base_prompt"]').value = '';
    document.querySelector('[name="system_prompt"]').value = '';
    
    // 重置模型配置
    document.querySelector('[name="temperature"]').value = '0.7';
    document.querySelector('[name="max_tokens"]').value = '2048';
    document.querySelector('[name="top_p"]').value = '0.9';
    
    // 重置角色配置
    document.querySelector('[name="personality"]').value = '';
    document.querySelector('[name="speaking_style"]').value = '';
    
    // 重置评估配置
    document.querySelector('[name="story_weight"]').value = '0.4';
    document.querySelector('[name="dialogue_weight"]').value = '0.3';
    document.querySelector('[name="tension_weight"]').value = '0.3';
    
    // 重置生成配置
    document.querySelector('[name="generation_style"]').value = '';
    document.querySelector('[name="style_bias"]').value = '';
    
    // 重置旁白配置
    document.querySelector('[name="narrator_style"]').value = '';
    document.querySelector('[name="trigger_frequency"]').value = '3';
    
    // 更新模态框标题
    document.querySelector('#aiConfigModal .modal-title').textContent = '新建AI配置';
}

function saveAIConfig() {
    const form = document.getElementById('ai-config-form');
    const formData = new FormData(form);
    
    // 构建配置对象
    const configData = {
        config_id: formData.get('config_id'),
        name: formData.get('name'),
        ai_type: formData.get('ai_type'),
        version: formData.get('version'),
        created_by: formData.get('created_by'),
        base_prompt: formData.get('base_prompt'),
        system_prompt: formData.get('system_prompt'),
        model_settings: {
            temperature: parseFloat(formData.get('temperature')),
            max_tokens: parseInt(formData.get('max_tokens')),
            top_p: parseFloat(formData.get('top_p'))
        },
        character_config: {
            personality: formData.get('personality'),
            speaking_style: formData.get('speaking_style')
        },
        evaluation_config: {
            story_weight: parseFloat(formData.get('story_weight')),
            dialogue_weight: parseFloat(formData.get('dialogue_weight')),
            tension_weight: parseFloat(formData.get('tension_weight'))
        },
        generation_config: {
            generation_style: formData.get('generation_style'),
            style_bias: formData.get('style_bias')
        },
        narration_config: {
            narrator_style: formData.get('narrator_style'),
            trigger_frequency: parseInt(formData.get('trigger_frequency'))
        }
    };
    
    // 发送请求
    const url = currentEditingAI ? `${API_BASE}/ai-configs/${currentEditingAI}` : `${API_BASE}/ai-configs`;
    const method = currentEditingAI ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(configData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id || data.message) {
            showNotification(currentEditingAI ? 'AI配置已更新' : 'AI配置已创建', 'success');
            bootstrap.Modal.getInstance(document.getElementById('aiConfigModal')).hide();
            loadAIConfigsData();
        } else {
            showNotification('保存失败: ' + (data.detail || '未知错误'), 'error');
        }
    })
    .catch(error => {
        console.error('保存AI配置失败:', error);
        showNotification('保存AI配置失败', 'error');
    });
}

// 场景NPC配置功能
function addSceneNPC() {
    const container = document.getElementById('scene-npcs-list');
    if (!container) {
        console.error('找不到 scene-npcs-list 容器');
        showNotification('找不到NPC配置容器', 'error');
        return;
    }
    console.log('正在添加NPC配置表单...');
    const npcElement = document.createElement('div');
    npcElement.className = 'scene-npc-item mb-3 p-3 border rounded';
    npcElement.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">NPC选择</label>
                    <select class="form-select" name="npc_id" required>
                        <option value="">请选择NPC</option>
                        <option value="sultan_001">苏丹王 阿里</option>
                        <option value="minister_001">宰相 哈桑</option>
                        <option value="general_001">将军 雷德</option>
                        <option value="blackduck_001">黑鸭会首领</option>
                    </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">角色定位</label>
                    <select class="form-select" name="role">
                        <option value="">请选择</option>
                        <option value="main_antagonist">主要对手</option>
                        <option value="supporter">支持者</option>
                        <option value="observer">观察者</option>
                        <option value="mediator">调解者</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">行为模式</label>
                    <select class="form-select" name="behavior">
                        <option value="neutral">中性</option>
                        <option value="aggressive">攻击性</option>
                        <option value="defensive">防御性</option>
                        <option value="cooperative">合作性</option>
                    </select>
                </div>
            </div>
            <div class="col-md-6">
                <div class="mb-3">
                    <label class="form-label">发言优先级</label>
                    <input type="number" class="form-control" name="speaking_priority" value="0" min="0" max="10">
                </div>
            </div>
        </div>
        <div class="mb-3">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" name="can_be_challenged" checked>
                <label class="form-check-label">
                    可被挑战战斗
                </label>
            </div>
        </div>
        <div class="d-flex justify-content-end">
            <button type="button" class="btn btn-danger btn-sm" onclick="removeSceneNPC(this)">
                <i class="fas fa-trash"></i> 移除
            </button>
        </div>
    `;
    container.appendChild(npcElement);
    console.log('NPC配置表单添加成功');
    showNotification('NPC配置表单已添加', 'success');
}

function removeSceneNPC(button) {
    button.closest('.scene-npc-item').remove();
}

function editSceneNPC(npcId) {
    showNotification('NPC配置编辑功能开发中', 'info');
}

// 场景保存功能
function saveScene() {
    const sceneData = {
        scene_id: document.querySelector('[name="scene_id"]').value,
        name: document.querySelector('[name="name"]').value,
        category: document.querySelector('[name="category"]').value,
        chapter: parseInt(document.querySelector('[name="chapter"]').value) || 1,
        description: document.querySelector('[name="description"]').value,
        location: document.querySelector('[name="location"]').value,
        weather: document.querySelector('[name="weather"]').value,
        time_of_day: document.querySelector('[name="time_of_day"]').value,
        narrator_prompt: document.querySelector('[name="narrator_prompt"]').value || '默认旁白提示词'
    };
    
    // 收集NPC配置
    const npcConfigs = [];
    const npcElements = document.querySelectorAll('.scene-npc-item');
    npcElements.forEach(element => {
        const npcConfig = {
            npc_id: element.querySelector('[name="npc_id"]').value,
            role: element.querySelector('[name="role"]').value,
            behavior: element.querySelector('[name="behavior"]').value,
            speaking_priority: parseInt(element.querySelector('[name="speaking_priority"]').value) || 0,
            can_be_challenged: element.querySelector('[name="can_be_challenged"]').checked
        };
        if (npcConfig.npc_id) {
            npcConfigs.push(npcConfig);
        }
    });
    
    // 收集奖励配置
    const rewardsConfig = {
        success_attribute_points: parseInt(document.querySelector('[name="success_attribute_points"]').value) || 15,
        success_experience: parseInt(document.querySelector('[name="success_experience"]').value) || 100,
        success_reputation: parseInt(document.querySelector('[name="success_reputation"]').value) || 10,
        success_gold: parseInt(document.querySelector('[name="success_gold"]').value) || 0,
        failure_reputation: parseInt(document.querySelector('[name="failure_reputation"]').value) || -5
    };
    
    // 验证必填字段
    if (!sceneData.scene_id || !sceneData.name || !sceneData.category || !sceneData.narrator_prompt) {
        showNotification('请填写所有必填字段', 'error');
        return;
    }
    
    // 发送创建场景请求
    fetch(`${API_BASE}/scenes/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(sceneData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.id) {
            showNotification('场景创建成功', 'success');
            
            // 关闭模态框
            const modal = bootstrap.Modal.getInstance(document.getElementById('sceneModal'));
            if (modal) {
                modal.hide();
            }
            
            // 刷新场景列表
            loadScenesData();
            
            // 如果有NPC配置，保存NPC配置
            if (npcConfigs.length > 0) {
                saveSceneNPCs(data.id, npcConfigs);
            }
            
            // 保存奖励配置
            saveSceneRewards(data.id, rewardsConfig);
        } else {
            showNotification('场景创建失败: ' + (data.detail || '未知错误'), 'error');
        }
    })
    .catch(error => {
        console.error('场景创建失败:', error);
        showNotification('场景创建失败', 'error');
    });
}

function saveSceneNPCs(sceneId, npcConfigs) {
    // 这里应该调用API保存NPC配置
    // 目前先显示提示
    showNotification(`已为场景 ${sceneId} 配置了 ${npcConfigs.length} 个NPC`, 'info');
}

function saveSceneRewards(sceneId, rewardsConfig) {
    fetch(`${API_BASE}/scenes/${sceneId}/rewards`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(rewardsConfig)
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            showNotification('奖励配置保存成功', 'success');
        }
    })
    .catch(error => {
        console.error('奖励配置保存失败:', error);
        showNotification('奖励配置保存失败', 'error');
    });
}

// ==================== 配置模板功能 ====================
function loadTemplatesData() {
    // 加载配置模板数据
    const templates = [
        {
            id: 'ai_narrator_template',
            name: '旁白AI模板',
            type: 'ai_config',
            description: '标准的场景旁白AI配置模板',
            config: {
                ai_type: 'narrator',
                base_prompt: '你是一个专业的游戏旁白AI，负责描述场景环境和氛围...',
                model_settings: {
                    temperature: 0.7,
                    max_tokens: 200
                }
            }
        },
        {
            id: 'scene_political_template',
            name: '政治场景模板',
            type: 'scene_config',
            description: '政治阴谋类场景的标准配置模板',
            config: {
                category: 'faction',
                scene_type: 'political',
                difficulty_level: 2,
                estimated_duration: 30
            }
        },
        {
            id: 'npc_minister_template',
            name: '朝廷大臣模板',
            type: 'npc_config',
            description: '朝廷大臣类NPC的标准配置模板',
            config: {
                faction: 'minister',
                npc_type: 'game_npc',
                tier: 'gold',
                intelligence: 15,
                charisma: 80,
                loyalty: 50
            }
        }
    ];
    
    renderTemplatesGrid(templates);
}

function renderTemplatesGrid(templates) {
    const container = document.getElementById('templates-container');
    if (!container) return;
    
    container.innerHTML = '';
    
    templates.forEach(template => {
        const card = document.createElement('div');
        card.className = 'col-md-4 mb-4';
        card.innerHTML = `
            <div class="card template-card">
                <div class="card-header">
                    <h6 class="card-title mb-0">
                        <i class="fas fa-${getTemplateIcon(template.type)}"></i>
                        ${template.name}
                    </h6>
                </div>
                <div class="card-body">
                    <p class="card-text">${template.description}</p>
                    <div class="mb-2">
                        <span class="badge bg-info">${template.type}</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">模板配置</small>
                        <small class="text-muted">${Object.keys(template.config).length} 项</small>
                    </div>
                </div>
                <div class="card-footer">
                    <div class="btn-group btn-group-sm w-100">
                        <button class="btn btn-outline-primary" onclick="useTemplate('${template.id}')">
                            <i class="fas fa-play"></i> 使用
                        </button>
                        <button class="btn btn-outline-info" onclick="previewTemplate('${template.id}')">
                            <i class="fas fa-eye"></i> 预览
                        </button>
                        <button class="btn btn-outline-warning" onclick="editTemplate('${template.id}')">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteTemplate('${template.id}')">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function getTemplateIcon(type) {
    const icons = {
        'ai_config': 'robot',
        'scene_config': 'theater-masks',
        'npc_config': 'user',
        'card_config': 'id-card'
    };
    return icons[type] || 'file';
}

function useTemplate(templateId) {
    // 使用模板创建新配置
    showNotification('正在应用模板...', 'info');
    
    // 根据模板类型跳转到相应的创建页面
    if (templateId.includes('ai_')) {
        showSection('ai-configs');
        showNotification('AI配置模板已应用', 'success');
    } else if (templateId.includes('scene_')) {
        showSection('scenes');
        showNotification('场景配置模板已应用', 'success');
    } else if (templateId.includes('npc_')) {
        showSection('npcs');
        showNotification('NPC配置模板已应用', 'success');
    }
}

function previewTemplate(templateId) {
    // 预览模板配置
    const template = {
        id: templateId,
        name: '旁白AI模板',
        config: {
            ai_type: 'narrator',
            base_prompt: '你是一个专业的游戏旁白AI，负责描述场景环境和氛围...',
            model_settings: {
                temperature: 0.7,
                max_tokens: 200
            }
        }
    };
    
    const content = `
        <div class="mb-3">
            <h6>模板配置预览</h6>
            <pre class="bg-light p-3 rounded" style="max-height: 400px; overflow-y: auto;">${JSON.stringify(template.config, null, 2)}</pre>
        </div>
    `;
    
    openModal('templatePreviewModal', `模板预览 - ${template.name}`, content);
}

let currentEditingTemplate = null;

function editTemplate(templateId) {
    // 编辑模板
    const modal = new bootstrap.Modal(document.getElementById('templateModal'));
    
    // 设置编辑模式
    currentEditingTemplate = templateId;
    
    // 加载模板数据（这里用模拟数据，实际应该从API获取）
    const templateData = {
        id: templateId,
        name: '旁白AI模板',
        type: 'ai_config',
        description: '标准的场景旁白AI配置模板',
        config: JSON.stringify({
            ai_type: 'narrator',
            base_prompt: '你是一个专业的游戏旁白AI，负责描述场景环境和氛围...',
            model_settings: {
                temperature: 0.7,
                max_tokens: 200
            }
        }, null, 2),
        version: '1.0',
        created_by: 'admin',
        is_public: true
    };
    
    // 填充表单数据
    document.querySelector('#templateModal [name="name"]').value = templateData.name;
    document.querySelector('#templateModal [name="type"]').value = templateData.type;
    document.querySelector('#templateModal [name="description"]').value = templateData.description;
    document.querySelector('#templateModal [name="config"]').value = templateData.config;
    document.querySelector('#templateModal [name="version"]').value = templateData.version;
    document.querySelector('#templateModal [name="created_by"]').value = templateData.created_by;
    document.querySelector('#templateModal [name="is_public"]').checked = templateData.is_public;
    
    // 更新模态框标题
    document.querySelector('#templateModal .modal-title').textContent = '编辑配置模板';
    
    modal.show();
}

function deleteTemplate(templateId) {
    if (confirm('确定要删除这个模板吗？')) {
        showNotification('模板已删除', 'success');
        loadTemplatesData();
    }
}

function openTemplateModal() {
    const modal = new bootstrap.Modal(document.getElementById('templateModal'));
    
    // 设置创建模式
    currentEditingTemplate = null;
    
    // 清空表单
    document.querySelector('#templateModal [name="name"]').value = '';
    document.querySelector('#templateModal [name="type"]').value = '';
    document.querySelector('#templateModal [name="description"]').value = '';
    document.querySelector('#templateModal [name="config"]').value = '';
    document.querySelector('#templateModal [name="version"]').value = '1.0';
    document.querySelector('#templateModal [name="created_by"]').value = '';
    document.querySelector('#templateModal [name="is_public"]').checked = true;
    
    // 更新模态框标题
    document.querySelector('#templateModal .modal-title').textContent = '新建配置模板';
    
    modal.show();
}

function saveTemplate() {
    const form = document.getElementById('template-form');
    const formData = new FormData(form);
    
    // 验证JSON格式
    try {
        JSON.parse(formData.get('config'));
    } catch (e) {
        showNotification('配置JSON格式错误: ' + e.message, 'error');
        return;
    }
    
    // 构建模板数据
    const templateData = {
        name: formData.get('name'),
        type: formData.get('type'),
        description: formData.get('description'),
        config: JSON.parse(formData.get('config')),
        version: formData.get('version'),
        created_by: formData.get('created_by'),
        is_public: formData.get('is_public') === 'on'
    };
    
    // 这里应该调用API保存模板
    // 现在只是模拟保存
    showNotification(currentEditingTemplate ? '模板已更新' : '模板已创建', 'success');
    bootstrap.Modal.getInstance(document.getElementById('templateModal')).hide();
    loadTemplatesData();
}

// ==================== 场景进入条件管理 ====================
function loadSceneEntryConditions(sceneId) {
    fetch(`${API_BASE}/scenes/${sceneId}/entry-conditions`)
        .then(response => response.json())
        .then(data => {
            if (data) {
                // 填充属性要求
                document.getElementById('player-reputation-min').value = data.player_reputation_min || '';
                document.getElementById('any-npc-int-min').value = data.any_npc_int_min || '';
                document.getElementById('total-str-min').value = data.total_str_min || '';
                document.getElementById('total-cha-min').value = data.total_cha_min || '';
                
                // 填充卡片要求
                populateCardRequirements(data.required_cards || []);
                populateOptionalCards(data.optional_cards || []);
                
                // 填充前置条件
                populateCompletedScenes(data.completed_scenes || []);
                document.getElementById('game-day-min').value = data.game_day_min || '';
                
                // 填充阵营关系
                populateFactionRelations(data.faction_relations || {});
                
                // 填充NPC限制
                document.getElementById('max-player-npcs').value = data.max_player_npcs || 3;
                document.getElementById('min-player-npcs').value = data.min_player_npcs || 1;
                
                // 填充特殊条件
                populateSpecialConditions(data.special_conditions || []);
            }
        })
        .catch(error => {
            console.error('加载场景进入条件失败:', error);
            showNotification('加载场景进入条件失败', 'error');
        });
}

function populateCardRequirements(cards) {
    const container = document.getElementById('required-cards-list');
    container.innerHTML = '';
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-requirement-item mb-2';
        cardElement.innerHTML = `
            <div class="row align-items-center">
                <div class="col-5">
                    <input type="text" class="form-control" placeholder="卡片ID" value="${card.card_id}" data-field="card_id">
                </div>
                <div class="col-3">
                    <input type="number" class="form-control" placeholder="数量" value="${card.quantity || 1}" data-field="quantity">
                </div>
                <div class="col-3">
                    <select class="form-select" data-field="consume">
                        <option value="true" ${card.consume ? 'selected' : ''}>消耗</option>
                        <option value="false" ${!card.consume ? 'selected' : ''}>不消耗</option>
                    </select>
                </div>
                <div class="col-1">
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeCardRequirement(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(cardElement);
    });
}

function addCardRequirement() {
    const container = document.getElementById('required-cards-list');
    const cardElement = document.createElement('div');
    cardElement.className = 'card-requirement-item mb-2';
    cardElement.innerHTML = `
        <div class="row align-items-center">
            <div class="col-5">
                <input type="text" class="form-control" placeholder="卡片ID" data-field="card_id">
            </div>
            <div class="col-3">
                <input type="number" class="form-control" placeholder="数量" value="1" data-field="quantity">
            </div>
            <div class="col-3">
                <select class="form-select" data-field="consume">
                    <option value="true">消耗</option>
                    <option value="false">不消耗</option>
                </select>
            </div>
            <div class="col-1">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeCardRequirement(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(cardElement);
}

function removeCardRequirement(button) {
    button.closest('.card-requirement-item').remove();
}

function populateOptionalCards(cards) {
    const container = document.getElementById('optional-cards-list');
    container.innerHTML = '';
    
    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'optional-card-item mb-2';
        cardElement.innerHTML = `
            <div class="row align-items-center">
                <div class="col-5">
                    <input type="text" class="form-control" placeholder="卡片ID" value="${card.card_id}" data-field="card_id">
                </div>
                <div class="col-6">
                    <input type="text" class="form-control" placeholder="效果" value="${card.effect || ''}" data-field="effect">
                </div>
                <div class="col-1">
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeOptionalCard(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(cardElement);
    });
}

function addOptionalCard() {
    const container = document.getElementById('optional-cards-list');
    const cardElement = document.createElement('div');
    cardElement.className = 'optional-card-item mb-2';
    cardElement.innerHTML = `
        <div class="row align-items-center">
            <div class="col-5">
                <input type="text" class="form-control" placeholder="卡片ID" data-field="card_id">
            </div>
            <div class="col-6">
                <input type="text" class="form-control" placeholder="效果" data-field="effect">
            </div>
            <div class="col-1">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeOptionalCard(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(cardElement);
}

function removeOptionalCard(button) {
    button.closest('.optional-card-item').remove();
}

function populateCompletedScenes(scenes) {
    const container = document.getElementById('completed-scenes-list');
    container.innerHTML = '';
    
    scenes.forEach(sceneId => {
        const sceneElement = document.createElement('div');
        sceneElement.className = 'completed-scene-item mb-2';
        sceneElement.innerHTML = `
            <div class="row align-items-center">
                <div class="col-10">
                    <input type="text" class="form-control" placeholder="场景ID" value="${sceneId}" data-field="scene_id">
                </div>
                <div class="col-2">
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeCompletedScene(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(sceneElement);
    });
}

function addCompletedScene() {
    const container = document.getElementById('completed-scenes-list');
    const sceneElement = document.createElement('div');
    sceneElement.className = 'completed-scene-item mb-2';
    sceneElement.innerHTML = `
        <div class="row align-items-center">
            <div class="col-10">
                <input type="text" class="form-control" placeholder="场景ID" data-field="scene_id">
            </div>
            <div class="col-2">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeCompletedScene(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(sceneElement);
}

function removeCompletedScene(button) {
    button.closest('.completed-scene-item').remove();
}

function populateFactionRelations(relations) {
    Object.keys(FACTIONS).forEach(faction => {
        const input = document.getElementById(`faction-${faction}-relation`);
        if (input) {
            input.value = relations[faction] || 0;
        }
    });
}

function populateSpecialConditions(conditions) {
    const container = document.getElementById('special-conditions-list');
    container.innerHTML = '';
    
    conditions.forEach(condition => {
        const conditionElement = document.createElement('div');
        conditionElement.className = 'special-condition-item mb-2';
        conditionElement.innerHTML = `
            <div class="row align-items-center">
                <div class="col-4">
                    <select class="form-select" data-field="type">
                        <option value="time_restriction" ${condition.type === 'time_restriction' ? 'selected' : ''}>时间限制</option>
                        <option value="weather_requirement" ${condition.type === 'weather_requirement' ? 'selected' : ''}>天气要求</option>
                        <option value="location_restriction" ${condition.type === 'location_restriction' ? 'selected' : ''}>位置限制</option>
                        <option value="custom" ${condition.type === 'custom' ? 'selected' : ''}>自定义</option>
                    </select>
                </div>
                <div class="col-7">
                    <input type="text" class="form-control" placeholder="条件值" value="${condition.value || ''}" data-field="value">
                </div>
                <div class="col-1">
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeSpecialCondition(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        container.appendChild(conditionElement);
    });
}

function addSpecialCondition() {
    const container = document.getElementById('special-conditions-list');
    const conditionElement = document.createElement('div');
    conditionElement.className = 'special-condition-item mb-2';
    conditionElement.innerHTML = `
        <div class="row align-items-center">
            <div class="col-4">
                <select class="form-select" data-field="type">
                    <option value="time_restriction">时间限制</option>
                    <option value="weather_requirement">天气要求</option>
                    <option value="location_restriction">位置限制</option>
                    <option value="custom">自定义</option>
                </select>
            </div>
            <div class="col-7">
                <input type="text" class="form-control" placeholder="条件值" data-field="value">
            </div>
            <div class="col-1">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeSpecialCondition(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(conditionElement);
}

function removeSpecialCondition(button) {
    button.closest('.special-condition-item').remove();
}

function saveEntryConditions() {
    const sceneId = currentEditingScene;
    if (!sceneId) {
        showNotification('请先选择场景', 'error');
        return;
    }
    
    const entryConditions = {
        player_reputation_min: parseInt(document.getElementById('player-reputation-min').value) || null,
        any_npc_int_min: parseInt(document.getElementById('any-npc-int-min').value) || null,
        total_str_min: parseInt(document.getElementById('total-str-min').value) || null,
        total_cha_min: parseInt(document.getElementById('total-cha-min').value) || null,
        game_day_min: parseInt(document.getElementById('game-day-min').value) || null,
        max_player_npcs: parseInt(document.getElementById('max-player-npcs').value) || 3,
        min_player_npcs: parseInt(document.getElementById('min-player-npcs').value) || 1,
        required_cards: collectCardRequirements(),
        optional_cards: collectOptionalCards(),
        completed_scenes: collectCompletedScenes(),
        faction_relations: collectFactionRelations(),
        special_conditions: collectSpecialConditions()
    };
    
    fetch(`${API_BASE}/scenes/${sceneId}/entry-conditions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(entryConditions)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('场景进入条件已保存', 'success');
        } else {
            showNotification('保存失败: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('保存场景进入条件失败:', error);
        showNotification('保存场景进入条件失败', 'error');
    });
}

function collectCardRequirements() {
    const requirements = [];
    const items = document.querySelectorAll('.card-requirement-item');
    
    items.forEach(item => {
        const cardId = item.querySelector('[data-field="card_id"]').value;
        const quantity = parseInt(item.querySelector('[data-field="quantity"]').value) || 1;
        const consume = item.querySelector('[data-field="consume"]').value === 'true';
        
        if (cardId.trim()) {
            requirements.push({
                card_id: cardId.trim(),
                quantity: quantity,
                consume: consume
            });
        }
    });
    
    return requirements;
}

function collectOptionalCards() {
    const cards = [];
    const items = document.querySelectorAll('.optional-card-item');
    
    items.forEach(item => {
        const cardId = item.querySelector('[data-field="card_id"]').value;
        const effect = item.querySelector('[data-field="effect"]').value;
        
        if (cardId.trim()) {
            cards.push({
                card_id: cardId.trim(),
                effect: effect.trim()
            });
        }
    });
    
    return cards;
}

function collectCompletedScenes() {
    const scenes = [];
    const items = document.querySelectorAll('.completed-scene-item');
    
    items.forEach(item => {
        const sceneId = item.querySelector('[data-field="scene_id"]').value;
        if (sceneId.trim()) {
            scenes.push(sceneId.trim());
        }
    });
    
    return scenes;
}

function collectFactionRelations() {
    const relations = {};
    
    Object.keys(FACTIONS).forEach(faction => {
        const input = document.getElementById(`faction-${faction}-relation`);
        if (input) {
            const value = parseInt(input.value);
            if (!isNaN(value)) {
                relations[faction] = value;
            }
        }
    });
    
    return relations;
}

function collectSpecialConditions() {
    const conditions = [];
    const items = document.querySelectorAll('.special-condition-item');
    
    items.forEach(item => {
        const type = item.querySelector('[data-field="type"]').value;
        const value = item.querySelector('[data-field="value"]').value;
        
        if (type && value.trim()) {
            conditions.push({
                type: type,
                value: value.trim()
            });
        }
    });
    
    return conditions;
}

// ==================== 场景动态事件管理 ====================
function loadSceneDynamicEvents(sceneId) {
    fetch(`${API_BASE}/scenes/${sceneId}/dynamic-events`)
        .then(response => response.json())
        .then(events => {
            renderDynamicEventsTable(events);
        })
        .catch(error => {
            console.error('加载场景动态事件失败:', error);
            showNotification('加载场景动态事件失败', 'error');
        });
}

function renderDynamicEventsTable(events) {
    const tbody = document.getElementById('dynamic-events-table-body');
    tbody.innerHTML = '';
    
    events.forEach(event => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${event.event_id}</td>
            <td>${event.event_name}</td>
            <td><span class="badge bg-info">${event.trigger_type}</span></td>
            <td>${event.trigger_value}</td>
            <td>${(event.trigger_probability * 100).toFixed(1)}%</td>
            <td>${event.current_triggers}/${event.max_triggers}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editDynamicEvent('${event.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteDynamicEvent('${event.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function createDynamicEvent() {
    const sceneId = currentEditingScene;
    if (!sceneId) {
        showNotification('请先选择场景', 'error');
        return;
    }
    
    const eventData = {
        event_id: document.getElementById('event-id').value,
        event_name: document.getElementById('event-name').value,
        event_description: document.getElementById('event-description').value,
        trigger_type: document.getElementById('trigger-type').value,
        trigger_value: document.getElementById('trigger-value').value,
        trigger_probability: parseFloat(document.getElementById('trigger-probability').value) || 1.0,
        max_triggers: parseInt(document.getElementById('max-triggers').value) || 1,
        event_effects: collectEventEffects(),
        event_choices: collectEventChoices()
    };
    
    fetch(`${API_BASE}/scenes/${sceneId}/dynamic-events`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(eventData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('动态事件已创建', 'success');
            loadSceneDynamicEvents(sceneId);
            resetDynamicEventForm();
        } else {
            showNotification('创建失败: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('创建动态事件失败:', error);
        showNotification('创建动态事件失败', 'error');
    });
}

function collectEventEffects() {
    const effects = {};
    const items = document.querySelectorAll('.event-effect-item');
    
    items.forEach(item => {
        const key = item.querySelector('[data-field="effect_key"]').value;
        const value = item.querySelector('[data-field="effect_value"]').value;
        
        if (key.trim() && value.trim()) {
            effects[key.trim()] = value.trim();
        }
    });
    
    return effects;
}

function collectEventChoices() {
    const choices = [];
    const items = document.querySelectorAll('.event-choice-item');
    
    items.forEach(item => {
        const text = item.querySelector('[data-field="choice_text"]').value;
        const effect = item.querySelector('[data-field="choice_effect"]').value;
        
        if (text.trim()) {
            choices.push({
                text: text.trim(),
                effect: effect.trim()
            });
        }
    });
    
    return choices;
}

function resetDynamicEventForm() {
    document.getElementById('event-id').value = '';
    document.getElementById('event-name').value = '';
    document.getElementById('event-description').value = '';
    document.getElementById('trigger-type').value = 'round_number';
    document.getElementById('trigger-value').value = '';
    document.getElementById('trigger-probability').value = '1.0';
    document.getElementById('max-triggers').value = '1';
    
    document.getElementById('event-effects-list').innerHTML = '';
    document.getElementById('event-choices-list').innerHTML = '';
}

function addEventEffect() {
    const container = document.getElementById('event-effects-list');
    const effectElement = document.createElement('div');
    effectElement.className = 'event-effect-item mb-2';
    effectElement.innerHTML = `
        <div class="row align-items-center">
            <div class="col-5">
                <input type="text" class="form-control" placeholder="效果键" data-field="effect_key">
            </div>
            <div class="col-6">
                <input type="text" class="form-control" placeholder="效果值" data-field="effect_value">
            </div>
            <div class="col-1">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeEventEffect(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(effectElement);
}

function removeEventEffect(button) {
    button.closest('.event-effect-item').remove();
}

function addEventChoice() {
    const container = document.getElementById('event-choices-list');
    const choiceElement = document.createElement('div');
    choiceElement.className = 'event-choice-item mb-2';
    choiceElement.innerHTML = `
        <div class="row align-items-center">
            <div class="col-5">
                <input type="text" class="form-control" placeholder="选项文本" data-field="choice_text">
            </div>
            <div class="col-6">
                <input type="text" class="form-control" placeholder="选项效果" data-field="choice_effect">
            </div>
            <div class="col-1">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeEventChoice(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(choiceElement);
}

function removeEventChoice(button) {
    button.closest('.event-choice-item').remove();
}

// ==================== 更多功能函数 ====================
function refreshAllData() {
    loadSectionData(currentSection);
    showNotification('数据已刷新', 'success');
}

function saveCurrentData() {
    showNotification('数据已保存', 'success');
}

function focusSearch() {
    const searchInput = document.querySelector(`#${currentSection}-search`);
    if (searchInput) {
        searchInput.focus();
    }
}

// 初始化图表
function initializeCharts() {
    // 如果需要图表功能，在这里初始化
}

// ==================== 属性点分配系统 ====================
function loadAttributePointPool(playerId) {
    fetch(`${API_BASE}/players/${playerId}/attribute-points`)
        .then(response => response.json())
        .then(data => {
            updateAttributePointDisplay(data);
        })
        .catch(error => {
            console.error('加载属性点池失败:', error);
            showNotification('加载属性点池失败', 'error');
        });
}

function updateAttributePointDisplay(data) {
    document.getElementById('available-points').textContent = data.available_points || 0;
    document.getElementById('total-earned').textContent = data.total_earned || 0;
    document.getElementById('total-spent').textContent = data.total_spent || 0;
    
    // 更新获得记录
    const recordsContainer = document.getElementById('earned-records');
    recordsContainer.innerHTML = '';
    
    (data.earned_records || []).forEach(record => {
        const recordElement = document.createElement('div');
        recordElement.className = 'earned-record mb-2 p-2 border rounded';
        recordElement.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <strong>${record.source_type}</strong>: ${record.source_name}
                    <small class="text-muted d-block">${new Date(record.earned_at * 1000).toLocaleString()}</small>
                </div>
                <div>
                    <span class="badge bg-success">+${record.points}</span>
                </div>
            </div>
            <div class="mt-1">
                <small class="text-muted">${record.description || ''}</small>
            </div>
        `;
        recordsContainer.appendChild(recordElement);
    });
}

function loadPlayerNPCsForAllocation() {
    const playerId = document.getElementById('player-select').value;
    if (!playerId) return;
    
    fetch(`${API_BASE}/players/${playerId}/npcs`)
        .then(response => response.json())
        .then(npcs => {
            const container = document.getElementById('player-npcs-allocation');
            container.innerHTML = '';
            
            npcs.forEach(npc => {
                const npcCard = createNPCAllocationCard(npc);
                container.appendChild(npcCard);
            });
        })
        .catch(error => {
            console.error('加载玩家NPC失败:', error);
            showNotification('加载玩家NPC失败', 'error');
        });
}

function createNPCAllocationCard(npc) {
    const card = document.createElement('div');
    card.className = 'col-md-6 col-lg-4 mb-3';
    card.innerHTML = `
        <div class="card npc-allocation-card">
            <div class="card-header bg-${getFactionColor(npc.faction)}">
                <h6 class="card-title mb-0">
                    <i class="${FACTIONS[npc.faction]?.icon || 'fas fa-user'}"></i>
                    ${npc.name}
                </h6>
            </div>
            <div class="card-body">
                <div class="row">
                    ${Object.keys(ATTRIBUTES).map(attr => `
                        <div class="col-6 mb-2">
                            <div class="d-flex align-items-center">
                                <span class="me-2" style="min-width: 40px;">${ATTRIBUTES[attr].abbr}:</span>
                                <button class="btn btn-sm btn-outline-danger me-1" onclick="adjustAttribute('${npc.id}', '${attr}', -1)">
                                    <i class="fas fa-minus"></i>
                                </button>
                                <span class="mx-2 fw-bold" id="npc-${npc.id}-${attr}">${npc[attr] || 0}</span>
                                <button class="btn btn-sm btn-outline-success ms-1" onclick="adjustAttribute('${npc.id}', '${attr}', 1)">
                                    <i class="fas fa-plus"></i>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="mt-3">
                    <div class="d-flex justify-content-between align-items-center">
                        <span>已分配点数:</span>
                        <span class="fw-bold" id="npc-${npc.id}-allocated">0</span>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span>等级:</span>
                        <span class="fw-bold">${npc.level || 1}</span>
                    </div>
                </div>
            </div>
            <div class="card-footer">
                <button class="btn btn-primary btn-sm" onclick="saveNPCAttributes('${npc.id}')">
                    <i class="fas fa-save"></i> 保存属性
                </button>
                <button class="btn btn-secondary btn-sm ms-2" onclick="resetNPCAttributes('${npc.id}')">
                    <i class="fas fa-undo"></i> 重置
                </button>
            </div>
        </div>
    `;
    return card;
}

function adjustAttribute(npcId, attribute, delta) {
    const currentElement = document.getElementById(`npc-${npcId}-${attribute}`);
    const currentValue = parseInt(currentElement.textContent) || 0;
    const newValue = Math.max(0, Math.min(ATTRIBUTES[attribute].range[1], currentValue + delta));
    
    // 检查可用点数
    const availablePoints = parseInt(document.getElementById('available-points').textContent);
    if (delta > 0 && availablePoints <= 0) {
        showNotification('可用属性点不足', 'warning');
        return;
    }
    
    currentElement.textContent = newValue;
    
    // 更新可用点数
    const newAvailablePoints = availablePoints - delta;
    document.getElementById('available-points').textContent = newAvailablePoints;
    
    // 更新已分配点数
    updateAllocatedPoints(npcId);
}

function updateAllocatedPoints(npcId) {
    let totalAllocated = 0;
    Object.keys(ATTRIBUTES).forEach(attr => {
        const value = parseInt(document.getElementById(`npc-${npcId}-${attr}`).textContent) || 0;
        totalAllocated += value;
    });
    
    document.getElementById(`npc-${npcId}-allocated`).textContent = totalAllocated;
}

function saveNPCAttributes(npcId) {
    const attributes = {};
    Object.keys(ATTRIBUTES).forEach(attr => {
        attributes[attr] = parseInt(document.getElementById(`npc-${npcId}-${attr}`).textContent) || 0;
    });
    
    fetch(`${API_BASE}/npcs/${npcId}/attributes`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(attributes)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('NPC属性已保存', 'success');
            // 重新加载属性点池
            const playerId = document.getElementById('player-select').value;
            loadAttributePointPool(playerId);
        } else {
            showNotification('保存失败: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('保存NPC属性失败:', error);
        showNotification('保存NPC属性失败', 'error');
    });
}

function resetNPCAttributes(npcId) {
    // 重置NPC属性到初始值
    fetch(`${API_BASE}/npcs/${npcId}/attributes/reset`, {
        method: 'POST'
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('NPC属性已重置', 'success');
            // 重新加载数据
            const playerId = document.getElementById('player-select').value;
            loadAttributePointPool(playerId);
            loadPlayerNPCsForAllocation();
        } else {
            showNotification('重置失败: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('重置NPC属性失败:', error);
        showNotification('重置NPC属性失败', 'error');
    });
}

// ==================== 卡片联动效果管理 ====================
function loadCardSynergies() {
    fetch(`${API_BASE}/cards/synergies`)
        .then(response => response.json())
        .then(synergies => {
            renderCardSynergiesTable(synergies);
        })
        .catch(error => {
            console.error('加载卡片联动效果失败:', error);
            showNotification('加载卡片联动效果失败', 'error');
        });
}

function renderCardSynergiesTable(synergies) {
    const tbody = document.getElementById('card-synergies-table-body');
    tbody.innerHTML = '';
    
    synergies.forEach(synergy => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${synergy.synergy_name}</td>
            <td>
                ${synergy.required_cards.map(card => 
                    `<span class="badge bg-secondary me-1">${card}</span>`
                ).join('')}
            </td>
            <td>${synergy.synergy_effect}</td>
            <td>${synergy.effect_value}</td>
            <td><span class="badge bg-${synergy.is_active ? 'success' : 'danger'}">${synergy.is_active ? '激活' : '禁用'}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editCardSynergy('${synergy.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteCardSynergy('${synergy.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function createCardSynergy() {
    const synergyData = {
        synergy_name: document.getElementById('synergy-name').value,
        required_cards: collectRequiredCards(),
        synergy_effect: document.getElementById('synergy-effect').value,
        effect_value: document.getElementById('effect-value').value,
        trigger_conditions: collectTriggerConditions(),
        is_active: document.getElementById('synergy-active').checked
    };
    
    fetch(`${API_BASE}/cards/synergies`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(synergyData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('卡片联动效果已创建', 'success');
            loadCardSynergies();
            resetCardSynergyForm();
        } else {
            showNotification('创建失败: ' + data.message, 'error');
        }
    })
    .catch(error => {
        console.error('创建卡片联动效果失败:', error);
        showNotification('创建卡片联动效果失败', 'error');
    });
}

function collectRequiredCards() {
    const cards = [];
    const items = document.querySelectorAll('.required-card-item');
    
    items.forEach(item => {
        const cardId = item.querySelector('[data-field="card_id"]').value;
        if (cardId.trim()) {
            cards.push(cardId.trim());
        }
    });
    
    return cards;
}

function collectTriggerConditions() {
    const conditions = {};
    const items = document.querySelectorAll('.trigger-condition-item');
    
    items.forEach(item => {
        const key = item.querySelector('[data-field="condition_key"]').value;
        const value = item.querySelector('[data-field="condition_value"]').value;
        
        if (key.trim() && value.trim()) {
            conditions[key.trim()] = value.trim();
        }
    });
    
    return conditions;
}

function addRequiredCard() {
    const container = document.getElementById('required-cards-synergy');
    const cardElement = document.createElement('div');
    cardElement.className = 'required-card-item mb-2';
    cardElement.innerHTML = `
        <div class="row align-items-center">
            <div class="col-10">
                <input type="text" class="form-control" placeholder="卡片ID" data-field="card_id">
            </div>
            <div class="col-2">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeRequiredCard(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(cardElement);
}

function removeRequiredCard(button) {
    button.closest('.required-card-item').remove();
}

function addTriggerCondition() {
    const container = document.getElementById('trigger-conditions-synergy');
    const conditionElement = document.createElement('div');
    conditionElement.className = 'trigger-condition-item mb-2';
    conditionElement.innerHTML = `
        <div class="row align-items-center">
            <div class="col-5">
                <input type="text" class="form-control" placeholder="条件键" data-field="condition_key">
            </div>
            <div class="col-6">
                <input type="text" class="form-control" placeholder="条件值" data-field="condition_value">
            </div>
            <div class="col-1">
                <button type="button" class="btn btn-danger btn-sm" onclick="removeTriggerCondition(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `;
    container.appendChild(conditionElement);
}

function removeTriggerCondition(button) {
    button.closest('.trigger-condition-item').remove();
}

function resetCardSynergyForm() {
    document.getElementById('synergy-name').value = '';
    document.getElementById('synergy-effect').value = '';
    document.getElementById('effect-value').value = '';
    document.getElementById('synergy-active').checked = true;
    
    document.getElementById('required-cards-synergy').innerHTML = '';
    document.getElementById('trigger-conditions-synergy').innerHTML = '';
}

// ==================== 其他部分的加载函数 ====================
function loadAIConfigsData() {
    fetch(`${API_BASE}/ai-configs`)
        .then(response => response.json())
        .then(configs => {
            renderAIConfigsTable(configs);
        })
        .catch(error => {
            console.error('加载AI配置失败:', error);
            showNotification('加载AI配置失败', 'error');
        });
}

function renderAIConfigsTable(configs) {
    const tbody = document.getElementById('ai-configs-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    configs.forEach(config => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${config.config_id}</td>
            <td>${config.name}</td>
            <td><span class="badge bg-info">${config.ai_type}</span></td>
            <td>${config.version}</td>
            <td><span class="badge bg-${config.is_active ? 'success' : 'danger'}">${config.is_active ? '激活' : '禁用'}</span></td>
            <td>${config.created_by || 'System'}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editAIConfig('${config.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="testAIConfig('${config.id}')">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-outline-warning" onclick="viewAIConfig('${config.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteAIConfig('${config.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadPlayersData() {
    fetch(`${API_BASE}/players`)
        .then(response => response.json())
        .then(players => {
            renderPlayersTable(players);
        })
        .catch(error => {
            console.error('加载玩家数据失败:', error);
            showNotification('加载玩家数据失败', 'error');
        });
}

function renderPlayersTable(players) {
    const tbody = document.getElementById('players-table-body');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    players.forEach(player => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${player.username}</td>
            <td>${player.level}</td>
            <td>${player.reputation}</td>
            <td>${player.current_chapter}</td>
            <td>${player.game_day}</td>
            <td>${player.gold}</td>
            <td><span class="badge bg-${player.is_active ? 'success' : 'danger'}">${player.is_active ? '激活' : '禁用'}</span></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editPlayer('${player.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="viewPlayerDetails('${player.id}')">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deletePlayer('${player.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function loadFactionsData() {
    // 加载阵营数据和关系矩阵
    fetch(`${API_BASE}/factions/relations`)
        .then(response => response.json())
        .then(data => {
            renderFactionRelationsMatrix(data);
        })
        .catch(error => {
            console.error('加载阵营数据失败:', error);
            showNotification('加载阵营数据失败', 'error');
        });
}

function renderFactionRelationsMatrix(data) {
    const matrix = document.getElementById('faction-relations-matrix');
    if (!matrix) return;
    
    matrix.innerHTML = '';
    
    const factionKeys = Object.keys(FACTIONS);
    
    // 创建表头
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = '<th></th>' + factionKeys.map(faction => 
        `<th class="text-center">${FACTIONS[faction].name}</th>`
    ).join('');
    matrix.appendChild(headerRow);
    
    // 创建数据行
    factionKeys.forEach(faction1 => {
        const row = document.createElement('tr');
        let rowHTML = `<th>${FACTIONS[faction1].name}</th>`;
        
        factionKeys.forEach(faction2 => {
            if (faction1 === faction2) {
                rowHTML += '<td class="text-center">-</td>';
            } else {
                const relation = data.relations?.[faction1]?.[faction2] || 0;
                const colorClass = relation > 0 ? 'text-success' : relation < 0 ? 'text-danger' : 'text-muted';
                rowHTML += `<td class="text-center ${colorClass}">${relation}</td>`;
            }
        });
        
        row.innerHTML = rowHTML;
        matrix.appendChild(row);
    });
}

function loadBalanceData() {
    // 加载平衡数据和分析
    fetch(`${API_BASE}/balance/analysis`)
        .then(response => response.json())
        .then(data => {
            updateBalanceDisplay(data);
        })
        .catch(error => {
            console.error('加载平衡数据失败:', error);
            showNotification('加载平衡数据失败', 'error');
        });
}

function updateBalanceDisplay(data) {
    // 更新平衡性分析显示
    const container = document.getElementById('balance-analysis');
    if (!container) return;
    
    container.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6>场景平衡性</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <span>平均成功率:</span>
                            <span class="float-end">${(data.scene_balance?.avg_success_rate * 100 || 0).toFixed(1)}%</span>
                        </div>
                        <div class="mb-2">
                            <span>难度分布:</span>
                            <span class="float-end">${data.scene_balance?.difficulty_distribution || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-header">
                        <h6>卡片平衡性</h6>
                    </div>
                    <div class="card-body">
                        <div class="mb-2">
                            <span>使用率分布:</span>
                            <span class="float-end">${data.card_balance?.usage_distribution || 'N/A'}</span>
                        </div>
                        <div class="mb-2">
                            <span>稀有度平衡:</span>
                            <span class="float-end">${data.card_balance?.rarity_balance || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadAnalyticsData() {
    // 加载分析数据
    fetch(`${API_BASE}/analytics/dashboard`)
        .then(response => response.json())
        .then(data => {
            updateAnalyticsDisplay(data);
        })
        .catch(error => {
            console.error('加载分析数据失败:', error);
            showNotification('加载分析数据失败', 'error');
        });
}

function updateAnalyticsDisplay(data) {
    // 更新分析数据显示
    const container = document.getElementById('analytics-display');
    if (!container) return;
    
    // 这里可以添加图表和统计显示
    console.log('Analytics data loaded:', data);
}

function loadSystemData() {
    // 加载系统数据
    fetch(`${API_BASE}/system/status`)
        .then(response => response.json())
        .then(data => {
            updateSystemStatus(data);
        })
        .catch(error => {
            console.error('加载系统数据失败:', error);
            showNotification('加载系统数据失败', 'error');
        });
}

function updateSystemStatus(data) {
    // 更新系统状态显示
    const container = document.getElementById('system-status');
    if (!container) return;
    
    container.innerHTML = `
        <div class="row">
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body text-center">
                        <h5>数据库状态</h5>
                        <span class="badge bg-${data.database_status === 'healthy' ? 'success' : 'danger'}">
                            ${data.database_status || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body text-center">
                        <h5>API状态</h5>
                        <span class="badge bg-${data.api_status === 'healthy' ? 'success' : 'danger'}">
                            ${data.api_status || 'Unknown'}
                        </span>
                    </div>
                </div>
            </div>
            <div class="col-md-4">
                <div class="card">
                    <div class="card-body text-center">
                        <h5>系统负载</h5>
                        <span class="badge bg-${data.system_load < 0.8 ? 'success' : 'warning'}">
                            ${((data.system_load || 0) * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateFactionOverview() {
    // 更新阵营概览
    Object.keys(FACTIONS).forEach(faction => {
        const factionData = factionData[faction] || {};
        const element = document.getElementById(`faction-${faction}-overview`);
        if (element) {
            element.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="${FACTIONS[faction].icon} me-2" style="color: ${FACTIONS[faction].color}"></i>
                    <div>
                        <h6 class="mb-0">${FACTIONS[faction].name}</h6>
                        <small class="text-muted">${factionData.npc_count || 0} NPCs</small>
                    </div>
                </div>
            `;
        }
    });
}

// 导出主要函数以供外部使用
window.AdminApp = {
    showSection,
    loadSectionData,
    showNotification,
    openModal,
    refreshAllData,
    saveCurrentData,
    // 操作函数
    editScene,
    editNPC,
    editCard,
    editAIConfig,
    deleteScene,
    deleteNPC,
    deleteCard,
    deleteAIConfig,
    testAIConfig
};

// 表单处理函数
function handleFormSubmit(form) {
    const formId = form.id;
    
    switch(formId) {
        case 'scene-form':
            handleSceneFormSubmit(form);
            break;
        case 'npc-form':
            handleNPCFormSubmit(form);
            break;
        case 'card-form':
            handleCardFormSubmit(form);
            break;
        case 'entry-condition-form':
            console.log('场景进入条件表单提交');
            showNotification('场景进入条件功能开发中', 'info');
            break;
        case 'dynamic-event-form':
            console.log('动态事件表单提交');
            showNotification('动态事件功能开发中', 'info');
            break;
        case 'card-synergy-form':
            console.log('卡片联动表单提交');
            showNotification('卡片联动功能开发中', 'info');
            break;
        case 'npc-conversion-form':
            console.log('NPC转化表单提交');
            showNotification('NPC转化功能开发中', 'info');
            break;
        // 其他表单...
    }
}

function handleSceneFormSubmit(form) {
    // 实现场景表单提交
    console.log('场景表单提交');
    showNotification('场景表单提交功能开发中', 'info');
}

function handleNPCFormSubmit(form) {
    // 实现NPC表单提交
    console.log('NPC表单提交');
    showNotification('NPC表单提交功能开发中', 'info');
}

function handleCardFormSubmit(form) {
    // 实现卡片表单提交
    console.log('卡片表单提交');
    showNotification('卡片表单提交功能开发中', 'info');
}