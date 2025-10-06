# 🚨 URGENT: Fix Google OAuth Redirect URI Mismatch

## ❌ Current Error:
**Error 400: redirect_uri_mismatch**

This means the redirect URIs in your Google Cloud Console don't match what NextAuth is trying to use.

## 🔍 Problem Analysis:
- **Your app runs on**: `localhost:3002`
- **You're accessing from**: `localhost:3000` (wrong port)
- **NextAuth expects**: `http://localhost:3002/api/auth/callback/google`
- **Google OAuth configured for**: Probably `localhost:3000` (incorrect)

## 🔧 IMMEDIATE FIX:

### Step 1: Update Google Cloud Console Redirect URIs

1. **Go to**: [Google Cloud Console](https://console.cloud.google.com/welcome?project=syntara-tenders-ai)
2. **Navigate to**: APIs & Services > Credentials
3. **Find**: Your OAuth 2.0 Client ID: `1082748753419-239uip0h5v8ufg19oded59ek3b4fbiha.apps.googleusercontent.com`
4. **Click**: On the Client ID to edit it
5. **Update Authorized redirect URIs** to include BOTH:
   ```
   http://localhost:3002/api/auth/callback/google
   http://localhost:3000/api/auth/callback/google
   ```
6. **Update Authorized JavaScript origins** to include BOTH:
   ```
   http://localhost:3002
   http://localhost:3000
   ```
7. **Save** the changes

### Step 2: Use the Correct URL

**✅ Use**: `http://localhost:3002/auth/signin` (NOT 3000)

### Step 3: Test Authentication

1. **Go to**: `http://localhost:3002/auth/signin`
2. **Click**: "Continue with Google"
3. **Expected**: Google OAuth consent screen
4. **After authorization**: Redirected to dashboard

## 🎯 Why This Happens:

NextAuth automatically constructs the redirect URI as:
`{NEXTAUTH_URL}/api/auth/callback/google`

Since your `NEXTAUTH_URL=http://localhost:3002`, it expects:
`http://localhost:3002/api/auth/callback/google`

But your Google OAuth is probably configured for:
`http://localhost:3000/api/auth/callback/google`

## 🔄 Alternative Quick Fix:

If you want to use port 3000 instead:

1. **Update `.env.local`**:
   ```bash
   NEXTAUTH_URL=http://localhost:3000
   ```

2. **Restart your server**:
   ```bash
   npm run dev
   ```

3. **Use**: `http://localhost:3000/auth/signin`

## 📋 Complete Google OAuth Settings:

### Authorized JavaScript origins:
```
http://localhost:3000
http://localhost:3002
```

### Authorized redirect URIs:
```
http://localhost:3000/api/auth/callback/google
http://localhost:3002/api/auth/callback/google
```

## 🚨 Important Notes:

- **Redirect URIs must match EXACTLY** (including http/https, port, path)
- **No trailing slashes** in redirect URIs
- **Both ports** should be configured for flexibility
- **Save changes** in Google Cloud Console before testing

---

**🎯 Fix the redirect URIs in Google Cloud Console and your authentication will work!**
