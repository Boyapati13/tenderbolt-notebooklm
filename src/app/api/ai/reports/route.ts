import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { tenderId, reportType } = await req.json();
    
    if (!tenderId || !reportType) {
      return NextResponse.json(
        { error: "Tender ID and report type are required" },
        { status: 400 }
      );
    }

    // Get tender data
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        documents: {
          select: {
            id: true,
            filename: true,
            text: true,
            summary: true,
            category: true,
            documentType: true,
            createdAt: true
          }
        },
        insights: true,
        stages: true,
      }
    });

    if (!tender) {
      return NextResponse.json(
        { error: "Tender not found" },
        { status: 404 }
      );
    }

    // Also fetch global documents (supporting and company documents)
    const globalDocuments = await prisma.document.findMany({
      where: {
        OR: [
          { category: 'supporting' },
          { category: 'company' }
        ]
      },
      select: {
        id: true,
        filename: true,
        text: true,
        summary: true,
        category: true,
        documentType: true,
        createdAt: true
      }
    });

    // Combine tender documents with global documents
    tender.documents = [...tender.documents, ...globalDocuments];

    // Generate report using AI
    const report = await aiService.generateReport(reportType, tender);
    
    return NextResponse.json({
      success: true,
      report,
      reportType,
      tenderId
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}
