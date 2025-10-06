"use client";

import { useState, useRef, useEffect } from "react";
import { Video, Play, Pause, Download, RefreshCw, Settings, Film, Presentation, 
  ChevronLeft, ChevronRight, Maximize2, Minimize2, Share2, Copy, Save, 
  Palette, Type, Layout, Image, BarChart3, PieChart, LineChart, 
  Clock, Users, Zap, Sparkles, Target, Eye, Edit3, RotateCcw } from "lucide-react";

interface VideoOverviewProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

interface VideoSlide {
  slideNumber: number;
  title: string;
  content: string[];
  visualSuggestion: string;
  duration: number;
  transition: string;
  layout: string;
  colorScheme: string;
  notes: string;
}

interface VideoScript {
  title: string;
  totalDuration: string;
  slides: VideoSlide[];
  metadata: {
    style: string;
    complexity: string;
    targetAudience: string;
    presentationType: string;
  };
}

interface VideoFile {
  id: string;
  fileUrl: string;
  duration: number;
  fileSize: number;
  format: string;
  thumbnailUrl: string;
}

export function VideoOverview({ tenderId, interactiveMode = "preview" }: VideoOverviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [videoScript, setVideoScript] = useState<VideoScript | null>(null);
  const [videoFile, setVideoFile] = useState<VideoFile | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("notebooklm");
  const [selectedLayout, setSelectedLayout] = useState("standard");
  const [selectedColorScheme, setSelectedColorScheme] = useState("blue");
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recentScripts, setRecentScripts] = useState<VideoScript[]>([]);
  const [autoPlay, setAutoPlay] = useState(false);
  const [showNotes, setShowNotes] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const videoStyles = [
    { id: "notebooklm", name: "NotebookLM", description: "Clean, educational style", icon: "📚", color: "blue" },
    { id: "corporate", name: "Corporate", description: "Professional business presentation", icon: "💼", color: "gray" },
    { id: "creative", name: "Creative", description: "Dynamic, engaging visuals", icon: "🎨", color: "purple" },
    { id: "minimal", name: "Minimal", description: "Simple, focused design", icon: "⚪", color: "gray" },
    { id: "data-driven", name: "Data-Driven", description: "Charts and analytics focus", icon: "📊", color: "green" },
    { id: "storytelling", name: "Storytelling", description: "Narrative flow and emotion", icon: "📖", color: "orange" }
  ];

  const layoutOptions = [
    { id: "standard", name: "Standard", description: "Title + content + visual", icon: "📄" },
    { id: "split", name: "Split", description: "Text left, visual right", icon: "📑" },
    { id: "centered", name: "Centered", description: "Centered content with visual", icon: "🎯" },
    { id: "timeline", name: "Timeline", description: "Chronological flow", icon: "⏱️" },
    { id: "comparison", name: "Comparison", description: "Side-by-side comparison", icon: "⚖️" },
    { id: "focus", name: "Focus", description: "Single point emphasis", icon: "🔍" }
  ];

  const colorSchemes = [
    { id: "blue", name: "Blue", description: "Professional and trustworthy", color: "bg-blue-500" },
    { id: "green", name: "Green", description: "Growth and success", color: "bg-green-500" },
    { id: "purple", name: "Purple", description: "Creative and innovative", color: "bg-purple-500" },
    { id: "orange", name: "Orange", description: "Energetic and engaging", color: "bg-orange-500" },
    { id: "red", name: "Red", description: "Urgent and important", color: "bg-red-500" },
    { id: "gray", name: "Gray", description: "Neutral and balanced", color: "bg-gray-500" }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: tenderId || "tender_default",
          style: selectedStyle,
          layout: selectedLayout,
          colorScheme: selectedColorScheme,
          interactiveMode
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setVideoScript(data.videoScript);
        setCurrentSlide(0);
        // Add to recent scripts
        setRecentScripts(prev => [data.videoScript, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Error generating video:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateVideo = async () => {
    if (!videoScript) return;
    
    setIsGeneratingVideo(true);
    try {
      const response = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: videoScript,
          tenderId: tenderId || "tender_default",
          options: {
            style: selectedStyle,
            layout: selectedLayout,
            colorScheme: selectedColorScheme,
            format: "mp4",
            quality: "high",
            includeTransitions: true,
            autoAdvance: autoPlay
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setVideoFile(data.videoFile);
        // Create video element for playback
        if (videoRef.current) {
          videoRef.current.src = data.videoFile.fileUrl;
        }
      }
    } catch (error) {
      console.error("Error generating video file:", error);
    } finally {
      setIsGeneratingVideo(false);
    }
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

  const goToSlide = (slideIndex: number) => {
    setCurrentSlide(slideIndex);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const togglePlayback = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const toggleFavorite = (slideIndex: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(slideIndex)) {
      newFavorites.delete(slideIndex);
    } else {
      newFavorites.add(slideIndex);
    }
    setFavorites(newFavorites);
  };

  const downloadScript = () => {
    if (!videoScript) return;
    
    let content = `${videoScript.title}\n${"=".repeat(videoScript.title.length)}\n\n`;
    content += `Style: ${videoScript.metadata.style}\n`;
    content += `Duration: ${videoScript.totalDuration}\n`;
    content += `Complexity: ${videoScript.metadata.complexity}\n`;
    content += `Target Audience: ${videoScript.metadata.targetAudience}\n`;
    content += `Presentation Type: ${videoScript.metadata.presentationType}\n\n`;
    content += `SLIDES:\n`;
    
    videoScript.slides.forEach((slide, index) => {
      content += `\n${slide.slideNumber}. ${slide.title}\n`;
      content += `Duration: ${slide.duration}s\n`;
      content += `Layout: ${slide.layout}\n`;
      content += `Color Scheme: ${slide.colorScheme}\n`;
      content += `Visual: ${slide.visualSuggestion}\n`;
      content += `Content:\n`;
      slide.content.forEach((point, pointIndex) => {
        content += `  ${pointIndex + 1}. ${point}\n`;
      });
      if (slide.notes) {
        content += `Notes: ${slide.notes}\n`;
      }
      content += `\n`;
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
  };

  const currentSlideData = videoScript?.slides[currentSlide];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Video className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Video Overview</h3>
            <p className="text-sm text-gray-600">Generate an explainer video, presented to you by AI</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Advanced Settings"
          >
            <Settings size={16} />
          </button>
          {videoScript && (
            <button 
              onClick={downloadScript}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Download Script"
            >
              <Download size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Style Selection */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Video Style</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {videoStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                selectedStyle === style.id
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{style.icon}</span>
                <span className="font-medium text-sm">{style.name}</span>
              </div>
              <p className="text-xs text-gray-600">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900">Advanced Settings</h4>
          
          {/* Layout Options */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Layout Style</label>
            <div className="grid grid-cols-3 gap-2">
              {layoutOptions.map((layout) => (
                <button
                  key={layout.id}
                  onClick={() => setSelectedLayout(layout.id)}
                  className={`p-2 rounded-lg border text-center transition-all duration-200 ${
                    selectedLayout === layout.id
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="text-lg mb-1">{layout.icon}</div>
                  <div className="text-xs font-medium">{layout.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Scheme */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">Color Scheme</label>
            <div className="flex gap-2">
              {colorSchemes.map((scheme) => (
                <button
                  key={scheme.id}
                  onClick={() => setSelectedColorScheme(scheme.id)}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    selectedColorScheme === scheme.id
                      ? "border-gray-800 scale-110"
                      : "border-gray-300 hover:scale-105"
                  } ${scheme.color}`}
                  title={scheme.name}
                />
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoPlay}
                onChange={(e) => setAutoPlay(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Auto-advance slides</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showNotes}
                onChange={(e) => setShowNotes(e.target.checked)}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Show speaker notes</span>
            </label>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg"
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

      {/* Video Content */}
      {videoScript ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6">
            <h4 className="font-bold text-xl mb-2">{videoScript.title}</h4>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span>Duration: {videoScript.totalDuration}</span>
              <span>•</span>
              <span>{videoScript.slides.length} Slides</span>
              <span>•</span>
              <span>Style: {videoScript.metadata?.style || 'Professional'}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                {videoScript.metadata.complexity}
              </div>
              <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                {videoScript.metadata.targetAudience}
              </div>
            </div>
          </div>

          {/* Video Player */}
          {videoFile ? (
            <div className="p-6 bg-gray-50">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={togglePlayback}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Play'} Video
                </button>
                
                <button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {isGeneratingVideo ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  {isGeneratingVideo ? 'Generating...' : 'Regenerate'}
                </button>
                
                <button 
                  onClick={toggleFullscreen}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                  {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
                </button>
                
                <button className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <Download size={16} />
                  Download
                </button>
              </div>

              <video
                ref={videoRef}
                className={`w-full rounded-lg ${isFullscreen ? 'fixed inset-0 z-50 object-cover' : 'max-h-96'}`}
                controls
                poster={videoFile.thumbnailUrl}
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isGeneratingVideo ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Video size={16} />
                      Generate Video File
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Slide Navigation */}
          <div className="p-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h5 className="font-semibold text-gray-900">Slides</h5>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  {currentSlide + 1} of {videoScript.slides.length}
                </span>
                <button
                  onClick={previousSlide}
                  disabled={currentSlide === 0}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextSlide}
                  disabled={currentSlide === videoScript.slides.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Slide Thumbnails */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {videoScript.slides.map((slide, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-20 h-16 rounded-lg border-2 transition-all duration-200 ${
                    currentSlide === index
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  <div className="p-2 text-center">
                    <div className="text-xs font-medium text-gray-900 mb-1">{index + 1}</div>
                    <div className="text-xs text-gray-600 truncate">{slide.title}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Slide Display */}
          <div className={`bg-gradient-to-br from-green-50 to-blue-50 min-h-[400px] flex flex-col justify-center p-8 ${isFullscreen ? 'fixed inset-0 z-40' : ''}`}>
            {currentSlideData && (
              <>
                <div className="text-center mb-4">
                  <span className="bg-green-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Slide {currentSlideData.slideNumber} of {videoScript.slides.length}
                  </span>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <button
                      onClick={() => toggleFavorite(currentSlide)}
                      className={`p-1 rounded transition-colors ${
                        favorites.has(currentSlide) 
                          ? "text-yellow-500 hover:text-yellow-600" 
                          : "text-gray-300 hover:text-yellow-500"
                      }`}
                    >
                      <Target size={16} fill={favorites.has(currentSlide) ? "currentColor" : "none"} />
                    </button>
                    <span className="text-xs text-gray-500">{currentSlideData.duration}s</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">{currentSlideData.layout}</span>
                  </div>
                </div>

                <h3 className="text-center mb-6 text-gray-800 font-bold text-2xl">
                  {currentSlideData.title}
                </h3>

                <div className="bg-white rounded-xl p-8 shadow-lg space-y-4 max-w-4xl mx-auto w-full">
                  {currentSlideData.content.map((point: string, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="w-3 h-3 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-gray-700">{point}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center mt-6 space-y-2">
                  <div className="text-sm text-gray-600 italic">
                    Visual: {currentSlideData.visualSuggestion}
                  </div>
                  {showNotes && currentSlideData.notes && (
                    <div className="text-xs text-gray-500 bg-white bg-opacity-50 rounded-lg p-3 max-w-2xl mx-auto">
                      <strong>Notes:</strong> {currentSlideData.notes}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Slide Controls */}
          <div className="bg-gray-50 border-t border-gray-200 p-4">
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
                
                <button
                  onClick={togglePlayback}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Play'}
                </button>
                
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
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <Share2 size={16} />
                  Share
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <Download size={16} />
                  Download
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : !isGenerating && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Presentation size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No video generated yet</h3>
          <p className="text-gray-600 mb-4">Click Generate to create an AI-powered video overview</p>
        </div>
      )}

      {/* Recent Scripts */}
      {recentScripts.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Scripts</h4>
          <div className="space-y-2">
            {recentScripts.map((script, index) => (
              <button
                key={index}
                onClick={() => {
                  setVideoScript(script);
                  setCurrentSlide(0);
                }}
                className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{script.title}</h5>
                    <p className="text-xs text-gray-600">{script.metadata.style} • {script.totalDuration}</p>
                  </div>
                  <div className="text-xs text-gray-500">{script.slides.length} slides</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
