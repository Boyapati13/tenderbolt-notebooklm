import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface VideoFile {
  id: string;
  tenderId: string;
  slideId: string;
  audioId?: string;
  format: 'mp4' | 'avi' | 'mov' | 'webm';
  fileUrl: string;
  duration: number;
  fileSize: number;
  resolution: string;
  fps: number;
  createdAt: Date;
}

export interface VideoSlide {
  slideNumber: number;
  title: string;
  content: string[];
  narration: string;
  duration: number;
  visualSuggestion: string;
  slideType: 'title' | 'content' | 'chart' | 'image' | 'quote' | 'comparison' | 'timeline' | 'summary';
  designTheme: 'modern' | 'classic' | 'minimal' | 'corporate' | 'creative' | 'academic';
  colorScheme: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'gray' | 'custom';
  layout: 'centered' | 'left-aligned' | 'two-column' | 'full-width' | 'split-screen';
  visualElements?: {
    charts?: Array<{type: 'pie' | 'bar' | 'line' | 'area', data: any}>;
    images?: Array<{src: string, alt: string, position: string}>;
    icons?: Array<{name: string, size: string, color: string}>;
  };
}

export interface VideoGenerationOptions {
  resolution: '720p' | '1080p' | '4K';
  fps: number;
  format: 'mp4' | 'avi' | 'mov' | 'webm';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  includeAudio: boolean;
  audioFile?: string;
  transitionDuration: number;
  slideDuration: number;
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: number;
}

export class VideoService {
  private static instance: VideoService;

  constructor() {}

  static getInstance(): VideoService {
    if (!VideoService.instance) {
      VideoService.instance = new VideoService();
    }
    return VideoService.instance;
  }

  async generateVideo(
    slides: VideoSlide[],
    tenderId: string,
    options: VideoGenerationOptions
  ): Promise<VideoFile> {
    try {
      console.log('🎬 Generating video for tender:', tenderId);
      
      const videoId = uuidv4();
      const fileName = `video_${videoId}.${options.format}`;
      const uploadDir = path.join(process.cwd(), 'public', 'videos');
      
      // Ensure upload directory exists
      await fs.mkdir(uploadDir, { recursive: true });
      
      const filePath = path.join(uploadDir, fileName);
      
      // Create temporary directory for video assets
      const tempDir = path.join(process.cwd(), 'temp', 'video', videoId);
      await fs.mkdir(tempDir, { recursive: true });
      
      try {
        // Generate individual slide images
        const slideImages = await this.generateSlideImages(slides, tempDir, options);
        
        // Create video from slides
        const videoPath = await this.createVideoFromSlides(slideImages, filePath, options);
        
        // Add audio if provided
        if (options.includeAudio && options.audioFile) {
          await this.addAudioToVideo(videoPath, options.audioFile, filePath);
        }
        
        // Get file stats
        const stats = await fs.stat(filePath);
        
        const videoFile: VideoFile = {
          id: videoId,
          tenderId,
          slideId: 'slides_' + uuidv4(),
          audioId: options.audioFile ? 'audio_' + uuidv4() : undefined,
          format: options.format,
          fileUrl: `/videos/${fileName}`,
          duration: this.calculateTotalDuration(slides),
          fileSize: stats.size,
          resolution: options.resolution,
          fps: options.fps,
          createdAt: new Date(),
        };

        console.log('✅ Video generated successfully:', videoFile.fileUrl);
        return videoFile;
        
      } finally {
        // Cleanup temporary files
        await this.cleanupTempFiles(tempDir);
      }
      
    } catch (error) {
      console.error('❌ Error generating video:', error);
      throw new Error(`Failed to generate video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async generateSlideImages(
    slides: VideoSlide[],
    tempDir: string,
    options: VideoGenerationOptions
  ): Promise<string[]> {
    const slideImages: string[] = [];
    
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const imagePath = path.join(tempDir, `slide_${i + 1}.png`);
      
      // Generate slide image using HTML/CSS and Puppeteer-like approach
      await this.createSlideImage(slide, imagePath, options);
      slideImages.push(imagePath);
    }
    
    return slideImages;
  }

  private async createSlideImage(
    slide: VideoSlide,
    outputPath: string,
    options: VideoGenerationOptions
  ): Promise<void> {
    // For now, create a simple HTML-based slide image
    // In a real implementation, this would use a more sophisticated rendering engine
    
    const html = this.generateSlideHTML(slide, options);
    const htmlPath = outputPath.replace('.png', '.html');
    
    await fs.writeFile(htmlPath, html);
    
    // Use a headless browser to capture the slide as an image
    // For now, we'll create a placeholder image
    await this.createPlaceholderImage(outputPath, slide, options);
  }

  private generateSlideHTML(slide: VideoSlide, options: VideoGenerationOptions): string {
    const { resolution, backgroundColor, textColor, fontFamily, fontSize } = options;
    const [width, height] = this.getResolutionDimensions(resolution);
    
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${slide.title}</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            width: ${width}px;
            height: ${height}px;
            background: ${backgroundColor};
            color: ${textColor};
            font-family: ${fontFamily};
            font-size: ${fontSize}px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }
        .slide-container {
            width: 90%;
            height: 90%;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }
        .slide-title {
            font-size: ${fontSize * 2}px;
            font-weight: bold;
            margin-bottom: 30px;
            color: ${this.getThemeColor(slide.colorScheme)};
        }
        .slide-content {
            font-size: ${fontSize}px;
            line-height: 1.6;
            max-width: 80%;
        }
        .slide-content ul {
            text-align: left;
            margin: 20px 0;
        }
        .slide-content li {
            margin: 10px 0;
        }
        .slide-type-${slide.slideType} {
            border: 2px solid ${this.getThemeColor(slide.colorScheme)};
            border-radius: 10px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
        }
    </style>
</head>
<body>
    <div class="slide-container slide-type-${slide.slideType}">
        <h1 class="slide-title">${slide.title}</h1>
        <div class="slide-content">
            ${slide.content.map(item => `<p>${item}</p>`).join('')}
        </div>
    </div>
</body>
</html>`;
  }

  private getResolutionDimensions(resolution: string): [number, number] {
    switch (resolution) {
      case '720p': return [1280, 720];
      case '1080p': return [1920, 1080];
      case '4K': return [3840, 2160];
      default: return [1920, 1080];
    }
  }

  private getThemeColor(colorScheme: string): string {
    const colors = {
      blue: '#3B82F6',
      green: '#10B981',
      purple: '#8B5CF6',
      orange: '#F59E0B',
      red: '#EF4444',
      gray: '#6B7280',
      custom: '#6366F1'
    };
    return colors[colorScheme as keyof typeof colors] || colors.blue;
  }

  private async createPlaceholderImage(
    outputPath: string,
    slide: VideoSlide,
    options: VideoGenerationOptions
  ): Promise<void> {
    // Create a simple placeholder image using Node.js canvas or similar
    // For now, we'll create a text file as a placeholder
    const placeholderContent = `
Slide ${slide.slideNumber}: ${slide.title}
${slide.content.join('\n')}
Duration: ${slide.duration}s
Type: ${slide.slideType}
Theme: ${slide.designTheme}
Color: ${slide.colorScheme}
    `.trim();
    
    await fs.writeFile(outputPath.replace('.png', '.txt'), placeholderContent);
    
    // In a real implementation, this would generate an actual PNG image
    // For now, we'll create a simple colored rectangle as a placeholder
    await this.createSimpleImage(outputPath, slide, options);
  }

  private async createSimpleImage(
    outputPath: string,
    slide: VideoSlide,
    options: VideoGenerationOptions
  ): Promise<void> {
    // This is a simplified version - in production, you'd use a proper image generation library
    const { resolution } = options;
    const [width, height] = this.getResolutionDimensions(resolution);
    
    // Create a simple colored rectangle as placeholder
    // In production, this would be replaced with actual image generation
    const placeholderData = Buffer.from(`PLACEHOLDER_IMAGE_${slide.slideNumber}_${width}x${height}`);
    await fs.writeFile(outputPath, placeholderData);
  }

  private async createVideoFromSlides(
    slideImages: string[],
    outputPath: string,
    options: VideoGenerationOptions
  ): Promise<string> {
    try {
      // Use FFmpeg to create video from images
      const { resolution, fps, format, quality } = options;
      const [width, height] = this.getResolutionDimensions(resolution);
      
      // FFmpeg command to create video from images
      const ffmpegCommand = this.buildFFmpegCommand(slideImages, outputPath, {
        width,
        height,
        fps,
        format,
        quality
      });
      
      console.log('🎬 Running FFmpeg command:', ffmpegCommand);
      await execAsync(ffmpegCommand);
      
      return outputPath;
      
    } catch (error) {
      console.error('❌ FFmpeg error:', error);
      throw new Error(`Failed to create video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private buildFFmpegCommand(
    slideImages: string[],
    outputPath: string,
    options: { width: number; height: number; fps: number; format: string; quality: string }
  ): string {
    const { width, height, fps, format, quality } = options;
    
    // Quality settings
    const qualitySettings = {
      low: 'crf=28',
      medium: 'crf=23',
      high: 'crf=18',
      ultra: 'crf=15'
    };
    
    // Format-specific settings
    const formatSettings = {
      mp4: '-c:v libx264 -preset medium',
      avi: '-c:v libx264 -preset medium',
      mov: '-c:v libx264 -preset medium',
      webm: '-c:v libvpx-vp9 -preset medium'
    };
    
    // Create input pattern for slides
    const inputPattern = slideImages[0].replace('slide_1.png', 'slide_%d.png');
    
    return `ffmpeg -y -framerate ${fps} -i "${inputPattern}" -s ${width}x${height} ${formatSettings[format as keyof typeof formatSettings]} ${qualitySettings[quality as keyof typeof qualitySettings]} -pix_fmt yuv420p "${outputPath}"`;
  }

  private async addAudioToVideo(
    videoPath: string,
    audioPath: string,
    outputPath: string
  ): Promise<void> {
    try {
      const command = `ffmpeg -y -i "${videoPath}" -i "${audioPath}" -c:v copy -c:a aac -shortest "${outputPath}"`;
      console.log('🎵 Adding audio to video:', command);
      await execAsync(command);
    } catch (error) {
      console.error('❌ Error adding audio:', error);
      throw new Error(`Failed to add audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private calculateTotalDuration(slides: VideoSlide[]): number {
    return slides.reduce((total, slide) => total + slide.duration, 0);
  }

  private async cleanupTempFiles(tempDir: string): Promise<void> {
    try {
      await fs.rmdir(tempDir, { recursive: true });
    } catch (error) {
      console.warn('⚠️ Could not cleanup temp files:', error);
    }
  }

  async exportVideo(videoFile: VideoFile, format: 'mp4' | 'avi' | 'mov' | 'webm'): Promise<Buffer> {
    try {
      const filePath = path.join(process.cwd(), 'public', videoFile.fileUrl);
      const fileBuffer = await fs.readFile(filePath);
      
      // If the requested format is different, we'd need to convert
      // For now, return the original file
      return fileBuffer;
      
    } catch (error) {
      console.error('❌ Error exporting video:', error);
      throw new Error(`Failed to export video: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async deleteVideo(videoId: string): Promise<boolean> {
    try {
      const videoFile = await this.getVideoFile(videoId);
      if (!videoFile) {
        return false;
      }

      const filePath = path.join(process.cwd(), 'public', videoFile.fileUrl);
      await fs.unlink(filePath);
      
      console.log('✅ Video file deleted:', videoFile.fileUrl);
      return true;
      
    } catch (error) {
      console.error('❌ Error deleting video:', error);
      return false;
    }
  }

  async getVideoFile(videoId: string): Promise<VideoFile | null> {
    // In a real implementation, this would query the database
    // For now, return null as we don't have persistent storage
    return null;
  }

  async getVideoFilesByTender(tenderId: string): Promise<VideoFile[]> {
    // In a real implementation, this would query the database
    // For now, return empty array
    return [];
  }

  // Utility method to check if FFmpeg is available
  async checkFFmpegAvailability(): Promise<boolean> {
    try {
      await execAsync('ffmpeg -version');
      return true;
    } catch (error) {
      console.warn('⚠️ FFmpeg not available:', error);
      return false;
    }
  }
}

// Export singleton instance
export const videoService = VideoService.getInstance();
