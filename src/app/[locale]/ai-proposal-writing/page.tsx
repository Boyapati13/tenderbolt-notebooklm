"use client";

import { useState } from "react";
import { ArrowLeft, FileText, Sparkles, Target, Brain, CheckCircle, AlertCircle, TrendingUp, Users, Clock, DollarSign } from "lucide-react";
import Link from "next/link";

interface ProposalSection {
  id: string;
  title: string;
  content: string;
  status: "draft" | "review" | "approved";
  wordCount: number;
  lastModified: string;
}

interface ProposalData {
  id: string;
  title: string;
  tenderId: string;
  status: "draft" | "in_progress" | "review" | "finalized";
  sections: ProposalSection[];
  totalWordCount: number;
  completionPercentage: number;
  lastModified: string;
  aiSuggestions: string[];
}

export default function AIProposalWritingPage() {
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [proposals, setProposals] = useState<ProposalData[]>([
    {
      id: "prop-1",
      title: "Highway Infrastructure Project Proposal",
      tenderId: "tender-1",
      status: "in_progress",
      sections: [
        {
          id: "exec-summary",
          title: "Executive Summary",
          content: "Our company proposes to deliver a comprehensive highway infrastructure solution...",
          status: "draft",
          wordCount: 250,
          lastModified: "2024-01-15"
        },
        {
          id: "technical-approach",
          title: "Technical Approach",
          content: "Our technical approach focuses on modern construction methodologies...",
          status: "review",
          wordCount: 1200,
          lastModified: "2024-01-14"
        },
        {
          id: "team-qualifications",
          title: "Team Qualifications",
          content: "Our team consists of certified engineers with 15+ years experience...",
          status: "approved",
          wordCount: 800,
          lastModified: "2024-01-13"
        }
      ],
      totalWordCount: 2250,
      completionPercentage: 75,
      lastModified: "2024-01-15",
      aiSuggestions: [
        "Add more specific technical specifications",
        "Include risk mitigation strategies",
        "Enhance cost breakdown details"
      ]
    }
  ]);

  const [newProposalTitle, setNewProposalTitle] = useState("");
  const [showNewProposalForm, setShowNewProposalForm] = useState(false);

  const generateProposal = async (tenderId: string) => {
    setIsGenerating(true);
    try {
      // Simulate AI proposal generation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newProposal: ProposalData = {
        id: `prop-${Date.now()}`,
        title: newProposalTitle || "AI-Generated Proposal",
        tenderId,
        status: "draft",
        sections: [
          {
            id: "exec-summary",
            title: "Executive Summary",
            content: "AI-generated executive summary based on tender requirements...",
            status: "draft",
            wordCount: 200,
            lastModified: new Date().toISOString().split('T')[0]
          },
          {
            id: "technical-approach",
            title: "Technical Approach",
            content: "AI-generated technical approach section...",
            status: "draft",
            wordCount: 800,
            lastModified: new Date().toISOString().split('T')[0]
          }
        ],
        totalWordCount: 1000,
        completionPercentage: 30,
        lastModified: new Date().toISOString().split('T')[0],
        aiSuggestions: [
          "Review technical specifications for accuracy",
          "Add company-specific examples",
          "Include compliance documentation"
        ]
      };

      setProposals(prev => [newProposal, ...prev]);
      setShowNewProposalForm(false);
      setNewProposalTitle("");
    } catch (error) {
      console.error("Error generating proposal:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "text-yellow-600 bg-yellow-100";
      case "in_progress": return "text-blue-600 bg-blue-100";
      case "review": return "text-orange-600 bg-orange-100";
      case "finalized": return "text-green-600 bg-green-100";
      case "approved": return "text-green-600 bg-green-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft": return <FileText size={16} />;
      case "in_progress": return <Clock size={16} />;
      case "review": return <AlertCircle size={16} />;
      case "finalized": return <CheckCircle size={16} />;
      case "approved": return <CheckCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-blue-900 dark:to-indigo-900">
      <div className="p-6 space-y-6">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/en/workspace"
              className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-white/80 rounded-lg transition-all duration-200 backdrop-blur-sm"
            >
              <ArrowLeft size={20} />
              Back to Workspace
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                <Brain className="text-purple-600" />
                AI Proposal Writing
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                AI-powered proposal generation and writing assistance
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700">
              <Sparkles size={16} className="text-purple-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">AI Enhanced</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Proposals</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">{proposals.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {proposals.filter(p => p.status === "finalized").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">In Progress</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {proposals.filter(p => p.status === "in_progress").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Completion</p>
                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                  {Math.round(proposals.reduce((acc, p) => acc + p.completionPercentage, 0) / proposals.length)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* New Proposal Form */}
        {showNewProposalForm && (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4">Create New AI Proposal</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Proposal Title
                </label>
                <input
                  type="text"
                  value={newProposalTitle}
                  onChange={(e) => setNewProposalTitle(e.target.value)}
                  placeholder="Enter proposal title..."
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => generateProposal("global_documents")}
                  disabled={isGenerating}
                  className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Brain size={16} />
                      Generate with AI
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowNewProposalForm(false)}
                  className="px-6 py-2 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Proposals List */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Your Proposals</h3>
            <button
              onClick={() => setShowNewProposalForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Brain size={16} />
              New AI Proposal
            </button>
          </div>

          <div className="space-y-4">
            {proposals.map((proposal) => (
              <div
                key={proposal.id}
                className="p-4 border border-slate-200 dark:border-slate-600 rounded-lg hover:border-slate-300 dark:hover:border-slate-500 transition-colors cursor-pointer bg-white dark:bg-slate-700"
                onClick={() => setSelectedProposal(proposal.id)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                      {proposal.title}
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {proposal.sections.length} sections • {proposal.totalWordCount} words • 
                      Last modified: {proposal.lastModified}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(proposal.status)}`}>
                      {getStatusIcon(proposal.status)}
                      {proposal.status.replace('_', ' ')}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {proposal.completionPercentage}%
                      </div>
                      <div className="w-16 bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${proposal.completionPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI Suggestions */}
                {proposal.aiSuggestions.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles size={14} className="text-blue-600" />
                      <span className="text-sm font-medium text-blue-800 dark:text-blue-200">AI Suggestions</span>
                    </div>
                    <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                      {proposal.aiSuggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Sections Preview */}
                <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-2">
                  {proposal.sections.map((section) => (
                    <div key={section.id} className="p-2 bg-slate-50 dark:bg-slate-600 rounded text-xs">
                      <div className="font-medium text-slate-700 dark:text-slate-300">{section.title}</div>
                      <div className="text-slate-500 dark:text-slate-400">
                        {section.wordCount} words • {section.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Features Showcase */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Brain size={20} className="text-purple-600" />
            AI Proposal Writing Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Auto-Generation", description: "AI creates proposal sections based on tender requirements", icon: <Sparkles size={16} /> },
              { name: "Content Enhancement", description: "Improve existing content with AI suggestions", icon: <TrendingUp size={16} /> },
              { name: "Compliance Check", description: "Ensure proposals meet all tender requirements", icon: <CheckCircle size={16} /> },
              { name: "Quality Scoring", description: "AI rates proposal quality and provides feedback", icon: <Target size={16} /> }
            ].map((feature, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                <div className="text-purple-600">{feature.icon}</div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{feature.name}</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">{feature.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
