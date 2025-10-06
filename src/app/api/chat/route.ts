import { NextResponse } from "next/server";
import { aiService } from "@/lib/ai-service";

export async function POST(req: Request) {
  try {
    const { messages, tenderId } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    const result = await aiService.chatWithDocuments(messages, tenderId);
    
    return NextResponse.json({
      reply: result.reply,
      citations: result.citations
    });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat request" },
      { status: 500 }
    );
  }
}


