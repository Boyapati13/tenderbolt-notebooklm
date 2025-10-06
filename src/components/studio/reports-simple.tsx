"use client";

import { useState } from "react";
import { FileText, Download, RefreshCw, Settings } from "lucide-react";

interface ReportsProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

export function Reports({ tenderId, interactiveMode = "preview" }: ReportsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: tenderId || "tender_default",
          interactiveMode
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setReportData(data.reportData);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
            <FileText className="text-yellow-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Reports</h3>
            <p className="text-sm text-gray-600">Generate comprehensive analysis reports</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
            <Settings size={16} />
          </button>
          {reportData && (
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Download size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-yellow-600 text-white rounded-xl hover:bg-yellow-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg"
      >
        {isGenerating ? (
          <>
            <RefreshCw className="animate-spin" size={20} />
            Generating Report...
          </>
        ) : (
          <>
            <FileText size={20} />
            Generate Report
          </>
        )}
      </button>

      {/* Report Content */}
      {reportData ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white p-6">
            <h4 className="font-bold text-xl mb-2">{reportData.title}</h4>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span>Generated: {new Date(reportData.metadata?.generatedAt || Date.now()).toLocaleDateString()}</span>
              <span>•</span>
              <span>{reportData.metadata?.totalSections || 0} Sections</span>
              <span>•</span>
              <span>{reportData.metadata?.wordCount || 0} Words</span>
            </div>
          </div>

          <div className="p-6">
            <h5 className="font-semibold text-gray-900 mb-4">Report Content</h5>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h6 className="font-medium text-gray-900 mb-2">Executive Summary</h6>
                <p className="text-sm text-gray-700">
                  This is a comprehensive analysis report generated based on the tender requirements. 
                  The report includes detailed insights, recommendations, and actionable next steps.
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h6 className="font-medium text-gray-900 mb-2">Key Findings</h6>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Analysis of tender requirements and specifications</li>
                  <li>• Evaluation of technical feasibility and challenges</li>
                  <li>• Assessment of resource requirements and timeline</li>
                  <li>• Risk analysis and mitigation strategies</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h6 className="font-medium text-gray-900 mb-2">Recommendations</h6>
                <ul className="space-y-1 text-sm text-gray-700">
                  <li>• Proceed with proposal development</li>
                  <li>• Focus on key differentiators and value proposition</li>
                  <li>• Address potential technical challenges early</li>
                  <li>• Develop comprehensive project timeline</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : !isGenerating && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <FileText size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No report generated yet</h3>
          <p className="text-gray-600 mb-4">Click Generate to create a comprehensive analysis report</p>
        </div>
      )}
    </div>
  );
}
