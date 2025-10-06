import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiService } from "@/lib/ai-service";

export async function POST(req: NextRequest) {
  try {
    const { tenderId, proposalDocumentId, comparisonType = "comprehensive" } = await req.json();

    if (!tenderId || !proposalDocumentId) {
      return NextResponse.json(
        { error: "Tender ID and proposal document ID are required" },
        { status: 400 }
      );
    }

    // Fetch tender documents (original requirements)
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

    // Fetch proposal document
    const proposalDoc = await prisma.document.findUnique({
      where: { id: proposalDocumentId },
      select: {
        id: true,
        filename: true,
        text: true,
        summary: true,
        documentType: true,
        category: true
      }
    });

    if (!proposalDoc) {
      return NextResponse.json(
        { error: "Proposal document not found" },
        { status: 404 }
      );
    }

    // Prepare tender requirements text
    const tenderRequirements = tender.documents
      .map(doc => `\n--- ${doc.filename} (${doc.documentType}) ---\n${doc.text}`)
      .join('\n');

    // Prepare proposal content
    const proposalContent = `\n--- ${proposalDoc.filename} (${proposalDoc.documentType}) ---\n${proposalDoc.text}`;

    // Generate comprehensive comparison analysis
    const comparisonResult = await generateDocumentComparison(
      tenderRequirements,
      proposalContent,
      tender.title,
      proposalDoc.filename,
      comparisonType
    );

    // Store comparison result in database
    const comparisonRecord = await prisma.insight.create({
      data: {
        tenderId,
        content: JSON.stringify(comparisonResult),
        type: 'document_comparison',
        citation: `Comparison of ${proposalDoc.filename} against tender requirements`
      }
    });

    return NextResponse.json({
      success: true,
      comparison: comparisonResult,
      comparisonId: comparisonRecord.id
    });

  } catch (error) {
    console.error("Document comparison error:", error);
    return NextResponse.json(
      { error: "Failed to compare documents", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

async function generateDocumentComparison(
  tenderRequirements: string,
  proposalContent: string,
  tenderTitle: string,
  proposalFilename: string,
  comparisonType: string
) {
  const prompt = `You are an expert tender analyst. Compare the company's proposal against the original tender requirements and provide a comprehensive analysis.

TENDER REQUIREMENTS:
${tenderRequirements.substring(0, 15000)}

COMPANY PROPOSAL:
${proposalContent.substring(0, 15000)}

Please analyze and provide a detailed comparison in the following JSON format:

{
  "matchPercentage": 85,
  "overallAssessment": "Good alignment with minor gaps",
  "strengths": [
    "Strong technical approach matches requirements",
    "Experienced team with relevant qualifications",
    "Competitive pricing structure"
  ],
  "gaps": [
    "Missing specific certification mentioned in requirements",
    "Timeline doesn't fully address all project phases",
    "Limited experience in one specific technology area"
  ],
  "complianceAnalysis": {
    "technicalRequirements": {
      "match": 90,
      "status": "Good",
      "details": "Most technical requirements addressed"
    },
    "qualifications": {
      "match": 75,
      "status": "Partial",
      "details": "Some team qualifications missing"
    },
    "timeline": {
      "match": 80,
      "status": "Good",
      "details": "Main timeline met, some phases unclear"
    },
    "budget": {
      "match": 95,
      "status": "Excellent",
      "details": "Budget aligns well with requirements"
    },
    "deliverables": {
      "match": 85,
      "status": "Good",
      "details": "Most deliverables clearly defined"
    }
  },
  "riskAreas": [
    "Certification gap could lead to disqualification",
    "Unclear timeline for Phase 2 implementation",
    "Limited backup resources mentioned"
  ],
  "recommendations": [
    "Obtain missing certification before submission",
    "Clarify timeline for all project phases",
    "Add more detail about backup resources and contingency plans",
    "Highlight relevant experience in the missing technology area"
  ],
  "priorityActions": [
    "High: Obtain missing certification",
    "Medium: Clarify project timeline",
    "Low: Add backup resource details"
  ],
  "competitiveAdvantages": [
    "Strong technical expertise in core areas",
    "Competitive pricing",
    "Proven track record in similar projects"
  ],
  "detailedComparison": {
    "requirementsCoverage": "85% of requirements directly addressed",
    "qualityOfResponse": "High quality responses to most requirements",
    "innovationLevel": "Moderate innovation in proposed solutions",
    "riskMitigation": "Good risk identification, could improve mitigation strategies"
  }
}

Focus on:
1. Accurate match percentage calculation
2. Specific, actionable recommendations
3. Clear identification of gaps and risks
4. Practical next steps for improvement
5. Honest assessment of strengths and weaknesses

Return ONLY valid JSON, no markdown formatting.`;

  try {
    const result = await aiService.chatWithDocuments([
      { role: "user", content: prompt }
    ]);

    let jsonText = result.reply.trim();
    
    // Clean up JSON response
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const comparison = JSON.parse(jsonText);
    
    // Validate and ensure all required fields exist
    return {
      matchPercentage: comparison.matchPercentage || 0,
      overallAssessment: comparison.overallAssessment || "Analysis completed",
      strengths: comparison.strengths || [],
      gaps: comparison.gaps || [],
      complianceAnalysis: comparison.complianceAnalysis || {},
      riskAreas: comparison.riskAreas || [],
      recommendations: comparison.recommendations || [],
      priorityActions: comparison.priorityActions || [],
      competitiveAdvantages: comparison.competitiveAdvantages || [],
      detailedComparison: comparison.detailedComparison || {},
      timestamp: new Date().toISOString(),
      tenderTitle,
      proposalFilename
    };

  } catch (error) {
    console.error("AI comparison generation error:", error);
    
    // Fallback analysis if AI fails
    return {
      matchPercentage: 0,
      overallAssessment: "Analysis failed - please try again",
      strengths: [],
      gaps: ["Unable to analyze documents"],
      complianceAnalysis: {},
      riskAreas: ["Analysis error"],
      recommendations: ["Please check document format and try again"],
      priorityActions: [],
      competitiveAdvantages: [],
      detailedComparison: {},
      timestamp: new Date().toISOString(),
      tenderTitle,
      proposalFilename,
      error: "AI analysis failed"
    };
  }
}

// GET endpoint to fetch comparison results
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const tenderId = searchParams.get("tenderId");
    const comparisonId = searchParams.get("comparisonId");

    if (comparisonId) {
      // Fetch specific comparison
      const comparison = await prisma.insight.findUnique({
        where: { id: comparisonId }
      });

      if (!comparison) {
        return NextResponse.json(
          { error: "Comparison not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        comparison: JSON.parse(comparison.content),
        metadata: comparison.metadata
      });
    }

    if (tenderId) {
      // Fetch all comparisons for a tender
      const comparisons = await prisma.insight.findMany({
        where: {
          tenderId,
          type: 'document_comparison'
        },
        orderBy: { createdAt: 'desc' }
      });

      const parsedComparisons = comparisons.map(comp => ({
        id: comp.id,
        comparison: JSON.parse(comp.content),
        metadata: comp.metadata,
        createdAt: comp.createdAt
      }));

      return NextResponse.json({ comparisons: parsedComparisons });
    }

    return NextResponse.json(
      { error: "Tender ID or comparison ID required" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error fetching comparisons:", error);
    return NextResponse.json(
      { error: "Failed to fetch comparisons" },
      { status: 500 }
    );
  }
}
