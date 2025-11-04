'use client';

import { GitCompare, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { Diff, Hunk, parseDiff } from 'react-diff-view';
import 'react-diff-view/style/index.css';
import { createPatch } from 'diff';
import { useProjectStore } from '../store/useProjectStore';

export function DocumentComparisonPanel() {
  // State from our centralized Zustand store
  const {
    documents,
    selectedDoc1Id,
    selectedDoc2Id,
    selectDoc1,
    selectDoc2,
    setDocuments
  } = useProjectStore();

  const [diff, setDiff] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Temporary: Fetch and set documents into the store
  useEffect(() => {
    // This will be replaced by our new API layer
    const fetchDocuments = async () => {
      setDocuments([
        { id: '1', name: 'Document A', content: 'The quick brown fox jumps over the lazy dog.' },
        { id: '2', name: 'Document B', content: 'The quick brown cat jumps over the energetic dog.' },
        { id: '3', name: 'Document C', content: 'This is a completely different document.' },
      ]);
    };
    fetchDocuments();
  }, [setDocuments]);

  useEffect(() => {
    const doc1 = documents.find(d => d.id === selectedDoc1Id);
    const doc2 = documents.find(d => d.id === selectedDoc2Id);

    if (doc1 && doc2) {
      setIsLoading(true);
      const patch = createPatch(doc1.name, doc1.content, doc2.content);
      setDiff(patch);
      setIsLoading(false);
    } else {
      setDiff(null);
    }
  }, [selectedDoc1Id, selectedDoc2Id, documents]);

  const files = diff ? parseDiff(diff) : [];

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <GitCompare size={20} className="text-orange-600" />
        <h2 className="text-lg font-semibold">Document Comparison</h2>
      </div>
      <div className="flex gap-4 mb-4">
        <select onChange={(e) => selectDoc1(e.target.value)} value={selectedDoc1Id || ''} className="w-1/2 p-2 border rounded bg-white text-black">
          <option value="">Select Document 1</option>
          {documents.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
        </select>
        <select onChange={(e) => selectDoc2(e.target.value)} value={selectedDoc2Id || ''} className="w-1/2 p-2 border rounded bg-white text-black">
          <option value="">Select Document 2</option>
          {documents.map(doc => <option key={doc.id} value={doc.id}>{doc.name}</option>)}
        </select>
      </div>
      <div className="flex-1 border rounded p-4 bg-gray-50 overflow-auto">
        {isLoading && <p>Loading comparison...</p>}
        {diff && files.length > 0 ? (
          <Diff viewType="split" diffType={files[0].type} hunks={files[0].hunks}>
            {(hunks: any[]) => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
          </Diff>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            <FileText className="w-12 h-12 mx-auto mb-2" />
            <p>Select two documents to see the comparison.</p>
          </div>
        )}
      </div>
    </div>
  );
}
