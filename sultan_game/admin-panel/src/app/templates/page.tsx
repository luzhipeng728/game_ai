'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { ToastContainer, useToast } from '../../components/Toast';
import { FileText, Download, Upload, Edit, Trash2, Plus, Play } from 'lucide-react';
import { templateAPI, sceneAPI, aiConfigAPI } from '../../lib/api';

interface Template {
  id: string;
  template_id: string;
  name: string;
  template_type: string;
  category: string;
  description?: string;
  author?: string;
  version: string;
  tags: string[];
  usage_count: number;
  is_active: boolean;
  is_public: boolean;
  is_official: boolean;
  created_at?: number;
  updated_at?: number;
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [scenes, setScenes] = useState<any[]>([]);
  const [aiConfigs, setAIConfigs] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    template_id: '',
    name: '',
    template_type: 'ai_config',
    category: 'dialogue',
    description: '',
    author: '系统',
    template_data: {}
  });
  const { messages, removeToast, toast } = useToast();

  useEffect(() => {
    fetchTemplates();
    fetchScenes();
    fetchAIConfigs();
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await templateAPI.getTemplates();
      setTemplates(response.data);
    } catch (error) {
      toast.error('获取模板列表失败', '请检查API服务是否正常运行');
    } finally {
      setLoading(false);
    }
  };

  const fetchScenes = async () => {
    try {
      const response = await sceneAPI.getScenes();
      setScenes(response.data);
    } catch (error) {
      console.error('获取场景列表失败:', error);
    }
  };

  const fetchAIConfigs = async () => {
    try {
      const response = await aiConfigAPI.getAIConfigs();
      setAIConfigs(response.data);
    } catch (error) {
      console.error('获取AI配置列表失败:', error);
    }
  };

  const handleDelete = async (template: Template) => {
    if (!confirm('确定要删除这个模板吗？')) return;
    
    try {
      await templateAPI.deleteTemplate(template.id);
      toast.success('模板删除成功');
      fetchTemplates();
    } catch (error) {
      toast.error('删除失败', '请稍后重试');
    }
  };

  const handleCreateFromScene = async (sceneId: string) => {
    const sceneName = scenes.find(s => s.id === sceneId)?.name || '未知场景';
    const templateName = prompt('请输入模板名称:', `${sceneName}模板`);
    if (!templateName) return;

    try {
      await templateAPI.createFromScene({
        scene_id: sceneId,
        template_name: templateName,
        description: `从场景 '${sceneName}' 生成的模板`
      });
      toast.success('模板创建成功', '已从场景生成新模板');
      fetchTemplates();
    } catch (error) {
      toast.error('创建模板失败', '请稍后重试');
    }
  };

  const handleCreateFromAIConfig = async (aiConfigId: string) => {
    const aiConfigName = aiConfigs.find(a => a.id === aiConfigId)?.name || '未知配置';
    const templateName = prompt('请输入模板名称:', `${aiConfigName}模板`);
    if (!templateName) return;

    try {
      await templateAPI.createFromAIConfig(aiConfigId, templateName, `从AI配置 '${aiConfigName}' 生成的模板`);
      toast.success('模板创建成功', '已从AI配置生成新模板');
      fetchTemplates();
    } catch (error) {
      toast.error('创建模板失败', '请稍后重试');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      dialogue: 'bg-blue-100 text-blue-800',
      combat: 'bg-red-100 text-red-800',
      political: 'bg-purple-100 text-purple-800',
      economic: 'bg-green-100 text-green-800',
      stealth: 'bg-gray-100 text-gray-800',
      social: 'bg-pink-100 text-pink-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      scene: '场景模板',
      ai_config: 'AI配置模板',
      npc_config: 'NPC配置模板',
      composite: '复合模板'
    };
    return labels[type as keyof typeof labels] || type;
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">配置模板</h1>
            <p className="text-gray-600">管理AI配置和场景的预设模板</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Upload className="w-4 h-4" />
              <span>导入模板</span>
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>新建模板</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <span className="text-sm text-gray-500">使用 {template.usage_count} 次</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                <p className="text-xs text-gray-500 mb-4">作者: {template.author} | 版本: {template.version}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                      {getTypeLabel(template.template_type)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => toast.info('编辑功能', '编辑模板功能开发中')}
                    className="text-blue-600 hover:text-blue-900"
                    title="编辑"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toast.info('导出功能', '导出模板功能开发中')}
                    className="text-green-600 hover:text-green-900"
                    title="导出"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(template)}
                    className="text-red-600 hover:text-red-900"
                    title="删除"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">快速操作</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">从现有场景生成模板</h4>
              <select 
                onChange={(e) => e.target.value && handleCreateFromScene(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                defaultValue=""
              >
                <option value="">选择场景...</option>
                {scenes.map((scene) => (
                  <option key={scene.id} value={scene.id}>{scene.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">从AI配置生成模板</h4>
              <select 
                onChange={(e) => e.target.value && handleCreateFromAIConfig(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                defaultValue=""
              >
                <option value="">选择AI配置...</option>
                {aiConfigs.map((config) => (
                  <option key={config.id} value={config.id}>{config.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      <ToastContainer messages={messages} onClose={removeToast} />
    </Layout>
  );
}