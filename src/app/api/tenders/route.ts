import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const tenders = await prisma.tender.findMany({
      include: {
        stages: { orderBy: { order: "asc" } },
        documents: true,
        insights: true,
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              }
            }
          }
        },
        externalLinks: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // If no tenders exist, create some mock data for demo
    if (tenders.length === 0) {
      const mockTender = await prisma.tender.create({
        data: {
          title: "Government IT Infrastructure Modernization",
          description: "Comprehensive IT infrastructure upgrade project for federal agencies",
          status: "active",
          value: 2500000,
          deadline: "2024-03-15",
          organizationId: "org_dev",
          winProbability: 75,
          technicalScore: 85,
          commercialScore: 78,
          complianceScore: 92,
          riskScore: 25,
        },
      });

      // Create additional mock tenders for better demo
      await prisma.tender.createMany({
        data: [
          {
            title: "Healthcare Data Analytics Platform",
            description: "AI-powered healthcare data analysis and reporting system",
            status: "won",
            value: 1800000,
            deadline: "2024-01-30",
            organizationId: "org_dev",
            winProbability: 95,
            technicalScore: 92,
            commercialScore: 88,
            complianceScore: 95,
            riskScore: 15,
          },
          {
            title: "Smart City IoT Implementation",
            description: "Internet of Things infrastructure for smart city management",
            status: "active",
            value: 3200000,
            deadline: "2024-04-20",
            organizationId: "org_dev",
            winProbability: 65,
            technicalScore: 78,
            commercialScore: 72,
            complianceScore: 85,
            riskScore: 35,
          },
          {
            title: "Financial Services Security Upgrade",
            description: "Cybersecurity enhancement for banking infrastructure",
            status: "lost",
            value: 1200000,
            deadline: "2024-01-15",
            organizationId: "org_dev",
            winProbability: 0,
            technicalScore: 70,
            commercialScore: 65,
            complianceScore: 80,
            riskScore: 60,
          },
        ],
      });

      // Create some mock stages
      await prisma.stage.createMany({
        data: [
          {
            tenderId: mockTender.id,
            name: "Requirements Analysis",
            status: "completed",
            dueDate: "2024-01-15",
            order: 1,
          },
          {
            tenderId: mockTender.id,
            name: "Proposal Development",
            status: "active",
            dueDate: "2024-02-15",
            order: 2,
          },
          {
            tenderId: mockTender.id,
            name: "Technical Review",
            status: "pending",
            dueDate: "2024-03-01",
            order: 3,
          },
          {
            tenderId: mockTender.id,
            name: "Final Submission",
            status: "pending",
            dueDate: "2024-03-15",
            order: 4,
          },
        ],
      });

      // Fetch the updated tenders with stages, team members, and external links
      const updatedTenders = await prisma.tender.findMany({
        include: {
          stages: { orderBy: { order: "asc" } },
          documents: true,
          insights: true,
          teamMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatar: true,
                  role: true,
                }
              }
            }
          },
          externalLinks: true,
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ tenders: updatedTenders });
    }

    return NextResponse.json({ tenders });
  } catch (error) {
    console.error("Error fetching tenders:", error);
    return NextResponse.json(
      { error: "Failed to fetch tenders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Create tender with all fields
    const tender = await prisma.tender.create({
      data: {
        title: body.title ?? "Untitled Tender",
        description: body.description ?? null,
        client: body.client ?? null,
        value: body.value ?? null,
        deadline: body.deadline ? new Date(body.deadline) : null,
        status: body.status ?? "discovery",
        priority: body.priority ?? "medium",
        tags: body.tags ?? null,
        oneDriveLink: body.oneDriveLink ?? null,
        googleDriveLink: body.googleDriveLink ?? null,
        winProbability: 50, // Default starting probability
        organization: {
          connectOrCreate: {
            where: { id: body.organizationId ?? "org_demo" },
            create: { 
              id: body.organizationId ?? "org_demo", 
              name: body.organizationName ?? "Demo Company Ltd" 
            },
          },
        },
      },
      include: {
        teamMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                role: true,
              }
            }
          }
        },
        externalLinks: true,
      },
    });
    
    return NextResponse.json({ success: true, tender });
  } catch (error) {
    console.error("Error creating tender:", error);
    return NextResponse.json(
      { error: "Failed to create tender" },
      { status: 500 }
    );
  }
}


