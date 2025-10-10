
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
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
  }
}

module.exports = nextConfig
