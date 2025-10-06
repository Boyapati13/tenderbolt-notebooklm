"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, DollarSign, Users, Target, AlertCircle, Brain, Settings, Zap } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"sources" | "insights">("sources");

  useEffect(() => {
    fetchTenderData();
  }, [tenderId]);

  const fetchTenderData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tenders/${tenderId}`);
      const data = await response.json();
      if (data.tender) {
        setTender(data.tender);
      }
    } catch (error) {
      console.error("Error fetching tender data:", error);
    } finally {
      setIsLoading(false);
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
              <h1 className="text-2xl font-bold text-gray-900">{tender.title}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tender.status)}`}>
                  {tender.status}
                </span>
                <span className="text-sm text-gray-600">
                  Created {new Date(tender.createdAt).toLocaleDateString()}
                </span>
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

        {/* Project Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-gray-600">Deadline</div>
              <div className="font-medium">
                {tender.deadline ? new Date(tender.deadline).toLocaleDateString() : 'TBD'}
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
                ${tender.value?.toLocaleString() || 'TBD'}
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
        <div className="h-64 border-t border-gray-200 bg-white">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings size={20} className="text-gray-600" />
                <h2 className="text-lg font-semibold">Studio</h2>
              </div>
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
          <div className="p-4 h-full overflow-auto">
            <StudioPanel tenderId={tenderId} />
          </div>
        </div>
      </div>
    </div>
  );
}
