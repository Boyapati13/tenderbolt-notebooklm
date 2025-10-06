import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { tenderId, style = "brief" } = await req.json();
    
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

    // Generate audio script based on style
    const script = generateAudioScript(tender, style);
    
    // In a real implementation, you would use a TTS service like:
    // - OpenAI TTS
    // - Google Cloud Text-to-Speech
    // - Amazon Polly
    // - Azure Cognitive Services
    
    // For now, return the script and a placeholder audio URL
    return NextResponse.json({
      success: true,
      script,
      audioUrl: `/api/audio/generate?text=${encodeURIComponent(script)}&style=${style}`,
      duration: estimateDuration(script),
      style,
    });
  } catch (error) {
    console.error("Error generating audio overview:", error);
    return NextResponse.json(
      { error: "Failed to generate audio overview" },
      { status: 500 }
    );
  }
}

function generateAudioScript(tender: any, style: string): string {
  const baseScript = `Welcome to the audio overview for ${tender.title}. `;
  
  switch (style) {
    case "brief":
      return generateBriefScript(tender, baseScript);
    case "deep-dive":
      return generateDeepDiveScript(tender, baseScript);
    case "critique":
      return generateCritiqueScript(tender, baseScript);
    case "podcast":
      return generatePodcastScript(tender, baseScript);
    default:
      return generateBriefScript(tender, baseScript);
  }
}

function generateBriefScript(tender: any, base: string): string {
  return `${base}This is a brief overview of the key points.

The tender has a value of ${tender.value ? `$${tender.value.toLocaleString()}` : 'undisclosed amount'} and is currently in ${tender.status} status.

Key requirements include: ${tender.insights?.filter((i: any) => i.type === 'requirement').slice(0, 3).map((i: any) => i.content).join(', ') || 'requirements are being analyzed'}.

Important compliance standards to note: ${tender.insights?.filter((i: any) => i.type === 'compliance').slice(0, 2).map((i: any) => i.content).join(', ') || 'compliance requirements are under review'}.

The submission deadline is ${tender.deadline || 'to be determined'}. Thank you for listening to this brief overview.`;
}

function generateDeepDiveScript(tender: any, base: string): string {
  return `${base}This is a comprehensive deep dive analysis.

Let's start with the tender overview. ${tender.title} represents a significant opportunity with a value of ${tender.value ? `$${tender.value.toLocaleString()}` : 'undisclosed amount'}. The current status is ${tender.status}.

Moving to technical requirements, we have identified several key areas: ${tender.insights?.filter((i: any) => i.type === 'requirement').map((i: any) => i.content).join('. ') || 'Technical requirements are being analyzed'}.

From a compliance perspective, the following standards must be met: ${tender.insights?.filter((i: any) => i.type === 'compliance').map((i: any) => i.content).join('. ') || 'Compliance requirements are under review'}.

Risk assessment reveals: ${tender.insights?.filter((i: any) => i.type === 'risk').map((i: any) => i.content).join('. ') || 'Risk assessment is in progress'}.

The project timeline includes these key stages: ${tender.stages?.map((s: any) => s.name).join(', ') || 'Timeline is being developed'}.

This concludes our deep dive analysis.`;
}

function generateCritiqueScript(tender: any, base: string): string {
  return `${base}This is a critical analysis of the tender opportunity.

Let's examine the strengths and weaknesses of this opportunity. The tender value of ${tender.value ? `$${tender.value.toLocaleString()}` : 'undisclosed amount'} suggests ${tender.value && tender.value > 1000000 ? 'a high-value opportunity' : 'a moderate opportunity'}.

Critical requirements analysis: ${tender.insights?.filter((i: any) => i.type === 'requirement').map((i: any) => i.content).join('. ') || 'Requirements need further analysis'}.

Compliance challenges include: ${tender.insights?.filter((i: any) => i.type === 'compliance').map((i: any) => i.content).join('. ') || 'Compliance requirements are being evaluated'}.

Risk factors to consider: ${tender.insights?.filter((i: any) => i.type === 'risk').map((i: any) => i.content).join('. ') || 'Risk assessment is ongoing'}.

Recommendations: Focus on addressing compliance gaps, mitigate identified risks, and ensure technical requirements are fully understood before submission.`;
}

function generatePodcastScript(tender: any, base: string): string {
  return `${base}Welcome to the TenderBolt AI podcast. I'm your host, and today we're discussing ${tender.title}.

Let's dive into this fascinating tender opportunity. First, let me give you the numbers. We're looking at a tender worth ${tender.value ? `$${tender.value.toLocaleString()}` : 'an undisclosed amount'}, currently in ${tender.status} status.

Now, here's what makes this interesting. The technical requirements are quite comprehensive: ${tender.insights?.filter((i: any) => i.type === 'requirement').map((i: any) => i.content).join('. ') || 'Technical requirements are being analyzed'}.

But here's the kicker - the compliance landscape is equally complex: ${tender.insights?.filter((i: any) => i.type === 'compliance').map((i: any) => i.content).join('. ') || 'Compliance requirements are under review'}.

And let's not forget about the risks: ${tender.insights?.filter((i: any) => i.type === 'risk').map((i: any) => i.content).join('. ') || 'Risk assessment is in progress'}.

So what's our takeaway? This tender presents both significant opportunities and challenges. Organizations need to carefully weigh the requirements against their capabilities and ensure they have robust risk mitigation strategies in place.

That's all for today's episode. Thanks for listening to TenderBolt AI podcast.`;
}

function estimateDuration(script: string): number {
  // Rough estimate: average speaking rate is ~150 words per minute
  const words = script.split(' ').length;
  return Math.ceil(words / 150 * 60); // Duration in seconds
}
