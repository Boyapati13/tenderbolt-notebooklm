import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get("tenderId");
    
    console.log("🔍 Debug API - Fetching documents for tenderId:", tenderId);
    
    // Fetch all documents
    const allDocs = await prisma.document.findMany({
      select: {
        id: true,
        filename: true,
        category: true,
        documentType: true,
        tenderId: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });
    
    console.log("📄 All documents in database:", allDocs.length);
    
    // Fetch documents for specific tender
    const tenderDocs = await prisma.document.findMany({
      where: tenderId ? {
        OR: [
          { tenderId, category: 'tender' },
          { category: 'supporting' },
          { category: 'company' },
        ]
      } : {},
      select: {
        id: true,
        filename: true,
        category: true,
        documentType: true,
        tenderId: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });
    
    console.log("📄 Documents for tender:", tenderDocs.length);
    
    // Fetch tenders
    const tenders = await prisma.tender.findMany({
      select: {
        id: true,
        title: true,
        createdAt: true
      },
      orderBy: { createdAt: "desc" }
    });
    
    console.log("📄 Tenders in database:", tenders.length);
    
    return NextResponse.json({
      success: true,
      debug: {
        tenderId,
        allDocumentsCount: allDocs.length,
        tenderDocumentsCount: tenderDocs.length,
        tendersCount: tenders.length,
        allDocuments: allDocs,
        tenderDocuments: tenderDocs,
        tenders: tenders
      }
    });

  } catch (error) {
    console.error("Debug API error:", error);
    return NextResponse.json(
      { error: "Debug failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
