"use client";

import { useState, useEffect } from "react";
import { Brain, FileText, AlertTriangle, Calendar, CheckCircle, Filter } from "lucide-react";

type Insight = {
  id: string;
  type: "requirement" | "compliance" | "risk" | "deadline";
  content: string;
  citation?: string;
  createdAt: string;
};

type InsightType = "requirement" | "compliance" | "risk" | "deadline" | "all";

const insightIcons = {
  requirement: <FileText size={16} className="text-blue-600" />,
  compliance: <CheckCircle size={16} className="text-green-600" />,
  risk: <AlertTriangle size={16} className="text-red-600" />,
  deadline: <Calendar size={16} className="text-orange-600" />,
};

const insightColors = {
  requirement: "bg-blue-50 border-blue-200",
  compliance: "bg-green-50 border-green-200",
  risk: "bg-red-50 border-red-200",
  deadline: "bg-orange-50 border-orange-200",
};

export function InsightsPanel({ tenderId }: { tenderId?: string }) {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<InsightType>("all");

  useEffect(() => {
    fetchInsights();
  }, [tenderId]);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const url = tenderId ? `/api/insights?tenderId=${tenderId}` : "/api/insights";
      const response = await fetch(url);
      const data = await response.json();
      setInsights(data.insights || []);
    } catch (error) {
      console.error("Failed to fetch insights:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = insights.filter(insight => 
    filter === "all" || insight.type === filter
  );

  const insightCounts = {
    requirement: insights.filter(i => i.type === "requirement").length,
    compliance: insights.filter(i => i.type === "compliance").length,
    risk: insights.filter(i => i.type === "risk").length,
    deadline: insights.filter(i => i.type === "deadline").length,
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain size={20} className="text-gray-600" />
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>
        <button
          onClick={fetchInsights}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            filter === "all" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          All ({insights.length})
        </button>
        <button
          onClick={() => setFilter("requirement")}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            filter === "requirement" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Requirements ({insightCounts.requirement})
        </button>
        <button
          onClick={() => setFilter("compliance")}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            filter === "compliance" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Compliance ({insightCounts.compliance})
        </button>
        <button
          onClick={() => setFilter("risk")}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            filter === "risk" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Risks ({insightCounts.risk})
        </button>
        <button
          onClick={() => setFilter("deadline")}
          className={`px-3 py-1 text-sm rounded-full whitespace-nowrap ${
            filter === "deadline" 
              ? "bg-blue-600 text-white" 
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Deadlines ({insightCounts.deadline})
        </button>
      </div>

      {/* Insights List */}
      <div className="space-y-3">
        {filteredInsights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Brain size={32} className="mx-auto mb-2 text-gray-300" />
            <p className="text-sm">
              {insights.length === 0 
                ? "No insights yet. Upload documents and analyze them to extract insights."
                : `No ${filter} insights found.`
              }
            </p>
          </div>
        ) : (
          filteredInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-3 rounded-lg border ${insightColors[insight.type]}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5">
                  {insightIcons[insight.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 mb-1">
                    {insight.type.charAt(0).toUpperCase() + insight.type.slice(1)}
                  </div>
                  <div className="text-sm text-gray-700 mb-2">
                    {insight.content}
                  </div>
                  {insight.citation && (
                    <div className="text-xs text-gray-500">
                      Source: {insight.citation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Actions */}
      {tenderId && (
        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-2">Quick Actions</div>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              Generate Summary Report
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              Export Insights
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              Create Action Items
            </button>
          </div>
        </div>
      )}
    </div>
  );
}