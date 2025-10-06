# 🚀 Google Cloud Quick Setup for Syntara Tenders AI

## ✅ You Already Have:
- Project created: **syntara-tenders-ai** ✅
- Console URL: https://console.cloud.google.com/apis/dashboard?project=syntara-tenders-ai

---

## 📋 Complete These 5 Steps:

### **Step 1: Enable APIs** (5 minutes)

Click each link and click the **"Enable"** button:

1. **Google Drive API**
   - https://console.cloud.google.com/apis/library/drive.googleapis.com?project=syntara-tenders-ai
   - Click **"Enable"**

2. **Google Cloud Storage API**
   - https://console.cloud.google.com/apis/library/storage-api.googleapis.com?project=syntara-tenders-ai
   - Click **"Enable"**

3. **IAM Service Account Credentials API**
   - https://console.cloud.google.com/apis/library/iamcredentials.googleapis.com?project=syntara-tenders-ai
   - Click **"Enable"**

---

### **Step 2: Create Storage Bucket** (2 minutes)

1. Go to: https://console.cloud.google.com/storage/create-bucket?project=syntara-tenders-ai

2. **Bucket Details:**
   - Name: `syntara-tenders-files` (must be globally unique)
   - Location: Choose your region (e.g., `us-central1` or closest to you)
   - Storage class: **Standard**

3. **Access Control:**
   - Uncheck "Enforce public access prevention"
   - Access control: **Fine-grained**

4. Click **"Create"**

---

### **Step 3: Create Service Account** (3 minutes)

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts?project=syntara-tenders-ai

2. Click **"+ Create Service Account"**

3. **Service Account Details:**
   - Name: `syntara-storage-service`
   - ID: `syntara-storage-service`
   - Description: `Service account for Syntara Tenders AI file storage`
   - Click **"Create and Continue"**

4. **Grant Permissions** - Add these roles:
   - **Storage Admin** (full access to Cloud Storage)
   - **Service Account Token Creator**
   - Click **"Continue"**
   - Click **"Done"**

---

### **Step 4: Create Service Account Key** (2 minutes)

1. Click on your new service account (`syntara-storage-service`)

2. Go to the **"Keys"** tab

3. Click **"Add Key"** → **"Create new key"**

4. Choose **"JSON"**

5. Click **"Create"**

6. **Download the JSON file** - Save it securely!
   - File name will be like: `syntara-tenders-ai-xxxxx.json`

---

### **Step 5: Configure Environment Variables** (3 minutes)

1. Open the JSON file you just downloaded

2. Copy the **entire content** of the JSON file

3. Open `.env.local` in your project (or create it if it doesn't exist)

4. Add these lines:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID="syntara-tenders-ai"
GOOGLE_CLOUD_STORAGE_BUCKET="syntara-tenders-files"

# Paste your JSON key content here (as a single line):
GOOGLE_SERVICE_ACCOUNT_KEY='{"type":"service_account","project_id":"syntara-tenders-ai",...}'
```

**Important:** 
- Replace `syntara-tenders-files` with your actual bucket name if different
- The JSON key should be on ONE line
- Wrap it in single quotes `'...'`

---

## 🎉 You're Done!

### **Test the Integration:**

1. **Restart your server:**
   ```bash
   npm run dev
   ```

2. **Upload a file** in the Workspace section

3. **Check the console** - you should see:
   - `✅ Google Cloud Storage initialized`
   - `✅ File uploaded to Google Cloud: filename.pdf`

4. **Verify in Google Cloud:**
   - Go to: https://console.cloud.google.com/storage/browser/syntara-tenders-files?project=syntara-tenders-ai
   - You should see your uploaded files organized by tender ID

---

## 📊 What This Enables:

✅ **Automatic File Upload** - All documents uploaded to Syntara are stored in Google Cloud
✅ **Organized Storage** - Files organized by project: `tenders/tender_id/filename.pdf`
✅ **Secure Access** - Signed URLs with expiration (7 days by default)
✅ **Scalable** - Handle unlimited files and large file sizes
✅ **Cost-Effective** - Pay only for what you use (~$0.02/GB/month)

---

## 🔐 Security Best Practices:

1. ✅ **Never commit `.env.local`** to version control (already in `.gitignore`)
2. ✅ **Rotate service account keys** every 90 days
3. ✅ **Use least privilege** - only grant necessary permissions
4. ✅ **Monitor usage** in Google Cloud Console

---

## 💡 Quick Links:

- **Your Storage Bucket**: https://console.cloud.google.com/storage/browser/syntara-tenders-files?project=syntara-tenders-ai
- **Service Accounts**: https://console.cloud.google.com/iam-admin/serviceaccounts?project=syntara-tenders-ai
- **API Dashboard**: https://console.cloud.google.com/apis/dashboard?project=syntara-tenders-ai
- **Billing**: https://console.cloud.google.com/billing?project=syntara-tenders-ai

---

## 🆘 Troubleshooting:

### **"Storage bucket not found"**
- Make sure you created the bucket with the exact name in Step 2
- Check the bucket exists: https://console.cloud.google.com/storage/browser?project=syntara-tenders-ai

### **"Permission denied"**
- Verify service account has "Storage Admin" role
- Check: https://console.cloud.google.com/iam-admin/iam?project=syntara-tenders-ai

### **"Invalid credentials"**
- Ensure JSON key is valid and properly formatted in `.env.local`
- Make sure it's wrapped in single quotes and on one line

---

**Need help? Just ask! 🚀**


