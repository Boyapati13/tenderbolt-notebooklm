import { NextRequest, NextResponse } from "next/server";
import { autoExtractService } from "@/lib/auto-extract";
import { extractTextFromFile } from "@/lib/parse";
import { extractWithGeminiFileAPI } from "@/lib/google-cloud-storage";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    
    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    console.log("🧪 Testing document processing for:", file.name);
    
    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Extract text using both methods
    let extractedText = "";
    let extractionMethod = "";
    
    if (file.name.toLowerCase().endsWith('.pdf')) {
      try {
        console.log("📄 Using Gemini File API for PDF...");
        extractedText = await extractWithGeminiFileAPI(buffer, file.name, file.type);
        extractionMethod = "Gemini File API";
      } catch (error) {
        console.log("⚠️ Gemini File API failed, using standard extraction...");
        extractedText = await extractTextFromFile(file.name, file.type, buffer);
        extractionMethod = "Standard extraction";
      }
    } else {
      extractedText = await extractTextFromFile(file.name, file.type, buffer);
      extractionMethod = "Standard extraction";
    }
    
    console.log("📝 Text extracted using:", extractionMethod);
    console.log("📝 Text length:", extractedText.length);
    console.log("📝 First 1000 characters:", extractedText.substring(0, 1000));
    
    // Test AI extraction
    let metadata = {};
    let extractionError = null;
    
    if (extractedText.length > 100) {
      try {
        console.log("🤖 Testing AI metadata extraction...");
        metadata = await autoExtractService.extractTenderMetadata(extractedText);
      } catch (error) {
        extractionError = error instanceof Error ? error.message : "Unknown error";
        console.error("❌ AI extraction failed:", extractionError);
      }
    } else {
      extractionError = "Text too short for extraction";
    }
    
    return NextResponse.json({
      success: true,
      fileInfo: {
        name: file.name,
        size: file.size,
        type: file.type
      },
      extraction: {
        method: extractionMethod,
        textLength: extractedText.length,
        first1000Chars: extractedText.substring(0, 1000),
        fullText: extractedText
      },
      metadata: {
        extracted: metadata,
        error: extractionError
      }
    });

  } catch (error) {
    console.error("Test error:", error);
    return NextResponse.json(
      { error: "Test failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
