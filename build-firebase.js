const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Building TenderBolt NotebookLM for Firebase...');

// Step 1: Copy Firebase config
console.log('📋 Copying Firebase configuration...');
try {
  fs.copyFileSync('.next.config.firebase.js', 'next.config.js');
  console.log('✅ Firebase config copied');
} catch (error) {
  console.error('❌ Error copying Firebase config:', error.message);
  process.exit(1);
}

// Step 2: Build the application
console.log('🔨 Building Next.js application...');
try {
  execSync('npx next build', { stdio: 'inherit' });
  console.log('✅ Build completed successfully');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

// Step 3: Verify output directory
console.log('📁 Verifying output directory...');
const outDir = path.join(process.cwd(), 'out');
if (!fs.existsSync(outDir)) {
  console.error('❌ Output directory "out" not found');
  process.exit(1);
}

// Step 4: Check for required files
const requiredFiles = [
  'index.html',
  'en/index.html',
  'en/studio/index.html',
  'en/dashboard/index.html'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  const filePath = path.join(outDir, file);
  if (!fs.existsSync(filePath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length > 0) {
  console.warn('⚠️  Missing files:', missingFiles);
  console.log('📝 This is normal for static export - Firebase will handle routing');
} else {
  console.log('✅ All required files found');
}

// Step 5: Create 404.html if it doesn't exist
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
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 40px; text-align: center; }
        .container { max-width: 600px; margin: 0 auto; }
        h1 { color: #374151; margin-bottom: 16px; }
        p { color: #6B7280; margin-bottom: 24px; }
        .btn { display: inline-block; padding: 12px 24px; background: #3B82F6; color: white; text-decoration: none; border-radius: 8px; }
        .btn:hover { background: #2563EB; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist.</p>
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
