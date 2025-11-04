# Handson-AI Project AI management platform
A complete project management platform with AI integration, multi-language support, and comprehensive features for managing projects, documents, and business processes.

## 🚀 Features

- **AI-Powered Analysis**: Google Gemini AI integration for document processing and analysis
- **Multi-Language Support**: 8 languages (English, Spanish, French, German, Arabic, Chinese, Japanese, Korean)
- **Document Management**: Upload, process, and analyze project documents
- **Real-time Chat**: AI assistant for project-related queries
- **Dashboard & Analytics**: Comprehensive insights and reporting
- **Authentication**: Secure user authentication with NextAuth.js
- **Responsive Design**: Mobile-friendly interface with dark/light themes

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.5.4, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: Prisma ORM with SQLite (development)
- **Authentication**: NextAuth.js
- **AI Integration**: Google Generative AI (Gemini)
- **Cloud Storage**: Google Cloud Storage
- **Internationalization**: next-intl
- **Desktop App**: Electron support

## 📁 Project Structure

```
src/
├── app/
│   ├── [locale]/          # Internationalized pages
│   ├── api/               # API routes
│   └── auth/              # Authentication pages
├── components/            # React components
├── lib/                   # Utility libraries
└── middleware.ts          # Next.js middleware
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Google Gemini API key (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Boyapati13/HandsOnAi.git
   cd HandsOnAi
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   Edit `.env.local` with your configuration:
   ```env
   NODE_ENV=development
   NEXTAUTH_URL=http://localhost:3002
   NEXTAUTH_SECRET=your-nextauth-secret-key
   DATABASE_URL="file:./prisma/dev.db"
   GOOGLE_API_KEY=your-gemini-api-key
   ```

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser** Navigate to http://localhost:3002/

## 🌐 Supported Languages

- English (en)
- Spanish (es)
- French (fr)
- German (de)
- Arabic (ar)
- Chinese (zh)
- Japanese (ja)
- Korean (ko)

## 📱 Desktop App

The application also supports desktop deployment with Electron:

```bash
npm run build:desktop
npm run electron-pack
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker

```bash
docker build -t handson-ai .
docker run -p 3000:3000 handson-ai
```

## 📚 Documentation

- [API Documentation](./docs/api.md)
- [Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Authentication Setup](./AUTHENTICATION-SETUP.md)
- [Google Cloud Integration](./GOOGLE_CLOUD_SETUP.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Google for Gemini AI integration
- The open-source community for various libraries and tools

## 📞 Support

For support, email boyapatisivaramakrishna@gmail.com or create an issue in this repository.

---

**Handson-AI Project AI management platform** - Revolutionizing project management with AI intelligence.
