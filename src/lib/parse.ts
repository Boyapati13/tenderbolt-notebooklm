import * as XLSX from "xlsx";
import * as mammoth from "mammoth";

async function extractTextFromPDF(bytes: ArrayBuffer): Promise<string> {
  console.log("📄 PDF uploaded - text extraction skipped (Gemini will read PDF directly)");
  
  // Return a placeholder - Gemini can read PDFs natively
  // We save the file and let Gemini's native PDF capabilities handle it
  return "[PDF uploaded successfully. Gemini AI can read this PDF directly - just ask questions about it!]";
}

export async function extractTextFromFile(name: string, type: string, bytes: ArrayBuffer): Promise<string> {
  const lower = name.toLowerCase();
  try {
    if (lower.endsWith(".pdf") || type === "application/pdf") {
      return await extractTextFromPDF(bytes);
    }
    if (lower.endsWith(".docx") || type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document") {
      const res = await mammoth.extractRawText({ arrayBuffer: bytes });
      return (res.value || "").trim();
    }
    if (lower.endsWith(".xlsx") || lower.endsWith(".xls") || type.includes("spreadsheet")) {
      const wb = XLSX.read(bytes, { type: "array" });
      const sheets = wb.SheetNames;
      let text = "";
      for (const s of sheets) {
        const ws = wb.Sheets[s];
        text += (XLSX.utils.sheet_to_csv(ws) || "") + "\n";
      }
      return text.trim();
    }
    // Fallback try to decode as text
    return Buffer.from(bytes).toString("utf8");
  } catch {
    return "";
  }
}


