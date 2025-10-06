import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { tenderId, style = "presentation" } = await req.json();
    
    if (!tenderId) {
      return NextResponse.json(
        { error: "Tender ID is required" },
        { status: 400 }
      );
    }

    // Get tender data
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        stages: { orderBy: { order: "asc" } },
        documents: true,
        insights: true,
      },
    });

    if (!tender) {
      return NextResponse.json(
        { error: "Tender not found" },
        { status: 404 }
      );
    }

    // Generate video slides
    const slides = generateVideoSlides(tender, style);
    
    // In a real implementation, you would use video generation services like:
    // - RunwayML
    // - Synthesia
    // - D-ID
    // - HeyGen
    
    return NextResponse.json({
      success: true,
      slides,
      videoUrl: `/api/video/generate?tenderId=${tenderId}&style=${style}`,
      duration: slides.length * 10, // 10 seconds per slide
      style,
    });
  } catch (error) {
    console.error("Error generating video overview:", error);
    return NextResponse.json(
      { error: "Failed to generate video overview" },
      { status: 500 }
    );
  }
}

function generateVideoSlides(tender: any, style: string): Array<{
  id: number;
  title: string;
  content: string;
  visualType: string;
  duration: number;
}> {
  const slides = [
    {
      id: 1,
      title: "Tender Overview",
      content: `${tender.title}\n\nValue: $${tender.value?.toLocaleString() || 'TBD'}\nStatus: ${tender.status}\nDeadline: ${tender.deadline || 'TBD'}`,
      visualType: "title",
      duration: 8,
    },
    {
      id: 2,
      title: "Key Requirements",
      content: tender.insights?.filter((i: any) => i.type === 'requirement').slice(0, 5).map((i: any) => `• ${i.content}`).join('\n') || "Requirements analysis in progress...",
      visualType: "bullet-points",
      duration: 12,
    },
    {
      id: 3,
      title: "Compliance Standards",
      content: tender.insights?.filter((i: any) => i.type === 'compliance').slice(0, 4).map((i: any) => `• ${i.content}`).join('\n') || "Compliance review ongoing...",
      visualType: "checklist",
      duration: 10,
    },
    {
      id: 4,
      title: "Risk Assessment",
      content: tender.insights?.filter((i: any) => i.type === 'risk').slice(0, 4).map((i: any) => `• ${i.content}`).join('\n') || "Risk analysis in progress...",
      visualType: "warning",
      duration: 10,
    },
    {
      id: 5,
      title: "Project Timeline",
      content: tender.stages?.map((s: any) => `• ${s.name}: ${s.dueDate || 'TBD'}`).join('\n') || "Timeline being developed...",
      visualType: "timeline",
      duration: 8,
    },
    {
      id: 6,
      title: "Next Steps",
      content: "• Review all requirements\n• Address compliance gaps\n• Mitigate identified risks\n• Prepare final submission\n• Monitor tender status",
      visualType: "action-items",
      duration: 8,
    },
  ];

  return slides;
}
