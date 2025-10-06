# 🔐 Authentication Setup Guide

## Environment Variables Required

Create a `.env.local` file in your project root with the following variables:

```bash
# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-change-this-in-production

# Google OAuth (for Gmail login)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth (for Outlook login) - Optional
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# Database
DATABASE_URL="file:./dev.db"

# Google Gemini AI
GOOGLE_GEMINI_API_KEY=your-gemini-api-key
```

## Google OAuth Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable Google+ API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. **Create OAuth 2.0 credentials**:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:3000/api/auth/callback/google`
     - `https://yourdomain.com/api/auth/callback/google` (for production)
5. **Copy Client ID and Secret** to your `.env.local` file

## Microsoft OAuth Setup (Optional)

1. **Go to Azure Portal**: https://portal.azure.com/
2. **Register a new application**:
   - Go to "Azure Active Directory" > "App registrations"
   - Click "New registration"
   - Set redirect URI: `http://localhost:3000/api/auth/callback/microsoft`
3. **Create client secret**:
   - Go to "Certificates & secrets"
   - Click "New client secret"
4. **Copy Client ID and Secret** to your `.env.local` file

## Database Migration

Run the following commands to update your database:

```bash
# Generate Prisma client
npx prisma generate

# Run database migration
npx prisma db push

# Seed the database (optional)
npm run seed
```

## Testing Authentication

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Visit the sign-in page**:
   - Go to `http://localhost:3000/auth/signin`
   - Test both email/password and Google OAuth

3. **Create test users**:
   - Use the credentials provider for email/password
   - Use Google OAuth for Gmail accounts

## Default Test Credentials

For development, you can use these test credentials:
- **Email**: `demo@syntara.ai`
- **Password**: `demo123`

Or sign in with your Google account using the "Continue with Google" button.

## Production Deployment

1. **Update NEXTAUTH_URL** to your production domain
2. **Generate a secure NEXTAUTH_SECRET**:
   ```bash
   openssl rand -base64 32
   ```
3. **Update OAuth redirect URIs** in Google/Microsoft consoles
4. **Use environment variables** in your hosting platform

## Security Notes

- Never commit `.env.local` to version control
- Use strong, unique secrets in production
- Regularly rotate API keys and secrets
- Enable 2FA on your OAuth provider accounts
- Monitor authentication logs for suspicious activity

## Troubleshooting

### Common Issues:

1. **"Invalid client" error**: Check your OAuth client ID and secret
2. **"Redirect URI mismatch"**: Verify redirect URIs in OAuth console
3. **Database errors**: Run `npx prisma db push` to update schema
4. **Session not persisting**: Check NEXTAUTH_SECRET is set correctly

### Getting Help:

- Check NextAuth.js documentation: https://next-auth.js.org/
- Review OAuth provider documentation
- Check browser console for errors
- Verify environment variables are loaded correctly
