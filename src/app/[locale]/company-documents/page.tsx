'use client';

import { useEffect, useState, useRef } from "react";
import { Plus, Building2, Upload, Trash2, Brain, Download, Search, Filter, Eye, Calendar, FileText, AlertCircle, CheckCircle, Clock } from "lucide-react";

type Document = {
  id: string;
  filename: string;
  documentType?: string;
  summary?: string;
  sizeBytes?: number;
  createdAt: string;
};

export default function CompanyDocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch("/api/documents?tenderId=global_documents");
      const data = await response.json();
      const companyDocs = data.documents?.filter((doc: any) => doc.category === 'company') || [];
      setDocuments(companyDocs);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const uploadFiles = async (selected: File[]) => {
    if (!selected || selected.length === 0) return;
    
    setUploading(true);
    const form = new FormData();
    for (const f of selected) {
      form.append("files", f);
    }
    form.append("tenderId", "global_documents");
    form.append("category", "company"); // FIX: Added category
    
    try {
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json();
      
      if (response.ok) {
        // Show success notification
        showNotification(`✅ Successfully uploaded ${selected.length} company document(s)!`, "success");
        await fetchDocuments();
        setShowUploadModal(false);
      } else {
        showNotification(`❌ Upload failed: ${data.error || 'Unknown error'}`, "error");
      }
    } catch (error) {
      showNotification(`❌ Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`, "error");
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

  const analyzeDocument = async (docId: string) => {
    setAnalyzing(docId);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenderId: "global_documents", documentId: docId }),
      });
      
      if (response.ok) {
        showNotification("Document analysis completed!", "success");
      } else {
        showNotification("Failed to analyze document. Please try again.", "error");
      }
    } catch (error) {
      showNotification("Failed to analyze document. Please try again.", "error");
      console.error("Failed to analyze document:", error);
    } finally {
      setAnalyzing(null);
    }
  };

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === "success" ? "bg-green-500 text-white" :
      type === "error" ? "bg-red-500 text-white" :
      "bg-blue-500 text-white"
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);
    
    // Remove after 3 seconds
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

  // Filter documents based on search and filter
  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === "all" || doc.documentType === filterType;
    return matchesSearch && matchesFilter;
  });

  const documentTypes = [...new Set(documents.map(doc => doc.documentType).filter(Boolean))];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <Building2 size={24} className="text-purple-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Company Documents</h1>
            <p className="text-gray-600 mt-1">
              Global library of company profiles, capabilities, and portfolios
            </p>
          </div>
        </div>
        <button
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 hover:scale-105 shadow-lg"
          onClick={() => setShowUploadModal(true)}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Uploading...
            </>
          ) : (
            <>
              <Plus size={16} />
              Add Document
            </>
          )}
        </button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.docx,.xlsx,.xls"
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

      {/* Enhanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Building2 size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Documents</p>
              <p className="text-2xl font-bold text-gray-900">{documents.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Upload size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Available Globally</p>
              <p className="text-lg font-bold text-gray-900">All Tenders</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Brain size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">AI Analysis</p>
              <p className="text-lg font-bold text-gray-900">Available</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar size={20} className="text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Updated</p>
              <p className="text-lg font-bold text-gray-900">
                {documents.length > 0 ? new Date(documents[0].createdAt).toLocaleDateString() : "Never"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="all">All Types</option>
            {documentTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Document Library</h2>
          <p className="text-sm text-gray-600 mt-1">
            These documents are automatically available in all tender workspaces
          </p>
        </div>
        
        {filteredDocuments.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Building2 size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {documents.length === 0 ? "No company documents yet" : "No documents match your search"}
            </h3>
            <p className="text-gray-600 mb-4">
              Upload company profiles, capabilities statements, portfolios, and brochures
            </p>
            <button
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 hover:scale-105 mx-auto"
              onClick={() => setShowUploadModal(true)}
            >
              <Plus size={16} />
              Upload First Document
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="p-4 hover:bg-gray-50 transition-colors group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-purple-200 transition-colors">
                      <Building2 size={20} className="text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {doc.filename}
                      </h3>
                      <p className="text-xs text-purple-600 font-medium">
                        {doc.documentType || 'Company Document'}
                      </p>
                      {doc.summary && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {doc.summary.substring(0, 120)}...
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(doc.createdAt).toLocaleDateString()}
                        </span>
                        {doc.sizeBytes && (
                          <span>
                            {(doc.sizeBytes / 1024 / 1024).toFixed(1)} MB
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => analyzeDocument(doc.id)}
                      disabled={analyzing === doc.id}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50 hover:bg-blue-50 rounded-lg"
                      title="Analyze with AI"
                    >
                      {analyzing === doc.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                      ) : (
                        <Brain size={16} />
                      )}
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-100 rounded-lg"
                      title="Download"
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors hover:bg-red-50 rounded-lg"
                      title="Delete document"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Upload Company Documents</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive ? "border-purple-500 bg-purple-50" : "border-gray-300"
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <Upload size={32} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-4">
                Drag and drop files here, or click to select
              </p>
              <button
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                onClick={() => inputRef.current?.click()}
              >
                Select Files
              </button>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowUploadModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
