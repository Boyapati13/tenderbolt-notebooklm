import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizationId = searchParams.get("organizationId") || "org_dev";
    const timeframe = searchParams.get("timeframe") || "6months";

    // Calculate date range
    const now = new Date();
    const startDate = new Date();
    switch (timeframe) {
      case "1month":
        startDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        startDate.setMonth(now.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(now.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(now.getMonth() - 6);
    }

    // Get tenders in date range with team members
    const tenders = await prisma.tender.findMany({
      where: {
        organizationId,
        createdAt: {
          gte: startDate,
        },
      },
      include: {
        stages: true,
        documents: true,
        insights: true,
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              }
            }
          }
        },
      },
    });

    // Calculate analytics
    const analytics = {
      totalTenders: tenders.length,
      wonTenders: tenders.filter(t => t.status === "won").length,
      lostTenders: tenders.filter(t => t.status === "lost").length,
      activeTenders: tenders.filter(t => t.status === "active").length,
      totalValue: tenders.reduce((sum, t) => sum + (t.value || 0), 0),
      avgWinRate: 0,
      avgSubmissionTime: 0,
      avgROI: 0,
      stageDistribution: {},
      riskDistribution: {},
      complianceDistribution: {},
      monthlyTrends: {},
    };

    // Calculate win rate
    if (analytics.totalTenders > 0) {
      analytics.avgWinRate = (analytics.wonTenders / analytics.totalTenders) * 100;
    }

    // Calculate average submission time
    const tendersWithSubmissionTime = tenders.filter(t => t.submissionDays);
    if (tendersWithSubmissionTime.length > 0) {
      analytics.avgSubmissionTime = tendersWithSubmissionTime.reduce(
        (sum, t) => sum + (t.submissionDays || 0), 0
      ) / tendersWithSubmissionTime.length;
    }

    // Calculate average ROI
    if (analytics.totalTenders > 0) {
      analytics.avgROI = (analytics.totalValue / analytics.totalTenders) / 100000;
    }

    // Stage distribution
    const stageCounts: { [key: string]: number } = {};
    tenders.forEach(tender => {
      tender.stages.forEach(stage => {
        stageCounts[stage.name] = (stageCounts[stage.name] || 0) + 1;
      });
    });
    analytics.stageDistribution = stageCounts;

    // Risk distribution
    const riskCounts: { [key: string]: number } = { low: 0, medium: 0, high: 0 };
    tenders.forEach(tender => {
      const riskInsights = tender.insights.filter(i => i.type === "risk");
      if (riskInsights.length > 0) {
        riskCounts.high += 1;
      } else {
        riskCounts.low += 1;
      }
    });
    analytics.riskDistribution = riskCounts;

    // Compliance distribution
    const complianceCounts: { [key: string]: number } = { compliant: 0, partial: 0, nonCompliant: 0 };
    tenders.forEach(tender => {
      const complianceInsights = tender.insights.filter(i => i.type === "compliance");
      if (complianceInsights.length >= 3) {
        complianceCounts.compliant += 1;
      } else if (complianceInsights.length >= 1) {
        complianceCounts.partial += 1;
      } else {
        complianceCounts.nonCompliant += 1;
      }
    });
    analytics.complianceDistribution = complianceCounts;

    // Monthly trends
    const monthlyTrends: { [key: string]: { tenders: number; value: number; wins: number } } = {};
    tenders.forEach(tender => {
      const month = tender.createdAt.toISOString().substring(0, 7); // YYYY-MM
      if (!monthlyTrends[month]) {
        monthlyTrends[month] = { tenders: 0, value: 0, wins: 0 };
      }
      monthlyTrends[month].tenders += 1;
      monthlyTrends[month].value += tender.value || 0;
      if (tender.status === "won") {
        monthlyTrends[month].wins += 1;
      }
    });
    analytics.monthlyTrends = monthlyTrends;

    // Team performance metrics
    const teamPerformance: { [key: string]: { projects: number; wins: number; totalValue: number } } = {};
    tenders.forEach(tender => {
      tender.teamMembers.forEach(member => {
        const userName = member.user.name || member.user.email;
        if (!teamPerformance[userName]) {
          teamPerformance[userName] = { projects: 0, wins: 0, totalValue: 0 };
        }
        teamPerformance[userName].projects += 1;
        teamPerformance[userName].totalValue += tender.value || 0;
        if (tender.status === "won" || tender.status === "closed") {
          teamPerformance[userName].wins += 1;
        }
      });
    });

    return NextResponse.json({
      success: true,
      analytics: {
        ...analytics,
        teamPerformance,
        winRate: analytics.avgWinRate,
        totalValue: analytics.totalValue,
        avgROI: analytics.avgROI,
        avgSubmissionTime: analytics.avgSubmissionTime,
        activeTenders: analytics.activeTenders,
        completedTenders: analytics.wonTenders + analytics.lostTenders,
      },
      timeframe,
      dateRange: {
        start: startDate.toISOString(),
        end: now.toISOString(),
      },
    });
  } catch (error) {
    console.error("Error fetching tender analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch tender analytics" },
      { status: 500 }
    );
  }
}
