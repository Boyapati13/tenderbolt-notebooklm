import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await req.json();
    const { userId, role } = body;

    // Check if user exists, create if not
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: `${userId}@example.com`, // Placeholder
        name: `User ${userId}`,
        role: 'user'
      },
    });

    const teamMember = await prisma.teamMember.create({
      data: {
        projectId: params.projectId,
        userId,
        role,
      },
    });

    return NextResponse.json({ success: true, teamMember });
  } catch (error) {
    console.error(
      `Error adding team member to project ${params.projectId}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to add team member" },
      { status: 500 }
    );
  }
}
