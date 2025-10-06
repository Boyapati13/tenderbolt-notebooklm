import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get('tenderId');

    const proposals = await prisma.proposal.findMany({
      where: tenderId ? { tenderId } : {},
      orderBy: { createdAt: 'desc' },
      include: {
        tender: {
          select: {
            title: true,
            id: true
          }
        }
      }
    });

    return NextResponse.json({ proposals });
  } catch (error) {
    console.error("Failed to fetch proposals:", error);
    return NextResponse.json(
      { error: "Failed to fetch proposals" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const proposalData = await req.json();
    
    const proposal = await prisma.proposal.create({
      data: {
        title: proposalData.title,
        version: proposalData.version,
        content: proposalData.sections,
        tenderId: proposalData.tenderId,
        metadata: {
          lastModified: proposalData.lastModified,
          createdAt: proposalData.createdAt
        }
      }
    });

    return NextResponse.json({ proposal });
  } catch (error) {
    console.error("Failed to save proposal:", error);
    return NextResponse.json(
      { error: "Failed to save proposal" },
      { status: 500 }
    );
  }
}
