Write-Host "🚀 Deploying TenderBolt NotebookLM to Firebase..." -ForegroundColor Green

Write-Host "📋 Copying Firebase configuration..." -ForegroundColor Yellow
Copy-Item "next.config.firebase-clean.js" "next.config.js" -Force

Write-Host "🔨 Building application..." -ForegroundColor Yellow
$buildResult = & npx next build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "📁 Verifying output..." -ForegroundColor Yellow
if (-not (Test-Path "out")) {
    Write-Host "❌ Output directory not found!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "🚀 Deploying to Firebase..." -ForegroundColor Yellow
$deployResult = & firebase deploy --only hosting
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Firebase deployment failed!" -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "✅ Deployment completed successfully!" -ForegroundColor Green
Write-Host "🌐 Your app is now live on Firebase!" -ForegroundColor Green
Read-Host "Press Enter to continue"
