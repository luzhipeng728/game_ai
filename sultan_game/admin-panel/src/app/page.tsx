'use client';

import Layout from '../components/Layout';
import { BarChart3, Users, Map, Brain, CreditCard } from 'lucide-react';

export default function Home() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">仪表盘</h1>
          <p className="text-gray-600">欢迎使用苏丹的游戏管理后台</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总场景数</p>
                <p className="text-2xl font-bold text-gray-900">12</p>
              </div>
              <Map className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">NPC数量</p>
                <p className="text-2xl font-bold text-gray-900">48</p>
              </div>
              <Users className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI配置</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
              <Brain className="w-8 h-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">卡片数量</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
              <CreditCard className="w-8 h-8 text-orange-500" />
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">最近活动</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">创建了新场景 "皇宫大厅"</p>
                  <p className="text-xs text-gray-500">2小时前</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">更新了NPC "宰相 哈桑"</p>
                  <p className="text-xs text-gray-500">5小时前</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div>
                  <p className="text-sm text-gray-900">优化了AI配置 "对话生成器"</p>
                  <p className="text-xs text-gray-500">1天前</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">系统状态</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API服务</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">正常</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">数据库</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">正常</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">AI服务</span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">检查中</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">存储空间</span>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">充足</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
