"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, DollarSign, Users, Target, AlertCircle, Brain, Settings, Zap, FileText } from "lucide-react";
import { SourcesPanel } from "./sources-panel";
import { ChatPanel } from "./chat-panel";
import { StudioPanel } from "./studio-panel";
import { InsightsPanel } from "./insights-panel";

type Tender = {
  id: string;
  title: string;
  description?: string;
  status: string;
  value?: number;
  deadline?: string;
  winProbability?: number;
  client?: string;
  teamMembers?: string[];
  stage?: string;
  createdAt: string;
  updatedAt?: string;
  autoExtractedTitle?: string;
  autoExtractedBudget?: string;
  autoExtractedLocation?: string;
  autoExtractedDeadlines?: string;
  capabilityScore?: number;
  matchedRequirements?: number;
  totalRequirements?: number;
  strengths?: string;
  weaknesses?: string;
  recommendations?: string;
  stages?: Array<{
    id: string;
    name: string;
    status: string;
    dueDate?: string;
  }>;
};

export function ProjectWorkspace({ 
  tenderId, 
  onBack 
}: { 
  tenderId: string; 
  onBack: () => void; 
}) {
  const [tender, setTender] = useState<Tender | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"sources" | "insights">("sources");

  useEffect(() => {
    fetchTenderData();
    
    // Listen for document upload events to refresh tender data
    const handleDocumentUploaded = () => {
      console.log("📄 Document uploaded, refreshing tender data...");
      setIsRefreshing(true);
      // Add a small delay to ensure the backend has processed the document
      setTimeout(() => {
        fetchTenderData();
      }, 1000);
    };
    
    const handleDocumentProcessed = () => {
      console.log("📄 Document processed, refreshing tender data...");
      setIsRefreshing(true);
      // Add a small delay to ensure the backend has processed the document
      setTimeout(() => {
        fetchTenderData();
      }, 2000);
    };
    
    // Listen for custom events
    window.addEventListener('documentUploaded', handleDocumentUploaded);
    window.addEventListener('documentProcessed', handleDocumentProcessed);
    window.addEventListener('tenderUpdated', handleDocumentUploaded);
    
    // Also set up a periodic refresh every 30 seconds to catch any missed updates
    const refreshInterval = setInterval(() => {
      console.log("🔄 Periodic refresh of tender data...");
      fetchTenderData();
    }, 30000);
    
    return () => {
      window.removeEventListener('documentUploaded', handleDocumentUploaded);
      window.removeEventListener('documentProcessed', handleDocumentProcessed);
      window.removeEventListener('tenderUpdated', handleDocumentUploaded);
      clearInterval(refreshInterval);
    };
  }, [tenderId]);

  const fetchTenderData = async (retryCount = 0) => {
    if (!isRefreshing) {
      setIsLoading(true);
    }
    
    try {
      console.log(`🔄 Fetching tender data for ${tenderId} (attempt ${retryCount + 1})`);
      
      const response = await fetch(`/api/tenders/${tenderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      if (data.tender) {
        setTender(data.tender);
        console.log("✅ Tender data refreshed successfully");
      } else {
        console.warn("⚠️ No tender data received");
      }
    } catch (error) {
      console.error("❌ Error fetching tender data:", error);
      
      // Retry logic - retry up to 3 times with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        console.log(`🔄 Retrying in ${delay}ms...`);
        setTimeout(() => {
          fetchTenderData(retryCount + 1);
        }, delay);
        return; // Don't set loading to false yet
      } else {
        console.error("❌ Max retries reached. Giving up.");
      }
    } finally {
      if (retryCount === 0 || retryCount >= 3) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "won": return "text-green-600 bg-green-100";
      case "lost": return "text-red-600 bg-red-100";
      case "active": return "text-blue-600 bg-blue-100";
      case "completed": return "text-gray-600 bg-gray-100";
      default: return "text-yellow-600 bg-yellow-100";
    }
  };

  const getWinProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tender not found</h3>
          <p className="text-gray-600 mb-4">The requested tender could not be loaded.</p>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Project Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{tender.title}</h1>
                {isRefreshing && (
                  <div className="flex items-center gap-2 text-blue-600">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">Updating...</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tender.status)}`}>
                  {tender.status}
                </span>
                <span className="text-sm text-gray-600">
                  Created {new Date(tender.createdAt).toLocaleDateString()}
                </span>
                {tender.updatedAt && tender.updatedAt !== tender.createdAt && (
                  <span className="text-sm text-gray-500">
                    Updated {new Date(tender.updatedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-sm text-gray-600">Win Probability</div>
              <div className={`text-2xl font-bold ${getWinProbabilityColor(tender.winProbability || 0)}`}>
                {tender.winProbability || 0}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-600">Value</div>
              <div className="text-2xl font-bold text-gray-900">
                ${tender.value?.toLocaleString() || 'TBD'}
              </div>
            </div>
          </div>
        </div>

        {/* AI Extracted Information */}
        {(tender.autoExtractedTitle || tender.autoExtractedBudget || tender.autoExtractedLocation || tender.autoExtractedDeadlines) && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Brain className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-blue-900">AI EXTRACTED</h3>
              <span className="text-sm text-blue-600">Auto-extracted from uploaded documents</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tender.autoExtractedTitle && (
                <div>
                  <div className="text-sm font-medium text-blue-800">TITLE:</div>
                  <div className="text-sm text-blue-700">{tender.autoExtractedTitle}</div>
                </div>
              )}
              {tender.autoExtractedBudget && (
                <div>
                  <div className="text-sm font-medium text-blue-800">BUDGET:</div>
                  <div className="text-sm text-blue-700">{tender.autoExtractedBudget}</div>
                </div>
              )}
              {tender.autoExtractedLocation && (
                <div>
                  <div className="text-sm font-medium text-blue-800">LOCATION:</div>
                  <div className="text-sm text-blue-700">{tender.autoExtractedLocation}</div>
                </div>
              )}
              {tender.autoExtractedDeadlines && (
                <div>
                  <div className="text-sm font-medium text-blue-800">SUBMISSION DEADLINE:</div>
                  <div className="text-sm text-blue-700">{tender.autoExtractedDeadlines}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Winning Capabilities Analysis */}
        {(tender.capabilityScore !== null && tender.capabilityScore > 0) && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-900">WINNING CAPABILITIES</h3>
              <span className="text-sm text-green-600">Calculated from company documents</span>
            </div>
            
            {/* Capability Score */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{tender.capabilityScore}%</div>
                <div className="text-sm text-green-600">Capability Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">
                  {tender.matchedRequirements || 0}/{tender.totalRequirements || 0}
                </div>
                <div className="text-sm text-green-600">Requirements Met</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-700">{tender.winProbability || 0}%</div>
                <div className="text-sm text-green-600">Win Probability</div>
              </div>
            </div>

            {/* Strengths and Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tender.strengths && (
                <div>
                  <div className="text-sm font-medium text-green-800 mb-2">✅ STRENGTHS:</div>
                  <div className="space-y-1">
                    {JSON.parse(tender.strengths).map((strength: string, index: number) => (
                      <div key={index} className="text-sm text-green-700">• {strength}</div>
                    ))}
                  </div>
                </div>
              )}
              {tender.weaknesses && (
                <div>
                  <div className="text-sm font-medium text-orange-800 mb-2">⚠️ AREAS TO IMPROVE:</div>
                  <div className="space-y-1">
                    {JSON.parse(tender.weaknesses).map((weakness: string, index: number) => (
                      <div key={index} className="text-sm text-orange-700">• {weakness}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {tender.recommendations && (
              <div className="mt-4">
                <div className="text-sm font-medium text-blue-800 mb-2">📋 RECOMMENDATIONS:</div>
                <div className="space-y-1">
                  {JSON.parse(tender.recommendations).map((rec: string, index: number) => (
                    <div key={index} className="text-sm text-blue-700">• {rec}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Deadline</div>
              <div className="font-medium">
                {tender.autoExtractedDeadlines || (tender.deadline ? new Date(tender.deadline).toLocaleDateString() : 'TBD')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Budget</div>
              <div className="font-medium">
                {tender.autoExtractedBudget || (tender.value ? `$${tender.value.toLocaleString()}` : 'TBD')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Team Size</div>
              <div className="font-medium">
                {tender.teamMembers?.length || 0} members
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Current Stage</div>
              <div className="font-medium">
                {tender.stage || 'Planning'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* NotebookLM-Style Workspace */}
      <div className="flex flex-col flex-1">
        {/* Main Content Area */}
        <div className="flex flex-1">
          {/* Left Panel - Sources & Insights */}
          <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab("sources")}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      activeTab === "sources" 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Sources
                  </button>
                  <button
                    onClick={() => setActiveTab("insights")}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      activeTab === "insights" 
                        ? "bg-blue-600 text-white" 
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Brain size={14} className="inline mr-1" />
                    Insights
                  </button>
                </div>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {activeTab === "sources" ? (
                <SourcesPanel tenderId={tenderId} />
              ) : (
                <InsightsPanel tenderId={tenderId} />
              )}
            </div>
          </div>

          {/* Center Panel - Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={20} className="text-blue-600" />
                  <h2 className="text-lg font-semibold">AI Chat</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <Settings size={16} />
                  </button>
                  <div className="w-4 h-4 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatPanel tenderId={tenderId} />
            </div>
          </div>
        </div>

        {/* Bottom Panel - Studio */}
        <div className="h-32 border-t border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-gray-600" />
                <h2 className="text-lg font-semibold">Studio</h2>
              </div>
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="p-4 h-full flex items-center justify-center gap-4">
            <a
              href={`/en/studio?tenderId=${tenderId}`}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <Zap size={20} />
              Studio Tools
            </a>
            <a
              href={`/en/document-comparison?tenderId=${tenderId}`}
              className="flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              <FileText size={20} />
              Document Comparison
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
