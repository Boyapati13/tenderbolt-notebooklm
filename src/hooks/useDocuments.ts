'use client';

import useSWR from 'swr';
import { useCallback, useState } from 'react';

// Define the shape of a document
type Document = {
  id: string;
  filename: string;
  category?: string;
  documentType?: string;
  summary?: string;
};

// Define the fetcher function for SWR
const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Failed to fetch documents' }));
    throw new Error(errorData.message || 'Failed to fetch documents');
  }
  const data = await response.json();
  return data.documents as Document[];
};

export function useDocuments(projectId?: string) {
  const endpoint = projectId ? `/api/documents?projectId=${projectId}` : '/api/documents';
  const { data: documents, error, mutate } = useSWR<Document[]>(endpoint, fetcher);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadFiles = useCallback((files: File[], category: string = 'project') => {
    return new Promise<void>(async (resolve, reject) => {
      if (!files || files.length === 0) {
        return resolve();
      }

      setIsUploading(true);
      setUploadProgress(0);

      const form = new FormData();
      files.forEach(file => form.append('files', file));
      if (projectId) {
        form.append('projectId', projectId);
      }
      form.append('category', category);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded * 100) / event.total);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        setIsUploading(false);
        if (xhr.status >= 200 && xhr.status < 300) {
          const newUploadData = JSON.parse(xhr.responseText);
          const docsWithCategory = newUploadData.documents.map((doc: Document) => ({
            ...doc,
            category,
          }));
          
          await mutate(
            (currentDocs = []) => [...currentDocs, ...docsWithCategory],
            false
          );
          resolve();
        } else {
          try {
            const errorData = JSON.parse(xhr.responseText);
            reject(new Error(errorData.error || 'Upload failed'));
          } catch(e) {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      });

      xhr.addEventListener('error', () => {
        setIsUploading(false);
        reject(new Error('Upload failed due to a network error.'));
      });

      xhr.open('POST', '/api/upload', true);
      xhr.send(form);
    });
  }, [projectId, mutate]);
  
  const deleteDocument = useCallback(async (docId: string) => {
    try {
      await mutate(
        (currentDocs = []) => currentDocs.filter(doc => doc.id !== docId),
        false
      );
      const response = await fetch(`/api/documents/${docId}`, { method: 'DELETE' });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to delete document');
      }
      await mutate();
    } catch (error) {
      console.error('Delete error:', error);
      await mutate();
      throw error;
    }
  }, [mutate]);

  return {
    documents: documents || [],
    isLoading: !error && !documents,
    isUploading,
    uploadProgress,
    isError: error,
    uploadFiles,
    deleteDocument,
    mutate,
  };
}
