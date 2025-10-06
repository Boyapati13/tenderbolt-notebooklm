# Study Tools Feature - User Guide

## 🎓 Overview

The Study Tools feature generates intelligent **flashcards** and **quizzes** from your tender documents, helping you quickly learn and memorize key information about tender opportunities.

## ✨ Key Features

### 📚 Flashcards
- **AI-Generated Questions**: Automatically creates 8 flashcards based on tender data and insights
- **Interactive Review**: Flip cards to reveal answers
- **Progress Tracking**: Visual progress bar showing your position in the deck
- **Navigation**: Move forward, backward, or restart from the beginning
- **Content Coverage**:
  - Tender value and financial details
  - Submission deadlines and timelines
  - Win probability assessments
  - Requirements, compliance, risks, and deadlines from document analysis

### 🧩 Quiz Mode
- **Multiple Choice Questions**: 6 AI-generated quiz questions with 4 options each
- **Instant Feedback**: See correct/incorrect answers immediately
- **Score Tracking**: Get a final score percentage at the end
- **Smart Question Types**:
  - Tender value identification
  - Win probability assessment
  - Client information
  - Insight type classification
  - General tender management knowledge
- **Retry Option**: Retake the quiz to improve your score

## 🚀 How to Use

### 1. Navigate to Project Workspace
```
Dashboard → Click on any tender project → Workspace
```

### 2. Open Studio Panel
- The Studio panel is located at the bottom of the workspace
- Look for tools like "Audio Overview", "Video Overview", "Mind Map", etc.

### 3. Generate Study Tools
- Click on **"Flashcards"** or **"Quiz"** tool icon
- Wait for AI to generate study materials (takes a few seconds)
- The tools will automatically open in a new view

### 4. Study with Flashcards
- **View Question**: Read the question on the card
- **Show Answer**: Click to reveal the answer
- **Hide Answer**: Click to hide it again
- **Navigate**: Use Previous/Next buttons
- **Start Over**: Reset to the first card

### 5. Take the Quiz
- **Read Question**: Carefully read each question
- **Select Answer**: Click on your chosen option (A, B, C, or D)
- **See Feedback**: Correct answers show in green, incorrect in red
- **Continue**: Click "Next Question" to proceed
- **View Results**: See your final score and option to retake

## 🎯 Smart Content Generation

The AI analyzes your tender data to create context-specific questions:

### Flashcard Examples:
```
Q: What is the total value of the Government Infrastructure Project?
A: $5,000,000. This represents the estimated contract value for the project.

Q: What is the submission deadline for this tender?
A: [Date] - approximately 45 days from now.

Q: What compliance was identified in the tender analysis?
A: ISO 27001 certification mandatory for security compliance
   Source: Compliance Requirements, Page 12
```

### Quiz Examples:
```
Q1: What is the approximate value of the Healthcare IT System Implementation?
    A. $1,900,000
    B. $3,800,000 ✓ (Correct)
    C. $5,700,000
    D. $7,600,000

Q2: What is the assessed win probability for this tender?
    A. 62%
    B. 82% ✓ (Correct)
    C. 102%
    D. Not assessed

Q3: What type of insight is this: "ISO 27001 certification mandatory..."?
    A. Requirement
    B. Compliance ✓ (Correct)
    C. Risk
    D. Deadline
```

## 🔧 Technical Implementation

### API Endpoints
- **POST** `/api/ai/study` - Generates flashcards and quiz questions
  - Request: `{ tenderId: "tender_001" }`
  - Response: `{ flashcards: [...], quiz: [...] }`

### AI Service Integration
- Uses `aiService.generateStudyTools()` method
- Analyzes tender insights, documents, and metadata
- Generates contextual questions based on actual tender data
- Falls back to general questions if no specific data available

### Data Sources
Study tools pull information from:
1. **Tender Metadata**: Value, deadline, win probability, client
2. **Document Insights**: Requirements, compliance, risks, deadlines
3. **AI Analysis**: Smart question generation based on content

## 📊 Benefits

### For Bid Managers
- Quickly familiarize with new tender opportunities
- Test knowledge of key requirements
- Prepare for client meetings and presentations

### For Team Members
- Onboard new team members quickly
- Ensure everyone understands critical requirements
- Standardize knowledge across the team

### For Proposal Writers
- Memorize key compliance requirements
- Understand technical specifications
- Remember important deadlines and milestones

## 💡 Best Practices

1. **Generate After Document Upload**: Upload and analyze documents first for best results
2. **Review Regularly**: Use flashcards for daily review sessions
3. **Test Knowledge**: Take quizzes before important meetings
4. **Share with Team**: Use study tools for team training sessions
5. **Track Progress**: Retake quizzes to measure improvement

## 🎨 User Interface Features

### Visual Design
- **Clean Layout**: Distraction-free study environment
- **Progress Indicators**: Visual progress bars
- **Color Coding**: Green for correct, red for incorrect
- **Smooth Animations**: Transitions between cards/questions

### Accessibility
- **Keyboard Navigation**: Use Enter key to advance
- **Clear Typography**: Easy-to-read fonts and sizes
- **High Contrast**: Good visibility for all users

## 🔄 Future Enhancements

Potential improvements for future versions:
- [ ] Export flashcards to PDF or Anki format
- [ ] Spaced repetition algorithm for optimal learning
- [ ] Difficulty levels (Easy, Medium, Hard)
- [ ] Team leaderboards for quiz scores
- [ ] Custom flashcard creation
- [ ] Audio pronunciation for technical terms
- [ ] Mobile app version

## 🆘 Troubleshooting

### No Study Tools Generated?
- Ensure tender has uploaded documents
- Run document analysis (brain icon) first
- Check that tender has insights in database

### Questions Seem Generic?
- Upload more tender documents
- Analyze documents with AI (requires OpenAI API key)
- More insights = more specific questions

### Quiz Not Loading?
- Refresh the page
- Check browser console for errors
- Verify API endpoint is accessible

## 📝 Technical Details

### Component Structure
```
StudioPanel
  └── Study Tools Button
        └── API Call: /api/ai/study
              └── AIService.generateStudyTools()
                    └── StudyTools Component
                          ├── Flashcards View
                          └── Quiz View
```

### Data Flow
```
1. User clicks Flashcards/Quiz tool
2. StudioPanel makes POST to /api/ai/study
3. API fetches tender + documents + insights
4. AIService generates questions
5. Response sent back to frontend
6. StudyTools component renders content
7. User interacts with flashcards/quiz
```

## 🌟 Example Use Case

**Scenario**: New tender opportunity for Cloud Infrastructure Migration

1. **Upload Documents**: RFP, technical specs, compliance docs
2. **Analyze with AI**: Extract requirements, risks, compliance
3. **Generate Study Tools**: Create flashcards and quiz
4. **Study Session**: 
   - Review 8 flashcards (5 minutes)
   - Take 6-question quiz (3 minutes)
   - Score: 83% on first attempt
5. **Review Mistakes**: Focus on missed questions
6. **Retake Quiz**: Score: 100% on second attempt
7. **Ready for Meeting**: Confident in tender knowledge

---

**TenderBolt AI** - Transform tender management with intelligent study tools! 🚀

