import { NextRequest, NextResponse } from 'next/server';
import { 
  generateAudio, 
  generateTwoHostConversation, 
  getAudioFilesByTender, 
  getAvailableVoices,
  AudioGenerationOptions 
} from '@/lib/audio-service';

export async function POST(request: NextRequest) {
  try {
    const { 
      script, 
      tenderId, 
      options 
    }: { 
      script: string; 
      tenderId: string; 
      options: AudioGenerationOptions;
    } = await request.json();

    if (!script || !tenderId) {
      return NextResponse.json(
        { error: 'Script and tenderId are required' },
        { status: 400 }
      );
    }

    console.log('🎵 Audio generation request:', { tenderId, voice: options.voice, twoHostMode: options.twoHostMode });

    let audioFile;
    
    if (options.twoHostMode) {
      audioFile = await generateTwoHostConversation(script, tenderId, options);
    } else {
      audioFile = await generateAudio(script, tenderId, options);
    }

    return NextResponse.json({
      success: true,
      audioFile,
      message: 'Audio generated successfully'
    });

  } catch (error) {
    console.error('❌ Audio generation error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate audio',
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

    const audioFiles = await getAudioFilesByTender(tenderId);
    const voices = await getAvailableVoices();

    return NextResponse.json({
      success: true,
      audioFiles,
      voices
    });

  } catch (error) {
    console.error('❌ Error fetching audio files:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch audio files',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
