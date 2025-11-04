import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await req.json();
    const { type, content } = body;

    const insight = await prisma.insight.create({
      data: {
        type,
        content,
        projectId: params.projectId,
      },
    });

    return NextResponse.json({ success: true, insight });
  } catch (error) {
    console.error(
      `Error creating insight for project ${params.projectId}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to create insight" },
      { status: 500 }
    );
  }
}
