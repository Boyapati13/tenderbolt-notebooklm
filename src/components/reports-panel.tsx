"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FileText, Download, Printer, RefreshCw, CheckCircle, Settings, Share2, 
  Save, Copy, Edit3, Eye, Maximize2, Users, Zap, Sparkles, Target, 
  BarChart3, TrendingUp, Calendar, Clock, User, Tag, Filter, Search,
  ChevronDown, ChevronRight, ChevronUp, ChevronLeft, MoreHorizontal,
  BookOpen, Presentation, FileSpreadsheet, Image, Video, Music,
  AlertCircle, Info, CheckSquare, Square, Star, Heart, Bookmark,
  Plus, Minus, RotateCcw, Upload, Send, Mail, MessageSquare
} from "lucide-react";

interface ReportsPanelProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

type ReportType = "briefing" | "executive" | "technical" | "study" | "blog" | "proposal" | "analysis" | "presentation";

type ReportFormat = "markdown" | "html" | "pdf" | "docx" | "txt";

type ReportTemplate = {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  estimatedTime: string;
  complexity: "simple" | "moderate" | "complex";
  sections: string[];
  targetAudience: string[];
};

interface Report {
  id: string;
  type: ReportType;
  title: string;
  content: string;
  format: ReportFormat;
  metadata: {
    wordCount: number;
    readingTime: number;
    complexity: "simple" | "moderate" | "complex";
    targetAudience: string[];
    generatedAt: string;
    lastModified: string;
    author: string;
    version: string;
    tags: string[];
  };
  sections: Array<{
    id: string;
    title: string;
    content: string;
    order: number;
    wordCount: number;
  }>;
  analytics: {
    views: number;
    downloads: number;
    shares: number;
    rating: number;
  };
}

const reportTemplates: ReportTemplate[] = [
  {
    id: "briefing",
    name: "Tender Briefing",
    description: "Executive briefing with requirements, risks, and win strategy",
    icon: <FileText size={20} />,
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200",
    estimatedTime: "5-10 min",
    complexity: "moderate",
    sections: ["Executive Summary", "Requirements Analysis", "Risk Assessment", "Win Strategy", "Next Steps"],
    targetAudience: ["Executives", "Project Managers", "Decision Makers"]
  },
  {
    id: "executive",
    name: "Executive Summary",
    description: "One-page summary for decision makers",
    icon: <Presentation size={20} />,
    color: "bg-purple-100 text-purple-700 hover:bg-purple-200",
    estimatedTime: "2-5 min",
    complexity: "simple",
    sections: ["Overview", "Key Points", "Recommendations", "Action Items"],
    targetAudience: ["C-Level Executives", "Board Members"]
  },
  {
    id: "technical",
    name: "Technical Report",
    description: "Detailed technical analysis and recommendations",
    icon: <BarChart3 size={20} />,
    color: "bg-green-100 text-green-700 hover:bg-green-200",
    estimatedTime: "15-30 min",
    complexity: "complex",
    sections: ["Technical Overview", "Architecture Analysis", "Implementation Plan", "Risk Mitigation", "Technical Specifications"],
    targetAudience: ["Technical Teams", "Engineers", "Architects"]
  },
  {
    id: "study",
    name: "Study Guide",
    description: "Comprehensive training guide for team members",
    icon: <BookOpen size={20} />,
    color: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    estimatedTime: "20-45 min",
    complexity: "complex",
    sections: ["Learning Objectives", "Key Concepts", "Case Studies", "Practice Exercises", "Assessment"],
    targetAudience: ["Team Members", "New Hires", "Training Participants"]
  },
  {
    id: "proposal",
    name: "Proposal Document",
    description: "Formal proposal with solution architecture",
    icon: <FileSpreadsheet size={20} />,
    color: "bg-indigo-100 text-indigo-700 hover:bg-indigo-200",
    estimatedTime: "30-60 min",
    complexity: "complex",
    sections: ["Problem Statement", "Solution Overview", "Implementation Timeline", "Budget", "Team Qualifications"],
    targetAudience: ["Clients", "Prospects", "Stakeholders"]
  },
  {
    id: "analysis",
    name: "Market Analysis",
    description: "Competitive analysis and market insights",
    icon: <TrendingUp size={20} />,
    color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
    estimatedTime: "10-20 min",
    complexity: "moderate",
    sections: ["Market Overview", "Competitive Landscape", "Opportunities", "Threats", "Strategic Recommendations"],
    targetAudience: ["Business Analysts", "Strategy Teams", "Marketing"]
  },
  {
    id: "blog",
    name: "Blog Post",
    description: "Engaging content about the opportunity",
    icon: <MessageSquare size={20} />,
    color: "bg-pink-100 text-pink-700 hover:bg-pink-200",
    estimatedTime: "5-15 min",
    complexity: "simple",
    sections: ["Introduction", "Main Content", "Key Takeaways", "Call to Action"],
    targetAudience: ["General Audience", "Blog Readers", "Social Media"]
  },
  {
    id: "presentation",
    name: "Presentation Deck",
    description: "Slide deck for stakeholder presentations",
    icon: <Presentation size={20} />,
    color: "bg-cyan-100 text-cyan-700 hover:bg-cyan-200",
    estimatedTime: "10-25 min",
    complexity: "moderate",
    sections: ["Title Slide", "Agenda", "Problem Statement", "Solution", "Benefits", "Next Steps"],
    targetAudience: ["Stakeholders", "Clients", "Team Members"]
  }
];

const formatOptions = [
  { value: "markdown", label: "Markdown", icon: <FileText size={16} /> },
  { value: "html", label: "HTML", icon: <FileText size={16} /> },
  { value: "pdf", label: "PDF", icon: <FileText size={16} /> },
  { value: "docx", label: "Word", icon: <FileText size={16} /> },
  { value: "txt", label: "Text", icon: <FileText size={16} /> }
];

export function ReportsPanel({ tenderId, interactiveMode = "preview" }: ReportsPanelProps) {
  const [generating, setGenerating] = useState<ReportType | null>(null);
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTemplates, setShowTemplates] = useState(true);
  const [selectedFormat, setSelectedFormat] = useState<ReportFormat>("markdown");
  const [customSections, setCustomSections] = useState<string[]>([]);
  const [reportHistory, setReportHistory] = useState<Report[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAudience, setSelectedAudience] = useState<string[]>([]);
  const [isPresenting, setIsPresenting] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showCustomization, setShowCustomization] = useState(false);
  const [customizationOptions, setCustomizationOptions] = useState({
    tone: "professional",
    length: "medium",
    includeCharts: true,
    includeImages: false,
    includeReferences: true,
    includeAppendices: false,
    customSections: [] as string[],
    branding: {
      companyName: "",
      logo: "",
      primaryColor: "#3B82F6",
      secondaryColor: "#1E40AF"
    },
    formatting: {
      fontSize: "medium",
      lineSpacing: "normal",
      margins: "standard",
      headers: "standard"
    }
  });
  
  const reportRef = useRef<HTMLDivElement>(null);

  const generateReport = async (template: ReportTemplate) => {
    setGenerating(template.id as ReportType);
    setSelectedTemplate(template);
    
    try {
      const response = await fetch("/api/ai/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: tenderId || "tender_default",
          reportType: template.id,
          format: selectedFormat,
          customSections: customSections.length > 0 ? customSections : template.sections,
          targetAudience: selectedAudience.length > 0 ? selectedAudience : template.targetAudience,
          interactiveMode,
          customization: customizationOptions
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const newReport: Report = {
          id: `report-${Date.now()}`,
          type: template.id as ReportType,
          title: data.title || `${template.name} Report`,
          content: data.content || data.report,
          format: selectedFormat,
          metadata: {
            wordCount: data.wordCount || Math.floor(data.content?.length / 5) || 0,
            readingTime: Math.ceil((data.wordCount || Math.floor(data.content?.length / 5)) / 200),
            complexity: template.complexity,
            targetAudience: selectedAudience.length > 0 ? selectedAudience : template.targetAudience,
            generatedAt: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            author: "AI Assistant",
            version: "1.0",
            tags: [template.id, "ai-generated", ...template.targetAudience.map(a => a.toLowerCase())]
          },
          sections: data.sections || template.sections.map((section, index) => ({
            id: `section-${index}`,
            title: section,
            content: "",
            order: index,
            wordCount: 0
          })),
          analytics: {
            views: 0,
            downloads: 0,
            shares: 0,
            rating: 0
          }
        };
        
        setCurrentReport(newReport);
        setReportHistory(prev => [newReport, ...prev.slice(0, 9)]); // Keep last 10 reports
        setEditedContent(newReport.content);
        showNotification(`${template.name} generated successfully!`, "success");
      } else {
        showNotification("Failed to generate report. Please try again.", "error");
      }
    } catch (error) {
      console.error("Error generating report:", error);
      showNotification("Failed to generate report. Please try again.", "error");
    } finally {
      setGenerating(null);
    }
  };

  const downloadReport = (format: ReportFormat = selectedFormat) => {
    if (!currentReport) return;

    let content = currentReport.content;
    let mimeType = "text/plain";
    let extension = "txt";

    switch (format) {
      case "markdown":
        mimeType = "text/markdown";
        extension = "md";
        break;
      case "html":
        mimeType = "text/html";
        extension = "html";
        content = `
<!DOCTYPE html>
<html>
<head>
  <title>${currentReport.title}</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2, h3 { color: #333; }
    pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
  </style>
</head>
<body>
  <h1>${currentReport.title}</h1>
  <pre>${content}</pre>
</body>
</html>`;
        break;
      case "pdf":
        mimeType = "application/pdf";
        extension = "pdf";
        // In a real implementation, you'd use a PDF generation library
        break;
      case "docx":
        mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        extension = "docx";
        break;
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentReport.title.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Update analytics
    setCurrentReport(prev => prev ? {
      ...prev,
      analytics: { ...prev.analytics, downloads: prev.analytics.downloads + 1 }
    } : null);
    
    showNotification(`Report downloaded as ${format.toUpperCase()}!`, "success");
  };

  const printReport = () => {
    if (!currentReport) return;
    
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${currentReport.title}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; max-width: 800px; margin: 0 auto; }
              h1, h2, h3 { color: #333; }
              pre { background: #f5f5f5; padding: 15px; border-radius: 5px; white-space: pre-wrap; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>
            <h1>${currentReport.title}</h1>
            <pre>${currentReport.content}</pre>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const shareReport = () => {
    if (!currentReport) return;
    
    const shareData = {
      title: currentReport.title,
      text: currentReport.content.substring(0, 200) + "...",
      url: window.location.href
    };
    
    if (navigator.share) {
      navigator.share(shareData);
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(`${currentReport.title}\n\n${currentReport.content}`);
      showNotification("Report content copied to clipboard!", "success");
    }
    
    // Update analytics
    setCurrentReport(prev => prev ? {
      ...prev,
      analytics: { ...prev.analytics, shares: prev.analytics.shares + 1 }
    } : null);
  };

  const saveEdits = () => {
    if (!currentReport) return;
    
    const updatedReport = {
      ...currentReport,
      content: editedContent,
      metadata: {
        ...currentReport.metadata,
        lastModified: new Date().toISOString(),
        wordCount: Math.floor(editedContent.length / 5)
      }
    };
    
    setCurrentReport(updatedReport);
    setIsEditing(false);
    showNotification("Report updated successfully!", "success");
  };

  const startPresentation = () => {
    setIsPresenting(true);
    setCurrentSlide(0);
  };

  const nextSlide = () => {
    if (currentReport && currentSlide < currentReport.sections.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
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

  const filteredTemplates = reportTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAudience = selectedAudience.length === 0 || 
                           template.targetAudience.some(audience => selectedAudience.includes(audience));
    return matchesSearch && matchesAudience;
  });

  const audienceOptions = [...new Set(reportTemplates.flatMap(t => t.targetAudience))];

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <FileText className="text-orange-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-heading text-foreground">Reports</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getModeColor()}`}>
              {getModeIcon()}
              {interactiveMode.charAt(0).toUpperCase() + interactiveMode.slice(1)} Mode
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Advanced Options"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-muted-foreground hover:text-orange-600 transition-colors"
            title="Filter Templates"
          >
            <Filter size={16} />
          </button>
          <button
            onClick={() => setShowCustomization(!showCustomization)}
            className="p-2 text-muted-foreground hover:text-purple-600 transition-colors"
            title="Customize Report"
          >
            <Settings size={16} />
          </button>
          {currentReport && (
            <button
              onClick={shareReport}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              title="Share Report"
            >
              <Share2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-heading text-foreground">Advanced Report Options</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Save size={16} className="text-muted-foreground" />
              <span className="text-sm">Save Template</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Copy size={16} className="text-muted-foreground" />
              <span className="text-sm">Duplicate Report</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <BarChart3 size={16} className="text-muted-foreground" />
              <span className="text-sm">Analytics</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <TrendingUp size={16} className="text-muted-foreground" />
              <span className="text-sm">Performance</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-heading text-foreground">Filter Templates</h4>
          
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          {/* Audience Filter */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Target Audience</label>
            <div className="flex flex-wrap gap-2">
              {audienceOptions.map((audience) => (
                <button
                  key={audience}
                  onClick={() => {
                    const newAudience = selectedAudience.includes(audience)
                      ? selectedAudience.filter(a => a !== audience)
                      : [...selectedAudience, audience];
                    setSelectedAudience(newAudience);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedAudience.includes(audience)
                      ? "bg-orange-100 text-orange-700 border border-orange-300"
                      : "bg-white text-muted-foreground border border-gray-300 hover:border-gray-400"
                  }`}
                >
                  {audience}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Customization Panel */}
      {showCustomization && (
        <div className="bg-muted rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-heading text-foreground">Customize Report</h4>
            <button
              onClick={() => setShowCustomization(false)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Content Customization */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-heading text-foreground">Content Options</h5>
              
              {/* Tone */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Writing Tone</label>
                <select
                  value={customizationOptions.tone}
                  onChange={(e) => setCustomizationOptions(prev => ({ ...prev, tone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="technical">Technical</option>
                  <option value="persuasive">Persuasive</option>
                </select>
              </div>

              {/* Length */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Report Length</label>
                <select
                  value={customizationOptions.length}
                  onChange={(e) => setCustomizationOptions(prev => ({ ...prev, length: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="brief">Brief (1-2 pages)</option>
                  <option value="medium">Medium (3-5 pages)</option>
                  <option value="detailed">Detailed (6-10 pages)</option>
                  <option value="comprehensive">Comprehensive (10+ pages)</option>
                </select>
              </div>

              {/* Include Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Include Elements</label>
                <div className="space-y-2">
                  {[
                    { key: 'includeCharts', label: 'Charts & Graphs', icon: <BarChart3 size={16} /> },
                    { key: 'includeImages', label: 'Images & Diagrams', icon: <Image size={16} /> },
                    { key: 'includeReferences', label: 'References & Citations', icon: <FileText size={16} /> },
                    { key: 'includeAppendices', label: 'Appendices', icon: <BookOpen size={16} /> }
                  ].map(({ key, label, icon }) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={customizationOptions[key as keyof typeof customizationOptions] as boolean}
                        onChange={(e) => setCustomizationOptions(prev => ({ 
                          ...prev, 
                          [key]: e.target.checked 
                        }))}
                        className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      {icon}
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Custom Sections */}
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">Custom Sections</label>
                <div className="space-y-2">
                  {customizationOptions.customSections.map((section, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={section}
                        onChange={(e) => {
                          const newSections = [...customizationOptions.customSections];
                          newSections[index] = e.target.value;
                          setCustomizationOptions(prev => ({ ...prev, customSections: newSections }));
                        }}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Section title"
                      />
                      <button
                        onClick={() => {
                          const newSections = customizationOptions.customSections.filter((_, i) => i !== index);
                          setCustomizationOptions(prev => ({ ...prev, customSections: newSections }));
                        }}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => setCustomizationOptions(prev => ({ 
                      ...prev, 
                      customSections: [...prev.customSections, ""] 
                    }))}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    <Plus size={16} />
                    Add Custom Section
                  </button>
                </div>
              </div>
            </div>

            {/* Branding & Formatting */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-heading text-foreground">Branding & Formatting</h5>
              
              {/* Company Branding */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Company Branding</label>
                <div className="space-y-2">
                  <input
                    type="text"
                    placeholder="Company Name"
                    value={customizationOptions.branding.companyName}
                    onChange={(e) => setCustomizationOptions(prev => ({ 
                      ...prev, 
                      branding: { ...prev.branding, companyName: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="Logo URL"
                    value={customizationOptions.branding.logo}
                    onChange={(e) => setCustomizationOptions(prev => ({ 
                      ...prev, 
                      branding: { ...prev.branding, logo: e.target.value }
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Color Scheme */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Color Scheme</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Primary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customizationOptions.branding.primaryColor}
                        onChange={(e) => setCustomizationOptions(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))}
                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customizationOptions.branding.primaryColor}
                        onChange={(e) => setCustomizationOptions(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, primaryColor: e.target.value }
                        }))}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Secondary Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={customizationOptions.branding.secondaryColor}
                        onChange={(e) => setCustomizationOptions(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, secondaryColor: e.target.value }
                        }))}
                        className="w-8 h-8 border border-gray-300 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={customizationOptions.branding.secondaryColor}
                        onChange={(e) => setCustomizationOptions(prev => ({ 
                          ...prev, 
                          branding: { ...prev.branding, secondaryColor: e.target.value }
                        }))}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Formatting Options */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-700">Formatting</label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Font Size</label>
                    <select
                      value={customizationOptions.formatting.fontSize}
                      onChange={(e) => setCustomizationOptions(prev => ({ 
                        ...prev, 
                        formatting: { ...prev.formatting, fontSize: e.target.value }
                      }))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Line Spacing</label>
                    <select
                      value={customizationOptions.formatting.lineSpacing}
                      onChange={(e) => setCustomizationOptions(prev => ({ 
                        ...prev, 
                        formatting: { ...prev.formatting, lineSpacing: e.target.value }
                      }))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="tight">Tight</option>
                      <option value="normal">Normal</option>
                      <option value="loose">Loose</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Margins</label>
                    <select
                      value={customizationOptions.formatting.margins}
                      onChange={(e) => setCustomizationOptions(prev => ({ 
                        ...prev, 
                        formatting: { ...prev.formatting, margins: e.target.value }
                      }))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="narrow">Narrow</option>
                      <option value="standard">Standard</option>
                      <option value="wide">Wide</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Headers</label>
                    <select
                      value={customizationOptions.formatting.headers}
                      onChange={(e) => setCustomizationOptions(prev => ({ 
                        ...prev, 
                        formatting: { ...prev.formatting, headers: e.target.value }
                      }))}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="minimal">Minimal</option>
                      <option value="standard">Standard</option>
                      <option value="detailed">Detailed</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="border-t pt-4">
            <h5 className="text-sm font-semibold text-heading text-foreground mb-3">Preview Settings</h5>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Tone: <strong className="text-heading text-foreground">{customizationOptions.tone}</strong></span>
                <span>Length: <strong className="text-heading text-foreground">{customizationOptions.length}</strong></span>
                <span>Format: <strong className="text-heading text-foreground">{selectedFormat.toUpperCase()}</strong></span>
                {customizationOptions.branding.companyName && (
                  <span>Brand: <strong className="text-heading text-foreground">{customizationOptions.branding.companyName}</strong></span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCustomizationOptions({
                tone: "professional",
                length: "medium",
                includeCharts: true,
                includeImages: false,
                includeReferences: true,
                includeAppendices: false,
                customSections: [],
                branding: {
                  companyName: "",
                  logo: "",
                  primaryColor: "#3B82F6",
                  secondaryColor: "#1E40AF"
                },
                formatting: {
                  fontSize: "medium",
                  lineSpacing: "normal",
                  margins: "standard",
                  headers: "standard"
                }
              })}
              className="px-4 py-2 text-sm text-muted-foreground hover:text-gray-800 transition-colors"
            >
              Reset to Defaults
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCustomization(false)}
                className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowCustomization(false);
                  showNotification("Customization settings saved!", "success");
                }}
                className="px-4 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Generation */}
      {!currentReport && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-heading text-foreground">Choose Report Template</h4>
            <div className="flex items-center gap-2">
              <label className="text-sm text-muted-foreground">Format:</label>
              <select
                value={selectedFormat}
                onChange={(e) => setSelectedFormat(e.target.value as ReportFormat)}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {formatOptions.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => generateReport(template)}
                disabled={generating !== null}
                className={`relative p-6 rounded-xl border-2 text-left transition-all duration-200 hover:scale-[1.02] ${
                  generating === template.id
                    ? "border-orange-500 bg-orange-50"
                    : "border-gray-200 hover:border-gray-300 bg-white hover:shadow-lg"
                } ${generating && generating !== template.id ? "opacity-50" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${template.color}`}>
                    {template.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h5 className="font-semibold text-heading text-foreground">{template.name}</h5>
                      <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                        template.complexity === "simple" ? "bg-green-100 text-green-700" :
                        template.complexity === "moderate" ? "bg-yellow-100 text-yellow-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        {template.complexity}
                      </div>
                      {(customizationOptions.customSections.length > 0 || 
                        customizationOptions.branding.companyName || 
                        customizationOptions.tone !== "professional") && (
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                          Customized
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock size={12} />
                        <span>{template.estimatedTime}</span>
                        <span>•</span>
                        <span>{template.sections.length} sections</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-1">
                        {template.targetAudience.slice(0, 2).map((audience) => (
                          <span key={audience} className="px-2 py-1 bg-gray-100 text-muted-foreground rounded text-xs">
                            {audience}
                          </span>
                        ))}
                        {template.targetAudience.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-muted-foreground rounded text-xs">
                            +{template.targetAudience.length - 2} more
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {generating === template.id && (
                  <div className="absolute inset-0 bg-white bg-opacity-90 rounded-xl flex items-center justify-center">
                    <div className="flex flex-col items-center gap-2">
                      <RefreshCw className="animate-spin text-orange-600" size={24} />
                      <span className="text-sm font-medium text-gray-700">Generating...</span>
                    </div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Generated Report Display */}
      {currentReport && (
        <div className="space-y-4">
          {/* Report Header */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CheckCircle size={24} className="text-green-600" />
                  <h4 className="text-xl font-bold text-heading text-foreground">{currentReport.title}</h4>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                  <span>{currentReport.metadata.wordCount} words</span>
                  <span>•</span>
                  <span>{currentReport.metadata.readingTime} min read</span>
                  <span>•</span>
                  <span>{currentReport.metadata.complexity}</span>
                  <span>•</span>
                  <span>{currentReport.format.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                  {currentReport.metadata.tags.map((tag) => (
                    <span key={tag} className="px-2 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setCurrentReport(null);
                    setSelectedTemplate(null);
                    setIsPresenting(false);
                  }}
                  className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-muted transition-colors border border-orange-300"
                >
                  New Report
                </button>
              </div>
            </div>
          </div>

          {/* Report Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {interactiveMode === "edit" && (
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Edit3 size={16} />
                  {isEditing ? "Cancel Edit" : "Edit Report"}
                </button>
              )}
              
              {interactiveMode === "present" && (
                <button
                  onClick={startPresentation}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Presentation size={16} />
                  Start Presentation
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => downloadReport()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download size={16} />
                Download
              </button>
              <button
                onClick={printReport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <Printer size={16} />
                Print
              </button>
            </div>
          </div>

          {/* Report Content */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg">
            {isEditing ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h5 className="font-semibold text-heading text-foreground">Edit Report Content</h5>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveEdits}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                  placeholder="Edit your report content here..."
                />
              </div>
            ) : isPresenting ? (
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 min-h-[500px] flex flex-col justify-center p-8">
                <div className="text-center mb-8">
                  <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    Slide {currentSlide + 1} of {currentReport.sections.length}
                  </span>
                </div>
                <div className="bg-white rounded-xl p-8 shadow-lg max-w-4xl mx-auto w-full">
                  <h3 className="text-3xl font-bold text-gray-800 mb-6 text-center">
                    {currentReport.sections[currentSlide]?.title || "Report Section"}
                  </h3>
                  <div className="text-lg text-gray-700 leading-relaxed">
                    {currentReport.sections[currentSlide]?.content || currentReport.content}
                  </div>
                </div>
                <div className="flex items-center justify-center gap-4 mt-8">
                  <button
                    onClick={previousSlide}
                    disabled={currentSlide === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>
                  <button
                    onClick={() => setIsPresenting(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Exit Presentation
                  </button>
                  <button
                    onClick={nextSlide}
                    disabled={currentSlide === currentReport.sections.length - 1}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-6 max-h-[600px] overflow-y-auto">
                <pre className="whitespace-pre-wrap font-sans text-sm text-gray-800 leading-relaxed">
                  {currentReport.content}
                </pre>
              </div>
            )}
          </div>

          {/* Report Analytics */}
          <div className="bg-muted rounded-lg p-4">
            <h5 className="text-sm font-semibold text-heading text-foreground mb-3">Report Analytics</h5>
            <div className="grid grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-heading text-foreground">{currentReport.analytics.views}</div>
                <div className="text-xs text-muted-foreground">Views</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-heading text-foreground">{currentReport.analytics.downloads}</div>
                <div className="text-xs text-muted-foreground">Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-heading text-foreground">{currentReport.analytics.shares}</div>
                <div className="text-xs text-muted-foreground">Shares</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-heading text-foreground">{currentReport.analytics.rating || "N/A"}</div>
                <div className="text-xs text-muted-foreground">Rating</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report History */}
      {reportHistory.length > 0 && !currentReport && (
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-semibold text-heading text-foreground mb-3">Recent Reports</h4>
          <div className="space-y-2">
            {reportHistory.slice(0, 5).map((report) => (
              <button
                key={report.id}
                onClick={() => setCurrentReport(report)}
                className="w-full text-left p-3 bg-white rounded-lg hover:bg-muted transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-heading text-foreground">{report.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {report.metadata.wordCount} words • {new Date(report.metadata.generatedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">{report.format.toUpperCase()}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Help Text */}
      {!currentReport && !generating && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <Sparkles size={16} className="text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <strong>AI-Powered Report Generation:</strong> Choose from professional templates tailored for different audiences and use cases. 
              Reports are generated based on your tender data, documents, and insights for maximum relevance and accuracy.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}