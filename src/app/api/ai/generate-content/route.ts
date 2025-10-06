import { NextRequest, NextResponse } from "next/server";
import { aiService } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const { prompt, context } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Enhanced prompt for research-standard content generation
    const enhancedPrompt = `
You are an expert proposal writer specializing in research-standard documentation. 
Generate high-quality content that meets academic and professional standards.

Context:
- Tender Title: ${context?.tenderTitle || 'N/A'}
- Section Type: ${context?.sectionType || 'text'}
- Comparison Data Available: ${context?.comparisonData ? 'Yes' : 'No'}

User Request: ${prompt}

Requirements:
1. Use formal, professional language appropriate for research proposals
2. Include relevant citations and references where applicable
3. Ensure content is evidence-based and well-structured
4. Follow academic writing standards (APA/MLA format)
5. Include specific metrics, data points, and technical details
6. Maintain consistency with research methodology standards
7. Use proper headings, subheadings, and formatting
8. Include risk assessment and mitigation strategies
9. Provide clear deliverables and timelines
10. Ensure compliance with industry standards

Generate comprehensive, research-standard content that would be suitable for:
- Academic research proposals
- Technical documentation
- Industry compliance reports
- Government tender responses
- Professional research submissions

Format the response as structured content that can be directly used in a proposal document.
`;

    const content = await aiService.callAI(enhancedPrompt);

    return NextResponse.json({ content });
  } catch (error) {
    console.error("AI content generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
