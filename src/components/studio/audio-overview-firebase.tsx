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
  const [audioScript, setAudioScript] = useState<any>(null);
  const [interactiveMessages, setInteractiveMessages] = useState<any[]>([]);
  const [userInput, setUserInput] = useState("");

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
    
    // Simulate API call for Firebase static export
    try {
      // For Firebase static export, we'll use a mock response
      const mockScript = {
        title: "Educational Software Platform - Audio Overview",
        style: selectedStyle,
        duration: "6:30",
        script: `Welcome to this audio overview of the Educational Software Platform tender. This is a comprehensive learning management system project valued at $1.2 million, with a deadline of January 4th, 2026. Let's explore the key details and opportunities.`,
        sections: [
          {
            speaker: "Host A",
            timestamp: "00:00",
            text: "Welcome to this audio overview of the Educational Software Platform tender.",
            duration: 5
          },
          {
            speaker: "Host B", 
            timestamp: "00:05",
            text: "This is a comprehensive learning management system project valued at $1.2 million.",
            duration: 6
          },
          {
            speaker: "Host A",
            timestamp: "00:11",
            text: "The deadline is January 4th, 2026, giving us plenty of time to prepare a winning proposal.",
            duration: 7
          },
          {
            speaker: "Host B",
            timestamp: "00:18",
            text: "This remote project offers excellent opportunities for qualified contractors with ed-tech experience.",
            duration: 8
          }
        ],
        metadata: {
          wordCount: 150,
          speakingRate: 150,
          complexity: "intermediate",
          tone: selectedStyle,
          twoHostMode: true,
          interactiveEnabled: true
        }
      };
      
      setTimeout(() => {
        setAudioScript(mockScript);
        setIsGenerating(false);
      }, 2000);
    } catch (error) {
      console.error('Error generating script:', error);
      setIsGenerating(false);
    }
  };

  const handleGenerateAudio = async () => {
    // For Firebase static export, simulate audio generation
    console.log("Generating audio for Firebase deployment...");
    alert("Audio generation simulated for Firebase static export. In production, this would generate actual audio files.");
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const joinInteractiveMode = () => {
    setIsInteractiveMode(true);
    const welcomeMessage = {
      id: Date.now().toString(),
      type: "system",
      content: "Welcome to Interactive Mode! You can now ask questions and join the conversation with the AI hosts.",
      timestamp: new Date().toLocaleTimeString()
    };
    setInteractiveMessages([welcomeMessage]);
  };

  const exitInteractiveMode = () => {
    setIsInteractiveMode(false);
    setInteractiveMessages([]);
  };

  const sendInteractiveMessage = async () => {
    if (!userInput.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setInteractiveMessages(prev => [...prev, userMessage]);
    setUserInput("");

    // Simulate AI response
    setTimeout(() => {
      const hostResponse = {
        id: (Date.now() + 1).toString(),
        type: Math.random() > 0.5 ? "host1" : "host2",
        content: `That's a great question! Based on the tender requirements, ${userInput.toLowerCase().includes('budget') ? 'the budget allocation seems to prioritize quality and innovation.' : 'this aspect requires careful consideration of the technical specifications.'} Let me elaborate on this point...`,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setInteractiveMessages(prev => [...prev, hostResponse]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendInteractiveMessage();
    }
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
      {audioScript && (
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

          {/* Interactive Mode Chat */}
          {isInteractiveMode && (
            <div className="mt-4 p-4 bg-white rounded-lg border">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="text-blue-600" size={20} />
                <h5 className="font-semibold text-gray-900">Interactive Mode (Beta)</h5>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Live</span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-3 h-32 overflow-y-auto mb-3">
                {interactiveMessages.map((message) => (
                  <div key={message.id} className={`mb-2 ${message.type === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
                      message.type === 'user' ? 'bg-purple-600 text-white' :
                      message.type === 'host1' || message.type === 'host2' ? 'bg-white border border-blue-200' :
                      'bg-gray-200 text-gray-700'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
              </div>
              
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
                  disabled={!userInput.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Script Preview */}
      {audioScript && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h5 className="font-semibold text-gray-900 mb-4">Generated Script Preview</h5>
          <div className="space-y-3">
            {audioScript.sections.map((section: any, index: number) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{section.speaker}</span>
                  <span className="text-xs text-gray-500">{section.timestamp}</span>
                </div>
                <p className="text-sm text-gray-700">{section.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
