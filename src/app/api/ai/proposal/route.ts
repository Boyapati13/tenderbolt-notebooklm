import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiService } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const { tenderId, comparisonData, proposalType = "comprehensive" } = await req.json();

    if (!tenderId || !comparisonData) {
      return NextResponse.json(
        { error: "Tender ID and comparison data are required" },
        { status: 400 }
      );
    }

    // Fetch tender details
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: {
        documents: {
          where: { category: 'tender' },
          select: {
            id: true,
            filename: true,
            text: true,
            summary: true,
            documentType: true
          }
        }
      }
    });

    if (!tender) {
      return NextResponse.json(
        { error: "Tender not found" },
        { status: 404 }
      );
    }

    // Generate comprehensive proposal based on comparison analysis
    const proposal = await generateProposalDraft(
      tender,
      comparisonData,
      proposalType
    );

    return NextResponse.json({
      success: true,
      proposal: proposal
    });

  } catch (error) {
    console.error("Proposal generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate proposal", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function generateProposalDraft(
  tender: any,
  comparisonData: any,
  proposalType: string
) {
  const tenderRequirements = tender.documents
    .map(doc => `\n--- ${doc.filename} (${doc.documentType}) ---\n${doc.text}`)
    .join('\n');

  const prompt = `You are an expert proposal writer. Based on the tender requirements and comparison analysis, generate a comprehensive proposal draft that addresses all gaps and leverages identified strengths.

TENDER INFORMATION:
Title: ${tender.title}
Client: ${tender.client || 'Not specified'}
Value: ${tender.autoExtractedBudget || tender.value ? `$${tender.value?.toLocaleString()}` : 'TBD'}
Deadline: ${tender.autoExtractedDeadlines || (tender.deadline ? new Date(tender.deadline).toLocaleDateString() : 'TBD')}

TENDER REQUIREMENTS:
${tenderRequirements.substring(0, 15000)}

COMPARISON ANALYSIS:
Match Percentage: ${comparisonData.matchPercentage}%
Overall Assessment: ${comparisonData.overallAssessment}

Strengths:
${comparisonData.strengths.map((s: string) => `- ${s}`).join('\n')}

Gaps Identified:
${comparisonData.gaps.map((g: string) => `- ${g}`).join('\n')}

Priority Actions:
${comparisonData.priorityActions.map((a: string) => `- ${a}`).join('\n')}

Recommendations:
${comparisonData.recommendations.map((r: string) => `- ${r}`).join('\n')}

Compliance Analysis:
${Object.entries(comparisonData.complianceAnalysis).map(([key, value]: [string, any]) => 
  `${key}: ${value.match}% match - ${value.status} - ${value.details}`
).join('\n')}

Please generate a comprehensive proposal draft that:

1. **Executive Summary** - Brief overview highlighting key strengths and value proposition
2. **Technical Approach** - Detailed technical solution addressing all requirements
3. **Project Management** - Timeline, milestones, and project structure
4. **Team Qualifications** - Key personnel and their relevant experience
5. **Risk Management** - Identification and mitigation strategies
6. **Quality Assurance** - Quality control measures and standards
7. **Cost Breakdown** - Detailed pricing structure
8. **Implementation Plan** - Step-by-step implementation approach
9. **Support & Maintenance** - Post-delivery support strategy
10. **Appendices** - Supporting documents and references

Guidelines:
- Address ALL identified gaps from the comparison analysis
- Leverage identified strengths prominently
- Include specific details and metrics where possible
- Use professional, persuasive language
- Structure the proposal logically and clearly
- Include relevant technical specifications
- Address compliance requirements thoroughly
- Provide realistic timelines and deliverables
- Include competitive advantages and differentiators

Generate a complete, professional proposal that maximizes the match percentage and addresses all tender requirements.`;

  try {
    const result = await aiService.chatWithDocuments([
      { role: "user", content: prompt }
    ]);

    let proposalText = result.reply.trim();
    
    // Clean up the proposal text
    proposalText = proposalText
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic formatting
      .replace(/`(.*?)`/g, '$1')       // Remove code formatting
      .replace(/#{1,6}\s*/g, '')      // Remove headers
      .replace(/^\s*[-*+]\s*/gm, '• ') // Convert list items to bullet points
      .replace(/^\s*\d+\.\s*/gm, '')  // Remove numbered list formatting
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
      .replace(/\n{3,}/g, '\n\n')     // Limit consecutive newlines
      .trim();

    return proposalText;

  } catch (error) {
    console.error("AI proposal generation error:", error);
    
    // Fallback proposal template
    return `PROPOSAL DRAFT

Executive Summary:
This proposal addresses the requirements for ${tender.title}. Our solution leverages our expertise in [relevant areas] to deliver exceptional value and meet all specified requirements.

Technical Approach:
[Technical solution details will be generated based on tender requirements]

Project Management:
[Project timeline and management structure]

Team Qualifications:
[Key personnel and their experience]

Risk Management:
[Risk identification and mitigation strategies]

Quality Assurance:
[Quality control measures]

Cost Breakdown:
[Detailed pricing structure]

Implementation Plan:
[Step-by-step implementation approach]

Support & Maintenance:
[Post-delivery support strategy]

Note: This is a template generated due to an error. Please try regenerating the proposal.`;
  }
}
