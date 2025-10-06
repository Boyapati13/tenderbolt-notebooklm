"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Video, Play, Download, RefreshCw, Film, ChevronLeft, ChevronRight, 
  Maximize2, Settings, Share2, Save, Edit3, Users, Zap, Sparkles, 
  Target, BarChart3, Eye, Volume2, VolumeX, SkipBack, SkipForward,
  RotateCcw, Copy, MoreHorizontal, Star, Heart, Clock, TrendingUp,
  Presentation, Monitor, Smartphone, Tablet, Palette, Type, Layout,
  Image, FileText, PieChart, BarChart, LineChart, Globe, Award,
  Lightbulb, BookOpen, GraduationCap, Briefcase, Building2, Quote
} from "lucide-react";

interface VideoOverviewProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

interface VideoSlide {
  slideNumber: number;
  title: string;
  content: string[];
  narration: string;
  duration: string;
  visualSuggestion: string;
  animations?: string[];
  transitions?: string;
  slideType?: "title" | "content" | "chart" | "image" | "quote" | "comparison" | "timeline" | "summary";
  designTheme?: "modern" | "classic" | "minimal" | "corporate" | "creative" | "academic";
  colorScheme?: "blue" | "green" | "purple" | "orange" | "red" | "gray" | "custom";
  layout?: "centered" | "left-aligned" | "two-column" | "full-width" | "split-screen";
  visualElements?: {
    charts?: Array<{type: "pie" | "bar" | "line" | "area", data: any}>;
    images?: Array<{src: string, alt: string, position: string}>;
    icons?: Array<{name: string, size: string, color: string}>;
  };
}

interface VideoScript {
  title: string;
  totalDuration: string;
  slides: VideoSlide[];
  metadata?: {
    slideCount: number;
    averageSlideDuration: number;
    complexity: "beginner" | "intermediate" | "advanced";
    style: "professional" | "casual" | "academic" | "creative";
    targetAudience: string;
  };
  videoFile?: {
    id: string;
    fileUrl: string;
    duration: number;
    fileSize: number;
    resolution: string;
    fps: number;
    format: string;
  };
}

interface VideoGenerationOptions {
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

export function VideoOverview({ tenderId, interactiveMode = "preview" }: VideoOverviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSlide, setEditedSlide] = useState<VideoSlide | null>(null);
  const [presentationMode, setPresentationMode] = useState(false);
  
  // Enhanced NotebookLM-style features
  const [presentationStyle, setPresentationStyle] = useState<"notebooklm" | "corporate" | "creative" | "academic" | "minimal">("notebooklm");
  const [slideTheme, setSlideTheme] = useState<"modern" | "classic" | "minimal" | "corporate" | "creative" | "academic">("modern");
  const [colorScheme, setColorScheme] = useState<"blue" | "green" | "purple" | "orange" | "red" | "gray">("blue");
  const [layoutMode, setLayoutMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [autoAdvance, setAutoAdvance] = useState(false);
  const [slideTiming, setSlideTiming] = useState(30);
  const [showSpeakerNotes, setShowSpeakerNotes] = useState(false);
  const [presentationSettings, setPresentationSettings] = useState({
    showSlideNumbers: true,
    showProgressBar: true,
    showTimer: true,
    enableAnimations: true,
    enableTransitions: true,
    autoPlay: false,
    loop: false
  });
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Video generation states
  const [videoGenerationOptions, setVideoGenerationOptions] = useState<VideoGenerationOptions>({
    resolution: '1080p',
    fps: 30,
    format: 'mp4',
    quality: 'high',
    includeAudio: true,
    transitionDuration: 1,
    slideDuration: 5,
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontFamily: 'Arial',
    fontSize: 24
  });
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<HTMLVideoElement | null>(null);
  const [showVideoSettings, setShowVideoSettings] = useState(false);
  const [ffmpegAvailable, setFfmpegAvailable] = useState(true);

  // Enhanced presentation styles
  const presentationStyles = [
    {
      id: "notebooklm",
      name: "NotebookLM Style",
      description: "Clean, modern design with focus on content clarity",
      icon: <BookOpen size={20} />,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      features: ["Clean typography", "Minimal distractions", "Focus on content", "Professional layout"]
    },
    {
      id: "corporate",
      name: "Corporate",
      description: "Professional business presentation style",
      icon: <Briefcase size={20} />,
      color: "text-muted-foreground bg-muted border-border",
      features: ["Formal design", "Business charts", "Professional colors", "Executive ready"]
    },
    {
      id: "creative",
      name: "Creative",
      description: "Dynamic and visually engaging presentations",
      icon: <Palette size={20} />,
      color: "text-purple-600 bg-purple-50 border-purple-200",
      features: ["Dynamic visuals", "Creative layouts", "Engaging animations", "Modern design"]
    },
    {
      id: "academic",
      name: "Academic",
      description: "Research-focused presentation style",
      icon: <GraduationCap size={20} />,
      color: "text-green-600 bg-green-50 border-green-200",
      features: ["Research focus", "Data visualization", "Academic tone", "Detailed analysis"]
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Ultra-clean, distraction-free design",
      icon: <Layout size={20} />,
      color: "text-muted-foreground bg-muted border-border",
      features: ["Ultra-clean", "Minimal text", "Focus on visuals", "Simple layout"]
    }
  ];

  const colorSchemes = [
    { id: "blue", name: "Blue", primary: "#3B82F6", secondary: "#EFF6FF", icon: <div className="w-4 h-4 bg-blue-500 rounded"></div> },
    { id: "green", name: "Green", primary: "#10B981", secondary: "#ECFDF5", icon: <div className="w-4 h-4 bg-green-500 rounded"></div> },
    { id: "purple", name: "Purple", primary: "#8B5CF6", secondary: "#F3E8FF", icon: <div className="w-4 h-4 bg-purple-500 rounded"></div> },
    { id: "orange", name: "Orange", primary: "#F59E0B", secondary: "#FFFBEB", icon: <div className="w-4 h-4 bg-orange-500 rounded"></div> },
    { id: "red", name: "Red", primary: "#EF4444", secondary: "#FEF2F2", icon: <div className="w-4 h-4 bg-red-500 rounded"></div> },
    { id: "gray", name: "Gray", primary: "#6B7280", secondary: "#F9FAFB", icon: <div className="w-4 h-4 bg-muted rounded"></div> }
  ];

  const slideTypes = [
    { id: "title", name: "Title Slide", icon: <Type size={16} />, description: "Opening slide with title and subtitle" },
    { id: "content", name: "Content", icon: <FileText size={16} />, description: "Text-heavy content slide" },
    { id: "chart", name: "Chart", icon: <BarChart size={16} />, description: "Data visualization slide" },
    { id: "image", name: "Image", icon: <Image size={16} />, description: "Visual-focused slide" },
    { id: "quote", name: "Quote", icon: <Quote size={16} />, description: "Highlighted quote or testimonial" },
    { id: "comparison", name: "Comparison", icon: <BarChart3 size={16} />, description: "Side-by-side comparison" },
    { id: "timeline", name: "Timeline", icon: <Clock size={16} />, description: "Chronological information" },
    { id: "summary", name: "Summary", icon: <Target size={16} />, description: "Key points summary" }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: tenderId || "tender_default",
          style: presentationStyle,
          interactiveMode
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setVideoScript(data.videoScript);
        setCurrentSlide(0);
        showNotification("Video script generated successfully!", "success");
      } else {
        showNotification("Failed to generate video script: " + (data.error || "Unknown error"), "error");
      }
    } catch (error) {
      console.error("Error generating video:", error);
      showNotification("Failed to generate video script. Please try again.", "error");
    } finally {
      setIsGenerating(false);
    }
  };

  // Load FFmpeg availability on component mount
  useEffect(() => {
    checkFFmpegAvailability();
  }, []);

  const checkFFmpegAvailability = async () => {
    try {
      const response = await fetch('/api/video/generate?tenderId=' + (tenderId || 'default'));
      const data = await response.json();
      if (data.success) {
        setFfmpegAvailable(data.ffmpegAvailable);
      }
    } catch (error) {
      console.error('Error checking FFmpeg availability:', error);
      setFfmpegAvailable(false);
    }
  };

  const generateVideo = async () => {
    if (!videoScript) {
      alert('Please generate a video script first');
      return;
    }

    if (!ffmpegAvailable) {
      alert('FFmpeg is not available. Video generation requires FFmpeg to be installed.');
      return;
    }

    setIsGeneratingVideo(true);
    try {
      const response = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: videoScript.slides,
          tenderId: tenderId || 'default',
          options: videoGenerationOptions
        })
      });

      const data = await response.json();
      if (data.success && data.videoFile) {
        // Update the script with video file info
        setVideoScript(prev => prev ? {
          ...prev,
          videoFile: data.videoFile
        } : null);

        // Create video element for playback
        const video = document.createElement('video');
        video.src = data.videoFile.fileUrl;
        video.controls = true;
        setGeneratedVideo(video);
        
        console.log('✅ Video generated successfully:', data.videoFile);
        showNotification('🎬 Video generated successfully!', 'success');
      } else {
        throw new Error(data.error || 'Failed to generate video');
      }
    } catch (error) {
      console.error('❌ Error generating video:', error);
      showNotification('Failed to generate video. Please try again.', 'error');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const playGeneratedVideo = () => {
    if (generatedVideo) {
      if (isPlaying) {
        generatedVideo.pause();
        setIsPlaying(false);
      } else {
        generatedVideo.play();
        setIsPlaying(true);
      }
    }
  };

  const downloadVideo = () => {
    if (videoScript?.videoFile) {
      const link = document.createElement('a');
      link.href = videoScript.videoFile.fileUrl;
      link.download = `video_${videoScript.title.replace(/[^a-zA-Z0-9]/g, '_')}.${videoScript.videoFile.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleDownload = () => {
    if (!videoScript) return;
    
    let content = `${videoScript.title}\n${"=".repeat(videoScript.title.length)}\n\n`;
    content += `Total Duration: ${videoScript.totalDuration}\n`;
    content += `Total Slides: ${videoScript.slides.length}\n`;
    content += `Style: ${videoScript.metadata?.style || 'Professional'}\n`;
    content += `Complexity: ${videoScript.metadata?.complexity || 'Medium'}\n`;
    content += `Target Audience: ${videoScript.metadata?.targetAudience || 'General'}\n\n`;
    
    videoScript.slides.forEach((slide, index) => {
      content += `\n${"=".repeat(60)}\nSLIDE ${slide.slideNumber}: ${slide.title}\n${"=".repeat(60)}\n\n`;
      content += `Duration: ${slide.duration}\n\n`;
      content += `VISUAL SUGGESTION:\n${slide.visualSuggestion}\n\n`;
      content += `CONTENT:\n${slide.content.map(c => `• ${c}`).join("\n")}\n\n`;
      content += `NARRATION:\n${slide.narration}\n\n`;
      if (slide.animations) {
        content += `ANIMATIONS:\n${slide.animations.map(a => `• ${a}`).join("\n")}\n\n`;
      }
      if (slide.transitions) {
        content += `TRANSITION:\n${slide.transitions}\n\n`;
      }
    });
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `video-script-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification("Video script downloaded!", "success");
  };

  const nextSlide = () => {
    if (videoScript && currentSlide < videoScript.slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control slide transitions
  };

  const toggleFavorite = (slideNumber: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(slideNumber)) {
      newFavorites.delete(slideNumber);
    } else {
      newFavorites.add(slideNumber);
    }
    setFavorites(newFavorites);
  };

  const editSlide = (slide: VideoSlide) => {
    setEditedSlide(slide);
    setIsEditing(true);
  };

  const saveSlideEdits = () => {
    if (!videoScript || !editedSlide) return;
    
    const updatedSlides = videoScript.slides.map(slide => 
      slide.slideNumber === editedSlide.slideNumber ? editedSlide : slide
    );
    
    setVideoScript({
      ...videoScript,
      slides: updatedSlides
    });
    setIsEditing(false);
    setEditedSlide(null);
    showNotification("Slide updated successfully!", "success");
  };

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === "success" ? "bg-green-500 text-white" :
      type === "error" ? "bg-red-500 text-white" :
      "bg-blue-500 text-white"
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const getModeIcon = () => {
    switch (interactiveMode) {
      case "preview": return <Eye size={16} />;
      case "edit": return <Edit3 size={16} />;
      case "present": return <Maximize2 size={16} />;
      case "collaborate": return <Users size={16} />;
      default: return <Eye size={16} />;
    }
  };

  const getModeColor = () => {
    switch (interactiveMode) {
      case "preview": return "text-blue-600 bg-blue-50 border-blue-200";
      case "edit": return "text-green-600 bg-green-50 border-green-200";
      case "present": return "text-purple-600 bg-purple-50 border-purple-200";
      case "collaborate": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const currentSlideData = videoScript?.slides[currentSlide];

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Video className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-heading text-foreground">Video Overview</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getModeColor()}`}>
              {getModeIcon()}
              {interactiveMode.charAt(0).toUpperCase() + interactiveMode.slice(1)} Mode
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Advanced Options"
          >
            <Settings size={16} />
          </button>
          {videoScript && (
            <>
              <button
                onClick={() => setPresentationMode(!presentationMode)}
                className="p-2 text-muted-foreground hover:text-purple-600 transition-colors"
                title="Presentation Mode"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={handleDownload}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                title="Download Script"
              >
                <Download size={16} />
              </button>
              {videoScript && !videoScript.videoFile && (
                <button
                  onClick={generateVideo}
                  disabled={isGeneratingVideo || !ffmpegAvailable}
                  className="p-2 text-muted-foreground hover:text-green-600 transition-colors disabled:opacity-50"
                  title={ffmpegAvailable ? "Generate Video" : "FFmpeg not available"}
                >
                  {isGeneratingVideo ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Video size={16} />
                  )}
                </button>
              )}
              {videoScript?.videoFile && (
                <>
                  <button
                    onClick={playGeneratedVideo}
                    className="p-2 text-muted-foreground hover:text-blue-600 transition-colors"
                    title={isPlaying ? "Pause Video" : "Play Video"}
                  >
                    {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  </button>
                  <button
                    onClick={downloadVideo}
                    className="p-2 text-muted-foreground hover:text-purple-600 transition-colors"
                    title="Download Video"
                  >
                    <Download size={16} />
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="bg-muted rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-heading text-foreground">Advanced Video Options</h4>
          
          {/* Video Settings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-sm font-medium text-foreground">Video Generation Settings</h5>
              <button
                onClick={() => setShowVideoSettings(!showVideoSettings)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showVideoSettings ? 'Hide' : 'Show'} Settings
              </button>
            </div>
            
            {showVideoSettings && (
              <div className="space-y-3 p-3 bg-white rounded-lg border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Resolution</label>
                    <select
                      value={videoGenerationOptions.resolution}
                      onChange={(e) => setVideoGenerationOptions(prev => ({ ...prev, resolution: e.target.value as '720p' | '1080p' | '4K' }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="720p">720p (HD)</option>
                      <option value="1080p">1080p (Full HD)</option>
                      <option value="4K">4K (Ultra HD)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Format</label>
                    <select
                      value={videoGenerationOptions.format}
                      onChange={(e) => setVideoGenerationOptions(prev => ({ ...prev, format: e.target.value as 'mp4' | 'avi' | 'mov' | 'webm' }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="mp4">MP4</option>
                      <option value="avi">AVI</option>
                      <option value="mov">MOV</option>
                      <option value="webm">WebM</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Quality</label>
                    <select
                      value={videoGenerationOptions.quality}
                      onChange={(e) => setVideoGenerationOptions(prev => ({ ...prev, quality: e.target.value as 'low' | 'medium' | 'high' | 'ultra' }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="low">Low (Small file)</option>
                      <option value="medium">Medium (Balanced)</option>
                      <option value="high">High (Good quality)</option>
                      <option value="ultra">Ultra (Best quality)</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      FPS: {videoGenerationOptions.fps}
                    </label>
                    <input
                      type="range"
                      min="24"
                      max="60"
                      step="1"
                      value={videoGenerationOptions.fps}
                      onChange={(e) => setVideoGenerationOptions(prev => ({ ...prev, fps: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Slide Duration: {videoGenerationOptions.slideDuration}s
                    </label>
                    <input
                      type="range"
                      min="3"
                      max="15"
                      step="1"
                      value={videoGenerationOptions.slideDuration}
                      onChange={(e) => setVideoGenerationOptions(prev => ({ ...prev, slideDuration: parseInt(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Transition: {videoGenerationOptions.transitionDuration}s
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="3"
                      step="0.1"
                      value={videoGenerationOptions.transitionDuration}
                      onChange={(e) => setVideoGenerationOptions(prev => ({ ...prev, transitionDuration: parseFloat(e.target.value) }))}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="includeAudio"
                    checked={videoGenerationOptions.includeAudio}
                    onChange={(e) => setVideoGenerationOptions(prev => ({ ...prev, includeAudio: e.target.checked }))}
                    className="rounded"
                  />
                  <label htmlFor="includeAudio" className="text-xs text-gray-700">
                    Include audio narration
                  </label>
                </div>
                
                {!ffmpegAvailable && (
                  <div className="p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    ⚠️ FFmpeg is not available. Video generation requires FFmpeg to be installed.
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Save size={16} className="text-gray-600" />
              <span className="text-sm">Save Template</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Share2 size={16} className="text-gray-600" />
              <span className="text-sm">Share Script</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Copy size={16} className="text-gray-600" />
              <span className="text-sm">Duplicate Slide</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <BarChart3 size={16} className="text-gray-600" />
              <span className="text-sm">Analytics</span>
            </button>
          </div>
        </div>
      )}

      {/* Enhanced Design Panel */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Palette size={20} className="text-purple-600" />
            </div>
            <div>
              <h4 className="text-lg font-semibold text-heading text-foreground">Presentation Design</h4>
              <p className="text-sm text-gray-600">Choose your presentation style and customize the design</p>
            </div>
          </div>
          <button
            onClick={() => setShowDesignPanel(!showDesignPanel)}
            className="p-2 text-purple-600 hover:text-purple-700 transition-colors"
            title="Toggle Design Panel"
          >
            <Settings size={16} />
          </button>
        </div>

        {/* Presentation Styles */}
        <div className="space-y-4">
          <div>
            <h5 className="text-sm font-semibold text-heading text-foreground mb-3">Presentation Style</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {presentationStyles.map((style) => (
                <button
                  key={style.id}
                  onClick={() => setPresentationStyle(style.id as any)}
                  className={`p-4 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
                    presentationStyle === style.id
                      ? `${style.color} border-current`
                      : "bg-white border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    {style.icon}
                    <span className="font-medium">{style.name}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{style.description}</p>
                  <div className="flex flex-wrap gap-1">
                    {style.features.map((feature, index) => (
                      <span key={index} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                        {feature}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Scheme */}
          <div>
            <h5 className="text-sm font-semibold text-heading text-foreground mb-3">Color Scheme</h5>
            <div className="flex gap-3">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setColorScheme(scheme.id as any)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                    colorScheme === scheme.id
                      ? "border-current bg-current bg-opacity-10"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {scheme.icon}
                  <span className="text-sm font-medium">{scheme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Layout Mode */}
          <div>
            <h5 className="text-sm font-semibold text-heading text-foreground mb-3">Layout Mode</h5>
            <div className="flex gap-3">
              <button
                onClick={() => setLayoutMode("desktop")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  layoutMode === "desktop"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Monitor size={16} />
                <span className="text-sm font-medium">Desktop</span>
              </button>
              <button
                onClick={() => setLayoutMode("tablet")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  layoutMode === "tablet"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Tablet size={16} />
                <span className="text-sm font-medium">Tablet</span>
              </button>
              <button
                onClick={() => setLayoutMode("mobile")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 ${
                  layoutMode === "mobile"
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Smartphone size={16} />
                <span className="text-sm font-medium">Mobile</span>
              </button>
            </div>
          </div>

          {/* Presentation Settings */}
          {showDesignPanel && (
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h5 className="text-sm font-semibold text-heading text-foreground mb-3">Presentation Settings</h5>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={presentationSettings.showSlideNumbers}
                      onChange={(e) => setPresentationSettings(prev => ({ ...prev, showSlideNumbers: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Show slide numbers</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={presentationSettings.showProgressBar}
                      onChange={(e) => setPresentationSettings(prev => ({ ...prev, showProgressBar: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Show progress bar</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={presentationSettings.enableAnimations}
                      onChange={(e) => setPresentationSettings(prev => ({ ...prev, enableAnimations: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Enable animations</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={presentationSettings.showTimer}
                      onChange={(e) => setPresentationSettings(prev => ({ ...prev, showTimer: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Show timer</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={presentationSettings.enableTransitions}
                      onChange={(e) => setPresentationSettings(prev => ({ ...prev, enableTransitions: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Enable transitions</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={presentationSettings.autoPlay}
                      onChange={(e) => setPresentationSettings(prev => ({ ...prev, autoPlay: e.target.checked }))}
                      className="rounded"
                    />
                    <span className="text-sm">Auto play</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="animate-spin" size={20} />
            Generating Video Script...
          </>
        ) : (
          <>
            <Film size={20} />
            Generate Video Overview
          </>
        )}
      </button>

      {/* Video Preview */}
      {videoScript && currentSlideData && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          {/* Video Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-bold text-xl mb-2">{videoScript.title}</h4>
                <div className="flex items-center gap-4 text-sm opacity-90">
                  <span>Total Duration: {videoScript.totalDuration}</span>
                  <span>•</span>
                  <span>{videoScript.slides.length} Slides</span>
                  <span>•</span>
                  <span>{videoScript.metadata?.style || 'Professional'}</span>
                  <span>•</span>
                  <span>{videoScript.metadata?.complexity || 'Medium'}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                    {videoScript.metadata?.targetAudience || 'General'}
                  </div>
                  <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
                    Avg: {videoScript.metadata?.averageSlideDuration || 30}s/slide
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={togglePlayback}
                  className="p-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                </button>
                <button
                  onClick={handleDownload}
                  className="p-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-colors"
                  title="Download Script"
                >
                  <Download size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Controls */}
          {interactiveMode === "preview" && !presentationMode && (
            <div className="bg-muted border-b border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={previousSlide}
                    disabled={currentSlide === 0}
                    className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={isMuted ? 0 : volume}
                      onChange={(e) => {
                        setVolume(Number(e.target.value));
                        setIsMuted(Number(e.target.value) === 0);
                      }}
                      className="w-20"
                    />
                  </div>
                  
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide === videoScript.slides.length - 1}
                    className="flex items-center gap-1 px-3 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleFavorite(currentSlideData.slideNumber)}
                    className={`p-2 rounded transition-colors ${
                      favorites.has(currentSlideData.slideNumber) 
                        ? "text-yellow-500 hover:text-yellow-600" 
                        : "text-gray-400 hover:text-yellow-500"
                    }`}
                    title={favorites.has(currentSlideData.slideNumber) ? "Remove from favorites" : "Add to favorites"}
                  >
                    <Star size={16} fill={favorites.has(currentSlideData.slideNumber) ? "currentColor" : "none"} />
                  </button>
                  {interactiveMode === "edit" && (
                    <button
                      onClick={() => editSlide(currentSlideData)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                      title="Edit Slide"
                    >
                      <Edit3 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Slide Display */}
          <div className={`bg-gradient-to-br from-purple-50 to-blue-50 ${presentationMode ? 'min-h-screen' : 'min-h-[500px]'} flex flex-col justify-center transition-all duration-300`}>
            {/* Slide Number */}
            <div className="text-center mb-4">
              <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Slide {currentSlideData.slideNumber} of {videoScript.slides.length}
              </span>
            </div>

            {/* Slide Title */}
            <h3 className={`text-center mb-6 text-gray-800 font-bold ${presentationMode ? 'text-4xl' : 'text-2xl'}`}>
              {currentSlideData.title}
            </h3>

            {/* Slide Content */}
            <div className="bg-white rounded-xl p-8 shadow-lg space-y-4 max-w-4xl mx-auto w-full">
              {currentSlideData.content.map((point, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-purple-600 rounded-full mt-2 flex-shrink-0" />
                  <p className={`text-gray-700 ${presentationMode ? 'text-lg' : 'text-base'}`}>{point}</p>
                </div>
              ))}
            </div>

            {/* Visual Suggestion */}
            <div className="text-center mt-6 text-sm text-gray-600 italic">
              Visual: {currentSlideData.visualSuggestion}
            </div>

            {/* Animations */}
            {currentSlideData.animations && currentSlideData.animations.length > 0 && (
              <div className="text-center mt-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  <Zap size={12} />
                  <span>Animations: {currentSlideData.animations.join(", ")}</span>
                </div>
              </div>
            )}
          </div>

          {/* Narration Panel */}
          <div className="bg-muted border-t border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-xs font-semibold text-gray-600 uppercase">Narration Script</div>
              <div className="text-xs text-gray-500">({currentSlideData.duration})</div>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed italic">
              {currentSlideData.narration}
            </p>
          </div>

          {/* Slide Progress */}
          <div className="bg-white border-t border-gray-200 px-6 py-3">
            <div className="flex gap-1 mb-2">
              {videoScript.slides.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide
                      ? "bg-purple-600"
                      : index < currentSlide
                      ? "bg-purple-300"
                      : "bg-gray-200"
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Slide {currentSlide + 1} of {videoScript.slides.length}</span>
              <span>{currentSlideData.duration}</span>
            </div>
          </div>

          {/* Video Player Section */}
          {videoScript?.videoFile && (
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Video className="text-green-600" size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-green-800">Generated Video</h4>
                  <p className="text-xs text-green-600">
                    {videoScript.videoFile.duration}s • {videoScript.videoFile.resolution} • {videoScript.videoFile.format.toUpperCase()} • 
                    {(videoScript.videoFile.fileSize / 1024 / 1024).toFixed(1)}MB
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={playGeneratedVideo}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Play'} Video
                </button>
                
                <button
                  onClick={downloadVideo}
                  className="flex items-center gap-2 px-3 py-2 bg-white text-green-600 border border-green-200 rounded-lg hover:bg-green-50 transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>
                
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <span>FPS: {videoScript.videoFile.fps}</span>
                </div>
              </div>
            </div>
          )}

          {/* Video Note */}
          <div className="bg-purple-50 border-t border-purple-200 p-4">
            <div className="flex items-start gap-2">
              <Sparkles size={16} className="text-purple-600 mt-0.5" />
              <div className="text-sm text-purple-800">
                <strong>AI-Powered Video Generation:</strong> This script includes slide content, narration, and visual suggestions. 
                {videoScript?.videoFile ? ' Video has been generated and is ready for playback and download.' : ' Click "Generate Video" to create an actual video file from these slides.'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditing && editedSlide && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit Slide {editedSlide.slideNumber}</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editedSlide.title}
                  onChange={(e) => setEditedSlide({...editedSlide, title: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                <textarea
                  value={editedSlide.content.join('\n')}
                  onChange={(e) => setEditedSlide({...editedSlide, content: e.target.value.split('\n')})}
                  className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Enter content points, one per line"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Narration</label>
                <textarea
                  value={editedSlide.narration}
                  onChange={(e) => setEditedSlide({...editedSlide, narration: e.target.value})}
                  className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  placeholder="Enter narration script"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Visual Suggestion</label>
                <input
                  type="text"
                  value={editedSlide.visualSuggestion}
                  onChange={(e) => setEditedSlide({...editedSlide, visualSuggestion: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveSlideEdits}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!videoScript && !isGenerating && (
        <div className="text-center py-12 bg-muted rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Video size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-heading text-foreground mb-2">No video script generated yet</h3>
          <p className="text-gray-600 mb-4">Click Generate to create an AI-powered video overview with slides and narration</p>
          
          {/* Quick Play Button for Empty State */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="animate-spin" size={20} />
                  Generating...
                </>
              ) : (
                <>
                  <Play size={20} />
                  Generate & Play Video
                </>
              )}
            </button>
          </div>
          
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Sparkles size={16} />
            <span>AI-powered • Interactive slides • Professional presentation</span>
          </div>
        </div>
      )}
    </div>
  );
}

