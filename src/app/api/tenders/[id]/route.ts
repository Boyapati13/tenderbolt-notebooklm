import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    
    const tender = await prisma.tender.findUnique({
      where: { id },
      include: {
        stages: { orderBy: { order: "asc" } },
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

    return NextResponse.json({ tender });
  } catch (error) {
    console.error("Error fetching tender:", error);
    return NextResponse.json(
      { error: "Failed to fetch tender" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    // Update tender with all provided fields
    const tender = await prisma.tender.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        client: body.client,
        value: body.value,
        deadline: body.deadline ? new Date(body.deadline) : null,
        status: body.status,
        priority: body.priority,
        tags: body.tags,
        oneDriveLink: body.oneDriveLink,
        googleDriveLink: body.googleDriveLink,
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
    console.error("Error updating tender:", error);
    return NextResponse.json(
      { error: "Failed to update tender" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.tender.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting tender:", error);
    return NextResponse.json(
      { error: "Failed to delete tender" },
      { status: 500 }
    );
  }
}
