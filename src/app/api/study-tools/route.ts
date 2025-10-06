import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { aiService } from "@/lib/ai-service";

export async function POST(req: Request) {
  try {
    const { tenderId } = await req.json();
    const actualTenderId = tenderId || "tender_default";

    // Fetch tender and documents
    const tender = await prisma.tender.findUnique({
      where: { id: actualTenderId },
      include: {
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

    // Generate study tools using AI
    const studyTools = await aiService.generateStudyTools(tender);

    return NextResponse.json(studyTools);
  } catch (error) {
    console.error("Error generating study tools:", error);
    return NextResponse.json(
      { error: "Failed to generate study tools" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "flashcards";
  const tenderId = searchParams.get("tenderId") || "tender_default";

  if (type === "flashcards") {
    // Generate flashcards from insights
    const insights = await prisma.insight.findMany({
      where: { tenderId },
      take: 10,
    });

    const flashcards = insights.map((insight, index) => ({
      id: `card-${index}`,
      question: `What is the ${insight.type} requirement?`,
      answer: insight.content,
      category: insight.type,
      source: insight.citation,
    }));

    return NextResponse.json({ flashcards });
  }

  if (type === "quiz") {
    // Generate quiz questions from insights
    const insights = await prisma.insight.findMany({
      where: { tenderId },
      take: 5,
    });

    const questions = insights.map((insight, index) => ({
      id: `quiz-${index}`,
      question: `Which category does this requirement belong to: "${insight.content.substring(0, 50)}..."?`,
      options: ["requirement", "compliance", "risk", "deadline"],
      correct: insight.type,
      explanation: `This is a ${insight.type} requirement from ${insight.citation}`,
    }));

    return NextResponse.json({ questions });
  }

  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}
