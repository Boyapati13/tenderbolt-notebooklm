# 🔗 Google Cloud Integration Setup Guide

## 📋 Overview

This guide will help you integrate Google Cloud services with Syntara Tenders AI, specifically:
- **Google Drive API** - Store and access project files
- **Google Cloud Storage** - Alternative file storage
- **Google Workspace Integration** - Seamless file management

---

## 🚀 Quick Setup Steps

### **Step 1: Create Google Cloud Project**

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Sign in with your Google account

2. **Create a New Project**
   - Click **"Select a project"** at the top
   - Click **"New Project"**
   - Name: `Syntara Tenders AI`
   - Click **"Create"**

---

### **Step 2: Enable Required APIs**

1. **Enable Google Drive API**
   - Go to: https://console.cloud.google.com/apis/library
   - Search for **"Google Drive API"**
   - Click on it and click **"Enable"**

2. **Enable Google Cloud Storage API** (Optional)
   - Search for **"Cloud Storage API"**
   - Click **"Enable"**

3. **Enable Google Sheets API** (For Excel-like integration)
   - Search for **"Google Sheets API"**
   - Click **"Enable"**

---

### **Step 3: Create Service Account**

1. **Go to IAM & Admin**
   - Navigate to: https://console.cloud.google.com/iam-admin/serviceaccounts
   - Click **"Create Service Account"**

2. **Service Account Details**
   - Name: `syntara-tenders-ai`
   - Description: `Service account for Syntara Tenders AI file management`
   - Click **"Create and Continue"**

3. **Grant Permissions**
   - Role: **"Storage Admin"** (for Google Cloud Storage)
   - Role: **"Drive File Manager"** (for Google Drive)
   - Click **"Continue"**
   - Click **"Done"**

4. **Create Key**
   - Click on your new service account
   - Go to **"Keys"** tab
   - Click **"Add Key"** → **"Create new key"**
   - Choose **"JSON"**
   - Click **"Create"**
   - **Save the JSON file securely!**

---

### **Step 4: Set Up OAuth 2.0 (For User Access)**

1. **Create OAuth Credentials**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click **"Create Credentials"** → **"OAuth client ID"**

2. **Configure Consent Screen** (if prompted)
   - User Type: **"External"**
   - App name: `Syntara Tenders AI`
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"**

3. **Add Scopes**
   - Click **"Add or Remove Scopes"**
   - Select:
     - `https://www.googleapis.com/auth/drive.file`
     - `https://www.googleapis.com/auth/drive`
   - Click **"Update"**
   - Click **"Save and Continue"**

4. **Create OAuth Client**
   - Application type: **"Web application"**
   - Name: `Syntara Tenders AI Web`
   - Authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-production-domain.com/api/auth/callback/google`
   - Click **"Create"**
   - **Save your Client ID and Client Secret!**

---

## 🔐 Configure Environment Variables

Add these to your `.env.local` file:

```env
# Google Cloud Configuration
# ===========================

# Google Drive API (for file storage)
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your-client-secret"

# Google Cloud Storage (alternative to Drive)
GOOGLE_CLOUD_PROJECT_ID="syntara-tenders-ai"
GOOGLE_CLOUD_STORAGE_BUCKET="syntara-tenders-files"

# Service Account (for server-side operations)
# Copy the content of your JSON key file here:
GOOGLE_SERVICE_ACCOUNT_KEY='{
  "type": "service_account",
  "project_id": "syntara-tenders-ai",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n",
  "client_email": "syntara-tenders-ai@syntara-tenders-ai.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token"
}'
```

---

## 📦 Install Required Packages

```bash
npm install googleapis @google-cloud/storage
```

---

## 💻 Implementation Example

### **1. Google Drive Integration**

Create `src/lib/google-drive.ts`:

```typescript
import { google } from 'googleapis';

export async function uploadToGoogleDrive(
  fileName: string,
  fileBuffer: Buffer,
  mimeType: string
) {
  // Initialize OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/api/auth/callback/google'
  );

  // Set credentials (you'll need to implement OAuth flow)
  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.create({
    requestBody: {
      name: fileName,
      mimeType: mimeType,
    },
    media: {
      mimeType: mimeType,
      body: fileBuffer,
    },
    fields: 'id, webViewLink, webContentLink',
  });

  return {
    fileId: response.data.id,
    webViewLink: response.data.webViewLink,
    downloadLink: response.data.webContentLink,
  };
}

export async function createDriveFolder(folderName: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const drive = google.drive({ version: 'v3', auth: oauth2Client });

  const response = await drive.files.create({
    requestBody: {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    },
    fields: 'id, webViewLink',
  });

  return {
    folderId: response.data.id,
    folderLink: response.data.webViewLink,
  };
}
```

### **2. Service Account Method (Simpler)**

Create `src/lib/google-storage.ts`:

```typescript
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || '{}'),
});

const bucket = storage.bucket(process.env.GOOGLE_CLOUD_STORAGE_BUCKET || '');

export async function uploadFile(
  fileName: string,
  fileBuffer: Buffer,
  tenderId: string
) {
  const blob = bucket.file(`tenders/${tenderId}/${fileName}`);
  
  await blob.save(fileBuffer, {
    metadata: {
      contentType: 'auto',
    },
  });

  // Make file publicly accessible (optional)
  await blob.makePublic();

  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
  
  return {
    fileName,
    publicUrl,
    gsUrl: `gs://${bucket.name}/${blob.name}`,
  };
}

export async function getFileUrl(filePath: string) {
  const [url] = await bucket.file(filePath).getSignedUrl({
    action: 'read',
    expires: Date.now() + 1000 * 60 * 60, // 1 hour
  });
  
  return url;
}
```

---

## 🔄 Update Upload Route

Modify `src/app/api/upload/route.ts`:

```typescript
import { uploadToGoogleDrive } from '@/lib/google-drive';
// OR
import { uploadFile } from '@/lib/google-storage';

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files");
  const tenderId = form.get("tenderId") as string || "tender_default";
  
  const saved: Array<{ id: string; name: string; driveLink?: string }> = [];
  
  for (const f of files) {
    if (typeof f === "object" && "arrayBuffer" in f) {
      const file = f as File;
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      
      // Upload to Google Cloud
      const { publicUrl } = await uploadFile(
        file.name,
        buffer,
        tenderId
      );
      
      // Save to database with Google Cloud link
      const doc = await prisma.document.create({
        data: {
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          text: await extractTextFromFile(file.name, file.type, bytes),
          googleCloudUrl: publicUrl, // Add this field to your schema
          tender: {
            connectOrCreate: {
              where: { id: tenderId },
              create: {
                id: tenderId,
                title: "Default Tender",
                organization: {
                  connectOrCreate: {
                    where: { id: "org_demo" },
                    create: { id: "org_demo", name: "Demo Company Ltd" },
                  },
                },
              },
            },
          },
        },
      });
      
      saved.push({ 
        id: doc.id, 
        name: file.name,
        driveLink: publicUrl 
      });
    }
  }
  
  return NextResponse.json({ ok: true, saved });
}
```

---

## 📊 Benefits of Google Cloud Integration

### **Google Drive:**
- ✅ Familiar interface for users
- ✅ Easy sharing and collaboration
- ✅ Version history
- ✅ 15 GB free storage per account
- ✅ Integrates with Google Workspace

### **Google Cloud Storage:**
- ✅ Unlimited storage
- ✅ Better for large files
- ✅ CDN integration
- ✅ Lower costs at scale
- ✅ Better API performance

---

## 🎯 Current Implementation in Your App

Your app already supports **Google Drive links** in the UI:
- ✅ Store OneDrive links in `tender.oneDriveLink`
- ✅ Store Google Drive links in `tender.googleDriveLink`
- ✅ Display links in project cards
- ✅ Click to open external files

To make it automatic:
1. Follow setup steps above
2. Install packages
3. Implement upload functions
4. Files will auto-upload and links will be saved

---

## 🔗 Quick Links

- **Google Cloud Console**: https://console.cloud.google.com/
- **Enable APIs**: https://console.cloud.google.com/apis/library
- **Credentials**: https://console.cloud.google.com/apis/credentials
- **Service Accounts**: https://console.cloud.google.com/iam-admin/serviceaccounts
- **Google Drive API Docs**: https://developers.google.com/drive/api/guides/about-sdk
- **Cloud Storage Docs**: https://cloud.google.com/storage/docs

---

## 🆘 Need Help?

If you'd like me to:
1. ✅ Install the required packages
2. ✅ Create the integration files
3. ✅ Update the upload route
4. ✅ Set up automatic folder creation

Just let me know! 🚀

**Would you like me to implement this now?**

