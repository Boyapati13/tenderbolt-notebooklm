"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, DollarSign, Users, Target, AlertCircle, Settings, Search } from "lucide-react";
import Link from "next/link";
import { SourcesPanel } from "@/components/sources-panel";
import { ChatPanel } from "@/components/chat-panel";
import { StudioPanel } from "@/components/studio-panel";
import { DocumentComparisonPanel } from "@/components/document-comparison-panel";

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
  location?: string;
  autoExtractedTitle?: string;
  autoExtractedBudget?: string;
  autoExtractedLocation?: string;
  autoExtractedDeadlines?: string;
  autoSummary?: string;
  gapAnalysis?: string;
  stages?: Array<{
    id: string;
    name: string;
    status: string;
    dueDate?: string;
  }>;
};

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId as string;
  
  const [tender, setTender] = useState<Tender | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      fetchTenderData();
    }
  }, [projectId]);

  useEffect(() => {
    // Listen for document upload events to refresh tender data
    const handleDocumentUpload = () => {
      refreshTenderData();
    };

    // Listen for custom events
    window.addEventListener('documentUploaded', handleDocumentUpload);
    window.addEventListener('documentProcessed', handleDocumentUpload);

    // Also set up a periodic refresh every 30 seconds to catch any missed updates
    const refreshInterval = setInterval(() => {
      refreshTenderData();
    }, 30000);

    return () => {
      window.removeEventListener('documentUploaded', handleDocumentUpload);
      window.removeEventListener('documentProcessed', handleDocumentUpload);
      clearInterval(refreshInterval);
    };
  }, [projectId]);

  const fetchTenderData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/tenders/${projectId}`);
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

  const refreshTenderData = async () => {
    try {
      const response = await fetch(`/api/tenders/${projectId}`);
      const data = await response.json();
      if (data.tender) {
        setTender(data.tender);
      }
    } catch (error) {
      console.error("Error refreshing tender data:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "won": return "text-green-600 bg-green-100";
      case "lost": return "text-red-600 bg-red-100";
      case "active": return "text-blue-600 bg-blue-100";
      case "completed": return "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700";
      default: return "text-yellow-600 bg-yellow-100";
    }
  };

  const getWinProbabilityColor = (probability: number) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const handleBack = () => {
    router.push("/projects");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!tender) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-slate-400 dark:text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">Project not found</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-4">The requested project could not be loaded.</p>
          <button
            onClick={handleBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
      {/* Project Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="flex items-center gap-2 px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Projects
            </button>
            <div className="h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {tender.autoExtractedTitle || tender.title}
              </h1>
              <div className="flex items-center gap-4 mt-2">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(tender.status)}`}>
                  {tender.status}
                </span>
                <span className="text-sm text-slate-600 dark:text-slate-400">
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
            {/* Show AI-extracted budget if available, otherwise show manual value */}
            {(tender.autoExtractedBudget || tender.value) && (
              <div className="text-center">
                <div className="text-sm text-gray-600">Budget</div>
                <div className="text-2xl font-bold text-gray-900">
                  {tender.autoExtractedBudget || (tender.value ? `$${tender.value.toLocaleString()}` : 'TBD')}
                </div>
              </div>
            )}
            {/* Show AI-extracted deadline if available, otherwise show manual deadline */}
            {(tender.autoExtractedDeadlines || tender.deadline) && (
              <div className="text-center">
                <div className="text-sm text-gray-600">Deadline</div>
                <div className="text-2xl font-bold text-gray-900">
                  {tender.autoExtractedDeadlines || (tender.deadline ? new Date(tender.deadline).toLocaleDateString() : 'TBD')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* AI Auto-Extracted Info - Highlighted Banner */}
        {(tender.autoExtractedTitle || tender.autoExtractedBudget || tender.autoExtractedLocation || tender.autoExtractedDeadlines) && (
          <div className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">🤖 AI EXTRACTED</span>
              <span className="text-sm text-gray-600">Auto-extracted from uploaded documents</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {tender.autoExtractedTitle && (
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Title</div>
                  <div className="font-medium text-gray-900">{tender.autoExtractedTitle}</div>
                </div>
              )}
              {tender.autoExtractedBudget && (
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Budget</div>
                  <div className="font-medium text-green-700">{tender.autoExtractedBudget}</div>
                </div>
              )}
              {tender.autoExtractedLocation && (
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Location</div>
                  <div className="font-medium text-gray-900">{tender.autoExtractedLocation}</div>
                </div>
              )}
              {tender.autoExtractedDeadlines && (
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">Submission Deadline</div>
                  <div className="font-medium text-orange-700 text-sm">{tender.autoExtractedDeadlines}</div>
                </div>
              )}
            </div>
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
          {/* Left Panel - Sources */}
          <div className="w-80 border-r border-gray-200 bg-white flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Sources</h2>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              <SourcesPanel tenderId={projectId} onDocumentUploaded={refreshTenderData} />
            </div>
          </div>

          {/* Center Panel - Chat */}
          <div className="flex-1 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">AI Chat</h2>
                <div className="w-4 h-4 bg-gray-300 rounded"></div>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <ChatPanel tenderId={projectId} />
            </div>
          </div>
        </div>

        {/* Bottom Panel - Navigation Buttons */}
        <div className="h-32 border-t border-gray-200 bg-white flex items-center justify-center">
          <div className="flex items-center gap-6">
            <Link
              href="/studio"
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Settings size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Studio Tools</div>
                <div className="text-sm opacity-90">AI-powered content creation</div>
              </div>
            </Link>
            
            <Link
              href="/document-comparison"
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Target size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Document Comparison</div>
                <div className="text-sm opacity-90">AI-powered proposal analysis</div>
              </div>
            </Link>

            <Link
              href="/internet-search"
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Search size={20} />
              </div>
              <div className="text-left">
                <div className="font-semibold text-lg">Internet Search</div>
                <div className="text-sm opacity-90">AI-powered information research</div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
