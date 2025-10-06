import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { type, tenderId } = await req.json();
    
    if (!type || !tenderId) {
      return NextResponse.json(
        { error: "Missing required fields" },
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

    let reportContent = "";

    switch (type) {
      case "briefing":
        reportContent = generateBriefingReport(tender);
        break;
      case "study-guide":
        reportContent = generateStudyGuide(tender);
        break;
      case "blog-post":
        reportContent = generateBlogPost(tender);
        break;
      default:
        reportContent = generateCustomReport(tender, type);
    }

    return NextResponse.json({
      success: true,
      content: reportContent,
      filename: `${tender.title.replace(/[^a-zA-Z0-9]/g, '_')}_${type}_report.txt`,
    });
  } catch (error) {
    console.error("Error generating report:", error);
    return NextResponse.json(
      { error: "Failed to generate report" },
      { status: 500 }
    );
  }
}

function generateBriefingReport(tender: any): string {
  return `# Tender Briefing Report: ${tender.title}

## Executive Summary
- **Tender Value**: $${tender.value?.toLocaleString() || 'TBD'}
- **Status**: ${tender.status}
- **Submission Deadline**: ${tender.deadline || 'TBD'}
- **Win Probability**: ${tender.winProbability || 'TBD'}%

## Key Requirements
${tender.insights?.filter((i: any) => i.type === 'requirement').map((i: any) => `- ${i.content}`).join('\n') || 'No requirements extracted yet.'}

## Compliance Standards
${tender.insights?.filter((i: any) => i.type === 'compliance').map((i: any) => `- ${i.content}`).join('\n') || 'No compliance items identified yet.'}

## Risk Assessment
${tender.insights?.filter((i: any) => i.type === 'risk').map((i: any) => `- ${i.content}`).join('\n') || 'No risks identified yet.'}

## Timeline & Milestones
${tender.stages?.map((stage: any) => `- **${stage.name}**: ${stage.dueDate || 'TBD'} (${stage.status})`).join('\n') || 'No stages defined yet.'}

## Documents
${tender.documents?.map((doc: any) => `- ${doc.filename}`).join('\n') || 'No documents uploaded yet.'}

---
*Report generated on ${new Date().toLocaleDateString()}*
`;
}

function generateStudyGuide(tender: any): string {
  return `# Study Guide: ${tender.title}

## Key Concepts & Terms
${tender.insights?.filter((i: any) => i.type === 'requirement').map((i: any) => `- **${i.content}**`).join('\n') || 'No key concepts identified yet.'}

## Quiz Questions

### Short Answer Questions
1. What are the main technical requirements for this tender?
2. What compliance standards must be met?
3. What are the key risks associated with this project?

### Multiple Choice Questions
1. What is the estimated tender value?
   a) $${tender.value?.toLocaleString() || 'TBD'}
   b) Not specified
   c) Confidential

2. What is the current tender status?
   a) ${tender.status}
   b) Completed
   c) Cancelled

## Essay Questions
1. Analyze the competitive landscape for this tender opportunity.
2. Discuss the risk mitigation strategies for this project.
3. Evaluate the technical feasibility of the requirements.

## Glossary
- **Tender**: A formal offer to supply goods or services
- **Compliance**: Adherence to laws, regulations, and standards
- **ROI**: Return on Investment
- **Win Rate**: Percentage of successful tender submissions

---
*Study guide generated on ${new Date().toLocaleDateString()}*
`;
}

function generateBlogPost(tender: any): string {
  return `# ${tender.title}: A Comprehensive Analysis

## Introduction
In today's competitive business landscape, understanding tender opportunities is crucial for organizational growth. This analysis examines the ${tender.title} tender, providing insights into requirements, compliance standards, and strategic considerations.

## Key Insights

### Technical Requirements
${tender.insights?.filter((i: any) => i.type === 'requirement').map((i: any) => `- ${i.content}`).join('\n') || 'Technical requirements are being analyzed.'}

### Compliance Landscape
${tender.insights?.filter((i: any) => i.type === 'compliance').map((i: any) => `- ${i.content}`).join('\n') || 'Compliance requirements are under review.'}

### Risk Considerations
${tender.insights?.filter((i: any) => i.type === 'risk').map((i: any) => `- ${i.content}`).join('\n') || 'Risk assessment is in progress.'}

## Strategic Recommendations

1. **Focus on Core Requirements**: Prioritize understanding and meeting the fundamental technical requirements.
2. **Compliance First**: Ensure all compliance standards are met before submission.
3. **Risk Mitigation**: Develop comprehensive risk mitigation strategies.
4. **Timeline Management**: Maintain strict adherence to submission deadlines.

## Conclusion
The ${tender.title} tender presents both opportunities and challenges. Success requires careful analysis, strategic planning, and meticulous execution. Organizations should leverage AI-powered tools like TenderBolt AI to streamline the analysis process and improve win rates.

---
*Analysis generated on ${new Date().toLocaleDateString()} using TenderBolt AI*
`;
}

function generateCustomReport(tender: any, type: string): string {
  return `# Custom Report: ${tender.title}

## Report Type: ${type}

## Tender Overview
- **Title**: ${tender.title}
- **Value**: $${tender.value?.toLocaleString() || 'TBD'}
- **Status**: ${tender.status}
- **Deadline**: ${tender.deadline || 'TBD'}

## Analysis Results
${tender.insights?.map((i: any) => `### ${i.type.charAt(0).toUpperCase() + i.type.slice(1)}\n${i.content}`).join('\n\n') || 'No insights available yet.'}

## Next Steps
1. Review all extracted insights
2. Address any compliance gaps
3. Prepare final submission
4. Monitor tender status

---
*Custom report generated on ${new Date().toLocaleDateString()}*
`;
}
