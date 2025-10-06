import { aiService } from "./ai-service";
import { prisma } from "./prisma";

interface TenderMetadata {
  title?: string;
  budget?: string;
  location?: string;
  deadlines?: string[];
  requirements?: string[];
}

export const autoExtractService = {
  /**
   * Extract key metadata from tender document text
   */
  async extractTenderMetadata(text: string): Promise<TenderMetadata> {
    console.log("🔍 Extracting tender metadata with AI...");
    console.log("📄 Document text length:", text.length);
    console.log("📄 First 500 characters:", text.substring(0, 500));
    
    const prompt = `You are an expert tender analyst. Analyze this tender document and extract ONLY the information that is explicitly stated in the document. Do NOT make assumptions or invent information.

Extract the following information in JSON format:

{
  "title": "The exact, complete tender title as stated in the document",
  "budget": "The exact budget amount with currency as stated in the document (e.g., '€632,000 excluding VAT' or 'KES 5,000,000')",
  "location": "The exact project location or delivery location as stated in the document",
  "deadlines": ["The exact tender submission deadline as stated in the document - ONLY the deadline for submitting the tender/bid/proposal"],
  "requirements": ["Key requirements, qualifications, or deliverables as explicitly stated in the document"]
}

CRITICAL RULES:
- Extract ONLY information that is explicitly written in the document
- Use EXACT wording from the document - do not paraphrase or summarize
- If a field is not clearly stated in the document, omit it from the JSON
- For budget: include the exact currency symbol/code and amount as written
- For deadlines: ONLY include the deadline for SUBMITTING the tender/bid/proposal - ignore project milestones, delivery dates, or implementation timelines
- For requirements: list only the most important requirements as explicitly stated
- Return ONLY valid JSON, no markdown formatting, no explanations

DOCUMENT TEXT TO ANALYZE:
${text.substring(0, 20000)}`;

    try {
      const result = await aiService.callAI(prompt, "You are an expert tender analyst. Extract only explicit information from documents.");
      
      console.log("🤖 AI Response:", result);
      
      // Parse JSON from response
      let jsonText = result.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      const metadata = JSON.parse(jsonText);
      console.log("✅ Metadata extracted:", Object.keys(metadata).join(", "));
      console.log("📊 Extracted metadata:", JSON.stringify(metadata, null, 2));
      
      // Post-process deadlines to extract only submission deadline
      if (metadata.deadlines && Array.isArray(metadata.deadlines)) {
        // Filter to get only the submission deadline
        const submissionDeadline = metadata.deadlines.find((d: string) => 
          d.toLowerCase().includes('submission') || 
          d.toLowerCase().includes('submit tender') ||
          d.toLowerCase().includes('bid submission')
        );
        
        if (submissionDeadline) {
          // Extract just the date/time, remove any extra text
          const cleanedDeadline = submissionDeadline
            .replace(/deadline for submission of tenders:?/gi, '')
            .replace(/submission deadline:?/gi, '')
            .replace(/tender submission:?/gi, '')
            .trim();
          metadata.deadlines = [cleanedDeadline];
        } else if (metadata.deadlines.length > 0) {
          // If we can't identify it, take the first one but clean it
          metadata.deadlines = [metadata.deadlines[0].trim()];
        }
      }
      
      return metadata;
    } catch (error) {
      console.error("❌ Metadata extraction error:", error);
      return {};
    }
  },

  /**
   * Generate a summary of the document
   */
  async generateSummary(text: string, filename: string): Promise<string> {
    console.log(`📝 Generating summary for ${filename}...`);
    
    const prompt = `Create a concise 2-3 paragraph summary of this document. Focus on:
- What is being requested/procured
- Key requirements and qualifications
- Important deadlines and submission details
- Budget/value if mentioned

Keep it professional and informative.

DOCUMENT:
${text.substring(0, 10000)}`;

    try {
      const result = await aiService.chatWithDocuments([
        { role: "user", content: prompt }
      ]);
      console.log(`✅ Summary generated (${result.reply.length} chars)`);
      return result.reply;
    } catch (error) {
      console.error("❌ Summary generation error:", error);
      return "Summary generation failed.";
    }
  },

  /**
   * Calculate winning capabilities and probability based on company documents vs tender requirements
   */
  async calculateWinningCapabilities(tenderId: string, requirements: string[]): Promise<{
    winningProbability: number;
    capabilityScore: number;
    matchedRequirements: number;
    totalRequirements: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  }> {
    console.log("🎯 Calculating winning capabilities...");
    
    // Get company documents (supporting documents) - these are global
    const companyDocs = await prisma.document.findMany({
      where: {
        OR: [
          { category: 'supporting' },
          { category: 'company' }
        ]
      },
      select: { filename: true, text: true, documentType: true, category: true }
    });

    if (companyDocs.length === 0) {
      console.log("⚠️  No company documents found for capability analysis");
      return {
        winningProbability: 0,
        capabilityScore: 0,
        matchedRequirements: 0,
        totalRequirements: requirements.length,
        strengths: [],
        weaknesses: requirements,
        recommendations: ["Upload company registration, ISO certificates, and other supporting documents to assess capabilities."]
      };
    }

    const companyInfo = companyDocs.map(doc => 
      `${doc.documentType || doc.filename} (${doc.category}):\n${doc.text.substring(0, 2000)}`
    ).join("\n\n---\n\n");

    const prompt = `Analyze our company's capability to win this tender by comparing our documents against the requirements.

TENDER REQUIREMENTS:
${requirements.map((req, i) => `${i + 1}. ${req}`).join("\n")}

OUR COMPANY DOCUMENTS:
${companyInfo}

Provide a detailed capability analysis in this EXACT JSON format:

{
  "capabilityScore": 85,
  "matchedRequirements": 8,
  "totalRequirements": 10,
  "winningProbability": 75,
  "strengths": [
    "Strong technical expertise in React.js development",
    "Proven track record with educational software",
    "ISO 27001 certification for data security"
  ],
  "weaknesses": [
    "Limited experience with Flutter mobile development",
    "No previous work with FERPA compliance"
  ],
  "recommendations": [
    "Partner with a Flutter developer for mobile app",
    "Obtain FERPA compliance training and certification",
    "Highlight similar educational projects in proposal"
  ]
}

CRITICAL RULES:
- capabilityScore: 0-100 (how well we match overall)
- matchedRequirements: number of requirements we clearly meet
- totalRequirements: total number of requirements
- winningProbability: 0-100 (realistic chance of winning)
- Be specific and reference actual document content
- Consider both technical and business requirements
- Factor in experience, certifications, and past performance
- Be realistic about gaps and challenges`;

    try {
      const result = await aiService.callAI(prompt, "You are an expert tender analyst. Analyze capabilities objectively and provide realistic assessments.");
      
      console.log("🤖 AI Capability Analysis Response:", result);
      
      // Parse JSON from response
      let jsonText = result.trim();
      
      // Remove markdown code blocks if present
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      const analysis = JSON.parse(jsonText);
      console.log("✅ Capability analysis complete:", analysis);
      
      return {
        winningProbability: Math.min(100, Math.max(0, analysis.winningProbability || 0)),
        capabilityScore: Math.min(100, Math.max(0, analysis.capabilityScore || 0)),
        matchedRequirements: analysis.matchedRequirements || 0,
        totalRequirements: analysis.totalRequirements || requirements.length,
        strengths: analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || []
      };
    } catch (error) {
      console.error("❌ Capability analysis error:", error);
      return {
        winningProbability: 0,
        capabilityScore: 0,
        matchedRequirements: 0,
        totalRequirements: requirements.length,
        strengths: [],
        weaknesses: requirements,
        recommendations: ["Capability analysis failed. Please try again."]
      };
    }
  },

  /**
   * Perform gap analysis comparing tender requirements with company capabilities
   */
  async performGapAnalysis(tenderId: string, requirements: string[]): Promise<string> {
    console.log("📊 Performing gap analysis...");
    
    // Get company documents (supporting documents) - these are global
    const companyDocs = await prisma.document.findMany({
      where: {
        OR: [
          { category: 'supporting' },
          { category: 'company' }
        ]
      },
      select: { filename: true, text: true, documentType: true }
    });

    if (companyDocs.length === 0) {
      console.log("⚠️  No company documents found for gap analysis");
      return "Upload company registration, ISO certificates, and other supporting documents to see how your company meets tender requirements.";
    }

    const companyInfo = companyDocs.map(doc => 
      `${doc.documentType || doc.filename}:\n${doc.text.substring(0, 2000)}`
    ).join("\n\n---\n\n");

    const prompt = `Analyze how our company meets these tender requirements:

TENDER REQUIREMENTS:
${requirements.map((req, i) => `${i + 1}. ${req}`).join("\n")}

OUR COMPANY DOCUMENTS:
${companyInfo}

Provide a gap analysis in this format:

✅ REQUIREMENTS WE MEET:
- [Requirement]: [How we meet it based on our documents]

⚠️ GAPS/MISSING:
- [Requirement]: [What we need to provide or improve]

📋 RECOMMENDATIONS:
- [Actionable steps to address gaps]

Be specific and reference our actual documents.`;

    try {
      const result = await aiService.chatWithDocuments([
        { role: "user", content: prompt }
      ]);
      console.log("✅ Gap analysis complete");
      return result.reply;
    } catch (error) {
      console.error("❌ Gap analysis error:", error);
      return "Gap analysis failed. Please try again.";
    }
  },

  /**
   * Update tender record with extracted metadata
   */
  async updateTenderWithMetadata(tenderId: string, metadata: TenderMetadata): Promise<void> {
    console.log("💾 Updating tender with extracted metadata...");
    
    const updateData: any = {};
    
    if (metadata.title) {
      updateData.autoExtractedTitle = metadata.title;
      // Also update main title if not already set
      const tender = await prisma.tender.findUnique({ where: { id: tenderId } });
      if (!tender?.title || tender.title === "Default Tender") {
        updateData.title = metadata.title;
      }
    }
    
    if (metadata.budget) updateData.autoExtractedBudget = metadata.budget;
    if (metadata.location) updateData.autoExtractedLocation = metadata.location;
    if (metadata.deadlines && metadata.deadlines.length > 0) {
      updateData.autoExtractedDeadlines = metadata.deadlines.join(" | ");
      // Try to parse first deadline, but don't fail if it's not a valid date
      try {
        const firstDeadline = new Date(metadata.deadlines[0]);
        if (!isNaN(firstDeadline.getTime())) {
          updateData.deadline = firstDeadline;
        }
      } catch {
        // Skip deadline if parsing fails
      }
    }
    
    if (Object.keys(updateData).length > 0) {
      await prisma.tender.update({
        where: { id: tenderId },
        data: updateData
      });
      console.log("✅ Tender updated with:", Object.keys(updateData).join(", "));
    }
  }
};
