# OpenAI API Setup Guide

## 🔑 Getting Your OpenAI API Key

### Step 1: Visit OpenAI Platform
1. Go to **https://platform.openai.com/**
2. Sign up for an account (or log in if you have one)
3. You'll need to verify your email address

### Step 2: Navigate to API Keys
1. Click on your **profile icon** (top-right corner)
2. Select **"API Keys"** or **"View API Keys"**
3. Or go directly to: **https://platform.openai.com/api-keys**

### Step 3: Create a New API Key
1. Click **"+ Create new secret key"**
2. Give it a name like **"TenderBolt AI"**
3. Click **"Create secret key"**
4. **IMPORTANT**: Copy the key immediately (it starts with `sk-proj-...`)
5. You won't be able to see it again!

### Step 4: Update Your .env.local File
1. Open `c:\Users\Tenders\tenderbolt-notebooklm\.env.local`
2. Replace the placeholder with your actual key:
   ```env
   DATABASE_URL="file:./dev.db"
   OPENAI_API_KEY="sk-proj-YOUR-ACTUAL-KEY-HERE"
   ```
3. Save the file

### Step 5: Restart Development Server
```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

## 💰 Pricing Information

### Free Tier
- OpenAI offers **$5 in free credits** for new accounts
- Credits expire after 3 months
- Perfect for testing and development

### Pay-As-You-Go
- **GPT-4o-mini**: ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- Very affordable for typical usage
- TenderBolt uses GPT-4o-mini by default (cost-effective!)

### Typical Usage Costs
- **Document Analysis**: ~$0.01-0.02 per document
- **Chat Message**: ~$0.001-0.005 per message
- **Study Tools Generation**: ~$0.01-0.02 per generation
- **Expected Monthly Cost**: $5-20 for moderate use

## 🔒 Security Best Practices

### ✅ DO:
- Keep your API key secret
- Add `.env.local` to `.gitignore` (already done!)
- Use separate keys for dev/production
- Set usage limits in OpenAI dashboard
- Rotate keys regularly

### ❌ DON'T:
- Share your API key publicly
- Commit API keys to version control
- Use the same key across multiple projects
- Leave unused keys active

## 📊 Monitor Usage

### Check Your Usage:
1. Go to **https://platform.openai.com/usage**
2. View daily/monthly usage
3. Set spending limits if needed
4. Check credit balance

### Set Spending Limits:
1. Go to **Settings → Limits**
2. Set a **hard limit** (e.g., $10/month)
3. Set a **soft limit** for notifications

## 🚀 What Changes When You Add the API Key?

### Before (Mock Mode):
- ✅ Basic functionality works
- ✅ Regex-based insights extraction
- ✅ Sample responses
- ❌ Limited intelligence
- ❌ Generic answers

### After (Full AI Mode):
- ✅ Real AI-powered analysis
- ✅ Intelligent document insights
- ✅ Context-aware chat responses
- ✅ Smart win probability calculation
- ✅ High-quality study tools
- ✅ Better flashcards and quiz questions

## 🧪 Test Your Setup

### 1. Check Environment Variable
```bash
# In your terminal (project directory):
node -e "console.log(process.env.OPENAI_API_KEY ? 'API Key Found!' : 'API Key Missing')"
```

### 2. Test Document Analysis
1. Go to any tender workspace
2. Upload a document (PDF, DOCX, or XLSX)
3. Click the **brain icon** to analyze
4. You should see intelligent insights!

### 3. Test Chat
1. Ask a question in the Chat panel
2. You should get contextual, intelligent responses

### 4. Test Study Tools
1. Generate flashcards
2. Questions should be more specific and intelligent

## 🐛 Troubleshooting

### Issue: "Invalid API key"
**Solution**:
- Verify you copied the entire key
- Check for extra spaces or quotes
- Generate a new key if needed

### Issue: "Insufficient credits"
**Solution**:
- Check usage at platform.openai.com/usage
- Add payment method or credits
- Free tier credits may have expired

### Issue: "Rate limit exceeded"
**Solution**:
- OpenAI limits requests per minute
- Wait a few seconds between requests
- Upgrade to a paid plan for higher limits

### Issue: Changes not taking effect
**Solution**:
- Restart the dev server (stop with Ctrl+C, then `npm run dev`)
- Clear browser cache
- Check terminal for any startup errors

## 📝 Alternative: Continue Without API Key

Your TenderBolt AI app works perfectly fine without the OpenAI API key!

### What Still Works:
- ✅ All UI functionality
- ✅ Document upload and storage
- ✅ Regex-based insights extraction
- ✅ Study tools generation (with mock data)
- ✅ Mind maps
- ✅ Dashboard and analytics
- ✅ Project management

### Limitations:
- Chat responses are generic
- Document analysis is rule-based
- Study tools use template questions

## 🎯 Recommended API Key Settings

Once you have your key, configure these settings in OpenAI dashboard:

### Usage Limits (Recommended):
- **Hard Limit**: $20/month (adjust based on your needs)
- **Soft Limit**: $15/month (get notifications)
- **Daily Limit**: $2/day

### API Settings:
- **Model**: GPT-4o-mini (default in TenderBolt)
- **Max Tokens**: 1000 (sufficient for most tasks)
- **Temperature**: 0.2 (balanced responses)

## 📞 Support

### OpenAI Support:
- Help Center: https://help.openai.com/
- API Status: https://status.openai.com/
- Community: https://community.openai.com/

### TenderBolt AI Issues:
- Check console logs (F12 in browser)
- Verify .env.local is in project root
- Ensure dev server is running
- Check terminal for error messages

---

**Ready to unlock full AI power! 🚀**

Get your API key and update `.env.local` to enable intelligent document analysis, smart chat, and advanced study tools!

