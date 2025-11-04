'use client';

import { AlertTriangle } from 'lucide-react';
import { useProject } from '@/hooks/useProject';
import { LeftPanel } from './left-panel';
import { CenterPanel } from './center-panel';
import { useState, useRef } from 'react';
import { AddSourcesPanel } from './add-sources-panel';
import { SourcesPanelRef } from './sources-panel';

export function ProjectWorkspace({ projectId }: { projectId: string }) {
  const { project, isLoading, isError } = useProject(projectId);
  const [showAddSources, setShowAddSources] = useState(false);
  const sourcesPanelRef = useRef<SourcesPanelRef>(null);

  const handleChooseFile = () => {
    sourcesPanelRef.current?.triggerFileInput();
    setShowAddSources(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400"></div>
          <p className="text-lg font-medium">Loading Project...</p>
        </div>
      </div>
    );
  }

  if (isError || !project) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-900 text-white">
        <div className="rounded-lg bg-red-800 p-8 text-center">
          <AlertTriangle className="mx-auto h-16 w-16 text-red-400" />
          <h3 className="mt-4 text-2xl font-bold">Project Error</h3>
          <p className="mt-2 text-red-300">
            There was a problem loading your project. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  if (showAddSources) {
    return <AddSourcesPanel onBack={() => setShowAddSources(false)} onChooseFile={handleChooseFile} />;
  }

  return (
    <div className="flex h-screen w-full bg-gray-900 text-white">
      <LeftPanel ref={sourcesPanelRef} projectId={projectId} onAddSource={() => setShowAddSources(true)} />
      <CenterPanel projectId={projectId} onUploadSource={() => setShowAddSources(true)} />
    </div>
  );
}
