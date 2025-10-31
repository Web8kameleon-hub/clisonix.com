import type { NextConfig } from "next";

const INTERNAL_API_HEADER = 'x-neurosonix-internal';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8000/api/:path*',
        missing: [
          {
            type: 'header',
            key: INTERNAL_API_HEADER,
            value: '1'
          }
        ]
      },
      {
        source: '/health',
        destination: 'http://localhost:8000/health'
      },
      {
        source: '/agi-api/:path*',
        destination: 'http://localhost:8001/:path*'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },
};

export default nextConfig;
