'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Play, BarChart3, Zap } from 'lucide-react';
import { aiConfigAPI } from '../../lib/api';

interface AIConfig {
  id: string;
  config_id: string;
  name: string;
  ai_type: string;
  base_prompt: string;
  system_prompt?: string;
  model_config?: any;
  character_config?: any;
  evaluation_config?: any;
  generation_config?: any;
  narration_config?: any;
  version: string;
  created_by?: string;
  is_active: boolean;
  created_at?: number;
  updated_at?: number;
}

export default function AIConfigsPage() {
  const [configs, setConfigs] = useState<AIConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AIConfig | null>(null);
  const [aiTypes, setAiTypes] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    config_id: '',
    name: '',
    ai_type: 'narrator',
    base_prompt: '',
    system_prompt: '',
    model_config: '{"temperature": 0.7, "max_tokens": 1000}',
    character_config: '{}',
    evaluation_config: '{}',
    generation_config: '{}',
    narration_config: '{}',
    version: '1.0',
    created_by: 'admin'
  });

  useEffect(() => {
    fetchConfigs();
    fetchAITypes();
  }, []);

  const fetchConfigs = async () => {
    try {
      const response = await aiConfigAPI.getAIConfigs();
      setConfigs(response.data);
    } catch (error) {
      console.error('获取AI配置列表失败:', error);
      alert('获取AI配置列表失败，请检查API服务是否正常运行');
    } finally {
      setLoading(false);
    }
  };

  const fetchAITypes = async () => {
    try {
      const response = await aiConfigAPI.getAITypes();
      setAiTypes(response.data.ai_types);
    } catch (error) {
      console.error('获取AI类型失败:', error);
      setAiTypes(['narrator', 'npc', 'evaluator', 'option_generator']);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // 解析JSON字符串
      const submitData = {
        ...formData,
        model_config: JSON.parse(formData.model_config),
        character_config: JSON.parse(formData.character_config),
        evaluation_config: JSON.parse(formData.evaluation_config),
        generation_config: JSON.parse(formData.generation_config),
        narration_config: JSON.parse(formData.narration_config)
      };

      if (editingConfig) {
        await aiConfigAPI.updateAIConfig(editingConfig.id, submitData);
        alert('AI配置更新成功');
      } else {
        await aiConfigAPI.createAIConfig(submitData);
        alert('AI配置创建成功');
      }
      setShowModal(false);
      setEditingConfig(null);
      resetForm();
      fetchConfigs();
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请检查输入的JSON格式是否正确');
    }
  };

  const handleEdit = (config: AIConfig) => {
    setEditingConfig(config);
    setFormData({
      config_id: config.config_id,
      name: config.name,
      ai_type: config.ai_type,
      base_prompt: config.base_prompt,
      system_prompt: config.system_prompt || '',
      model_config: JSON.stringify(config.model_config || {}, null, 2),
      character_config: JSON.stringify(config.character_config || {}, null, 2),
      evaluation_config: JSON.stringify(config.evaluation_config || {}, null, 2),
      generation_config: JSON.stringify(config.generation_config || {}, null, 2),
      narration_config: JSON.stringify(config.narration_config || {}, null, 2),
      version: config.version,
      created_by: config.created_by || 'admin'
    });
    setShowModal(true);
  };

  const handleDelete = async (config: AIConfig) => {
    if (confirm(`确定要删除AI配置 "${config.name}" 吗？`)) {
      try {
        await aiConfigAPI.deleteAIConfig(config.id);
        alert('AI配置删除成功');
        fetchConfigs();
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败');
      }
    }
  };

  const handleTest = async (config: AIConfig) => {
    try {
      const testData = { prompt: '这是一个测试提示词' };
      const response = await aiConfigAPI.testAIConfig(config.id, testData);
      alert(`测试成功！\n响应时间: ${response.data.response_time_ms}ms\n使用Token: ${response.data.tokens_used}\n响应: ${response.data.response_text}`);
    } catch (error) {
      console.error('测试失败:', error);
      alert('测试失败');
    }
  };

  const handleOptimize = async (config: AIConfig) => {
    try {
      const response = await aiConfigAPI.optimizeAIConfig(config.id);
      alert(`优化成功！\n${response.data.message}\n优化内容:\n${response.data.optimizations.join('\n')}`);
    } catch (error) {
      console.error('优化失败:', error);
      alert('优化失败');
    }
  };

  const resetForm = () => {
    setFormData({
      config_id: '',
      name: '',
      ai_type: 'narrator',
      base_prompt: '',
      system_prompt: '',
      model_config: '{"temperature": 0.7, "max_tokens": 1000}',
      character_config: '{}',
      evaluation_config: '{}',
      generation_config: '{}',
      narration_config: '{}',
      version: '1.0',
      created_by: 'admin'
    });
  };

  const getTypeText = (type: string) => {
    const types: Record<string, string> = {
      narrator: '旁白',
      npc: 'NPC角色',
      evaluator: '评估',
      option_generator: '选项生成'
    };
    return types[type] || type;
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
            <h1 className="text-2xl font-bold text-gray-900">AI配置管理</h1>
            <p className="text-gray-600">管理游戏AI配置和模型参数</p>
          </div>
          <button
            onClick={() => {
              setEditingConfig(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>新建配置</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  配置信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  版本
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {configs.map((config) => (
                <tr key={config.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{config.name}</div>
                      <div className="text-sm text-gray-500">ID: {config.config_id}</div>
                      <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                        {config.base_prompt}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getTypeText(config.ai_type)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {config.version}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      config.is_active 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {config.is_active ? '活跃' : '禁用'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(config)}
                      className="text-blue-600 hover:text-blue-900"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleTest(config)}
                      className="text-green-600 hover:text-green-900"
                      title="测试"
                    >
                      <Play className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOptimize(config)}
                      className="text-purple-600 hover:text-purple-900"
                      title="优化"
                    >
                      <Zap className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => alert('性能分析功能开发中')}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="性能分析"
                    >
                      <BarChart3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(config)}
                      className="text-red-600 hover:text-red-900"
                      title="删除"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {editingConfig ? '编辑AI配置' : '新建AI配置'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    配置ID
                  </label>
                  <input
                    type="text"
                    value={formData.config_id}
                    onChange={(e) => setFormData({...formData, config_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingConfig}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    配置名称
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
                    AI类型
                  </label>
                  <select
                    value={formData.ai_type}
                    onChange={(e) => setFormData({...formData, ai_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {aiTypes.map(type => (
                      <option key={type} value={type}>{getTypeText(type)}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    版本
                  </label>
                  <input
                    type="text"
                    value={formData.version}
                    onChange={(e) => setFormData({...formData, version: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    基础提示词
                  </label>
                  <textarea
                    value={formData.base_prompt}
                    onChange={(e) => setFormData({...formData, base_prompt: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    系统提示词
                  </label>
                  <textarea
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({...formData, system_prompt: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    模型设置 (JSON)
                  </label>
                  <textarea
                    value={formData.model_config}
                    onChange={(e) => setFormData({...formData, model_config: e.target.value})}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder='{"temperature": 0.7, "max_tokens": 1000}'
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色配置 (JSON)
                  </label>
                  <textarea
                    value={formData.character_config}
                    onChange={(e) => setFormData({...formData, character_config: e.target.value})}
                    rows={5}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder='{}'
                  />
                </div>
                
                <div className="md:col-span-2 flex justify-end space-x-3">
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
                    {editingConfig ? '更新' : '创建'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}