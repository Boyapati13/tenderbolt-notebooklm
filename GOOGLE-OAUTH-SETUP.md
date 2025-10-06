# 🔐 Google OAuth Setup for Syntara Tenders AI

## Your Google Cloud Project Details
- **Project Name**: Syntara Tenders AI
- **Project ID**: `syntara-tenders-ai`
- **Project Number**: 1082748753419
- **Console URL**: https://console.cloud.google.com/welcome?project=syntara-tenders-ai

## Step-by-Step OAuth Setup

### 1. Enable Google+ API
1. Go to your [Google Cloud Console](https://console.cloud.google.com/welcome?project=syntara-tenders-ai)
2. Navigate to **APIs & Services** > **Library**
3. Search for "Google+ API" and click on it
4. Click **Enable** to activate the API

### 2. Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **OAuth 2.0 Client IDs**
3. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in the required fields:
     - **App name**: Syntara Tenders AI
     - **User support email**: Your email
     - **Developer contact**: Your email
   - Add your domain to authorized domains
   - Save and continue through the steps

### 3. Configure OAuth Client
1. **Application type**: Web application
2. **Name**: Syntara Tenders AI - Web Client
3. **Authorized JavaScript origins**:
   ```
   http://localhost:3000
   http://localhost:3002
   ```
4. **Authorized redirect URIs**:
   ```
   http://localhost:3000/api/auth/callback/google
   http://localhost:3002/api/auth/callback/google
   ```
5. Click **Create**

### 4. Get Your Credentials
After creating the OAuth client, you'll get:
- **Client ID**: A long string starting with numbers
- **Client Secret**: A shorter string

### 5. Update Environment Variables
Create or update your `.env.local` file:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Google OAuth Credentials
GOOGLE_CLIENT_ID=your-client-id-from-step-4
GOOGLE_CLIENT_SECRET=your-client-secret-from-step-4

# Database
DATABASE_URL="file:./dev.db"

# Google Gemini AI (if you have it)
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
```

### 6. Generate NextAuth Secret
Run this command to generate a secure secret:
```bash
openssl rand -base64 32
```
Copy the output and use it as your `NEXTAUTH_SECRET`

## Testing the Setup

### 1. Start the Application
```bash
npm run dev
```

### 2. Test Authentication
1. Go to `http://localhost:3000/auth/signin`
2. Click **Continue with Google**
3. You should be redirected to Google's OAuth consent screen
4. After authorization, you'll be redirected back to your app

### 3. Verify Session
- Check that you're logged in
- Verify user information is displayed correctly
- Test logout functionality

## Production Setup

### 1. Update OAuth Settings
For production deployment, add these redirect URIs:
```
https://yourdomain.com/api/auth/callback/google
```

### 2. Update Environment Variables
```bash
NEXTAUTH_URL=https://yourdomain.com
```

### 3. Domain Verification
- Add your production domain to authorized domains
- Verify domain ownership if required

## Troubleshooting

### Common Issues:

1. **"Invalid client" error**:
   - Check Client ID and Secret are correct
   - Ensure OAuth client is enabled

2. **"Redirect URI mismatch"**:
   - Verify redirect URIs match exactly
   - Check for trailing slashes or http/https mismatch

3. **"Access blocked"**:
   - Complete OAuth consent screen setup
   - Add test users if in testing mode

4. **Session not persisting**:
   - Check NEXTAUTH_SECRET is set
   - Verify NEXTAUTH_URL matches your domain

### Getting Help:
- Check [NextAuth.js Google Provider docs](https://next-auth.js.org/providers/google)
- Review [Google OAuth 2.0 documentation](https://developers.google.com/identity/protocols/oauth2)
- Check browser console for detailed error messages

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use strong, unique secrets** in production
3. **Regularly rotate** OAuth credentials
4. **Monitor** authentication logs
5. **Enable 2FA** on your Google account
6. **Use HTTPS** in production

## Next Steps

Once Google OAuth is working:
1. Test with different Google accounts
2. Set up Microsoft OAuth for Outlook (optional)
3. Configure role-based access control
4. Set up user management features
5. Deploy to production with proper domain configuration

---

**🎉 Your Syntara Tenders AI project is ready for Google OAuth authentication!**
