const fs = require('fs');
const path = require('path');

const configs = {
  development: `/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production' 
      ? 'https://your-project-id.web.app' 
      : 'http://localhost:3002'
  }
}

module.exports = nextConfig`,

  firebase: `/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  distDir: 'out',
  images: {
    unoptimized: true
  },
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === 'production' 
      ? 'https://your-project-id.web.app' 
      : 'http://localhost:3002'
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  }
}

module.exports = nextConfig`
};

const mode = process.argv[2];

if (!mode || !configs[mode]) {
  console.log('Usage: node switch-config.js [development|firebase]');
  console.log('Available modes:');
  console.log('  development - For local development server');
  console.log('  firebase    - For Firebase static export');
  process.exit(1);
}

console.log(`🔄 Switching to ${mode} configuration...`);

try {
  fs.writeFileSync('next.config.js', configs[mode]);
  console.log(`✅ Switched to ${mode} configuration`);
  
  if (mode === 'development') {
    console.log('📋 Next steps:');
    console.log('1. Run: npm run dev');
    console.log('2. Open: http://localhost:3002/en/dashboard');
  } else if (mode === 'firebase') {
    console.log('📋 Next steps:');
    console.log('1. Run: npm run build');
    console.log('2. Run: firebase deploy --only hosting');
  }
} catch (error) {
  console.error('❌ Error switching configuration:', error.message);
  process.exit(1);
}
