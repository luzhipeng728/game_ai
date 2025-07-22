import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  // 移除前端转发配置，改回直接请求后端
  // async rewrites() {
  //   const backendUrl = process.env.BACKEND_URL || 
  //     (process.env.NODE_ENV === 'production' 
  //       ? 'http://localhost:8001'
  //       : 'http://localhost:8001');
  //   
  //   return [
  //     {
  //       source: '/api/:path*',
  //       destination: `${backendUrl}/api/:path*`
  //     }
  //   ];
  // },
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
