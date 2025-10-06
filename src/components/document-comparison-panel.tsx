"use client";

import { useState, useEffect, useRef } from "react";
import { 
  FileText, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Users,
  Award,
  BarChart3,
  Download,
  RefreshCw,
  Eye,
  Filter,
  Search,
  Upload,
  Plus,
  File,
  Edit3,
  Save,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Zap,
  Shield,
  Star,
  BookOpen,
  Layers,
  Activity,
  PieChart,
  TrendingDown,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Share2,
  Settings,
  Maximize2,
  Minimize2,
  PenTool,
  Image,
  Table,
  Type
} from "lucide-react";
import { AdvancedProposalWriter } from "./advanced-proposal-writer";

type DocumentComparison = {
  matchPercentage: number;
  overallAssessment: string;
  strengths: string[];
  gaps: string[];
  complianceAnalysis: {
    technicalRequirements?: { match: number; status: string; details: string };
    qualifications?: { match: number; status: string; details: string };
    timeline?: { match: number; status: string; details: string };
    budget?: { match: number; status: string; details: string };
    deliverables?: { match: number; status: string; details: string };
  };
  riskAreas: string[];
  recommendations: string[];
  priorityActions: string[];
  competitiveAdvantages: string[];
  detailedComparison: {
    requirementsCoverage?: string;
    qualityOfResponse?: string;
    innovationLevel?: string;
    riskMitigation?: string;
  };
  timestamp: string;
  tenderTitle: string;
  proposalFilename: string;
};

type Document = {
  id: string;
  filename: string;
  documentType?: string;
  category?: string;
  summary?: string;
};

interface DocumentComparisonPanelProps {
  tenderId: string;
  tenderTitle: string;
}

export function DocumentComparisonPanel({ tenderId, tenderTitle }: DocumentComparisonPanelProps) {
  
  const [documents, setDocuments] = useState<Document[]>([]);
  const [comparisons, setComparisons] = useState<any[]>([]);
  const [selectedProposal, setSelectedProposal] = useState<string>("");
  const [comparisonType, setComparisonType] = useState<string>("comprehensive");
  const [isComparing, setIsComparing] = useState(false);
  const [currentComparison, setCurrentComparison] = useState<DocumentComparison | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showProposalDraft, setShowProposalDraft] = useState(false);
  const [draftingProposal, setDraftingProposal] = useState(false);
  const [proposalDraft, setProposalDraft] = useState<string>("");
  const [activeStep, setActiveStep] = useState<'upload' | 'select' | 'compare' | 'results'>('upload');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['overview']));
  const [showAdvancedWriter, setShowAdvancedWriter] = useState(false);
  const [savedProposals, setSavedProposals] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocuments();
    fetchComparisons();
    fetchSavedProposals();
  }, [tenderId]);

  const fetchDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?tenderId=${tenderId}`);
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const fetchComparisons = async () => {
    try {
      const response = await fetch(`/api/insights?tenderId=${tenderId}&type=document_comparison`);
      const data = await response.json();
      setComparisons(data.insights || []);
    } catch (error) {
      console.error("Failed to fetch comparisons:", error);
    }
  };

  const fetchSavedProposals = async () => {
    try {
      const response = await fetch(`/api/proposals?tenderId=${tenderId}`);
      const data = await response.json();
      setSavedProposals(data.proposals || []);
    } catch (error) {
      console.error("Failed to fetch saved proposals:", error);
    }
  };

  const runComparison = async () => {
    if (!selectedProposal) {
      showNotification("Please select a proposal document to compare", "error");
      return;
    }

    setIsComparing(true);
    setActiveStep('compare');
    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId,
          proposalDocumentId: selectedProposal,
          comparisonType
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setCurrentComparison(data.comparison);
        setActiveStep('results');
        await fetchComparisons();
        showNotification("Document comparison completed successfully!", "success");
      } else {
        showNotification(`Comparison failed: ${data.error}`, "error");
      }
    } catch (error) {
      showNotification("Failed to run comparison. Please try again.", "error");
      console.error("Comparison error:", error);
    } finally {
      setIsComparing(false);
    }
  };

  const draftProposal = async () => {
    if (!currentComparison) return;

    setDraftingProposal(true);
    try {
      const response = await fetch("/api/ai/proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId,
          comparisonData: currentComparison,
          tenderTitle
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setProposalDraft(data.proposal);
        setShowProposalDraft(true);
        showNotification("Proposal draft generated successfully!", "success");
      } else {
        showNotification(`Proposal generation failed: ${data.error}`, "error");
      }
    } catch (error) {
      showNotification("Failed to generate proposal draft. Please try again.", "error");
      console.error("Proposal generation error:", error);
    } finally {
      setDraftingProposal(false);
    }
  };

  const uploadFiles = async (selected: File[]) => {
    if (!selected || selected.length === 0) return;
    
    setUploading(true);
    const form = new FormData();
    for (const f of selected) {
      form.append("files", f);
    }
    form.append("tenderId", tenderId);
    
    try {
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json();
      
      if (response.ok) {
        showNotification(`Successfully uploaded ${selected.length} document(s)!`, "success");
        await fetchDocuments();
        setShowUploadModal(false);
        setActiveStep('select');
      } else {
        showNotification(`Upload failed: ${data.error}`, "error");
      }
    } catch (error) {
      showNotification(`Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
    } finally {
      setUploading(false);
    }
  };

  const deleteDocument = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      showNotification("Document deleted successfully", "success");
      await fetchDocuments();
    } catch (error) {
      showNotification("Failed to delete document", "error");
      console.error("Failed to delete document:", error);
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

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files);
      void uploadFiles(files);
    }
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const getMatchColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600 bg-green-50";
    if (percentage >= 60) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'excellent': return <CheckCircle className="text-green-600" size={16} />;
      case 'good': return <CheckCircle className="text-primary" size={16} />;
      case 'missing': return <XCircle className="text-red-600" size={16} />;
      case 'significantly missing': return <AlertTriangle className="text-red-600" size={16} />;
      default: return <Info className="text-muted-foreground" size={16} />;
    }
  };

  // Filter documents based on search and category
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || doc.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const proposalDocuments = filteredDocuments.filter(doc => 
    doc.category === 'company' || 
    doc.filename.toLowerCase().includes('proposal') ||
    doc.filename.toLowerCase().includes('bid') ||
    doc.filename.toLowerCase().includes('quotation') ||
    doc.filename.toLowerCase().includes('response') ||
    doc.filename.toLowerCase().includes('offer')
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Modern Header */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border/50 sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 size={24} className="text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Document Comparison
                </h1>
                <p className="text-muted-foreground text-sm">
                  AI-powered analysis of your proposals against tender requirements
                </p>
              </div>
            </div>
            
            {/* Progress Steps */}
            <div className="flex items-center gap-2">
              {[
                { key: 'upload', label: 'Upload', icon: Upload },
                { key: 'select', label: 'Select', icon: Target },
                { key: 'compare', label: 'Compare', icon: Activity },
                { key: 'results', label: 'Results', icon: PieChart }
              ].map((step, index) => {
                const isActive = activeStep === step.key;
                const isCompleted = ['upload', 'select', 'compare', 'results'].indexOf(activeStep) > ['upload', 'select', 'compare', 'results'].indexOf(step.key);
                
                return (
                  <div key={step.key} className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                      isActive ? 'bg-blue-600 text-white shadow-lg' :
                      isCompleted ? 'bg-green-500 text-white' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      <step.icon size={14} />
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-muted-foreground'
                    }`}>
                      {step.label}
                    </span>
                    {index < 3 && (
                      <ArrowRight size={16} className="mx-3 text-muted-foreground" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 py-6">
        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 hover:scale-105 shadow-lg cursor-pointer"
              style={{ zIndex: 10 }}
            >
              <Upload size={20} />
              <span className="font-semibold">Upload Documents</span>
            </button>
            
            <select
              value={comparisonType}
              onChange={(e) => setComparisonType(e.target.value)}
              className="px-4 py-3 input"
            >
              <option value="comprehensive">Comprehensive Analysis</option>
              <option value="technical">Technical Focus</option>
              <option value="commercial">Commercial Focus</option>
              <option value="compliance">Compliance Check</option>
            </select>
            
            <button
              onClick={runComparison}
              disabled={isComparing || !selectedProposal}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              style={{ zIndex: 10 }}
            >
              {isComparing ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="font-semibold">Analyzing...</span>
                </>
              ) : (
                <>
                  <Target size={20} />
                  <span className="font-semibold">Compare Documents</span>
                </>
              )}
            </button>
            
            {currentComparison && (
              <>
                <button
                  onClick={draftProposal}
                  disabled={draftingProposal}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {draftingProposal ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="font-semibold">Drafting...</span>
                    </>
                  ) : (
                    <>
                      <Edit3 size={20} />
                      <span className="font-semibold">Quick Draft</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={() => setShowAdvancedWriter(true)}
                  className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
                >
                  <PenTool size={20} />
                  <span className="font-semibold">Advanced Writer</span>
                </button>
              </>
            )}
            
            <button
              onClick={() => setShowAdvancedWriter(true)}
              className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 hover:scale-105 shadow-lg"
            >
              <Type size={20} />
              <span className="font-semibold">New Proposal</span>
            </button>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Documents */}
          <div className="lg:col-span-1">
            <div className="bg-card/70 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl">
              <div className="p-6 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-muted-foreground">{documents.length} files</span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {/* Search */}
                <div className="relative mb-4">
                  <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50"
                  />
                </div>

                {/* Document List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {proposalDocuments.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-gray-100 rounded-xl mx-auto mb-4 flex items-center justify-center">
                        <FileText size={32} className="text-muted-foreground" />
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">
                        {documents.length === 0 ? "No documents uploaded yet" : "No proposal documents found"}
                      </h4>
                      <p className="text-muted-foreground mb-4">
                        {documents.length === 0 
                          ? "Upload tender documents and proposal documents to start comparing"
                          : "Upload your company's proposal documents to compare against tender requirements"
                        }
                      </p>
                      <div className="text-sm text-muted-foreground mb-4">
                        <p><strong>What you need:</strong></p>
                        <p>• Tender documents (already uploaded: {documents.filter(d => d.category === 'tender').length})</p>
                        <p>• Your company's proposal/bid documents (upload these to compare)</p>
                        <p>• Documents with names containing: proposal, bid, quotation, response, offer</p>
                      </div>
                    </div>
                  ) : (
                    proposalDocuments.map((doc) => (
                      <div
                        key={doc.id}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
                          selectedProposal === doc.id
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:shadow-sm'
                        }`}
                        onClick={() => setSelectedProposal(doc.id)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            selectedProposal === doc.id ? 'bg-blue-100' : 'bg-gray-100'
                          }`}>
                            <FileText size={18} className={selectedProposal === doc.id ? 'text-primary' : 'text-muted-foreground'} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-semibold text-gray-900 truncate">
                              {doc.filename}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {doc.documentType || 'Document'}
                            </p>
                            {doc.summary && (
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {doc.summary.substring(0, 60)}...
                              </p>
                            )}
                          </div>
                          {selectedProposal === doc.id && (
                            <CheckCircle size={16} className="text-primary" />
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Results */}
          <div className="lg:col-span-2">
            {currentComparison ? (
              <div className="space-y-6">
                {/* Overview Card */}
                <div className="bg-card/70 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl">
                  <div className="p-6 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Comparison Results</h3>
                      <div className="flex items-center gap-2">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getMatchColor(currentComparison.matchPercentage)}`}>
                          {currentComparison.matchPercentage}% Match
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Match Percentage */}
                      <div className="text-center">
                        <div className="relative w-32 h-32 mx-auto mb-4">
                          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              className="text-gray-200"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - currentComparison.matchPercentage / 100)}`}
                              className={currentComparison.matchPercentage >= 80 ? 'text-green-500' : 
                                       currentComparison.matchPercentage >= 60 ? 'text-yellow-500' : 'text-red-500'}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-900">
                              {currentComparison.matchPercentage}%
                            </span>
                          </div>
                        </div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">Overall Match</h4>
                        <p className="text-sm text-muted-foreground">
                          {currentComparison.overallAssessment}
                        </p>
                      </div>

                      {/* Quick Stats */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <CheckCircle size={16} className="text-green-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Strengths</span>
                          </div>
                          <span className="text-lg font-bold text-green-600">{currentComparison.strengths.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                              <AlertTriangle size={16} className="text-red-600" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Gaps</span>
                          </div>
                          <span className="text-lg font-bold text-red-600">{currentComparison.gaps.length}</span>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Target size={16} className="text-primary" />
                            </div>
                            <span className="text-sm font-medium text-gray-900">Actions</span>
                          </div>
                          <span className="text-lg font-bold text-primary">{currentComparison.priorityActions.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Detailed Analysis */}
                <div className="bg-card/70 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl">
                  <div className="p-6 border-b border-border/50">
                    <h3 className="text-lg font-semibold text-gray-900">Detailed Analysis</h3>
                  </div>
                  
                  <div className="p-6">
                    {/* Compliance Analysis */}
                    <div className="mb-6">
                      <h4 className="text-md font-semibold text-gray-900 mb-4">Compliance Analysis</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(currentComparison.complianceAnalysis).map(([key, value]) => (
                          <div key={key} className="p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="text-sm font-semibold text-gray-900 capitalize">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </h5>
                              <div className="flex items-center gap-2">
                                {getStatusIcon(value.status)}
                                <span className="text-sm font-semibold text-gray-700">{value.match}%</span>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground">{value.details}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Strengths & Gaps */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-md font-semibold text-green-700 mb-3 flex items-center gap-2">
                          <CheckCircle size={16} />
                          Strengths
                        </h4>
                        <div className="space-y-2">
                          {currentComparison.strengths.map((strength, index) => (
                            <div key={index} className="p-3 bg-green-50 rounded-xl border-l-4 border-green-500">
                              <p className="text-sm text-green-800">{strength}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-md font-semibold text-red-700 mb-3 flex items-center gap-2">
                          <AlertTriangle size={16} />
                          Gaps & Risks
                        </h4>
                        <div className="space-y-2">
                          {currentComparison.gaps.map((gap, index) => (
                            <div key={index} className="p-3 bg-red-50 rounded-xl border-l-4 border-red-500">
                              <p className="text-sm text-red-800">{gap}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Priority Actions */}
                    <div className="mt-6">
                      <h4 className="text-md font-semibold text-blue-700 mb-3 flex items-center gap-2">
                        <Target size={16} />
                        Priority Actions
                      </h4>
                      <div className="space-y-2">
                        {currentComparison.priorityActions.map((action, index) => (
                          <div key={index} className="p-3 bg-blue-50 rounded-xl border-l-4 border-blue-500">
                            <p className="text-sm text-blue-800">{action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card/70 backdrop-blur-sm rounded-2xl border border-border/50 shadow-xl">
                <div className="p-12 text-center">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <BarChart3 size={40} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Ready to Compare Documents
                  </h3>
                  <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                    Upload your proposal documents and select one to compare against the tender requirements. 
                    Our AI will analyze compliance, identify gaps, and provide actionable recommendations.
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle size={16} className="text-green-500" />
                      <span>AI-powered analysis</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Shield size={16} className="text-blue-500" />
                      <span>Compliance checking</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap size={16} className="text-purple-500" />
                      <span>Instant results</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-lg mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Upload Technical Documents</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-2 text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
                dragActive ? "border-green-500 bg-green-50" : "border-gray-300 bg-gray-50"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={40} className="mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4 font-medium">
                Drag and drop technical datasheets, proposals, or other documents here
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Supported formats: PDF, DOCX, XLSX, TXT
              </p>
              <button
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Select Files"}
              </button>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 px-6 py-3 btn-secondary"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
            </div>
            
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.xlsx,.xls,.txt"
              className="hidden"
              onChange={(e) => {
                const selected = e.target.files ? Array.from(e.target.files) : [];
                if (selected.length > 0) {
                  void uploadFiles(selected);
                  e.currentTarget.value = "";
                }
              }}
            />
          </div>
        </div>
      )}

      {/* Proposal Draft Modal */}
      {showProposalDraft && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-full max-w-4xl mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Generated Proposal Draft</h3>
              <button
                onClick={() => setShowProposalDraft(false)}
                className="p-2 text-muted-foreground hover:text-muted-foreground transition-colors"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto bg-gray-50 rounded-xl p-6">
              <div className="prose max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-800 font-mono">
                  {proposalDraft}
                </pre>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                className="flex-1 px-6 py-3 btn-secondary"
                onClick={() => setShowProposalDraft(false)}
              >
                Close
              </button>
              <button
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                onClick={() => {
                  navigator.clipboard.writeText(proposalDraft);
                  showNotification("Proposal draft copied to clipboard!", "success");
                }}
              >
                Copy to Clipboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Advanced Proposal Writer Modal */}
      {showAdvancedWriter && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50">
          <div className="w-full h-full">
            <AdvancedProposalWriter
              tenderId={tenderId}
              tenderTitle={tenderTitle}
              comparisonData={currentComparison}
              onSave={(proposal) => {
                showNotification("Proposal saved successfully!", "success");
                fetchSavedProposals();
                setShowAdvancedWriter(false);
              }}
              onClose={() => setShowAdvancedWriter(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}