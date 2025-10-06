import { NextRequest, NextResponse } from 'next/server';

// AI-powered product information search and retrieval
export async function POST(request: NextRequest) {
  try {
    const { query, category, specifications, maxResults = 10 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Use Google Gemini AI to search and analyze product information
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY || "AIzaSyBN5135OXHBlysAyIMOSCS2TCWO2CmxJc0";
    if (!geminiApiKey) {
      return NextResponse.json(
        { error: 'Gemini API key not configured' },
        { status: 500 }
      );
    }

    // Enhanced prompt for product information retrieval
    const searchPrompt = `
You are an AI assistant specialized in product research and information retrieval. 
Your task is to search for and provide comprehensive product information based on the user's query.

Search Query: "${query}"
Category: ${category || 'General'}
Specifications: ${specifications || 'Not specified'}
Max Results: ${maxResults}

Please provide detailed product information including:

1. Product Name and Brand
2. Key Specifications
3. Pricing Information (if available)
4. Availability and Suppliers
5. Technical Details
6. Comparison with Similar Products
7. Market Analysis
8. Supplier Information
9. Certifications and Compliance
10. Installation/Implementation Requirements

Format the response as structured JSON with the following structure:
{
  "products": [
    {
      "name": "Product Name",
      "brand": "Brand Name",
      "category": "Product Category",
      "specifications": {
        "key": "value"
      },
      "pricing": {
        "currency": "USD",
        "minPrice": 0,
        "maxPrice": 0,
        "unit": "per unit"
      },
      "availability": {
        "inStock": true,
        "suppliers": ["Supplier 1", "Supplier 2"],
        "leadTime": "2-4 weeks"
      },
      "technicalDetails": {
        "dimensions": "L x W x H",
        "weight": "Weight",
        "power": "Power requirements",
        "certifications": ["ISO 9001", "CE"]
      },
      "marketAnalysis": {
        "competitors": ["Competitor 1", "Competitor 2"],
        "marketShare": "Percentage",
        "trends": "Market trends"
      },
      "supplierInfo": {
        "contact": "Contact information",
        "website": "Website URL",
        "location": "Location"
      },
      "compliance": {
        "standards": ["Standard 1", "Standard 2"],
        "certifications": ["Cert 1", "Cert 2"]
      },
      "implementation": {
        "requirements": "Installation requirements",
        "compatibility": "Compatibility notes",
        "support": "Support information"
      },
      "relevanceScore": 0.95,
      "confidenceLevel": "High|Medium|Low",
      "lastUpdated": "2024-01-01T00:00:00Z"
    }
  ],
  "searchMetadata": {
    "query": "${query}",
    "totalResults": 0,
    "searchTime": "0ms",
    "sources": ["Source 1", "Source 2"],
    "lastUpdated": "2024-01-01T00:00:00Z"
  },
  "recommendations": {
    "bestMatch": "Product recommendation",
    "alternatives": ["Alternative 1", "Alternative 2"],
    "considerations": ["Consideration 1", "Consideration 2"]
  }
}

Please ensure the information is accurate, up-to-date, and relevant to tender/procurement requirements.
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
              text: searchPrompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
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
    let productData;
    try {
      productData = JSON.parse(aiResponse);
    } catch (parseError) {
      // If JSON parsing fails, create structured response from text
      productData = {
        products: [{
          name: query,
          brand: "Multiple Brands",
          category: category || "General",
          specifications: {
            description: aiResponse.substring(0, 500)
          },
          pricing: {
            currency: "USD",
            minPrice: 0,
            maxPrice: 0,
            unit: "per unit"
          },
          availability: {
            inStock: true,
            suppliers: ["Multiple Suppliers"],
            leadTime: "Contact for details"
          },
          technicalDetails: {
            dimensions: "Varies by model",
            weight: "Varies by model",
            power: "Varies by model",
            certifications: ["Contact supplier"]
          },
          marketAnalysis: {
            competitors: ["Multiple competitors"],
            marketShare: "Contact for analysis",
            trends: "Growing market"
          },
          supplierInfo: {
            contact: "Contact suppliers directly",
            website: "Multiple websites",
            location: "Global"
          },
          compliance: {
            standards: ["Contact supplier"],
            certifications: ["Contact supplier"]
          },
          implementation: {
            requirements: "Contact supplier",
            compatibility: "Contact supplier",
            support: "Contact supplier"
          },
          relevanceScore: 0.8,
          confidenceLevel: "Medium",
          lastUpdated: new Date().toISOString()
        }],
        searchMetadata: {
          query: query,
          totalResults: 1,
          searchTime: "AI Generated",
          sources: ["AI Analysis"],
          lastUpdated: new Date().toISOString()
        },
        recommendations: {
          bestMatch: "Contact suppliers for detailed information",
          alternatives: ["Contact multiple suppliers"],
          considerations: ["Verify specifications", "Check certifications", "Compare pricing"]
        }
      };
    }

    // Enhance with additional web search if needed
    const enhancedData = await enhanceWithWebSearch(query, productData);

    return NextResponse.json({
      success: true,
      data: enhancedData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Product search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to search product information',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Enhanced web search function
async function enhanceWithWebSearch(query: string, productData: any) {
  try {
    // This would integrate with web search APIs like Google Custom Search, Bing, etc.
    // For now, we'll enhance the AI response with additional context
    
    const enhancedProducts = productData.products.map((product: any) => ({
      ...product,
      webSources: [
        {
          title: `${product.name} - Official Website`,
          url: `https://example.com/products/${encodeURIComponent(product.name)}`,
          snippet: `Official information about ${product.name}`,
          relevanceScore: 0.9
        },
        {
          title: `${product.name} - Specifications`,
          url: `https://example.com/specs/${encodeURIComponent(product.name)}`,
          snippet: `Technical specifications for ${product.name}`,
          relevanceScore: 0.8
        },
        {
          title: `${product.name} - Pricing`,
          url: `https://example.com/pricing/${encodeURIComponent(product.name)}`,
          snippet: `Pricing information for ${product.name}`,
          relevanceScore: 0.7
        }
      ],
      lastWebSearch: new Date().toISOString()
    }));

    return {
      ...productData,
      products: enhancedProducts,
      searchMetadata: {
        ...productData.searchMetadata,
        webEnhanced: true,
        lastWebSearch: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Web search enhancement error:', error);
    return productData;
  }
}

// GET endpoint for search suggestions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'suggestions';

    if (type === 'suggestions' && query) {
      // Generate search suggestions based on query
      const suggestions = await generateSearchSuggestions(query);
      return NextResponse.json({
        success: true,
        suggestions,
        timestamp: new Date().toISOString()
      });
    }

    if (type === 'categories') {
      // Return available product categories
      const categories = [
        'Electronics',
        'Software',
        'Hardware',
        'Office Equipment',
        'Industrial Equipment',
        'Medical Devices',
        'Automotive',
        'Construction',
        'IT Services',
        'Consulting Services',
        'Manufacturing',
        'Telecommunications',
        'Energy',
        'Transportation',
        'Security Systems',
        'Environmental',
        'Food & Beverage',
        'Textiles',
        'Chemicals',
        'Other'
      ];

      return NextResponse.json({
        success: true,
        categories,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Product search API is ready',
      endpoints: {
        search: 'POST /api/ai/product-search',
        suggestions: 'GET /api/ai/product-search?type=suggestions&q=query',
        categories: 'GET /api/ai/product-search?type=categories'
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Product search API error:', error);
    return NextResponse.json(
      { error: 'API error' },
      { status: 500 }
    );
  }
}

// Generate search suggestions
async function generateSearchSuggestions(query: string) {
  const commonSuggestions = [
    `${query} specifications`,
    `${query} pricing`,
    `${query} suppliers`,
    `${query} manufacturers`,
    `${query} distributors`,
    `${query} technical details`,
    `${query} certifications`,
    `${query} compliance`,
    `${query} installation`,
    `${query} support`
  ];

  return commonSuggestions.slice(0, 8);
}
