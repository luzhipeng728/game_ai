'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home,
  Settings,
  Users,
  Map,
  CreditCard,
  Brain,
  FileText,
  BarChart3
} from 'lucide-react';

const menuItems = [
  { 
    name: '仪表盘', 
    href: '/', 
    icon: Home 
  },
  { 
    name: '场景管理', 
    href: '/scenes', 
    icon: Map 
  },
  { 
    name: 'NPC管理', 
    href: '/npcs', 
    icon: Users 
  },
  { 
    name: '卡片管理', 
    href: '/cards', 
    icon: CreditCard 
  },
  { 
    name: 'AI配置', 
    href: '/ai-configs', 
    icon: Brain 
  },
  { 
    name: '配置模板', 
    href: '/templates', 
    icon: FileText 
  },
  { 
    name: '数据分析', 
    href: '/analytics', 
    icon: BarChart3 
  },
  { 
    name: '系统设置', 
    href: '/settings', 
    icon: Settings 
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-gray-900 text-white min-h-screen">
      <div className="p-6">
        <h1 className="text-xl font-bold text-center">苏丹的游戏</h1>
        <p className="text-sm text-gray-400 text-center mt-2">管理后台</p>
      </div>
      
      <nav className="mt-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center px-6 py-3 text-left hover:bg-gray-800 transition-colors ${
                isActive ? 'bg-gray-800 border-r-4 border-blue-500' : ''
              }`}
            >
              <Icon className="w-5 h-5 mr-3" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}