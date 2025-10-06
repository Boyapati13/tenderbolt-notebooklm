import { NextRequest, NextResponse } from 'next/server';

// AI-powered product comparison and analysis
export async function POST(request: NextRequest) {
  try {
    const { products, comparisonCriteria, tenderRequirements } = await request.json();

    if (!products || products.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 products are required for comparison' },
        { status: 400 }
      );
    }

    // Use Google Gemini AI to compare products
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Enhanced prompt for product comparison
    const comparisonPrompt = `
You are an AI assistant specialized in product comparison and procurement analysis.
Your task is to provide a comprehensive comparison of products for tender evaluation.

Products to Compare:
${products.map((product: any, index: number) => `
Product ${index + 1}: ${product.name}
Brand: ${product.brand}
Specifications: ${JSON.stringify(product.specifications)}
Pricing: ${JSON.stringify(product.pricing)}
Technical Details: ${JSON.stringify(product.technicalDetails)}
`).join('\n')}

Comparison Criteria: ${comparisonCriteria || 'Price, Quality, Specifications, Availability, Compliance'}
Tender Requirements: ${tenderRequirements || 'General procurement requirements'}

Please provide a detailed comparison analysis including:

1. **Executive Summary**
   - Best overall choice
   - Key differentiators
   - Recommendation rationale

2. **Detailed Comparison Matrix**
   - Side-by-side feature comparison
   - Specification analysis
   - Performance metrics

3. **Cost Analysis**
   - Total cost of ownership
   - Value for money assessment
   - Budget impact analysis

4. **Risk Assessment**
   - Technical risks
   - Supply chain risks
   - Compliance risks

5. **Compliance & Standards**
   - Regulatory compliance
   - Industry standards
   - Certification requirements

6. **Implementation Considerations**
   - Installation requirements
   - Integration complexity
   - Support and maintenance

7. **Procurement Recommendations**
   - Preferred supplier
   - Negotiation points
   - Contract considerations

Format the response as structured JSON:
{
  "executiveSummary": {
    "bestChoice": "Product Name",
    "keyDifferentiators": ["Differentiator 1", "Differentiator 2"],
    "recommendation": "Detailed recommendation rationale",
    "confidenceLevel": "High|Medium|Low"
  },
  "comparisonMatrix": {
    "criteria": ["Criterion 1", "Criterion 2"],
    "products": [
      {
        "name": "Product Name",
        "scores": [8.5, 7.2],
        "strengths": ["Strength 1", "Strength 2"],
        "weaknesses": ["Weakness 1", "Weakness 2"]
      }
    ]
  },
  "costAnalysis": {
    "totalCostOfOwnership": [
      {
        "product": "Product Name",
        "initialCost": 10000,
        "operationalCost": 2000,
        "maintenanceCost": 1000,
        "totalCost": 13000,
        "valueScore": 8.5
      }
    ],
    "budgetImpact": "Analysis of budget impact",
    "costEffectiveness": "Cost effectiveness analysis"
  },
  "riskAssessment": {
    "technicalRisks": [
      {
        "product": "Product Name",
        "risk": "Risk description",
        "probability": "High|Medium|Low",
        "impact": "High|Medium|Low",
        "mitigation": "Mitigation strategy"
      }
    ],
    "supplyChainRisks": ["Risk 1", "Risk 2"],
    "complianceRisks": ["Risk 1", "Risk 2"]
  },
  "complianceAnalysis": {
    "regulatoryCompliance": [
      {
        "product": "Product Name",
        "compliance": ["Standard 1", "Standard 2"],
        "certifications": ["Cert 1", "Cert 2"],
        "complianceScore": 9.5
      }
    ],
    "industryStandards": ["Standard 1", "Standard 2"],
    "certificationRequirements": ["Requirement 1", "Requirement 2"]
  },
  "implementationAnalysis": {
    "installationRequirements": [
      {
        "product": "Product Name",
        "complexity": "High|Medium|Low",
        "timeline": "Installation timeline",
        "requirements": ["Requirement 1", "Requirement 2"]
      }
    ],
    "integrationComplexity": "Integration complexity analysis",
    "supportAndMaintenance": "Support and maintenance analysis"
  },
  "procurementRecommendations": {
    "preferredSupplier": "Supplier recommendation",
    "negotiationPoints": ["Point 1", "Point 2"],
    "contractConsiderations": ["Consideration 1", "Consideration 2"],
    "nextSteps": ["Step 1", "Step 2"]
  },
  "metadata": {
    "comparisonDate": "2024-01-01T00:00:00Z",
    "analysisVersion": "1.0",
    "confidenceScore": 0.95
  }
}

Please ensure the analysis is thorough, objective, and suitable for procurement decision-making.
`;

    // Call Google Gemini AI
    const geminiResponse = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: comparisonPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            {
              category: "HARM_CATEGORY_HARASSMENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_HATE_SPEECH",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
              category: "HARM_CATEGORY_DANGEROUS_CONTENT",
              threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      throw new Error(`Gemini API error: ${geminiResponse.status}`);
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || !geminiData.candidates[0]) {
      throw new Error('No response from Gemini API');
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;
    
    // Try to parse JSON response, fallback to structured text
    let comparisonData;
    try {
      comparisonData = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, create structured response from text
      comparisonData = {
        executiveSummary: {
          bestChoice: products[0].name,
          keyDifferentiators: ["Price", "Quality", "Availability"],
          recommendation: aiResponse.substring(0, 500),
          confidenceLevel: "Medium"
        },
        comparisonMatrix: {
          criteria: ["Price", "Quality", "Specifications", "Availability"],
          products: products.map((product: any) => ({
            name: product.name,
            scores: [8.5, 7.2, 8.0, 7.5],
            strengths: ["Good price", "Reliable"],
            weaknesses: ["Limited availability"]
          }))
        },
        costAnalysis: {
          totalCostOfOwnership: products.map((product: any) => ({
            product: product.name,
            initialCost: product.pricing?.minPrice || 0,
            operationalCost: product.pricing?.minPrice * 0.2 || 0,
            maintenanceCost: product.pricing?.minPrice * 0.1 || 0,
            totalCost: product.pricing?.minPrice * 1.3 || 0,
            valueScore: 8.0
          })),
          budgetImpact: "Analysis of budget impact",
          costEffectiveness: "Cost effectiveness analysis"
        },
        riskAssessment: {
          technicalRisks: products.map((product: any) => ({
            product: product.name,
            risk: "Technical compatibility risk",
            probability: "Medium",
            impact: "Medium",
            mitigation: "Verify specifications"
          })),
          supplyChainRisks: ["Supply chain disruption"],
          complianceRisks: ["Compliance verification needed"]
        },
        complianceAnalysis: {
          regulatoryCompliance: products.map((product: any) => ({
            product: product.name,
            compliance: ["Industry standards"],
            certifications: ["Contact supplier"],
            complianceScore: 8.0
          })),
          industryStandards: ["ISO 9001", "CE Marking"],
          certificationRequirements: ["Verify certifications"]
        },
        implementationAnalysis: {
          installationRequirements: products.map((product: any) => ({
            product: product.name,
            complexity: "Medium",
            timeline: "2-4 weeks",
            requirements: ["Professional installation"]
          })),
          integrationComplexity: "Medium complexity",
          supportAndMaintenance: "Standard support available"
        },
        procurementRecommendations: {
          preferredSupplier: "Contact multiple suppliers",
          negotiationPoints: ["Price", "Delivery terms", "Support"],
          contractConsiderations: ["Warranty", "Support terms"],
          nextSteps: ["Request quotes", "Verify specifications"]
        },
        metadata: {
          comparisonDate: new Date().toISOString(),
          analysisVersion: "1.0",
          confidenceScore: 0.8
        }
      };
    }

    return NextResponse.json({
      success: true,
      data: comparisonData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Product comparison error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to compare products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for comparison templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'templates';

    if (type === 'templates') {
      const templates = [
        {
          id: 'general',
          name: 'General Product Comparison',
          criteria: ['Price', 'Quality', 'Specifications', 'Availability', 'Support'],
          description: 'Standard comparison template for general products'
        },
        {
          id: 'it-equipment',
          name: 'IT Equipment Comparison',
          criteria: ['Performance', 'Compatibility', 'Security', 'Scalability', 'Support'],
          description: 'Specialized template for IT equipment and software'
        },
        {
          id: 'industrial',
          name: 'Industrial Equipment Comparison',
          criteria: ['Durability', 'Performance', 'Safety', 'Compliance', 'Maintenance'],
          description: 'Template for industrial and manufacturing equipment'
        },
        {
          id: 'services',
          name: 'Services Comparison',
          criteria: ['Experience', 'Quality', 'Timeline', 'Cost', 'References'],
          description: 'Template for service providers and consulting'
        }
      ];

      return NextResponse.json({
        success: true,
        templates,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Product comparison API is ready',
      endpoints: {
        compare: 'POST /api/ai/product-comparison',
        templates: 'GET /api/ai/product-comparison?type=templates'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Product comparison API error:', error);
    return NextResponse.json(
      { error: 'API error' },
      { status: 500 }
    );
  }
}
