/**
 * Clisonix Cloud Industrial Next.js Configuration
 * Production-ready with API rewrites for backend proxy
 * PWA enabled for offline support
 */

import path from "path";
import { fileURLToPath } from "url";
import withPWAInit from "@ducanh2912/next-pwa";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PRODUCTION: Docker internal communication via container names
// DEVELOPMENT: Use localhost for local backend
const isDev = process.env.NODE_ENV === "development";
const API_BASE =
  process.env.API_INTERNAL_URL ||
  (isDev ? "http://localhost:8000" : "http://clisonix-api:8000");
const REPORTING_BASE =
  process.env.REPORTING_INTERNAL_URL ||
  (isDev ? "http://localhost:8000" : "http://clisonix-api:8000");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["framer-motion"],
  staticPageGenerationTimeout: 600,

  // Turbopack root - monorepo root where node_modules/next is located
  turbopack: {
    root: path.resolve(__dirname, "../.."),
  },

  // Fix for monorepo lockfile detection
  outputFileTracingRoot: path.resolve(__dirname, "../.."),

  // ==========================================================================
  // IMAGE OPTIMIZATION (85% size reduction with WebP/AVIF)
  // ==========================================================================
  images: {
    // Enable modern formats
    formats: ["image/avif", "image/webp"],

    // Allowed image domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "clisonix.com",
      },
      {
        protocol: "https",
        hostname: "*.clisonix.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "*.githubusercontent.com",
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

  // Output optimization - using npm start (not standalone)
  // output: 'standalone', // Disabled - using npm start for simpler deployment

  // Server-only packages (not bundled for client)
  serverExternalPackages: ["stripe"],

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
        source: "/:path*",
        headers: [
          { key: "X-DNS-Prefetch-Control", value: "on" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // Cache favicon aggressively to prevent spam requests
      {
        source: "/favicon.ico",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400, immutable" },
        ],
      },
      // Cache static assets aggressively
      {
        source: "/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },

  // CRITICAL: Proxy API requests to backend
  async rewrites() {
    return [
      // Crypto Market API
      {
        source: "/api/crypto/:path*",
        destination: `${API_BASE}/api/crypto/:path*`,
      },
      // Weather API
      {
        source: "/api/weather/:path*",
        destination: `${API_BASE}/api/weather/:path*`,
      },
      // Real Data Dashboard API
      {
        source: "/api/realdata/:path*",
        destination: `${API_BASE}/api/realdata/:path*`,
      },
      // AI Routes
      {
        source: "/api/ai/:path*",
        destination: `${API_BASE}/api/ai/:path*`,
      },
      // Monitoring
      {
        source: "/api/monitoring/:path*",
        destination: `${API_BASE}/api/monitoring/:path*`,
      },
      // System Status
      {
        source: "/api/system-status",
        destination: `${API_BASE}/api/system-status`,
      },
      // Health
      {
        source: "/api/health",
        destination: `${API_BASE}/health`,
      },
      // ASI Trinity Status (Phone Monitor)
      {
        source: "/api/asi-status",
        destination: `${API_BASE}/asi/status`,
      },
      // ASI Health
      {
        source: "/api/asi-health",
        destination: `${API_BASE}/asi/health`,
      },
      // ASI Metrics (all ASI routes)
      {
        source: "/asi/:path*",
        destination: `${API_BASE}/asi/:path*`,
      },
      // Backend proxy (for direct backend calls)
      {
        source: "/backend/:path*",
        destination: `${API_BASE}/:path*`,
      },
      // Backend status specifically
      {
        source: "/backend/status",
        destination: `${API_BASE}/health`,
      },
      // Direct /health endpoint proxy
      {
        source: "/health",
        destination: `${API_BASE}/health`,
      },
      // ===== REPORTING API (Port 8001) =====
      // Docker containers
      {
        source: "/api/reporting/:path*",
        destination: `${REPORTING_BASE}/api/reporting/:path*`,
      },
      // Direct docker stats
      {
        source: "/api/docker-containers",
        destination: `${REPORTING_BASE}/api/reporting/docker-containers`,
      },
      {
        source: "/api/docker-stats",
        destination: `${REPORTING_BASE}/api/reporting/docker-stats`,
      },
      {
        source: "/api/system-metrics",
        destination: `${REPORTING_BASE}/api/reporting/system-metrics`,
      },
      // ===== ALBI EEG API =====
      {
        source: "/api/albi/:path*",
        destination: `${API_BASE}/api/albi/:path*`,
      },
      // ===== ALBA API =====
      {
        source: "/api/alba/:path*",
        destination: `${API_BASE}/api/alba/:path*`,
      },
      // ===== ASI API (general) =====
      {
        source: "/api/asi/:path*",
        destination: `${API_BASE}/api/asi/:path*`,
      },
      // ===== JONA Neural Synthesis API =====
      {
        source: "/api/jona/:path*",
        destination: `${API_BASE}/api/jona/:path*`,
      },
      // ===== Security Status =====
      {
        source: "/api/security/:path*",
        destination: `${API_BASE}/api/security/:path*`,
      },
      // ===== System Health =====
      {
        source: "/api/system/:path*",
        destination: `${API_BASE}/api/system/:path*`,
      },
    ];
  },

  webpack: (config) => {
    config.cache = false;
    return config;
  },

  onDemandEntries: {
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 5,
  },
  allowedDevOrigins: ["localhost:3000", "127.0.0.1:3000", "clisonix.com"],
};

// PWA Configuration
const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 365 * 24 * 60 * 60, // 365 days
          },
        },
      },
      {
        urlPattern: /^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "google-fonts-stylesheets",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        urlPattern: /\.(?:eot|otf|ttc|ttf|woff|woff2|font\.css)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-font-assets",
          expiration: {
            maxEntries: 4,
            maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
          },
        },
      },
      {
        urlPattern: /\.(?:jpg|jpeg|gif|png|svg|ico|webp|avif)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-image-assets",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: /\/_next\/static.+\.js$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "next-static-js-assets",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:mp3|wav|ogg)$/i,
        handler: "CacheFirst",
        options: {
          rangeRequests: true,
          cacheName: "static-audio-assets",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:mp4|webm)$/i,
        handler: "CacheFirst",
        options: {
          rangeRequests: true,
          cacheName: "static-video-assets",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:js)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-js-assets",
          expiration: {
            maxEntries: 64,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\.(?:css|less)$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "static-style-assets",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\/_next\/data\/.+\/.+\.json$/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-data",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
        },
      },
      {
        urlPattern: /\/api\/.*$/i,
        handler: "NetworkFirst",
        method: "GET",
        options: {
          cacheName: "apis",
          expiration: {
            maxEntries: 16,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
          networkTimeoutSeconds: 10,
        },
      },
      {
        urlPattern: /.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "others",
          expiration: {
            maxEntries: 32,
            maxAgeSeconds: 24 * 60 * 60, // 24 hours
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

export default withPWA(nextConfig);
