'use client';

import { useState, useRef, useEffect } from "react";
import { 
  FileText, 
  Image, 
  Table, 
  Bold, 
  Italic, 
  Underline, 
  List, 
  ListOrdered, 
  Quote, 
  Link, 
  Save, 
  Download, 
  Eye, 
  Edit3, 
  Trash2, 
  Plus, 
  Upload, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  AlignJustify,
  Type,
  Palette,
  Code,
  FileImage,
  BarChart3,
  PieChart,
  TrendingUp,
  CheckSquare,
  Calendar,
  Users,
  Award,
  Target,
  Zap,
  Brain,
  BookOpen,
  Search,
  Filter,
  Settings,
  Maximize2,
  Minimize2,
  Copy,
  Share2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Info,
  XCircle,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  GitCommit,
  History
} from "lucide-react";

interface ProposalSection {
  id: string;
  type: 'text' | 'heading' | 'image' | 'table' | 'list' | 'quote' | 'chart' | 'divider';
  content: any;
  order: number;
  metadata?: {
    level?: number; // for headings
    alignment?: 'left' | 'center' | 'right' | 'justify';
    style?: any;
  };
}

interface ProposalTemplate {
  id: string;
  name: string;
  description: string;
  sections: ProposalSection[];
  category: 'technical' | 'commercial' | 'research' | 'compliance' | 'executive';
  industry: string;
  complexity: 'basic' | 'intermediate' | 'advanced' | 'expert';
}

interface Version {
  id: string;
  timestamp: Date;
  author: string;
  summary: string;
}

interface AdvancedProposalWriterProps {
  tenderId: string;
  tenderTitle: string;
  comparisonData?: any;
  onSave?: (proposal: any) => void;
  onClose?: () => void;
}

export function AdvancedProposalWriter({ 
  tenderId, 
  tenderTitle, 
  comparisonData, 
  onSave, 
  onClose 
}: AdvancedProposalWriterProps) {
  const [sections, setSections] = useState<ProposalSection[]>([]);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showTableEditor, setShowTableEditor] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<ProposalTemplate | null>(null);
  const [proposalTitle, setProposalTitle] = useState(tenderTitle);
  const [proposalVersion, setProposalVersion] = useState("1.0");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showResearchStandards, setShowResearchStandards] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [versions, setVersions] = useState<Version[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Dummy data for versions
  useEffect(() => {
    setVersions([
      { id: 'v1', timestamp: new Date(), author: 'John Doe', summary: 'Initial draft' },
      { id: 'v2', timestamp: new Date(), author: 'Jane Smith', summary: 'Added technical specifications' },
    ]);
  }, []);

  const researchTemplates: ProposalTemplate[] = [
    // ... (same as before)
  ];

  // ... (all other functions are the same as before)
  
  const addSection = (type: ProposalSection['type']) => {
    const newSection: ProposalSection = {
      id: Date.now().toString(),
      type,
      content: getDefaultContent(type),
      order: sections.length + 1,
      metadata: { alignment: 'left' }
    };
    setSections([...sections, newSection]);
    setSelectedSection(newSection.id);
  };

  const getDefaultContent = (type: ProposalSection['type']) => {
    switch (type) {
      case 'heading':
        return 'New Heading';
      case 'text':
        return 'Enter your content here...';
      case 'image':
        return { src: '', alt: '', caption: '' };
      case 'table':
        return { headers: ['Column 1', 'Column 2'], rows: [['Row 1, Col 1', 'Row 1, Col 2']] };
      case 'list':
        return { items: ['Item 1', 'Item 2', 'Item 3'], ordered: false };
      case 'quote':
        return 'Quote text here...';
      case 'chart':
        return { type: 'bar', data: [], title: 'Chart Title' };
      case 'divider':
        return {};
      default:
        return '';
    }
  };

  const updateSection = (id: string, updates: Partial<ProposalSection>) => {
    setSections(sections.map(section => 
      section.id === id ? { ...section, ...updates } : section
    ));
  };

  const deleteSection = (id: string) => {
    setSections(sections.filter(section => section.id !== id));
    if (selectedSection === id) {
      setSelectedSection(null);
    }
  };

  const moveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;

    const newSections = [...sections];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex >= 0 && targetIndex < newSections.length) {
      [newSections[index], newSections[targetIndex]] = [newSections[targetIndex], newSections[index]];
      setSections(newSections);
    }
  };

  const applyTemplate = (template: ProposalTemplate) => {
    setSections(template.sections);
    setCurrentTemplate(template);
    setShowTemplates(false);
  };

  const generateAIContent = async (sectionId: string, prompt: string) => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/ai/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          context: {
            tenderTitle,
            comparisonData,
            sectionType: sections.find(s => s.id === sectionId)?.type
          }
        })
      });

      const data = await response.json();
      if (data.content) {
        updateSection(sectionId, { content: data.content });
      }
    } catch (error) {
      console.error('AI generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const saveProposal = async () => {
    setIsSaving(true);
    try {
      const proposal = {
        title: proposalTitle,
        version: proposalVersion,
        sections,
        tenderId,
        createdAt: new Date(),
        lastModified: new Date()
      };

      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proposal)
      });

      if (response.ok) {
        setLastSaved(new Date());
        onSave?.(proposal);
      }
    } catch (error) {
      console.error('Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const exportProposal = (format: 'pdf' | 'docx' | 'html') => {
    // Implementation for exporting in different formats
    console.log(`Exporting as ${format}`);
  };

  const renderSection = (section: ProposalSection) => {
    const isSelected = selectedSection === section.id;
    
    // ... (same as before)
  };

  return (
    <div className={`advanced-proposal-writer ${isFullscreen ? 'fullscreen' : ''}`}>
      {/* Header */}
      <div className="proposal-header">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <input
                type="text"
                value={proposalTitle}
                onChange={(e) => setProposalTitle(e.target.value)}
                className="text-xl font-bold border-none outline-none bg-transparent"
              />
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>Version {proposalVersion}</span>
                {lastSaved && (
                  <span>• Last saved: {lastSaved.toLocaleTimeString()}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
             <button
              onClick={() => setShowVersionHistory(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <History size={16} className="mr-2" />
              Version History
            </button>
            <button
              onClick={() => setShowTemplates(true)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <BookOpen size={16} className="mr-2" />
              Templates
            </button>
            
            <button
              onClick={() => setShowResearchStandards(true)}
              className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors"
            >
              <Award size={16} className="mr-2" />
              Research Standards
            </button>
            
            <button
              onClick={() => setIsPreviewMode(!isPreviewMode)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Eye size={16} className="mr-2" />
              {isPreviewMode ? 'Edit' : 'Preview'}
            </button>
            
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            
            <button
              onClick={saveProposal}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <Save size={16} className="mr-2" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
            
            {onClose && (
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <XCircle size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        {!isPreviewMode && (
          <div className="w-80 border-r bg-gray-50 p-4">
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Add Section</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => addSection('heading')}
                    className="p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors text-left"
                  >
                    <Type size={16} className="mb-1" />
                    <div className="text-sm font-medium">Heading</div>
                  </button>
                  
                  <button
                    onClick={() => addSection('text')}
                    className="p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors text-left"
                  >
                    <FileText size={16} className="mb-1" />
                    <div className="text-sm font-medium">Text</div>
                  </button>
                  
                  <button
                    onClick={() => addSection('image')}
                    className="p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors text-left"
                  >
                    <Image size={16} className="mb-1" />
                    <div className="text-sm font-medium">Image</div>
                  </button>
                  
                  <button
                    onClick={() => addSection('table')}
                    className="p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors text-left"
                  >
                    <Table size={16} className="mb-1" />
                    <div className="text-sm font-medium">Table</div>
                  </button>
                  
                  <button
                    onClick={() => addSection('list')}
                    className="p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors text-left"
                  >
                    <List size={16} className="mb-1" />
                    <div className="text-sm font-medium">List</div>
                  </button>
                  
                  <button
                    onClick={() => addSection('quote')}
                    className="p-3 bg-white rounded-lg border hover:bg-gray-50 transition-colors text-left"
                  >
                    <Quote size={16} className="mb-1" />
                    <div className="text-sm font-medium">Quote</div>
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Sections</h3>
                <div className="space-y-1">
                  {sections.map((section, index) => (
                    <div
                      key={section.id}
                      className={`p-2 rounded-lg cursor-pointer transition-colors ${
                        selectedSection === section.id
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-white hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs">
                            {index + 1}
                          </div>
                          <span className="text-sm font-medium capitalize">
                            {section.type}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(section.id, 'up');
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              moveSection(section.id, 'down');
                            }}
                            className="p-1 hover:bg-gray-200 rounded"
                          >
                            <ChevronDown size={12} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSection(section.id);
                            }}
                            className="p-1 hover:bg-red-100 rounded text-red-600"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">AI Assistant</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => selectedSection && generateAIContent(selectedSection, 'Improve this section')}
                    disabled={!selectedSection || isGenerating}
                    className="w-full p-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Brain size={16} className="mr-2" />
                    {isGenerating ? 'Generating...' : 'Improve Section'}
                  </button>
                  
                  <button
                    onClick={() => selectedSection && generateAIContent(selectedSection, 'Add research citations')}
                    disabled={!selectedSection || isGenerating}
                    className="w-full p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <BookOpen size={16} className="mr-2" />
                    Add Citations
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Editor */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="max-w-4xl mx-auto">
              {sections.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Start Writing Your Proposal
                  </h3>
                  <p className="text-gray-500 mb-4">
                    Add sections to build your comprehensive proposal
                  </p>
                  <button
                    onClick={() => addSection('heading')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Add First Section
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {sections.map((section) => (
                    <div
                      key={section.id}
                      className={`proposal-section-container ${
                        selectedSection === section.id ? 'ring-2 ring-blue-500' : ''
                      }`}
                      onClick={() => setSelectedSection(section.id)}
                    >
                      {renderSection(section)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Version History Modal */}
      {showVersionHistory && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl mx-4 shadow-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Version History</h3>
              <button
                onClick={() => setShowVersionHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <ul className="space-y-4">
                {versions.map((version) => (
                  <li key={version.id} className="p-4 border rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{version.summary}</p>
                        <p className="text-sm text-gray-500">By {version.author} on {version.timestamp.toLocaleDateString()}</p>
                      </div>
                      <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">Restore</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* ... (other modals are the same as before) ... */}
    </div>
  );
}
