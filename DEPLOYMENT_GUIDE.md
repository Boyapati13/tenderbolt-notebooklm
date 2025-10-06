# 🚀 Syntara Tenders AI - Cloud Deployment Guide

## 📋 Overview
This guide provides comprehensive instructions for deploying the Syntara Tenders AI application to various cloud platforms including Vercel, AWS, Google Cloud, and Azure.

## 🏗️ Architecture
- **Frontend**: Next.js 15 with React 18
- **Backend**: Next.js API Routes
- **Database**: SQLite (development) / PostgreSQL (production)
- **AI Integration**: Google Gemini AI
- **File Storage**: Google Cloud Storage
- **Authentication**: Custom JWT-based auth

## 📦 Prerequisites

### Required Accounts & Services
1. **Google Cloud Platform**
   - Google Gemini AI API key
   - Google Cloud Storage bucket
   - Google Drive API credentials

2. **Database Provider** (Choose one)
   - PostgreSQL (recommended for production)
   - MySQL
   - SQLite (development only)

3. **Cloud Platform** (Choose one)
   - Vercel (recommended for Next.js)
   - AWS (EC2, ECS, Lambda)
   - Google Cloud Platform (Cloud Run, App Engine)
   - Azure (App Service, Container Instances)

### Required Tools
- Node.js 18+ 
- npm or yarn
- Git
- Docker (optional)
- Cloud CLI tools (AWS CLI, gcloud, Azure CLI)

## 🔧 Environment Configuration

### Required Environment Variables

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"
# or for SQLite: DATABASE_URL="file:./dev.db"

# Google Gemini AI
GOOGLE_GEMINI_API_KEY="your-gemini-api-key"

# Google Cloud Storage
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="your-bucket-name"
GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY="path-to-service-account.json"

# Google Drive API
GOOGLE_DRIVE_CLIENT_ID="your-client-id"
GOOGLE_DRIVE_CLIENT_SECRET="your-client-secret"
GOOGLE_DRIVE_REDIRECT_URI="your-redirect-uri"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-min-32-chars"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="https://your-domain.com"

# Application
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXT_PUBLIC_API_URL="https://your-domain.com/api"

# Optional: External Integrations
SLACK_CLIENT_ID="your-slack-client-id"
SLACK_CLIENT_SECRET="your-slack-client-secret"
JIRA_CLIENT_ID="your-jira-client-id"
JIRA_CLIENT_SECRET="your-jira-client-secret"
```

## 🐳 Docker Deployment

### Dockerfile
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install dependencies based on the preferred package manager
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build the application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Docker Compose
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://postgres:password@db:5432/tenders
      - GOOGLE_GEMINI_API_KEY=${GOOGLE_GEMINI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db
    volumes:
      - ./uploads:/app/uploads

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=tenders
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

## ☁️ Platform-Specific Deployment

### 1. Vercel Deployment (Recommended)

#### Steps:
1. **Connect Repository**
   ```bash
   npm i -g vercel
   vercel login
   vercel --prod
   ```

2. **Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all required environment variables

3. **Database Setup**
   - Use Vercel Postgres or external PostgreSQL service
   - Update `DATABASE_URL` in environment variables

4. **Custom Domain** (Optional)
   - Add domain in Vercel Dashboard
   - Update DNS records

#### Vercel Configuration (`vercel.json`)
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "outputDirectory": ".next",
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

### 2. AWS Deployment

#### Option A: AWS Amplify
```bash
# Install AWS CLI
npm install -g @aws-amplify/cli
amplify init
amplify add hosting
amplify publish
```

#### Option B: AWS ECS with Docker
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker build -t tenders-ai .
docker tag tenders-ai:latest your-account.dkr.ecr.us-east-1.amazonaws.com/tenders-ai:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/tenders-ai:latest
```

#### AWS RDS Database Setup
```bash
# Create RDS PostgreSQL instance
aws rds create-db-instance \
  --db-instance-identifier tenders-ai-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --master-username admin \
  --master-user-password your-password \
  --allocated-storage 20
```

### 3. Google Cloud Platform

#### Cloud Run Deployment
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/tenders-ai
gcloud run deploy --image gcr.io/PROJECT-ID/tenders-ai --platform managed --region us-central1 --allow-unauthenticated
```

#### Cloud SQL Setup
```bash
# Create Cloud SQL instance
gcloud sql instances create tenders-ai-db \
  --database-version=POSTGRES_15 \
  --tier=db-f1-micro \
  --region=us-central1
```

### 4. Azure Deployment

#### Azure Container Instances
```bash
# Login to Azure
az login

# Create resource group
az group create --name tenders-ai-rg --location eastus

# Deploy container
az container create \
  --resource-group tenders-ai-rg \
  --name tenders-ai \
  --image your-registry/tenders-ai:latest \
  --dns-name-label tenders-ai-app \
  --ports 3000
```

## 🗄️ Database Setup

### PostgreSQL Production Setup
```sql
-- Create database
CREATE DATABASE tenders_ai;

-- Create user
CREATE USER tenders_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE tenders_ai TO tenders_user;

-- Connect to database and run migrations
\c tenders_ai;
-- Run Prisma migrations
```

### Prisma Production Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

## 🔐 Security Configuration

### SSL/TLS Setup
- **Vercel**: Automatic SSL
- **AWS**: Use AWS Certificate Manager
- **GCP**: Use Cloud Load Balancer SSL
- **Azure**: Use App Service SSL

### Security Headers
```javascript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  }
]
```

## 📊 Monitoring & Logging

### Application Monitoring
- **Vercel**: Built-in analytics
- **AWS**: CloudWatch
- **GCP**: Cloud Monitoring
- **Azure**: Application Insights

### Error Tracking
```bash
# Install Sentry
npm install @sentry/nextjs

# Configure Sentry
npx @sentry/wizard -i nextjs
```

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] SSL certificates configured
- [ ] Domain DNS configured
- [ ] Google Cloud services enabled
- [ ] API keys secured

### Post-Deployment
- [ ] Application accessible via domain
- [ ] Database connections working
- [ ] File uploads functioning
- [ ] AI features operational
- [ ] Authentication working
- [ ] Monitoring configured

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Errors**
   ```bash
   # Check database URL format
   echo $DATABASE_URL
   
   # Test connection
   npx prisma db pull
   ```

2. **Google API Errors**
   ```bash
   # Verify API keys
   curl -H "Authorization: Bearer $GOOGLE_GEMINI_API_KEY" \
        "https://generativelanguage.googleapis.com/v1beta/models"
   ```

3. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next
   npm run build
   ```

4. **Environment Variable Issues**
   ```bash
   # Check environment variables
   vercel env ls
   ```

## 📞 Support

For deployment issues:
1. Check the logs in your cloud platform
2. Verify environment variables
3. Test API endpoints
4. Check database connectivity

## 🔄 CI/CD Pipeline

### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

---

**Ready to deploy! Choose your preferred platform and follow the specific instructions above.** 🚀
