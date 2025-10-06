Write-Host "🔧 Setting up environment variables for NextAuth..." -ForegroundColor Green

# Create .env.local file
$envContent = @"
# NextAuth Configuration
NEXTAUTH_SECRET="your-nextauth-secret-key-minimum-32-characters-long-for-development"
NEXTAUTH_URL="http://localhost:3002"

# Database Configuration
DATABASE_URL="file:./dev.db"

# Application Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3002"

# Google OAuth (Optional - for Google sign-in)
# GOOGLE_CLIENT_ID="your-google-client-id"
# GOOGLE_CLIENT_SECRET="your-google-client-secret"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-minimum-32-characters-long-for-development"
"@

# Write to .env.local
$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ Created .env.local file" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Restart your development server: npm run dev" -ForegroundColor White
Write-Host "2. The NextAuth 'Failed to fetch' error should be resolved" -ForegroundColor White
Write-Host "3. For production, update the secrets with secure values" -ForegroundColor White
