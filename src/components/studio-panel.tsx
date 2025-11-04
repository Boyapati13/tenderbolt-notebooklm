'use client';

import { useState } from 'react';
import { BrainCircuit, FileText, Music, Video } from 'lucide-react';
import { AudioOverview } from './studio/audio-overview';
import { MindMap } from './studio/mind-map';
import { Reports } from './studio/reports';
import { VideoOverview } from './studio/video-overview';

const tabs = [
  { id: 'mindmap', label: 'Mind Map', icon: BrainCircuit },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'audio', label: 'Audio', icon: Music },
  { id: 'video', label: 'Video', icon: Video },
];

export function StudioPanel({ projectId }: { projectId: string }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  const renderContent = () => {
    switch (activeTab) {
      case 'mindmap':
        return <MindMap projectId={projectId} />;
      case 'reports':
        return <Reports projectId={projectId} />;
      case 'audio':
        return <AudioOverview projectId={projectId} />;
      case 'video':
        return <VideoOverview projectId={projectId} />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <div className="p-4">
        <div className="flex items-center justify-center p-1 bg-slate-100 rounded-lg">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              <tab.icon size={16} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto px-4 pb-4">
        {renderContent()}
      </div>
    </div>
  );
}