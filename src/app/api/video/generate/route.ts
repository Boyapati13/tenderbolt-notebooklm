import { NextRequest, NextResponse } from 'next/server';
import { videoService, VideoGenerationOptions, VideoSlide } from '@/lib/video-service';

export async function POST(request: NextRequest) {
  try {
    const { 
      slides, 
      tenderId, 
      options 
    }: { 
      slides: VideoSlide[]; 
      tenderId: string; 
      options: VideoGenerationOptions;
    } = await request.json();

    if (!slides || !tenderId) {
      return NextResponse.json(
        { error: 'Slides and tenderId are required' },
        { status: 400 }
      );
    }

    console.log('🎬 Video generation request:', { 
      tenderId, 
      slideCount: slides.length, 
      resolution: options.resolution,
      format: options.format 
    });

    // Check if FFmpeg is available
    const ffmpegAvailable = await videoService.checkFFmpegAvailability();
    if (!ffmpegAvailable) {
      return NextResponse.json(
        { 
          error: 'FFmpeg is not available. Video generation requires FFmpeg to be installed.',
          details: 'Please install FFmpeg and ensure it is available in the system PATH.'
        },
        { status: 503 }
      );
    }

    const videoFile = await videoService.generateVideo(slides, tenderId, options);

    return NextResponse.json({
      success: true,
      videoFile,
      message: 'Video generated successfully'
    });

  } catch (error) {
    console.error('❌ Video generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate video',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tenderId = searchParams.get('tenderId');

    if (!tenderId) {
      return NextResponse.json(
        { error: 'TenderId is required' },
        { status: 400 }
      );
    }

    const videoFiles = await videoService.getVideoFilesByTender(tenderId);
    const ffmpegAvailable = await videoService.checkFFmpegAvailability();

    return NextResponse.json({
      success: true,
      videoFiles,
      ffmpegAvailable
    });

  } catch (error) {
    console.error('❌ Error fetching video files:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch video files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
