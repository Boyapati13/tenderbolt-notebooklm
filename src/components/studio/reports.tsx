"use client";

import { useState, useRef } from "react";
import { FileText, Download, RefreshCw, Settings, BarChart3, PieChart, 
  LineChart, TrendingUp, Eye, Edit3, Share2, Save, Copy, Printer,
  Filter, Search, Calendar, Users, Target, Award, Lightbulb, 
  AlertTriangle, CheckCircle, Clock, Zap, Sparkles } from "lucide-react";

interface ReportsProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

interface ReportSection {
  id: string;
  title: string;
  type: "text" | "chart" | "table" | "list" | "summary";
  content: any;
  order: number;
  metadata: {
    importance: number;
    category: string;
    tags: string[];
  };
}

interface ReportData {
  title: string;
  sections: ReportSection[];
  metadata: {
    generatedAt: string;
    complexity: string;
    targetAudience: string;
    reportType: string;
    totalSections: number;
    wordCount: number;
  };
  insights: {
    keyFindings: string[];
    recommendations: string[];
    risks: string[];
    opportunities: string[];
  };
}

interface ChartData {
  type: "bar" | "pie" | "line" | "area";
  title: string;
  data: any[];
  labels: string[];
  colors: string[];
}

export function Reports({ tenderId, interactiveMode = "preview" }: ReportsProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState("comprehensive");
  const [selectedAudience, setSelectedAudience] = useState("stakeholders");
  const [showInsights, setShowInsights] = useState(true);
  const [recentReports, setRecentReports] = useState<ReportData[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const reportRef = useRef<HTMLDivElement>(null);

  const reportFormats = [
    { id: "comprehensive", name: "Comprehensive", description: "Full detailed analysis", icon: "📊" },
    { id: "executive", name: "Executive Summary", description: "High-level overview", icon: "📋" },
    { id: "technical", name: "Technical", description: "Detailed technical analysis", icon: "🔧" },
    { id: "financial", name: "Financial", description: "Budget and cost analysis", icon: "💰" },
    { id: "risk", name: "Risk Assessment", description: "Risk analysis and mitigation", icon: "⚠️" },
    { id: "compliance", name: "Compliance", description: "Regulatory compliance check", icon: "✅" }
  ];

  const audienceTypes = [
    { id: "stakeholders", name: "Stakeholders", description: "Board members and executives" },
    { id: "technical", name: "Technical Team", description: "Developers and engineers" },
    { id: "management", name: "Management", description: "Project managers and leads" },
    { id: "client", name: "Client", description: "External client presentation" }
  ];

  const categories = [
    "overview", "analysis", "recommendations", "risks", "opportunities", 
    "financial", "technical", "compliance", "timeline", "resources"
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: tenderId || "tender_default",
          format: selectedFormat,
          audience: selectedAudience,
          interactiveMode
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setReportData(data.reportData);
        // Add to recent reports
        setRecentReports(prev => [data.reportData, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleFavorite = (sectionId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(sectionId)) {
      newFavorites.delete(sectionId);
    } else {
      newFavorites.add(sectionId);
    }
    setFavorites(newFavorites);
  };

  const downloadReport = () => {
    if (!reportData) return;
    
    const content = generateReportContent();
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateReportContent = () => {
    if (!reportData) return "";
    
    let content = `${reportData.title}\n${"=".repeat(reportData.title.length)}\n\n`;
    content += `Generated: ${reportData.metadata.generatedAt}\n`;
    content += `Type: ${reportData.metadata.reportType}\n`;
    content += `Audience: ${reportData.metadata.targetAudience}\n`;
    content += `Complexity: ${reportData.metadata.complexity}\n`;
    content += `Sections: ${reportData.metadata.totalSections}\n`;
    content += `Word Count: ${reportData.metadata.wordCount}\n\n`;
    
    content += `EXECUTIVE SUMMARY:\n`;
    reportData.insights.keyFindings.forEach((finding, index) => {
      content += `${index + 1}. ${finding}\n`;
    });
    
    content += `\nRECOMMENDATIONS:\n`;
    reportData.insights.recommendations.forEach((rec, index) => {
      content += `${index + 1}. ${rec}\n`;
    });
    
    content += `\nRISKS:\n`;
    reportData.insights.risks.forEach((risk, index) => {
      content += `${index + 1}. ${risk}\n`;
    });
    
    content += `\nOPPORTUNITIES:\n`;
    reportData.insights.opportunities.forEach((opp, index) => {
      content += `${index + 1}. ${opp}\n`;
    });
    
    content += `\nDETAILED SECTIONS:\n`;
    reportData.sections.forEach((section, index) => {
      content += `\n${index + 1}. ${section.title}\n`;
      content += `Type: ${section.type}\n`;
      content += `Category: ${section.metadata.category}\n`;
      content += `Importance: ${section.metadata.importance}/10\n`;
      content += `Content:\n${JSON.stringify(section.content, null, 2)}\n`;
    });
    
    return content;
  };

  const printReport = () => {
    if (reportRef.current) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>${reportData?.title || 'Report'}</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
                .section { margin-bottom: 30px; }
                .chart { text-align: center; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; margin: 10px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              ${reportRef.current.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const filteredSections = reportData?.sections.filter(section => {
    const matchesCategory = filterCategory === "all" || section.metadata.category === filterCategory;
    const matchesSearch = searchTerm === "" || 
      section.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  }) || [];

  const selectedSectionData = reportData?.sections.find(section => section.id === selectedSection);

  const renderChart = (chartData: ChartData) => {
    // This would be replaced with actual chart rendering library like Chart.js or D3
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center">
        <h4 className="font-semibold text-gray-900 mb-2">{chartData.title}</h4>
        <div className="text-sm text-gray-600">
          {chartData.type.toUpperCase()} Chart - {chartData.data.length} data points
        </div>
        <div className="mt-2 text-xs text-gray-500">
          Labels: {chartData.labels.join(", ")}
        </div>
      </div>
    );
  };

  const renderTable = (tableData: any) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-300">
          <thead className="bg-gray-50">
            <tr>
              {tableData.headers.map((header: string, index: number) => (
                <th key={index} className="px-4 py-2 text-left text-sm font-medium text-gray-900 border-b">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row: any[], rowIndex: number) => (
              <tr key={rowIndex} className="hover:bg-gray-50">
                {row.map((cell: any, cellIndex: number) => (
                  <td key={cellIndex} className="px-4 py-2 text-sm text-gray-700 border-b">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
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
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Advanced Settings"
          >
            <Settings size={16} />
          </button>
          {reportData && (
            <>
              <button 
                onClick={downloadReport}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Download Report"
              >
                <Download size={16} />
              </button>
                <button 
                  onClick={printReport}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Print Report"
                >
                  <Printer size={16} />
                </button>
            </>
          )}
        </div>
      </div>

      {/* Report Format Selection */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Report Format</h4>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {reportFormats.map((format) => (
            <button
              key={format.id}
              onClick={() => setSelectedFormat(format.id)}
              className={`p-3 rounded-lg border text-left transition-all duration-200 ${
                selectedFormat === format.id
                  ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{format.icon}</span>
                <span className="font-medium text-sm">{format.name}</span>
              </div>
              <p className="text-xs text-gray-600">{format.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Advanced Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Target Audience</label>
              <select
                value={selectedAudience}
                onChange={(e) => setSelectedAudience(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                {audienceTypes.map(audience => (
                  <option key={audience.id} value={audience.id}>
                    {audience.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Include Insights</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showInsights}
                  onChange={(e) => setShowInsights(e.target.checked)}
                  className="rounded border-gray-300 text-yellow-600 focus:ring-yellow-500"
                />
                <span className="text-sm text-gray-700">Show key insights</span>
              </label>
            </div>
          </div>
        </div>
      )}

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
              <span>Generated: {new Date(reportData.metadata.generatedAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>{reportData.metadata.totalSections} Sections</span>
              <span>•</span>
              <span>{reportData.metadata.wordCount} Words</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                {reportData.metadata.complexity}
              </div>
              <div className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                {reportData.metadata.targetAudience}
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search sections..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Report Content */}
          <div ref={reportRef} className="p-6 space-y-6">
            {/* Key Insights */}
            {showInsights && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h5 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                  <Lightbulb size={16} />
                  Key Insights
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h6 className="font-medium text-blue-800 mb-2">Key Findings</h6>
                    <ul className="space-y-1">
                      {reportData.insights.keyFindings.map((finding, index) => (
                        <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                          <CheckCircle size={14} className="mt-0.5 flex-shrink-0" />
                          {finding}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h6 className="font-medium text-blue-800 mb-2">Recommendations</h6>
                    <ul className="space-y-1">
                      {reportData.insights.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-blue-700 flex items-start gap-2">
                          <Target size={14} className="mt-0.5 flex-shrink-0" />
                          {rec}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Report Sections */}
            <div className="space-y-6">
              {filteredSections.map((section, index) => (
                <div key={section.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900">{section.title}</h5>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleFavorite(section.id)}
                        className={`p-1 rounded transition-colors ${
                          favorites.has(section.id) 
                            ? "text-yellow-500 hover:text-yellow-600" 
                            : "text-gray-300 hover:text-yellow-500"
                        }`}
                      >
                        <Target size={16} fill={favorites.has(section.id) ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => setSelectedSection(selectedSection === section.id ? null : section.id)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-2">
                    {section.type.charAt(0).toUpperCase() + section.type.slice(1)} • 
                    Importance: {section.metadata.importance}/10
                  </div>

                  {/* Section Content */}
                  <div className="mt-3">
                    {section.type === "chart" && renderChart(section.content)}
                    {section.type === "table" && renderTable(section.content)}
                    {section.type === "text" && (
                      <div className="prose prose-sm max-w-none">
                        <p className="text-gray-700">{section.content}</p>
                      </div>
                    )}
                    {section.type === "list" && (
                      <ul className="space-y-1">
                        {section.content.map((item: string, itemIndex: number) => (
                          <li key={itemIndex} className="text-sm text-gray-700 flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full mt-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    )}
                    {section.type === "summary" && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm text-gray-700">{section.content}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Controls */}
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {filteredSections.length} of {reportData.metadata.totalSections} sections visible
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <Share2 size={16} />
                  Share
                </button>
                <button 
                  onClick={downloadReport}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Download size={16} />
                  Download
                </button>
                <button 
                  onClick={printReport}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Printer size={16} />
                  Print
                </button>
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

      {/* Recent Reports */}
      {recentReports.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Reports</h4>
          <div className="space-y-2">
            {recentReports.map((report, index) => (
              <button
                key={index}
                onClick={() => setReportData(report)}
                className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{report.title}</h5>
                    <p className="text-xs text-gray-600">{report.metadata.reportType} • {report.metadata.totalSections} sections</p>
                  </div>
                  <div className="text-xs text-gray-500">{report.metadata.wordCount} words</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
