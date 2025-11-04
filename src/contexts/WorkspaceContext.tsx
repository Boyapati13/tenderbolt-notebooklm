import { createContext, useContext, useState, useCallback } from 'react';

interface File {
  id: string;
  name: string;
  content: string;
  path: string;
  type: 'file' | 'folder';
  children?: File[];
}

interface WorkspaceContextType {
  files: File[];
  activeFile: string | null;
  setActiveFile: (file: string | null) => void;
  createFile: (path: string, content: string) => void;
  updateFile: (path: string, content: string) => void;
  deleteFile: (path: string) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<File[]>([]);
  const [activeFile, setActiveFile] = useState<string | null>(null);

  const createFile = useCallback((path: string, content: string) => {
    setFiles((prevFiles) => {
      const newFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: path.split('/').pop() || '',
        content,
        path,
        type: 'file',
      };

      // Handle nested path creation
      const parts = path.split('/').filter(Boolean);
      let current = prevFiles;
      
      for (let i = 0; i < parts.length - 1; i++) {
        let folder = current.find(
          (f) => f.type === 'folder' && f.name === parts[i]
        );
        
        if (!folder) {
          folder = {
            id: Math.random().toString(36).substr(2, 9),
            name: parts[i],
            content: '',
            path: parts.slice(0, i + 1).join('/'),
            type: 'folder',
            children: [],
          };
          current.push(folder);
        }
        
        current = folder.children || [];
      }

      current.push(newFile);
      return [...prevFiles];
    });
  }, []);

  const updateFile = useCallback((path: string, content: string) => {
    setFiles((prevFiles) => {
      const updateFileInTree = (files: File[]): File[] => {
        return files.map((file) => {
          if (file.path === path) {
            return { ...file, content };
          }
          if (file.children) {
            return {
              ...file,
              children: updateFileInTree(file.children),
            };
          }
          return file;
        });
      };

      return updateFileInTree(prevFiles);
    });
  }, []);

  const deleteFile = useCallback((path: string) => {
    setFiles((prevFiles) => {
      const deleteFileInTree = (files: File[]): File[] => {
        return files.filter((file) => {
          if (file.path === path) {
            return false;
          }
          if (file.children) {
            file.children = deleteFileInTree(file.children);
          }
          return true;
        });
      };

      return deleteFileInTree(prevFiles);
    });

    if (activeFile === path) {
      setActiveFile(null);
    }
  }, [activeFile]);

  return (
    <WorkspaceContext.Provider
      value={{
        files,
        activeFile,
        setActiveFile,
        createFile,
        updateFile,
        deleteFile,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}