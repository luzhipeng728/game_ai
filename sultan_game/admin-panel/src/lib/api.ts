import axios from 'axios';

const API_BASE_URL = 'http://82.157.9.52:8001';  // 统一使用线上后端地址

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// 场景API
export const sceneAPI = {
  getScenes: () => apiClient.get('/api/scenes/'),
  getScene: (id: string) => apiClient.get(`/api/scenes/${id}`),
  createScene: (data: any) => apiClient.post('/api/scenes/', data),
  updateScene: (id: string, data: any) => apiClient.put(`/api/scenes/${id}`, data),
  deleteScene: (id: string) => apiClient.delete(`/api/scenes/${id}`),
  getSceneConfig: (id: string) => apiClient.get(`/api/scenes/${id}/config`),
  getSceneNPCs: (id: string) => apiClient.get(`/api/scenes/${id}/npcs`),
  addSceneNPC: (id: string, data: any) => apiClient.post(`/api/scenes/${id}/npcs`, data),
  removeSceneNPC: (sceneId: string, npcId: string) => apiClient.delete(`/api/scenes/${sceneId}/npcs/${npcId}`),
  getSceneRewards: (id: string) => apiClient.get(`/api/scenes/${id}/rewards`),
  saveSceneRewards: (id: string, data: any) => apiClient.post(`/api/scenes/${id}/rewards`, data),
  getSceneExtendedRewards: (id: string) => apiClient.get(`/api/scenes/${id}/extended-rewards`),
  saveSceneExtendedRewards: (id: string, data: any) => apiClient.post(`/api/scenes/${id}/extended-rewards`, data),
  getSceneRequirements: (id: string) => apiClient.get(`/api/scenes/${id}/requirements`),
  saveSceneRequirements: (id: string, data: any) => apiClient.post(`/api/scenes/${id}/requirements`, data),
  getSceneCardBindings: (id: string) => apiClient.get(`/api/scenes/${id}/card-bindings`),
  addSceneCardBinding: (id: string, data: any) => apiClient.post(`/api/scenes/${id}/card-bindings`, data),
  removeSceneCardBinding: (sceneId: string, bindingId: string) => apiClient.delete(`/api/scenes/${sceneId}/card-bindings/${bindingId}`),
  getAvailableCards: () => apiClient.get('/api/cards/'),
  getAvailablePlayerNPCs: () => apiClient.get('/api/npcs/'),
  testScene: (id: string) => apiClient.post(`/api/scenes/${id}/test`),
  getSceneDisplayConfig: (id: string) => apiClient.get(`/api/scenes/${id}/display-config`),
  saveSceneDisplayConfig: (id: string, data: any) => apiClient.post(`/api/scenes/${id}/display-config`, data),
  getAllScenesList: () => apiClient.get('/api/scenes/list-all'),
};

// NPC API
export const npcAPI = {
  getNPCs: () => apiClient.get('/api/npcs/'),
  getNPC: (id: string) => apiClient.get(`/api/npcs/${id}`),
  createNPC: (data: any) => apiClient.post('/api/npcs/', data),
  updateNPC: (id: string, data: any) => apiClient.put(`/api/npcs/${id}`, data),
  deleteNPC: (id: string) => apiClient.delete(`/api/npcs/${id}`),
};

// AI配置API
export const aiConfigAPI = {
  getAIConfigs: () => apiClient.get('/api/ai-configs/'),
  getAIConfig: (id: string) => apiClient.get(`/api/ai-configs/${id}`),
  createAIConfig: (data: any) => apiClient.post('/api/ai-configs/', data),
  updateAIConfig: (id: string, data: any) => apiClient.put(`/api/ai-configs/${id}`, data),
  deleteAIConfig: (id: string) => apiClient.delete(`/api/ai-configs/${id}`),
  getAIPerformance: (id: string) => apiClient.get(`/api/ai-configs/${id}/performance`),
  testAIConfig: (id: string, data: any) => apiClient.post(`/api/ai-configs/${id}/test`, data),
  optimizeAIConfig: (id: string) => apiClient.post(`/api/ai-configs/${id}/optimize`),
  getAITypes: () => apiClient.get('/api/ai-configs/types/enum'),
};

// 卡片API
export const cardAPI = {
  getCards: () => apiClient.get('/api/cards/'),
  getCard: (id: string) => apiClient.get(`/api/cards/${id}`),
  createCard: (data: any) => apiClient.post('/api/cards/', data),
  updateCard: (id: string, data: any) => apiClient.put(`/api/cards/${id}`, data),
  deleteCard: (id: string) => apiClient.delete(`/api/cards/${id}`),
};

// 模板API
export const templateAPI = {
  getTemplates: (filters?: { template_type?: string; category?: string; is_public?: boolean }) => 
    apiClient.get('/api/templates/', { params: filters }),
  getTemplate: (id: string) => apiClient.get(`/api/templates/${id}`),
  createTemplate: (data: any) => apiClient.post('/api/templates/', data),
  updateTemplate: (id: string, data: any) => apiClient.put(`/api/templates/${id}`, data),
  deleteTemplate: (id: string) => apiClient.delete(`/api/templates/${id}`),
  createFromScene: (data: any) => apiClient.post('/api/templates/from-scene', data),
  createFromAIConfig: (id: string, name: string, description?: string) => 
    apiClient.post(`/api/templates/from-ai-config/${id}`, null, { params: { template_name: name, description } }),
  applyToScene: (templateId: string, sceneId: string) => 
    apiClient.post(`/api/templates/${templateId}/apply-to-scene/${sceneId}`),
  getCategories: () => apiClient.get('/api/templates/categories/enum'),
  getTypes: () => apiClient.get('/api/templates/types/enum'),
};