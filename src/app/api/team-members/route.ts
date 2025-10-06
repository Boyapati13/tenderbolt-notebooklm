import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { tenderId, userId, role } = body;

    if (!tenderId || !userId || !role) {
      return NextResponse.json(
        { error: "Tender ID, User ID, and Role are required" },
        { status: 400 }
      );
    }

    // Check if assignment already exists
    const existing = await prisma.teamMember.findUnique({
      where: {
        userId_tenderId: {
          userId,
          tenderId,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User is already assigned to this project" },
        { status: 400 }
      );
    }

    // Create team member assignment
    const teamMember = await prisma.teamMember.create({
      data: {
        userId,
        tenderId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, teamMember });
  } catch (error) {
    console.error("Error assigning team member:", error);
    return NextResponse.json(
      { error: "Failed to assign team member" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const teamMemberId = searchParams.get("id");

    if (!teamMemberId) {
      return NextResponse.json(
        { error: "Team member ID is required" },
        { status: 400 }
      );
    }

    await prisma.teamMember.delete({
      where: { id: teamMemberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing team member:", error);
    return NextResponse.json(
      { error: "Failed to remove team member" },
      { status: 500 }
    );
  }
}

