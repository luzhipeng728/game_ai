import type { NextConfig } from "next";
import path from 'path';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'https://your-backend-domain.com/:path*' 
          : 'http://localhost:8001/:path*'
      }
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
  // 添加 allowedDevOrigins 配置
  allowedDevOrigins: ['82.197.94.152'],
};

export default nextConfig;
