import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: Promise<{ stageId: string }> }) {
  const { stageId } = await params;
  const body = await req.json();
  const stage = await prisma.stage.update({
    where: { id: stageId },
    data: {
      name: body.name,
      status: body.status,
      dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
    },
  });
  return NextResponse.json({ stage });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ stageId: string }> }) {
  const { stageId } = await params;
  await prisma.stage.delete({ where: { id: stageId } });
  return NextResponse.json({ ok: true });
}


