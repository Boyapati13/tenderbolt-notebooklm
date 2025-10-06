"use client";

import { useState, useRef, useEffect } from "react";
import { Volume2, Play, Pause, Download, RefreshCw, Settings, Mic, Headphones, 
  VolumeX, SkipBack, SkipForward, RotateCcw, Copy, Share2, Save, 
  Clock, Users, Zap, Sparkles, Target, BarChart3, Eye, Edit3, 
  MessageCircle, Send, Bot, User, Globe, Languages, Timer, 
  PlayCircle, PauseCircle, Square, RotateCcw as Reset } from "lucide-react";

interface AudioOverviewProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

interface AudioScript {
  title: string;
  script: string;
  style: string;
  duration: string;
  sections: Array<{
    speaker: string;
    timestamp: string;
    text: string;
    duration: number;
    isInteractive?: boolean;
  }>;
  metadata: {
    wordCount: number;
    speakingRate: number;
    complexity: string;
    tone: string;
    twoHostMode: boolean;
    interactiveEnabled: boolean;
  };
}

interface InteractiveMessage {
  id: string;
  type: "user" | "host1" | "host2" | "system";
  content: string;
  timestamp: string;
  isTyping?: boolean;
}

interface AudioFile {
  id: string;
  fileUrl: string;
  duration: number;
  fileSize: number;
  format: string;
}

export function AudioOverview({ tenderId, interactiveMode = "preview" }: AudioOverviewProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioScript, setAudioScript] = useState<AudioScript | null>(null);
  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedStyle, setSelectedStyle] = useState("conversational");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recentScripts, setRecentScripts] = useState<AudioScript[]>([]);
  
  // Interactive Mode states
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);
  const [interactiveMessages, setInteractiveMessages] = useState<InteractiveMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [currentInteractiveSection, setCurrentInteractiveSection] = useState<number | null>(null);
  
  // Studio panel settings
  const [studioSettings, setStudioSettings] = useState({
    language: "English",
    discussionLength: "medium", // short, medium, long
    hostPersonality: "professional", // professional, casual, academic
    includeQuestions: true,
    backgroundPlayback: true
  });
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const audioStyles = [
    { id: "conversational", name: "Conversational", description: "Natural, friendly discussion", icon: "💬" },
    { id: "podcast", name: "Podcast", description: "Two-host conversation format", icon: "🎙️" },
    { id: "presentation", name: "Presentation", description: "Professional business style", icon: "📊" },
    { id: "brief", name: "Brief", description: "Quick summary format", icon: "⚡" },
    { id: "deep-dive", name: "Deep Dive", description: "Comprehensive analysis", icon: "🔍" },
    { id: "interview", name: "Interview", description: "Q&A interview format", icon: "🎤" }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: tenderId || "tender_default",
          style: selectedStyle,
          interactiveMode
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAudioScript(data.audioScript);
        // Add to recent scripts
        setRecentScripts(prev => [data.audioScript, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Error generating audio:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateAudio = async () => {
    if (!audioScript) return;
    
    setIsGeneratingAudio(true);
    try {
      const response = await fetch("/api/audio/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          script: audioScript.script,
          tenderId: tenderId || "tender_default",
          options: {
            voice: "en-US-Standard-A",
            speed: 1.0,
            pitch: 0,
            volume: 1.0,
            format: "mp3",
            twoHostMode: selectedStyle === "podcast"
          }
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setAudioFile(data.audioFile);
        // Create audio element for playback
        if (audioRef.current) {
          audioRef.current.src = data.audioFile.fileUrl;
        }
      }
    } catch (error) {
      console.error("Error generating audio file:", error);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = parseFloat(e.target.value);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume / 100;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFavorite = (sectionIndex: number) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(sectionIndex)) {
      newFavorites.delete(sectionIndex);
    } else {
      newFavorites.add(sectionIndex);
    }
    setFavorites(newFavorites);
  };

  const downloadScript = () => {
    if (!audioScript) return;
    
    let content = `${audioScript.title}\n${"=".repeat(audioScript.title.length)}\n\n`;
    content += `Style: ${audioScript.style}\n`;
    content += `Duration: ${audioScript.duration}\n`;
    content += `Word Count: ${audioScript.metadata.wordCount}\n`;
    content += `Speaking Rate: ${audioScript.metadata.speakingRate} WPM\n`;
    content += `Complexity: ${audioScript.metadata.complexity}\n`;
    content += `Tone: ${audioScript.metadata.tone}\n`;
    content += `Two-Host Mode: ${audioScript.metadata.twoHostMode ? 'Yes' : 'No'}\n`;
    content += `Interactive Mode: ${audioScript.metadata.interactiveEnabled ? 'Enabled' : 'Disabled'}\n\n`;
    content += `SCRIPT:\n${audioScript.script}\n\n`;
    content += `SECTIONS:\n`;
    
    audioScript.sections.forEach((section, index) => {
      content += `\n${index + 1}. [${section.timestamp}] ${section.speaker}:\n`;
      content += `${section.text}\n`;
      if (section.isInteractive) {
        content += `[Interactive Section - Users can join here]\n`;
      }
    });
    
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `audio-script-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Interactive Mode functions
  const joinInteractiveMode = () => {
    setIsInteractiveMode(true);
    setCurrentInteractiveSection(0);
    
    // Add welcome message
    const welcomeMessage: InteractiveMessage = {
      id: Date.now().toString(),
      type: "system",
      content: "Welcome to Interactive Mode! You can now ask questions and join the conversation with the AI hosts.",
      timestamp: new Date().toLocaleTimeString()
    };
    setInteractiveMessages([welcomeMessage]);
  };

  const exitInteractiveMode = () => {
    setIsInteractiveMode(false);
    setCurrentInteractiveSection(null);
    setInteractiveMessages([]);
  };

  const sendInteractiveMessage = async () => {
    if (!userInput.trim() || !audioScript) return;

    const userMessage: InteractiveMessage = {
      id: Date.now().toString(),
      type: "user",
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setInteractiveMessages(prev => [...prev, userMessage]);
    setUserInput("");
    setIsTyping(true);

    // Simulate AI host response
    setTimeout(() => {
      const hostResponse: InteractiveMessage = {
        id: (Date.now() + 1).toString(),
        type: Math.random() > 0.5 ? "host1" : "host2",
        content: `That's a great question! Based on the tender requirements, ${userInput.toLowerCase().includes('budget') ? 'the budget allocation seems to prioritize quality and innovation.' : 'this aspect requires careful consideration of the technical specifications.'} Let me elaborate on this point...`,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setInteractiveMessages(prev => [...prev, hostResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendInteractiveMessage();
    }
  };

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interactiveMessages]);

  // Background playback
  useEffect(() => {
    if (audioRef.current && studioSettings.backgroundPlayback) {
      audioRef.current.addEventListener('ended', () => {
        // Auto-advance to next section or restart
        if (currentInteractiveSection !== null && audioScript) {
          const nextSection = currentInteractiveSection + 1;
          if (nextSection < audioScript.sections.length) {
            setCurrentInteractiveSection(nextSection);
          } else {
            setCurrentInteractiveSection(0);
          }
        }
      });
    }
  }, [currentInteractiveSection, audioScript, studioSettings.backgroundPlayback]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Volume2 className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Audio Overview</h3>
            <p className="text-sm text-gray-600">Generate an AI podcast based on your sources</p>
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
          {audioScript && (
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
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Audio Style</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {audioStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                selectedStyle === style.id
                  ? "border-purple-500 bg-purple-50 text-purple-700"
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

      {/* Studio Panel Settings */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Studio Panel Settings</h4>
          
          {/* Language and Discussion Length */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
              <select
                value={studioSettings.language}
                onChange={(e) => setStudioSettings(prev => ({ ...prev, language: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Discussion Length</label>
              <select
                value={studioSettings.discussionLength}
                onChange={(e) => setStudioSettings(prev => ({ ...prev, discussionLength: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="short">Short (5-10 min)</option>
                <option value="medium">Medium (10-20 min)</option>
                <option value="long">Long (20+ min)</option>
              </select>
            </div>
          </div>

          {/* Host Personality and Features */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Host Personality</label>
              <select
                value={studioSettings.hostPersonality}
                onChange={(e) => setStudioSettings(prev => ({ ...prev, hostPersonality: e.target.value }))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value="professional">Professional</option>
                <option value="casual">Casual</option>
                <option value="academic">Academic</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Playback Speed</label>
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
              >
                <option value={0.5}>0.5x</option>
                <option value={0.75}>0.75x</option>
                <option value={1}>1x</option>
                <option value={1.25}>1.25x</option>
                <option value={1.5}>1.5x</option>
                <option value={2}>2x</option>
              </select>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={studioSettings.includeQuestions}
                onChange={(e) => setStudioSettings(prev => ({ ...prev, includeQuestions: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Include interactive questions</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={studioSettings.backgroundPlayback}
                onChange={(e) => setStudioSettings(prev => ({ ...prev, backgroundPlayback: e.target.checked }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Enable background playback</span>
            </label>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="animate-spin" size={20} />
            Generating Audio Script...
          </>
        ) : (
          <>
            <Mic size={20} />
            Generate Audio Overview
          </>
        )}
      </button>

      {/* Audio Content */}
      {audioScript ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <h4 className="font-bold text-xl mb-2">{audioScript.title}</h4>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span>Duration: {audioScript.duration}</span>
              <span>•</span>
              <span>Style: {audioScript.style}</span>
              <span>•</span>
              <span>{audioScript.metadata.wordCount} words</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                {audioScript.metadata.complexity}
              </div>
              <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                {audioScript.metadata.tone}
              </div>
            </div>
          </div>

          {/* Audio Player */}
          {audioFile ? (
            <div className="p-6 bg-gray-50">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={togglePlayback}
                  className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Play'} Audio
                </button>
                
                {/* Interactive Mode Button */}
                {audioScript?.metadata?.interactiveEnabled && (
                  <button
                    onClick={isInteractiveMode ? exitInteractiveMode : joinInteractiveMode}
                    className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
                      isInteractiveMode 
                        ? "bg-green-600 text-white hover:bg-green-700" 
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    <MessageCircle size={16} />
                    {isInteractiveMode ? 'Exit Interactive Mode' : 'Join Interactive Mode (Beta)'}
                  </button>
                )}
                
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                  className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {isGeneratingAudio ? <RefreshCw size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                  {isGeneratingAudio ? 'Generating...' : 'Regenerate'}
                </button>
                
                <button className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <Download size={16} />
                  Download
                </button>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>{formatTime(currentTime)}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-200"
                      style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                    />
                  </div>
                  <span>{formatTime(duration)}</span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Volume Control */}
              <div className="flex items-center gap-4 mt-4">
                <button onClick={toggleMute} className="p-2 text-gray-600 hover:text-gray-800">
                  {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600">{volume}%</span>
              </div>

              <audio
                ref={audioRef}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />
            </div>
          ) : (
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <button
                  onClick={handleGenerateAudio}
                  disabled={isGeneratingAudio}
                  className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isGeneratingAudio ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Generating Audio...
                    </>
                  ) : (
                    <>
                      <Headphones size={16} />
                      Generate Audio File
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Interactive Mode Chat */}
          {isInteractiveMode && (
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MessageCircle className="text-blue-600" size={20} />
                <h5 className="font-semibold text-gray-900">Interactive Mode (Beta)</h5>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Live</span>
              </div>
              
              {/* Chat Messages */}
              <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
                {interactiveMessages.map((message) => (
                  <div key={message.id} className={`mb-3 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-flex items-start gap-2 max-w-xs ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    }`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.type === 'user' ? 'bg-purple-600' : 
                        message.type === 'host1' ? 'bg-blue-600' :
                        message.type === 'host2' ? 'bg-green-600' : 'bg-gray-600'
                      }`}>
                        {message.type === 'user' ? <User size={16} className="text-white" /> :
                         message.type === 'host1' || message.type === 'host2' ? <Bot size={16} className="text-white" /> :
                         <MessageCircle size={16} className="text-white" />}
                      </div>
                      <div className={`px-3 py-2 rounded-lg ${
                        message.type === 'user' ? 'bg-purple-600 text-white' :
                        message.type === 'host1' ? 'bg-white border border-blue-200' :
                        message.type === 'host2' ? 'bg-white border border-green-200' :
                        'bg-gray-200 text-gray-700'
                      }`}>
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Bot size={16} />
                    <span className="text-sm">AI hosts are typing...</span>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              
              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question or join the conversation..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendInteractiveMessage}
                  disabled={!userInput.trim() || isTyping}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Script Sections */}
          <div className="p-6 border-t border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-4">Script Sections</h5>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {audioScript.sections.map((section, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-purple-600">{index + 1}</span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium text-gray-900">{section.speaker}</span>
                      <span className="text-xs text-gray-500">{section.timestamp}</span>
                      {section.isInteractive && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          Interactive
                        </span>
                      )}
                      <button
                        onClick={() => toggleFavorite(index)}
                        className={`p-1 rounded transition-colors ${
                          favorites.has(index) 
                            ? "text-yellow-500 hover:text-yellow-600" 
                            : "text-gray-300 hover:text-yellow-500"
                        }`}
                      >
                        <Target size={12} fill={favorites.has(index) ? "currentColor" : "none"} />
                      </button>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{section.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">{section.duration}s</span>
                      <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                      <span className="text-xs text-gray-500">{Math.round(section.text.length / 5)} words</span>
                      {section.isInteractive && (
                        <>
                          <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                          <span className="text-xs text-blue-600">Join conversation here</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : !isGenerating && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Headphones size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No audio generated yet</h3>
          <p className="text-gray-600 mb-4">Click Generate to create an AI-powered audio overview</p>
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
                onClick={() => setAudioScript(script)}
                className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{script.title}</h5>
                    <p className="text-xs text-gray-600">{script.style} • {script.duration}</p>
                  </div>
                  <div className="text-xs text-gray-500">{script.metadata.wordCount} words</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
