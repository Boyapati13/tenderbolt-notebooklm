/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
    domains: ['localhost', 'your-project.vercel.app']
  },
  env: {
    // Allow overriding via .env or env var; otherwise pick sensible default per env
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL 
      || (process.env.NODE_ENV === 'production' 
        ? 'https://your-project.vercel.app' 
        : `http://localhost:${process.env.PORT || 3000}`),
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverRuntimeConfig: {
    timeouts: {
      read: 10000,
      write: 10000
    }
  },
  async redirects() {
    return [
      {
        source: '/error',
        destination: '/500',
        permanent: false,
      }
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=3600, must-revalidate'
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig
