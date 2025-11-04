import { useState } from 'react';
import { motion } from 'framer-motion';
import FileExplorer from './FileExplorer';
import ToolsPanel from './ToolsPanel';
import Editor from './Editor';
import { WorkspaceProvider } from '@/contexts/WorkspaceContext';

export default function WorkspaceStudio() {
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  return (
    <WorkspaceProvider>
      <div className="workspace">
        <motion.div 
          className={`workspace__sidebar ${isPanelOpen ? 'workspace__sidebar--open' : ''}`}
          initial={{ width: 280 }}
          animate={{ width: isPanelOpen ? 280 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FileExplorer 
            onFileSelect={setActiveFile} 
            activeFile={activeFile}
          />
        </motion.div>

        <div className="workspace__main">
          <div className="workspace__header">
            <button
              className="button-premium button-premium--secondary"
              onClick={() => setIsPanelOpen(!isPanelOpen)}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            <div className="workspace__breadcrumbs">
              {activeFile && (
                <>
                  <span className="text-gray-500">Project</span>
                  <span className="mx-2">/</span>
                  <span className="text-gray-700">{activeFile}</span>
                </>
              )}
            </div>

            <div className="workspace__actions">
              <button className="button-premium button-premium--secondary">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New File
              </button>
              <button className="button-premium button-premium--primary">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                Save Changes
              </button>
            </div>
          </div>

          <div className="workspace__content">
            <div className="workspace__editor">
              <Editor activeFile={activeFile} />
            </div>
            <ToolsPanel />
          </div>
        </div>
      </div>
    </WorkspaceProvider>
  );
}