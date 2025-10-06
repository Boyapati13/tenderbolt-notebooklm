#!/bin/bash

# Firebase Deployment Script for TenderBolt NotebookLM
echo "🚀 Starting Firebase deployment for TenderBolt NotebookLM..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Please login to Firebase first:"
    echo "firebase login"
    exit 1
fi

# Build the project for Firebase
echo "📦 Building project for Firebase..."
cp .next.config.firebase.js next.config.js
npm run build

# Check if build was successful
if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

# Deploy to Firebase
echo "🚀 Deploying to Firebase..."
firebase deploy --only hosting

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your app is now live at: https://your-project-id.web.app"
    echo ""
    echo "📋 Next steps:"
    echo "1. Update the NEXT_PUBLIC_APP_URL in your environment variables"
    echo "2. Configure your Firebase project settings"
    echo "3. Set up authentication if needed"
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi
