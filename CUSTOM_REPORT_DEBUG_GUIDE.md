# Custom Report Debug Guide

## 🔧 **Troubleshooting Steps**

### **Step 1: Check Browser Console**
1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Try creating a custom report
4. Look for these debug messages:
   - 🎯 Generating custom report with config
   - 📡 Sending request to /api/ai/reports
   - 📥 Response status
   - ✅ Response data
   - 🤖 AI Response length

### **Step 2: Test with Minimal Configuration**
Try this exact configuration:

**Report Title:** `Test Report`
**Description:** `Testing custom report generation`
**What I Need from This Report:** `I need a simple analysis of this tender opportunity`
**Sections:** 
- `Executive Summary`
- `Key Findings`

**Target Audience:** `Project Managers`
**Complexity:** `Simple`

### **Step 3: Check Network Tab**
1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Try creating a custom report
4. Look for the `/api/ai/reports` request
5. Check if it returns a 200 status
6. Look at the response content

### **Step 4: Common Issues & Solutions**

#### **Issue 1: "Please provide a title, at least one section, and specify what you need from the report"**
**Solution:** Make sure you fill in:
- Report Title (required)
- At least one section (click "Add Section")
- "What I Need from This Report" field (required)

#### **Issue 2: Empty or "No content generated"**
**Possible causes:**
- AI service not configured (check console for "Mock" responses)
- API endpoint not working
- Missing tender data

#### **Issue 3: API Error 500**
**Check:**
- Database connection
- AI service configuration
- Environment variables

### **Step 5: Manual Test**

Try this step-by-step:

1. **Go to any tender detail page**
2. **Click "Reports" tab**
3. **Click "Create Custom Report" button**
4. **Fill in exactly:**
   ```
   Title: Test Custom Report
   Description: Testing the custom report feature
   What I Need: I need to understand the technical requirements and costs
   Sections: 
   - Technical Analysis
   - Cost Analysis
   ```
5. **Add Target Audience:** `Technical Teams`
6. **Click "Create Report"**
7. **Check browser console for debug messages**

### **Step 6: Check AI Service Status**

Look for these console messages:
- ✅ AI Service initialized with Google Gemini
- ✅ AI Service initialized with OpenAI
- ℹ️ AI Service running in mock mode

If you see "mock mode", the AI service isn't configured, but you should still get a mock report.

### **Step 7: Expected Behavior**

**If working correctly, you should see:**
1. Console logs showing the generation process
2. A report appears in the interface
3. The modal closes automatically
4. The report shows your custom title and sections

**If not working, you'll see:**
1. Error messages in console
2. Alert popup with error details
3. No report generated
4. Modal stays open

### **Step 8: Quick Fixes**

#### **Fix 1: Reset Configuration**
```javascript
// In browser console, run:
localStorage.clear();
location.reload();
```

#### **Fix 2: Check Required Fields**
Make sure all required fields are filled:
- ✅ Title
- ✅ At least one section
- ✅ Requirements field

#### **Fix 3: Try Different Tender**
- Go to a different tender/project
- Try creating a custom report there
- Some tenders might have more data

### **Step 9: Report the Issue**

If it's still not working, please share:
1. **Console error messages** (copy/paste)
2. **Network request details** (status code and response)
3. **Configuration you used** (title, sections, requirements)
4. **Browser and version** (Chrome, Firefox, etc.)

### **Step 10: Alternative Test**

Try the regular report templates first:
1. Click on "Tender Briefing" template
2. See if that works
3. If regular templates work but custom doesn't, it's a custom report specific issue

## 🎯 **Expected Console Output (Working)**

```
🎯 Generating custom report with config: {title: "Test Report", ...}
📡 Sending request to /api/ai/reports: {tenderId: "...", reportType: "custom", ...}
📥 Response status: 200
✅ Response data: {success: true, content: "# Test Report\n\n## Executive Summary...", ...}
🤖 generateCustomReport called with config: {title: "Test Report", ...}
📝 Generated prompt: Generate a custom report titled "Test Report"...
🤖 AI Response length: 1500
🤖 AI Response preview: # Test Report...
📄 Created report object: {id: "custom-report-...", title: "Test Report", ...}
```

If you see this output, the custom report should be working! If not, there's an issue that needs to be fixed.
