import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const updates = await req.json();

    const link = await prisma.discoveryLink.update({
      where: { id },
      data: {
        ...updates,
        updatedAt: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      link: {
        id: link.id,
        title: link.title,
        url: link.url,
        type: link.type,
        description: link.description,
        tags: link.tags,
        verified: link.verified,
        addedAt: link.addedAt,
        lastAccessed: link.lastAccessed,
        accessCount: link.accessCount
      }
    });

  } catch (error) {
    console.error("Error updating discovery link:", error);
    return NextResponse.json(
      { error: "Failed to update discovery link" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.discoveryLink.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("Error deleting discovery link:", error);
    return NextResponse.json(
      { error: "Failed to delete discovery link" },
      { status: 500 }
    );
  }
}
