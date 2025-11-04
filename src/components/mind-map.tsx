'use client';

import { useState } from 'react';
import { FileText, Mic, Video, Brain, AlertTriangle, CheckSquare, DollarSign, ArrowRight, Check, Image as ImageIcon, Music, Film } from 'lucide-react';

// Define the types of reports that can be generated
const reportTypes = [
  {
    id: 'budget',
    title: 'Budget and cost analysis',
    icon: DollarSign,
    description: 'Analyze project costs against budget.',
  },
  {
    id: 'risk',
    title: 'Risk analysis and mitigation',
    icon: AlertTriangle,
    description: 'Identify and evaluate project risks.',
  },
  {
    id: 'compliance',
    title: 'Regulatory compliance check',
    icon: CheckSquare,
    description: 'Verify compliance with regulations.',
  },
];

// Main component for the Mind Map/Reports section
export function MindMap() {
  const [activeTab, setActiveTab] = useState('reports');
  const [selectedReportTypes, setSelectedReportTypes] = useState<Set<string>>(new Set(['budget']));
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<string | null>(null);

  // Toggle the selection of a report type
  const toggleReportType = (id: string) => {
    const newSelection = new Set(selectedReportTypes);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedReportTypes(newSelection);
  };

  // Handle the generation of the report
  const handleGenerateReport = () => {
    if (selectedReportTypes.size === 0) {
      alert("Please select at least one report type to generate.");
      return;
    }
    setIsGenerating(true);
    setGeneratedReport(null);
    // Simulate report generation
    setTimeout(() => {
      const selected = Array.from(selectedReportTypes).map(id => reportTypes.find(rt => rt.id === id)?.title).join(', ');
      setGeneratedReport(`Report generated successfully for: ${selected}.`);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col bg-slate-800/50 text-white p-4 rounded-lg shadow-lg">
      <div className="flex-shrink-0">
        <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      <div className="flex-1 mt-4 overflow-auto">
        {activeTab === 'reports' && (
          <ReportsSection
            selectedReportTypes={selectedReportTypes}
            toggleReportType={toggleReportType}
            onGenerate={handleGenerateReport}
            isGenerating={isGenerating}
            generatedReport={generatedReport}
          />
        )}
        {activeTab === 'audio' && <StudioPlaceholder tab="Audio" icon={Music} />}
        {activeTab === 'video' && <StudioPlaceholder tab="Video" icon={Film} />}
        {activeTab === 'image' && <StudioPlaceholder tab="Image" icon={ImageIcon} />}
      </div>
    </div>
  );
}

// Navigation tabs for Reports, Audio, Video
const TabNavigation = ({ activeTab, setActiveTab }: any) => (
  <div className="flex items-center p-1 bg-slate-900/50 rounded-lg">
    <TabButton id="reports" label="Reports" icon={FileText} activeTab={activeTab} onClick={setActiveTab} />
    <TabButton id="audio" label="Audio" icon={Mic} activeTab={activeTab} onClick={setActiveTab} />
    <TabButton id="video" label="Video" icon={Video} activeTab={activeTab} onClick={setActiveTab} />
    <TabButton id="image" label="Image" icon={ImageIcon} activeTab={activeTab} onClick={setActiveTab} />
  </div>
);

// A single tab button
const TabButton = ({ id, label, icon: Icon, activeTab, onClick }: any) => (
  <button
    onClick={() => onClick(id)}
    className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-all duration-300 ${
      activeTab === id
        ? 'bg-slate-700/80 text-white shadow-md'
        : 'text-slate-400 hover:bg-slate-700/50'
    }`}
  >
    <Icon size={16} />
    <span>{label}</span>
  </button>
);

// Section for generating reports
const ReportsSection = ({ selectedReportTypes, toggleReportType, onGenerate, isGenerating, generatedReport }: any) => (
  <div className="flex flex-col h-full">
    {/* Report Type Selection */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
      {reportTypes.map((type) => (
        <ReportTypeCard
          key={type.id}
          {...type}
          isSelected={selectedReportTypes.has(type.id)}
          onSelect={() => toggleReportType(type.id)}
        />
      ))}
    </div>

    {/* Generate Button */}
    <div className="my-auto text-center">
      <button
        onClick={onGenerate}
        disabled={isGenerating || selectedReportTypes.size === 0}
        className="px-8 py-3 bg-amber-500 text-slate-900 font-bold rounded-lg hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mx-auto"
      >
        {isGenerating ? 'Generating...' : 'Generate Report'}
        {!isGenerating && <ArrowRight size={16} />}
      </button>
    </div>

    {/* Generated Report Display */}
    <div className="flex-1 mt-4">
      {isGenerating && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-300">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-300"></div>
          <p>Analyzing documents and generating report...</p>
        </div>
      )}
      {generatedReport && (
        <div className="w-full h-full bg-slate-900/50 rounded-lg p-4 text-center">
          <h3 className="text-lg font-semibold mb-2">Report Ready</h3>
          <p className="text-slate-300">{generatedReport}</p>
        </div>
      )}
      {!isGenerating && !generatedReport && (
        <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-slate-500">
          <FileText size={48} />
          <p>No report generated yet.</p>
        </div>
      )}
    </div>
  </div>
);

// Card for selecting a report type
const ReportTypeCard = ({ id, title, icon: Icon, isSelected, onSelect }: any) => (
  <div
    onClick={onSelect}
    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
      isSelected ? 'border-amber-500 bg-slate-700/50' : 'border-slate-700 hover:border-slate-600'
    }`}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Icon size={20} className={isSelected ? 'text-amber-500' : 'text-slate-400'} />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
          isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-600'
        }`}
      >
        {isSelected && <Check size={12} className="text-slate-900" />}
      </div>
    </div>
  </div>
);


// Placeholder for inactive tabs
const StudioPlaceholder = ({ tab, icon: Icon }: { tab: string, icon: React.ElementType }) => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500">
    <Icon size={48} />
    <h3 className="mt-4 text-lg font-semibold">{tab} Studio</h3>
    <p className="mt-2 text-sm text-center">
      AI-powered {tab.toLowerCase()} generation and editing features are coming soon.
    </p>
    <button className="mt-6 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors">
        Notify Me
      </button>
  </div>
);
