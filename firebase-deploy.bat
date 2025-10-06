@echo off
REM Firebase Deployment Script for TenderBolt NotebookLM
echo 🚀 Starting Firebase deployment for TenderBolt NotebookLM...

REM Check if Firebase CLI is installed
firebase --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Firebase CLI not found. Please install it first:
    echo npm install -g firebase-tools
    pause
    exit /b 1
)

REM Check if user is logged in
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Please login to Firebase first:
    echo firebase login
    pause
    exit /b 1
)

REM Build the project for Firebase
echo 📦 Building project for Firebase...
copy .next.config.firebase.js next.config.js
npm run build

REM Check if build was successful
if %errorlevel% neq 0 (
    echo ❌ Build failed. Please fix the errors and try again.
    pause
    exit /b 1
)

REM Deploy to Firebase
echo 🚀 Deploying to Firebase...
firebase deploy --only hosting

REM Check if deployment was successful
if %errorlevel% equ 0 (
    echo ✅ Deployment successful!
    echo 🌐 Your app is now live at: https://your-project-id.web.app
    echo.
    echo 📋 Next steps:
    echo 1. Update the NEXT_PUBLIC_APP_URL in your environment variables
    echo 2. Configure your Firebase project settings
    echo 3. Set up authentication if needed
) else (
    echo ❌ Deployment failed. Please check the errors above.
    pause
    exit /b 1
)

pause
