import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get("tenderId");
    
    const links = await prisma.discoveryLink.findMany({
      where: tenderId ? { tenderId } : {},
      orderBy: { addedAt: "desc" },
      take: 100,
    });
    
    return NextResponse.json({ links });
  } catch (error) {
    console.error("Error fetching discovery links:", error);
    return NextResponse.json(
      { error: "Failed to fetch discovery links" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { tenderId, title, url, type, description, tags, verified } = await req.json();

    if (!tenderId || !title || !url) {
      return NextResponse.json(
        { error: "Tender ID, title, and URL are required" },
        { status: 400 }
      );
    }

    const link = await prisma.discoveryLink.create({
      data: {
        tenderId,
        title,
        url,
        type: type || 'website',
        description: description || '',
        tags: tags || [],
        verified: verified || false,
        addedAt: new Date().toISOString(),
        accessCount: 0
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
        accessCount: link.accessCount
      }
    });

  } catch (error) {
    console.error("Error creating discovery link:", error);
    return NextResponse.json(
      { error: "Failed to create discovery link" },
      { status: 500 }
    );
  }
}
