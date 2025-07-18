'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Crown, Sword, Shield } from 'lucide-react';
import { npcAPI } from '../../lib/api';

interface NPC {
  id: string;
  npc_id: string;
  name: string;
  faction: string;
  npc_type: string;
  tier: string;
  intelligence: number;
  strength: number;
  defense: number;
  hp_max: number;
  charisma?: number;
  loyalty?: number;
  fear?: number;
  description?: string;
  is_active: boolean;
  created_at?: number;
  updated_at?: number;
}

export default function NPCsPage() {
  const [npcs, setNpcs] = useState<NPC[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNPC, setEditingNPC] = useState<NPC | null>(null);
  const [formData, setFormData] = useState({
    npc_id: '',
    name: '',
    faction: 'sultan',
    npc_type: 'game_npc',
    tier: 'bronze',
    intelligence: 10,
    strength: 10,
    defense: 10,
    hp_max: 100,
    charisma: 50,
    loyalty: 50,
    fear: 0,
    description: ''
  });

  useEffect(() => {
    fetchNPCs();
  }, []);

  const fetchNPCs = async () => {
    try {
      const response = await npcAPI.getNPCs();
      setNpcs(response.data);
    } catch (error) {
      console.error('获取NPC列表失败:', error);
      alert('获取NPC列表失败，请检查API服务是否正常运行');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingNPC) {
        await npcAPI.updateNPC(editingNPC.id, formData);
        alert('NPC更新成功');
      } else {
        await npcAPI.createNPC(formData);
        alert('NPC创建成功');
      }
      setShowModal(false);
      setEditingNPC(null);
      resetForm();
      fetchNPCs();
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请检查输入数据');
    }
  };

  const handleEdit = (npc: NPC) => {
    setEditingNPC(npc);
    setFormData({
      npc_id: npc.npc_id,
      name: npc.name,
      faction: npc.faction,
      npc_type: npc.npc_type,
      tier: npc.tier,
      intelligence: npc.intelligence,
      strength: npc.strength,
      defense: npc.defense,
      hp_max: npc.hp_max,
      charisma: npc.charisma || 50,
      loyalty: npc.loyalty || 50,
      fear: npc.fear || 0,
      description: npc.description || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (npc: NPC) => {
    if (confirm(`确定要删除NPC "${npc.name}" 吗？`)) {
      try {
        await npcAPI.deleteNPC(npc.id);
        alert('NPC删除成功');
        fetchNPCs();
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      npc_id: '',
      name: '',
      faction: 'sultan',
      npc_type: 'game_npc',
      tier: 'bronze',
      intelligence: 10,
      strength: 10,
      defense: 10,
      hp_max: 100,
      charisma: 50,
      loyalty: 50,
      fear: 0,
      description: ''
    });
  };

  const getFactionText = (faction: string) => {
    const factions: Record<string, string> = {
      sultan: '苏丹王',
      minister: '大臣',
      military: '将军',
      blackduck: '黑鸭会',
      commoner: '平民',
      scholar: '学者'
    };
    return factions[faction] || faction;
  };

  const getTypeText = (type: string) => {
    const types: Record<string, string> = {
      game_npc: '游戏NPC',
      player_npc: '玩家NPC'
    };
    return types[type] || type;
  };

  const getTierIcon = (tier: string) => {
    const tierIcons: Record<string, JSX.Element> = {
      bronze: <span className="w-4 h-4 inline-block rounded-full bg-orange-600"></span>,
      silver: <span className="w-4 h-4 inline-block rounded-full bg-gray-400"></span>,
      gold: <Crown className="w-4 h-4 text-yellow-500" />,
      legendary: <Crown className="w-4 h-4 text-purple-500" />
    };
    return tierIcons[tier] || null;
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
            <h1 className="text-2xl font-bold text-gray-900">NPC管理</h1>
            <p className="text-gray-600">管理游戏角色和属性</p>
          </div>
          <button
            onClick={() => {
              setEditingNPC(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>新建NPC</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  角色信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  阵营
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  属性
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
              {npcs.map((npc) => (
                <tr key={npc.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTierIcon(npc.tier)}
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900">{npc.name}</div>
                        <div className="text-sm text-gray-500">ID: {npc.npc_id}</div>
                        {npc.description && (
                          <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                            {npc.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{getFactionText(npc.faction)}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      npc.npc_type === 'game_npc' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {getTypeText(npc.npc_type)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2 text-sm">
                      <div className="flex items-center">
                        <Shield className="w-3 h-3 text-blue-500 mr-1" />
                        <span>{npc.intelligence}</span>
                      </div>
                      <div className="flex items-center">
                        <Sword className="w-3 h-3 text-red-500 mr-1" />
                        <span>{npc.strength}</span>
                      </div>
                      <div className="flex items-center">
                        <Shield className="w-3 h-3 text-green-500 mr-1" />
                        <span>{npc.defense}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-600 mr-2">HP:</span>
                        <span className="text-gray-900">{npc.hp_max}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className="text-gray-600 mr-2">忠诚:</span>
                        <span className="text-gray-900">{npc.loyalty || '--'}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(npc)}
                      className="text-blue-600 hover:text-blue-900"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(npc)}
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
                {editingNPC ? '编辑NPC' : '新建NPC'}
              </h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NPC ID
                  </label>
                  <input
                    type="text"
                    value={formData.npc_id}
                    onChange={(e) => setFormData({...formData, npc_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingNPC}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    角色名称
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
                    阵营
                  </label>
                  <select
                    value={formData.faction}
                    onChange={(e) => setFormData({...formData, faction: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sultan">苏丹王</option>
                    <option value="minister">大臣</option>
                    <option value="military">将军</option>
                    <option value="blackduck">黑鸭会</option>
                    <option value="commoner">平民</option>
                    <option value="scholar">学者</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    NPC类型
                  </label>
                  <select
                    value={formData.npc_type}
                    onChange={(e) => setFormData({...formData, npc_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="game_npc">游戏NPC</option>
                    <option value="player_npc">玩家NPC</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    稀有度
                  </label>
                  <select
                    value={formData.tier}
                    onChange={(e) => setFormData({...formData, tier: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="bronze">青铜</option>
                    <option value="silver">白银</option>
                    <option value="gold">黄金</option>
                    <option value="legendary">传说</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    智力 (1-20)
                  </label>
                  <input
                    type="number"
                    value={formData.intelligence}
                    onChange={(e) => setFormData({...formData, intelligence: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="20"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    力量 (1-100)
                  </label>
                  <input
                    type="number"
                    value={formData.strength}
                    onChange={(e) => setFormData({...formData, strength: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    防御 (1-100)
                  </label>
                  <input
                    type="number"
                    value={formData.defense}
                    onChange={(e) => setFormData({...formData, defense: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    魅力 (1-100)
                  </label>
                  <input
                    type="number"
                    value={formData.charisma}
                    onChange={(e) => setFormData({...formData, charisma: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    忠诚 (1-100)
                  </label>
                  <input
                    type="number"
                    value={formData.loyalty}
                    onChange={(e) => setFormData({...formData, loyalty: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    恐惧 (0-100)
                  </label>
                  <input
                    type="number"
                    value={formData.fear}
                    onChange={(e) => setFormData({...formData, fear: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="0"
                    max="100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    最大生命值 (1-500)
                  </label>
                  <input
                    type="number"
                    value={formData.hp_max}
                    onChange={(e) => setFormData({...formData, hp_max: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="500"
                    required
                  />
                </div>
                
                <div className="lg:col-span-3">
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
                
                <div className="lg:col-span-3 flex justify-end space-x-3">
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
                    {editingNPC ? '更新' : '创建'}
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