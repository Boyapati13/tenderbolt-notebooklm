'use client';

import { create } from 'zustand';

// Define the types for our state
export type Document = {
  id: string;
  name: string;
  content: string;
  category?: string;
  summary?: string;
  [key: string]: any;
};

export type Project = {
  id: string;
  name: string;
  documents: Document[];
};

type ProjectState = {
  projects: Project[];
  activeProjectId: string | null;
  documents: Document[]; // This will be derived from the active project
  selectedDoc1Id: string | null;
  selectedDoc2Id: string | null;
  
  // Actions
  setProjects: (projects: Project[]) => void;
  setActiveProject: (projectId: string) => void;
  addDocumentToProject: (projectId: string, doc: Document) => void;
  setDocuments: (documents: Document[]) => void;
  selectDoc1: (id: string | null) => void;
  selectDoc2: (id: string | null) => void;
};

// Create the Zustand store
export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  activeProjectId: null,
  documents: [],
  selectedDoc1Id: null,
  selectedDoc2Id: null,

  setProjects: (projects) => set({ projects }),
  
  setActiveProject: (projectId) => {
    const activeProject = get().projects.find(p => p.id === projectId);
    set({ 
      activeProjectId: projectId,
      documents: activeProject ? activeProject.documents : [],
      // Reset selections when project changes
      selectedDoc1Id: null,
      selectedDoc2Id: null,
    });
  },

  addDocumentToProject: (projectId, doc) => {
    set(state => ({
      projects: state.projects.map(p => 
        p.id === projectId 
          ? { ...p, documents: [...p.documents, doc] } 
          : p
      ),
      // Also update the active documents list if it's the current project
      documents: state.activeProjectId === projectId ? [...state.documents, doc] : state.documents,
    }));
  },

  setDocuments: (documents) => set(state => {
    if (state.activeProjectId) {
      return {
        projects: state.projects.map(p => 
          p.id === state.activeProjectId 
            ? { ...p, documents: documents } 
            : p
        ),
        documents: documents,
      };
    } 
    // If no active project, just update the potentially orphaned documents list
    return { documents };
  }),

  selectDoc1: (id) => set({ selectedDoc1Id: id }),
  selectDoc2: (id) => set({ selectedDoc2Id: id }),
}));
