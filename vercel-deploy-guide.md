# Vercel Deployment Guide - TenderBolt NotebookLM

## Why Vercel?
Vercel is the easiest way to deploy Next.js applications because:
- ✅ Native Next.js support (no configuration needed)
- ✅ API routes work out of the box
- ✅ NextAuth works perfectly
- ✅ Database connections supported
- ✅ Automatic deployments from Git
- ✅ Free tier available

## Quick Deployment Steps

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Deploy from your project directory
```bash
vercel
```

### 4. Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- What's your project's name? **tenderbolt-notebooklm**
- In which directory is your code located? **./**

### 5. Set Environment Variables
In the Vercel dashboard, go to your project settings and add:
```
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-database-url
```

### 6. Redeploy
```bash
vercel --prod
```

## Alternative: Deploy from Git

### 1. Push your code to GitHub
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

### 2. Connect to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will automatically detect it's a Next.js app
5. Add your environment variables
6. Click "Deploy"

## Benefits of Vercel

- **Zero Configuration**: Works out of the box
- **Automatic Deployments**: Deploy on every Git push
- **Preview Deployments**: Test changes before going live
- **Global CDN**: Fast loading worldwide
- **Analytics**: Built-in performance monitoring
- **Free Tier**: Generous free usage limits

## Environment Variables Needed

Create a `.env.local` file with:
```env
NEXTAUTH_URL=https://your-project.vercel.app
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
DATABASE_URL=your-database-url
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app
```

## Deployment Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs
```

## Troubleshooting

### Common Issues:
1. **Build Errors**: Check that all dependencies are in `package.json`
2. **Environment Variables**: Make sure all required env vars are set
3. **Database Connection**: Ensure your database is accessible from Vercel
4. **NextAuth Issues**: Verify `NEXTAUTH_URL` matches your domain

### Getting Help:
- Vercel Documentation: https://vercel.com/docs
- Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
- Vercel Community: https://github.com/vercel/vercel/discussions

---

**Recommendation**: Use Vercel for the easiest deployment experience with full Next.js functionality.
