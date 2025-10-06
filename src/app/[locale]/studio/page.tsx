"use client";

import { useState, useEffect } from "react";
import { 
  Volume2, Video, Network, FileText, BookOpen, HelpCircle, 
  ArrowLeft, Settings, Edit3, Play, Pause, Download, 
  RefreshCw, Mic, Film, ChevronLeft, ChevronRight, 
  Maximize2, Share2, Save, Copy, MoreHorizontal, Star, 
  Clock, Zap, Sparkles, Target, Users, TrendingUp,
  BarChart3, Eye, Presentation, Monitor, Smartphone, 
  Tablet, Palette, Type, Layout, Image, PieChart, 
  BarChart, LineChart, Globe, Award, Lightbulb, 
  GraduationCap, Briefcase, Building2, Quote, X
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AudioOverview } from "@/components/studio/audio-overview-firebase";
import { VideoOverview } from "@/components/studio/video-overview";
import { MindMap } from "@/components/studio/mind-map";
import { Reports } from "@/components/studio/reports-simple";

interface StudioTool {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  bgColor: string;
  category: "media" | "analysis" | "study" | "presentation";
  features: string[];
  interactiveMode?: boolean;
}

interface ToolContent {
  type: string;
  data: any;
  isGenerating?: boolean;
}

export default function StudioPage() {
  const searchParams = useSearchParams();
  const tenderId = searchParams.get('tenderId');
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [toolContent, setToolContent] = useState<ToolContent | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [interactiveMode, setInteractiveMode] = useState<"preview" | "edit" | "present" | "collaborate">("preview");
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  // NotebookLM Studio Tools - Exact 6 tools in 3x2 grid
  const studioTools: StudioTool[] = [
    {
      id: "audio-overview",
      name: "Audio Overview",
      icon: <Volume2 size={24} />,
      description: "Generate an AI podcast based on your sources",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      category: "media",
      features: ["Text-to-Speech", "Multiple Styles", "Timeline Control", "Export Options"],
      interactiveMode: true,
    },
    {
      id: "video-overview",
      name: "Video Overview",
      icon: <Video size={24} />,
      description: "Generate an explainer video, presented to you by AI",
      color: "text-green-600",
      bgColor: "bg-green-50",
      category: "presentation",
      features: ["Slide Generation", "Visual Suggestions", "Narration Scripts", "Interactive Preview"],
      interactiveMode: true,
    },
    {
      id: "mind-map",
      name: "Mind Map",
      icon: <Network size={24} />,
      description: "Visualize connections and relationships",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      category: "analysis",
      features: ["Interactive Nodes", "Auto-Layout", "Export Images", "Collaborative Editing"],
      interactiveMode: true,
    },
    {
      id: "reports",
      name: "Reports",
      icon: <FileText size={24} />,
      description: "Generate comprehensive analysis reports",
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
      category: "analysis",
      features: ["Multiple Formats", "Data Visualization", "Auto-Charts", "Export PDF"],
      interactiveMode: true,
    },
    {
      id: "flashcards",
      name: "Flashcards",
      icon: <BookOpen size={24} />,
      description: "Create interactive study cards",
      color: "text-pink-600",
      bgColor: "bg-pink-50",
      category: "study",
      features: ["Spaced Repetition", "Progress Tracking", "Multiple Formats", "Quiz Mode"],
      interactiveMode: true,
    },
    {
      id: "quiz",
      name: "Quiz",
      icon: <HelpCircle size={24} />,
      description: "Generate intelligent quizzes",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      category: "study",
      features: ["Multiple Choice", "True/False", "Progress Tracking", "Instant Feedback"],
      interactiveMode: true,
    },
  ];

  useEffect(() => {
    // Load recent tools and favorites from localStorage
    const savedRecent = localStorage.getItem('notebooklm-recent-tools');
    const savedFavorites = localStorage.getItem('notebooklm-favorites');
    if (savedRecent) setRecentTools(JSON.parse(savedRecent));
    if (savedFavorites) setFavorites(new Set(JSON.parse(savedFavorites)));
    
    // Check if there's a tool parameter in the URL
    const tool = searchParams.get('tool');
    if (tool) {
      setSelectedTool(tool);
    }
  }, [searchParams]);

  const handleToolClick = async (toolId: string) => {
    // Add to recent tools
    const newRecent = [toolId, ...recentTools.filter(id => id !== toolId)].slice(0, 5);
    setRecentTools(newRecent);
    localStorage.setItem('notebooklm-recent-tools', JSON.stringify(newRecent));
    
    setSelectedTool(toolId);
    setIsGenerating(toolId);
    
    // Simulate content generation
    setTimeout(() => {
      setToolContent({
        type: toolId,
        data: { 
          title: `${studioTools.find(t => t.id === toolId)?.name} Content`,
          generated: true,
          timestamp: new Date().toISOString()
        },
        isGenerating: false
      });
      setIsGenerating(null);
    }, 2000);
  };

  const toggleFavorite = (toolId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(toolId)) {
      newFavorites.delete(toolId);
    } else {
      newFavorites.add(toolId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('notebooklm-favorites', JSON.stringify([...newFavorites]));
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

  const currentTool = studioTools.find(t => t.id === selectedTool);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href={tenderId ? `/en/workspace/${tenderId}` : "/en/dashboard"}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
            >
              <ArrowLeft size={20} />
              Back to {tenderId ? 'Workspace' : 'Dashboard'}
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Studio</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Settings size={20} className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer" />
          </div>
        </div>

        {/* Content View */}
        {selectedTool ? (
          <div className="space-y-6">
            {/* Tool Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => {
                    setSelectedTool(null);
                    setToolContent(null);
                  }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200"
                >
                  <ArrowLeft size={20} />
                  Back to Tools
                </button>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${currentTool?.bgColor} rounded-lg flex items-center justify-center`}>
                    <div className={currentTool?.color}>
                      {currentTool?.icon}
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      {currentTool?.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {currentTool?.description}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {(["preview", "edit", "present", "collaborate"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInteractiveMode(mode)}
                    className={`px-3 py-1 text-xs rounded-md transition-all duration-200 capitalize ${
                      interactiveMode === mode
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Tool Content */}
            <div className="bg-white rounded-xl border border-gray-200 p-6 min-h-[500px]">
              {selectedTool === "audio-overview" && (
                <AudioOverview tenderId={tenderId || undefined} interactiveMode={interactiveMode} />
              )}
              {selectedTool === "video-overview" && (
                <VideoOverview tenderId={tenderId || undefined} interactiveMode={interactiveMode} />
              )}
              {selectedTool === "mind-map" && (
                <MindMap tenderId={tenderId || undefined} interactiveMode={interactiveMode} />
              )}
              {selectedTool === "reports" && (
                <Reports tenderId={tenderId || undefined} interactiveMode={interactiveMode} />
              )}
              {selectedTool === "flashcards" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                      <BookOpen className="text-pink-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Flashcards</h3>
                      <p className="text-sm text-gray-600">Create interactive study cards</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Question 1</h4>
                      <p className="text-sm text-gray-600">What is the main objective of this tender?</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Answer 1</h4>
                      <p className="text-sm text-gray-600">To develop an educational software platform...</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Question 2</h4>
                      <p className="text-sm text-gray-600">What is the estimated budget?</p>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-2">Answer 2</h4>
                      <p className="text-sm text-gray-600">$1,200,000 for the entire project...</p>
                    </div>
                  </div>
                </div>
              )}
              {selectedTool === "quiz" && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <HelpCircle className="text-blue-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Quiz</h3>
                      <p className="text-sm text-gray-600">Generate intelligent quizzes</p>
                    </div>
                  </div>
                  <div className="bg-white border border-gray-200 rounded-lg p-6">
                    <h4 className="font-semibold text-gray-900 mb-4">Quiz Question 1</h4>
                    <p className="text-sm text-gray-600 mb-4">What is the estimated budget for this project?</p>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2">
                        <input type="radio" name="quiz1" className="text-blue-600" />
                        <span className="text-sm">$500,000</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="quiz1" className="text-blue-600" />
                        <span className="text-sm">$1,200,000</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="radio" name="quiz1" className="text-blue-600" />
                        <span className="text-sm">$2,000,000</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Tools Grid - NotebookLM Style */
          <div className="space-y-6">
            {/* Recent Tools */}
            {recentTools.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Clock size={16} />
                  Recent
                </h3>
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {recentTools.map((toolId) => {
                    const tool = studioTools.find(t => t.id === toolId);
                    if (!tool) return null;
                    return (
                      <button
                        key={toolId}
                        onClick={() => handleToolClick(toolId)}
                        className="flex items-center gap-2 px-4 py-3 rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md flex-shrink-0 bg-white"
                      >
                        <div className={tool.color}>{tool.icon}</div>
                        <span className="text-sm font-medium text-gray-900">{tool.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Studio Tools Grid - 3x2 Layout */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Studio Tools</h3>
              <div className="grid grid-cols-3 gap-4">
                {studioTools.map((tool) => (
                  <div
                    key={tool.id}
                    className="relative p-6 rounded-xl border border-gray-200 transition-all duration-200 cursor-pointer group hover:border-gray-300 hover:shadow-lg hover:scale-[1.02] bg-white"
                    onClick={() => handleToolClick(tool.id)}
                  >
                    {/* Edit Icon - appears on hover */}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Edit3 size={16} className="text-gray-400" />
                    </div>

                    {/* Tool Icon */}
                    <div className={`w-12 h-12 ${tool.bgColor} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                      <div className={tool.color}>{tool.icon}</div>
                    </div>

                    {/* Tool Name */}
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{tool.name}</h4>
                    
                    {/* Tool Description */}
                    <p className="text-sm text-gray-600 mb-4">{tool.description}</p>

                    {/* Features */}
                    <div className="space-y-1">
                      {tool.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span className="text-xs text-gray-500">{feature}</span>
                        </div>
                      ))}
                      {tool.features.length > 2 && (
                        <div className="text-xs text-gray-400">
                          +{tool.features.length - 2} more features
                        </div>
                      )}
                    </div>

                    {/* Interactive Mode Badge */}
                    {tool.interactiveMode && (
                      <div className="flex items-center gap-1 mt-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Interactive</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}