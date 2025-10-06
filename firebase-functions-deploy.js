const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Deploying TenderBolt to Firebase Functions + Hosting...');

// Step 1: Install Firebase Functions dependencies
console.log('📦 Installing Firebase Functions dependencies...');
try {
  execSync('npm install firebase-functions firebase-admin', { stdio: 'inherit' });
  console.log('✅ Firebase Functions dependencies installed');
} catch (error) {
  console.error('❌ Error installing Firebase Functions dependencies:', error.message);
  process.exit(1);
}

// Step 2: Create Firebase Functions configuration
console.log('⚙️ Creating Firebase Functions configuration...');

const functionsPackageJson = {
  "name": "tenderbolt-functions",
  "version": "1.0.0",
  "description": "TenderBolt Firebase Functions",
  "main": "index.js",
  "engines": {
    "node": "18"
  },
  "dependencies": {
    "firebase-functions": "^4.8.0",
    "firebase-admin": "^12.0.0",
    "next": "^15.5.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
};

const functionsIndexJs = `
const { onRequest } = require('firebase-functions/v2/https');
const { onRequest: onRequestV1 } = require('firebase-functions/v1/https');
const next = require('next');

const nextApp = next({
  dev: false,
  conf: {
    distDir: '.next'
  }
});

const nextHandler = nextApp.getRequestHandler();

// Export the Next.js app as a Firebase Function
exports.nextjsFunc = onRequest({
  region: 'us-central1',
  memory: '1GiB',
  timeoutSeconds: 60,
  maxInstances: 10
}, async (req, res) => {
  return nextHandler(req, res);
});

// Fallback for older Firebase Functions
exports.nextjsFuncV1 = onRequestV1(async (req, res) => {
  return nextHandler(req, res);
});
`;

// Create functions directory structure
const functionsDir = path.join(process.cwd(), 'functions');
if (!fs.existsSync(functionsDir)) {
  fs.mkdirSync(functionsDir, { recursive: true });
}

fs.writeFileSync(path.join(functionsDir, 'package.json'), JSON.stringify(functionsPackageJson, null, 2));
fs.writeFileSync(path.join(functionsDir, 'index.js'), functionsIndexJs);

console.log('✅ Firebase Functions configuration created');

// Step 3: Update firebase.json for Functions + Hosting
console.log('📝 Updating firebase.json for Functions + Hosting...');

const firebaseConfig = {
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "function": "nextjsFunc"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|png|jpg|jpeg|gif|ico|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "max-age=31536000"
          }
        ]
      }
    ]
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
};

fs.writeFileSync('firebase.json', JSON.stringify(firebaseConfig, null, 2));
console.log('✅ firebase.json updated for Functions + Hosting');

// Step 4: Create Next.js config for Firebase Functions
console.log('⚙️ Creating Next.js config for Firebase Functions...');

const nextConfigFirebaseFunctions = `
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Don't use static export for Firebase Functions
  output: 'standalone',
  distDir: '.next',
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

module.exports = nextConfig
`;

fs.writeFileSync('.next.config.firebase-functions.js', nextConfigFirebaseFunctions);
console.log('✅ Next.js config for Firebase Functions created');

// Step 5: Build the application
console.log('🔨 Building Next.js application for Firebase Functions...');
try {
  // Copy Firebase Functions config
  fs.copyFileSync('.next.config.firebase-functions.js', 'next.config.js');
  
  // Build the app
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Next.js application built successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 6: Install functions dependencies
console.log('📦 Installing functions dependencies...');
try {
  execSync('cd functions && npm install', { stdio: 'inherit' });
  console.log('✅ Functions dependencies installed');
} catch (error) {
  console.error('❌ Error installing functions dependencies:', error.message);
  process.exit(1);
}

console.log('🎉 Firebase Functions + Hosting setup completed!');
console.log('');
console.log('Next steps:');
console.log('1. Update your Firebase project ID in .next.config.firebase-functions.js');
console.log('2. Run: firebase deploy');
console.log('3. Your app will be available at: https://your-project-id.web.app');
console.log('');
console.log('Note: This setup uses Firebase Functions for server-side code and Firebase Hosting for static assets.');
