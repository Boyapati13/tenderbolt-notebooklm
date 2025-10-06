@echo off
echo ========================================
echo Syntara Tenders AI - Desktop App Setup
echo ========================================
echo.

echo Step 1: Installing Electron dependencies...
npm install electron electron-builder concurrently wait-on electron-is-dev --save-dev

echo.
echo Step 2: Building Next.js app for desktop...
npm run build:desktop

echo.
echo Step 3: Creating Windows installer...
npm run electron-pack

echo.
echo ========================================
echo Setup Complete!
echo ========================================
echo.
echo Your Windows installer is ready in the 'dist' folder.
echo You can now distribute and install the Syntara Tenders AI desktop app.
echo.
pause
