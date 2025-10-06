"use client";

import { useState } from "react";
import { Volume2, Play, Pause, Download, RefreshCw, Settings, Mic, Headphones, 
  VolumeX, SkipBack, SkipForward, RotateCcw, Copy, Share2, Save, 
  Clock, Users, Zap, Sparkles, Target, BarChart3, Eye, Edit3, 
  MessageCircle, Send, Bot, User, Globe, Languages, Timer, 
  PlayCircle, PauseCircle, Square, RotateCcw as Reset } from "lucide-react";

interface AudioOverviewProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

export function AudioOverview({ tenderId, interactiveMode = "preview" }: AudioOverviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState("conversational");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isInteractiveMode, setIsInteractiveMode] = useState(false);

  const audioStyles = [
    { id: "conversational", name: "Conversational", description: "Natural, friendly discussion", icon: "💬" },
    { id: "podcast", name: "Podcast", description: "Two-host conversation format", icon: "🎙️" },
    { id: "presentation", name: "Presentation", description: "Professional business style", icon: "📊" },
    { id: "educational", name: "Educational", description: "Clear, instructional tone", icon: "🎓" },
    { id: "news", name: "News", description: "Informative, news-style delivery", icon: "📰" },
    { id: "storytelling", name: "Storytelling", description: "Narrative, engaging format", icon: "📖" }
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate generation
    setTimeout(() => {
      setIsGenerating(false);
    }, 3000);
  };

  const handleGenerateAudio = async () => {
    // Simulate audio generation
    console.log("Generating audio...");
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

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
            title="Settings"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Style Selection */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-gray-900">Audio Style</h4>
        <div className="grid grid-cols-2 gap-3">
          {audioStyles.map((style) => (
            <button
              key={style.id}
              onClick={() => setSelectedStyle(style.id)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                selectedStyle === style.id
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 hover:border-gray-300 text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{style.icon}</span>
                <span className="font-medium text-sm">{style.name}</span>
              </div>
              <p className="text-xs text-gray-500">{style.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Studio Panel Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
              <select className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500">
                <option value="English">English</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Discussion Length</label>
              <select className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500">
                <option value="short">Short (5-10 min)</option>
                <option value="medium">Medium (10-20 min)</option>
                <option value="long">Long (20+ min)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? (
          <>
            <RefreshCw size={16} className="animate-spin" />
            Generating Audio Script...
          </>
        ) : (
          <>
            <Zap size={16} />
            Generate Audio Overview
          </>
        )}
      </button>

      {/* Audio Player */}
      <div className="p-6 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={togglePlayback}
            className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            {isPlaying ? 'Pause' : 'Play'} Audio
          </button>
          
          <button
            onClick={handleGenerateAudio}
            className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <RefreshCw size={16} />
            Regenerate
          </button>
          
          <button className="flex items-center gap-2 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
            <Download size={16} />
            Download
          </button>
        </div>

        {/* Interactive Mode Button */}
        <button
          onClick={() => setIsInteractiveMode(!isInteractiveMode)}
          className={`flex items-center gap-2 px-4 py-3 rounded-lg transition-colors ${
            isInteractiveMode 
              ? "bg-green-600 text-white hover:bg-green-700" 
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          <MessageCircle size={16} />
          {isInteractiveMode ? 'Exit Interactive Mode' : 'Join Interactive Mode (Beta)'}
        </button>

        {/* Interactive Mode Chat */}
        {isInteractiveMode && (
          <div className="mt-4 p-4 bg-white rounded-lg border">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="text-blue-600" size={20} />
              <h5 className="font-semibold text-gray-900">Interactive Mode (Beta)</h5>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Live</span>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-3 h-32 overflow-y-auto mb-3">
              <div className="text-sm text-gray-600">
                Welcome to Interactive Mode! You can now ask questions and join the conversation with the AI hosts.
              </div>
            </div>
            
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ask a question or join the conversation..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <Send size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Script Preview */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h5 className="font-semibold text-gray-900 mb-4">Generated Script Preview</h5>
        <div className="space-y-3">
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">Host A</span>
              <span className="text-xs text-gray-500">00:00</span>
            </div>
            <p className="text-sm text-gray-700">Welcome to this audio overview of the tender opportunity. Let's dive into the key details...</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-900">Host B</span>
              <span className="text-xs text-gray-500">00:15</span>
            </div>
            <p className="text-sm text-gray-700">Absolutely! This looks like a fantastic opportunity with significant potential for qualified contractors...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
