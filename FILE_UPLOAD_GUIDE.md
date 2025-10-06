# 📁 File Upload Guide - All Formats Supported

## ✅ Supported File Types

Your Tenderbolt NotebookLM application now supports **ALL major document formats**, including scanned PDFs!

### File Type Support Matrix

| File Type | Extension | Extraction Method | Scanned Support |
|-----------|-----------|-------------------|-----------------|
| **PDF (Text)** | `.pdf` | Gemini File API | ✅ Yes |
| **PDF (Scanned)** | `.pdf` | Gemini Vision OCR | ✅ Yes |
| **Word Documents** | `.docx` | Mammoth library | N/A |
| **Excel Spreadsheets** | `.xlsx`, `.xls` | XLSX library | N/A |
| **Text Files** | `.txt` | Direct read | N/A |
| **Any Document** | Various | Gemini File API (fallback) | ✅ Yes |

---

## 🚀 How It Works

### 1. **Regular PDFs (Text-based)**
- Uploaded to Gemini File API
- Gemini extracts text with full structure preservation
- Tables, lists, and formatting maintained
- ✅ **Full AI analysis available**

### 2. **Scanned PDFs (Image-based)**
- Uploaded to Gemini File API
- Gemini uses **Vision OCR** to read the text
- Handles even poor quality scans
- ✅ **Full AI analysis available**

### 3. **Word Documents (.docx)**
- Mammoth library extracts text
- Fast and reliable
- ✅ **Full AI analysis available**

### 4. **Excel Spreadsheets (.xlsx, .xls)**
- XLSX library parses all sheets
- Converts to CSV format
- ✅ **Full AI analysis available**

### 5. **Text Files (.txt)**
- Direct UTF-8 reading
- Instant processing
- ✅ **Full AI analysis available**

---

## 📤 How to Upload Files

### Method 1: Click Upload Button
1. Go to your workspace
2. Click the **"Add"** button in the Sources panel
3. Select your files (can select multiple)
4. Click Open
5. Wait for success message

### Method 2: Drag and Drop
1. Drag files from your file explorer
2. Drop them into the upload area
3. Files will upload automatically

---

## 🔍 What Happens During Upload

### You'll See in Browser:
```
✅ Successfully uploaded 1 file(s)!
```

### You'll See in Terminal:

**For Regular PDFs:**
```
📄 PDF uploaded - text extraction skipped (Gemini will read PDF directly)
🤖 Using Gemini File API for PDF text extraction (supports scanned PDFs)...
📤 Uploading document.pdf to Gemini File API...
✅ File uploaded to Gemini: https://generativelanguage.googleapis.com/...
🤖 Gemini is reading document.pdf (PDF with OCR)...
✅ Text extracted via Gemini! 45000 characters
POST /api/upload 200 in 15000ms
```

**For DOCX Files:**
```
✅ DOCX text extracted successfully
POST /api/upload 200 in 500ms
```

**For Excel Files:**
```
✅ Excel data converted to CSV
POST /api/upload 200 in 300ms
```

---

## 🎯 After Upload - AI Features Available

Once files are uploaded and text extracted, you can:

### 1. **Chat with AI**
```
"Summarize the key requirements from the tender document"
"What are the main compliance standards?"
"List all the deadlines mentioned"
```

### 2. **Generate Study Tools**
- Flashcards
- Quiz questions
- Practice exams

### 3. **Create Reports**
- Executive summaries
- Technical analysis
- Compliance checklists

### 4. **Audio/Video Overviews**
- AI-generated scripts
- Custom durations
- Different narration styles

---

## 🔧 Troubleshooting

### Upload Not Working?

1. **Check Browser Console** (F12)
   - Look for errors
   - Check network tab

2. **Check Terminal Logs**
   - Should see `📤 Uploading...` messages
   - Look for error messages

3. **File Size Limits**
   - Gemini File API: Up to 2GB per file
   - Most PDFs work fine

4. **Supported Formats**
   - Make sure file extension is `.pdf`, `.docx`, `.xlsx`, or `.txt`
   - Other formats will be treated as text

### Upload Successful But No Text?

If you see the file uploaded but get errors:
- **Scanned PDF**: Gemini will use OCR (takes longer, 10-30 seconds)
- **Protected PDF**: May need to remove password protection first
- **Corrupted File**: Try re-downloading the original

---

## 💡 Pro Tips

### For Best Results:

1. **PDF Quality**
   - Higher resolution scans = better OCR results
   - Text-based PDFs extract faster than scanned

2. **File Size**
   - Smaller files = faster processing
   - Consider splitting very large PDFs (>50 pages)

3. **Multiple Files**
   - Upload related documents together
   - AI can cross-reference between documents

4. **File Names**
   - Use descriptive names
   - AI uses filenames for context

---

## 🎉 Key Features

### ✅ Gemini File API Benefits

1. **Universal Format Support**
   - Handles ANY document format
   - Automatic format detection

2. **OCR for Scanned Documents**
   - Vision AI reads scanned PDFs
   - No pre-processing needed

3. **Structure Preservation**
   - Maintains tables and lists
   - Preserves headings and formatting

4. **Large File Support**
   - Up to 2GB per file
   - Handles multi-page documents

---

## 📊 Current Configuration

- **API Key**: Configured ✅
- **Model**: gemini-2.5-flash (2025 Latest)
- **Features**: OCR, Vision, Text extraction
- **Max File Size**: 2GB
- **Supported Formats**: PDF, DOCX, XLSX, XLS, TXT, and more

---

## 🚀 Ready to Use!

Your system is configured to handle:
- ✅ Regular PDFs
- ✅ Scanned PDFs
- ✅ Word documents
- ✅ Excel spreadsheets  
- ✅ Text files
- ✅ Any document format (via Gemini fallback)

**Just upload your files and start chatting with the AI!**

---

**Last Updated**: October 5, 2025  
**Status**: ✅ Fully Operational

