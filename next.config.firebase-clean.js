/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_APP_URL: 'https://your-project-id.web.app'
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Exclude API routes from static export
  async generateStaticParams() {
    return [];
  },
  // Disable API routes
  async rewrites() {
    return [];
  }
}

module.exports = nextConfig
