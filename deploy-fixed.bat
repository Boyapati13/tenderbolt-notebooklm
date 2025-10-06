
@echo off
/bin/bash
echo "🚀 Deploying TenderBolt to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "❌ Please login to Vercel first:"
    echo "   vercel login"
    exit 1
fi

# Build with relaxed settings
echo "🔨 Building application..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful"
else
    echo "❌ Build failed"
    exit 1
fi

# Deploy to preview
echo "🚀 Deploying to Vercel preview..."
vercel

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Deployment completed!"
echo "🌐 Your app is now live on Vercel!"
