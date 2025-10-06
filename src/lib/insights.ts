import { prisma } from "@/lib/prisma";

export type InsightType = "requirement" | "compliance" | "risk" | "deadline";

export type ExtractedInsight = {
  type: InsightType;
  content: string;
  citation?: string;
  docId: string;
  filename: string;
};

// Simple regex-based extraction for now
export function extractInsightsFromText(text: string, docId: string, filename: string): ExtractedInsight[] {
  const insights: ExtractedInsight[] = [];
  
  // Extract deadlines (dates)
  const dateRegex = /(?:due|deadline|submission|closing|expires?|by)\s+(?:date\s+)?(?:is\s+)?(?:on\s+)?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/gi;
  const dates = text.match(dateRegex);
  if (dates) {
    dates.forEach(date => {
      insights.push({
        type: "deadline",
        content: `Deadline identified: ${date}`,
        citation: `Found in ${filename}`,
        docId,
        filename
      });
    });
  }

  // Extract requirements (must, shall, required, etc.)
  const requirementRegex = /(?:must|shall|required|requirement|specification|criteria|mandatory|obligatory)\s+[^.!?]*(?:[.!?]|$)/gi;
  const requirements = text.match(requirementRegex);
  if (requirements) {
    requirements.slice(0, 5).forEach(req => {
      insights.push({
        type: "requirement",
        content: req.trim(),
        citation: `Found in ${filename}`,
        docId,
        filename
      });
    });
  }

  // Extract compliance items (compliance, certification, standards)
  const complianceRegex = /(?:compliance|certification|standard|iso|ansi|astm|fda|ce|ul|rohs)\s+[^.!?]*(?:[.!?]|$)/gi;
  const compliance = text.match(complianceRegex);
  if (compliance) {
    compliance.slice(0, 3).forEach(comp => {
      insights.push({
        type: "compliance",
        content: comp.trim(),
        citation: `Found in ${filename}`,
        docId,
        filename
      });
    });
  }

  // Extract risks (risk, hazard, warning, caution)
  const riskRegex = /(?:risk|hazard|warning|caution|danger|liability|penalty|fine)\s+[^.!?]*(?:[.!?]|$)/gi;
  const risks = text.match(riskRegex);
  if (risks) {
    risks.slice(0, 3).forEach(risk => {
      insights.push({
        type: "risk",
        content: risk.trim(),
        citation: `Found in ${filename}`,
        docId,
        filename
      });
    });
  }

  return insights;
}

export async function saveInsightsToDatabase(insights: ExtractedInsight[], tenderId: string) {
  for (const insight of insights) {
    await prisma.insight.create({
      data: {
        type: insight.type,
        content: insight.content,
        citation: insight.citation,
        tenderId,
      },
    });
  }
}

export async function getInsightsForTender(tenderId: string) {
  return await prisma.insight.findMany({
    where: { tenderId },
    orderBy: { createdAt: "desc" },
  });
}
