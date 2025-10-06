"use client";

import { useState } from "react";
import { StudioPanel } from "@/components/studio-panel";
import { ArrowLeft, Settings, Sparkles, BookOpen, Bot, Network, FileText, Volume2, Video, HelpCircle, Zap, Target, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function StudioPage() {
  const [activeTab, setActiveTab] = useState<"studio" | "ai-assistant" | "study-tools">("studio");

  const quickAccessTools = [
    {
      id: "ai-assistant",
      name: "AI Assistant",
      description: "Chat with your documents using AI",
      icon: <Bot size={24} />,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/en/ai-assistant"
    },
    {
      id: "study-tools",
      name: "Study Tools",
      description: "Flashcards, quizzes, and learning materials",
      icon: <BookOpen size={24} />,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/en/study-tools"
    },
    {
      id: "document-comparison",
      name: "Document Comparison",
      description: "AI-powered proposal analysis and review",
      icon: <FileText size={24} />,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      href: "/en/document-comparison"
    },
    {
      id: "ai-proposal-writing",
      name: "AI Proposal Writing",
      description: "Generate and enhance proposals with AI",
      icon: <FileText size={24} />,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/en/ai-proposal-writing"
    },
    {
      id: "mind-map",
      name: "Mind Maps",
      description: "Visualize connections and relationships",
      icon: <Network size={24} />,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      href: "/en/workspace"
    },
    {
      id: "reports",
      name: "Reports",
      description: "Generate comprehensive analysis reports",
      icon: <FileText size={24} />,
      color: "text-teal-600",
      bgColor: "bg-teal-50",
      href: "/en/workspace"
    }
  ];

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
                <Sparkles className="text-blue-600" />
                Studio Tools
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
                AI-powered tools for content creation, analysis, and presentation
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200 dark:border-slate-700">
              <Target size={16} className="text-green-500" />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">All Features Active</span>
            </div>
            <Settings size={20} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer" />
          </div>
        </div>

        {/* Quick Access Tabs */}
        <div className="flex space-x-1 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl p-1 border border-slate-200 dark:border-slate-700">
          {[
            { id: "studio", label: "Studio Tools", icon: <Zap size={16} /> },
            { id: "ai-assistant", label: "AI Assistant", icon: <Bot size={16} /> },
            { id: "study-tools", label: "Study Tools", icon: <BookOpen size={16} /> }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Quick Access Tools */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <Target size={20} className="text-blue-600" />
            Quick Access to NotebookLM Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickAccessTools.map((tool) => (
              <Link
                key={tool.id}
                href={tool.href}
                className="group p-4 rounded-lg border border-slate-200 dark:border-slate-600 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200 hover:shadow-lg hover:scale-[1.02] bg-white dark:bg-slate-700"
              >
                <div className={`w-12 h-12 ${tool.bgColor} rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-200`}>
                  <div className={tool.color}>{tool.icon}</div>
                </div>
                <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{tool.name}</h4>
                <p className="text-sm text-slate-600 dark:text-slate-400">{tool.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200 dark:border-slate-700 p-6">
          <div className="min-h-[70vh]">
            {activeTab === "studio" && <StudioPanel tenderId="global_documents" />}
            {activeTab === "ai-assistant" && (
              <div className="text-center py-12">
                <Bot size={48} className="mx-auto text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">AI Assistant</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Chat with your documents using advanced AI</p>
                <Link
                  href="/en/ai-assistant"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Bot size={16} />
                  Open AI Assistant
                </Link>
              </div>
            )}
            {activeTab === "study-tools" && (
              <div className="text-center py-12">
                <BookOpen size={48} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">Study Tools</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6">Generate flashcards, quizzes, and study materials</p>
                <Link
                  href="/en/study-tools"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <BookOpen size={16} />
                  Open Study Tools
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Feature Status */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            NotebookLM Features Status
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: "Document Upload", status: "✅ Active", icon: <FileText size={16} /> },
              { name: "AI Chat", status: "✅ Active", icon: <Bot size={16} /> },
              { name: "Mind Maps", status: "✅ Active", icon: <Network size={16} /> },
              { name: "Study Tools", status: "✅ Active", icon: <BookOpen size={16} /> },
              { name: "Audio Overview", status: "✅ Active", icon: <Volume2 size={16} /> },
              { name: "Video Overview", status: "✅ Active", icon: <Video size={16} /> },
              { name: "Reports", status: "✅ Active", icon: <FileText size={16} /> },
              { name: "Collaboration", status: "✅ Active", icon: <Users size={16} /> }
            ].map((feature, index) => (
              <div key={index} className="flex items-center gap-2 p-3 bg-white/60 dark:bg-slate-800/60 rounded-lg">
                <div className="text-blue-600">{feature.icon}</div>
                <div>
                  <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{feature.name}</div>
                  <div className="text-xs text-green-600 font-medium">{feature.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
