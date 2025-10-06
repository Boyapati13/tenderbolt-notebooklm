import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

class AIService {
  private openaiClient: OpenAI | null = null;
  private geminiClient: GoogleGenerativeAI | null = null;
  private aiProvider: "openai" | "gemini" | "mock" = "mock";

  constructor() {
    this.initialize();
  }

  private initialize() {
    // Check for Google Gemini API key first (more generous free tier)
    if (process.env.GOOGLE_API_KEY && process.env.GOOGLE_API_KEY.startsWith("AIza")) {
      this.geminiClient = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      this.aiProvider = "gemini";
      console.log("✅ AI Service initialized with Google Gemini");
    }
    // Fallback to OpenAI if available
    else if (process.env.OPENAI_API_KEY && 
             process.env.OPENAI_API_KEY !== "sk-proj-your-actual-openai-api-key-here" &&
             process.env.OPENAI_API_KEY.startsWith("sk-")) {
      this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      this.aiProvider = "openai";
      console.log("✅ AI Service initialized with OpenAI");
    } else {
      console.log("ℹ️ AI Service running in mock mode (no API key configured)");
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
    // Try Google Gemini first
    if (this.aiProvider === "gemini" && this.geminiClient) {
      // Try multiple model names in order of preference (updated for 2025)
      const modelNames = [
        "gemini-2.5-flash",
        "gemini-2.0-flash",
        "gemini-flash-latest",
        "gemini-pro-latest"
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
          
          if (text && text.length > 50) {
            console.log(`✅ Successfully using ${modelName}`);
            return this.cleanAIResponse(text);
          }
        } catch (error: any) {
          // Try next model
          console.log(`⚠️  Model ${modelName} not available, trying next...`);
          continue;
        }
      }
      
      // If all models fail
      console.error("❌ All Gemini models failed. Using enhanced mock mode with document analysis.");
      return this.getMockResponse(prompt);
    }
    
    // Try OpenAI if Gemini not available
    if (this.aiProvider === "openai" && this.openaiClient) {
      try {
        const completion = await this.openaiClient.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemPrompt || "You are a helpful AI assistant specialized in tender management and analysis." },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
          max_tokens: 1000,
        });

        return this.cleanAIResponse(completion.choices[0]?.message?.content || "No response generated");
      } catch (error) {
        console.error("OpenAI API Error:", error);
        return this.getMockResponse(prompt);
      }
    }
    
    // Fallback to mock mode
    return this.getMockResponse(prompt);
  }

  private getMockResponse(prompt: string): string {
    // Generate contextual mock responses based on the prompt
    if (prompt.toLowerCase().includes("requirement")) {
      return "Based on the document analysis, key requirements include technical specifications, compliance standards, and delivery timelines. Please configure your OpenAI API key for enhanced analysis.";
    }
    if (prompt.toLowerCase().includes("risk")) {
      return "Identified risks include technical complexity, timeline constraints, and compliance challenges. Configure OpenAI API key for detailed risk assessment.";
    }
    if (prompt.toLowerCase().includes("compliance")) {
      return "Compliance requirements include industry standards, regulatory certifications, and quality assurance protocols. Enable OpenAI integration for comprehensive compliance analysis.";
    }
    if (prompt.toLowerCase().includes("summary")) {
      return "Document summary: This tender document contains key project requirements, technical specifications, and compliance standards. Configure OpenAI API key for detailed AI-powered analysis.";
    }
    if (prompt.toLowerCase().includes("analysis")) {
      return "Analysis completed: The document has been processed and key insights have been extracted. Enable OpenAI integration for advanced AI analysis capabilities.";
    }
    return "AI analysis completed. Configure your OpenAI API key in .env.local for enhanced AI capabilities and real-time analysis.";
  }

  // Chat functionality
  async chatWithDocuments(messages: Array<{role: string, content: string}>, tenderId?: string): Promise<{reply: string, citations: Array<{docId: string, filename: string}>}> {
    const lastMessage = messages[messages.length - 1]?.content || "";
    
    // Retrieve relevant documents
    const documents = await this.retrieveRelevantDocuments(lastMessage, tenderId);
    
    // Filter out PDFs with placeholder text - we'll handle them separately if needed
    const validDocs = documents.filter(doc => 
      doc.text && 
      doc.text.length > 100 && 
      !doc.text.includes("[PDF uploaded successfully") &&
      !doc.text.includes("[PDF parsing failed")
    );
    
    if (validDocs.length === 0) {
      // No valid text content, but we have documents
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
      
      // No documents at all
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
    
    // Parse the AI response or use regex fallback
    return this.parseAnalysisResponse(response, text);
  }

  private parseAnalysisResponse(response: string, originalText: string) {
    // Enhanced regex-based extraction as fallback
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

    const summary = response.includes("Mock") 
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

  // Report generation
  async generateReport(type: string, tenderData: any, customConfig?: any): Promise<string> {
    const insights = tenderData.insights || [];
    const documents = tenderData.documents || [];
    const stages = tenderData.stages || [];
    
    // Extract actual document content for better context
    const documentContent = documents
      .filter((doc: any) => doc.text && doc.text.length > 100)
      .map((doc: any) => `\n--- ${doc.filename} ---\n${doc.text.substring(0, 4000)}...`)
      .join('\n');
    
    // Organize insights by type
    const insightsByType = {
      requirement: insights.filter((i: any) => i.type === 'requirement'),
      compliance: insights.filter((i: any) => i.type === 'compliance'),
      risk: insights.filter((i: any) => i.type === 'risk'),
      deadline: insights.filter((i: any) => i.type === 'deadline'),
    };

    // Build comprehensive context
    const context = `
Tender Details:
- Title: ${tenderData.title}
- Client: ${tenderData.client || 'Not specified'}
- Value: $${tenderData.value?.toLocaleString() || 'TBD'}
- Deadline: ${tenderData.deadline ? new Date(tenderData.deadline).toLocaleDateString() : 'TBD'}
- Win Probability: ${tenderData.winProbability || 0}%
- Status: ${tenderData.status}
- Technical Score: ${tenderData.technicalScore || 0}/100
- Commercial Score: ${tenderData.commercialScore || 0}/100
- Compliance Score: ${tenderData.complianceScore || 0}/100
- Risk Score: ${tenderData.riskScore || 0}/100

Auto-Extracted Information:
- Title: ${tenderData.autoExtractedTitle || 'Not extracted'}
- Budget: ${tenderData.autoExtractedBudget || 'Not extracted'}
- Location: ${tenderData.autoExtractedLocation || 'Not extracted'}
- Submission Deadline: ${tenderData.autoExtractedDeadlines || 'Not extracted'}

Documents Uploaded: ${documents.length}
${documents.map((d: any) => `- ${d.filename}`).join('\n')}

Key Requirements (${insightsByType.requirement.length}):
${insightsByType.requirement.slice(0, 5).map((i: any) => `- ${i.content}`).join('\n')}

Compliance Standards (${insightsByType.compliance.length}):
${insightsByType.compliance.slice(0, 3).map((i: any) => `- ${i.content}`).join('\n')}

Risk Factors (${insightsByType.risk.length}):
${insightsByType.risk.slice(0, 3).map((i: any) => `- ${i.content}`).join('\n')}

Project Stages (${stages.length}):
${stages.map((s: any) => `- ${s.name}: ${s.status}`).join('\n')}

Document Content:
${documentContent || 'No document content available'}
    `.trim();

    // Generate specific report types
    switch(type) {
      case 'briefing':
        return await this.generateBriefingReport(tenderData, context);
      case 'study':
        return await this.generateStudyGuide(tenderData, context);
      case 'blog':
        return await this.generateBlogPost(tenderData, context);
      case 'executive':
        return await this.generateExecutiveSummary(tenderData, context);
      case 'technical':
        return await this.generateTechnicalReport(tenderData, context);
      default:
        return await this.generateCustomReport(tenderData, context, customConfig);
    }
  }

  private async generateBriefingReport(tenderData: any, context: string): Promise<string> {
    const prompt = `Create a professional tender briefing report using this information:

${context}

Format the report with these sections:
1. EXECUTIVE SUMMARY (3-4 sentences)
2. OPPORTUNITY OVERVIEW (tender details, value, timeline)
3. KEY REQUIREMENTS (bullet points of must-haves)
4. COMPLIANCE & STANDARDS (certifications, regulations)
5. RISK ASSESSMENT (identified risks and mitigation)
6. WIN STRATEGY (why we should pursue, competitive advantage)
7. NEXT STEPS (action items and recommendations)

Make it professional, concise, and actionable. Use clear headings and bullet points.`;

    const response = await this.callAI(prompt, "You are a professional tender analyst creating executive briefing documents.");
    
    // Fallback if AI not available
    if (response.includes("Mock") || response.length < 200) {
      return this.createMockBriefingReport(tenderData);
    }
    
    return response;
  }

  private async generateStudyGuide(tenderData: any, context: string): Promise<string> {
    const prompt = `Create a comprehensive study guide for this tender opportunity:

${context}

Format as an educational study guide with:
1. LEARNING OBJECTIVES (what team needs to know)
2. KEY CONCEPTS (important terms and definitions)
3. REQUIREMENTS BREAKDOWN (detailed explanation of each requirement)
4. COMPLIANCE CHECKLIST (step-by-step compliance guide)
5. RISK MANAGEMENT PLAN (how to address each risk)
6. STUDY QUESTIONS (questions to test understanding)
7. RESOURCES & REFERENCES (where to find more information)

Make it educational and thorough for team training.`;

    const response = await this.callAI(prompt, "You are an educational content creator specializing in tender management training.");
    
    if (response.includes("Mock") || response.length < 200) {
      return this.createMockStudyGuide(tenderData);
    }
    
    return response;
  }

  // Audio Overview Generation
  async generateAudioScript(tenderData: any, style: "brief" | "deep-dive" | "podcast" | "presentation" | "interview" | "conversational" | "interactive"): Promise<any> {
    const insights = tenderData.insights || [];
    const documents = tenderData.documents || [];
    
    // Extract actual document content for better context
    const documentContent = documents
      .filter((doc: any) => doc.text && doc.text.length > 100)
      .map((doc: any) => `\n--- ${doc.filename} ---\n${doc.text.substring(0, 5000)}...`)
      .join('\n');
    
    const context = `
Tender: ${tenderData.title}
Client: ${tenderData.client || 'Not specified'}
Value: $${tenderData.value?.toLocaleString() || 'TBD'}
Win Probability: ${tenderData.winProbability || 0}%
Deadline: ${tenderData.deadline ? new Date(tenderData.deadline).toLocaleDateString() : 'TBD'}

Auto-Extracted Information:
- Title: ${tenderData.autoExtractedTitle || 'Not extracted'}
- Budget: ${tenderData.autoExtractedBudget || 'Not extracted'}
- Location: ${tenderData.autoExtractedLocation || 'Not extracted'}
- Submission Deadline: ${tenderData.autoExtractedDeadlines || 'Not extracted'}

Key Insights:
${insights.slice(0, 5).map((i: any) => `- ${i.content}`).join('\n')}

Document Content:
${documentContent || 'No document content available'}

Documents: ${documents.length} uploaded
    `.trim();

    if (style === "interactive") {
      return this.generateInteractiveAudio(tenderData, context);
    } else if (style === "conversational") {
      return this.generateConversationalAudio(tenderData, context);
    } else if (style === "brief") {
      return this.generateBriefAudio(tenderData, context);
    } else if (style === "deep-dive") {
      return this.generateDeepDiveAudio(tenderData, context);
    } else if (style === "presentation") {
      return this.generatePresentationAudio(tenderData, context);
    } else if (style === "interview") {
      return this.generateInterviewAudio(tenderData, context);
    } else {
      return this.generatePodcastAudio(tenderData, context);
    }
  }

  private async generateInteractiveAudio(tenderData: any, context: string): Promise<any> {
    const prompt = `Create an interactive Q&A discussion script for this tender opportunity.

${context}

Create a natural conversation in Q&A format between a Questioner and an Expert. Use questions like:
- "So, what exactly is this project about?"
- "That's interesting! What's the budget for this initiative?"
- "Great question! The deadline is March 15th, which gives us..."
- "What do you think are the main challenges we'll face?"

Make it sound like a real discussion with natural follow-up questions and clarifications.`;

    const response = await this.callAI(prompt, 'You are a professional audio script writer specializing in Q&A discussions and interactive business content.');
    
    return {
      style: "interactive",
      title: `Q&A Discussion: ${tenderData.title}`,
      duration: "6-8 minutes",
      script: response,
      sections: [
        {
          speaker: "Questioner",
          timestamp: "0:00",
          text: "So, what exactly is this project about?",
          duration: 5
        },
        {
          speaker: "Expert",
          timestamp: "0:05",
          text: response.substring(0, 200) + "...",
          duration: 30
        }
      ],
      metadata: {
        wordCount: Math.floor(response.length / 5),
        speakingRate: 150,
        complexity: "intermediate",
        tone: "conversational",
        format: "Q&A Discussion"
      }
    };
  }

  private async generateConversationalAudio(tenderData: any, context: string): Promise<any> {
    const prompt = `Create a conversational Q&A discussion script for this tender opportunity:

${context}

Write a natural Q&A conversation between two people discussing this tender. Use questions like:
- "So, what exactly is this project about?"
- "That's interesting! What's the budget for this initiative?"
- "Great question! The deadline is March 15th, which gives us..."
- "What do you think are the main challenges we'll face?"

Include:
1. Opening Q&A (30 seconds) - Introduction to the opportunity
2. Key Details Q&A (3 minutes) - Value, client, deadline, win probability
3. Requirements Q&A (2 minutes) - Main requirements and scope
4. Risk Assessment Q&A (1.5 minutes) - Major risks and mitigation strategies
5. Strategy Q&A (1 minute) - Win strategy and next steps
6. Closing Q&A (30 seconds) - Call to action and next steps

Format as: [TIMESTAMP] Speaker: Dialogue text

Make it sound natural and conversational, like two colleagues discussing a business opportunity.`;

    const response = await this.callAI(prompt, "You are a professional script writer creating Q&A discussions and conversational business content.");
    
    if (response.includes("Mock") || response.length < 200) {
      return this.createMockConversationalAudio(tenderData);
    }
    
    return this.parseAudioScript(response, "conversational", tenderData.title);
  }

  private async generatePresentationAudio(tenderData: any, context: string): Promise<any> {
    const prompt = `Create a formal presentation-style 8-12 minute audio script for this tender opportunity:

${context}

Write a professional business presentation covering:
1. Executive Summary (1 minute) - High-level overview
2. Opportunity Analysis (2 minutes) - Market, client, value proposition
3. Technical Requirements (2.5 minutes) - Detailed requirements analysis
4. Commercial Considerations (2 minutes) - Budget, timeline, resources
5. Risk Assessment (1.5 minutes) - Risks and mitigation strategies
6. Win Strategy (1.5 minutes) - Competitive advantages and approach
7. Next Steps (30 seconds) - Action items and timeline

Format as: [TIMESTAMP] Narration text

Use formal, professional language suitable for executive presentation.`;

    const response = await this.callAI(prompt, "You are a professional business presentation writer.");
    
    if (response.includes("Mock") || response.length < 200) {
      return this.createMockPresentationAudio(tenderData);
    }
    
    return this.parseAudioScript(response, "presentation", tenderData.title);
  }

  private async generateInterviewAudio(tenderData: any, context: string): Promise<any> {
    const prompt = `Create an interview-style 6-10 minute audio script for this tender opportunity:

${context}

Write a Q&A format interview between an interviewer and a tender expert covering:
1. Introduction (30 seconds) - Meet the expert
2. Opportunity Overview (1.5 minutes) - What is this tender about?
3. Requirements Deep Dive (2.5 minutes) - Technical and commercial requirements
4. Competitive Analysis (1.5 minutes) - How do we compare?
5. Risk Discussion (1.5 minutes) - What are the main risks?
6. Win Strategy (1.5 minutes) - How do we win this?
7. Closing (30 seconds) - Key takeaways

Format as: [TIMESTAMP] Interviewer: Question text
[TIMESTAMP] Expert: Answer text

Make it engaging and informative, like a professional business interview.`;

    const response = await this.callAI(prompt, "You are a professional interview script writer.");
    
    if (response.includes("Mock") || response.length < 200) {
      return this.createMockInterviewAudio(tenderData);
    }
    
    return this.parseAudioScript(response, "interview", tenderData.title);
  }

  private async generateBriefAudio(tenderData: any, context: string): Promise<any> {
    const prompt = `Create a brief 2-3 minute audio narration script for this tender opportunity:

${context}

Write a concise, professional narration covering:
1. Opening (10 seconds) - Introduce the opportunity
2. Key Details (60 seconds) - Value, client, deadline, win probability
3. Main Requirements (45 seconds) - Top 3 requirements
4. Risk Summary (30 seconds) - Major considerations
5. Closing (15 seconds) - Call to action

Format as: [TIMESTAMP] Narration text

Keep it energetic, clear, and actionable.`;

    const response = await this.callAI(prompt, "You are a professional voice-over script writer for business presentations.");
    
    if (response.includes("Mock") || response.length < 100) {
      return this.createMockBriefAudio(tenderData);
    }
    
    return this.parseAudioScript(response, "brief", tenderData.title);
  }

  private async generateDeepDiveAudio(tenderData: any, context: string): Promise<any> {
    const prompt = `Create a comprehensive 10-15 minute audio narration script for this tender:

${context}

Write an in-depth narration covering:
1. Introduction (1 min) - Opportunity overview
2. Background & Context (2 min) - Market, client, strategic fit
3. Detailed Requirements (4 min) - All major requirements explained
4. Compliance & Standards (2 min) - Certifications and regulations
5. Risk Analysis (3 min) - Risks, impacts, mitigation strategies
6. Win Strategy (2 min) - Competitive advantages, approach
7. Next Steps (1 min) - Action plan

Format as: [TIMESTAMP] Narration text

Make it thorough, analytical, and informative.`;

    const response = await this.callAI(prompt, "You are an expert tender analyst creating detailed audio briefings.");
    
    if (response.includes("Mock") || response.length < 100) {
      return this.createMockDeepDiveAudio(tenderData);
    }
    
    return this.parseAudioScript(response, "deep-dive", tenderData.title);
  }

  private async generatePodcastAudio(tenderData: any, context: string): Promise<any> {
    const prompt = `Create a conversational 5-8 minute podcast-style audio script between two hosts discussing this tender:

${context}

Format as a natural conversation:
HOST 1: [Enthusiastic, sets up topics]
HOST 2: [Analytical, provides details]

Cover:
1. Opening banter and intro (1 min)
2. Opportunity discussion (2 min) - What makes it interesting
3. Requirements deep dive (2 min) - Technical discussion
4. Risks and challenges (1.5 min) - Honest assessment
5. Why we should pursue (1 min) - Strategic value
6. Closing thoughts (30 sec) - Summary and next steps

Format as: [SPEAKER] [TIMESTAMP] Dialogue

Make it engaging, conversational, and insightful.`;

    const response = await this.callAI(prompt, "You are a podcast scriptwriter creating engaging business discussions.");
    
    if (response.includes("Mock") || response.length < 100) {
      return this.createMockPodcastAudio(tenderData);
    }
    
    return this.parseAudioScript(response, "podcast", tenderData.title);
  }

  private parseAudioScript(text: string, style: string, title: string): any {
    const lines = text.trim().split('\n').filter(l => l.trim());
    const sections: any[] = [];
    
    lines.forEach(line => {
      const timestampMatch = line.match(/\[(\d+:\d+)\](.+)/) || line.match(/\[(.+?)\]\s*\[(\d+:\d+)\](.+)/);
      if (timestampMatch) {
        const hasSpeaker = timestampMatch.length > 3;
        sections.push({
          speaker: hasSpeaker ? timestampMatch[1] : undefined,
          timestamp: hasSpeaker ? timestampMatch[2] : timestampMatch[1],
          text: (hasSpeaker ? timestampMatch[3] : timestampMatch[2]).trim()
        });
      }
    });
    
    const duration = style === "brief" ? "~2-3 min" : style === "deep-dive" ? "~10-15 min" : "~5-8 min";
    
    return {
      style,
      title: `Audio Overview: ${title}`,
      duration,
      script: text,
      sections: sections.length > 0 ? sections : [{ timestamp: "0:00", text }]
    };
  }

  // Video Overview Generation
  async generateVideoScript(tenderData: any, style: string = "notebooklm"): Promise<any> {
    const insights = tenderData.insights || [];
    const documents = tenderData.documents || [];
    
    // Extract actual document content for better context
    const documentContent = documents
      .filter((doc: any) => doc.text && doc.text.length > 100)
      .map((doc: any) => `\n--- ${doc.filename} ---\n${doc.text.substring(0, 5000)}...`)
      .join('\n');
    
    const context = `
Tender: ${tenderData.title}
Client: ${tenderData.client || 'Not specified'}
Value: $${tenderData.value?.toLocaleString() || 'TBD'}
Win Probability: ${tenderData.winProbability || 0}%

Auto-Extracted Information:
- Title: ${tenderData.autoExtractedTitle || 'Not extracted'}
- Budget: ${tenderData.autoExtractedBudget || 'Not extracted'}
- Location: ${tenderData.autoExtractedLocation || 'Not extracted'}
- Submission Deadline: ${tenderData.autoExtractedDeadlines || 'Not extracted'}

Key Insights: ${insights.length}
Technical Score: ${tenderData.technicalScore || 0}/100
Commercial Score: ${tenderData.commercialScore || 0}/100

Document Content:
${documentContent || 'No document content available'}
    `.trim();

    const styleInstructions = {
      notebooklm: "Create a clean, modern presentation with focus on content clarity. Use minimal distractions, professional typography, and clear visual hierarchy.",
      corporate: "Create a formal business presentation suitable for executives. Use professional colors, formal language, and business-focused charts.",
      creative: "Create a dynamic, visually engaging presentation. Use creative layouts, engaging animations, and modern design elements.",
      academic: "Create a research-focused presentation with detailed analysis. Use data visualization, academic tone, and comprehensive information.",
      minimal: "Create an ultra-clean, distraction-free presentation. Use minimal text, focus on visuals, and simple layouts."
    };

    const prompt = `Create a high-quality video presentation script with 6-8 slides for this tender opportunity using ${style} style:

${context}

Style Instructions: ${styleInstructions[style as keyof typeof styleInstructions] || styleInstructions.notebooklm}

For each slide, provide:
1. SLIDE TITLE (clear, engaging)
2. SLIDE TYPE (title/content/chart/image/quote/comparison/timeline/summary)
3. BULLET POINTS (3-5 key points)
4. NARRATION (what to say, 30-45 seconds)
5. VISUAL SUGGESTION (detailed visual description)
6. DESIGN THEME (modern/classic/minimal/corporate/creative/academic)
7. COLOR SCHEME (blue/green/purple/orange/red/gray)
8. LAYOUT (centered/left-aligned/two-column/full-width/split-screen)
9. ANIMATIONS (fade-in/slide-in/zoom/typewriter/none)
10. TRANSITIONS (slide/fade/dissolve/zoom/none)

Create slides for:
- Title slide with opportunity overview
- Opportunity details (value, client, timeline)
- Key requirements and scope
- Compliance and risks
- Win strategy and next steps
- Closing with call to action

Format each slide clearly with sections marked. Make it professional and engaging.`;

    const response = await this.callAI(prompt, "You are a presentation designer creating video scripts for business opportunities.");
    
    if (response.includes("Mock") || response.length < 200) {
      return this.createMockVideoScript(tenderData);
    }
    
    return this.parseVideoScript(response, tenderData.title);
  }

  private parseVideoScript(text: string, title: string): any {
    // Simple parsing - in production, use more sophisticated parsing
    const slides: any[] = [];
    const slidePattern = /SLIDE\s+(\d+):/gi;
    const parts = text.split(slidePattern);
    
    for (let i = 1; i < parts.length; i += 2) {
      const slideNum = parseInt(parts[i]);
      const content = parts[i + 1] || "";
      
      slides.push({
        slideNumber: slideNum,
        title: this.extractTitle(content),
        content: this.extractBullets(content),
        narration: this.extractNarration(content),
        duration: "45 sec",
        visualSuggestion: this.extractVisual(content)
      });
    }
    
    if (slides.length === 0) {
      return this.createMockVideoScript(title);
    }
    
    return {
      title: `Video Overview: ${title}`,
      totalDuration: `${slides.length * 45} seconds (~${Math.ceil(slides.length * 45 / 60)} min)`,
      slides
    };
  }

  private extractTitle(text: string): string {
    const match = text.match(/TITLE:?\s*(.+?)(?:\n|BULLET|NARRATION|VISUAL|$)/i);
    return match ? match[1].trim() : "Slide Title";
  }

  private extractBullets(text: string): string[] {
    const section = text.match(/BULLET POINTS?:?\s*([\s\S]+?)(?:\nNARRATION|VISUAL|$)/i);
    if (!section) return ["Key point"];
    
    return section[1]
      .split('\n')
      .filter(l => l.trim().match(/^[-•*]\s/))
      .map(l => l.replace(/^[-•*]\s/, '').trim())
      .filter(l => l.length > 0)
      .slice(0, 5);
  }

  private extractNarration(text: string): string {
    const match = text.match(/NARRATION:?\s*([\s\S]+?)(?:\nVISUAL|SLIDE|$)/i);
    return match ? match[1].trim() : "Narration for this slide.";
  }

  private extractVisual(text: string): string {
    const match = text.match(/VISUAL SUGGESTION?:?\s*(.+?)(?:\n|$)/i);
    return match ? match[1].trim() : "Professional slide design with key metrics";
  }

  private async generateBlogPost(tenderData: any, context: string): Promise<string> {
    const prompt = `Write an engaging blog post about this tender opportunity:

${context}

Create a blog post with:
- Catchy title
- Opening hook (why this opportunity matters)
- Opportunity details (presented engagingly)
- Why it's exciting (value proposition)
- What success looks like
- Call to action

Tone: Professional but approachable, enthusiastic about the opportunity.
Length: 500-700 words.`;

    const response = await this.callAI(prompt, "You are a professional business writer creating engaging content about tender opportunities.");
    
    if (response.includes("Mock") || response.length < 200) {
      return this.createMockBlogPost(tenderData);
    }
    
    return response;
  }

  private async generateExecutiveSummary(tenderData: any, context: string): Promise<string> {
    const prompt = `Create a one-page executive summary for this tender:

${context}

Include:
- One-paragraph overview
- Financial snapshot (value, budget, ROI)
- Strategic fit (why this matters)
- Risk profile (high/medium/low with key risks)
- Go/No-Go recommendation with rationale

Keep it to one page, focused on decision-making.`;

    const response = await this.callAI(prompt, "You are an executive advisor providing strategic tender recommendations.");
    
    if (response.includes("Mock") || response.length < 200) {
      return this.createMockExecutiveSummary(tenderData);
    }
    
    return response;
  }

  private async generateTechnicalReport(tenderData: any, context: string): Promise<string> {
    const prompt = `Create a detailed technical analysis report:

${context}

Technical report sections:
1. TECHNICAL REQUIREMENTS (detailed specifications)
2. CAPABILITY ASSESSMENT (our technical fit)
3. TECHNOLOGY STACK (required technologies)
4. INTEGRATION REQUIREMENTS (systems, APIs, interfaces)
5. TECHNICAL RISKS (challenges and solutions)
6. RESOURCE REQUIREMENTS (team, skills, tools)
7. TECHNICAL RECOMMENDATIONS

Focus on technical depth and accuracy.`;

    const response = await this.callAI(prompt, "You are a technical architect analyzing tender requirements.");
    
    if (response.includes("Mock") || response.length < 200) {
      return this.createMockTechnicalReport(tenderData);
    }
    
    return response;
  }

  private async generateCustomReport(tenderData: any, context: string, customConfig?: any): Promise<string> {
    console.log("🤖 generateCustomReport called with config:", customConfig);
    
    if (customConfig) {
      const sections = customConfig.sections.join('\n- ');
      const audience = customConfig.targetAudience.join(', ');
      
      const prompt = `Generate a custom report titled "${customConfig.title}" for this tender:

${context}

Report Configuration:
- Title: ${customConfig.title}
- Description: ${customConfig.description || 'Not provided'}
- Target Audience: ${audience || 'General audience'}
- Complexity Level: ${customConfig.complexity}
- Estimated Time: ${customConfig.estimatedTime}

What the User Needs from This Report:
${customConfig.requirements}

Required Sections:
- ${sections}

Additional Requirements:
- Include charts and graphs: ${customConfig.includeCharts ? 'Yes' : 'No'}
- Include images and diagrams: ${customConfig.includeImages ? 'Yes' : 'No'}
- Include references and citations: ${customConfig.includeReferences ? 'Yes' : 'No'}
- Tone: ${customConfig.tone}
- Length: ${customConfig.length}

IMPORTANT: Focus specifically on what the user needs from this report. Make sure the content directly addresses their requirements and provides the specific information they're looking for. Create a professional, well-structured report that follows the specified sections and requirements while prioritizing the user's stated needs.`;

      console.log("📝 Generated prompt:", prompt.substring(0, 500) + "...");
      
      const response = await this.callAI(prompt, `You are a professional report writer creating custom reports for tender opportunities. Tailor the content to the specified audience and complexity level.`);
      
      console.log("🤖 AI Response length:", response.length);
      console.log("🤖 AI Response preview:", response.substring(0, 200) + "...");
      
      if (response.includes("Mock") || response.length < 200) {
        console.log("🔄 Using mock report due to short response");
        return this.createMockCustomReport(tenderData, customConfig);
      }
      
      return response;
    } else {
      console.log("🔄 No custom config, using default custom report");
      const prompt = `Generate a comprehensive custom report for this tender:

${context}

Create a well-structured report covering all relevant aspects of this opportunity.`;

      const response = await this.callAI(prompt);
      
      if (response.includes("Mock") || response.length < 200) {
        return this.createMockBriefingReport(tenderData);
      }
      
      return response;
    }
  }

  // Mock report generators for fallback
  private createMockCustomReport(tenderData: any, customConfig: any): string {
    const sections = customConfig.sections.map((section: string, index: number) => 
      `### ${index + 1}. ${section}\n[Content for ${section} would be generated here]`
    ).join('\n\n');
    
    return `# ${customConfig.title}

## Report Overview
${customConfig.description || 'Custom report generated for tender analysis'}

**Target Audience**: ${customConfig.targetAudience.join(', ') || 'General audience'}
**Complexity Level**: ${customConfig.complexity}
**Estimated Reading Time**: ${customConfig.estimatedTime}

## What You Need from This Report
${customConfig.requirements}

---

${sections}

---

*This is a mock custom report. In a real implementation, this would be generated by AI based on the tender data and custom configuration, specifically addressing your requirements: "${customConfig.requirements}"*`;
  }

  private createMockBriefingReport(tenderData: any): string {
    return `# TENDER BRIEFING REPORT
## ${tenderData.title}

### EXECUTIVE SUMMARY
${tenderData.title} represents a ${tenderData.value ? `$${tenderData.value.toLocaleString()}` : 'significant'} opportunity${tenderData.client ? ` with ${tenderData.client}` : ''}. With a win probability of ${tenderData.winProbability || 50}%, this tender aligns with our strategic objectives and technical capabilities.

### OPPORTUNITY OVERVIEW
- **Client**: ${tenderData.client || 'To be confirmed'}
- **Value**: $${tenderData.value?.toLocaleString() || 'TBD'}
- **Deadline**: ${tenderData.deadline ? new Date(tenderData.deadline).toLocaleDateString() : 'TBD'}
- **Status**: ${tenderData.status}
- **Win Probability**: ${tenderData.winProbability || 50}%

### KEY REQUIREMENTS
- Technical specifications must be met as outlined in tender documents
- Compliance with industry standards and regulations required
- Experienced team with relevant qualifications needed
- Quality assurance and project management processes required
- Delivery within specified timeline and budget

### COMPLIANCE & STANDARDS
- Industry-specific certifications required
- Quality management standards (ISO 9001 or equivalent)
- Security and data protection compliance
- Safety regulations and procedures
- Environmental and sustainability requirements

### RISK ASSESSMENT
**Key Risks:**
- Timeline constraints may require additional resources
- Technical complexity requires experienced team
- Compliance requirements need careful attention
- Budget constraints require efficient resource allocation

**Mitigation Strategies:**
- Early project planning and resource allocation
- Engage experienced technical leads
- Dedicated compliance review process
- Regular risk monitoring and adjustment

### WIN STRATEGY
**Our Competitive Advantages:**
- Strong technical capability (Score: ${tenderData.technicalScore || 0}/100)
- Competitive commercial offering (Score: ${tenderData.commercialScore || 0}/100)
- Proven compliance track record (Score: ${tenderData.complianceScore || 0}/100)
- Effective risk management (Score: ${tenderData.riskScore || 0}/100)

**Why We Should Pursue:**
- Strategic fit with company objectives
- Strong win probability at ${tenderData.winProbability || 50}%
- Valuable client relationship opportunity
- Enhances market position

### NEXT STEPS
1. **Immediate Actions** (Week 1)
   - Form bid team and assign roles
   - Review all tender documents thoroughly
   - Identify any clarification questions for client

2. **Short-term Actions** (Weeks 2-3)
   - Develop technical solution and approach
   - Prepare compliance documentation
   - Conduct risk assessment workshops
   - Draft proposal outline

3. **Pre-submission** (Final Week)
   - Complete proposal writing
   - Internal review and quality check
   - Final compliance verification
   - Submit before deadline

---
*Report generated by TenderBolt AI - ${new Date().toLocaleDateString()}*
`;
  }

  private createMockStudyGuide(tenderData: any): string {
    return `# TENDER STUDY GUIDE
## ${tenderData.title}

### LEARNING OBJECTIVES
By studying this guide, team members will:
- Understand the complete scope and requirements of the tender
- Identify key compliance standards and how to meet them
- Recognize potential risks and mitigation strategies
- Know the critical success factors for winning this opportunity

### KEY CONCEPTS

**Tender Value**: $${tenderData.value?.toLocaleString() || 'TBD'}
The total contract value represents the financial opportunity.

**Win Probability**: ${tenderData.winProbability || 50}%
Our assessed likelihood of success based on technical fit, commercial competitiveness, and risk factors.

**Compliance**: Meeting all specified standards and regulations
Essential for tender eligibility and success.

### REQUIREMENTS BREAKDOWN

**Technical Requirements**
- Must meet specified technical specifications
- Proven track record in similar projects
- Qualified and experienced team members
- Quality assurance processes

**Commercial Requirements**
- Competitive pricing within budget constraints
- Clear cost breakdown and justification
- Payment terms alignment
- Value for money demonstration

**Compliance Requirements**
- Industry certifications and standards
- Regulatory compliance documentation
- Safety and security protocols
- Environmental considerations

### COMPLIANCE CHECKLIST

□ Review all compliance requirements thoroughly
□ Verify company certifications are current
□ Prepare compliance documentation
□ Ensure team qualifications meet requirements
□ Complete safety and security assessments
□ Document quality management processes
□ Verify insurance and liability coverage

### RISK MANAGEMENT PLAN

**Identified Risks:**
1. **Timeline Risk**: Tight submission deadline
   - *Mitigation*: Early start, clear schedule, buffer time

2. **Technical Risk**: Complex requirements
   - *Mitigation*: Experienced team, technical review process

3. **Compliance Risk**: Multiple standards required
   - *Mitigation*: Dedicated compliance officer, thorough checklist

4. **Resource Risk**: Skill availability
   - *Mitigation*: Early resource planning, backup options

### STUDY QUESTIONS

1. What is the total value of this tender opportunity?
2. When is the submission deadline?
3. What are the three most critical requirements?
4. Which compliance standards must we meet?
5. What is our win probability and why?
6. What are the top three risks we've identified?
7. Who is the client and what are their priorities?
8. What makes us competitive for this opportunity?

### RESOURCES & REFERENCES

**Internal Resources:**
- Tender document library
- Previous similar proposals
- Technical team expertise
- Compliance documentation

**External Resources:**
- Client website and background
- Industry standards documentation
- Market research and competitor analysis
- Regulatory guidelines

---
*Study Guide created by TenderBolt AI - ${new Date().toLocaleDateString()}*
`;
  }

  private createMockBlogPost(tenderData: any): string {
    return `# Exciting New Opportunity: ${tenderData.title}

${tenderData.client ? `We are thrilled to announce our pursuit of an exciting tender opportunity with ${tenderData.client}` : 'We are excited to share details about a significant tender opportunity'} that aligns perfectly with our strategic vision and technical capabilities.

## Why This Opportunity Matters

In today's competitive landscape, ${tenderData.value ? `a $${tenderData.value.toLocaleString()} project` : 'this opportunity'} represents more than just a contract - it is a chance to demonstrate our expertise, build valuable relationships, and expand our market presence.

## The Opportunity at a Glance

**${tenderData.title}** ${tenderData.client ? `for ${tenderData.client}` : ''} is a ${tenderData.value ? `$${tenderData.value.toLocaleString()}` : 'significant'} project that will ${tenderData.deadline ? `need to be delivered by ${new Date(tenderData.deadline).toLocaleDateString()}` : 'require our best efforts'}.

### What Makes This Exciting?

- **Strategic Fit**: Aligns with our core competencies and growth strategy
- **Win Probability**: Our assessment shows a ${tenderData.winProbability || 50}% chance of success
- **Technical Challenge**: Opportunity to showcase our advanced capabilities
- **Relationship Building**: Potential for long-term partnership and future opportunities

### Our Competitive Edge

We have assessed our positioning carefully:

- **Technical Capability** (${tenderData.technicalScore || 0}/100): We have the expertise and experience to deliver excellence
- **Commercial Competitiveness** (${tenderData.commercialScore || 0}/100): Our pricing and value proposition are strong
- **Compliance Readiness** (${tenderData.complianceScore || 0}/100): We meet all required standards and regulations

## What Success Looks Like

Winning this tender means:

✓ Demonstrating our technical excellence
✓ Building a valuable client relationship
✓ Expanding our portfolio and capabilities
✓ Strengthening our market position
✓ Creating opportunities for team growth and development

## The Road Ahead

Our team is fully engaged in developing a compelling proposal that highlights our unique value proposition. We are confident in our approach and excited about the possibilities this opportunity presents.

With ${tenderData.deadline ? `the deadline approaching on ${new Date(tenderData.deadline).toLocaleDateString()}` : 'careful planning and execution'}, we are committed to submitting a winning proposal that showcases why we are the right partner for this project.

## Join Us on This Journey

Stay tuned for updates as we progress through the tender process. This is just the beginning of what promises to be an exciting opportunity for growth and success!

---
*Want to learn more about our tender capabilities? Contact our team today!*
`;
  }

  private createMockExecutiveSummary(tenderData: any): string {
    return `# EXECUTIVE SUMMARY
## ${tenderData.title}

**Prepared**: ${new Date().toLocaleDateString()}

### Overview
${tenderData.title} ${tenderData.client ? `for ${tenderData.client}` : ''} represents a ${tenderData.value ? `$${tenderData.value.toLocaleString()}` : 'significant'} opportunity with a ${tenderData.winProbability || 50}% win probability. Our analysis indicates strong technical fit and competitive positioning${tenderData.deadline ? `, with submission required by ${new Date(tenderData.deadline).toLocaleDateString()}` : ''}.

### Financial Snapshot
- **Contract Value**: $${tenderData.value?.toLocaleString() || 'TBD'}
- **Estimated ROI**: Positive with strategic value
- **Win Probability**: ${tenderData.winProbability || 50}%
- **Investment Required**: Resource commitment for ${tenderData.deadline ? Math.ceil((new Date(tenderData.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 'TBD'} days

### Strategic Fit
This opportunity aligns with our strategic objectives by:
- Expanding capabilities in target market
- Building relationship with ${tenderData.client || 'key client'}
- Demonstrating technical leadership
- Strengthening competitive position

### Risk Profile: ${tenderData.riskScore && tenderData.riskScore > 70 ? 'MEDIUM-HIGH' : tenderData.riskScore && tenderData.riskScore > 40 ? 'MEDIUM' : 'LOW-MEDIUM'}

**Key Risks:**
- Timeline: ${tenderData.deadline ? 'Tight deadline requires focused effort' : 'Timeline manageable'}
- Technical: Complexity requires experienced team
- Commercial: Competitive pricing pressure
- Compliance: Multiple standards must be met

**Mitigation:** Strong project management, experienced team allocation, thorough compliance review.

### Recommendation: ${tenderData.winProbability && tenderData.winProbability >= 60 ? '✅ GO' : tenderData.winProbability && tenderData.winProbability >= 40 ? '⚠️ GO WITH CAUTION' : '❌ CONSIDER NO-GO'}

**Rationale:**
${tenderData.winProbability && tenderData.winProbability >= 60 
  ? `Strong win probability (${tenderData.winProbability}%), good technical fit (${tenderData.technicalScore || 0}/100), and acceptable risk profile support pursuing this opportunity. The strategic value and financial return justify the investment.`
  : tenderData.winProbability && tenderData.winProbability >= 40
    ? `Moderate win probability (${tenderData.winProbability}%) suggests careful consideration. Technical capability is demonstrated (${tenderData.technicalScore || 0}/100), but competitive pressure and risks require mitigation strategies. Recommend GO if strategic value is high.`
    : `Lower win probability (${tenderData.winProbability || 50}%) and risk factors suggest cautious approach. Consider no-go unless strategic imperative exists. Alternative: pursue as learning opportunity with limited resource commitment.`
}

**Next Steps:**
1. Executive decision on GO/NO-GO
2. If GO: Form bid team immediately
3. Develop detailed proposal plan
4. Begin resource allocation

---
*Executive Summary - TenderBolt AI*
`;
  }

  private createMockTechnicalReport(tenderData: any): string {
    return `# TECHNICAL ANALYSIS REPORT
## ${tenderData.title}

### 1. TECHNICAL REQUIREMENTS

**Core Requirements:**
- Technical specifications as defined in tender documents
- Integration with existing systems and infrastructure
- Performance and scalability requirements
- Security and data protection standards
- Quality assurance and testing protocols

**Technical Scoring**: ${tenderData.technicalScore || 0}/100

Our technical capability assessment shows ${tenderData.technicalScore && tenderData.technicalScore >= 70 ? 'strong' : tenderData.technicalScore && tenderData.technicalScore >= 50 ? 'adequate' : 'developing'} alignment with requirements.

### 2. CAPABILITY ASSESSMENT

**Our Technical Strengths:**
- Experienced engineering team with relevant domain expertise
- Proven track record in similar projects
- Modern technology stack and methodologies
- Strong quality assurance processes
- Established project management framework

**Gaps and Mitigation:**
- Identify any technical gaps requiring additional resources
- Plan for skill development or external expertise
- Allocate time for technology evaluation and prototyping

### 3. TECHNOLOGY STACK

**Recommended Technologies:**
- Primary platforms and frameworks based on requirements
- Integration middleware and APIs
- Database and data management solutions
- Security and authentication systems
- Monitoring and operational tools

**Justification:**
Selection based on:
- Alignment with client requirements
- Team expertise and experience
- Scalability and performance characteristics
- Support and maintenance considerations
- Cost-effectiveness and licensing

### 4. INTEGRATION REQUIREMENTS

**System Integrations:**
- Client existing systems and platforms
- Third-party services and APIs
- Data migration and synchronization
- Authentication and authorization systems

**Integration Approach:**
- API-first design principles
- Standardized data formats and protocols
- Comprehensive testing strategy
- Phased implementation plan

### 5. TECHNICAL RISKS

**Risk Categories:**

**a) Technical Complexity** (Risk Score: ${tenderData.riskScore || 0}/100)
- Challenge: Complex technical requirements
- Impact: Timeline and resource implications
- Mitigation: Experienced technical leads, prototyping, regular reviews

**b) Integration Challenges**
- Challenge: Multiple system integrations required
- Impact: Dependencies and coordination complexity
- Mitigation: Early integration planning, mock services, incremental testing

**c) Performance Requirements**
- Challenge: Meeting performance and scalability targets
- Impact: Architecture decisions and infrastructure needs
- Mitigation: Performance testing, load simulation, scalable architecture

**d) Technology Evolution**
- Challenge: Rapid technology changes
- Impact: Long-term maintainability
- Mitigation: Standard technologies, documentation, knowledge transfer

### 6. RESOURCE REQUIREMENTS

**Team Composition:**
- Technical Lead / Architect (senior, full-time)
- Senior Developers (2-3, full-time)
- QA Engineer (1, full-time)
- DevOps Engineer (1, part-time)
- Project Manager (1, part-time)

**Skills Required:**
- Specific technology expertise
- Domain knowledge
- Integration experience
- Security and compliance understanding

**Tools and Infrastructure:**
- Development environments
- Testing and QA tools
- CI/CD pipeline
- Monitoring and logging systems

### 7. TECHNICAL RECOMMENDATIONS

**Architecture Approach:**
- Modular, scalable architecture
- Microservices or appropriate pattern
- Cloud-native where applicable
- Security by design

**Development Methodology:**
- Agile/Scrum framework
- Regular client engagement
- Iterative delivery
- Continuous integration and deployment

**Quality Assurance:**
- Automated testing (unit, integration, E2E)
- Code review processes
- Performance testing
- Security scanning and auditing

**Risk Mitigation:**
- Technical spike for high-risk areas
- Proof of concept for critical components
- Regular technical reviews
- Fallback and contingency plans

### TECHNICAL FEASIBILITY: ${tenderData.technicalScore && tenderData.technicalScore >= 70 ? '✅ HIGH' : tenderData.technicalScore && tenderData.technicalScore >= 50 ? '⚠️ MODERATE' : '❌ CHALLENGING'}

${tenderData.technicalScore && tenderData.technicalScore >= 70 
  ? 'We have strong technical capability and experience to deliver this project successfully. Recommend proceeding with confidence.'
  : tenderData.technicalScore && tenderData.technicalScore >= 50
    ? 'Technical feasibility is moderate. Recommend proceeding with additional technical planning and risk mitigation strategies.'
    : 'Technical challenges are significant. Recommend additional assessment, possible partnerships, or reconsideration of pursuit.'
}

---
*Technical Report - TenderBolt AI Technical Analysis*
`;
  }

  // Mock audio generators
  private createMockBriefAudio(tenderData: any): any {
    return {
      style: "brief",
      title: `Audio Overview: ${tenderData.title}`,
      duration: "~2-3 min",
      script: `[0:00] Welcome to this brief overview of ${tenderData.title}.

[0:10] This is a ${tenderData.value ? `$${tenderData.value.toLocaleString()}` : 'significant'} opportunity ${tenderData.client ? `with ${tenderData.client}` : 'in our pipeline'}, with a win probability of ${tenderData.winProbability || 50}%.

[1:10] The key requirements focus on technical excellence, compliance with industry standards, and proven delivery capability. Our technical score of ${tenderData.technicalScore || 0} out of 100 positions us well.

[1:55] Major risks include timeline constraints and resource allocation, but our mitigation strategies are solid. With a deadline of ${tenderData.deadline ? new Date(tenderData.deadline).toLocaleDateString() : 'TBD'}, we need to move quickly.

[2:25] This opportunity aligns with our strategic goals and represents strong growth potential. Recommendation: Pursue with confidence. That concludes this brief overview.`,
      sections: [
        { timestamp: "0:00", text: `Welcome to this brief overview of ${tenderData.title}.` },
        { timestamp: "0:10", text: `This is a ${tenderData.value ? `$${tenderData.value.toLocaleString()}` : 'significant'} opportunity ${tenderData.client ? `with ${tenderData.client}` : 'in our pipeline'}, with a win probability of ${tenderData.winProbability || 50}%.` },
        { timestamp: "1:10", text: `The key requirements focus on technical excellence, compliance with industry standards, and proven delivery capability. Our technical score of ${tenderData.technicalScore || 0} out of 100 positions us well.` },
        { timestamp: "1:55", text: `Major risks include timeline constraints and resource allocation, but our mitigation strategies are solid. With a deadline of ${tenderData.deadline ? new Date(tenderData.deadline).toLocaleDateString() : 'TBD'}, we need to move quickly.` },
        { timestamp: "2:25", text: "This opportunity aligns with our strategic goals and represents strong growth potential. Recommendation: Pursue with confidence. That concludes this brief overview." }
      ]
    };
  }

  private createMockDeepDiveAudio(tenderData: any): any {
    return {
      style: "deep-dive",
      title: `Deep Dive: ${tenderData.title}`,
      duration: "~10-15 min",
      script: `[0:00] Welcome to an in-depth analysis of ${tenderData.title}. Over the next 10 to 15 minutes, we will examine every aspect of this opportunity in detail.

[1:00] Let us start with the background. ${tenderData.client ? `Our client, ${tenderData.client}, is` : 'The client is'} seeking a comprehensive solution valued at ${tenderData.value ? `$${tenderData.value.toLocaleString()}` : 'a significant amount'}. The market context shows strong demand and strategic alignment with our capabilities.

[3:00] Moving to the detailed requirements. First, technical specifications demand cutting-edge solutions with proven reliability. Second, compliance requirements include multiple industry standards and certifications. Third, delivery timelines are aggressive but achievable with proper planning.

[7:00] On the compliance front, we need to address several key standards. Quality management systems, security protocols, and environmental considerations all play crucial roles. Our compliance score of ${tenderData.complianceScore || 0} indicates ${tenderData.complianceScore && tenderData.complianceScore >= 70 ? 'strong' : 'moderate'} readiness.

[10:00] Risk analysis reveals both challenges and opportunities. Timeline risks can be mitigated through early resource allocation. Technical risks require experienced team leads and proof of concepts. Commercial risks are manageable with competitive pricing strategies.

[13:00] Our win strategy centers on three pillars: technical excellence with a score of ${tenderData.technicalScore || 0}, competitive commercial offering, and strong compliance track record. Combined win probability stands at ${tenderData.winProbability || 50}%.

[14:00] In conclusion, this represents a strategic opportunity worth pursuing. Next steps include bid team formation, detailed technical planning, and stakeholder engagement. Thank you for this deep dive analysis.`,
      sections: [
        { timestamp: "0:00", text: `Welcome to an in-depth analysis of ${tenderData.title}. Over the next 10 to 15 minutes, we will examine every aspect of this opportunity in detail.` },
        { timestamp: "1:00", text: `Let us start with the background. ${tenderData.client ? `Our client, ${tenderData.client}, is` : 'The client is'} seeking a comprehensive solution valued at ${tenderData.value ? `$${tenderData.value.toLocaleString()}` : 'a significant amount'}. The market context shows strong demand and strategic alignment with our capabilities.` },
        { timestamp: "3:00", text: "Moving to the detailed requirements. First, technical specifications demand cutting-edge solutions with proven reliability. Second, compliance requirements include multiple industry standards and certifications. Third, delivery timelines are aggressive but achievable with proper planning." },
        { timestamp: "7:00", text: `On the compliance front, we need to address several key standards. Quality management systems, security protocols, and environmental considerations all play crucial roles. Our compliance score of ${tenderData.complianceScore || 0} indicates ${tenderData.complianceScore && tenderData.complianceScore >= 70 ? 'strong' : 'moderate'} readiness.` },
        { timestamp: "10:00", text: "Risk analysis reveals both challenges and opportunities. Timeline risks can be mitigated through early resource allocation. Technical risks require experienced team leads and proof of concepts. Commercial risks are manageable with competitive pricing strategies." },
        { timestamp: "13:00", text: `Our win strategy centers on three pillars: technical excellence with a score of ${tenderData.technicalScore || 0}, competitive commercial offering, and strong compliance track record. Combined win probability stands at ${tenderData.winProbability || 50}%.` },
        { timestamp: "14:00", text: "In conclusion, this represents a strategic opportunity worth pursuing. Next steps include bid team formation, detailed technical planning, and stakeholder engagement. Thank you for this deep dive analysis." }
      ]
    };
  }

  private createMockPodcastAudio(tenderData: any): any {
    return {
      style: "podcast",
      title: `Podcast: ${tenderData.title}`,
      duration: "~5-8 min",
      script: `[HOST 1] [0:00] Hey everyone, welcome back to Tender Talk! Today we are diving into an exciting opportunity.

[HOST 2] [0:15] That is right! We are looking at ${tenderData.title}, and let me tell you, this one has some interesting angles.

[HOST 1] [0:30] So give us the headline numbers. What are we talking about here?

[HOST 2] [0:35] We are looking at a ${tenderData.value ? `$${tenderData.value.toLocaleString()}` : 'substantial'} deal${tenderData.client ? ` with ${tenderData.client}` : ''}. Win probability is sitting at ${tenderData.winProbability || 50}%, which is pretty solid.

[HOST 1] [1:00] Nice! What makes this opportunity stand out?

[HOST 2] [1:10] A few things. First, the technical requirements align perfectly with our capabilities. Our technical score is ${tenderData.technicalScore || 0} out of 100. Plus, the client is looking for innovation, not just checkbox compliance.

[HOST 1] [2:00] Love that. But what about the challenges? There are always challenges.

[HOST 2] [2:10] Sure, timeline is tight. We have got a ${tenderData.deadline ? new Date(tenderData.deadline).toLocaleDateString() : 'TBD'} deadline, which means we need to hit the ground running. Resource allocation will be critical.

[HOST 1] [3:30] So what is your take? Should we go for it?

[HOST 2] [3:40] Absolutely. The strategic fit is excellent, the numbers work, and we have the team to pull it off. I would say this is a definite yes.

[HOST 1] [4:20] Awesome! Next steps?

[HOST 2] [4:25] Form the bid team, start detailed planning, and engage with stakeholders early. Get moving on this one.

[HOST 1] [4:45] Perfect. Thanks for breaking that down! That is all for today, folks. Until next time!`,
      sections: [
        { speaker: "HOST 1", timestamp: "0:00", text: "Hey everyone, welcome back to Tender Talk! Today we are diving into an exciting opportunity." },
        { speaker: "HOST 2", timestamp: "0:15", text: `That is right! We are looking at ${tenderData.title}, and let me tell you, this one has some interesting angles.` },
        { speaker: "HOST 1", timestamp: "0:30", text: "So give us the headline numbers. What are we talking about here?" },
        { speaker: "HOST 2", timestamp: "0:35", text: `We are looking at a ${tenderData.value ? `$${tenderData.value.toLocaleString()}` : 'substantial'} deal${tenderData.client ? ` with ${tenderData.client}` : ''}. Win probability is sitting at ${tenderData.winProbability || 50}%, which is pretty solid.` },
        { speaker: "HOST 1", timestamp: "1:00", text: "Nice! What makes this opportunity stand out?" },
        { speaker: "HOST 2", timestamp: "1:10", text: `A few things. First, the technical requirements align perfectly with our capabilities. Our technical score is ${tenderData.technicalScore || 0} out of 100. Plus, the client is looking for innovation, not just checkbox compliance.` },
        { speaker: "HOST 1", timestamp: "2:00", text: "Love that. But what about the challenges? There are always challenges." },
        { speaker: "HOST 2", timestamp: "2:10", text: `Sure, timeline is tight. We have got a ${tenderData.deadline ? new Date(tenderData.deadline).toLocaleDateString() : 'TBD'} deadline, which means we need to hit the ground running. Resource allocation will be critical.` },
        { speaker: "HOST 1", timestamp: "3:30", text: "So what is your take? Should we go for it?" },
        { speaker: "HOST 2", timestamp: "3:40", text: "Absolutely. The strategic fit is excellent, the numbers work, and we have the team to pull it off. I would say this is a definite yes." },
        { speaker: "HOST 1", timestamp: "4:20", text: "Awesome! Next steps?" },
        { speaker: "HOST 2", timestamp: "4:25", text: "Form the bid team, start detailed planning, and engage with stakeholders early. Get moving on this one." },
        { speaker: "HOST 1", timestamp: "4:45", text: "Perfect. Thanks for breaking that down! That is all for today, folks. Until next time!" }
      ]
    };
  }

  // Mock video generator
  private createMockVideoScript(tenderData: any): any {
    return {
      title: `Video Overview: ${tenderData.title}`,
      totalDuration: "5 minutes",
      slides: [
        {
          slideNumber: 1,
          title: tenderData.title,
          content: [
            `Value: ${tenderData.value ? `$${tenderData.value.toLocaleString()}` : 'TBD'}`,
            tenderData.client ? `Client: ${tenderData.client}` : 'Enterprise Client',
            `Win Probability: ${tenderData.winProbability || 50}%`,
            `Deadline: ${tenderData.deadline ? new Date(tenderData.deadline).toLocaleDateString() : 'TBD'}`
          ],
          narration: `Welcome to this video overview of ${tenderData.title}. This represents a ${tenderData.value ? `$${tenderData.value.toLocaleString()}` : 'significant'} opportunity with strong strategic alignment and a win probability of ${tenderData.winProbability || 50}%.`,
          duration: "45 sec",
          visualSuggestion: "Bold title with key metrics displayed prominently, professional corporate design"
        },
        {
          slideNumber: 2,
          title: "Opportunity Highlights",
          content: [
            `Strategic fit with company objectives`,
            `Technical score: ${tenderData.technicalScore || 0}/100`,
            `Compliance score: ${tenderData.complianceScore || 0}/100`,
            `Strong market positioning`,
            `Growth potential and client relationship value`
          ],
          narration: `This opportunity stands out for several reasons. Our technical capabilities align perfectly with the requirements, achieving a score of ${tenderData.technicalScore || 0} out of 100. The compliance requirements are well understood, and we have a strong track record in this area.`,
          duration: "45 sec",
          visualSuggestion: "Icon-based layout showing key strengths, progress bars for scores"
        },
        {
          slideNumber: 3,
          title: "Key Requirements",
          content: [
            "Technical specifications and deliverables",
            "Industry standards and certifications",
            "Quality assurance processes",
            "Timeline and milestone requirements",
            "Team qualifications and experience"
          ],
          narration: "The tender requirements span multiple areas. Technical specifications demand proven expertise and cutting-edge solutions. Compliance with industry standards is mandatory, along with robust quality assurance processes. Meeting the timeline will require careful planning and resource allocation.",
          duration: "45 sec",
          visualSuggestion: "Checklist or requirements matrix, clean and organized layout"
        },
        {
          slideNumber: 4,
          title: "Compliance & Risk Assessment",
          content: [
            `Compliance readiness: ${tenderData.complianceScore || 0}/100`,
            `Risk score: ${tenderData.riskScore || 0}/100`,
            "Mitigation strategies in place",
            "Quality management systems ready",
            "Regulatory requirements understood"
          ],
          narration: `Our compliance assessment shows we are ${tenderData.complianceScore && tenderData.complianceScore >= 70 ? 'well' : 'adequately'} prepared. Key risks have been identified and mitigation strategies developed. Our quality management systems meet all required standards, and we have a strong understanding of regulatory requirements.`,
          duration: "45 sec",
          visualSuggestion: "Split screen showing compliance status and risk heat map"
        },
        {
          slideNumber: 5,
          title: "Win Strategy",
          content: [
            "Leverage technical excellence",
            "Competitive commercial offering",
            "Proven track record and references",
            "Innovation and added value",
            "Strong team and delivery capability"
          ],
          narration: "Our win strategy centers on demonstrating technical excellence, offering competitive pricing, and showcasing our proven track record. We will emphasize innovation and added value, supported by a strong team with relevant experience and successful delivery capability.",
          duration: "45 sec",
          visualSuggestion: "Strategic pillars diagram with icons, professional business graphics"
        },
        {
          slideNumber: 6,
          title: "Next Steps & Recommendation",
          content: [
            "Form dedicated bid team",
            "Conduct detailed requirements analysis",
            "Develop technical solution and approach",
            "Prepare compliance documentation",
            "Submit compelling proposal"
          ],
          narration: `With a win probability of ${tenderData.winProbability || 50}%, we recommend pursuing this opportunity. Immediate next steps include forming a dedicated bid team, conducting detailed analysis, and developing our technical approach. This is a strategic opportunity that aligns with our goals and capabilities.`,
          duration: "45 sec",
          visualSuggestion: "Action timeline or roadmap, clear call-to-action design"
        }
      ]
    };
  }

  // Study tools generation
  async generateStudyTools(tenderData: any): Promise<{
    flashcards: Array<{question: string, answer: string}>;
    quiz: Array<{question: string, options: string[], correct: number}>;
  }> {
    // Get insights to create contextual study materials
    const insights = tenderData.insights || [];
    const documents = tenderData.documents || [];
    
    // Extract actual document content for better context
    const documentContent = documents
      .filter((doc: any) => doc.text && doc.text.length > 100)
      .map((doc: any) => `\n--- ${doc.filename} ---\n${doc.text.substring(0, 3000)}...`)
      .join('\n');
    
    const insightsByType = {
      requirement: insights.filter((i: any) => i.type === 'requirement'),
      compliance: insights.filter((i: any) => i.type === 'compliance'),
      risk: insights.filter((i: any) => i.type === 'risk'),
      deadline: insights.filter((i: any) => i.type === 'deadline'),
    };

    // Build context for AI
    const context = `
Tender: ${tenderData.title}
Value: $${tenderData.value?.toLocaleString() || 'TBD'}
Deadline: ${tenderData.deadline ? new Date(tenderData.deadline).toLocaleDateString() : 'TBD'}
Win Probability: ${tenderData.winProbability}%

Auto-Extracted Information:
- Title: ${tenderData.autoExtractedTitle || 'Not extracted'}
- Budget: ${tenderData.autoExtractedBudget || 'Not extracted'}
- Location: ${tenderData.autoExtractedLocation || 'Not extracted'}
- Submission Deadline: ${tenderData.autoExtractedDeadlines || 'Not extracted'}

Requirements: ${insightsByType.requirement.slice(0, 3).map((i: any) => i.content).join('; ')}
Compliance: ${insightsByType.compliance.slice(0, 3).map((i: any) => i.content).join('; ')}
Risks: ${insightsByType.risk.slice(0, 3).map((i: any) => i.content).join('; ')}

Document Content:
${documentContent || 'No document content available'}
    `.trim();

    const prompt = `Generate study materials for this tender opportunity:

${context}

Create:
1. 8 flashcards: question/answer pairs about key tender concepts
2. 6 multiple choice quiz questions with 4 options each

Make them specific, practical, and test understanding of the actual tender requirements.`;

    const response = await this.callAI(prompt);
    
    return {
      flashcards: this.generateFlashcardsFromData(tenderData, insights, response),
      quiz: this.generateQuizFromData(tenderData, insights, response)
    };
  }

  private generateFlashcardsFromData(tenderData: any, insights: any[], aiResponse: string) {
    const flashcards = [];
    
    // Basic tender info flashcards
    flashcards.push({
      question: `What is the total value of the ${tenderData.title}?`,
      answer: `$${tenderData.value?.toLocaleString() || 'Value not specified'}. This represents the estimated contract value for the project.`
    });

    flashcards.push({
      question: "What is the submission deadline for this tender?",
      answer: tenderData.deadline 
        ? `${new Date(tenderData.deadline).toLocaleDateString()} - approximately ${Math.ceil((new Date(tenderData.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days from now.`
        : "Deadline not specified in the tender documents."
    });

    flashcards.push({
      question: "What is the current win probability assessment?",
      answer: `${tenderData.winProbability}% - ${this.getWinProbabilityText(tenderData.winProbability)}`
    });

    // Insight-based flashcards
    insights.forEach((insight: any, idx: number) => {
      if (flashcards.length >= 8) return;
      
      flashcards.push({
        question: `What ${insight.type} was identified in the tender analysis?`,
        answer: `${insight.content}\n\nSource: ${insight.citation || 'Tender documents'}`
      });
    });

    // Fill remaining with default cards if needed
    while (flashcards.length < 8) {
      flashcards.push({
        question: "What are the key success factors for this tender?",
        answer: "Meeting technical requirements, ensuring compliance, managing risks, and delivering within timeline and budget."
      });
    }

    return flashcards.slice(0, 8);
  }

  private generateQuizFromData(tenderData: any, insights: any[], aiResponse: string) {
    const quiz = [];

    // Quiz about tender value
    quiz.push({
      question: `What is the approximate value of the ${tenderData.title}?`,
      options: [
        `$${Math.floor((tenderData.value || 1000000) * 0.5).toLocaleString()}`,
        `$${(tenderData.value || 1000000).toLocaleString()}`,
        `$${Math.floor((tenderData.value || 1000000) * 1.5).toLocaleString()}`,
        `$${Math.floor((tenderData.value || 1000000) * 2).toLocaleString()}`
      ],
      correct: 1
    });

    // Quiz about win probability
    const winProb = tenderData.winProbability || 50;
    quiz.push({
      question: "What is the assessed win probability for this tender?",
      options: [
        `${Math.max(0, winProb - 20)}%`,
        `${winProb}%`,
        `${Math.min(100, winProb + 20)}%`,
        "Not assessed"
      ],
      correct: 1
    });

    // Quiz about client
    if (tenderData.client) {
      quiz.push({
        question: "Who is the client for this tender opportunity?",
        options: [
          tenderData.client,
          "Private Corporation",
          "Government Agency",
          "Non-Profit Organization"
        ].sort(() => Math.random() - 0.5),
        correct: 0
      });
    }

    // Insight-based questions
    insights.forEach((insight: any) => {
      if (quiz.length >= 6) return;
      
      const types = ["requirement", "compliance", "risk", "deadline"];
      const options = types.map(t => 
        t.charAt(0).toUpperCase() + t.slice(1)
      );
      
      quiz.push({
        question: `What type of insight is this: "${insight.content.substring(0, 60)}..."?`,
        options: options,
        correct: types.indexOf(insight.type)
      });
    });

    // Fill with general questions if needed
    while (quiz.length < 6) {
      quiz.push({
        question: "What is typically the most critical factor in tender success?",
        options: [
          "Lowest price only",
          "Meeting all requirements with competitive pricing",
          "Fastest delivery time",
          "Largest company size"
        ],
        correct: 1
      });
    }

    return quiz.slice(0, 6);
  }

  private getWinProbabilityText(probability: number): string {
    if (probability >= 80) return "High confidence - Strong technical fit and competitive position";
    if (probability >= 60) return "Moderate confidence - Good alignment but some challenges";
    if (probability >= 40) return "Medium risk - Significant gaps or competition concerns";
    return "Low confidence - Major obstacles or misalignment identified";
  }

  // Document retrieval for context
  private async retrieveRelevantDocuments(query: string, tenderId?: string): Promise<Array<{docId: string, filename: string, text: string}>> {
    try {
      const documents = await prisma.document.findMany({
        where: tenderId ? {
          OR: [
            { tenderId, category: 'tender' }, // Tender-specific documents
            { category: 'supporting' },        // Global supporting documents
            { category: 'company' },           // Global company documents
          ]
        } : {},
        take: 5,
        orderBy: { createdAt: 'desc' }
      });

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
