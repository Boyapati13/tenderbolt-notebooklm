import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

class AIService {
  private geminiClient: GoogleGenerativeAI | null = null;
  private aiProvider: "gemini" | "mock" = "mock";

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check for Google Gemini API key
    if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.startsWith("AIza")) {
      this.geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      this.aiProvider = "gemini";
      console.log("✅ AI Service initialized with Google Gemini");
    } else {
      console.log("ℹ️ AI Service running in mock mode (no valid GOOGLE_API_KEY found in .env.local)");
    }
  }

  private cleanAIResponse(text: string): string {
    // Remove markdown formatting
    let cleaned = text
      .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
      .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
      .replace(/`(.*?)`/g, '$1')       // Remove code `text`
      .replace(/#{1,6}\s*/g, '')      // Remove headers # ## ###
      .replace(/^\s*[-*+]\s*/gm, '• ') // Convert list items to bullet points
      .replace(/^\s*\d+\.\s*/gm, '')  // Remove numbered list formatting
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links, keep text
      .replace(/\n{3,}/g, '\n\n')     // Limit to max 2 consecutive newlines
      .trim();
    
    return cleaned;
  }

  private async callAI(prompt: string, systemPrompt?: string): Promise<string> {
    // Try Google Gemini
    if (this.aiProvider === "gemini" && this.geminiClient) {
      // Try multiple model names in order of preference
      const modelNames = [
        "gemini-1.5-flash",
        "gemini-pro",
      ];
      
      for (const modelName of modelNames) {
        try {
          const model = this.geminiClient.getGenerativeModel({ model: modelName });
          
          const fullPrompt = systemPrompt 
            ? `${systemPrompt}\n\n${prompt}` 
            : prompt;
          
          const result = await model.generateContent(fullPrompt);
          const response = await result.response;
          const text = response.text();
          
          if (text && text.length > 10) {
            console.log(`✅ Successfully using ${modelName}`);
            return this.cleanAIResponse(text);
          }
        } catch (error: any) {
          console.log(`⚠️  Model ${modelName} not available, trying next...`);
          continue;
        }
      }
      
      console.error("❌ All Gemini models failed. Using mock response.");
      return this.getMockResponse(prompt);
    }
    
    // Fallback to mock mode
    return this.getMockResponse(prompt);
  }

  private getMockResponse(prompt: string): string {
    const genericMessage = "Configure your GOOGLE_API_KEY in .env.local for enhanced AI capabilities.";

    if (prompt.toLowerCase().includes("requirement")) {
      return `Based on document analysis, key requirements include technical specifications and compliance standards. ${genericMessage}`;
    }
    if (prompt.toLowerCase().includes("risk")) {
      return `Identified risks include timeline constraints and compliance challenges. ${genericMessage}`;
    }
    if (prompt.toLowerCase().includes("summary")) {
      return `Document summary: This document outlines project requirements and specifications. ${genericMessage}`;
    }
    return `AI analysis completed. ${genericMessage}`;
  }

  // Chat functionality
  async chatWithDocuments(messages: Array<{role: string, content: string}>, tenderId?: string): Promise<{reply: string, citations: Array<{docId: string, filename: string}>}> {
    const lastMessage = messages[messages.length - 1]?.content || "";
    
    // Retrieve relevant documents
    const documents = await this.retrieveRelevantDocuments(lastMessage, tenderId);
    
    const validDocs = documents.filter(doc => 
      doc.text && 
      doc.text.length > 100 && 
      !doc.text.includes("[PDF uploaded successfully") &&
      !doc.text.includes("[PDF parsing failed")
    );
    
    if (validDocs.length === 0) {
      if (documents.length > 0) {
        const pdfDocs = documents.filter(doc => doc.filename.toLowerCase().endsWith('.pdf'));
        if (pdfDocs.length > 0) {
          const systemPrompt = `You are a tender intelligence assistant. The user has uploaded PDF files but text extraction is not available. Provide helpful guidance.`;
          const userPrompt = `The user asks: "${lastMessage}"\n\nThey have uploaded these PDFs:\n${pdfDocs.map(d => `- ${d.filename}`).join('\n')}\n\nProvide a helpful response explaining that for PDF analysis, they should:\n1. Convert the PDF to text/DOCX format, or\n2. Copy and paste relevant text sections, or\n3. Describe the content they want analyzed.`;
          
          const reply = await this.callAI(userPrompt, systemPrompt);
          return {
            reply,
            citations: pdfDocs.map(doc => ({ docId: doc.docId, filename: doc.filename }))
          };
        }
      }
      
      const reply = await this.callAI(lastMessage, `You are a tender intelligence assistant. Help with general tender and procurement questions.`);
      return { reply, citations: [] };
    }
    
    const context = validDocs.map((doc, i) => `Source ${i + 1} (${doc.filename}):\n${doc.text}`).join("\n\n");
    
    const systemPrompt = `You are a tender intelligence assistant. Answer questions based on the provided sources and cite them using [n] format. Be concise and accurate.`;
    const userPrompt = `Question: ${lastMessage}\n\nSources:\n${context}`;
    
    const reply = await this.callAI(userPrompt, systemPrompt);
    
    return {
      reply,
      citations: validDocs.map(doc => ({ docId: doc.docId, filename: doc.filename }))
    };
  }

  // Document analysis
  async analyzeDocument(text: string, filename: string): Promise<{
    requirements: string[];
    compliance: string[];
    risks: string[];
    deadlines: string[];
    summary: string;
  }> {
    const analysisPrompt = `Analyze this tender document and extract:
1. Technical requirements (must-have features, specifications)
2. Compliance requirements (standards, certifications, regulations)
3. Risks and challenges (potential issues, penalties, constraints)
4. Deadlines and timelines (submission dates, milestones)
5. Executive summary (key points, value proposition)

Document: ${text.substring(0, 3000)}...`;

    const response = await this.callAI(analysisPrompt);
    
    return this.parseAnalysisResponse(response, text);
  }

  private parseAnalysisResponse(response: string, originalText: string) {
    const requirements = this.extractPatterns(originalText, [
      /(?:must|shall|required|requirement|specification|criteria|mandatory|obligatory)\s+[^.!?]*(?:[.!?]|$)/gi,
      /(?:should|need|expect|demand)\s+[^.!?]*(?:[.!?]|$)/gi
    ]);

    const compliance = this.extractPatterns(originalText, [
      /(?:compliance|certification|standard|iso|ansi|astm|fda|ce|ul|rohs|gdpr|sox)\s+[^.!?]*(?:[.!?]|$)/gi
    ]);

    const risks = this.extractPatterns(originalText, [
      /(?:risk|hazard|warning|caution|danger|liability|penalty|fine|consequence)\s+[^.!?]*(?:[.!?]|$)/gi
    ]);

    const deadlines = this.extractPatterns(originalText, [
      /(?:due|deadline|submission|closing|expires?|by)\s+(?:date\s+)?(?:is\s+)?(?:on\s+)?(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2}|(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4})/gi
    ]);

    const summary = response.includes("Configure your GOOGLE_API_KEY") 
      ? "Document analysis completed. Key requirements, compliance standards, risks, and deadlines have been identified."
      : response;

    return {
      requirements: requirements.slice(0, 5),
      compliance: compliance.slice(0, 3),
      risks: risks.slice(0, 3),
      deadlines: deadlines.slice(0, 3),
      summary: summary.substring(0, 200) + "..."
    };
  }

  private extractPatterns(text: string, patterns: RegExp[]): string[] {
    const results: string[] = [];
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        results.push(...matches.map(match => match.trim()));
      }
    });
    return [...new Set(results)]; // Remove duplicates
  }

  // Win probability calculation
  async calculateWinProbability(tenderData: any): Promise<number> {
    const analysisPrompt = `Analyze this tender opportunity and calculate win probability (0-100%):

Title: ${tenderData.title}
Value: $${tenderData.value}
Status: ${tenderData.status}
Technical Score: ${tenderData.technicalScore || 0}/100
Commercial Score: ${tenderData.commercialScore || 0}/100
Compliance Score: ${tenderData.complianceScore || 0}/100
Risk Score: ${tenderData.riskScore || 0}/100

Consider factors like:
- Technical fit and capability
- Commercial competitiveness
- Compliance requirements
- Risk factors
- Market conditions
- Competition level

Provide only a number between 0-100 representing the win probability.`;

    const response = await this.callAI(analysisPrompt);
    const probability = parseInt(response.match(/\d+/)?.[0] || "50");
    return Math.min(Math.max(probability, 0), 100);
  }

  private async retrieveRelevantDocuments(query: string, tenderId?: string): Promise<Array<{docId: string, filename: string, text: string}>> {
    try {
      // If no tenderId is provided, there are no documents to fetch.
      if (!tenderId) {
        return [];
      }

      // Fetch documents specific to the current tender AND all global documents.
      // Global documents (Supporting, Company) are stored with tenderId 'global_documents'.
      const documents = await prisma.document.findMany({
        where: {
          OR: [
            { tenderId: tenderId },
            { tenderId: 'global_documents' },
          ]
        },
        take: 50, // Increased limit for more comprehensive context
        orderBy: { createdAt: 'desc' }
      });

      console.log(`[AI Service] Retrieved ${documents.length} documents for tender ${tenderId} and global context.`);

      return documents.map(doc => ({
        docId: doc.id,
        filename: doc.filename,
        text: doc.text || "No text content available"
      }));
    } catch (error) {
      console.error("Error retrieving documents:", error);
      return [];
    }
  }
}

export const aiService = new AIService();
