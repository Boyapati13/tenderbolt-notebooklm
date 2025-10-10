import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { tenderId, style, interactiveMode } = await request.json();

    if (!tenderId) {
      return NextResponse.json(
        { error: 'TenderId is required' },
        { status: 400 }
      );
    }

    console.log('🎵 Generating audio script:', { tenderId, style, interactiveMode });

    // Get tender data - use localhost for development
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${process.env.PORT || 3000}`;
    const tenderResponse = await fetch(`${baseUrl}/api/tenders/${tenderId}`);
    const tenderData = await tenderResponse.json();

    if (!tenderData.tender) {
      return NextResponse.json(
        { error: 'Tender not found' },
        { status: 404 }
      );
    }

    const tender = tenderData.tender;

    // Generate audio script based on style
    const audioScript = await generateAudioScript(tender, style, interactiveMode);

    return NextResponse.json({
      success: true,
      audioScript
    });

  } catch (error) {
    console.error('❌ Audio script generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate audio script',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function generateAudioScript(tender: any, style: string, interactiveMode: string) {
  const basePrompt = `Generate an interactive audio discussion script for this tender opportunity. Create a conversational Q&A format that's perfect for audio delivery with natural dialogue flow.

Tender Details:
- Title: ${tender.title || 'Educational Software Platform Development'}
- Value: $${tender.budget || '1,200,000'}
- Deadline: ${tender.deadline || 'March 15, 2025'}
- Location: ${tender.location || 'Remote'}
- Description: ${tender.description || 'Development of an educational software platform'}

Style: ${style}
Interactive Mode: ${interactiveMode}

Create an engaging discussion format with:`;

  let styleInstructions = '';
  let duration = '';
  let wordCount = 0;
  let speakingRate = 150;
  let complexity = 'intermediate';
  let tone = 'professional';

  switch (style) {
    case 'brief':
      styleInstructions = `
- Create a quick Q&A discussion (2-3 minutes)
- Use "Question" and "Answer" format
- Focus on essential information only
- Include: "What is this project about?", "What's the budget?", "When is the deadline?"
- End with "What should we do next?"`;
      duration = '~2-3 min';
      wordCount = 300;
      speakingRate = 160;
      complexity = 'beginner';
      tone = 'direct';
      break;

    case 'deep-dive':
      styleInstructions = `
- Create comprehensive Q&A analysis (8-12 minutes)
- Use "Question" and "Detailed Answer" format
- Include probing questions like "What are the technical challenges?", "How do we compare to competitors?"
- Cover requirements, risks, opportunities, strategy
- Use analytical, expert tone`;
      duration = '~8-12 min';
      wordCount = 1200;
      speakingRate = 140;
      complexity = 'advanced';
      tone = 'authoritative';
      break;

    case 'podcast':
      styleInstructions = `
- Create conversational dialogue between two hosts
- Use "Host A" and "Host B" format with natural questions
- Include banter like "That's interesting, tell me more about..."
- Make it engaging with questions like "What do you think about the timeline?"
- Use casual, friendly tone with natural interruptions`;
      duration = '~6-8 min';
      wordCount = 800;
      speakingRate = 150;
      complexity = 'intermediate';
      tone = 'conversational';
      break;

    case 'presentation':
      styleInstructions = `
- Structure as Q&A presentation format
- Use "Question" and "Answer" with data points
- Include questions like "What are the key metrics?", "How do we measure success?"
- Use professional business language
- End with "What are our next steps?"`;
      duration = '~5-7 min';
      wordCount = 700;
      speakingRate = 145;
      complexity = 'intermediate';
      tone = 'professional';
      break;

    case 'interview':
      styleInstructions = `
- Format as expert interview with Q&A
- Use "Interviewer" and "Expert" roles
- Include probing questions like "Can you elaborate on...?", "What are the main challenges?"
- Cover challenges, opportunities, insights
- Use engaging, questioning tone`;
      duration = '~7-10 min';
      wordCount = 900;
      speakingRate = 150;
      complexity = 'intermediate';
      tone = 'engaging';
      break;

    case 'conversational':
      styleInstructions = `
- Create natural Q&A discussion
- Use "Question" and "Answer" with personal insights
- Include questions like "What's your take on this?", "How do you see this working?"
- Make it feel like a friendly discussion
- Use warm, approachable tone`;
      duration = '~5-8 min';
      wordCount = 750;
      speakingRate = 155;
      complexity = 'intermediate';
      tone = 'conversational';
      break;

    case 'interactive':
      styleInstructions = `
- Create interactive Q&A experience
- Use "Question" and "Answer" with listener engagement
- Include questions like "What do you think?", "Have you considered...?"
- Provide pause points for reflection
- Use engaging, interactive tone`;
      duration = '~6-9 min';
      wordCount = 850;
      speakingRate = 150;
      complexity = 'intermediate';
      tone = 'engaging';
      break;

    default:
      styleInstructions = `
- Create professional Q&A format
- Use "Question" and "Answer" structure
- Include all key information
- Use appropriate tone for business context`;
      duration = '~5-7 min';
      wordCount = 700;
      speakingRate = 150;
      complexity = 'intermediate';
      tone = 'professional';
  }

  const fullPrompt = `${basePrompt}
${styleInstructions}

IMPORTANT: Create an interactive Q&A discussion format that's perfect for audio delivery. Use natural dialogue with questions and answers that flow conversationally.

Format the response as a JSON object with this structure:
{
  "title": "Audio Discussion: [Tender Title]",
  "script": "The complete Q&A discussion script here...",
  "sections": [
    {
      "speaker": "Questioner" or "Expert" or "Host A" (depending on style),
      "timestamp": "00:00",
      "text": "Question or answer text...",
      "duration": 30
    }
  ],
  "metadata": {
    "wordCount": ${wordCount},
    "speakingRate": ${speakingRate},
    "complexity": "${complexity}",
    "tone": "${tone}",
    "format": "Q&A Discussion"
  }
}

The script should be:
- In Q&A format with natural questions and answers
- Optimized for text-to-speech conversion
- Use conversational language that sounds natural when spoken
- Include natural pauses and rhythm
- Have engaging transitions between questions
- Be clear and easy to follow
- Include appropriate emphasis and pacing
- Sound like a real conversation or interview

Examples of good Q&A format:
- "So, what exactly is this project about?"
- "That's interesting! What's the budget for this initiative?"
- "Great question! The deadline is March 15th, which gives us..."
- "What do you think are the main challenges we'll face?"

Make sure the script flows naturally and sounds engaging when converted to audio.`;

  try {
    const response = await aiService.callAI(fullPrompt, 'You are a professional audio script writer specializing in business and tender content.');
    
    // Parse the AI response
    let jsonText = response.trim();
    
    // Remove markdown code blocks
    if (jsonText.includes('```json')) {
      const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1].trim();
      }
    } else if (jsonText.includes('```')) {
      const codeMatch = jsonText.match(/```\s*([\s\S]*?)\s*```/);
      if (codeMatch) {
        jsonText = codeMatch[1].trim();
      }
    }

    // Clean up any remaining backticks
    jsonText = jsonText.replace(/^`+|`+$/g, '').trim();

    let audioScript;
    try {
      audioScript = JSON.parse(jsonText);
    } catch (error) {
      console.error('JSON parsing error:', error);
      console.error('Raw response:', response);
      console.error('Cleaned JSON:', jsonText);
      
      // Fallback: create a basic script structure
      audioScript = {
        title: `${tender.title} - Audio Overview`,
        script: `Welcome to this audio overview of ${tender.title}. This tender opportunity presents significant potential for qualified contractors. Let's explore the key requirements and opportunities.`,
        sections: [
          {
            speaker: "Host 1",
            timestamp: "0:00",
            text: `Welcome to this audio overview of ${tender.title}.`,
            duration: 5
          },
          {
            speaker: "Host 2", 
            timestamp: "0:05",
            text: "This tender opportunity presents significant potential for qualified contractors.",
            duration: 6
          }
        ],
        metadata: {
          wordCount: 50,
          speakingRate: 150,
          complexity: "intermediate",
          tone: "professional"
        }
      };
    }
    
    return {
      style,
      title: audioScript.title || `${tender.title} - Audio Overview`,
      duration,
      script: audioScript.script || 'Script generation failed',
      sections: audioScript.sections || [],
      metadata: {
        wordCount: audioScript.metadata?.wordCount || wordCount,
        speakingRate: audioScript.metadata?.speakingRate || speakingRate,
        complexity: audioScript.metadata?.complexity || complexity,
        tone: audioScript.metadata?.tone || tone
      }
    };

  } catch (error) {
    console.error('❌ Error generating audio script:', error);
    
    // Return fallback script
    return {
      style,
      title: `${tender.title} - Audio Overview`,
      duration,
      script: `Welcome to this audio overview of the ${tender.title} tender opportunity. This project has a budget of $${tender.budget || '1,200,000'} and a deadline of ${tender.deadline || 'March 15, 2025'}. The project involves ${tender.description || 'development of an educational software platform'}. This is a significant opportunity that requires careful analysis and strategic planning.`,
      sections: [
        {
          speaker: 'Narrator',
          timestamp: '00:00',
          text: `Welcome to this audio overview of the ${tender.title} tender opportunity.`,
          duration: 10
        },
        {
          speaker: 'Narrator',
          timestamp: '00:10',
          text: `This project has a budget of $${tender.budget || '1,200,000'} and a deadline of ${tender.deadline || 'March 15, 2025'}.`,
          duration: 15
        },
        {
          speaker: 'Narrator',
          timestamp: '00:25',
          text: `The project involves ${tender.description || 'development of an educational software platform'}.`,
          duration: 12
        },
        {
          speaker: 'Narrator',
          timestamp: '00:37',
          text: 'This is a significant opportunity that requires careful analysis and strategic planning.',
          duration: 8
        }
      ],
      metadata: {
        wordCount,
        speakingRate,
        complexity,
        tone
      }
    };
  }
}