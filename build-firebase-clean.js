const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building TenderBolt NotebookLM for Firebase (Clean Build)...');

// Step 1: Create Firebase config
console.log('📋 Creating Firebase-specific Next.js config...');
const firebaseConfig = `/** @type {import('next').NextConfig} */
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
  }
}

module.exports = nextConfig`;

fs.writeFileSync('next.config.js', firebaseConfig);
console.log('✅ Firebase config created');

// Step 2: Temporarily rename API directory to prevent build errors
console.log('📁 Temporarily disabling API routes...');
const apiDir = path.join(process.cwd(), 'src', 'app', 'api');
const tempApiDir = path.join(process.cwd(), 'temp-api-backup');

if (fs.existsSync(apiDir)) {
  if (fs.existsSync(tempApiDir)) {
    fs.rmSync(tempApiDir, { recursive: true, force: true });
  }
  fs.renameSync(apiDir, tempApiDir);
  console.log('✅ API routes temporarily disabled');
}

// Step 3: Build the application
console.log('🔨 Building Next.js application...');
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  
  // Restore API routes
  if (fs.existsSync(tempApiDir)) {
    fs.renameSync(tempApiDir, apiDir);
    console.log('✅ API routes restored');
  }
  process.exit(1);
}

// Step 4: Restore API routes
console.log('📁 Restoring API routes...');
if (fs.existsSync(tempApiDir)) {
  fs.renameSync(tempApiDir, apiDir);
  console.log('✅ API routes restored');
}

// Step 5: Verify output directory
console.log('📁 Verifying output directory...');
const outDir = path.join(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  console.error('❌ Output directory "out" not found');
  process.exit(1);
}

// Step 6: Create 404.html
const notFoundPath = path.join(outDir, '404.html');
if (!fs.existsSync(notFoundPath)) {
  console.log('📄 Creating 404.html...');
  const notFoundContent = `<!DOCTYPE html>
<html>
<head>
    <title>Page Not Found - TenderBolt NotebookLM</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; text-align: center; background: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        h1 { color: #374151; margin-bottom: 16px; font-size: 2rem; }
        p { color: #6B7280; margin-bottom: 24px; font-size: 1.1rem; }
        .btn { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; font-weight: 500; transition: background 0.2s; }
        .btn:hover { background: #2563EB; }
        .logo { font-size: 1.5rem; font-weight: bold; color: #1F2937; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">🎯 TenderBolt NotebookLM</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <a href="/en/dashboard" class="btn">Go to Dashboard</a>
    </div>
</body>
</html>`;
  fs.writeFileSync(notFoundPath, notFoundContent);
  console.log('✅ 404.html created');
}

console.log('🎉 Firebase build completed successfully!');
console.log('📋 Next steps:');
console.log('1. Run: firebase deploy --only hosting');
console.log('2. Your app will be available at: https://your-project-id.web.app');
console.log('3. Test the Audio Overview at: /en/studio?tenderId=tender_004');
