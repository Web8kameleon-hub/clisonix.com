/**
 * Clisonix Cloud Industrial Next.js Configuration
 * Production-ready with API rewrites for backend proxy
 */

// PRODUCTION: Docker internal communication
// Docker network: 'http://api:8000' for internal container communication
// External: 'http://46.224.205.183:8000' for direct access
const API_BASE = process.env.API_INTERNAL_URL || 'http://api:8000';
const REPORTING_BASE = process.env.REPORTING_INTERNAL_URL || 'http://api:8000';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['framer-motion'],
  staticPageGenerationTimeout: 600,

  // ==========================================================================
  // IMAGE OPTIMIZATION (85% size reduction with WebP/AVIF)
  // ==========================================================================
  images: {
    // Enable modern formats
    formats: ['image/avif', 'image/webp'],

    // Allowed image domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'clisonix.com',
      },
      {
        protocol: 'http',
        hostname: '46.224.205.183',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.githubusercontent.com',
      },
    ],

    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Optimization quality (75 is good balance)
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
  },

  // ==========================================================================
  // COMPRESSION & PERFORMANCE
  // ==========================================================================
  compress: true,
  poweredByHeader: false, // Security: hide X-Powered-By

  // Output optimization
  output: 'standalone', // For Docker deployment

  // Experimental features for better performance
  experimental: {
    // optimizeCss disabled - requires critters module
    // optimizeCss: true,
  },

  // ==========================================================================
  // SECURITY HEADERS
  // ==========================================================================
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      // Cache static assets aggressively
      {
        source: '/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },

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
      // Direct /health endpoint proxy
      {
        source: '/health',
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
      // ===== ALBI EEG API =====
      {
        source: '/api/albi/:path*',
        destination: `${API_BASE}/api/albi/:path*`,
      },
      // ===== ALBA API =====
      {
        source: '/api/alba/:path*',
        destination: `${API_BASE}/api/alba/:path*`,
      },
      // ===== ASI API (general) =====
      {
        source: '/api/asi/:path*',
        destination: `${API_BASE}/api/asi/:path*`,
      },
      // ===== JONA Neural Synthesis API =====
      {
        source: '/api/jona/:path*',
        destination: `${API_BASE}/api/jona/:path*`,
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
