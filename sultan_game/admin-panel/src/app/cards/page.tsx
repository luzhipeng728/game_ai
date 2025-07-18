'use client';

import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { Plus, Edit, Trash2, Star, Zap } from 'lucide-react';
import { cardAPI } from '../../lib/api';

interface Card {
  id: string;
  card_id: string;
  name: string;
  rarity: string;
  category: string;
  description?: string;
  effect_type: string;
  is_active: boolean;
  created_at?: number;
  updated_at?: number;
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [formData, setFormData] = useState({
    card_id: '',
    name: '',
    rarity: 'common',
    category: 'attribute',
    description: '',
    effect_type: 'instant'
  });

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await cardAPI.getCards();
      setCards(response.data);
    } catch (error) {
      console.error('获取卡片列表失败:', error);
      alert('获取卡片列表失败，请检查API服务是否正常运行');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCard) {
        await cardAPI.updateCard(editingCard.id, formData);
        alert('卡片更新成功');
      } else {
        await cardAPI.createCard(formData);
        alert('卡片创建成功');
      }
      setShowModal(false);
      setEditingCard(null);
      resetForm();
      fetchCards();
    } catch (error) {
      console.error('操作失败:', error);
      alert('操作失败，请检查输入数据');
    }
  };

  const handleEdit = (card: Card) => {
    setEditingCard(card);
    setFormData({
      card_id: card.card_id,
      name: card.name,
      rarity: card.rarity,
      category: card.category,
      description: card.description || '',
      effect_type: card.effect_type
    });
    setShowModal(true);
  };

  const handleDelete = async (card: Card) => {
    if (confirm(`确定要删除卡片 "${card.name}" 吗？`)) {
      try {
        await cardAPI.deleteCard(card.id);
        alert('卡片删除成功');
        fetchCards();
      } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      card_id: '',
      name: '',
      rarity: 'common',
      category: 'attribute',
      description: '',
      effect_type: 'instant'
    });
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'common': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityText = (rarity: string) => {
    const rarities: Record<string, string> = {
      legendary: '传说',
      epic: '史诗',
      rare: '稀有',
      common: '普通'
    };
    return rarities[rarity] || rarity;
  };

  const getCategoryText = (category: string) => {
    const categories: Record<string, string> = {
      attribute: '属性增强',
      access: '通行证',
      influence: '影响判定',
      special: '特殊功能'
    };
    return categories[category] || category;
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
            <h1 className="text-2xl font-bold text-gray-900">卡片管理</h1>
            <p className="text-gray-600">管理游戏卡片和效果</p>
          </div>
          <button
            onClick={() => {
              setEditingCard(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>新建卡片</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  卡片信息
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  稀有度
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  效果类型
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {cards.map((card) => (
                <tr key={card.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{card.name}</div>
                        <div className="text-sm text-gray-500">ID: {card.card_id}</div>
                        {card.description && (
                          <div className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                            {card.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRarityColor(card.rarity)}`}>
                      {getRarityText(card.rarity)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCategoryText(card.category)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Zap className="w-4 h-4 text-blue-500 mr-1" />
                      <span className="text-sm text-gray-900">{card.effect_type}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(card)}
                      className="text-blue-600 hover:text-blue-900"
                      title="编辑"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(card)}
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
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">
                {editingCard ? '编辑卡片' : '新建卡片'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    卡片ID
                  </label>
                  <input
                    type="text"
                    value={formData.card_id}
                    onChange={(e) => setFormData({...formData, card_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    disabled={!!editingCard}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    卡片名称
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
                    稀有度
                  </label>
                  <select
                    value={formData.rarity}
                    onChange={(e) => setFormData({...formData, rarity: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="common">普通</option>
                    <option value="rare">稀有</option>
                    <option value="epic">史诗</option>
                    <option value="legendary">传说</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    卡片类型
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="attribute">属性增强</option>
                    <option value="access">通行证</option>
                    <option value="influence">影响判定</option>
                    <option value="special">特殊功能</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    效果类型
                  </label>
                  <select
                    value={formData.effect_type}
                    onChange={(e) => setFormData({...formData, effect_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="instant">立即效果</option>
                    <option value="duration">持续效果</option>
                    <option value="permanent">永久效果</option>
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
                    {editingCard ? '更新' : '创建'}
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