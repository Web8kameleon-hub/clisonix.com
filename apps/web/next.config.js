const { createVanillaExtractPlugin } = require('@vanilla-extract/next-plugin');
const withVanillaExtract = createVanillaExtractPlugin();

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    appDir: true,
  },
  transpilePackages: ['@vanilla-extract/css'],
  async rewrites() {
    return [
      {
        source: '/api/signal-gen/:path*',
        destination: process.env.NODE_ENV === 'production' 
          ? 'http://signal-gen:8088/:path*'
          : 'http://localhost:8088/:path*',
      },
      {
        source: '/api/demo/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'http://pulse-balancer:8001/api/:path*'
          : 'http://localhost:8001/api/:path*',
      },
      {
        source: '/api/security/:path*', 
        destination: process.env.NODE_ENV === 'production'
          ? 'http://security-api:5001/api/:path*'
          : 'http://localhost:5001/api/:path*',
      },
      {
        source: '/api/backend/:path*',
        destination: process.env.NODE_ENV === 'production'
          ? 'http://backend:8000/:path*'
          : 'http://localhost:8000/:path*',
      },
    ];
  },
};

module.exports = withVanillaExtract(nextConfig);