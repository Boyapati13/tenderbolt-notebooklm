'use client';

import { Plus, FolderOpen } from 'lucide-react';
import { SourcesPanel, SourcesPanelRef } from './sources-panel';
import { forwardRef } from 'react';
import { Button } from './ui/button';

export const LeftPanel = forwardRef<SourcesPanelRef, { 
  projectId: string; 
  onAddSource: () => void;
}>(({ projectId, onAddSource }, ref) => {
  return (
    <aside className="flex h-full w-80 flex-col bg-gray-800 text-white">
      <div className="flex items-center justify-between border-b border-gray-700 p-4">
        <h2 className="text-xl font-bold">Sources</h2>
        <Button variant="ghost" size="icon">
          <FolderOpen size={20} />
        </Button>
      </div>
      <div className="p-4">
        <Button onClick={onAddSource} className="w-full">
          <Plus size={16} className="mr-2" />
          Add New Source
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <SourcesPanel projectId={projectId} ref={ref} />
      </div>
    </aside>
  );
});

LeftPanel.displayName = 'LeftPanel';
