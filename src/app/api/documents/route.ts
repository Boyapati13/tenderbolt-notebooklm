import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get("tenderId");
    
    // Fetch documents based on category:
    // - Tender documents: specific to this tender
    // - Supporting & Company documents: global (all tenders can access)
    const docs = await prisma.document.findMany({
      where: tenderId ? {
        OR: [
          { tenderId, category: 'tender' }, // Tender-specific documents
          { category: 'supporting' },        // Global supporting documents
          { category: 'company' },           // Global company documents
        ]
      } : {},
      orderBy: { createdAt: "desc" },
      take: 100,
      select: { 
        id: true, 
        filename: true, 
        sizeBytes: true, 
        text: true,
        category: true,
        documentType: true,
        summary: true,
        tenderId: true,
        createdAt: true 
      },
    });
    return NextResponse.json({ documents: docs });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return NextResponse.json(
      { error: "Failed to fetch documents", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenderId, filename, text, category, documentType, summary } = await req.json();

    if (!tenderId || !filename || !text) {
      return NextResponse.json(
        { error: "Tender ID, filename, and text are required" },
        { status: 400 }
      );
    }

    const document = await prisma.document.create({
      data: {
        tenderId,
        filename,
        text,
        mimeType: 'text/plain', // Default mimeType for text documents
        category: category || 'company',
        documentType: documentType || 'General Document',
        summary: summary || '',
        sizeBytes: Buffer.byteLength(text, 'utf8')
      }
    });

    return NextResponse.json({
      success: true,
      document: {
        id: document.id,
        filename: document.filename,
        category: document.category,
        documentType: document.documentType,
        summary: document.summary,
        createdAt: document.createdAt
      }
    });

  } catch (error) {
    console.error("Error creating document:", error);
    return NextResponse.json(
      { error: "Failed to create document", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}


