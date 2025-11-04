'use client';

import { ChatPanel } from './chat-panel';

export function CenterPanel({ 
  projectId, 
  onUploadSource
}: { 
  projectId: string; 
  onUploadSource: () => void;
}) {
  return (
    <main className="flex-1 flex-col bg-gray-900">
      <header className="flex items-center justify-between border-b border-gray-700 p-4">
        <h1 className="text-xl font-bold">Project Chat</h1>
      </header>
      <ChatPanel projectId={projectId} onUploadSource={onUploadSource} />
    </main>
  );
}
