'use client';

import { useState, useCallback } from 'react';
import { Search, Loader2, Globe, FileText, Newspaper, TrendingUp, BookOpen, ExternalLink, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

// Defines the structure for a single search result source
interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
  reliability?: string;
  type?: string;
}

// Main component for the internet search panel
export function InternetSearchPanel() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<SearchResult[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    
    setIsLoading(true);
    setError(null);
    setResults(null);
    setSummary(null);

    try {
      const response = await fetch('/api/ai/internet-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Search failed');
      }

      const data = await response.json();
      setSummary(data.data?.overview?.summary || null);
      setResults(data.data?.sources || []);
      
    } catch (e: any) {
      setError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  return (
    <div className="h-full flex flex-col p-3 text-white space-y-3">
      <SearchInput query={query} setQuery={setQuery} onSearch={handleSearch} isLoading={isLoading} />
      
      <div className="flex-1 overflow-auto pr-1 space-y-4">
        {isLoading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {summary && <AISummary summary={summary} />}
        {results && <ResultsDisplay results={results} />}
        {!isLoading && !error && !results && <InitialState />}
      </div>
    </div>
  );
}

const SearchInput = ({ query, setQuery, onSearch, isLoading }: any) => (
  <div className="relative">
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && onSearch()}
      placeholder="Search the web..."
      className="w-full pl-4 pr-12 py-2.5 bg-slate-800/60 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-600 transition-all"
      disabled={isLoading}
    />
    <button 
      onClick={onSearch}
      disabled={isLoading || !query.trim()}
      className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-slate-700/80 rounded-full hover:bg-slate-600/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
    </button>
  </div>
);

const LoadingState = () => (
  <div className="pt-16 flex flex-col items-center justify-center text-slate-400">
    <Loader2 size={24} className="animate-spin mb-3" />
    <p className="text-sm">Searching the internet...</p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="pt-16 flex flex-col items-center justify-center text-red-400 text-center px-4">
    <AlertCircle size={24} className="mb-3" />
    <p className="text-sm font-medium">Search Failed</p>
    <p className="text-xs text-red-300/80">{message}</p>
  </div>
);

const InitialState = () => (
  <div className="pt-16 flex flex-col items-center justify-center text-slate-500 text-center px-4">
    <Globe size={32} className="mb-4" />
    <p className="text-sm font-medium">Live Web Search</p>
    <p className="text-xs text-slate-600">Get real-time information from across the internet.</p>
  </div>
);

const AISummary = ({ summary }: { summary: string }) => (
  <div className="p-3 bg-blue-900/30 rounded-lg border border-blue-800/50">
    <div className="flex items-center gap-2 mb-2">
      <Sparkles size={16} className="text-blue-400"/>
      <h3 className="text-sm font-semibold text-blue-300">AI Summary</h3>
    </div>
    <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
  </div>
);

const ResultsDisplay = ({ results }: { results: SearchResult[] }) => (
  <div className="space-y-3">
    <p className="text-xs text-slate-400 px-1">Found {results.length} sources:</p>
    {results.map((result, index) => (
      <div key={index} className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
        <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-400 hover:underline">
          {result.title}
        </a>
        <p className="text-xs text-slate-500 mt-1 mb-2 font-mono flex items-center gap-1.5">
          <ExternalLink size={12}/> {result.source || new URL(result.url).hostname}
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          {result.snippet}
        </p>
      </div>
    ))}
  </div>
);
