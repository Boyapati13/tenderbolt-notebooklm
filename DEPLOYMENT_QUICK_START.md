# 🚀 Syntara Tenders AI - Quick Deployment Guide

## 📋 Prerequisites Checklist

Before deploying, ensure you have:

- [ ] **Google Gemini AI API Key** - Get from [Google AI Studio](https://makersuite.google.com/app/apikey)
- [ ] **Google Cloud Storage Bucket** - For file uploads
- [ ] **Google Drive API Credentials** - For document integration
- [ ] **PostgreSQL Database** - Production database
- [ ] **Domain Name** - For your application
- [ ] **SSL Certificate** - For HTTPS

## ⚡ Quick Start (5 Minutes)

### Option 1: Vercel (Recommended)

1. **Fork/Clone Repository**
   ```bash
   git clone https://github.com/your-username/tenderbolt-notebooklm.git
   cd tenderbolt-notebooklm
   ```

2. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

4. **Set Environment Variables**
   - Go to Vercel Dashboard → Project Settings → Environment Variables
   - Add all variables from `env.example`

### Option 2: Docker

1. **Build and Run**
   ```bash
   docker build -t tenders-ai .
   docker run -p 3000:3000 --env-file .env.local tenders-ai
   ```

### Option 3: Docker Compose

1. **Setup Environment**
   ```bash
   cp env.example .env
   # Edit .env with your values
   ```

2. **Deploy**
   ```bash
   docker-compose up -d
   ```

## 🔧 Environment Variables Setup

### Required Variables

```bash
# Database
DATABASE_URL="postgresql://user:pass@host:port/db"

# Google Services
GOOGLE_GEMINI_API_KEY="your-gemini-key"
GOOGLE_CLOUD_PROJECT_ID="your-project-id"
GOOGLE_CLOUD_STORAGE_BUCKET="your-bucket"

# Authentication
JWT_SECRET="your-32-char-secret"
NEXTAUTH_SECRET="your-32-char-secret"
NEXTAUTH_URL="https://your-domain.com"
```

### Optional Variables

```bash
# External Integrations
SLACK_CLIENT_ID="your-slack-id"
JIRA_CLIENT_ID="your-jira-id"
MICROSOFT_CLIENT_ID="your-microsoft-id"

# Monitoring
SENTRY_DSN="your-sentry-dsn"
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

## 🗄️ Database Setup

### PostgreSQL (Production)

1. **Create Database**
   ```sql
   CREATE DATABASE tenders_ai;
   CREATE USER tenders_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE tenders_ai TO tenders_user;
   ```

2. **Run Migrations**
   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

### Cloud Database Options

- **Vercel Postgres** - Integrated with Vercel
- **AWS RDS** - Managed PostgreSQL
- **Google Cloud SQL** - Managed PostgreSQL
- **Azure Database** - Managed PostgreSQL
- **PlanetScale** - MySQL-compatible
- **Supabase** - PostgreSQL with extras

## ☁️ Platform-Specific Deployment

### Vercel
```bash
# One-command deployment
vercel --prod
```

### AWS (ECS)
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin your-account.dkr.ecr.us-east-1.amazonaws.com
docker build -t tenders-ai .
docker tag tenders-ai:latest your-account.dkr.ecr.us-east-1.amazonaws.com/tenders-ai:latest
docker push your-account.dkr.ecr.us-east-1.amazonaws.com/tenders-ai:latest
```

### Google Cloud (Cloud Run)
```bash
# Build and deploy
gcloud builds submit --tag gcr.io/PROJECT-ID/tenders-ai
gcloud run deploy --image gcr.io/PROJECT-ID/tenders-ai --platform managed --region us-central1 --allow-unauthenticated
```

### Azure (Container Instances)
```bash
# Deploy container
az container create --resource-group myResourceGroup --name tenders-ai --image your-registry/tenders-ai:latest --dns-name-label tenders-ai-app --ports 3000
```

## 🔐 Security Configuration

### SSL/TLS
- **Vercel**: Automatic SSL
- **AWS**: Use Certificate Manager
- **GCP**: Use Cloud Load Balancer SSL
- **Azure**: Use App Service SSL

### Security Headers
Already configured in `next.config.ts`:
- X-Content-Type-Options
- X-Frame-Options
- X-XSS-Protection
- Strict-Transport-Security
- Referrer-Policy

## 📊 Monitoring Setup

### Error Tracking (Sentry)
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

### Analytics (Google Analytics)
```bash
# Add to .env
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

### Performance Monitoring
- **Vercel**: Built-in analytics
- **AWS**: CloudWatch
- **GCP**: Cloud Monitoring
- **Azure**: Application Insights

## 🚀 CI/CD Pipeline

### GitHub Actions
Already configured in `.github/workflows/deploy.yml`:

- **Automatic Testing**: Runs on every PR
- **Auto Deploy**: Deploys to production on main branch
- **Multi-Platform**: Supports Vercel, Docker, AWS, GCP

### Required Secrets
Add these to your GitHub repository secrets:

```bash
# Vercel
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID

# Docker Hub
DOCKER_USERNAME
DOCKER_PASSWORD

# AWS
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY

# Google Cloud
GCP_SA_KEY
GCP_PROJECT_ID
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check DATABASE_URL format
   echo $DATABASE_URL
   
   # Test connection
   npx prisma db pull
   ```

2. **Google API Errors**
   ```bash
   # Verify API key
   curl -H "Authorization: Bearer $GOOGLE_GEMINI_API_KEY" \
        "https://generativelanguage.googleapis.com/v1beta/models"
   ```

3. **Build Errors**
   ```bash
   # Clear cache and rebuild
   rm -rf .next node_modules
   npm install
   npm run build
   ```

4. **Environment Variables Not Loading**
   ```bash
   # Check variable names and values
   vercel env ls
   ```

### Performance Optimization

1. **Database Indexing**
   ```sql
   -- Add indexes for common queries
   CREATE INDEX CONCURRENTLY idx_tenders_status ON tenders(status);
   CREATE INDEX CONCURRENTLY idx_tenders_created_at ON tenders(created_at);
   ```

2. **Caching**
   ```bash
   # Enable Redis caching
   REDIS_URL="redis://localhost:6379"
   ```

3. **CDN Setup**
   - Use Vercel Edge Network
   - Configure CloudFlare
   - Enable AWS CloudFront

## 📞 Support

### Getting Help
1. Check the logs in your cloud platform
2. Verify environment variables
3. Test API endpoints individually
4. Check database connectivity

### Useful Commands
```bash
# Check application health
curl https://your-domain.com/api/test

# View logs
vercel logs
docker logs container-name

# Database status
npx prisma db pull
npx prisma studio
```

## 🎯 Deployment Checklist

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

---

**Ready to deploy! Choose your preferred method and follow the steps above.** 🚀

For detailed instructions, see [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
