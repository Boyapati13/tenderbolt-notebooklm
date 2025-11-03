import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const body = await req.json();
    const { name, url, type, content } = body;

    const document = await prisma.document.create({
      data: {
        name,
        url,
        type,
        content,
        projectId: params.projectId,
      },
    });

    return NextResponse.json({ success: true, document });
  } catch (error) {
    console.error(
      `Error creating document for project ${params.projectId}:`,
      error
    );
    return NextResponse.json(
      { error: "Failed to create document" },
      { status: 500 }
    );
  }
}
