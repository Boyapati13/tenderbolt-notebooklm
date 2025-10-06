# 🔑 How to Get a Working Google Gemini API Key

## ⚠️ Current Issue
Your API key `AIzaSyBN5135OXHBlysAyIMOSCS2TCWO2CmxJc0` may be:
- Invalid or expired
- Not activated
- From a different project
- Restricted to specific services

---

## ✅ **SOLUTION: Get a Fresh API Key**

### **Step 1: Visit Google AI Studio**

**Click this link:**
```
https://aistudio.google.com/app/apikey
```

---

### **Step 2: Create New API Key**

1. **Sign in** with your Google account
2. You'll see "Get API key" or "Create API key"
3. Click **"Create API key"**
4. Choose one of these options:
   - **"Create API key in new project"** (Recommended - simplest)
   - OR select your existing project `syntara-tenders-ai`

5. **Copy the new key** (it will look like: `AIzaSyC...`)

---

### **Step 3: Update Your .env.local File**

**Option A: Edit in Notepad**
```bash
notepad .env.local
```

Find this line:
```
GOOGLE_API_KEY="AIzaSyBN5135OXHBlysAyIMOSCS2TCWO2CmxJc0"
```

Replace with your NEW key:
```
GOOGLE_API_KEY="AIzaSyC_YOUR_NEW_KEY_HERE"
```

Save and close.

**Option B: Edit in VS Code**
```bash
code .env.local
```

---

### **Step 4: Restart the Server**

```bash
# Stop server
taskkill /F /IM node.exe

# Start server
npm run dev
```

---

## 🔍 **Verify It's Working**

### **After restarting, open:**
```
http://localhost:3000
```

### **Press F12 → Console Tab**

Look for:
```
✅ AI Service initialized with Google Gemini
```

### **Test Chat:**
1. Go to any tender workspace
2. Click **Chat** tab
3. Ask: "Summarize this tender"
4. **Should get real AI response** (not placeholder)

---

## 💡 **Alternative: Use a Test Key**

If you're just testing, you can use Google's free tier:

### **Free Tier Limits:**
- ✅ 15 requests per minute
- ✅ 1,500 requests per day
- ✅ 1 million requests per month
- ✅ No credit card required

### **Get Free Key:**
1. Go to: https://aistudio.google.com/app/apikey
2. Sign in with any Google account
3. Create API key
4. Start using immediately

---

## 🚨 **Common Issues**

### **Issue 1: "API key not valid"**
**Solution:** 
- Get a NEW key from https://aistudio.google.com/app/apikey
- Don't reuse old keys

### **Issue 2: "Model not found"**
**Solution:** 
- Already fixed! We changed to `gemini-pro` model
- This is included in the latest code

### **Issue 3: "Quota exceeded"**
**Solution:**
- Check usage: https://aistudio.google.com
- Wait for quota reset (daily)
- Or upgrade to paid tier

### **Issue 4: Still seeing "Configure OpenAI API key"**
**Solution:**
1. Hard refresh browser: `Ctrl + Shift + R`
2. Clear `.next` cache: `Remove-Item -Recurse -Force .next`
3. Restart server: `npm run dev`
4. Check F12 console for initialization message

---

## 📋 **Complete Checklist**

- [ ] Go to https://aistudio.google.com/app/apikey
- [ ] Create a NEW API key (not reuse old one)
- [ ] Copy the entire key (starts with `AIza`)
- [ ] Open `.env.local` in Notepad or VS Code
- [ ] Replace GOOGLE_API_KEY value
- [ ] Save the file
- [ ] Stop server: `taskkill /F /IM node.exe`
- [ ] Start server: `npm run dev`
- [ ] Open browser: http://localhost:3000
- [ ] Press F12, check console for "✅ AI Service initialized"
- [ ] Test chat or upload a document
- [ ] Verify real AI responses (not placeholder)

---

## 🎯 **Expected Result**

### **Before (Mock Mode):**
```
"Based on the document analysis, key requirements include 
technical specifications, compliance standards, and delivery 
timelines. Please configure your OpenAI API key for enhanced 
analysis."
```

### **After (Working Gemini):**
```
"This tender for Government Infrastructure Project requires:
1. Civil engineering expertise with 10+ years experience
2. ISO 9001 certification and safety compliance
3. Project completion within 18 months
4. Budget: $5,000,000
5. Environmental impact assessment required
..."
```

**Notice the difference:** Real, specific analysis vs generic placeholder.

---

## 🚀 **Quick Command Reference**

```bash
# Open Google AI Studio to get key
start https://aistudio.google.com/app/apikey

# Edit .env.local
notepad .env.local

# Restart server
taskkill /F /IM node.exe
npm run dev

# Open browser
start http://localhost:3000
```

---

## 📞 **Need Help?**

If you're still having issues after getting a NEW API key:

1. Share the error message from browser console (F12)
2. Check if the key starts with `AIza`
3. Verify the key is in `.env.local` correctly
4. Make sure you saved the file
5. Confirm server restarted

---

**🎯 The #1 solution: Get a FRESH API key from https://aistudio.google.com/app/apikey**

This will solve 99% of API key issues!


