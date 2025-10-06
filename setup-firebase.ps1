# PowerShell script to set up Firebase deployment for TenderBolt NotebookLM
Write-Host "🚀 Setting up Firebase deployment for TenderBolt NotebookLM..." -ForegroundColor Green

# Check if Firebase CLI is installed
Write-Host "📋 Checking Firebase CLI installation..." -ForegroundColor Yellow
try {
    $firebaseVersion = firebase --version
    Write-Host "✅ Firebase CLI found: $firebaseVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Firebase CLI not found. Installing..." -ForegroundColor Red
    npm install -g firebase-tools
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Firebase CLI installed successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Failed to install Firebase CLI. Please install manually: npm install -g firebase-tools" -ForegroundColor Red
        exit 1
    }
}

# Check if user is logged in
Write-Host "🔐 Checking Firebase authentication..." -ForegroundColor Yellow
try {
    firebase projects:list | Out-Null
    Write-Host "✅ Firebase authentication successful" -ForegroundColor Green
} catch {
    Write-Host "❌ Please login to Firebase first:" -ForegroundColor Red
    Write-Host "Run: firebase login" -ForegroundColor Yellow
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Build the project
Write-Host "🔨 Building project for Firebase..." -ForegroundColor Yellow
Copy-Item .next.config.firebase.js next.config.js -Force
npm run build
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build completed successfully" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed. Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Setup completed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Run: firebase deploy --only hosting" -ForegroundColor White
Write-Host "2. Your app will be available at: https://your-project-id.web.app" -ForegroundColor White
Write-Host "3. Test the Audio Overview at: /en/studio?tenderId=tender_004" -ForegroundColor White
Write-Host ""
Write-Host "🎙️ Audio Overview features ready for Firebase deployment!" -ForegroundColor Magenta
