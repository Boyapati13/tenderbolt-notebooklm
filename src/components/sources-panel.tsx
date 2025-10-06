"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Plus, Search, FileText, Trash2, Brain, Folder, FolderOpen, ChevronDown, ChevronRight, FileCheck, Building2, File, Link } from "lucide-react";
import { DiscoverySection } from "./discovery-section";

type Document = {
  id: string;
  filename: string;
  category?: string;
  documentType?: string;
  summary?: string;
};

type FolderData = {
  name: string;
  icon: typeof Folder;
  color: string;
  bgColor: string;
  category: string;
  documents: Document[];
};

export function SourcesPanel({ tenderId, onDocumentUploaded }: { tenderId?: string; onDocumentUploaded?: () => void }) {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [analyzing, setAnalyzing] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['tender', 'supporting', 'company']));
  const [activeTab, setActiveTab] = useState<'documents' | 'discovery'>('documents');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, [tenderId]);

  const fetchDocuments = async () => {
    try {
      const url = tenderId ? `/api/documents?tenderId=${tenderId}` : "/api/documents";
      const response = await fetch(url);
      const data = await response.json();
      setDocuments(data.documents ?? []);
      console.log(`📚 Loaded ${data.documents?.length || 0} documents`);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
    }
  };

  const uploadFiles = useCallback(async (selected: File[]) => {
    if (!selected || selected.length === 0) return;
    
    setUploading(true);
    console.log(`📤 Uploading ${selected.length} file(s)...`);
    setFiles((prev) => [...prev, ...selected]);
    
    const form = new FormData();
    for (const f of selected) {
      console.log(`  - ${f.name} (${(f.size / 1024).toFixed(1)} KB)`);
      form.append("files", f);
    }
    if (tenderId) {
      form.append("tenderId", tenderId);
    }
    
    try {
      console.log("📡 Sending to /api/upload...");
      const response = await fetch("/api/upload", { method: "POST", body: form });
      const data = await response.json();
      
      if (response.ok) {
        console.log("✅ Upload successful!", data);
        
        // Check if any tender documents were uploaded with summaries
        const tenderDocs = data.saved?.filter((doc: any) => doc.summary);
        
        if (tenderDocs && tenderDocs.length > 0) {
          alert(`✅ Successfully uploaded ${selected.length} file(s)!\n\n📝 Auto-summary generated!\n🔄 AI-extracted information will update automatically.`);
        } else {
          alert(`✅ Successfully uploaded ${selected.length} file(s)!`);
        }
        
        // Trigger refresh callback if provided
        if (onDocumentUploaded) {
          onDocumentUploaded();
        }
        
        // Dispatch custom events for other components to listen
        window.dispatchEvent(new CustomEvent('documentUploaded'));
        window.dispatchEvent(new CustomEvent('documentProcessed'));
      } else {
        console.error("❌ Upload failed:", data);
        alert(`❌ Upload failed: ${data.error || 'Unknown error'}`);
        setUploading(false);
      }
    } catch (error) {
      console.error("❌ Upload error:", error);
      alert(`❌ Upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setUploading(false);
    }
    
    await fetchDocuments();
  }, [tenderId]);

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = Array.from(e.dataTransfer.files || []);
    if (dropped.length === 0) return;
    await uploadFiles(dropped);
  }, [uploadFiles]);

  const deleteDocument = async (docId: string) => {
    try {
      await fetch(`/api/documents/${docId}`, { method: "DELETE" });
      await fetchDocuments();
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const analyzeDocument = async (docId: string) => {
    if (!tenderId) return;
    
    setAnalyzing(docId);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenderId, documentId: docId }),
      });
      
      if (response.ok) {
        alert("Document analysis completed! Check the insights panel for extracted information.");
      } else {
        alert("Failed to analyze document. Please try again.");
      }
    } catch (error) {
      console.error("Failed to analyze document:", error);
      alert("Failed to analyze document. Please try again.");
    } finally {
      setAnalyzing(null);
    }
  };

  const toggleFolder = (category: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(category)) {
        newSet.delete(category);
      } else {
        newSet.add(category);
      }
      return newSet;
    });
  };

  // Organize documents into folders
  const folders: FolderData[] = [
    {
      name: "📁 Tender Documents",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      category: "tender",
      documents: documents.filter(d => d.category === 'tender'),
    },
    {
      name: "📁 Supporting Documents 🌐",
      icon: FileCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      category: "supporting",
      documents: documents.filter(d => d.category === 'supporting'),
    },
    {
      name: "📁 Company Documents 🌐",
      icon: Building2,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      category: "company",
      documents: documents.filter(d => d.category === 'company'),
    },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Tab Navigation */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'documents'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <FileText size={16} />
            Documents
          </div>
        </button>
        <button
          onClick={() => setActiveTab('discovery')}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'discovery'
              ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
              : 'text-muted-foreground hover:text-foreground hover:bg-accent'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Link size={16} />
            Discovery
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'documents' ? (
          <div className="p-4 space-y-4">
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={() => inputRef.current?.click()}
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
                    Add Documents
                  </>
                )}
              </button>
              <input
                ref={inputRef}
                type="file"
                multiple
                accept=".pdf,.docx,.xlsx,.xls,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
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

            {/* Drag & Drop Area or Folder View */}
            {documents.length === 0 ? (
              <div
                className={
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors " +
                  (isDragging ? "border-primary bg-primary/10" : "border-border")
                }
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
              >
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <FileText size={32} className="text-gray-400" />
                  </div>
                  <div className="text-lg font-medium text-gray-900">
                    Saved sources will appear here
                  </div>
                  <div className="text-sm text-gray-600 max-w-xs mx-auto">
                    Documents will automatically organize into folders:<br/>
                    • Tender Documents (tender-specific)<br/>
                    • Supporting Documents 🌐 (shared across all tenders)<br/>
                    • Company Documents 🌐 (shared across all tenders)
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Folder-based Organization */}
                {folders.map((folder) => (
                  <div key={folder.category} className="border border-border rounded-lg overflow-hidden">
                    {/* Folder Header */}
                    <button
                      onClick={() => toggleFolder(folder.category)}
                      className={`w-full flex items-center justify-between p-3 ${folder.bgColor} hover:opacity-80 transition-opacity`}
                    >
                      <div className="flex items-center gap-2">
                        {expandedFolders.has(folder.category) ? (
                          <ChevronDown size={16} className={folder.color} />
                        ) : (
                          <ChevronRight size={16} className={folder.color} />
                        )}
                        <folder.icon size={18} className={folder.color} />
                        <span className={`text-sm font-semibold ${folder.color}`}>
                          {folder.name}
                        </span>
                        <span className="text-xs text-gray-500 ml-1">
                          ({folder.documents.length})
                        </span>
                      </div>
                    </button>

                    {/* Folder Contents */}
                    {expandedFolders.has(folder.category) && (
                      <div className="bg-white">
                        {folder.documents.length === 0 ? (
                          <div className="p-4 text-center text-sm text-gray-500">
                            No documents in this folder yet
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {folder.documents.map((doc) => (
                              <div
                                key={doc.id}
                                className="flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
                              >
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className={`w-8 h-8 ${folder.bgColor} rounded flex items-center justify-center flex-shrink-0`}>
                                    <File size={14} className={folder.color} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      {doc.filename}
                                    </div>
                                    <div className={`text-xs ${folder.color} font-medium`}>
                                      {doc.documentType || 'Document'}
                                    </div>
                                    {doc.summary && (
                                      <div className="text-xs text-gray-400 mt-1 line-clamp-1">
                                        {doc.summary.substring(0, 80)}...
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 flex-shrink-0">
                                  {tenderId && (
                                    <button
                                      onClick={() => analyzeDocument(doc.id)}
                                      disabled={analyzing === doc.id}
                                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-50"
                                      title="Analyze with AI"
                                    >
                                      {analyzing === doc.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                                      ) : (
                                        <Brain size={16} />
                                      )}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => deleteDocument(doc.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                                    title="Delete document"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <DiscoverySection tenderId={tenderId} />
        )}
      </div>
    </div>
  );
}


