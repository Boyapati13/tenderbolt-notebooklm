import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await req.json();
    const { name, status, dueDate, order } = body;

    const stage = await prisma.stage.create({
      data: {
        name,
        status,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        order,
        projectId: params.projectId,
      },
    });

    return NextResponse.json({ success: true, stage });
  } catch (error) {
    console.error(
      `Error creating stage for project ${params.projectId}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to create stage" },
      { status: 500 }
    );
  }
}
