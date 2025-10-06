"use client";

import { useState, useEffect } from "react";
import { 
  Volume2, Video, Network, FileText, BookOpen, HelpCircle, Plus, Brain, Settings,
  Play, Pause, Download, RefreshCw, Mic, Film, ChevronLeft, ChevronRight, 
  Zap, Sparkles, Wand2, Target, Clock, Users, TrendingUp, BarChart3,
  Eye, Edit3, Share2, Save, Copy, MoreHorizontal, Star, Heart
} from "lucide-react";
import { StudyTools } from "./study-tools";
import { MindMap } from "./mind-map";
import { ReportsPanel } from "./reports-panel";
import { AudioOverview } from "./audio-overview";
import { VideoOverview } from "./video-overview";
import { FlashcardsPanel } from "./flashcards-panel";
import { QuizPanel } from "./quiz-panel";

type StudioTool = {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  disabled?: boolean;
  category: "media" | "analysis" | "study" | "presentation";
  color: string;
  bgColor: string;
  features: string[];
  interactiveMode?: boolean;
};

const studioTools: StudioTool[] = [
  {
    id: "audio-overview",
    name: "Audio Overview",
    icon: <Volume2 size={20} />,
    description: "Generate professional audio summaries",
    disabled: false,
    category: "media",
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    features: ["Text-to-Speech", "Multiple Styles", "Timeline Control", "Export Options"],
    interactiveMode: true,
  },
  {
    id: "video-overview", 
    name: "Video Overview",
    icon: <Video size={20} />,
    description: "Create engaging video presentations",
    disabled: false,
    category: "presentation",
    color: "text-purple-600",
    bgColor: "bg-purple-50",
    features: ["Slide Generation", "Visual Suggestions", "Narration Scripts", "Interactive Preview"],
    interactiveMode: true,
  },
  {
    id: "mind-map",
    name: "Mind Map",
    icon: <Network size={20} />,
    description: "Visualize complex connections",
    disabled: false,
    category: "analysis",
    color: "text-green-600",
    bgColor: "bg-green-50",
    features: ["Interactive Nodes", "Auto-Layout", "Export Images", "Collaborative Editing"],
    interactiveMode: true,
  },
  {
    id: "reports",
    name: "Reports",
    icon: <FileText size={20} />,
    description: "Generate comprehensive reports",
    disabled: false,
    category: "analysis",
    color: "text-orange-600",
    bgColor: "bg-orange-50",
    features: ["Multiple Formats", "Data Visualization", "Auto-Charts", "Export PDF"],
    interactiveMode: true,
  },
  {
    id: "flashcards",
    name: "Flashcards",
    icon: <BookOpen size={20} />,
    description: "Create interactive study cards",
    disabled: false,
    category: "study",
    color: "text-indigo-600",
    bgColor: "bg-indigo-50",
    features: ["Spaced Repetition", "Progress Tracking", "Multiple Formats", "Quiz Mode"],
    interactiveMode: true,
  },
  {
    id: "quiz",
    name: "Quiz",
    icon: <HelpCircle size={20} />,
    description: "Generate intelligent quizzes",
    disabled: false,
    category: "study",
    color: "text-red-600",
    bgColor: "bg-red-50",
    features: ["Multiple Choice", "True/False", "Progress Tracking", "Instant Feedback"],
    interactiveMode: true,
  },
];

type InteractiveMode = "preview" | "edit" | "present" | "collaborate";

export function StudioPanel({ tenderId }: { tenderId?: string }) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [generatedContent, setGeneratedContent] = useState<any>(null);
  const [activeView, setActiveView] = useState<"tools" | "content">("tools");
  const [interactiveMode, setInteractiveMode] = useState<InteractiveMode>("preview");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [recentTools, setRecentTools] = useState<string[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Load favorites and recent tools from localStorage
    const savedFavorites = localStorage.getItem('studio-favorites');
    const savedRecent = localStorage.getItem('studio-recent');
    if (savedFavorites) setFavorites(new Set(JSON.parse(savedFavorites)));
    if (savedRecent) setRecentTools(JSON.parse(savedRecent));
  }, []);

  const handleToolClick = async (toolId: string) => {
    const currentTenderId = tenderId || "tender_default";
    
    // Add to recent tools
    const newRecent = [toolId, ...recentTools.filter(id => id !== toolId)].slice(0, 5);
    setRecentTools(newRecent);
    localStorage.setItem('studio-recent', JSON.stringify(newRecent));
    
    if (toolId === "reports") {
      setSelectedTool(toolId);
      setActiveView("content");
    } else if (toolId === "audio-overview") {
      setSelectedTool(toolId);
      setActiveView("content");
    } else if (toolId === "video-overview") {
      setSelectedTool(toolId);
      setActiveView("content");
    } else if (toolId === "flashcards" || toolId === "quiz") {
      setIsGenerating(toolId);
      try {
        const response = await fetch("/api/ai/study", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ 
            tenderId: currentTenderId
          }),
        });
        const data = await response.json();
        if (data.flashcards && data.quiz) {
          setGeneratedContent({
            type: "study",
            flashcards: data.flashcards,
            quiz: data.quiz
          });
          setSelectedTool("study-tools");
          setActiveView("content");
        }
      } catch (error) {
        console.error("Error generating study tools:", error);
        showNotification("Failed to generate study tools. Please try again.", "error");
      } finally {
        setIsGenerating(null);
      }
    } else if (toolId === "mind-map") {
      setSelectedTool(toolId);
      setActiveView("content");
    } else {
      setSelectedTool(toolId);
      setActiveView("content");
    }
  };

  const toggleFavorite = (toolId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(toolId)) {
      newFavorites.delete(toolId);
    } else {
      newFavorites.add(toolId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('studio-favorites', JSON.stringify([...newFavorites]));
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "media": return <Volume2 size={16} />;
      case "analysis": return <BarChart3 size={16} />;
      case "study": return <BookOpen size={16} />;
      case "presentation": return <Film size={16} />;
      default: return <Settings size={16} />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "media": return "text-blue-600 bg-blue-100";
      case "analysis": return "text-orange-600 bg-orange-100";
      case "study": return "text-indigo-600 bg-indigo-100";
      case "presentation": return "text-purple-600 bg-purple-100";
      default: return "text-muted-foreground bg-muted";
    }
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveView("tools")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                activeView === "tools" 
                  ? "bg-blue-600 text-white shadow-lg" 
                  : "bg-muted text-muted-foreground hover:bg-accent hover:shadow-md"
              }`}
            >
              <Zap size={16} className="inline mr-2" />
              Tools
            </button>
            <button
              onClick={() => setActiveView("content")}
              className={`px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                activeView === "content" 
                  ? "bg-blue-600 text-white shadow-lg" 
                  : "bg-muted text-muted-foreground hover:bg-accent hover:shadow-md"
              }`}
            >
              <Eye size={16} className="inline mr-2" />
              Content
            </button>
          </div>
          
          {activeView === "content" && selectedTool && (
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                {(["preview", "edit", "present", "collaborate"] as InteractiveMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setInteractiveMode(mode)}
                    className={`px-3 py-1 text-xs rounded-md transition-all duration-200 capitalize ${
                      interactiveMode === mode
                        ? "bg-blue-600 text-white"
                        : "bg-muted text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Advanced Options"
          >
            <Settings size={16} />
          </button>
          {activeView === "content" && (
            <button
              onClick={() => setActiveView("tools")}
              className="px-3 py-1 text-sm btn-secondary"
            >
              Back to Tools
            </button>
          )}
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-heading text-foreground">Advanced Studio Options</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Save size={16} className="text-gray-600" />
              <span className="text-sm">Save Workspace</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Share2 size={16} className="text-gray-600" />
              <span className="text-sm">Share Project</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Copy size={16} className="text-gray-600" />
              <span className="text-sm">Duplicate Tool</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <TrendingUp size={16} className="text-gray-600" />
              <span className="text-sm">Analytics</span>
            </button>
          </div>
        </div>
      )}

      {/* Content View */}
      {activeView === "content" && (
        <div className="space-y-4">
          {/* Interactive Mode Indicator */}
          {selectedTool && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Interactive Mode: {interactiveMode.charAt(0).toUpperCase() + interactiveMode.slice(1)}
                </span>
                <span className="text-xs text-blue-600">
                  {interactiveMode === "preview" && "View and interact with generated content"}
                  {interactiveMode === "edit" && "Modify and customize the content"}
                  {interactiveMode === "present" && "Full-screen presentation mode"}
                  {interactiveMode === "collaborate" && "Real-time collaboration with team"}
                </span>
              </div>
            </div>
          )}

          {selectedTool === "audio-overview" && (
            <AudioOverview tenderId={tenderId} interactiveMode={interactiveMode} />
          )}
          {selectedTool === "video-overview" && (
            <VideoOverview tenderId={tenderId} interactiveMode={interactiveMode} />
          )}
          {selectedTool === "study-tools" && (
            <StudyTools tenderId={tenderId} interactiveMode={interactiveMode} />
          )}
          {selectedTool === "mind-map" && (
            <MindMap tenderId={tenderId} interactiveMode={interactiveMode} />
          )}
          {selectedTool === "reports" && (
            <ReportsPanel tenderId={tenderId} interactiveMode={interactiveMode} />
          )}
          {selectedTool === "flashcards" && (
            <FlashcardsPanel tenderId={tenderId} interactiveMode={interactiveMode} />
          )}
          {selectedTool === "quiz" && (
            <QuizPanel tenderId={tenderId} interactiveMode={interactiveMode} />
          )}
          {selectedTool && !["audio-overview", "video-overview", "study-tools", "mind-map", "reports", "flashcards", "quiz"].includes(selectedTool) && (
            <div className="text-center py-8 text-gray-500">
              <Settings size={32} className="mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Content for {selectedTool} will be displayed here.</p>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Tools View */}
      {activeView === "tools" && (
        <div className="space-y-6">
          {/* Recent Tools */}
          {recentTools.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-heading text-foreground mb-3 flex items-center gap-2">
                <Clock size={16} />
                Recent Tools
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {recentTools.map((toolId) => {
                  const tool = studioTools.find(t => t.id === toolId);
                  if (!tool) return null;
                  return (
                    <button
                      key={toolId}
                      onClick={() => handleToolClick(toolId)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:shadow-md flex-shrink-0 ${
                        tool.disabled 
                          ? "bg-muted border-gray-200 opacity-60" 
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={tool.color}>{tool.icon}</div>
                      <span className="text-sm font-medium">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Favorites */}
          {favorites.size > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-heading text-foreground mb-3 flex items-center gap-2">
                <Star size={16} className="text-yellow-500" />
                Favorites
              </h3>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {Array.from(favorites).map((toolId) => {
                  const tool = studioTools.find(t => t.id === toolId);
                  if (!tool) return null;
                  return (
                    <button
                      key={toolId}
                      onClick={() => handleToolClick(toolId)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-200 hover:shadow-md flex-shrink-0 ${
                        tool.disabled 
                          ? "bg-muted border-gray-200 opacity-60" 
                          : "bg-white border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className={tool.color}>{tool.icon}</div>
                      <span className="text-sm font-medium">{tool.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Studio Tools Grid */}
          <div>
            <h3 className="text-sm font-semibold text-heading text-foreground mb-3 flex items-center gap-2">
              <Wand2 size={16} />
              All Tools
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {studioTools.map((tool) => (
                <div
                  key={tool.id}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer group ${
                    tool.disabled 
                      ? "bg-muted border-gray-200 opacity-60" 
                      : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-lg hover:scale-[1.02]"
                  }`}
                  onClick={() => !tool.disabled && handleToolClick(tool.id)}
                >
                  {/* Tool Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 ${tool.bgColor} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                      <div className={tool.color}>{tool.icon}</div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(tool.id);
                        }}
                        className={`p-1 rounded transition-colors ${
                          favorites.has(tool.id) 
                            ? "text-yellow-500 hover:text-yellow-600" 
                            : "text-gray-300 hover:text-yellow-500"
                        }`}
                        title={favorites.has(tool.id) ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Star size={14} fill={favorites.has(tool.id) ? "currentColor" : "none"} />
                      </button>
                      <div className="w-4 h-4 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                  
                  {/* Loading Indicator */}
                  {isGenerating === tool.id && (
                    <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                        <span className="text-xs text-gray-600">Generating...</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Tool Content */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-semibold text-heading text-foreground">{tool.name}</h4>
                      <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(tool.category)}`}>
                        {tool.category}
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{tool.description}</p>
                    
                    {/* Features */}
                    <div className="space-y-1">
                      {tool.features.slice(0, 2).map((feature, index) => (
                        <div key={index} className="flex items-center gap-1">
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
                      <div className="flex items-center gap-1 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Interactive</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Generated Content Display */}
          {generatedContent && (
            <div className="border-t pt-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-heading text-foreground">Generated Content</span>
              </div>
              
              {generatedContent.type === "report" && (
                <div className="bg-muted rounded-lg p-4 max-h-40 overflow-y-auto">
                  <div className="text-sm text-gray-700 whitespace-pre-wrap">
                    {generatedContent.content}
                  </div>
                </div>
              )}
              
              {generatedContent.type === "audio" && (
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Audio Script ({generatedContent.style} style)</strong>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    Duration: {generatedContent.duration}s
                  </div>
                  <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {generatedContent.script}
                  </div>
                </div>
              )}
              
              {generatedContent.type === "video" && (
                <div className="bg-muted rounded-lg p-4">
                  <div className="text-sm text-gray-700 mb-2">
                    <strong>Video Script ({generatedContent.style} style)</strong>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    {generatedContent.slides.length} slides, Duration: {generatedContent.totalDuration}s
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {generatedContent.slides.map((slide: any, index: number) => (
                      <div key={index} className="text-sm text-gray-700">
                        <strong>Slide {index + 1}:</strong> {slide.title}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {generatedContent.type === "study" && (
                <div className="space-y-3">
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Flashcards</div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {generatedContent.flashcards.map((card: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          <strong>Q:</strong> {card.question}<br/>
                          <strong>A:</strong> {card.answer}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-muted rounded-lg p-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Quiz Questions</div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {generatedContent.quiz.map((question: any, index: number) => (
                        <div key={index} className="text-sm text-gray-600">
                          <strong>Q{index + 1}:</strong> {question.question}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bottom Section */}
          <div className="space-y-3">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-blue-600" />
                <span className="text-sm font-semibold text-heading text-foreground">Studio Intelligence</span>
              </div>
              <div className="text-sm text-gray-600">
                AI-powered tools that adapt to your content and provide intelligent suggestions for optimal results.
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 hover:scale-105 shadow-lg">
                <Plus size={16} />
                Create New Tool
              </button>
              <button className="flex items-center gap-2 px-4 py-2 btn-secondary">
                <Users size={16} />
                Collaborate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}