import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai-service";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { tenderId } = await req.json();
    
    if (!tenderId) {
      return NextResponse.json(
        { error: "Tender ID is required" },
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

    // Generate study tools using AI
    const studyTools = await aiService.generateStudyTools(tender);
    
    return NextResponse.json({
      success: true,
      flashcards: studyTools.flashcards,
      quiz: studyTools.quiz,
      tenderId
    });
  } catch (error) {
    console.error("Error generating study tools:", error);
    return NextResponse.json(
      { error: "Failed to generate study tools" },
      { status: 500 }
    );
  }
}
