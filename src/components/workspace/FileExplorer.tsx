import { useState } from 'react';
import { FileTree } from './FileTree';
import { SearchFiles } from './SearchFiles';

interface FileExplorerProps {
  activeFile: string | null;
  onFileSelect: (file: string) => void;
}

export default function FileExplorer({ activeFile, onFileSelect }: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="file-explorer">
      <div className="file-explorer__header">
        <h2 className="file-explorer__title">Explorer</h2>
        <SearchFiles 
          query={searchQuery} 
          onChange={setSearchQuery} 
        />
      </div>

      <FileTree 
        activeFile={activeFile}
        onFileSelect={onFileSelect}
        searchQuery={searchQuery}
      />

      <div className="file-explorer__footer">
        <button className="button-premium button-premium--secondary w-full">
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
      </div>
    </div>
  );
}