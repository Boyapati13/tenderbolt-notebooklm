"use client";

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
  ExternalLink
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
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // Research Standards Templates
  const researchTemplates: ProposalTemplate[] = [
    {
      id: 'academic-research',
      name: 'Academic Research Proposal',
      description: 'Comprehensive academic research proposal with methodology, literature review, and analysis',
      category: 'research',
      industry: 'Academic',
      complexity: 'expert',
      sections: [
        { id: '1', type: 'heading', content: 'Executive Summary', order: 1, metadata: { level: 1 } },
        { id: '2', type: 'text', content: 'Brief overview of the research objectives, methodology, and expected outcomes...', order: 2 },
        { id: '3', type: 'heading', content: 'Introduction and Background', order: 3, metadata: { level: 1 } },
        { id: '4', type: 'text', content: 'Detailed background information and problem statement...', order: 4 },
        { id: '5', type: 'heading', content: 'Literature Review', order: 5, metadata: { level: 1 } },
        { id: '6', type: 'text', content: 'Comprehensive review of existing research and gap analysis...', order: 6 },
        { id: '7', type: 'heading', content: 'Research Methodology', order: 7, metadata: { level: 1 } },
        { id: '8', type: 'text', content: 'Detailed methodology including data collection and analysis methods...', order: 8 },
        { id: '9', type: 'heading', content: 'Timeline and Milestones', order: 9, metadata: { level: 1 } },
        { id: '10', type: 'table', content: { headers: ['Phase', 'Duration', 'Deliverables', 'Status'], rows: [['Phase 1', '3 months', 'Literature Review', 'Pending'], ['Phase 2', '6 months', 'Data Collection', 'Pending'], ['Phase 3', '3 months', 'Analysis & Report', 'Pending']] }, order: 10 },
        { id: '11', type: 'heading', content: 'Budget and Resources', order: 11, metadata: { level: 1 } },
        { id: '12', type: 'table', content: { headers: ['Item', 'Quantity', 'Unit Cost', 'Total'], rows: [['Personnel', '2 FTE', '$50,000', '$100,000'], ['Equipment', '1', '$25,000', '$25,000'], ['Materials', 'Various', '$10,000', '$10,000']] }, order: 12 },
        { id: '13', type: 'heading', content: 'Expected Outcomes', order: 13, metadata: { level: 1 } },
        { id: '14', type: 'text', content: 'Description of expected research outcomes and impact...', order: 14 },
        { id: '15', type: 'heading', content: 'References', order: 15, metadata: { level: 1 } },
        { id: '16', type: 'text', content: 'Academic references and citations...', order: 16 }
      ]
    },
    {
      id: 'technical-proposal',
      name: 'Technical Research Proposal',
      description: 'Technical proposal with detailed specifications, diagrams, and technical analysis',
      category: 'technical',
      industry: 'Technology',
      complexity: 'advanced',
      sections: [
        { id: '1', type: 'heading', content: 'Technical Overview', order: 1, metadata: { level: 1 } },
        { id: '2', type: 'text', content: 'Technical summary and approach...', order: 2 },
        { id: '3', type: 'heading', content: 'System Architecture', order: 3, metadata: { level: 1 } },
        { id: '4', type: 'image', content: { src: '/api/placeholder/800/400', alt: 'System Architecture Diagram', caption: 'High-level system architecture' }, order: 4 },
        { id: '5', type: 'heading', content: 'Technical Specifications', order: 5, metadata: { level: 1 } },
        { id: '6', type: 'table', content: { headers: ['Component', 'Specification', 'Value', 'Notes'], rows: [['CPU', 'Processing Power', '8 cores @ 3.2GHz', 'Intel Xeon'], ['Memory', 'RAM', '32GB DDR4', 'ECC Memory'], ['Storage', 'Capacity', '1TB SSD', 'NVMe Interface']] }, order: 6 },
        { id: '7', type: 'heading', content: 'Implementation Plan', order: 7, metadata: { level: 1 } },
        { id: '8', type: 'text', content: 'Detailed implementation timeline and milestones...', order: 8 }
      ]
    },
    {
      id: 'compliance-proposal',
      name: 'Compliance & Standards Proposal',
      description: 'Proposal focused on regulatory compliance and industry standards',
      category: 'compliance',
      industry: 'Regulatory',
      complexity: 'expert',
      sections: [
        { id: '1', type: 'heading', content: 'Regulatory Compliance Overview', order: 1, metadata: { level: 1 } },
        { id: '2', type: 'text', content: 'Overview of applicable regulations and standards...', order: 2 },
        { id: '3', type: 'heading', content: 'Compliance Matrix', order: 3, metadata: { level: 1 } },
        { id: '4', type: 'table', content: { headers: ['Requirement', 'Standard', 'Compliance Status', 'Evidence'], rows: [['Data Security', 'ISO 27001', 'Compliant', 'Certification'], ['Quality Management', 'ISO 9001', 'Compliant', 'Audit Report'], ['Environmental', 'ISO 14001', 'In Progress', 'Implementation Plan']] }, order: 4 },
        { id: '5', type: 'heading', content: 'Risk Assessment', order: 5, metadata: { level: 1 } },
        { id: '6', type: 'text', content: 'Detailed risk analysis and mitigation strategies...', order: 6 }
      ]
    }
  ];

  // Initialize with default sections if none exist
  useEffect(() => {
    if (sections.length === 0) {
      const defaultSections: ProposalSection[] = [
        { id: '1', type: 'heading', content: 'Executive Summary', order: 1, metadata: { level: 1 } },
        { id: '2', type: 'text', content: 'Provide a comprehensive overview of your proposal...', order: 2 },
        { id: '3', type: 'heading', content: 'Technical Approach', order: 3, metadata: { level: 1 } },
        { id: '4', type: 'text', content: 'Detail your technical methodology and approach...', order: 4 },
        { id: '5', type: 'heading', content: 'Implementation Timeline', order: 5, metadata: { level: 1 } },
        { id: '6', type: 'table', content: { headers: ['Phase', 'Duration', 'Deliverables'], rows: [['Phase 1', '3 months', 'Initial Analysis'], ['Phase 2', '6 months', 'Development'], ['Phase 3', '3 months', 'Testing & Deployment']] }, order: 6 }
      ];
      setSections(defaultSections);
    }
  }, []);

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
    
    switch (section.type) {
      case 'heading':
        return (
          <div className={`proposal-section ${isSelected ? 'selected' : ''}`}>
            <input
              type="text"
              value={section.content}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
              className={`w-full text-${section.metadata?.level === 1 ? '3xl' : section.metadata?.level === 2 ? '2xl' : 'xl'} font-bold border-none outline-none bg-transparent`}
              placeholder="Enter heading..."
            />
          </div>
        );
      
      case 'text':
        return (
          <div className={`proposal-section ${isSelected ? 'selected' : ''}`}>
            <textarea
              value={section.content}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
              className="w-full min-h-[100px] border-none outline-none bg-transparent resize-none"
              placeholder="Enter your content..."
            />
          </div>
        );
      
      case 'image':
        return (
          <div className={`proposal-section ${isSelected ? 'selected' : ''}`}>
            <div className="image-container">
              {section.content.src ? (
                <img 
                  src={section.content.src} 
                  alt={section.content.alt} 
                  className="max-w-full h-auto rounded-lg"
                />
              ) : (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <FileImage size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">Click to upload image</p>
                </div>
              )}
              <input
                type="text"
                value={section.content.caption || ''}
                onChange={(e) => updateSection(section.id, { 
                  content: { ...section.content, caption: e.target.value }
                })}
                className="w-full mt-2 text-sm text-center text-gray-600 border-none outline-none bg-transparent"
                placeholder="Image caption..."
              />
            </div>
          </div>
        );
      
      case 'table':
        return (
          <div className={`proposal-section ${isSelected ? 'selected' : ''}`}>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    {section.content.headers.map((header: string, index: number) => (
                      <th key={index} className="border border-gray-300 px-4 py-2 bg-gray-100 font-semibold">
                        <input
                          type="text"
                          value={header}
                          onChange={(e) => {
                            const newHeaders = [...section.content.headers];
                            newHeaders[index] = e.target.value;
                            updateSection(section.id, { 
                              content: { ...section.content, headers: newHeaders }
                            });
                          }}
                          className="w-full border-none outline-none bg-transparent"
                        />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {section.content.rows.map((row: string[], rowIndex: number) => (
                    <tr key={rowIndex}>
                      {row.map((cell: string, cellIndex: number) => (
                        <td key={cellIndex} className="border border-gray-300 px-4 py-2">
                          <input
                            type="text"
                            value={cell}
                            onChange={(e) => {
                              const newRows = [...section.content.rows];
                              newRows[rowIndex][cellIndex] = e.target.value;
                              updateSection(section.id, { 
                                content: { ...section.content, rows: newRows }
                              });
                            }}
                            className="w-full border-none outline-none bg-transparent"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      case 'list':
        return (
          <div className={`proposal-section ${isSelected ? 'selected' : ''}`}>
            <ul className={`${section.content.ordered ? 'list-decimal' : 'list-disc'} pl-6`}>
              {section.content.items.map((item: string, index: number) => (
                <li key={index} className="mb-2">
                  <input
                    type="text"
                    value={item}
                    onChange={(e) => {
                      const newItems = [...section.content.items];
                      newItems[index] = e.target.value;
                      updateSection(section.id, { 
                        content: { ...section.content, items: newItems }
                      });
                    }}
                    className="w-full border-none outline-none bg-transparent"
                  />
                </li>
              ))}
            </ul>
          </div>
        );
      
      case 'quote':
        return (
          <div className={`proposal-section ${isSelected ? 'selected' : ''}`}>
            <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-700">
              <textarea
                value={section.content}
                onChange={(e) => updateSection(section.id, { content: e.target.value })}
                className="w-full border-none outline-none bg-transparent resize-none"
                placeholder="Enter quote..."
              />
            </blockquote>
          </div>
        );
      
      default:
        return null;
    }
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

      {/* Templates Modal */}
      {showTemplates && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 shadow-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Proposal Templates</h3>
              <button
                onClick={() => setShowTemplates(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {researchTemplates.map((template) => (
                <div
                  key={template.id}
                  className="p-4 border rounded-lg hover:border-blue-300 cursor-pointer transition-colors"
                  onClick={() => applyTemplate(template)}
                >
                  <h4 className="font-semibold mb-2">{template.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="px-2 py-1 bg-gray-100 rounded">{template.category}</span>
                    <span className="px-2 py-1 bg-gray-100 rounded">{template.complexity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Research Standards Modal */}
      {showResearchStandards && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-4xl mx-4 shadow-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold">Research Standards & Guidelines</h3>
              <button
                onClick={() => setShowResearchStandards(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Academic Standards</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• APA/MLA citation format</li>
                    <li>• Peer-reviewed sources</li>
                    <li>• Literature review requirements</li>
                    <li>• Methodology documentation</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Technical Standards</h4>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>• IEEE standards compliance</li>
                    <li>• Technical specifications</li>
                    <li>• System architecture diagrams</li>
                    <li>• Performance metrics</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-900 mb-2">Industry Standards</h4>
                  <ul className="text-sm text-purple-800 space-y-1">
                    <li>• ISO 9001 quality management</li>
                    <li>• ISO 27001 security standards</li>
                    <li>• Regulatory compliance</li>
                    <li>• Best practices documentation</li>
                  </ul>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h4 className="font-semibold text-orange-900 mb-2">Research Ethics</h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• IRB approval requirements</li>
                    <li>• Data privacy compliance</li>
                    <li>• Informed consent protocols</li>
                    <li>• Conflict of interest disclosure</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
