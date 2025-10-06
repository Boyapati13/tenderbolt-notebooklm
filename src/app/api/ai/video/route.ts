import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { tenderId, style = "notebooklm" } = await req.json();
    
    if (!tenderId) {
      return NextResponse.json(
        { error: "Tender ID is required" },
        { status: 400 }
      );
    }

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

    const videoScript = await aiService.generateVideoScript(tender, style);
    
    return NextResponse.json({
      success: true,
      videoScript,
      tenderId
    });
  } catch (error) {
    console.error("Error generating video script:", error);
    return NextResponse.json(
      { error: "Failed to generate video script" },
      { status: 500 }
    );
  }
}
