import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
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

    // If no projects exist, create some mock data for demo
    if (projects.length === 0) {
      const mockProject = await prisma.project.create({
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

      // Create additional mock projects for better demo
      await prisma.project.createMany({
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
            projectId: mockProject.id,
            name: "Requirements Analysis",
            status: "completed",
            dueDate: "2024-01-15",
            order: 1,
          },
          {
            projectId: mockProject.id,
            name: "Proposal Development",
            status: "active",
            dueDate: "2024-02-15",
            order: 2,
          },
          {
            projectId: mockProject.id,
            name: "Technical Review",
            status: "pending",
            dueDate: "2024-03-01",
            order: 3,
          },
          {
            projectId: mockProject.id,
            name: "Final Submission",
            status: "pending",
            dueDate: "2024-03-15",
            order: 4,
          },
        ],
      });

      // Fetch the updated projects with stages, team members, and external links
      const updatedProjects = await prisma.project.findMany({
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

      return NextResponse.json({ projects: updatedProjects });
    }

    return NextResponse.json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Create project with all fields
    const project = await prisma.project.create({
      data: {
        title: body.title ?? "Untitled Project",
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
    
    return NextResponse.json({ success: true, project });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}


