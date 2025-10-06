# Syntara Tenders AI - Desktop App Setup Script
# PowerShell version for Windows

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Syntara Tenders AI - Desktop App Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js detected: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js not found. Please install Node.js first." -ForegroundColor Red
    Write-Host "Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if npm is available
try {
    $npmVersion = npm --version
    Write-Host "✓ npm detected: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ npm not found. Please install npm first." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 1: Installing Electron dependencies..." -ForegroundColor Yellow
npm install electron electron-builder concurrently wait-on electron-is-dev --save-dev

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green

Write-Host ""
Write-Host "Step 2: Building Next.js app for desktop..." -ForegroundColor Yellow
npm run build:desktop

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to build Next.js app" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Next.js app built successfully" -ForegroundColor Green

Write-Host ""
Write-Host "Step 3: Creating Windows installer..." -ForegroundColor Yellow
npm run electron-pack

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to create installer" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Windows installer created successfully" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Your Windows installer is ready in the 'dist' folder." -ForegroundColor Green
Write-Host "You can now distribute and install the Syntara Tenders AI desktop app." -ForegroundColor Green
Write-Host ""
Write-Host "Installer location: .\dist\Syntara Tenders AI Setup.exe" -ForegroundColor Yellow
Write-Host ""

# Ask if user wants to run the installer
$runInstaller = Read-Host "Would you like to run the installer now? (y/n)"
if ($runInstaller -eq "y" -or $runInstaller -eq "Y") {
    Write-Host "Launching installer..." -ForegroundColor Yellow
    Start-Process ".\dist\Syntara Tenders AI Setup.exe"
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
