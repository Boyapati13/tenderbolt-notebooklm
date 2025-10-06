# 🚀 QUICK TEST GUIDE

## How to See Your Auto-Extracted Data

### 1️⃣ Upload a Tender Document

```
1. Go to: http://localhost:3000/workspace/cmgcvvsl20002cbdkkdh04mgi
2. Click "Add" button in Sources panel (left side)
3. Select your tender PDF/DOCX
4. Click Upload
```

### 2️⃣ Watch Terminal

You should see:
```
📤 Uploading to Gemini File API...
✅ Text extracted via Gemini! 45000 characters
📝 Generating automatic summary...
🔍 Auto-extracting tender metadata...
✅ Metadata extracted: title, budget, location, deadlines
✅ Tender updated
📊 Performing gap analysis...
✅ Upload complete!
```

### 3️⃣ Refresh Browser (Ctrl+Shift+R)

You'll see a **NEW BANNER** at the top:

```
╔═══════════════════════════════════════════════════════════╗
║  🤖 AI EXTRACTED                                         ║
║  Auto-extracted from uploaded documents                   ║
║                                                           ║
║  TITLE              | BUDGET         | LOCATION | DEADLINES ║
║  [Extracted Title]  | KES 5,000,000  | Nairobi  | Dec 15... ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 📋 What Gets Auto-Extracted?

✅ **Title** - Full tender title  
✅ **Budget** - Amount with currency  
✅ **Location** - Project location  
✅ **Deadlines** - All important dates  
✅ **Summary** - 2-3 paragraph overview  
✅ **Gap Analysis** - Requirements vs capabilities  

---

## 🎯 Expected Results

### Upload: `RFQ_2025.pdf`
**Auto-Extracts:**
- Title: "Request for Quotation - Office Supplies 2025"
- Budget: "KES 5,000,000"
- Location: "Nairobi, Kenya"
- Deadlines: "Submission: Dec 15, 2025 | Award: Jan 5, 2026"

### Upload: `Company_Registration.pdf`
**Categorizes as:** Supporting Document  
**Type:** Company Registration  
**Used for:** Gap analysis  

---

## 🐛 Not Working?

### Check Terminal Logs
- Look for **❌ errors** in red
- Verify Gemini API key is valid
- Ensure document has text content

### Still Issues?
1. Check `.env.local` has `GOOGLE_API_KEY`
2. Restart server: `Ctrl+C` then `npm run dev`
3. Try a different document format (DOCX instead of PDF)

---

## 📞 Quick Help

**No banner showing?**  
→ Refresh page (Ctrl+Shift+R)

**Text not extracted?**  
→ Check terminal for "✅ Text extracted"

**Gap analysis empty?**  
→ Upload supporting documents first

---

🎉 **That's it!** Your tender intelligence system is ready!

