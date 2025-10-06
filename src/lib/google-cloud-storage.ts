import { Storage } from '@google-cloud/storage';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

// Initialize Google Cloud Storage
let storage: Storage | null = null;
let bucket: any = null;

function initializeStorage() {
  if (!storage && process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    try {
      const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      storage = new Storage({
        projectId: process.env.GOOGLE_CLOUD_PROJECT_ID || 'syntara-tenders-ai',
        credentials,
      });
      
      const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET || 'syntara-tenders-files';
      bucket = storage.bucket(bucketName);
      
      console.log('✅ Google Cloud Storage initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Cloud Storage:', error);
    }
  }
}

// Initialize on module load
initializeStorage();

/**
 * Upload a file to Google Cloud Storage
 * @param fileName - Name of the file
 * @param fileBuffer - File content as Buffer
 * @param tenderId - ID of the tender/project
 * @param mimeType - MIME type of the file
 * @returns Object with file information and URLs
 */
export async function uploadFileToCloud(
  fileName: string,
  fileBuffer: Buffer,
  tenderId: string,
  mimeType: string = 'application/octet-stream'
): Promise<{
  success: boolean;
  fileName: string;
  publicUrl?: string;
  gsUrl?: string;
  error?: string;
}> {
  if (!storage || !bucket) {
    return {
      success: false,
      fileName,
      error: 'Google Cloud Storage not configured',
    };
  }

  try {
    // Create a unique path for the file
    const filePath = `tenders/${tenderId}/${Date.now()}-${fileName}`;
    const file = bucket.file(filePath);

    // Upload the file
    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          tenderId,
          uploadedAt: new Date().toISOString(),
        },
      },
      resumable: false,
    });

    // Make the file publicly accessible (optional - you can configure this)
    // await file.makePublic();

    // Get a signed URL (valid for 7 days)
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    const publicUrl = signedUrl;
    const gsUrl = `gs://${bucket.name}/${filePath}`;

    console.log(`✅ File uploaded to Google Cloud: ${fileName}`);

    return {
      success: true,
      fileName,
      publicUrl,
      gsUrl,
    };
  } catch (error: any) {
    console.error('❌ Failed to upload file to Google Cloud:', error);
    return {
      success: false,
      fileName,
      error: error.message,
    };
  }
}

/**
 * Create a folder (prefix) in Google Cloud Storage
 * @param tenderId - ID of the tender/project
 * @param folderName - Name of the folder
 * @returns Folder URL
 */
export async function createTenderFolder(
  tenderId: string,
  folderName: string
): Promise<string | null> {
  if (!storage || !bucket) {
    console.warn('Google Cloud Storage not configured');
    return null;
  }

  try {
    // In GCS, folders are just prefixes
    const folderPath = `tenders/${tenderId}/${folderName}/`;
    const file = bucket.file(`${folderPath}.keep`);
    
    await file.save('', {
      metadata: {
        contentType: 'text/plain',
      },
    });

    // Get a signed URL for the folder
    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
    });

    return signedUrl;
  } catch (error) {
    console.error('Failed to create folder:', error);
    return null;
  }
}

/**
 * Get a signed URL for a file
 * @param gsUrl - Google Storage URL (gs://bucket/path)
 * @param expirationMinutes - URL expiration in minutes
 * @returns Signed URL
 */
export async function getSignedUrl(
  gsUrl: string,
  expirationMinutes: number = 60
): Promise<string | null> {
  if (!storage || !bucket) {
    return null;
  }

  try {
    // Extract file path from gs:// URL
    const path = gsUrl.replace(`gs://${bucket.name}/`, '');
    const file = bucket.file(path);

    const [signedUrl] = await file.getSignedUrl({
      action: 'read',
      expires: Date.now() + expirationMinutes * 60 * 1000,
    });

    return signedUrl;
  } catch (error) {
    console.error('Failed to get signed URL:', error);
    return null;
  }
}

/**
 * Delete a file from Google Cloud Storage
 * @param gsUrl - Google Storage URL (gs://bucket/path)
 * @returns Success status
 */
export async function deleteFile(gsUrl: string): Promise<boolean> {
  if (!storage || !bucket) {
    return false;
  }

  try {
    const path = gsUrl.replace(`gs://${bucket.name}/`, '');
    const file = bucket.file(path);
    await file.delete();
    
    console.log(`✅ File deleted from Google Cloud: ${path}`);
    return true;
  } catch (error) {
    console.error('Failed to delete file:', error);
    return false;
  }
}

/**
 * List all files for a tender
 * @param tenderId - ID of the tender/project
 * @returns Array of file information
 */
export async function listTenderFiles(tenderId: string): Promise<any[]> {
  if (!storage || !bucket) {
    return [];
  }

  try {
    const [files] = await bucket.getFiles({
      prefix: `tenders/${tenderId}/`,
    });

    return files.map((file: any) => ({
      name: file.name,
      size: file.metadata.size,
      contentType: file.metadata.contentType,
      created: file.metadata.timeCreated,
      updated: file.metadata.updated,
    }));
  } catch (error) {
    console.error('Failed to list files:', error);
    return [];
  }
}

/**
 * Extract text from a file using Gemini File API
 * @param buffer - File content as Buffer
 * @param filename - Name of the file
 * @param mimeType - MIME type of the file
 * @returns Extracted text content
 */
export async function extractWithGeminiFileAPI(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
  const apiKey = process.env.GOOGLE_API_KEY;
  
  if (!apiKey || !apiKey.startsWith('AIza')) {
    console.log("⚠️  Gemini API not configured - using standard extraction");
    return `[File uploaded: ${filename}. Gemini AI API key needed for enhanced extraction.]`;
  }
  
  try {
    // Create temporary file
    const tempPath = join(tmpdir(), `temp_${Date.now()}_${filename}`);
    writeFileSync(tempPath, buffer);
    
    console.log(`📤 Uploading ${filename} to Gemini File API...`);
    const fileManager = new GoogleAIFileManager(apiKey);
    const uploadResult = await fileManager.uploadFile(tempPath, {
      mimeType: mimeType || "application/pdf",
      displayName: filename,
    });
    
    console.log(`✅ File uploaded to Gemini: ${uploadResult.file.uri}`);
    
    // Use Gemini to extract text (works with PDFs, scanned PDFs, images, etc.)
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
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
    
    // Clean up temp file
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

