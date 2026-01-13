/**
 * Clisonix Cloud Industrial Next.js Configuration
 * Production-ready with API rewrites for backend proxy
 */

// PRODUCTION: Hetzner Server IP (46.224.205.183 / clisonix.com)
// Docker network: 'http://clisonix-api:8000' for internal container communication
// External: 'http://46.224.205.183:8000' for direct access
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://46.224.205.183:8000';
const REPORTING_BASE = process.env.API_INTERNAL_URL || 'http://46.224.205.183:8001';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['framer-motion'],
  staticPageGenerationTimeout: 600,

  // CRITICAL: Proxy API requests to backend
  async rewrites() {
    return [
      // Crypto Market API
      {
        source: '/api/crypto/:path*',
        destination: `${API_BASE}/api/crypto/:path*`,
      },
      // Weather API
      {
        source: '/api/weather/:path*',
        destination: `${API_BASE}/api/weather/:path*`,
      },
      // Real Data Dashboard API
      {
        source: '/api/realdata/:path*',
        destination: `${API_BASE}/api/realdata/:path*`,
      },
      // AI Routes
      {
        source: '/api/ai/:path*',
        destination: `${API_BASE}/api/ai/:path*`,
      },
      // Monitoring
      {
        source: '/api/monitoring/:path*',
        destination: `${API_BASE}/api/monitoring/:path*`,
      },
      // System Status
      {
        source: '/api/system-status',
        destination: `${API_BASE}/api/system-status`,
      },
      // Health
      {
        source: '/api/health',
        destination: `${API_BASE}/health`,
      },
      // ASI Trinity Status (Phone Monitor)
      {
        source: '/api/asi-status',
        destination: `${API_BASE}/asi/status`,
      },
      // ASI Health
      {
        source: '/api/asi-health',
        destination: `${API_BASE}/asi/health`,
      },
      // ASI Metrics (all ASI routes)
      {
        source: '/asi/:path*',
        destination: `${API_BASE}/asi/:path*`,
      },
      // Backend proxy (for direct backend calls)
      {
        source: '/backend/:path*',
        destination: `${API_BASE}/:path*`,
      },
      // Backend status specifically
      {
        source: '/backend/status',
        destination: `${API_BASE}/health`,
      },
      // ===== REPORTING API (Port 8001) =====
      // Docker containers
      {
        source: '/api/reporting/:path*',
        destination: `${REPORTING_BASE}/api/reporting/:path*`,
      },
      // Direct docker stats
      {
        source: '/api/docker-containers',
        destination: `${REPORTING_BASE}/api/reporting/docker-containers`,
      },
      {
        source: '/api/docker-stats',
        destination: `${REPORTING_BASE}/api/reporting/docker-stats`,
      },
      {
        source: '/api/system-metrics',
        destination: `${REPORTING_BASE}/api/reporting/system-metrics`,
      },
    ];
  },

  webpack: (config, { isServer }) => {
    config.cache = false;
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
    '46.224.205.183:3000',
  ],
};

module.exports = nextConfig;
