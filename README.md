# Syntara Tenders AI - Professional Tender Management Application

A comprehensive tender management application combining NotebookLM's complete study suite with specialized tender intelligence features.

## 🚀 Features

### Core Features
- **CRM-Style Dashboard**: Modern dashboard with KPI cards, project overview, and performance metrics
- **Project Workspace**: NotebookLM-style tri-panel interface (Sources, Chat, Studio)
- **AI-Powered Chat**: Context-aware conversations with document citations
- **Document Intelligence**: AI analysis extracting requirements, compliance, risks, and deadlines
- **Win Probability Scoring**: AI-calculated win probability with Go/No-Go recommendations

### NotebookLM-Style Study Suite
- **Audio Overviews**: Multiple narration styles (Brief, Deep Dive, Critique, Podcast)
- **Video Overviews**: AI-narrated slide presentations synchronized with content
- **Interactive Mind Maps**: Visual representation of document relationships
- **Study Tools**: AI-generated flashcards and interactive quizzes
- **Structured Reports**: Comprehensive exportable reports and study guides

### Advanced Analytics
- **Performance Metrics**: Win rate, total tender value, average ROI, submission time analytics
- **Visual Charts**: Chart.js powered analytics with trends and distributions
- **Risk Assessment**: Comprehensive risk analysis and mitigation strategies

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd syntara-tenders-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure OpenAI API Key**
   
   Open `.env.local` and replace the placeholder with your actual OpenAI API key:
   ```env
   DATABASE_URL="file:./dev.db"
   OPENAI_API_KEY="sk-proj-your-actual-openai-api-key-here"
   ```
   
   **To get an OpenAI API key:**
   - Visit [OpenAI Platform](https://platform.openai.com/)
   - Sign up or log in to your account
   - Navigate to API Keys section
   - Create a new API key
   - Copy the key and paste it in `.env.local`

4. **Initialize the database**
   ```bash
   npx prisma db push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### Getting Started

1. **Dashboard Overview**
   - View key performance indicators (KPIs)
   - Browse active and recent projects
   - Access project workspaces by clicking on project cards

2. **Project Workspace**
   - **Sources Panel**: Upload documents (PDF, Word, Excel) with drag-and-drop
   - **AI Chat Panel**: Ask questions about your documents with AI-powered responses
   - **Studio Panel**: Generate reports, audio/video overviews, mind maps, and study tools

### AI Features Configuration

#### Without OpenAI API Key (Mock Mode)
- The application will work with mock AI responses
- All features are functional but with limited intelligence
- Perfect for testing and demonstration

#### With OpenAI API Key (Full AI Mode)
- Real AI-powered document analysis
- Advanced chat capabilities with context awareness
- Intelligent win probability calculations
- Enhanced report generation and study tools

### Key Workflows

#### 1. Document Analysis Workflow
1. Navigate to a project workspace
2. Upload tender documents in the Sources panel
3. Click the brain icon to analyze documents with AI
4. View extracted insights in the Insights panel
5. Ask questions about the documents in the Chat panel

#### 2. Study Tools Workflow
1. Open the Studio panel in a project workspace
2. Click on "Flashcards" or "Quiz" tools
3. Generate study materials from your documents
4. Use interactive flashcards and quizzes for learning

#### 3. Report Generation Workflow
1. In the Studio panel, click "Reports"
2. Choose report type (briefing, study guide, etc.)
3. AI generates comprehensive reports
4. View and export generated content

#### 4. Mind Map Creation
1. Click "Mind Map" in the Studio panel
2. AI automatically generates nodes from document insights
3. Drag and drop to customize the layout
4. Add new nodes and connections manually

## 🎯 AI Features Explained

### Document Intelligence
- **Requirements Extraction**: Identifies technical specifications and mandatory requirements
- **Compliance Analysis**: Detects industry standards and regulatory requirements
- **Risk Assessment**: Identifies potential risks and mitigation strategies
- **Deadline Tracking**: Extracts important dates and milestones

### Chat Capabilities
- **Context-Aware**: Understands your documents and provides relevant answers
- **Citation Support**: Shows which documents support each answer
- **Multi-Document**: Can analyze relationships across multiple documents

### Win Probability Scoring
- **Technical Score**: Evaluates technical fit and capability
- **Commercial Score**: Assesses pricing and commercial competitiveness
- **Compliance Score**: Checks regulatory and standards compliance
- **Risk Score**: Identifies and weighs potential risks

## 🔧 Configuration Options

### Environment Variables
```env
DATABASE_URL="file:./dev.db"                    # SQLite database path
OPENAI_API_KEY="sk-proj-your-key-here"          # OpenAI API key
```

### Customization
- Modify `src/lib/ai-service.ts` to customize AI behavior
- Update `src/components/studio-panel.tsx` to add new tools
- Customize styling in `src/app/globals.css`

## 📊 Analytics and Reporting

### Dashboard Metrics
- **Win Rate**: Percentage of successful tenders
- **Total Active Value**: Sum of all active tender values
- **Average ROI**: Return on investment across projects
- **Submission Time**: Average time to submit proposals

### Available Reports
- **Tender Briefing**: Executive summary of tender opportunities
- **Study Guide**: Comprehensive learning materials
- **Blog Post**: Marketing content about opportunities
- **Custom Reports**: Tailored analysis based on specific needs

## 🎨 Design System

- **Typography**: Inter font family for modern readability
- **Branding**: Lightning bolt theme with professional aesthetics
- **Themes**: Dark/light mode support
- **Accessibility**: WCAG 2.1 compliant design
- **Animations**: Smooth transitions and micro-interactions

## 🚀 Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Setup
- Ensure OpenAI API key is properly configured
- Set up production database (PostgreSQL recommended)
- Configure environment variables for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the troubleshooting section below
2. Review the configuration guide
3. Open an issue on GitHub

## 🔧 Troubleshooting

### Common Issues

#### Server Won't Start
- Ensure Node.js 18+ is installed
- Run `npm install` to install dependencies
- Check for port conflicts (default: 3000)

#### AI Features Not Working
- Verify OpenAI API key is correctly set in `.env.local`
- Check API key has sufficient credits
- Ensure key has proper permissions

#### Database Issues
- Run `npx prisma db push` to sync schema
- Check database file permissions
- Verify DATABASE_URL in `.env.local`

#### Document Upload Fails
- Check file size limits
- Verify supported file types (PDF, DOCX, XLSX)
- Ensure proper file permissions

### Performance Tips
- Use smaller document files for faster processing
- Enable caching for frequently accessed data
- Monitor OpenAI API usage to avoid rate limits

---

**TenderBolt AI** - Transform your tender management with AI-powered intelligence and NotebookLM-style study tools.