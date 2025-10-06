# Quick Testing Guide - Study Tools Feature

## 🚀 Quick Start (5 Minutes)

### Step 1: Start the Application
```bash
# The dev server should already be running
# If not, run: npm run dev
# Then open: http://localhost:3000
```

### Step 2: Access Dashboard
1. Open **http://localhost:3000**
2. You'll be redirected to `/dashboard`
3. See 5 sample tenders we created:
   - Government Infrastructure Project ($5M)
   - Cloud Infrastructure Migration ($2.5M)
   - Healthcare IT System Implementation ($3.8M)
   - Educational Software Platform ($1.2M)
   - Data Center Upgrade Project ($4.5M - Won)

### Step 3: Open a Project Workspace
1. **Click** on "Government Infrastructure Project"
2. You'll navigate to `/workspace/tender_001`
3. See the NotebookLM-style interface:
   - **Left**: Sources Panel
   - **Center**: AI Chat Panel
   - **Bottom**: Studio Panel

### Step 4: Generate Study Tools
1. **Scroll down** to the Studio Panel (bottom section)
2. Look for the **Flashcards** 📚 and **Quiz** ❓ icons
3. **Click on "Flashcards"** or **"Quiz"**
4. Wait 2-3 seconds for generation
5. Study tools will open automatically!

### Step 5: Try Flashcards
1. Read the question on the card
2. Click **"Show Answer"** to reveal
3. Click **"Hide Answer"** to hide
4. Use **Previous/Next** to navigate
5. Click **"Start Over"** to reset

### Step 6: Take the Quiz
1. Click the **"Quiz"** tab at the top
2. Read each question carefully
3. Click your answer (A, B, C, or D)
4. See immediate feedback (green = correct, red = wrong)
5. Click **"Next Question"** to continue
6. View your final score!
7. Click **"Retake Quiz"** to try again

## 🎯 What to Test

### ✅ Flashcards Functionality
- [ ] Question displays correctly
- [ ] Show/Hide answer works
- [ ] Previous button works
- [ ] Next button works
- [ ] Start Over resets to first card
- [ ] Progress bar updates
- [ ] 8 flashcards are generated

### ✅ Quiz Functionality
- [ ] 6 questions are generated
- [ ] 4 options per question
- [ ] Can select an answer
- [ ] Correct answer shows in green
- [ ] Wrong answer shows in red
- [ ] Next question button appears after selection
- [ ] Final score displays correctly
- [ ] Retake quiz resets everything

### ✅ Content Quality
- [ ] Questions relate to the specific tender
- [ ] Tender value appears in flashcard
- [ ] Deadline information is accurate
- [ ] Win probability is mentioned
- [ ] Insights from database are used
- [ ] Questions are unique and varied

### ✅ User Experience
- [ ] Loading indicator shows during generation
- [ ] Smooth transitions between cards/questions
- [ ] Buttons are responsive
- [ ] No errors in console
- [ ] Mobile responsive (try resizing browser)

## 🔍 Expected Results

### Sample Flashcard
```
Question: What is the total value of the Government Infrastructure Project?
Answer: $5,000,000. This represents the estimated contract value for the project.
```

### Sample Quiz Question
```
Question: What is the assessed win probability for this tender?
Options:
  A. 55%
  B. 75% ← Correct!
  C. 95%
  D. Not assessed
```

## 🐛 Troubleshooting

### Issue: "No study tools generated"
**Solution**: 
- Check that tender exists in database
- Run: `npm run seed` to recreate sample data
- Refresh the page

### Issue: "API error" in console
**Solution**:
- Check that dev server is running
- Look for errors in terminal
- Verify database file exists: `./dev.db`

### Issue: Generic questions only
**Expected**: Without OpenAI API key, some questions will be generic. This is normal! The system still generates contextual questions from your tender data.

**To enable full AI**:
1. Get OpenAI API key from https://platform.openai.com/
2. Update `.env.local`: `OPENAI_API_KEY="sk-proj-your-key"`
3. Restart the dev server
4. Generate study tools again

### Issue: Buttons not clickable
**Solution**:
- Check for console errors
- Try a different tender project
- Clear browser cache
- Restart dev server

## 📊 Testing Different Tenders

Try each tender to see how study tools adapt:

### Tender 1: Government Infrastructure ($5M)
- High value, medium win probability
- Has requirements and compliance insights
- Good for comprehensive testing

### Tender 2: Cloud Migration ($2.5M)
- Tech-focused project
- Has risk and deadline insights
- Test technical question generation

### Tender 3: Healthcare IT ($3.8M)
- High win probability (82%)
- Strong compliance requirements
- Test compliance-focused questions

### Tender 4: Educational Software ($1.2M)
- Lower value project
- "Undecided" status
- Test with less data

## 🎓 Advanced Testing

### Test with New Documents
1. Go to Sources Panel (left side)
2. Click **"Add"** button
3. Upload a PDF, DOCX, or XLSX file
4. Click the **brain icon** to analyze
5. Generate study tools again
6. Verify questions include new document insights

### Test with Custom Tender
1. Create a new tender via API or database
2. Add custom insights
3. Generate study tools
4. Verify questions match your data

## 📱 Cross-Browser Testing
- [ ] Chrome/Edge (Chromium)
- [ ] Firefox
- [ ] Safari (if on Mac)
- [ ] Mobile browsers (responsive design)

## 🎉 Success Criteria

Your implementation is working correctly if:

1. ✅ All 5 sample tenders display on dashboard
2. ✅ Can navigate to workspace for any tender
3. ✅ Flashcards tool generates 8 cards
4. ✅ Quiz tool generates 6 questions
5. ✅ Cards show tender-specific information
6. ✅ Quiz provides accurate scoring
7. ✅ No console errors during normal use
8. ✅ UI is responsive and user-friendly

## 📝 Report Issues

If you encounter any issues:

1. **Check Console**: Press F12 → Console tab
2. **Note Error Message**: Copy the full error
3. **Check Network**: F12 → Network tab → Look for failed API calls
4. **Screenshot**: Take a screenshot of the issue
5. **Reproduce**: Can you make it happen again?

## 🚀 Next Steps

After testing study tools, try:
1. **Mind Map**: Click "Mind Map" tool in Studio
2. **Reports**: Generate tender briefing reports
3. **Chat**: Ask AI questions about your tender
4. **Upload**: Add real tender documents

---

**Happy Testing! 🎉**

The study tools feature is now fully functional and ready for use!


