import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Get real metrics from database
    const projects = await prisma.project.findMany({
      include: {
        stages: true,
        documents: true,
      },
    });

    const totalProjects = projects.length;
    const wonProjects = projects.filter(t => t.status === "won").length;
    const winRate = totalProjects > 0 ? (wonProjects / totalProjects) * 100 : 0;
    
    const totalValue = projects.reduce((sum, t) => sum + (t.value || 0), 0);
    const avgROI = totalProjects > 0 ? (totalValue / totalProjects) / 100000 : 0;
    
    const avgSubmissionTime = totalProjects > 0 
      ? projects.reduce((sum, t) => sum + (t.submissionDays || 0), 0) / totalProjects 
      : 0;

    const activeProjects = projects.filter(t => t.status === "active").length;
    const completedProjects = projects.filter(t => t.status === "completed").length;
    const totalDocuments = projects.reduce((sum, t) => sum + t.documents.length, 0);

    return NextResponse.json({
      metrics: {
        winRate: Math.round(winRate * 10) / 10,
        totalValue: Math.round(totalValue),
        avgROI: Math.round(avgROI * 10) / 10,
        avgSubmissionTime: Math.round(avgSubmissionTime * 10) / 10,
        activeProjects,
        completedProjects,
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
