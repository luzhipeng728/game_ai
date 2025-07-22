import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  async rewrites() {
    // 读取环境变量，支持自定义后端地址
    const backendUrl = process.env.BACKEND_URL || 
      (process.env.NODE_ENV === 'production' 
        ? 'http://localhost:8001'  // 生产环境默认本地后端
        : 'http://localhost:8001'); // 开发环境本地后端
    
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // 添加 webpack 配置来确保路径别名正确解析
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };
    return config;
  },
  // 实验性功能，确保路径别名正确解析
  experimental: {
    externalDir: true,
  },
  // 添加 allowedDevOrigins 配置
  allowedDevOrigins: ['82.197.94.152', 'game_ai.luzhipeng.com'],
};

export default nextConfig;
