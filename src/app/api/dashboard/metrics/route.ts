import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get real metrics from database
    const tenders = await prisma.tender.findMany({
      include: {
        stages: true,
        documents: true,
      },
    });

    const totalTenders = tenders.length;
    const wonTenders = tenders.filter(t => t.status === "won").length;
    const winRate = totalTenders > 0 ? (wonTenders / totalTenders) * 100 : 0;
    
    const totalValue = tenders.reduce((sum, t) => sum + (t.value || 0), 0);
    const avgROI = totalTenders > 0 ? (totalValue / totalTenders) / 100000 : 0;
    
    const avgSubmissionTime = totalTenders > 0 
      ? tenders.reduce((sum, t) => sum + (t.submissionDays || 0), 0) / totalTenders 
      : 0;

    const activeTenders = tenders.filter(t => t.status === "active").length;
    const completedTenders = tenders.filter(t => t.status === "completed").length;
    const totalDocuments = tenders.reduce((sum, t) => sum + t.documents.length, 0);

    return NextResponse.json({
      metrics: {
        winRate: Math.round(winRate * 10) / 10,
        totalValue: Math.round(totalValue),
        avgROI: Math.round(avgROI * 10) / 10,
        avgSubmissionTime: Math.round(avgSubmissionTime * 10) / 10,
        activeTenders,
        completedTenders,
        totalDocuments,
      }
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
