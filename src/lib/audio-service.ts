'use server';

import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Initialize the TTS client (optional)
let ttsClient: TextToSpeechClient | null = null;

try {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT) {
    ttsClient = new TextToSpeechClient({
      keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    });
    console.log('✅ Google Cloud TTS client initialized');
  } else {
    console.log('⚠️ Google Cloud TTS not configured - using fallback mode');
  }
} catch (error) {
  console.log('⚠️ Google Cloud TTS initialization failed - using fallback mode:', error);
}

export interface AudioFile {
  id: string;
  tenderId: string;
  scriptId: string;
  voice: string;
  format: 'mp3' | 'wav' | 'ogg';
  fileUrl: string;
  duration: number;
  fileSize: number;
  createdAt: Date;
}

export interface VoiceOption {
  name: string;
  languageCode: string;
  ssmlGender: 'MALE' | 'FEMALE' | 'NEUTRAL';
  description: string;
  preview?: string;
}

export interface AudioGenerationOptions {
  voice: string;
  speed: number;
  pitch: number;
  volume: number;
  format: 'mp3' | 'wav' | 'ogg';
  twoHostMode: boolean;
  host1Voice?: string;
  host2Voice?: string;
}

// Fallback voices for when TTS client is not available
const fallbackVoices: VoiceOption[] = [
  {
    name: 'en-US-Standard-A',
    languageCode: 'en-US',
    ssmlGender: 'FEMALE',
    description: 'American English - Female (Standard)',
  },
  {
    name: 'en-US-Standard-B',
    languageCode: 'en-US',
    ssmlGender: 'MALE',
    description: 'American English - Male (Standard)',
  },
  {
    name: 'en-US-Standard-C',
    languageCode: 'en-US',
    ssmlGender: 'FEMALE',
    description: 'American English - Female (Wavenet)',
  },
  {
    name: 'en-US-Standard-D',
    languageCode: 'en-US',
    ssmlGender: 'MALE',
    description: 'American English - Male (Wavenet)',
  },
  {
    name: 'en-US-Standard-E',
    languageCode: 'en-US',
    ssmlGender: 'FEMALE',
    description: 'American English - Female (Neural2)',
  },
  {
    name: 'en-US-Standard-F',
    languageCode: 'en-US',
    ssmlGender: 'MALE',
    description: 'American English - Male (Neural2)',
  },
  {
    name: 'en-GB-Standard-A',
    languageCode: 'en-GB',
    ssmlGender: 'FEMALE',
    description: 'British English - Female',
  },
  {
    name: 'en-GB-Standard-B',
    languageCode: 'en-GB',
    ssmlGender: 'MALE',
    description: 'British English - Male',
  },
];

export async function getAvailableVoices(): Promise<VoiceOption[]> {
  if (!ttsClient) {
    console.log('⚠️ TTS client not available, returning fallback voices');
    return fallbackVoices;
  }

  try {
    const [result] = await ttsClient.listVoices({});
    return result.voices?.map(voice => ({
      name: voice.name || '',
      languageCode: voice.languageCodes?.[0] || 'en-US',
      ssmlGender: voice.ssmlGender || 'NEUTRAL',
      description: `${voice.name} (${voice.languageCodes?.[0]})`,
    })) || fallbackVoices;
  } catch (error) {
    console.error('Error fetching voices:', error);
    return fallbackVoices; // Fallback to predefined voices
  }
}

export async function generateAudio(
  script: string,
  tenderId: string,
  options: AudioGenerationOptions
): Promise<AudioFile> {
  try {
    console.log('🎵 Generating audio for tender:', tenderId);
    
    const audioId = uuidv4();
    const fileName = `audio_${audioId}.${options.format}`;
    const uploadDir = path.join(process.cwd(), 'public', 'audio');
    
    // Ensure upload directory exists
    await fs.mkdir(uploadDir, { recursive: true });
    
    const filePath = path.join(uploadDir, fileName);
    
    if (!ttsClient) {
      console.log('⚠️ TTS client not available, creating fallback audio file');
      return createFallbackAudio(script, tenderId, options, filePath, audioId);
    }

    // Prepare the request
    const request = {
      input: { text: script },
      voice: {
        languageCode: options.voice.split('-')[0] + '-' + options.voice.split('-')[1],
        name: options.voice,
        ssmlGender: fallbackVoices.find(v => v.name === options.voice)?.ssmlGender || 'NEUTRAL',
      },
      audioConfig: {
        audioEncoding: options.format === 'mp3' ? 'MP3' : 
                      options.format === 'wav' ? 'LINEAR16' : 'OGG_OPUS',
        speakingRate: options.speed,
        pitch: options.pitch,
        volumeGainDb: options.volume,
      },
    };

    // Generate the audio
    const [response] = await ttsClient.synthesizeSpeech(request);
    
    if (!response.audioContent) {
      throw new Error('No audio content generated');
    }

    // Write the audio file
    await fs.writeFile(filePath, response.audioContent as Buffer);
    
    // Get file stats
    const stats = await fs.stat(filePath);
    
    const audioFile: AudioFile = {
      id: audioId,
      tenderId,
      scriptId: 'script_' + uuidv4(),
      voice: options.voice,
      format: options.format,
      fileUrl: `/audio/${fileName}`,
      duration: estimateDuration(script, options.speed),
      fileSize: stats.size,
      createdAt: new Date(),
    };

    console.log('✅ Audio generated successfully:', audioFile.fileUrl);
    return audioFile;
    
  } catch (error) {
    console.error('❌ Error generating audio:', error);
    // Try fallback if TTS fails
    try {
      const audioId = uuidv4();
      const fileName = `audio_${audioId}.${options.format}`;
      const uploadDir = path.join(process.cwd(), 'public', 'audio');
      await fs.mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, fileName);
      return createFallbackAudio(script, tenderId, options, filePath, audioId);
    } catch (fallbackError) {
      throw new Error(`Failed to generate audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export async function generateTwoHostConversation(
  script: string,
  tenderId: string,
  options: AudioGenerationOptions
): Promise<AudioFile> {
  try {
    console.log('🎙️ Generating two-host conversation for tender:', tenderId);
    
    // Parse the script to separate hosts
    const sections = parseTwoHostScript(script);
    
    if (sections.length === 0) {
      throw new Error('No valid host sections found in script');
    }

    const audioId = uuidv4();
    const fileName = `conversation_${audioId}.${options.format}`;
    const uploadDir = path.join(process.cwd(), 'public', 'audio');
    
    await fs.mkdir(uploadDir, { recursive: true });
    const filePath = path.join(uploadDir, fileName);
    
    if (!ttsClient) {
      console.log('⚠️ TTS client not available, creating fallback audio file');
      return createFallbackAudio(script, tenderId, options, filePath, audioId);
    }
    
    // Generate audio for each section
    const audioBuffers: Buffer[] = [];
    
    for (const section of sections) {
      const request = {
        input: { text: section.text },
        voice: {
          languageCode: section.host === 'Host A' ? 
            (options.host1Voice?.split('-')[0] + '-' + options.host1Voice?.split('-')[1]) :
            (options.host2Voice?.split('-')[0] + '-' + options.host2Voice?.split('-')[1]),
          name: section.host === 'Host A' ? options.host1Voice : options.host2Voice,
          ssmlGender: section.host === 'Host A' ? 
            (fallbackVoices.find(v => v.name === options.host1Voice)?.ssmlGender || 'FEMALE') :
            (fallbackVoices.find(v => v.name === options.host2Voice)?.ssmlGender || 'MALE'),
        },
        audioConfig: {
          audioEncoding: options.format === 'mp3' ? 'MP3' : 
                        options.format === 'wav' ? 'LINEAR16' : 'OGG_OPUS',
          speakingRate: options.speed,
          pitch: options.pitch,
          volumeGainDb: options.volume,
        },
      };

      const [response] = await ttsClient.synthesizeSpeech(request);
      if (response.audioContent) {
        audioBuffers.push(response.audioContent as Buffer);
      }
    }

    // Combine audio buffers
    const combinedAudio = Buffer.concat(audioBuffers);
    await fs.writeFile(filePath, combinedAudio);
    
    const stats = await fs.stat(filePath);
    
    const audioFile: AudioFile = {
      id: audioId,
      tenderId,
      scriptId: 'conversation_' + uuidv4(),
      voice: `${options.host1Voice}+${options.host2Voice}`,
      format: options.format,
      fileUrl: `/audio/${fileName}`,
      duration: estimateDuration(script, options.speed),
      fileSize: stats.size,
      createdAt: new Date(),
    };

    console.log('✅ Two-host conversation generated successfully:', audioFile.fileUrl);
    return audioFile;
    
  } catch (error) {
    console.error('❌ Error generating two-host conversation:', error);
    throw new Error(`Failed to generate conversation: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function parseTwoHostScript(script: string): Array<{ host: string; text: string }> {
  const sections: Array<{ host: string; text: string }> = [];
  const lines = script.split('\n');
  
  let currentHost = '';
  let currentText = '';
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (trimmedLine.startsWith('Host A:') || trimmedLine.startsWith('Host B:')) {
      if (currentHost && currentText) {
        sections.push({ host: currentHost, text: currentText.trim() });
      }
      currentHost = trimmedLine.split(':')[0];
      currentText = trimmedLine.split(':').slice(1).join(':').trim();
    } else if (currentHost && trimmedLine) {
      currentText += ' ' + trimmedLine;
    }
  }
  
  if (currentHost && currentText) {
    sections.push({ host: currentHost, text: currentText.trim() });
  }
  
  return sections;
}

async function createFallbackAudio(
  script: string,
  tenderId: string,
  options: AudioGenerationOptions,
  filePath: string,
  audioId: string
): Promise<AudioFile> {
  console.log('🔄 Creating fallback audio file (text-only)');
  
  // Create a simple text file as fallback
  const fallbackContent = `Audio Script - ${new Date().toISOString()}\n\n${script}\n\nNote: This is a fallback text file. To generate actual audio, please configure Google Cloud TTS credentials.`;
  
  await fs.writeFile(filePath, fallbackContent);
  
  const stats = await fs.stat(filePath);
  
  return {
    id: audioId,
    tenderId,
    scriptId: 'fallback_' + uuidv4(),
    voice: options.voice,
    format: options.format,
    fileUrl: `/audio/audio_${audioId}.${options.format}`,
    duration: estimateDuration(script, options.speed),
    fileSize: stats.size,
    createdAt: new Date(),
  };
}

function estimateDuration(text: string, speed: number): number {
  // Rough estimation: average speaking rate is 150 words per minute
  const words = text.split(/\s+/).length;
  const baseDuration = (words / 150) * 60; // in seconds
  return Math.round(baseDuration / speed);
}

export async function exportAudio(audioFile: AudioFile, format: 'mp3' | 'wav' | 'ogg'): Promise<Buffer> {
  try {
    const filePath = path.join(process.cwd(), 'public', audioFile.fileUrl);
    const fileBuffer = await fs.readFile(filePath);
    
    // If the requested format is different, we'd need to convert
    // For now, return the original file
    return fileBuffer;
    
  } catch (error) {
    console.error('❌ Error exporting audio:', error);
    throw new Error(`Failed to export audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function deleteAudio(audioId: string): Promise<boolean> {
  try {
    const audioFile = await getAudioFile(audioId);
    if (!audioFile) {
      return false;
    }

    const filePath = path.join(process.cwd(), 'public', audioFile.fileUrl);
    await fs.unlink(filePath);
    
    console.log('✅ Audio file deleted:', audioFile.fileUrl);
    return true;
    
  } catch (error) {
    console.error('❌ Error deleting audio:', error);
    return false;
  }
}

export async function getAudioFile(audioId: string): Promise<AudioFile | null> {
  // In a real implementation, this would query the database
  // For now, return null as we don't have persistent storage
  return null;
}

export async function getAudioFilesByTender(tenderId: string): Promise<AudioFile[]> {
  // In a real implementation, this would query the database
  // For now, return empty array
  return [];
}
