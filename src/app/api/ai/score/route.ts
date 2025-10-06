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
        documents: true,
        insights: true,
      }
    });

    if (!tender) {
      return NextResponse.json(
        { error: "Tender not found" },
        { status: 404 }
      );
    }

    // Calculate win probability using AI
    const winProbability = await aiService.calculateWinProbability(tender);
    
    // Update tender with new score
    const updatedTender = await prisma.tender.update({
      where: { id: tenderId },
      data: {
        winProbability,
        lastScoredAt: new Date(),
      }
    });

    return NextResponse.json({
      success: true,
      winProbability,
      tender: updatedTender
    });
  } catch (error) {
    console.error("Error calculating win probability:", error);
    return NextResponse.json(
      { error: "Failed to calculate win probability" },
      { status: 500 }
    );
  }
}
