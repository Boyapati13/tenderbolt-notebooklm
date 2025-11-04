'use client';

import { useState, useCallback, useRef, forwardRef, useImperativeHandle } from 'react';
import {
  FileText,
  Trash2,
  ChevronDown,
  ChevronRight,
  File as FileIcon,
  Building2,
  FileCheck,
  UploadCloud
} from 'lucide-react';
import { useDocuments } from '@/hooks/useDocuments';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

type Document = {
  id: string;
  filename: string;
  category?: string;
};

type FolderData = {
  name: string;
  icon: typeof FileText;
  color: string;
  category: string;
  documents: Document[];
};

export type SourcesPanelRef = {
  triggerFileInput: () => void;
};

export const SourcesPanel = forwardRef<SourcesPanelRef, { projectId?: string }>(({ projectId }, ref) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(
    new Set(['project', 'supporting', 'company'])
  );

  const { documents, isLoading, isUploading, uploadProgress, isError, uploadFiles, deleteDocument } = useDocuments(projectId);
  
  useImperativeHandle(ref, () => ({
    triggerFileInput: () => {
      inputRef.current?.click();
    },
  }));

  const handleFileUpload = useCallback(async (selectedFiles: File[]) => {
    try {
      await uploadFiles(selectedFiles);
      window.dispatchEvent(new CustomEvent('documentUploaded'));
    } catch (error) {
      console.error("Upload failed:", error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [uploadFiles]);

  const onDrop = useCallback(async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files || []);
    if (droppedFiles.length > 0) {
      await handleFileUpload(droppedFiles);
    }
  }, [handleFileUpload]);

  const handleDeleteDocument = async (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(docId);
      } catch (error) {
        console.error("Failed to delete document:", error);
        alert("Failed to delete document.");
      }
    }
  };

  const toggleFolder = (category: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      newSet.has(category) ? newSet.delete(category) : newSet.add(category);
      return newSet;
    });
  };

  const folders: FolderData[] = [
    {
      name: "Project Documents",
      icon: FileText,
      color: "text-blue-400",
      category: "project",
      documents: documents.filter(d => d.category === 'project'),
    },
    {
      name: "Supporting Documents",
      icon: FileCheck,
      color: "text-green-400",
      category: "supporting",
      documents: documents.filter(d => d.category === 'supporting'),
    },
    {
      name: "Company Documents",
      icon: Building2,
      color: "text-purple-400",
      category: "company",
      documents: documents.filter(d => d.category === 'company'),
    },
  ];

  const renderContent = () => {
    if (isLoading) {
      return <div className="flex h-full items-center justify-center text-gray-400">Loading sources...</div>;
    }
    if (isError) {
      return <div className="flex h-full items-center justify-center text-red-400">Error loading documents.</div>;
    }
    if (documents.length === 0 && !isUploading) {
      return <DragDropZone isDragging={isDragging} onClick={() => inputRef.current?.click()} />;
    }
    return (
      <div className="space-y-2">
        {isUploading && <UploadingIndicator progress={uploadProgress} />}
        {folders.map(folder => (
          <FolderView 
            key={folder.category} 
            folder={folder} 
            expandedFolders={expandedFolders} 
            toggleFolder={toggleFolder} 
            onDelete={handleDeleteDocument} 
          />
        ))}
      </div>
    );
  }

  return (
    <div 
      className="h-full flex flex-col"
      onDragOver={e => {e.preventDefault(); setIsDragging(true);}}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <div className="flex-1 overflow-auto pr-2">
        {renderContent()}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          const selected = Array.from(e.target.files || []);
          if (selected.length > 0) {
            handleFileUpload(selected);
            e.currentTarget.value = "";
          }
        }}
      />
    </div>
  );
});

SourcesPanel.displayName = 'SourcesPanel';

const UploadingIndicator = ({ progress }: { progress: number }) => (
  <Card className="mb-4 bg-gray-700 border-gray-600">
    <CardContent className="p-4">
      <p className="text-sm font-medium text-white mb-2">Uploading files...</p>
      <Progress value={progress} className="w-full" />
    </CardContent>
  </Card>
);

const DragDropZone = ({ isDragging, onClick }: { isDragging: boolean; onClick: () => void; }) => (
  <Card 
    onClick={onClick}
    className={`flex h-full cursor-pointer flex-col items-center justify-center text-center transition-colors border-2 border-dashed ${isDragging ? "border-blue-400 bg-blue-900/30" : "border-gray-600 bg-transparent hover:border-gray-500 hover:bg-gray-800/50"}`}>
    <CardContent className="p-8">
      <UploadCloud size={32} className="mx-auto text-gray-500 mb-4" />
      <p className="font-medium text-gray-300">Drop files or <span className="font-semibold text-blue-400">click to upload</span></p>
      <p className="text-sm text-gray-500 mt-1">Documents will be automatically categorized.</p>
    </CardContent>
  </Card>
);

const FolderView = ({ folder, expandedFolders, toggleFolder, onDelete }: any) => (
  <div>
    <button
      onClick={() => toggleFolder(folder.category)}
      className="flex w-full items-center justify-between rounded-md p-2.5 transition-colors hover:bg-gray-700/50"
    >
      <div className="flex items-center gap-2.5">
        {expandedFolders.has(folder.category) ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
        <folder.icon size={18} className={folder.color} />
        <span className="font-semibold text-gray-200">{folder.name}</span>
      </div>
      <span className="rounded-full bg-gray-700 px-2 py-0.5 text-xs font-mono text-gray-300">{folder.documents.length}</span>
    </button>
    {expandedFolders.has(folder.category) && (
      <div className="pl-6 pr-2 pt-1 pb-2">
        {folder.documents.length === 0 ? (
          <p className="py-2 px-3 text-center text-xs text-gray-500">No documents in this category.</p>
        ) : (
          <div className="space-y-1">
            {folder.documents.map((doc: Document) => (
              <DocumentItem 
                key={doc.id} 
                doc={doc} 
                folder={folder} 
                onDelete={onDelete} 
              />
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);

const DocumentItem = ({ doc, folder, onDelete }: any) => (
  <div className="group flex items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-700/50">
    <div className="flex min-w-0 flex-1 items-center gap-3">
       <FileIcon size={14} className={`${folder.color} flex-shrink-0`} />
      <span className="truncate text-sm text-gray-300" title={doc.filename}>{doc.filename}</span>
    </div>
    <div className="flex flex-shrink-0 items-.center pl-2 opacity-0 transition-opacity group-hover:opacity-100">
      <Button variant="ghost" size="icon" onClick={() => onDelete(doc.id)} className="h-7 w-7 text-gray-400 hover:text-red-400">
        <Trash2 size={14} />
      </Button>
    </div>
  </div>
);
