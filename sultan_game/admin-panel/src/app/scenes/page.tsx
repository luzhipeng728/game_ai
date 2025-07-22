'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { ToastContainer, useToast } from '@/components/Toast';
import { Plus, Edit, Trash2, Eye, Settings, Award, ChevronDown, ChevronRight, CreditCard, FileText, Gift, Monitor, Users, X } from 'lucide-react';
import { sceneAPI, npcAPI } from '@/lib/api';

interface Scene {
  id: string;
  scene_id: string;
  name: string;
  category: string;
  description?: string;
  status: string;
  npc_count: number;
  is_active: boolean;
  created_at?: number;
  updated_at?: number;
}

export default function ScenesPage() {
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScene, setEditingScene] = useState<Scene | null>(null);
  const [expandedScenes, setExpandedScenes] = useState<Set<string>>(new Set());
  const [sceneDetails, setSceneDetails] = useState<Record<string, { npcs: any[], rewards: any, extendedRewards: any, requirements: any, cardBindings: any[], availableNPCs: any[], availableCards: any[] }>>({});
  const { messages, removeToast, toast } = useToast();
  const [formData, setFormData] = useState({
    scene_id: '',
    name: '',
    category: 'main_story',
    description: '',
    narrator_prompt: '',
    chapter: 1,
    location: '',
    time_of_day: 'morning',
    weather: 'clear',
    card_count: 0,
    prerequisite_scenes: [] as string[],
    days_required: 0
  });
  
  // NPC配置相关状态
  const [showNPCModal, setShowNPCModal] = useState(false);
  const [currentSceneForNPC, setCurrentSceneForNPC] = useState<Scene | null>(null);
  const [sceneNPCs, setSceneNPCs] = useState<any[]>([]);
  const [sceneCardBindings, setSceneCardBindings] = useState<any[]>([]);
  const [availableNPCs, setAvailableNPCs] = useState<any[]>([]);
  
  // 奖励配置相关状态
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [currentSceneForReward, setCurrentSceneForReward] = useState<Scene | null>(null);
  const [rewardData, setRewardData] = useState({
    success_attribute_points: 0,
    success_experience: 0,
    success_reputation: 0,
    success_gold: 0,
    failure_reputation: 0
  });
  
  // 扩展奖励配置相关状态
  const [showExtendedRewardModal, setShowExtendedRewardModal] = useState(false);
  const [extendedRewardData, setExtendedRewardData] = useState({
    success_attribute_points: 0,
    success_experience: 0,
    success_reputation: 0,
    success_gold: 0,
    failure_reputation: 0,
    failure_gold: 0,
    failure_attribute_penalty: 0,
    reward_cards: [],
    card_reward_probability: {},
    reward_npcs: [],
    npc_reward_conditions: {},
    special_rewards: {},
    unlock_content: [],
    perfect_completion_bonus: {},
    time_bonus: {},
    efficiency_bonus: {},
    dynamic_reward_formula: '',
    performance_multiplier: 1.0
  });
  
  // 场景要求配置相关状态（简化版-只有属性要求）
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [currentSceneForRequirements, setCurrentSceneForRequirements] = useState<Scene | null>(null);
  const [attributeRequirements, setAttributeRequirements] = useState({
    strength: 0,        // 力量
    defense: 0,         // 防御
    intelligence: 0,    // 智力
    charisma: 0,        // 魅力
    loyalty: 0,         // 忠诚
    influence: 0,       // 影响力
    command: 0,         // 指挥力
    stealth: 0,         // 隐秘
    health: 0           // 生命值
  });
  
  // 卡片绑定配置相关状态
  const [showCardBindingModal, setShowCardBindingModal] = useState(false);
  const [currentSceneForCardBinding, setCurrentSceneForCardBinding] = useState<Scene | null>(null);
  const [cardBindings, setCardBindings] = useState<any[]>([]);
  const [availableCards, setAvailableCards] = useState<any[]>([]);
  const [availablePlayerNPCs, setAvailablePlayerNPCs] = useState<any[]>([]);
  
  // 新卡片绑定状态
  const [newCardBinding, setNewCardBinding] = useState({
    card_id: '',
    binding_type: 'optional',
    max_uses_per_scene: 1,
    cooldown_rounds: 0,
    scene_effect_modifier: 1.0,
    special_effects: {},
    unlock_conditions: {},
    visibility_conditions: {},
    usage_reward_bonus: {}
  });

  // 场景展示配置相关状态
  const [showDisplayConfigModal, setShowDisplayConfigModal] = useState(false);
  const [currentSceneForDisplayConfig, setCurrentSceneForDisplayConfig] = useState<Scene | null>(null);
  const [displayConfig, setDisplayConfig] = useState({
    card_count: 0,
    prerequisite_scenes: [] as string[],
    days_required: 0
  });
  const [allScenesList, setAllScenesList] = useState<any[]>([]);
  
  // 统一配置弹窗相关状态
  const [showUnifiedConfigModal, setShowUnifiedConfigModal] = useState(false);
  const [currentSceneForUnifiedConfig, setCurrentSceneForUnifiedConfig] = useState<Scene | null>(null);
  const [activeConfigTab, setActiveConfigTab] = useState('display'); // display, requirements, npcs, cards, rewards

  useEffect(() => {
    fetchScenes();
  }, []);

  const fetchScenes = async () => {
    try {
      const response = await sceneAPI.getScenes();
      setScenes(response.data);
    } catch (error) {
      console.error('获取场景列表失败:', error);
      toast.error('获取场景列表失败', '请检查API服务是否正常运行');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingScene) {
        await sceneAPI.updateScene(editingScene.id, formData);
        toast.success('场景更新成功');
      } else {
        await sceneAPI.createScene(formData);
        toast.success('场景创建成功');
      }
      setShowModal(false);
      setEditingScene(null);
      resetForm();
      fetchScenes();
    } catch (error) {
      console.error('操作失败:', error);
      toast.error('操作失败', '请检查输入数据');
    }
  };

  const handleEdit = (scene: Scene) => {
    setEditingScene(scene);
    setFormData({
      scene_id: scene.scene_id,
      name: scene.name,
      category: scene.category,
      description: scene.description || '',
      narrator_prompt: '',
      chapter: 1,
      location: '',
      time_of_day: 'morning',
      weather: 'clear',
      card_count: (scene as any).card_count || 0,
      prerequisite_scenes: (scene as any).prerequisite_scenes || [],
      days_required: (scene as any).days_required || 0
    });
    setShowModal(true);
  };

  const handleDelete = async (scene: Scene) => {
    if (confirm(`确定要删除场景 "${scene.name}" 吗？`)) {
      try {
        await sceneAPI.deleteScene(scene.id);
        toast.success('场景删除成功');
        fetchScenes();
      } catch (error) {
        console.error('删除失败:', error);
        toast.error('删除失败', '请稍后重试');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      scene_id: '',
      name: '',
      category: 'main_story',
      description: '',
      narrator_prompt: '',
      chapter: 1,
      location: '',
      time_of_day: 'morning',
      weather: 'clear',
      card_count: 0,
      prerequisite_scenes: [],
      days_required: 0
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryText = (category: string) => {
    const categories: Record<string, string> = {
      main_story: '主线剧情',
      side_quest: '支线任务',
      faction: '阵营',
      random: '随机'
    };
    return categories[category] || category;
  };

  // 切换场景详情展开状态
  const toggleSceneExpansion = async (sceneId: string) => {
    const newExpanded = new Set(expandedScenes);
    
    if (expandedScenes.has(sceneId)) {
      newExpanded.delete(sceneId);
    } else {
      newExpanded.add(sceneId);
      
      // 如果还没有加载过详情，则加载
      if (!sceneDetails[sceneId]) {
        try {
          const [npcsResponse, rewardsResponse, extendedRewardsResponse, requirementsResponse, cardBindingsResponse, availableNPCsResponse, availableCardsResponse] = await Promise.all([
            sceneAPI.getSceneNPCs(sceneId),
            sceneAPI.getSceneRewards(sceneId),
            sceneAPI.getSceneExtendedRewards(sceneId),
            sceneAPI.getSceneRequirements(sceneId),
            sceneAPI.getSceneCardBindings(sceneId),
            sceneAPI.getAvailablePlayerNPCs(),
            sceneAPI.getAvailableCards()
          ]);
          
          setSceneDetails(prev => ({
            ...prev,
            [sceneId]: {
              npcs: npcsResponse.data,
              rewards: rewardsResponse.data,
              extendedRewards: extendedRewardsResponse.data,
              requirements: requirementsResponse.data,
              cardBindings: cardBindingsResponse.data,
              availableNPCs: availableNPCsResponse.data,
              availableCards: availableCardsResponse.data
            }
          }));
        } catch (error) {
          console.error('加载场景详情失败:', error);
          toast.error('加载场景详情失败', '请稍后重试');
        }
      }
    }
    
    setExpandedScenes(newExpanded);
  };
  
  // 处理NPC配置
  const handleNPCConfig = async (scene: Scene) => {
    setCurrentSceneForNPC(scene);
    try {
      const [npcsResponse, availableResponse] = await Promise.all([
        sceneAPI.getSceneNPCs(scene.id),
        npcAPI.getNPCs()
      ]);
      setSceneNPCs(npcsResponse.data);
      setAvailableNPCs(availableResponse.data);
      setShowNPCModal(true);
    } catch (error) {
      console.error('获取NPC配置失败:', error);
      toast.error('获取NPC配置失败', '请稍后重试');
    }
  };
  
  // 处理奖励配置 - 整合基础和扩展奖励
  const handleRewardConfig = async (scene: Scene) => {
    setCurrentSceneForReward(scene);
    try {
      const [basicResponse, extendedResponse, cardsResponse, npcsResponse] = await Promise.all([
        sceneAPI.getSceneRewards(scene.id),
        sceneAPI.getSceneExtendedRewards(scene.id),
        sceneAPI.getAvailableCards(),
        sceneAPI.getAvailablePlayerNPCs()
      ]);
      
      setRewardData(basicResponse.data);
      setExtendedRewardData(extendedResponse.data);
      setAvailableCards(cardsResponse.data);
      setAvailablePlayerNPCs(npcsResponse.data);
      setShowRewardModal(true);
    } catch (error) {
      console.error('获取奖励配置失败:', error);
      // 如果没有配置，使用默认值
      setRewardData({
        success_attribute_points: 0,
        success_experience: 0,
        success_reputation: 0,
        success_gold: 0,
        failure_reputation: 0
      });
      setExtendedRewardData({
        success_attribute_points: 0,
        success_experience: 0,
        success_reputation: 0,
        success_gold: 0,
        failure_reputation: 0,
        failure_gold: 0,
        failure_attribute_penalty: 0,
        reward_cards: [],
        reward_npcs: [],
        special_rewards: {},
        unlock_content: [],
        perfect_completion_bonus: {},
        performance_multiplier: 1.0
      });
      
      // 即使奖励配置失败，也尝试加载可用的卡片和NPC数据
      try {
        const [cardsResponse, npcsResponse] = await Promise.all([
          sceneAPI.getAvailableCards(),
          sceneAPI.getAvailablePlayerNPCs()
        ]);
        setAvailableCards(cardsResponse.data);
        setAvailablePlayerNPCs(npcsResponse.data);
      } catch (dataError) {
        console.error('获取可用卡片和NPC数据失败:', dataError);
        setAvailableCards([]);
        setAvailablePlayerNPCs([]);
      }
      
      setShowRewardModal(true);
    }
  };
  
  // 保存奖励配置 - 同时保存基础和扩展奖励
  const handleSaveRewards = async () => {
    if (!currentSceneForReward) return;
    
    try {
      await Promise.all([
        sceneAPI.saveSceneRewards(currentSceneForReward.id, rewardData),
        sceneAPI.saveSceneExtendedRewards(currentSceneForReward.id, extendedRewardData)
      ]);
      toast.success('奖励配置保存成功');
      setShowRewardModal(false);
      // 重新获取场景列表以更新显示
      fetchScenes();
    } catch (error) {
      console.error('保存奖励配置失败:', error);
      toast.error('保存奖励配置失败', '请稍后重试');
    }
  };
  
  // 添加NPC奖励
  const handleAddNPCReward = () => {
    const newNPCReward = {
      npc_id: '',
      quantity: 1,
      probability: 1.0
    };
    setExtendedRewardData({
      ...extendedRewardData,
      reward_npcs: [...(extendedRewardData.reward_npcs || []), newNPCReward]
    });
  };
  
  // 移除NPC奖励
  const handleRemoveNPCReward = (index: number) => {
    const newRewardNPCs = (extendedRewardData.reward_npcs || []).filter((_, i) => i !== index);
    setExtendedRewardData({
      ...extendedRewardData,
      reward_npcs: newRewardNPCs
    });
  };
  
  // 更新NPC奖励
  const handleUpdateNPCReward = (index: number, field: string, value: any) => {
    const newRewardNPCs = [...(extendedRewardData.reward_npcs || [])];
    newRewardNPCs[index] = {
      ...newRewardNPCs[index],
      [field]: value
    };
    setExtendedRewardData({
      ...extendedRewardData,
      reward_npcs: newRewardNPCs
    });
  };
  
  // 添加卡片奖励
  const handleAddCardReward = () => {
    const newCardReward = {
      card_id: '',
      quantity: 1,
      probability: 1.0
    };
    setExtendedRewardData({
      ...extendedRewardData,
      reward_cards: [...(extendedRewardData.reward_cards || []), newCardReward]
    });
  };
  
  // 移除卡片奖励
  const handleRemoveCardReward = (index: number) => {
    const newRewardCards = (extendedRewardData.reward_cards || []).filter((_, i) => i !== index);
    setExtendedRewardData({
      ...extendedRewardData,
      reward_cards: newRewardCards
    });
  };
  
  // 更新卡片奖励
  const handleUpdateCardReward = (index: number, field: string, value: any) => {
    const newRewardCards = [...(extendedRewardData.reward_cards || [])];
    newRewardCards[index] = {
      ...newRewardCards[index],
      [field]: value
    };
    setExtendedRewardData({
      ...extendedRewardData,
      reward_cards: newRewardCards
    });
  };
  
  // 处理场景要求配置
  const handleRequirementsConfig = async (scene: Scene) => {
    setCurrentSceneForRequirements(scene);
    try {
      const response = await sceneAPI.getSceneRequirements(scene.id);
      setAttributeRequirements(response.data);
      setShowRequirementsModal(true);
    } catch (error) {
      console.error('获取场景要求配置失败:', error);
      setAttributeRequirements({
        strength: 0,
        defense: 0,
        intelligence: 0,
        charisma: 0,
        loyalty: 0,
        influence: 0,
        command: 0,
        stealth: 0,
        health: 0
      });
      setShowRequirementsModal(true);
    }
  };
  
  // 保存场景属性要求
  const handleSaveRequirements = async () => {
    if (!currentSceneForRequirements) {
      toast.error('未选择场景');
      return;
    }
    
    try {
      await sceneAPI.saveSceneRequirements(currentSceneForRequirements.id, attributeRequirements);
      toast.success('场景属性要求保存成功');
      setShowRequirementsModal(false);
    } catch (error) {
      console.error('保存场景属性要求失败:', error);
      toast.error('保存失败');
    }
  };
  
  // 处理卡片绑定配置
  const handleCardBindingConfig = async (scene: Scene) => {
    setCurrentSceneForCardBinding(scene);
    try {
      const [bindingsResponse, cardsResponse] = await Promise.all([
        sceneAPI.getSceneCardBindings(scene.id),
        sceneAPI.getAvailableCards()
      ]);
      setCardBindings(bindingsResponse.data);
      setAvailableCards(cardsResponse.data);
      setShowCardBindingModal(true);
    } catch (error) {
      console.error('获取卡片绑定配置失败:', error);
      setCardBindings([]);
      
      // 即使绑定配置失败，也尝试加载可用卡片数据
      try {
        const cardsResponse = await sceneAPI.getAvailableCards();
        setAvailableCards(cardsResponse.data);
      } catch (dataError) {
        console.error('获取可用卡片数据失败:', dataError);
        setAvailableCards([]);
      }
      
      setShowCardBindingModal(true);
    }
  };
  
  // 添加卡片绑定
  const handleAddCardBinding = async () => {
    if (!currentSceneForCardBinding || !newCardBinding.card_id) {
      toast.error('请选择要绑定的卡片');
      return;
    }
    
    try {
      await sceneAPI.addSceneCardBinding(currentSceneForCardBinding.id, newCardBinding);
      toast.success('卡片绑定添加成功');
      
      // 重置表单
      setNewCardBinding({
        card_id: '',
        binding_type: 'optional',
        max_uses_per_scene: 1,
        cooldown_rounds: 0,
        scene_effect_modifier: 1.0,
        special_effects: {},
        unlock_conditions: {},
        visibility_conditions: {},
        usage_reward_bonus: {}
      });
      
      // 重新获取绑定列表
      const response = await sceneAPI.getSceneCardBindings(currentSceneForCardBinding.id);
      setCardBindings(response.data);
      
      // 同时更新统一配置弹窗中的状态
      setSceneCardBindings(response.data);
    } catch (error) {
      console.error('添加卡片绑定失败:', error);
      toast.error('添加卡片绑定失败', '请稍后重试');
    }
  };
  
  // 删除卡片绑定
  const handleRemoveCardBinding = async (bindingId: string) => {
    if (!currentSceneForCardBinding) return;
    
    if (confirm('确定要删除这个卡片绑定吗？')) {
      try {
        await sceneAPI.removeSceneCardBinding(currentSceneForCardBinding.id, bindingId);
        toast.success('卡片绑定删除成功');
        
        // 重新获取绑定列表
        const response = await sceneAPI.getSceneCardBindings(currentSceneForCardBinding.id);
        setCardBindings(response.data);
        
        // 同时更新统一配置弹窗中的状态
        setSceneCardBindings(response.data);
      } catch (error) {
        console.error('删除卡片绑定失败:', error);
        toast.error('删除卡片绑定失败', '请稍后重试');
      }
    }
  };

  // 删除场景NPC
  const handleRemoveSceneNPC = async (npcId: string) => {
    if (!currentSceneForUnifiedConfig) return;
    
    if (confirm('确定要从场景中移除这个NPC吗？')) {
      try {
        await sceneAPI.removeSceneNPC(currentSceneForUnifiedConfig.id, npcId);
        toast.success('NPC移除成功');
        
        // 重新获取NPC列表
        const response = await sceneAPI.getSceneNPCs(currentSceneForUnifiedConfig.id);
        setSceneNPCs(response.data);
      } catch (error) {
        console.error('移除NPC失败:', error);
        toast.error('移除NPC失败');
      }
    }
  };
  
  // 添加NPC到场景
  const handleAddNPCToScene = async (npc: any) => {
    if (!currentSceneForNPC) return;
    
    try {
      const npcData = {
        npc_id: npc.id,
        role: 'supporter',
        behavior: 'neutral',
        can_be_challenged: true
      };
      
      await sceneAPI.addSceneNPC(currentSceneForNPC.id, npcData);
      toast.success('NPC添加成功');
      
      // 重新获取场景NPC列表
      const response = await sceneAPI.getSceneNPCs(currentSceneForNPC.id);
      setSceneNPCs(response.data);
    } catch (error) {
      console.error('添加NPC失败:', error);
      toast.error('添加NPC失败', '请稍后重试');
    }
  };
  
  // 从场景移除NPC
  const handleRemoveNPCFromScene = async (npcId: string) => {
    if (!currentSceneForNPC) return;
    
    if (confirm('确定要从场景中移除这个NPC吗？')) {
      try {
        await sceneAPI.removeSceneNPC(currentSceneForNPC.id, npcId);
        toast.success('NPC移除成功');
        
        // 重新获取场景NPC列表
        const response = await sceneAPI.getSceneNPCs(currentSceneForNPC.id);
        setSceneNPCs(response.data);
      } catch (error) {
        console.error('移除NPC失败:', error);
        toast.error('移除NPC失败', '请稍后重试');
      }
    }
  };

  // 处理场景展示配置
  const handleDisplayConfig = async (scene: Scene) => {
    setCurrentSceneForDisplayConfig(scene);
    try {
      const [displayConfigResponse, scenesListResponse] = await Promise.all([
        sceneAPI.getSceneDisplayConfig(scene.id),
        sceneAPI.getAllScenesList()
      ]);
      
      setDisplayConfig(displayConfigResponse.data);
      setAllScenesList(scenesListResponse.data);
      setShowDisplayConfigModal(true);
    } catch (error) {
      console.error('获取场景展示配置失败:', error);
      
      // 尝试单独获取展示配置
      try {
        const displayConfigResponse = await sceneAPI.getSceneDisplayConfig(scene.id);
        setDisplayConfig(displayConfigResponse.data);
      } catch (configError) {
        console.error('获取展示配置失败，使用默认值:', configError);
        // 只有在确实没有配置时才使用默认值
        setDisplayConfig({
          card_count: 0,
          prerequisite_scenes: [],
          days_required: 0
        });
      }
      
      // 尝试获取场景列表
      try {
        const scenesListResponse = await sceneAPI.getAllScenesList();
        setAllScenesList(scenesListResponse.data);
      } catch (listError) {
        console.error('获取场景列表失败:', listError);
        setAllScenesList([]);
        toast.error('获取场景列表失败，前置场景功能可能受影响');
      }
      
      setShowDisplayConfigModal(true);
    }
  };

  // 保存场景展示配置
  const handleSaveDisplayConfig = async () => {
    if (!currentSceneForDisplayConfig) return;
    
    try {
      await sceneAPI.saveSceneDisplayConfig(currentSceneForDisplayConfig.id, displayConfig);
      toast.success('场景展示配置保存成功');
      setShowDisplayConfigModal(false);
      // 重新获取场景列表以更新显示
      fetchScenes();
    } catch (error) {
      console.error('保存场景展示配置失败:', error);
      toast.error('保存场景展示配置失败', '请稍后重试');
    }
  };

  // 添加前置场景
  const handleAddPrerequisiteScene = (sceneId: string) => {
    if (sceneId && !displayConfig.prerequisite_scenes.includes(sceneId)) {
      setDisplayConfig({
        ...displayConfig,
        prerequisite_scenes: [...displayConfig.prerequisite_scenes, sceneId]
      });
    }
  };

  // 移除前置场景
  const handleRemovePrerequisiteScene = (sceneId: string) => {
    setDisplayConfig({
      ...displayConfig,
      prerequisite_scenes: displayConfig.prerequisite_scenes.filter(id => id !== sceneId)
    });
  };

  // 处理统一配置
  const handleUnifiedConfig = async (scene: Scene) => {
    setCurrentSceneForUnifiedConfig(scene);
    setActiveConfigTab('display');
    
    try {
      // 并行加载所有配置数据
      const [
        displayConfigResponse,
        scenesListResponse,
        requirementsResponse,
        npcsResponse,
        cardsResponse,
        cardBindingsResponse,
        availableNPCsResponse,
        playerNPCsResponse,
        rewardsResponse,
        extendedRewardsResponse
      ] = await Promise.all([
        sceneAPI.getSceneDisplayConfig(scene.id).catch(() => ({ data: { card_count: 0, prerequisite_scenes: [], days_required: 0 } })),
        sceneAPI.getAllScenesList().catch(() => ({ data: [] })),
        sceneAPI.getSceneRequirements(scene.id).catch(() => ({ data: { strength: 0, defense: 0, intelligence: 0, charisma: 0, loyalty: 0, influence: 0, command: 0, stealth: 0, health: 0 } })),
        sceneAPI.getSceneNPCs(scene.id).catch(() => ({ data: [] })),
        sceneAPI.getAvailableCards().catch(() => ({ data: [] })),
        sceneAPI.getSceneCardBindings(scene.id).catch(() => ({ data: [] })),
        npcAPI.getNPCs().catch(() => ({ data: [] })),
        sceneAPI.getAvailablePlayerNPCs().catch(() => ({ data: [] })),
        sceneAPI.getSceneRewards(scene.id).catch(() => ({ data: { success_attribute_points: 0, success_experience: 0, success_reputation: 0, success_gold: 0, failure_reputation: 0 } })),
        sceneAPI.getSceneExtendedRewards(scene.id).catch(() => ({ data: { success_attribute_points: 0, success_experience: 0, success_reputation: 0, success_gold: 0, failure_reputation: 0, failure_gold: 0, failure_attribute_penalty: 0, reward_cards: [], card_reward_probability: {}, reward_npcs: [], npc_reward_conditions: {}, special_rewards: {}, unlock_content: [], perfect_completion_bonus: {}, time_bonus: {}, efficiency_bonus: {}, dynamic_reward_formula: '', performance_multiplier: 1.0 } }))
      ]);
      
      // 设置所有配置数据
      setDisplayConfig(displayConfigResponse.data);
      setAllScenesList(scenesListResponse.data);
      setAttributeRequirements(requirementsResponse.data);
      setSceneNPCs(npcsResponse.data);
      setAvailableNPCs(availableNPCsResponse.data);
      setAvailableCards(cardsResponse.data);
      setSceneCardBindings(cardBindingsResponse.data);
      setAvailablePlayerNPCs(playerNPCsResponse.data);
      setRewardData(rewardsResponse.data);
      setExtendedRewardData(extendedRewardsResponse.data);
      
      // 设置其他模块的当前场景状态
      setCurrentSceneForDisplayConfig(scene);
      setCurrentSceneForRequirements(scene);
      setCurrentSceneForNPC(scene);
      setCurrentSceneForCardBinding(scene);
      setCurrentSceneForReward(scene);
      
      setShowUnifiedConfigModal(true);
    } catch (error) {
      console.error('加载配置数据失败:', error);
      toast.error('加载配置数据失败');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">加载中...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">场景管理</h1>
            <p className="text-gray-600">管理游戏场景和相关配置</p>
          </div>
          <button
            onClick={() => {
              setEditingScene(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>新建场景</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  场景信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  NPC数量
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {scenes.map((scene) => (
                <React.Fragment key={scene.id}>
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() => toggleSceneExpansion(scene.id)}
                          className="mr-2 p-1 text-gray-400 hover:text-gray-600"
                        >
                          {expandedScenes.has(scene.id) ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </button>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{scene.name}</div>
                          <div className="text-sm text-gray-500">ID: {scene.scene_id}</div>
                          {scene.description && (
                            <div className="text-sm text-gray-500 mt-1">{scene.description}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{getCategoryText(scene.category)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(scene.status)}`}>
                        {scene.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {scene.npc_count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2 flex-wrap">
                        <button
                          onClick={() => handleEdit(scene)}
                          className="text-blue-600 hover:text-blue-900"
                          title="编辑基础信息"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleUnifiedConfig(scene)}
                          className="text-orange-600 hover:text-orange-900"
                          title="统一配置"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(scene)}
                          className="text-red-600 hover:text-red-900"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {/* 展开的详情行 */}
                  {expandedScenes.has(scene.id) && sceneDetails[scene.id] && (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-4">
                          {/* NPC配置 */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">绑定NPC ({sceneDetails[scene.id].npcs?.length || 0})</h4>
                            <div className="bg-white rounded border p-3">
                              {sceneDetails[scene.id].npcs?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {sceneDetails[scene.id].npcs.map((npc: any, index: number) => (
                                    <div key={index} className="text-sm border rounded p-2">
                                      <div className="font-medium">{npc.name}</div>
                                      <div className="text-gray-600">角色: {npc.role}</div>
                                      <div className="text-gray-600">行为: {npc.behavior}</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 text-sm">未配置NPC</div>
                              )}
                            </div>
                          </div>
                          
                          {/* 进入要求 */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">进入属性要求</h4>
                            <div className="bg-white rounded border p-3">
                              {sceneDetails[scene.id].requirements && Object.keys(sceneDetails[scene.id].requirements).length > 0 ? (
                                <div className="grid grid-cols-3 gap-2 text-sm">
                                  {Object.entries(sceneDetails[scene.id].requirements).map(([key, value]: [string, any]) => (
                                    value > 0 && (
                                      <div key={key} className="flex justify-between">
                                        <span className="text-gray-600">{key}:</span>
                                        <span className="font-medium">≥{value}</span>
                                      </div>
                                    )
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 text-sm">未配置属性要求</div>
                              )}
                            </div>
                          </div>
                          
                          {/* 卡片绑定 */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">卡片绑定 ({sceneDetails[scene.id].cardBindings?.length || 0})</h4>
                            <div className="bg-white rounded border p-3">
                              {sceneDetails[scene.id].cardBindings?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                                  {sceneDetails[scene.id].cardBindings.map((binding: any, index: number) => (
                                    <div key={index} className="text-sm border rounded p-2">
                                      <div className="font-medium">{binding.card_name}</div>
                                      <div className="text-gray-600">类型: {binding.binding_type}</div>
                                      <div className="text-gray-600">倍数: {binding.scene_effect_modifier}x</div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="text-gray-500 text-sm">未配置卡片绑定</div>
                              )}
                            </div>
                          </div>
                          
                          {/* 基础奖励 */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">基础奖励</h4>
                            <div className="bg-white rounded border p-3">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>属性点: {sceneDetails[scene.id].rewards?.success_attribute_points || 0}</div>
                                <div>经验: {sceneDetails[scene.id].rewards?.success_experience || 0}</div>
                                <div>声望: {sceneDetails[scene.id].rewards?.success_reputation || 0}</div>
                                <div>金币: {sceneDetails[scene.id].rewards?.success_gold || 0}</div>
                              </div>
                            </div>
                          </div>
                          
                          {/* 扩展奖励 */}
                          <div>
                            <h4 className="font-medium text-gray-900 mb-2">扩展奖励</h4>
                            <div className="bg-white rounded border p-3">
                              <div className="space-y-3 text-sm">
                                {/* 卡片奖励 */}
                                <div>
                                  <div className="font-medium text-gray-700 mb-1">卡片奖励</div>
                                  {sceneDetails[scene.id].extendedRewards?.reward_cards?.length > 0 ? (
                                    <div className="space-y-1">
                                      {sceneDetails[scene.id].extendedRewards.reward_cards.map((cardReward: any, index: number) => {
                                        const cardInfo = sceneDetails[scene.id].availableCards?.find((card: any) => card.id === cardReward.card_id);
                                        return (
                                          <div key={index} className="text-gray-600 flex justify-between">
                                            <span>{cardInfo?.name || '未知卡片'}</span>
                                            <span>x{cardReward.quantity} ({(cardReward.probability * 100).toFixed(0)}%)</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-gray-500">无卡片奖励</div>
                                  )}
                                </div>
                                
                                {/* NPC奖励 */}
                                <div>
                                  <div className="font-medium text-gray-700 mb-1">NPC奖励</div>
                                  {sceneDetails[scene.id].extendedRewards?.reward_npcs?.length > 0 ? (
                                    <div className="space-y-1">
                                      {sceneDetails[scene.id].extendedRewards.reward_npcs.map((npcReward: any, index: number) => {
                                        const npcInfo = sceneDetails[scene.id].availableNPCs?.filter((npc: any) => npc.npc_type === 'player_npc')
                                          .find((npc: any) => npc.id === npcReward.npc_id);
                                        return (
                                          <div key={index} className="text-gray-600 flex justify-between">
                                            <span>{npcInfo?.name || '未知NPC'}</span>
                                            <span>x{npcReward.quantity} ({(npcReward.probability * 100).toFixed(0)}%)</span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ) : (
                                    <div className="text-gray-500">无NPC奖励</div>
                                  )}
                                </div>
                                
                                {/* 表现倍数 */}
                                <div>
                                  <div className="font-medium text-gray-700">表现倍数</div>
                                  <div className="text-gray-600">{sceneDetails[scene.id].extendedRewards?.performance_multiplier || 1.0}x</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* 模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {editingScene ? '编辑场景' : '新建场景'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    场景ID
                  </label>
                  <input
                    type="text"
                    value={formData.scene_id}
                    onChange={(e) => setFormData({...formData, scene_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingScene}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    场景名称
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    场景类型
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="main_story">主线剧情</option>
                    <option value="side_quest">支线任务</option>
                    <option value="faction">阵营</option>
                    <option value="random">随机</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    描述
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    旁白提示词
                  </label>
                  <textarea
                    value={formData.narrator_prompt}
                    onChange={(e) => setFormData({...formData, narrator_prompt: e.target.value})}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="请输入旁白AI的提示词..."
                    required
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    {editingScene ? '更新' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* NPC配置模态框 */}
        {showNPCModal && currentSceneForNPC && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                场景NPC配置 - {currentSceneForNPC.name}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">当前NPC配置</h4>
                  <div className="bg-gray-50 rounded p-4">
                    {sceneNPCs.length > 0 ? (
                      <div className="space-y-2">
                        {sceneNPCs.map((npc, index) => (
                          <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                            <div>
                              <span className="font-medium">{npc.name}</span>
                              <span className="text-sm text-gray-500 ml-2">角色: {npc.role}</span>
                              <span className="text-sm text-gray-500 ml-2">行为: {npc.behavior}</span>
                              <span className="text-sm text-gray-500 ml-2">优先级: {npc.speaking_priority}</span>
                            </div>
                            <button 
                              className="text-red-600 hover:text-red-800 text-sm"
                              onClick={() => handleRemoveNPCFromScene(npc.npc_id)}
                            >
                              移除
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">还没有配置NPC</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">可用NPC列表</h4>
                  <div className="bg-gray-50 rounded p-4 max-h-60 overflow-y-auto">
                    {availableNPCs.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {availableNPCs.filter((npc) => npc.npc_type !== 'player_npc').map((npc) => (
                          <div key={npc.id} className="bg-white p-3 rounded border flex justify-between items-center">
                            <div>
                              <span className="font-medium">{npc.name}</span>
                              <span className="text-sm text-gray-500 ml-2">({npc.faction} - {npc.npc_type})</span>
                            </div>
                            <button 
                              className="text-blue-600 hover:text-blue-800 text-sm"
                              onClick={() => handleAddNPCToScene(npc)}
                            >
                              添加
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">没有可用的NPC</p>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowNPCModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 奖励配置模态框 - 整合基础和扩展奖励 */}
        {showRewardModal && currentSceneForReward && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                奖励配置 - {currentSceneForReward.name}
              </h3>
              
              <div className="space-y-6">
                {/* 基础奖励 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-green-700">基础奖励</h4>
                  <div className="space-y-4">
                    <div>
                      <h5 className="font-medium mb-2">成功奖励</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">属性点</label>
                          <input
                            type="number"
                            value={rewardData.success_attribute_points}
                            onChange={(e) => setRewardData({...rewardData, success_attribute_points: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">经验值</label>
                          <input
                            type="number"
                            value={rewardData.success_experience}
                            onChange={(e) => setRewardData({...rewardData, success_experience: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">声望值</label>
                          <input
                            type="number"
                            value={rewardData.success_reputation}
                            onChange={(e) => setRewardData({...rewardData, success_reputation: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">金币</label>
                          <input
                            type="number"
                            value={rewardData.success_gold}
                            onChange={(e) => setRewardData({...rewardData, success_gold: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="font-medium mb-2">失败惩罚</h5>
                      <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">声望值损失</label>
                        <input
                          type="number"
                          value={rewardData.failure_reputation}
                          onChange={(e) => setRewardData({...rewardData, failure_reputation: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 扩展奖励 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-blue-700">扩展奖励</h4>
                  
                  <div className="space-y-6">
                    {/* 扩展数值奖励 */}
                    <div>
                      <h5 className="font-medium mb-2">扩展成功奖励</h5>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">属性点</label>
                          <input
                            type="number"
                            value={extendedRewardData.success_attribute_points}
                            onChange={(e) => setExtendedRewardData({...extendedRewardData, success_attribute_points: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">经验值</label>
                          <input
                            type="number"
                            value={extendedRewardData.success_experience}
                            onChange={(e) => setExtendedRewardData({...extendedRewardData, success_experience: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">声望值</label>
                          <input
                            type="number"
                            value={extendedRewardData.success_reputation}
                            onChange={(e) => setExtendedRewardData({...extendedRewardData, success_reputation: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">金币</label>
                          <input
                            type="number"
                            value={extendedRewardData.success_gold}
                            onChange={(e) => setExtendedRewardData({...extendedRewardData, success_gold: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* 扩展失败惩罚 */}
                    <div>
                      <h5 className="font-medium mb-2">扩展失败惩罚</h5>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">声望损失</label>
                          <input
                            type="number"
                            value={extendedRewardData.failure_reputation}
                            onChange={(e) => setExtendedRewardData({...extendedRewardData, failure_reputation: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">金币损失</label>
                          <input
                            type="number"
                            value={extendedRewardData.failure_gold}
                            onChange={(e) => setExtendedRewardData({...extendedRewardData, failure_gold: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">属性惩罚</label>
                          <input
                            type="number"
                            value={extendedRewardData.failure_attribute_penalty}
                            onChange={(e) => setExtendedRewardData({...extendedRewardData, failure_attribute_penalty: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* NPC奖励 */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">NPC奖励</h5>
                        <button
                          onClick={handleAddNPCReward}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                        >
                          + 添加NPC
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(extendedRewardData.reward_npcs || []).map((npcReward: any, index: number) => (
                          <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-600 mb-1">选择NPC</label>
                              <select
                                value={npcReward.npc_id || ''}
                                onChange={(e) => handleUpdateNPCReward(index, 'npc_id', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="">请选择NPC</option>
                                {availablePlayerNPCs.filter((npc: any) => npc.npc_type === 'player_npc').map((npc: any) => (
                                  <option key={npc.id} value={npc.id}>
                                    {npc.name} ({npc.faction} - {npc.tier})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-20">
                              <label className="block text-xs text-gray-600 mb-1">数量</label>
                              <input
                                type="number"
                                value={npcReward.quantity || 1}
                                onChange={(e) => handleUpdateNPCReward(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                min="1"
                              />
                            </div>
                            <div className="w-24">
                              <label className="block text-xs text-gray-600 mb-1">概率</label>
                              <input
                                type="number"
                                step="0.1"
                                value={npcReward.probability || 1.0}
                                onChange={(e) => handleUpdateNPCReward(index, 'probability', parseFloat(e.target.value) || 1.0)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                min="0"
                                max="1"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveNPCReward(index)}
                              className="text-red-600 hover:text-red-800 px-2 py-1"
                            >
                              删除
                            </button>
                          </div>
                        ))}
                        {(!extendedRewardData.reward_npcs || extendedRewardData.reward_npcs.length === 0) && (
                          <div className="text-gray-500 text-sm py-2">暂无NPC奖励，点击上方按钮添加</div>
                        )}
                      </div>
                    </div>
                    
                    {/* 卡片奖励 */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="font-medium">卡片奖励</h5>
                        <button
                          onClick={handleAddCardReward}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          + 添加卡片
                        </button>
                      </div>
                      <div className="space-y-2">
                        {(extendedRewardData.reward_cards || []).map((cardReward: any, index: number) => (
                          <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded">
                            <div className="flex-1">
                              <label className="block text-xs text-gray-600 mb-1">选择卡片</label>
                              <select
                                value={cardReward.card_id || ''}
                                onChange={(e) => handleUpdateCardReward(index, 'card_id', e.target.value)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                              >
                                <option value="">请选择卡片</option>
                                {availableCards.map((card: any) => (
                                  <option key={card.id} value={card.id}>
                                    {card.name} ({card.rarity})
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-20">
                              <label className="block text-xs text-gray-600 mb-1">数量</label>
                              <input
                                type="number"
                                value={cardReward.quantity || 1}
                                onChange={(e) => handleUpdateCardReward(index, 'quantity', parseInt(e.target.value) || 1)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                min="1"
                              />
                            </div>
                            <div className="w-24">
                              <label className="block text-xs text-gray-600 mb-1">概率</label>
                              <input
                                type="number"
                                step="0.1"
                                value={cardReward.probability || 1.0}
                                onChange={(e) => handleUpdateCardReward(index, 'probability', parseFloat(e.target.value) || 1.0)}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                min="0"
                                max="1"
                              />
                            </div>
                            <button
                              onClick={() => handleRemoveCardReward(index)}
                              className="text-red-600 hover:text-red-800 px-2 py-1"
                            >
                              删除
                            </button>
                          </div>
                        ))}
                        {(!extendedRewardData.reward_cards || extendedRewardData.reward_cards.length === 0) && (
                          <div className="text-gray-500 text-sm py-2">暂无卡片奖励，点击上方按钮添加</div>
                        )}
                      </div>
                    </div>
                    
                    {/* 表现倍数 */}
                    <div>
                      <h5 className="font-medium mb-2">表现倍数</h5>
                      <div className="w-full md:w-1/4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">倍数 (1.0 = 100%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={extendedRewardData.performance_multiplier}
                          onChange={(e) => setExtendedRewardData({...extendedRewardData, performance_multiplier: parseFloat(e.target.value) || 1.0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRewardModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveRewards}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  保存奖励配置
                </button>
              </div>
            </div>
          </div>
        )}
        
        
        {/* 场景属性要求配置模态框 */}
        {showRequirementsModal && currentSceneForRequirements && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                进入属性要求配置 - {currentSceneForRequirements.name}
              </h3>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded p-4">
                  <h4 className="font-medium mb-4">设置进入场景所需的最低属性值</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">力量 (Strength)</label>
                      <input
                        type="number"
                        value={attributeRequirements.strength}
                        onChange={(e) => setAttributeRequirements({...attributeRequirements, strength: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">防御 (Defense)</label>
                      <input
                        type="number"
                        value={attributeRequirements.defense}
                        onChange={(e) => setAttributeRequirements({...attributeRequirements, defense: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">智力 (Intelligence)</label>
                      <input
                        type="number"
                        value={attributeRequirements.intelligence}
                        onChange={(e) => setAttributeRequirements({...attributeRequirements, intelligence: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">魅力 (Charisma)</label>
                      <input
                        type="number"
                        value={attributeRequirements.charisma}
                        onChange={(e) => setAttributeRequirements({...attributeRequirements, charisma: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">忠诚 (Loyalty)</label>
                      <input
                        type="number"
                        value={attributeRequirements.loyalty}
                        onChange={(e) => setAttributeRequirements({...attributeRequirements, loyalty: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">影响力 (Influence)</label>
                      <input
                        type="number"
                        value={attributeRequirements.influence}
                        onChange={(e) => setAttributeRequirements({...attributeRequirements, influence: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">指挥力 (Command)</label>
                      <input
                        type="number"
                        value={attributeRequirements.command}
                        onChange={(e) => setAttributeRequirements({...attributeRequirements, command: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">隐秘 (Stealth)</label>
                      <input
                        type="number"
                        value={attributeRequirements.stealth}
                        onChange={(e) => setAttributeRequirements({...attributeRequirements, stealth: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="100"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">生命值 (Health)</label>
                      <input
                        type="number"
                        value={attributeRequirements.health}
                        onChange={(e) => setAttributeRequirements({...attributeRequirements, health: parseInt(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        max="500"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>说明：</strong> 只有属性值设置为0的要求不会被应用。设置为大于0的值将作为进入场景的最低要求。
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowRequirementsModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  关闭
                </button>
                <button
                  onClick={handleSaveRequirements}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  保存配置
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 卡片绑定配置模态框 */}
        {showCardBindingModal && currentSceneForCardBinding && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                卡片绑定配置 - {currentSceneForCardBinding.name}
              </h3>
              
              <div className="space-y-4">
                {/* 当前绑定列表 */}
                <div>
                  <h4 className="font-medium mb-2">当前卡片绑定</h4>
                  <div className="bg-gray-50 rounded p-4 max-h-60 overflow-y-auto">
                    {cardBindings.length > 0 ? (
                      <div className="space-y-2">
                        {cardBindings.map((binding, index) => (
                          <div key={index} className="bg-white p-3 rounded border flex justify-between items-center">
                            <div>
                              <span className="font-medium">{binding.card_name}</span>
                              <span className="text-sm text-gray-500 ml-2">
                                类型: {binding.binding_type} | 倍数: {binding.scene_effect_modifier}x
                              </span>
                              <div className="text-sm text-gray-500 mt-1">
                                最大使用: {binding.max_uses_per_scene}次 | 冷却: {binding.cooldown_rounds}轮
                              </div>
                            </div>
                            <button 
                              className="text-red-600 hover:text-red-800 text-sm"
                              onClick={() => handleRemoveCardBinding(binding.id)}
                            >
                              删除
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">还没有配置卡片绑定</p>
                    )}
                  </div>
                </div>
                
                {/* 添加新绑定 */}
                <div>
                  <h4 className="font-medium mb-2">添加新卡片绑定</h4>
                  <div className="bg-gray-50 rounded p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">选择卡片</label>
                        <select
                          value={newCardBinding.card_id}
                          onChange={(e) => setNewCardBinding({...newCardBinding, card_id: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="">请选择卡片</option>
                          {availableCards.map((card: any) => (
                            <option key={card.id} value={card.id}>
                              {card.name} ({card.rarity})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">绑定类型</label>
                        <select
                          value={newCardBinding.binding_type}
                          onChange={(e) => setNewCardBinding({...newCardBinding, binding_type: e.target.value})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="required">必需 (required)</option>
                          <option value="optional">可选 (optional)</option>
                          <option value="bonus">加成 (bonus)</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">最大使用次数</label>
                        <input
                          type="number"
                          value={newCardBinding.max_uses_per_scene}
                          onChange={(e) => setNewCardBinding({...newCardBinding, max_uses_per_scene: parseInt(e.target.value) || 1})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">冷却轮数</label>
                        <input
                          type="number"
                          value={newCardBinding.cooldown_rounds}
                          onChange={(e) => setNewCardBinding({...newCardBinding, cooldown_rounds: parseInt(e.target.value) || 0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">效果倍数</label>
                        <input
                          type="number"
                          step="0.1"
                          value={newCardBinding.scene_effect_modifier}
                          onChange={(e) => setNewCardBinding({...newCardBinding, scene_effect_modifier: parseFloat(e.target.value) || 1.0})}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          min="0"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end">
                      <button
                        onClick={handleAddCardBinding}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                      >
                        添加绑定
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* 说明 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">功能说明</h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• required（必需）：玩家必须拥有此卡片才能进入场景</p>
                    <p>• optional（可选）：玩家可以选择使用此卡片获得额外效果</p>
                    <p>• bonus（加成）：使用此卡片在场景中获得效果倍数加成</p>
                    <p>• 效果倍数：卡片在此场景中的效果增强倍数（1.0 = 100%）</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCardBindingModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 场景展示配置模态框 */}
        {showDisplayConfigModal && currentSceneForDisplayConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                场景展示配置 - {currentSceneForDisplayConfig.name}
              </h3>
              
              <div className="space-y-6">
                {/* 基础展示配置 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-green-700">展示配置</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        折卡数量
                      </label>
                      <input
                        type="number"
                        value={displayConfig.card_count}
                        onChange={(e) => setDisplayConfig({
                          ...displayConfig,
                          card_count: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        placeholder="设置折卡数量"
                      />
                      <p className="text-xs text-gray-500 mt-1">场景中可使用的卡片数量</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        天数要求
                      </label>
                      <input
                        type="number"
                        value={displayConfig.days_required}
                        onChange={(e) => setDisplayConfig({
                          ...displayConfig,
                          days_required: parseInt(e.target.value) || 0
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        placeholder="设置天数要求"
                      />
                      <p className="text-xs text-gray-500 mt-1">进入场景所需的游戏天数</p>
                    </div>
                  </div>
                </div>

                {/* 前置场景配置 */}
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium mb-3 text-blue-700">前置场景</h4>
                  
                  {/* 当前前置场景列表 */}
                  <div className="mb-4">
                    <h5 className="text-sm font-medium text-gray-700 mb-2">已配置的前置场景</h5>
                    <div className="bg-gray-50 rounded p-3 min-h-[60px]">
                      {displayConfig.prerequisite_scenes.length > 0 ? (
                        <div className="space-y-2">
                          {displayConfig.prerequisite_scenes.map((sceneId, index) => {
                            const sceneInfo = allScenesList.find(s => s.scene_id === sceneId);
                            return (
                              <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                                <div>
                                  <span className="font-medium">{sceneInfo?.name || '未知场景'}</span>
                                  <span className="text-sm text-gray-500 ml-2">ID: {sceneId}</span>
                                </div>
                                <button
                                  onClick={() => handleRemovePrerequisiteScene(sceneId)}
                                  className="text-red-600 hover:text-red-800 text-sm"
                                >
                                  移除
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-gray-500 text-sm">暂无前置场景</div>
                      )}
                    </div>
                  </div>

                  {/* 添加前置场景 */}
                  <div>
                    <h5 className="text-sm font-medium text-gray-700 mb-2">添加前置场景</h5>
                    <div className="flex gap-2">
                      <select
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddPrerequisiteScene(e.target.value);
                            e.target.value = ''; // 重置选择
                          }
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">选择前置场景</option>
                        {allScenesList
                          .filter(scene => 
                            scene.scene_id !== currentSceneForDisplayConfig.scene_id && 
                            !displayConfig.prerequisite_scenes.includes(scene.scene_id)
                          )
                          .map((scene) => (
                            <option key={scene.scene_id} value={scene.scene_id}>
                              {scene.name} ({scene.category})
                            </option>
                          ))
                        }
                      </select>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      选择必须完成的前置场景。玩家必须先完成这些场景才能进入当前场景。
                    </p>
                  </div>
                </div>

                {/* 配置说明 */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h5 className="font-medium text-blue-900 mb-2">配置说明</h5>
                  <div className="text-sm text-blue-800 space-y-1">
                    <p>• <strong>折卡数量</strong>：玩家在此场景中可以使用的卡片总数</p>
                    <p>• <strong>前置场景</strong>：玩家必须先完成的场景，按顺序进行</p>
                    <p>• <strong>天数要求</strong>：玩家需要游戏进行多少天后才能解锁此场景</p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowDisplayConfigModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  取消
                </button>
                <button
                  onClick={handleSaveDisplayConfig}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  保存配置
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* 统一配置弹窗 */}
        {showUnifiedConfigModal && currentSceneForUnifiedConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">
                    统一配置 - {currentSceneForUnifiedConfig.name}
                  </h3>
                  <button
                    onClick={() => setShowUnifiedConfigModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* 配置选项卡 */}
                <div className="border-b border-gray-200 mb-6">
                  <nav className="-mb-px flex space-x-8">
                    {[
                      { id: 'display', name: '展示配置', icon: Monitor },
                      { id: 'requirements', name: '进入要求', icon: FileText },
                      { id: 'npcs', name: 'NPC配置', icon: Users },
                      { id: 'cards', name: '卡片绑定', icon: CreditCard },
                      { id: 'rewards', name: '奖励配置', icon: Award }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveConfigTab(tab.id)}
                          className={`${
                            activeConfigTab === tab.id
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                          } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{tab.name}</span>
                        </button>
                      );
                    })}
                  </nav>
                </div>

                {/* 配置内容 */}
                <div className="space-y-6">
                  {/* 展示配置 */}
                  {activeConfigTab === 'display' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">场景展示配置</h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            折卡数量
                          </label>
                          <input
                            type="number"
                            value={displayConfig.card_count}
                            onChange={(e) => setDisplayConfig({
                              ...displayConfig,
                              card_count: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                          <p className="text-xs text-gray-500 mt-1">玩家在此场景中可以使用的卡片总数</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            天数要求
                          </label>
                          <input
                            type="number"
                            value={displayConfig.days_required}
                            onChange={(e) => setDisplayConfig({
                              ...displayConfig,
                              days_required: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                          />
                          <p className="text-xs text-gray-500 mt-1">游戏进行多少天后才能解锁</p>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            前置场景
                          </label>
                          <select
                            onChange={(e) => {
                              if (e.target.value && !displayConfig.prerequisite_scenes.includes(e.target.value)) {
                                setDisplayConfig({
                                  ...displayConfig,
                                  prerequisite_scenes: [...displayConfig.prerequisite_scenes, e.target.value]
                                });
                              }
                              e.target.value = '';
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value=""
                          >
                            <option value="">添加前置场景</option>
                            {allScenesList
                              .filter(scene => 
                                scene.scene_id !== currentSceneForUnifiedConfig.scene_id &&
                                !displayConfig.prerequisite_scenes.includes(scene.scene_id)
                              )
                              .map((scene) => (
                                <option key={scene.scene_id} value={scene.scene_id}>
                                  {scene.name} ({scene.category})
                                </option>
                              ))
                            }
                          </select>
                          <div className="mt-2 space-y-1">
                            {displayConfig.prerequisite_scenes.map((sceneId) => {
                              const scene = allScenesList.find(s => s.scene_id === sceneId);
                              return (
                                <div key={sceneId} className="flex items-center justify-between bg-gray-100 px-3 py-1 rounded text-sm">
                                  <span>{scene ? scene.name : sceneId}</span>
                                  <button
                                    onClick={() => setDisplayConfig({
                                      ...displayConfig,
                                      prerequisite_scenes: displayConfig.prerequisite_scenes.filter(id => id !== sceneId)
                                    })}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">必须完成的前置场景</p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* 进入要求配置 */}
                  {activeConfigTab === 'requirements' && (
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">进入属性要求</h4>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(attributeRequirements).map(([attr, value]) => (
                          <div key={attr}>
                            <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                              {attr === 'intelligence' ? '智力' : 
                               attr === 'strength' ? '力量' :
                               attr === 'defense' ? '防御' :
                               attr === 'charisma' ? '魅力' :
                               attr === 'loyalty' ? '忠诚' :
                               attr === 'influence' ? '影响力' :
                               attr === 'command' ? '指挥' :
                               attr === 'stealth' ? '隐秘' :
                               attr === 'health' ? '生命值' : attr}
                            </label>
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => setAttributeRequirements({
                                ...attributeRequirements,
                                [attr]: parseInt(e.target.value) || 0
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* NPC配置 */}
                  {activeConfigTab === 'npcs' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-medium text-gray-900">场景NPC配置</h4>
                        <button
                          onClick={() => setShowAddNPCModal(true)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          添加NPC
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {sceneNPCs.map((npc) => (
                          <div key={npc.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-900">{npc.name}</h5>
                                <p className="text-sm text-gray-600">角色: {npc.role}</p>
                                <p className="text-sm text-gray-600">行为: {npc.behavior}</p>
                              </div>
                              <button
                                onClick={() => handleRemoveSceneNPC(npc.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {sceneNPCs.length === 0 && (
                          <p className="text-gray-500 text-center py-8">暂无配置的NPC</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 卡片绑定配置 */}
                  {activeConfigTab === 'cards' && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-medium text-gray-900">卡片绑定配置</h4>
                        <button
                          onClick={() => setShowCardBindingModal(true)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          绑定卡片
                        </button>
                      </div>
                      
                      <div className="space-y-3">
                        {sceneCardBindings.map((binding) => (
                          <div key={binding.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-medium text-gray-900">{binding.card_name}</h5>
                                <p className="text-sm text-gray-600">类型: {binding.binding_type}</p>
                                <p className="text-sm text-gray-600">使用次数: {binding.max_uses_per_scene}</p>
                              </div>
                              <button
                                onClick={() => handleRemoveCardBinding(binding.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {sceneCardBindings.length === 0 && (
                          <p className="text-gray-500 text-center py-8">暂无绑定的卡片</p>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* 奖励配置 */}
                  {activeConfigTab === 'rewards' && (
                    <div className="space-y-6">
                      <h4 className="text-lg font-medium text-gray-900">奖励配置</h4>
                      
                      {/* 基础奖励 */}
                      <div className="border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium mb-3 text-green-700">基础奖励</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">属性点</label>
                            <input
                              type="number"
                              value={rewardData.success_attribute_points}
                              onChange={(e) => setRewardData({...rewardData, success_attribute_points: parseInt(e.target.value) || 0})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">经验值</label>
                            <input
                              type="number"
                              value={rewardData.success_experience}
                              onChange={(e) => setRewardData({...rewardData, success_experience: parseInt(e.target.value) || 0})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">声望值</label>
                            <input
                              type="number"
                              value={rewardData.success_reputation}
                              onChange={(e) => setRewardData({...rewardData, success_reputation: parseInt(e.target.value) || 0})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">金币</label>
                            <input
                              type="number"
                              value={rewardData.success_gold}
                              onChange={(e) => setRewardData({...rewardData, success_gold: parseInt(e.target.value) || 0})}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 保存按钮 */}
                <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowUnifiedConfigModal(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    取消
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        // 保存当前选项卡的配置
                        if (activeConfigTab === 'display') {
                          await sceneAPI.saveSceneDisplayConfig(currentSceneForUnifiedConfig.id, displayConfig);
                        } else if (activeConfigTab === 'requirements') {
                          await sceneAPI.saveSceneRequirements(currentSceneForUnifiedConfig.id, attributeRequirements);
                        } else if (activeConfigTab === 'rewards') {
                          await sceneAPI.saveSceneRewards(currentSceneForUnifiedConfig.id, rewardData);
                        }
                        toast.success('配置保存成功');
                      } catch (error) {
                        console.error('保存配置失败:', error);
                        toast.error('保存配置失败');
                      }
                    }}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    保存当前配置
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        // 保存所有配置
                        await Promise.all([
                          sceneAPI.saveSceneDisplayConfig(currentSceneForUnifiedConfig.id, displayConfig),
                          sceneAPI.saveSceneRequirements(currentSceneForUnifiedConfig.id, attributeRequirements),
                          sceneAPI.saveSceneRewards(currentSceneForUnifiedConfig.id, rewardData)
                        ]);
                        toast.success('所有配置保存成功');
                        setShowUnifiedConfigModal(false);
                      } catch (error) {
                        console.error('保存配置失败:', error);
                        toast.error('保存配置失败');
                      }
                    }}
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    保存所有配置
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 统一配置弹窗 */}
        {showUnifiedConfigModal && currentSceneForUnifiedConfig && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      场景配置 - {currentSceneForUnifiedConfig.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      统一管理场景的所有配置项
                    </p>
                  </div>
                  <button
                    onClick={() => setShowUnifiedConfigModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              {/* 配置选项卡 */}
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6" aria-label="Tabs">
                  {[
                    { id: 'display', name: '展示配置', icon: Monitor },
                    { id: 'requirements', name: '进入要求', icon: FileText },
                    { id: 'npcs', name: 'NPC配置', icon: Users },
                    { id: 'cards', name: '卡片绑定', icon: CreditCard },
                    { id: 'rewards', name: '奖励配置', icon: Gift }
                  ].map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveConfigTab(tab.id)}
                        className={`${
                          activeConfigTab === tab.id
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                      >
                        <Icon size={16} />
                        <span>{tab.name}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
              
              {/* 配置内容 */}
              <div className="p-6">
                {/* 展示配置 - 完整内容 */}
                {activeConfigTab === 'display' && (
                  <div className="space-y-6">
                    {/* 基础展示配置 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3 text-green-700">展示配置</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            折卡数量
                          </label>
                          <input
                            type="number"
                            value={displayConfig.card_count}
                            onChange={(e) => setDisplayConfig({
                              ...displayConfig,
                              card_count: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            placeholder="设置折卡数量"
                          />
                          <p className="text-xs text-gray-500 mt-1">场景中可使用的卡片数量</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            天数要求
                          </label>
                          <input
                            type="number"
                            value={displayConfig.days_required}
                            onChange={(e) => setDisplayConfig({
                              ...displayConfig,
                              days_required: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            placeholder="设置天数要求"
                          />
                          <p className="text-xs text-gray-500 mt-1">进入场景所需的游戏天数</p>
                        </div>
                      </div>
                    </div>

                    {/* 前置场景配置 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3 text-blue-700">前置场景</h4>
                      
                      {/* 当前前置场景列表 */}
                      <div className="mb-4">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">已配置的前置场景</h5>
                        <div className="bg-gray-50 rounded p-3 min-h-[60px]">
                          {displayConfig.prerequisite_scenes.length > 0 ? (
                            <div className="space-y-2">
                              {displayConfig.prerequisite_scenes.map((sceneId, index) => {
                                const sceneInfo = allScenesList.find(s => s.scene_id === sceneId);
                                return (
                                  <div key={index} className="flex justify-between items-center bg-white p-2 rounded border">
                                    <div>
                                      <span className="font-medium">{sceneInfo?.name || '未知场景'}</span>
                                      <span className="text-sm text-gray-500 ml-2">ID: {sceneId}</span>
                                    </div>
                                    <button
                                      onClick={() => handleRemovePrerequisiteScene(sceneId)}
                                      className="text-red-600 hover:text-red-800 text-sm"
                                    >
                                      移除
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-gray-500 text-sm">暂无前置场景</div>
                          )}
                        </div>
                      </div>

                      {/* 添加前置场景 */}
                      <div>
                        <h5 className="text-sm font-medium text-gray-700 mb-2">添加前置场景</h5>
                        <div className="flex gap-2">
                          <select
                            onChange={(e) => {
                              if (e.target.value) {
                                handleAddPrerequisiteScene(e.target.value);
                                e.target.value = ''; // 重置选择
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">选择前置场景</option>
                            {allScenesList
                              .filter(scene => 
                                scene.scene_id !== currentSceneForUnifiedConfig.scene_id && 
                                !displayConfig.prerequisite_scenes.includes(scene.scene_id)
                              )
                              .map((scene) => (
                                <option key={scene.scene_id} value={scene.scene_id}>
                                  {scene.name} ({scene.category})
                                </option>
                              ))
                            }
                          </select>
                        </div>
                      </div>
                    </div>
                    
                    {/* 保存按钮 */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveDisplayConfig}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        保存展示配置
                      </button>
                    </div>
                  </div>
                )}

                {/* 进入要求配置 - 完整内容 */}
                {activeConfigTab === 'requirements' && (
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-gray-900">进入属性要求配置</h4>
                    <p className="text-sm text-gray-600">
                      设置玩家进入此场景所需的最低属性值。设置为0表示无要求。
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {Object.entries(attributeRequirements).map(([key, value]) => (
                        <div key={key}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {key === 'strength' && '力量 (Strength)'}
                            {key === 'defense' && '防御 (Defense)'}
                            {key === 'intelligence' && '智力 (Intelligence)'}
                            {key === 'charisma' && '魅力 (Charisma)'}
                            {key === 'loyalty' && '忠诚 (Loyalty)'}
                            {key === 'influence' && '影响力 (Influence)'}
                            {key === 'command' && '指挥力 (Command)'}
                            {key === 'stealth' && '隐秘 (Stealth)'}
                            {key === 'health' && '生命值 (Health)'}
                          </label>
                          <input
                            type="number"
                            value={value}
                            onChange={(e) => setAttributeRequirements({
                              ...attributeRequirements,
                              [key]: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            max="100"
                            placeholder="最低要求值"
                          />
                          <p className="text-xs text-gray-500 mt-1">当前值: {value}</p>
                        </div>
                      ))}
                    </div>
                    
                    {/* 说明 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">配置说明</h5>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• 设置为0表示对该属性无要求</p>
                        <p>• 玩家必须满足所有非零属性要求才能进入场景</p>
                        <p>• 属性值范围：1-100</p>
                      </div>
                    </div>
                    
                    {/* 保存按钮 */}
                    <div className="flex justify-end">
                      <button
                        onClick={async () => {
                          try {
                            await sceneAPI.saveSceneRequirements(currentSceneForUnifiedConfig.id, attributeRequirements);
                            toast.success('进入要求配置保存成功');
                            fetchScenes();
                          } catch (error) {
                            console.error('保存进入要求配置失败:', error);
                            toast.error('保存进入要求配置失败', '请稍后重试');
                          }
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        保存进入要求配置
                      </button>
                    </div>
                  </div>
                )}

                {/* NPC配置 - 完整内容 */}
                {activeConfigTab === 'npcs' && (
                  <div className="space-y-4">
                    <h4 className="font-medium mb-2">当前NPC配置</h4>
                    <div className="bg-gray-50 rounded p-4">
                      {sceneNPCs.length > 0 ? (
                        <div className="space-y-2">
                          {sceneNPCs.map((npc: any, index: number) => (
                            <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                              <div>
                                <span className="font-medium">{npc.name}</span>
                                <span className="text-sm text-gray-500 ml-2">行为: {npc.behavior}</span>
                                <span className="text-sm text-gray-500 ml-2">优先级: {npc.speaking_priority}</span>
                              </div>
                              <button 
                                className="text-red-600 hover:text-red-800 text-sm"
                                onClick={() => {
                                  // 在统一配置中设置正确的当前场景
                                  setCurrentSceneForNPC(currentSceneForUnifiedConfig);
                                  handleRemoveNPCFromScene(npc.npc_id);
                                }}
                              >
                                移除
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">还没有配置NPC</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">可添加的NPC</h4>
                      <div className="bg-gray-50 rounded p-4 max-h-48 overflow-y-auto">
                        {availableNPCs.length > 0 ? (
                          <div className="space-y-2">
                            {availableNPCs.map((npc: any) => (
                              <div key={npc.id} className="flex justify-between items-center bg-white p-2 rounded border">
                                <div>
                                  <span className="font-medium">{npc.name}</span>
                                  <span className="text-sm text-gray-500 ml-2">({npc.faction} - {npc.npc_type})</span>
                                </div>
                                <button 
                                  className="text-blue-600 hover:text-blue-800 text-sm"
                                  onClick={() => {
                                    // 在统一配置中设置正确的当前场景
                                    setCurrentSceneForNPC(currentSceneForUnifiedConfig);
                                    handleAddNPCToScene(npc);
                                  }}
                                >
                                  添加
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500">没有可用的NPC</p>
                        )}
                      </div>
                    </div>
                    
                    {/* 保存按钮 */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowUnifiedConfigModal(false)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        关闭
                      </button>
                    </div>
                  </div>
                )}

                {/* 卡片绑定配置 - 完整内容 */}
                {activeConfigTab === 'cards' && (
                  <div className="space-y-4">
                    <h4 className="font-medium mb-2">当前卡片绑定</h4>
                    <div className="bg-gray-50 rounded p-4">
                      {sceneCardBindings.length > 0 ? (
                        <div className="space-y-2">
                          {sceneCardBindings.map((binding: any, index: number) => (
                            <div key={index} className="flex justify-between items-center bg-white p-3 rounded border">
                              <div>
                                <span className="font-medium">{binding.card_name}</span>
                                <span className="text-sm text-gray-500 ml-2">类型: {binding.binding_type}</span>
                                <span className="text-sm text-gray-500 ml-2">最大使用: {binding.max_uses_per_scene}</span>
                              </div>
                              <button 
                                className="text-red-600 hover:text-red-800 text-sm"
                                onClick={() => {
                                  // 在统一配置中设置正确的当前场景
                                  setCurrentSceneForCardBinding(currentSceneForUnifiedConfig);
                                  handleRemoveCardBinding(binding.id);
                                }}
                              >
                                移除
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">还没有绑定卡片</p>
                      )}
                    </div>

                    {/* 添加新的卡片绑定 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium mb-3">添加卡片绑定</h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">选择卡片</label>
                          <select
                            value={newCardBinding.card_id}
                            onChange={(e) => setNewCardBinding({...newCardBinding, card_id: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="">请选择卡片</option>
                            {availableCards.map((card: any) => (
                              <option key={card.id} value={card.id}>
                                {card.name} ({card.rarity})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">绑定类型</label>
                          <select
                            value={newCardBinding.binding_type}
                            onChange={(e) => setNewCardBinding({...newCardBinding, binding_type: e.target.value})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                          >
                            <option value="required">必需 (required)</option>
                            <option value="optional">可选 (optional)</option>
                            <option value="bonus">加成 (bonus)</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">最大使用次数</label>
                          <input
                            type="number"
                            value={newCardBinding.max_uses_per_scene}
                            onChange={(e) => setNewCardBinding({...newCardBinding, max_uses_per_scene: parseInt(e.target.value) || 1})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="1"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">冷却轮数</label>
                          <input
                            type="number"
                            value={newCardBinding.cooldown_rounds}
                            onChange={(e) => setNewCardBinding({...newCardBinding, cooldown_rounds: parseInt(e.target.value) || 0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">效果倍数</label>
                          <input
                            type="number"
                            step="0.1"
                            value={newCardBinding.scene_effect_modifier}
                            onChange={(e) => setNewCardBinding({...newCardBinding, scene_effect_modifier: parseFloat(e.target.value) || 1.0})}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            min="0"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-4">
                        <button
                          onClick={() => {
                            // 在统一配置中设置正确的当前场景
                            setCurrentSceneForCardBinding(currentSceneForUnifiedConfig);
                            handleAddCardBinding();
                          }}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                        >
                          添加绑定
                        </button>
                      </div>
                    </div>
                    
                    {/* 说明 */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h5 className="font-medium text-blue-900 mb-2">功能说明</h5>
                      <div className="text-sm text-blue-800 space-y-1">
                        <p>• required（必需）：玩家必须拥有此卡片才能进入场景</p>
                        <p>• optional（可选）：玩家可以选择使用此卡片获得额外效果</p>
                        <p>• bonus（加成）：使用此卡片在场景中获得效果倍数加成</p>
                        <p>• 效果倍数：卡片在此场景中的效果增强倍数（1.0 = 100%）</p>
                      </div>
                    </div>
                    
                    {/* 保存按钮 */}
                    <div className="flex justify-end">
                      <button
                        onClick={() => setShowUnifiedConfigModal(false)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        关闭
                      </button>
                    </div>
                  </div>
                )}

                {/* 奖励配置 - 完整内容 */}
                {activeConfigTab === 'rewards' && (
                  <div className="space-y-6">
                    {/* 基础奖励 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3 text-green-700">基础奖励</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">成功 - 属性点</label>
                          <input
                            type="number"
                            value={rewardData.success_attribute_points}
                            onChange={(e) => setRewardData({
                              ...rewardData,
                              success_attribute_points: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            placeholder="成功获得的属性点"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">成功 - 经验值</label>
                          <input
                            type="number"
                            value={rewardData.success_experience}
                            onChange={(e) => setRewardData({
                              ...rewardData,
                              success_experience: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            placeholder="成功获得的经验值"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">成功 - 声望</label>
                          <input
                            type="number"
                            value={rewardData.success_reputation}
                            onChange={(e) => setRewardData({
                              ...rewardData,
                              success_reputation: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            placeholder="成功获得的声望"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">成功 - 金钱</label>
                          <input
                            type="number"
                            value={rewardData.success_gold}
                            onChange={(e) => setRewardData({
                              ...rewardData,
                              success_gold: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            placeholder="成功获得的金钱"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">失败 - 声望</label>
                          <input
                            type="number"
                            value={rewardData.failure_reputation}
                            onChange={(e) => setRewardData({
                              ...rewardData,
                              failure_reputation: parseInt(e.target.value) || 0
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="失败时的声望惩罚"
                          />
                        </div>
                      </div>
                    </div>

                    {/* 扩展奖励配置 */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h4 className="font-medium mb-3 text-orange-700">扩展奖励配置</h4>
                      
                      {/* NPC奖励 */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">NPC奖励</h5>
                          <button
                            onClick={handleAddNPCReward}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm"
                          >
                            + 添加NPC
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(extendedRewardData.reward_npcs || []).map((npcReward: any, index: number) => (
                            <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-600 mb-1">选择NPC</label>
                                <select
                                  value={npcReward.npc_id || ''}
                                  onChange={(e) => {
                                    const newRewardNPCs = [...(extendedRewardData.reward_npcs || [])];
                                    newRewardNPCs[index] = { ...npcReward, npc_id: e.target.value };
                                    setExtendedRewardData({
                                      ...extendedRewardData,
                                      reward_npcs: newRewardNPCs
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                  <option value="">请选择NPC</option>
                                  {availablePlayerNPCs.map((npc: any) => (
                                    <option key={npc.id} value={npc.id}>
                                      {npc.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="w-20">
                                <label className="block text-xs text-gray-600 mb-1">数量</label>
                                <input
                                  type="number"
                                  value={npcReward.quantity || 1}
                                  onChange={(e) => {
                                    const newRewardNPCs = [...(extendedRewardData.reward_npcs || [])];
                                    newRewardNPCs[index] = { ...npcReward, quantity: parseInt(e.target.value) || 1 };
                                    setExtendedRewardData({
                                      ...extendedRewardData,
                                      reward_npcs: newRewardNPCs
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  min="1"
                                />
                              </div>
                              <div className="w-20">
                                <label className="block text-xs text-gray-600 mb-1">概率</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={npcReward.probability || 1.0}
                                  onChange={(e) => {
                                    const newRewardNPCs = [...(extendedRewardData.reward_npcs || [])];
                                    newRewardNPCs[index] = { ...npcReward, probability: parseFloat(e.target.value) || 1.0 };
                                    setExtendedRewardData({
                                      ...extendedRewardData,
                                      reward_npcs: newRewardNPCs
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  min="0"
                                  max="1"
                                />
                              </div>
                              <button
                                onClick={() => handleRemoveNPCReward(index)}
                                className="text-red-600 hover:text-red-800 px-2 py-1"
                              >
                                删除
                              </button>
                            </div>
                          ))}
                          {(!extendedRewardData.reward_npcs || extendedRewardData.reward_npcs.length === 0) && (
                            <div className="text-gray-500 text-sm py-2">暂无NPC奖励，点击上方按钮添加</div>
                          )}
                        </div>
                      </div>

                      {/* 卡片奖励 */}
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">卡片奖励</h5>
                          <button
                            onClick={handleAddCardReward}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                          >
                            + 添加卡片
                          </button>
                        </div>
                        <div className="space-y-2">
                          {(extendedRewardData.reward_cards || []).map((cardReward: any, index: number) => (
                            <div key={index} className="flex gap-2 items-center bg-gray-50 p-3 rounded">
                              <div className="flex-1">
                                <label className="block text-xs text-gray-600 mb-1">选择卡片</label>
                                <select
                                  value={cardReward.card_id || ''}
                                  onChange={(e) => {
                                    const newRewardCards = [...(extendedRewardData.reward_cards || [])];
                                    newRewardCards[index] = { ...cardReward, card_id: e.target.value };
                                    setExtendedRewardData({
                                      ...extendedRewardData,
                                      reward_cards: newRewardCards
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                >
                                  <option value="">请选择卡片</option>
                                  {availableCards.map((card: any) => (
                                    <option key={card.id} value={card.id}>
                                      {card.name} ({card.rarity})
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="w-20">
                                <label className="block text-xs text-gray-600 mb-1">数量</label>
                                <input
                                  type="number"
                                  value={cardReward.quantity || 1}
                                  onChange={(e) => {
                                    const newRewardCards = [...(extendedRewardData.reward_cards || [])];
                                    newRewardCards[index] = { ...cardReward, quantity: parseInt(e.target.value) || 1 };
                                    setExtendedRewardData({
                                      ...extendedRewardData,
                                      reward_cards: newRewardCards
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  min="1"
                                />
                              </div>
                              <div className="w-20">
                                <label className="block text-xs text-gray-600 mb-1">概率</label>
                                <input
                                  type="number"
                                  step="0.1"
                                  value={cardReward.probability || 1.0}
                                  onChange={(e) => {
                                    const newRewardCards = [...(extendedRewardData.reward_cards || [])];
                                    newRewardCards[index] = { ...cardReward, probability: parseFloat(e.target.value) || 1.0 };
                                    setExtendedRewardData({
                                      ...extendedRewardData,
                                      reward_cards: newRewardCards
                                    });
                                  }}
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                                  min="0"
                                  max="1"
                                />
                              </div>
                              <button
                                onClick={() => handleRemoveCardReward(index)}
                                className="text-red-600 hover:text-red-800 px-2 py-1"
                              >
                                删除
                              </button>
                            </div>
                          ))}
                          {(!extendedRewardData.reward_cards || extendedRewardData.reward_cards.length === 0) && (
                            <div className="text-gray-500 text-sm py-2">暂无卡片奖励，点击上方按钮添加</div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* 保存按钮 */}
                    <div className="flex justify-end">
                      <button
                        onClick={handleSaveRewards}
                        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      >
                        保存奖励配置
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      
      <ToastContainer messages={messages} onClose={removeToast} />
    </Layout>
  );
}