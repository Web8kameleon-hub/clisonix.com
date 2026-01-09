/**
 * Normalized next.config.js – single source of truth for rewrites
 * Rewrites /api/:path* to backend API (localhost:8000 in dev, clisonix-api:8000 in Docker)
 */
// In Docker, use internal network. Otherwise default to localhost
const API_BASE = process.env.API_INTERNAL_URL || process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000';
const INTERNAL_API_HEADER = 'x-Clisonix-internal';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['framer-motion'],
  staticPageGenerationTimeout: 600,

  experimental: {
    webpackBuildWorker: false,
  },

  webpack: (config, { isServer }) => {
    config.cache = false;
    // Add path aliases
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
    dirs: ['app', 'pages', 'components', 'lib'],
  },
  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  allowedDevOrigins: [
    'localhost:3000',
    '127.0.0.1:3000',
    '192.168.2.122:3000',
  ],

};

module.exports = nextConfig;
