import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const count = await prisma.stage.count({ where: { tenderId: params.id } });
  const stage = await prisma.stage.create({
    data: {
      name: body.name ?? `Stage ${count + 1}`,
      order: typeof body.order === "number" ? body.order : count + 1,
      dueDate: body.dueDate ? new Date(body.dueDate) : null,
      status: body.status ?? "PENDING",
      tenderId: params.id,
    },
  });
  return NextResponse.json({ stage });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updates = body.stages as Array<{ id: string; order: number }>; // reorder
  for (const s of updates) {
    await prisma.stage.update({ where: { id: s.id }, data: { order: s.order } });
  }
  return NextResponse.json({ ok: true });
}


