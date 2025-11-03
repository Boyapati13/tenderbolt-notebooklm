'use client';

import { NextRequest, NextResponse } from 'next/server';

// AI-powered comprehensive internet search for any information
export async function POST(request: NextRequest) {
  try {
    const {
      query,
      searchType = 'general',
      category = 'all',
      language = 'en',
      region = 'global',
      maxResults = 10,
      includeImages = false,
      includeVideos = false,
      includeNews = false,
      includeAcademic = false,
      timeRange = 'any',
      safeSearch = 'moderate'
    } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    const searchOptions = {
      searchType,
      category,
      language,
      region,
      maxResults,
      includeImages,
      includeVideos,
      includeNews,
      includeAcademic,
      timeRange,
      safeSearch
    };

    // Check for Gemini API key
    const geminiApiKey = process.env.GOOGLE_GEMINI_API_KEY;
    
    // If no API key, perform a basic web search enhancement as a fallback
    if (!geminiApiKey) {
      console.warn('Gemini API key not configured. Falling back to basic web search.');
      const fallbackData = await enhanceWithWebSearch(query, {}, searchOptions);
      return NextResponse.json({
        success: true,
        data: fallbackData,
        timestamp: new Date().toISOString(),
        note: 'AI summary not available. API key not configured.'
      });
    }

    // Enhanced prompt for comprehensive internet search
    const searchPrompt = `
You are an AI assistant specialized in comprehensive internet research and information retrieval.
Your task is to search for and provide detailed information on ANY topic based on the user's query.

Search Query: "${query}"
Search Type: ${searchType}
Category: ${category}
Language: ${language}
Region: ${region}

Please provide a comprehensive summary and a list of relevant sources.
Format the response as structured JSON:
{
  "overview": {
    "summary": "Comprehensive summary of the topic in a few paragraphs."
  },
  "sources": [
    {
      "title": "Source Title",
      "url": "https://example.com",
      "type": "website|news|academic|official",
      "reliability": "High|Medium|Low",
      "snippet": "Brief description of the source.",
      "source": "example.com"
    }
  ]
}

Please ensure the information is accurate, comprehensive, and up-to-date. Include diverse perspectives and authoritative sources.
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
          contents: [{ parts: [{ text: searchPrompt }] }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
          ]
        })
      }
    );

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(`Gemini API error: ${geminiResponse.status} ${errorBody}`);
    }

    const geminiData = await geminiResponse.json();
    
    if (!geminiData.candidates || !geminiData.candidates[0]) {
      throw new Error('No valid response from Gemini API');
    }

    const aiResponse = geminiData.candidates[0].content.parts[0].text;
    
    let cleanedResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    let searchData;
    try {
      searchData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error("Failed to parse AI JSON response:", cleanedResponse);
      // If parsing fails, create a structured response from the raw text
      searchData = {
        overview: {
          summary: `The AI returned information, but it was not in the expected JSON format. Raw response: ${cleanedResponse}`
        },
        sources: []
      };
    }

    // Enhance with additional web search links
    const enhancedData = await enhanceWithWebSearch(query, searchData, searchOptions);

    return NextResponse.json({
      success: true,
      data: enhancedData,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Internet search error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to perform internet search',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Enhanced web search function to add standard search links
async function enhanceWithWebSearch(query: string, searchData: any, options: any) {
  const baseSources = searchData.sources || [];
  
  const standardSearchLinks = [
    {
      title: `${query} - Wikipedia`,
      url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}`,
      type: "encyclopedia",
      reliability: "High",
      snippet: `Search for a comprehensive encyclopedia article about "${query}" on Wikipedia.`,
      source: 'en.wikipedia.org'
    },
    {
      title: `${query} - Google News`,
      url: `https://news.google.com/search?q=${encodeURIComponent(query)}`,
      type: "news",
      reliability: "Medium",
      snippet: `Find the latest news and articles about "${query}" from various sources.`,
      source: 'news.google.com'
    },
    {
      title: `${query} - Academic Papers`,
      url: `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`,
      type: "academic",
      reliability: "High",
      snippet: `Explore academic papers, research, and scholarly articles related to "${query}".`,
      source: 'scholar.google.com'
    }
  ];

  // Combine AI-found sources with standard links, avoiding duplicates
  const finalSources = [...baseSources];
  standardSearchLinks.forEach(stdLink => {
    if (!finalSources.some(src => src.url === stdLink.url)) {
      finalSources.push(stdLink);
    }
  });

  return {
    ...searchData,
    sources: finalSources,
    searchMetadata: {
      ...(searchData.searchMetadata || {}),
      webEnhanced: true,
      lastWebSearch: new Date().toISOString(),
      searchOptions: options
    }
  };
}

// GET endpoint for metadata - remains unchanged
export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'AI Internet Search API is ready',
    endpoints: {
      search: 'POST /api/ai/internet-search'
    },
    timestamp: new Date().toISOString()
  });
}
