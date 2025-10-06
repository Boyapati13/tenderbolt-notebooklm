import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { tenderId, scores } = await req.json();
    
    if (!tenderId || !scores) {
      return NextResponse.json(
        { error: "Tender ID and scores are required" },
        { status: 400 }
      );
    }

    // Update tender with scoring data
    const tender = await prisma.tender.update({
      where: { id: tenderId },
      data: {
        technicalScore: scores.technical || 0,
        commercialScore: scores.commercial || 0,
        complianceScore: scores.compliance || 0,
        riskScore: scores.risk || 0,
        winProbability: calculateWinProbability(scores),
        lastScoredAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      tender,
      winProbability: tender.winProbability,
    });
  } catch (error) {
    console.error("Error updating tender scores:", error);
    return NextResponse.json(
      { error: "Failed to update tender scores" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get("tenderId");
    
    if (!tenderId) {
      return NextResponse.json(
        { error: "Tender ID is required" },
        { status: 400 }
      );
    }

    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      select: {
        id: true,
        title: true,
        technicalScore: true,
        commercialScore: true,
        complianceScore: true,
        riskScore: true,
        winProbability: true,
        lastScoredAt: true,
      },
    });

    if (!tender) {
      return NextResponse.json(
        { error: "Tender not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scores: {
        technical: tender.technicalScore || 0,
        commercial: tender.commercialScore || 0,
        compliance: tender.complianceScore || 0,
        risk: tender.riskScore || 0,
        winProbability: tender.winProbability || 0,
        lastScoredAt: tender.lastScoredAt,
      },
    });
  } catch (error) {
    console.error("Error fetching tender scores:", error);
    return NextResponse.json(
      { error: "Failed to fetch tender scores" },
      { status: 500 }
    );
  }
}

function calculateWinProbability(scores: {
  technical: number;
  commercial: number;
  compliance: number;
  risk: number;
}): number {
  // Weighted scoring algorithm
  const weights = {
    technical: 0.3,
    commercial: 0.25,
    compliance: 0.25,
    risk: 0.2,
  };

  const weightedScore = 
    (scores.technical * weights.technical) +
    (scores.commercial * weights.commercial) +
    (scores.compliance * weights.compliance) +
    ((100 - scores.risk) * weights.risk); // Risk is inverted (lower risk = higher score)

  // Convert to percentage and apply some business logic
  let winProbability = Math.round(weightedScore);
  
  // Adjust based on score distribution
  if (scores.technical < 60 || scores.compliance < 70) {
    winProbability = Math.max(winProbability - 20, 0);
  }
  
  if (scores.risk > 80) {
    winProbability = Math.max(winProbability - 15, 0);
  }

  return Math.min(Math.max(winProbability, 0), 100);
}
