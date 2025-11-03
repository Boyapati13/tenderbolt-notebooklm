import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractTextFromFile } from "@/lib/parse";
import { extractInsightsFromText, saveInsightsToDatabase } from "@/lib/insights";
import { uploadFileToCloud } from "@/lib/google-cloud-storage";
import { autoExtractService } from "@/lib/auto-extract";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

async function extractWithGeminiFileAPI(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey || !apiKey.startsWith('AIza')) {
    console.log("⚠️  Gemini API not configured - using standard extraction");
    return `[File uploaded: ${filename}. Gemini AI API key needed for enhanced extraction.]`;
  }
  
  try {
    const tempPath = join(tmpdir(), `temp_${Date.now()}_${filename}`);
    writeFileSync(tempPath, buffer);
    
    console.log(`📤 Uploading ${filename} to Gemini File API...`);
    const fileManager = new GoogleAIFileManager(apiKey);
    const uploadResult = await fileManager.uploadFile(tempPath, {
      mimeType: mimeType || "application/pdf",
      displayName: filename,
    });
    
    console.log(`✅ File uploaded to Gemini: ${uploadResult.file.uri}`);
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const isPDF = filename.toLowerCase().endsWith('.pdf');
    const extractionPrompt = isPDF 
      ? "Extract ALL text content from this PDF document. Include all sections, headings, paragraphs, tables, lists, and any other text. Preserve the structure. If this is a scanned document or contains images with text, use OCR to extract the text."
      : "Extract and return all text content from this document in a clear, structured format.";
    
    console.log(`🤖 Gemini is reading ${filename} (${isPDF ? 'PDF with OCR' : 'document'})...`);
    const result = await model.generateContent([
      {
        fileData: {
          mimeType: uploadResult.file.mimeType,
          fileUri: uploadResult.file.uri
        }
      },
      { text: extractionPrompt }
    ]);
    
    const extractedText = result.response.text();
    console.log(`✅ Text extracted via Gemini! ${extractedText.length} characters`);
    
    try {
      unlinkSync(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    
    return extractedText;
    
  } catch (error) {
    console.error("❌ Gemini File API extraction error:", error);
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error("   Details:", errorMsg);
    return `[File uploaded: ${filename}. Gemini extraction error: ${errorMsg}]`;
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files");
    const tenderId = (form.get("projectId") as string) || (form.get("tenderId") as string) || "tender_default";
    const saved: Array<{ id: string; name: string; cloudUrl?: string }> = [];
    
    for (const f of files) {
      if (typeof f === "object" && "arrayBuffer" in f) {
        const file = f as File;
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        let text = await extractTextFromFile(file.name, file.type, bytes);
        
        if (file.name.toLowerCase().endsWith('.pdf') && text.includes('[PDF uploaded successfully')) {
          console.log("🤖 Using Gemini File API for PDF text extraction (supports scanned PDFs)...");
          text = await extractWithGeminiFileAPI(buffer, file.name, file.type);
        }
        else if (text.length < 50 && file.size > 1000) {
          console.log("🤖 Standard extraction yielded little text, trying Gemini File API...");
          text = await extractWithGeminiFileAPI(buffer, file.name, file.type);
        }
        
        let cloudUrl: string | undefined;
        try {
          const uploadResult = await uploadFileToCloud(
            file.name,
            buffer,
            tenderId,
            file.type || "application/octet-stream"
          );
          
          if (uploadResult.success) {
            cloudUrl = uploadResult.publicUrl;
            console.log(`✅ File uploaded to Google Cloud: ${file.name}`);
          } else {
            console.warn(`⚠️  Google Cloud upload failed: ${uploadResult.error}`);
          }
        } catch (error) {
          console.error("Google Cloud upload error:", error);
        }
        
        const category = determineDocumentCategory(file.name);
        const documentType = determineDocumentType(file.name);
        
        console.log(`📋 Document category: ${category}, type: ${documentType}`);
        
        let summary: string | undefined;
        if (category === 'tender' && text.length > 100) {
          console.log("📝 Generating automatic summary...");
          summary = await autoExtractService.generateSummary(text, file.name);
        }
        
        const effectiveTenderId = (category === 'supporting' || category === 'company') 
          ? 'global_documents' 
          : tenderId;
        
        const doc = await prisma.document.create({
          data: {
            filename: file.name,
            mimeType: file.type || "application/octet-stream",
            sizeBytes: file.size || 0,
            text,
            googleCloudUrl: cloudUrl,
            category,
            documentType,
            summary,
            tender: {
              connectOrCreate: {
                where: { id: effectiveTenderId },
                create: {
                  id: effectiveTenderId,
                  title: effectiveTenderId === 'global_documents' ? "Global Documents Library" : "Default Tender",
                  organization: {
                    connectOrCreate: {
                      where: { id: "org_demo" },
                      create: { id: "org_demo", name: "Demo Company Ltd" },
                    },
                  },
                },
              },
            },
          },
        });
        
        if (category === 'tender' && text.length > 100) {
          console.log("🔍 Auto-extracting tender metadata...");
          const metadata = await autoExtractService.extractTenderMetadata(text);
          
          if (Object.keys(metadata).length > 0) {
            await autoExtractService.updateTenderWithMetadata(tenderId, metadata);
            
            if (metadata.requirements && metadata.requirements.length > 0) {
              console.log("🎯 Calculating winning capabilities...");
              const capabilities = await autoExtractService.calculateWinningCapabilities(tenderId, metadata.requirements);
              
              console.log("📊 Performing gap analysis...");
              const gapAnalysis = await autoExtractService.performGapAnalysis(tenderId, metadata.requirements);
              
              await prisma.tender.update({
                where: { id: tenderId },
                data: { 
                  gapAnalysis,
                  winProbability: capabilities.winningProbability,
                  capabilityScore: capabilities.capabilityScore,
                  matchedRequirements: capabilities.matchedRequirements,
                  totalRequirements: capabilities.totalRequirements,
                  strengths: JSON.stringify(capabilities.strengths),
                  weaknesses: JSON.stringify(capabilities.weaknesses),
                  recommendations: JSON.stringify(capabilities.recommendations)
                }
              });
              
              console.log("✅ Tender updated with calculated capabilities:", {
                winningProbability: capabilities.winningProbability,
                capabilityScore: capabilities.capabilityScore,
                matchedRequirements: capabilities.matchedRequirements,
                totalRequirements: capabilities.totalRequirements
              });
            }
            
            console.log("✅ Tender metadata updated successfully");
          }
          
          if (summary) {
            console.log("💬 Posting summary to chat...");
            await prisma.message.create({
              data: {
                tenderId,
                role: "assistant",
                content: `## 📄 Document Summary: ${file.name}\n\n${summary}\n\n---\n*This summary was automatically generated after uploading the document.*`
              }
            });
            console.log("✅ Summary posted to chat");
          }
        }
        
        const insights = extractInsightsFromText(text, doc.id, file.name);
        await saveInsightsToDatabase(insights, tenderId);
        
        saved.push({ 
          id: doc.id, 
          name: file.name,
          cloudUrl
        });
      }
    }
    
    console.log(`✅ Upload complete! ${saved.length} file(s) processed`);
    return NextResponse.json({ ok: true, documents: saved });

  } catch (error) {
    console.error("❌ Upload API Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during upload.";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

function determineDocumentCategory(filename: string): string {
  const lower = filename.toLowerCase();
  
  if (
    lower.includes('registration') || 
    lower.includes('certificate') || 
    lower.includes('cert') ||
    lower.includes('iso') || 
    lower.includes('audit') ||
    lower.includes('compliance') || 
    lower.includes('license') ||
    lower.includes('permit') ||
    lower.includes('accreditation') ||
    lower.includes('quality') ||
    lower.includes('safety') ||
    lower.includes('insurance') ||
    lower.includes('tax') ||
    lower.includes('vat') ||
    lower.includes('financial statement') ||
    lower.includes('bank statement')
  ) {
    return 'supporting';
  }
  
  if (
    lower.includes('company') || 
    lower.includes('profile') || 
    lower.includes('capability') || 
    lower.includes('capabilities') ||
    lower.includes('portfolio') ||
    lower.includes('experience') ||
    lower.includes('cv') ||
    lower.includes('resume') ||
    lower.includes('brochure') ||
    lower.includes('presentation') ||
    lower.includes('about') ||
    lower.includes('overview') ||
    lower.includes('proposal') ||
    lower.includes('offer') ||
    lower.includes('response') ||
    lower.includes('technical offer') ||
    lower.includes('commercial offer') ||
    lower.includes('bid response') ||
    lower.includes('tender response')
  ) {
    return 'company';
  }
  
  if (
    lower.includes('rfq') || 
    lower.includes('rfp') || 
    lower.includes('tender') || 
    lower.includes('quotation') || 
    lower.includes('quote') ||
    lower.includes('requirement') ||
    lower.includes('procurement') ||
    lower.includes('solicitation') ||
    lower.includes('invitation') ||
    lower.includes('call for') ||
    lower.includes('specification')
  ) {
    return 'tender';
  }
  
  return 'tender';
}

function determineDocumentType(filename: string): string {
  const lower = filename.toLowerCase();
  
  if (lower.includes('iso')) return 'ISO Certificate';
  if (lower.includes('registration')) return 'Company Registration';
  if (lower.includes('audit')) return 'Audit Report';
  if (lower.includes('compliance')) return 'Compliance Certificate';
  if (lower.includes('license')) return 'Business License';
  if (lower.includes('permit')) return 'Permit';
  if (lower.includes('accreditation')) return 'Accreditation Certificate';
  if (lower.includes('quality')) return 'Quality Certificate';
  if (lower.includes('safety')) return 'Safety Certificate';
  if (lower.includes('insurance')) return 'Insurance Document';
  if (lower.includes('tax')) return 'Tax Document';
  if (lower.includes('vat')) return 'VAT Certificate';
  if (lower.includes('financial')) return 'Financial Statement';
  if (lower.includes('bank')) return 'Bank Statement';
  if (lower.includes('certificate') || lower.includes('cert')) return 'Certificate';
  
  if (lower.includes('profile')) return 'Company Profile';
  if (lower.includes('capability') || lower.includes('capabilities')) return 'Capabilities Statement';
  if (lower.includes('portfolio')) return 'Portfolio';
  if (lower.includes('experience')) return 'Experience Document';
  if (lower.includes('cv') || lower.includes('resume')) return 'CV/Resume';
  if (lower.includes('brochure')) return 'Company Brochure';
  if (lower.includes('presentation')) return 'Presentation';
  
  if (lower.includes('rfq')) return 'Request for Quotation';
  if (lower.includes('rfp')) return 'Request for Proposal';
  if (lower.includes('tender')) return 'Tender Document';
  if (lower.includes('bid')) return 'Bid Document';
  if (lower.includes('requirement')) return 'Requirements Document';
  if (lower.includes('specification')) return 'Technical Specifications';
  if (lower.includes('schedule')) return 'Schedule of Requirements';
  if (lower.includes('quotation') || lower.includes('quote')) return 'Quotation';
  if (lower.includes('proposal')) return 'Proposal';
  
  return 'General Document';
}