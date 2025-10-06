import { aiService } from './ai-service';
import { prisma } from './prisma';

export interface AutoAnalysisResult {
  metadata: {
    title: string;
    summary: string;
    keyTopics: string[];
    documentType: string;
    complexity: 'beginner' | 'intermediate' | 'advanced';
    estimatedReadingTime: number;
    language: string;
    confidence: number;
  };
  insights: {
    mainPoints: string[];
    keyFindings: string[];
    implications: string[];
    recommendations: string[];
    questions: string[];
  };
  citations: {
    sources: Array<{
      id: string;
      title: string;
      type: string;
      relevance: number;
      excerpt: string;
    }>;
    crossReferences: Array<{
      sourceId: string;
      targetId: string;
      relationship: string;
    }>;
  };
  tags: {
    categories: string[];
    keywords: string[];
    themes: string[];
    industries: string[];
  };
  quality: {
    completeness: number;
    accuracy: number;
    clarity: number;
    structure: number;
    overall: number;
  };
  recommendations: {
    relatedDocuments: string[];
    suggestedActions: string[];
    improvementAreas: string[];
    nextSteps: string[];
  };
}

export class NotebookLMAutoService {
  private static instance: NotebookLMAutoService;

  constructor() {}

  static getInstance(): NotebookLMAutoService {
    if (!NotebookLMAutoService.instance) {
      NotebookLMAutoService.instance = new NotebookLMAutoService();
    }
    return NotebookLMAutoService.instance;
  }

  /**
   * Perform comprehensive automatic analysis of a document
   * Similar to NotebookLM's auto-analysis features
   */
  async analyzeDocument(documentId: string): Promise<AutoAnalysisResult> {
    console.log('🔍 Starting NotebookLM-style auto analysis for document:', documentId);
    
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { tender: true }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const analysisPrompt = `Perform comprehensive automatic analysis of this document in the style of NotebookLM's auto features:

DOCUMENT CONTENT:
${document.text}

DOCUMENT METADATA:
- Filename: ${document.filename}
- Type: ${document.documentType}
- Category: ${document.category}
- Tender: ${document.tender?.title || 'N/A'}

Please provide a comprehensive analysis in this EXACT JSON format:

{
  "metadata": {
    "title": "Extracted or generated title",
    "summary": "Comprehensive 2-3 sentence summary",
    "keyTopics": ["topic1", "topic2", "topic3"],
    "documentType": "contract|proposal|specification|report|other",
    "complexity": "beginner|intermediate|advanced",
    "estimatedReadingTime": 5,
    "language": "en|es|fr|de|other",
    "confidence": 0.95
  },
  "insights": {
    "mainPoints": ["point1", "point2", "point3"],
    "keyFindings": ["finding1", "finding2", "finding3"],
    "implications": ["implication1", "implication2"],
    "recommendations": ["rec1", "rec2", "rec3"],
    "questions": ["question1", "question2", "question3"]
  },
  "citations": {
    "sources": [
      {
        "id": "source1",
        "title": "Source Title",
        "type": "document|reference|standard",
        "relevance": 0.9,
        "excerpt": "Relevant excerpt from source"
      }
    ],
    "crossReferences": [
      {
        "sourceId": "source1",
        "targetId": "target1",
        "relationship": "supports|contradicts|elaborates"
      }
    ]
  },
  "tags": {
    "categories": ["category1", "category2"],
    "keywords": ["keyword1", "keyword2", "keyword3"],
    "themes": ["theme1", "theme2"],
    "industries": ["industry1", "industry2"]
  },
  "quality": {
    "completeness": 0.85,
    "accuracy": 0.90,
    "clarity": 0.80,
    "structure": 0.75,
    "overall": 0.82
  },
  "recommendations": {
    "relatedDocuments": ["doc1", "doc2"],
    "suggestedActions": ["action1", "action2"],
    "improvementAreas": ["area1", "area2"],
    "nextSteps": ["step1", "step2", "step3"]
  }
}

CRITICAL RULES:
- Provide realistic confidence scores (0-1)
- Generate practical, actionable insights
- Focus on tender/procurement context
- Ensure all arrays have meaningful content
- Be specific and detailed in recommendations
- Consider the document's role in tender evaluation`;

    try {
      const response = await aiService.callAI(analysisPrompt, 'You are an expert document analyst specializing in tender and procurement documents. Provide comprehensive, accurate analysis.');
      
      let jsonText = response.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      const analysis = JSON.parse(jsonText);
      
      // Store analysis results in database
      await this.storeAnalysisResults(documentId, analysis);
      
      console.log('✅ Auto analysis completed for document:', documentId);
      return analysis;
      
    } catch (error) {
      console.error('❌ Auto analysis error:', error);
      throw new Error(`Failed to analyze document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Auto-generate insights for a tender based on all documents
   */
  async generateTenderInsights(tenderId: string): Promise<any> {
    console.log('💡 Generating auto insights for tender:', tenderId);
    
    const tender = await prisma.tender.findUnique({
      where: { id: tenderId },
      include: { documents: true }
    });

    if (!tender) {
      throw new Error('Tender not found');
    }

    const documents = tender.documents;
    const documentSummaries = documents.map(doc => 
      `${doc.filename} (${doc.documentType}): ${doc.text.substring(0, 1000)}...`
    ).join('\n\n');

    const insightsPrompt = `Generate comprehensive auto insights for this tender based on all uploaded documents:

TENDER: ${tender.title}
BUDGET: $${tender.budget?.toLocaleString() || 'TBD'}
DEADLINE: ${tender.deadline ? new Date(tender.deadline).toLocaleDateString() : 'TBD'}

DOCUMENTS (${documents.length} total):
${documentSummaries}

Generate insights in this EXACT JSON format:

{
  "executiveSummary": "2-3 sentence overview of the opportunity",
  "keyStrengths": ["strength1", "strength2", "strength3"],
  "potentialChallenges": ["challenge1", "challenge2"],
  "competitiveAdvantages": ["advantage1", "advantage2"],
  "riskFactors": ["risk1", "risk2", "risk3"],
  "opportunities": ["opportunity1", "opportunity2"],
  "recommendedActions": ["action1", "action2", "action3"],
  "successProbability": 0.75,
  "priorityLevel": "high|medium|low",
  "estimatedEffort": "low|medium|high",
  "criticalDeadlines": ["deadline1", "deadline2"],
  "requiredResources": ["resource1", "resource2"],
  "complianceRequirements": ["req1", "req2"],
  "technicalRequirements": ["tech1", "tech2"],
  "financialConsiderations": ["consideration1", "consideration2"]
}

Focus on actionable insights that help with tender evaluation and preparation.`;

    try {
      const response = await aiService.callAI(insightsPrompt, 'You are an expert tender analyst. Provide strategic insights for tender evaluation and preparation.');
      
      let jsonText = response.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      const insights = JSON.parse(jsonText);
      
      // Store insights in database
      await prisma.tender.update({
        where: { id: tenderId },
        data: {
          autoInsights: JSON.stringify(insights),
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Auto insights generated for tender:', tenderId);
      return insights;
      
    } catch (error) {
      console.error('❌ Auto insights error:', error);
      throw new Error(`Failed to generate insights: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Auto-generate questions for document review
   */
  async generateAutoQuestions(documentId: string): Promise<string[]> {
    console.log('❓ Generating auto questions for document:', documentId);
    
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const questionsPrompt = `Generate 5-10 thoughtful questions for reviewing this document in a tender context:

DOCUMENT: ${document.filename}
CONTENT: ${document.text.substring(0, 2000)}...

Generate questions that help with:
- Understanding requirements
- Identifying risks
- Evaluating feasibility
- Assessing compliance
- Planning implementation

Return as a JSON array of strings:
["question1", "question2", "question3", "question4", "question5"]`;

    try {
      const response = await aiService.callAI(questionsPrompt, 'You are an expert tender reviewer. Generate insightful questions for document analysis.');
      
      let jsonText = response.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      const questions = JSON.parse(jsonText);
      
      console.log('✅ Auto questions generated:', questions.length);
      return questions;
      
    } catch (error) {
      console.error('❌ Auto questions error:', error);
      return [
        "What are the main requirements in this document?",
        "What are the potential risks or challenges?",
        "How does this align with our capabilities?",
        "What additional information do we need?",
        "What are the key success factors?"
      ];
    }
  }

  /**
   * Auto-tag and categorize documents
   */
  async autoTagDocument(documentId: string): Promise<any> {
    console.log('🏷️ Auto-tagging document:', documentId);
    
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const taggingPrompt = `Auto-tag and categorize this document for tender management:

DOCUMENT: ${document.filename}
CONTENT: ${document.text.substring(0, 1500)}...

Generate tags in this EXACT JSON format:

{
  "categories": ["technical", "financial", "legal", "commercial"],
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "themes": ["theme1", "theme2"],
  "industries": ["industry1", "industry2"],
  "priority": "high|medium|low",
  "complexity": "beginner|intermediate|advanced",
  "documentType": "specification|contract|proposal|report|other",
  "relevance": 0.85,
  "confidence": 0.90
}

Focus on tender/procurement context and practical categorization.`;

    try {
      const response = await aiService.callAI(taggingPrompt, 'You are an expert document classifier specializing in tender and procurement documents.');
      
      let jsonText = response.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      const tags = JSON.parse(jsonText);
      
      // Update document with tags
      await prisma.document.update({
        where: { id: documentId },
        data: {
          autoTags: JSON.stringify(tags),
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Auto tags generated for document:', documentId);
      return tags;
      
    } catch (error) {
      console.error('❌ Auto tagging error:', error);
      return {
        categories: ['general'],
        keywords: ['tender', 'document'],
        themes: ['procurement'],
        industries: ['general'],
        priority: 'medium',
        complexity: 'intermediate',
        documentType: 'other',
        relevance: 0.5,
        confidence: 0.5
      };
    }
  }

  /**
   * Auto-validate document quality and completeness
   */
  async validateDocument(documentId: string): Promise<any> {
    console.log('✅ Auto-validating document:', documentId);
    
    const document = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!document) {
      throw new Error('Document not found');
    }

    const validationPrompt = `Validate this document for tender submission quality:

DOCUMENT: ${document.filename}
CONTENT: ${document.text.substring(0, 2000)}...

Provide validation in this EXACT JSON format:

{
  "completeness": {
    "score": 0.85,
    "issues": ["missing section1", "incomplete info2"],
    "suggestions": ["add section1", "complete info2"]
  },
  "accuracy": {
    "score": 0.90,
    "issues": ["potential error1"],
    "suggestions": ["verify data1"]
  },
  "clarity": {
    "score": 0.80,
    "issues": ["unclear section1"],
    "suggestions": ["clarify section1"]
  },
  "structure": {
    "score": 0.75,
    "issues": ["poor organization"],
    "suggestions": ["reorganize content"]
  },
  "compliance": {
    "score": 0.88,
    "issues": ["missing requirement1"],
    "suggestions": ["add requirement1"]
  },
  "overall": {
    "score": 0.84,
    "grade": "B+",
    "status": "needs_improvement|good|excellent"
  }
}

Focus on tender submission requirements and best practices.`;

    try {
      const response = await aiService.callAI(validationPrompt, 'You are an expert tender document validator. Assess document quality for submission.');
      
      let jsonText = response.trim();
      if (jsonText.startsWith('```')) {
        jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      }
      
      const validation = JSON.parse(jsonText);
      
      console.log('✅ Auto validation completed for document:', documentId);
      return validation;
      
    } catch (error) {
      console.error('❌ Auto validation error:', error);
      return {
        completeness: { score: 0.5, issues: [], suggestions: [] },
        accuracy: { score: 0.5, issues: [], suggestions: [] },
        clarity: { score: 0.5, issues: [], suggestions: [] },
        structure: { score: 0.5, issues: [], suggestions: [] },
        compliance: { score: 0.5, issues: [], suggestions: [] },
        overall: { score: 0.5, grade: 'C', status: 'needs_improvement' }
      };
    }
  }

  /**
   * Store analysis results in database
   */
  private async storeAnalysisResults(documentId: string, analysis: AutoAnalysisResult): Promise<void> {
    try {
      await prisma.document.update({
        where: { id: documentId },
        data: {
          autoAnalysis: JSON.stringify(analysis),
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Analysis results stored for document:', documentId);
    } catch (error) {
      console.error('❌ Error storing analysis results:', error);
    }
  }

  /**
   * Get auto analysis for a document
   */
  async getDocumentAnalysis(documentId: string): Promise<AutoAnalysisResult | null> {
    try {
      const document = await prisma.document.findUnique({
        where: { id: documentId },
        select: { autoAnalysis: true }
      });

      if (!document || !document.autoAnalysis) {
        return null;
      }

      return JSON.parse(document.autoAnalysis);
    } catch (error) {
      console.error('❌ Error retrieving analysis:', error);
      return null;
    }
  }

  /**
   * Get tender insights
   */
  async getTenderInsights(tenderId: string): Promise<any | null> {
    try {
      const tender = await prisma.tender.findUnique({
        where: { id: tenderId },
        select: { autoInsights: true }
      });

      if (!tender || !tender.autoInsights) {
        return null;
      }

      return JSON.parse(tender.autoInsights);
    } catch (error) {
      console.error('❌ Error retrieving insights:', error);
      return null;
    }
  }
}

export const notebookLMAutoService = NotebookLMAutoService.getInstance();
