
# Environment Variables Setup for Vercel

## Required Environment Variables

Copy these to your Vercel project settings:

### NextAuth Configuration
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key-here

### Google OAuth (if using)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

### Database (if using)
DATABASE_URL=your-database-connection-string

### Application URL
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add each variable above
5. Redeploy your project

## Quick Setup Commands

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (will prompt for project setup)
vercel

# Set environment variables in Vercel dashboard
# Then deploy to production
vercel --prod
```

## Troubleshooting

### Build Errors
If you get build errors, the current config ignores them:
- ESLint errors are ignored
- TypeScript errors are ignored
- This allows deployment but may cause runtime issues

### Runtime Errors
If you get runtime errors:
1. Check environment variables are set correctly
2. Check database connection
3. Check API routes are working
4. Check NextAuth configuration

### Performance Issues
- Vercel automatically optimizes your app
- Images are optimized automatically
- Static assets are served from CDN
- API routes are serverless functions
