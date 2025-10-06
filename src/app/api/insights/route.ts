import { NextResponse } from "next/server";
import { getInsightsForTender } from "@/lib/insights";
import { aiService } from "@/lib/ai-service";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get("tenderId") || "tender_default";
    
    const insights = await getInsightsForTender(tenderId);
    return NextResponse.json({ insights });
  } catch (error) {
    console.error("Error fetching insights:", error);
    return NextResponse.json(
      { error: "Failed to fetch insights" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { tenderId, documentId } = await req.json();
    
    if (!tenderId || !documentId) {
      return NextResponse.json(
        { error: "Tender ID and Document ID are required" },
        { status: 400 }
      );
    }

    // Get the document
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document || !document.text) {
      return NextResponse.json(
        { error: "Document not found or has no text content" },
        { status: 404 }
      );
    }

    // Analyze document with AI
    const analysis = await aiService.analyzeDocument(document.text, document.filename);
    
    // Save insights to database
    const insights = [];
    
    // Save requirements
    for (const req of analysis.requirements) {
      const insight = await prisma.insight.create({
        data: {
          type: "requirement",
          content: req,
          citation: `Extracted from ${document.filename}`,
          tenderId,
        },
      });
      insights.push(insight);
    }

    // Save compliance
    for (const comp of analysis.compliance) {
      const insight = await prisma.insight.create({
        data: {
          type: "compliance",
          content: comp,
          citation: `Extracted from ${document.filename}`,
          tenderId,
        },
      });
      insights.push(insight);
    }

    // Save risks
    for (const risk of analysis.risks) {
      const insight = await prisma.insight.create({
        data: {
          type: "risk",
          content: risk,
          citation: `Extracted from ${document.filename}`,
          tenderId,
        },
      });
      insights.push(insight);
    }

    // Save deadlines
    for (const deadline of analysis.deadlines) {
      const insight = await prisma.insight.create({
        data: {
          type: "deadline",
          content: deadline,
          citation: `Extracted from ${document.filename}`,
          tenderId,
        },
      });
      insights.push(insight);
    }

    return NextResponse.json({
      success: true,
      insights,
      summary: analysis.summary
    });
  } catch (error) {
    console.error("Error analyzing document:", error);
    return NextResponse.json(
      { error: "Failed to analyze document" },
      { status: 500 }
    );
  }
}
