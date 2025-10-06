import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const link = await prisma.discoveryLink.update({
      where: { id },
      data: {
        accessCount: { increment: 1 },
        lastAccessed: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      accessCount: link.accessCount,
      lastAccessed: link.lastAccessed
    });

  } catch (error) {
    console.error("Error tracking discovery link access:", error);
    return NextResponse.json(
      { error: "Failed to track access" },
      { status: 500 }
    );
  }
}
