import { NextRequest, NextResponse } from 'next/server';
import { aiService } from '@/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const { tenderId, theme, interactiveMode } = await request.json();

    if (!tenderId) {
      return NextResponse.json(
        { error: 'TenderId is required' },
        { status: 400 }
      );
    }

    console.log('🎬 Generating video script:', { tenderId, theme, interactiveMode });

    // Get tender data
    const tenderResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tenders/${tenderId}`);
    const tenderData = await tenderResponse.json();

    if (!tenderData.tender) {
      return NextResponse.json(
        { error: 'Tender not found' },
        { status: 404 }
      );
    }

    const tender = tenderData.tender;

    // Generate video script based on theme
    const videoScript = await generateVideoScript(tender, theme, interactiveMode);

    return NextResponse.json({
      success: true,
      videoScript
    });

  } catch (error) {
    console.error('❌ Video script generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate video script',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function generateVideoScript(tender: any, theme: string, interactiveMode: string) {
  const basePrompt = `Generate a video script for this tender opportunity. Create engaging slides with visual suggestions and narration.

Tender Details:
- Title: ${tender.title || 'Educational Software Platform Development'}
- Value: $${tender.budget || '1,200,000'}
- Deadline: ${tender.deadline || 'March 15, 2025'}
- Location: ${tender.location || 'Remote'}
- Description: ${tender.description || 'Development of an educational software platform'}

Theme: ${theme}
Interactive Mode: ${interactiveMode}

Please generate a video script with 5-8 slides that:`;

  let themeInstructions = '';
  let slideCount = 6;
  let totalDuration = 0;

  switch (theme) {
    case 'modern':
      themeInstructions = `
- Use modern, clean design with bold typography
- Include data visualizations and infographics
- Use vibrant colors and gradients
- Focus on innovation and technology
- Include animated elements suggestions`;
      slideCount = 6;
      totalDuration = 300; // 5 minutes
      break;

    case 'corporate':
      themeInstructions = `
- Use professional, business-focused design
- Include charts, graphs, and data points
- Use corporate color schemes (blues, grays)
- Focus on ROI, benefits, and outcomes
- Include executive summary elements`;
      slideCount = 7;
      totalDuration = 420; // 7 minutes
      break;

    case 'creative':
      themeInstructions = `
- Use creative, artistic design elements
- Include illustrations and custom graphics
- Use bold, creative color schemes
- Focus on storytelling and engagement
- Include interactive elements suggestions`;
      slideCount = 8;
      totalDuration = 480; // 8 minutes
      break;

    case 'academic':
      themeInstructions = `
- Use scholarly, research-focused design
- Include detailed analysis and citations
- Use academic color schemes
- Focus on methodology and findings
- Include reference materials`;
      slideCount = 8;
      totalDuration = 600; // 10 minutes
      break;

    case 'minimal':
      themeInstructions = `
- Use clean, minimal design
- Focus on essential information only
- Use simple color palettes
- Emphasize white space and typography
- Keep content concise and clear`;
      slideCount = 5;
      totalDuration = 240; // 4 minutes
      break;

    case 'classic':
      themeInstructions = `
- Use traditional, timeless design
- Include formal presentation elements
- Use classic color schemes
- Focus on professionalism and reliability
- Include traditional business elements`;
      slideCount = 6;
      totalDuration = 360; // 6 minutes
      break;

    default:
      themeInstructions = `
- Use balanced, professional design
- Include relevant visual elements
- Use appropriate color schemes
- Focus on clear communication
- Include engaging content`;
      slideCount = 6;
      totalDuration = 360; // 6 minutes
  }

  const fullPrompt = `${basePrompt}
${themeInstructions}

Create ${slideCount} slides with the following structure:
1. Title slide with project overview
2. Problem/opportunity analysis
3. Solution approach
4. Technical requirements
5. Timeline and milestones
6. Budget and resources
7. Risk assessment (if needed)
8. Next steps and call to action (if needed)

For each slide, include:
- Compelling title
- Key content points (3-5 bullet points)
- Detailed narration script
- Visual suggestions (charts, images, icons)
- Slide type and design theme
- Duration (30-90 seconds per slide)

Format the response as a JSON object with this structure:
{
  "title": "Video Script Title",
  "totalDuration": "${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Slide Title",
      "content": ["Point 1", "Point 2", "Point 3"],
      "narration": "Detailed narration script for this slide...",
      "duration": "0:45",
      "visualSuggestion": "Use a large title with background image of...",
      "slideType": "title",
      "designTheme": "${theme}",
      "colorScheme": "blue",
      "layout": "centered",
      "visualElements": {
        "charts": [{"type": "pie", "data": {}}],
        "images": [{"src": "placeholder", "alt": "Description", "position": "background"}],
        "icons": [{"name": "target", "size": "large", "color": "blue"}]
      }
    }
  ],
  "metadata": {
    "slideCount": ${slideCount},
    "averageSlideDuration": ${Math.floor(totalDuration / slideCount)},
    "complexity": "intermediate",
    "style": "${theme}",
    "targetAudience": "stakeholders"
  }
}`;

  try {
    const response = await aiService.callAI(fullPrompt, 'You are a professional video script writer specializing in business presentations and tender proposals.');
    
    // Parse the AI response
    let jsonText = response.trim();
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const videoScript = JSON.parse(jsonText);
    
    return {
      title: videoScript.title || `${tender.title} - Video Presentation`,
      totalDuration: videoScript.totalDuration || `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}`,
      slides: videoScript.slides || [],
      metadata: {
        slideCount: videoScript.metadata?.slideCount || slideCount,
        averageSlideDuration: videoScript.metadata?.averageSlideDuration || Math.floor(totalDuration / slideCount),
        complexity: videoScript.metadata?.complexity || 'intermediate',
        style: videoScript.metadata?.style || theme,
        targetAudience: videoScript.metadata?.targetAudience || 'stakeholders'
      }
    };

  } catch (error) {
    console.error('❌ Error generating video script:', error);
    
    // Return fallback script
    return {
      title: `${tender.title} - Video Presentation`,
      totalDuration: `${Math.floor(totalDuration / 60)}:${(totalDuration % 60).toString().padStart(2, '0')}`,
      slides: [
        {
          slideNumber: 1,
          title: `Project Overview: ${tender.title}`,
          content: [
            `Budget: $${tender.budget || '1,200,000'}`,
            `Deadline: ${tender.deadline || 'March 15, 2025'}`,
            `Location: ${tender.location || 'Remote'}`
          ],
          narration: `Welcome to this presentation about the ${tender.title} project. This is a significant opportunity with a budget of $${tender.budget || '1,200,000'} and a deadline of ${tender.deadline || 'March 15, 2025'}.`,
          duration: '0:30',
          visualSuggestion: 'Use a professional title slide with project branding',
          slideType: 'title',
          designTheme: theme,
          colorScheme: 'blue',
          layout: 'centered',
          visualElements: {
            charts: [],
            images: [{ src: 'placeholder', alt: 'Project overview', position: 'background' }],
            icons: [{ name: 'target', size: 'large', color: 'blue' }]
          }
        },
        {
          slideNumber: 2,
          title: 'Project Requirements',
          content: [
            'Technical specifications',
            'Compliance requirements',
            'Timeline constraints',
            'Resource allocation'
          ],
          narration: 'Let\'s examine the key requirements for this project, including technical specifications, compliance needs, and timeline constraints.',
          duration: '0:45',
          visualSuggestion: 'Use a checklist or requirements diagram',
          slideType: 'content',
          designTheme: theme,
          colorScheme: 'green',
          layout: 'left-aligned',
          visualElements: {
            charts: [{ type: 'bar', data: {} }],
            images: [],
            icons: [{ name: 'checklist', size: 'medium', color: 'green' }]
          }
        }
      ],
      metadata: {
        slideCount: 2,
        averageSlideDuration: Math.floor(totalDuration / 2),
        complexity: 'intermediate',
        style: theme,
        targetAudience: 'stakeholders'
      }
    };
  }
}