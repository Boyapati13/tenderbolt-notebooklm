@echo off
echo 🚀 Deploying TenderBolt NotebookLM to Firebase...

echo 📋 Copying Firebase configuration...
copy next.config.firebase-clean.js next.config.js /Y

echo 🔨 Building application...
call npx next build

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo 📁 Verifying output...
if not exist "out" (
    echo ❌ Output directory not found!
    pause
    exit /b 1
)

echo 🚀 Deploying to Firebase...
call firebase deploy --only hosting

if %ERRORLEVEL% neq 0 (
    echo ❌ Firebase deployment failed!
    pause
    exit /b 1
)

echo ✅ Deployment completed successfully!
echo 🌐 Your app is now live on Firebase!
pause
