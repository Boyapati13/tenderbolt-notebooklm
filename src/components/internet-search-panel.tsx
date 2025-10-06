"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  ExternalLink, 
  Star, 
  Clock, 
  Globe, 
  BookOpen, 
  Newspaper, 
  Image, 
  Video, 
  FileText, 
  TrendingUp,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Share2,
  Bookmark
} from "lucide-react";

interface SearchSource {
  title: string;
  url: string;
  type: string;
  reliability: string;
  lastUpdated: string;
  snippet: string;
}

interface RelatedTopic {
  topic: string;
  relevance: string;
  description: string;
}

interface PracticalApplication {
  application: string;
  description: string;
  benefits: string[];
  considerations: string[];
}

interface Metric {
  metric: string;
  value: string;
  unit: string;
  source: string;
  date: string;
}

interface NewsItem {
  headline: string;
  summary: string;
  date: string;
  source: string;
  url: string;
  relevance: string;
}

interface ExpertInsight {
  expert: string;
  insight: string;
  credibility: string;
  source: string;
}

interface SearchMetadata {
  query: string;
  searchType: string;
  totalResults: number;
  searchTime: string;
  sources: string[];
  lastUpdated: string;
  confidence: string;
  webEnhanced?: boolean;
  lastWebSearch?: string;
  searchOptions?: any;
}

interface Recommendations {
  nextSteps: string[];
  additionalSearches: string[];
  resources: string[];
  considerations: string[];
}

interface InternetSearchResult {
  overview: {
    summary: string;
    keyFacts: string[];
    currentStatus: string;
    importance: string;
    lastUpdated: string;
  };
  detailedInformation: {
    description: string;
    technicalDetails: string;
    historicalContext: string;
    currentTrends: string;
    futureOutlook: string;
  };
  sources: SearchSource[];
  relatedTopics: RelatedTopic[];
  practicalApplications: PracticalApplication[];
  dataAndStatistics: {
    metrics: Metric[];
    trends: string;
    comparisons: string;
  };
  newsAndUpdates: NewsItem[];
  expertInsights: ExpertInsight[];
  searchMetadata: SearchMetadata;
  recommendations: Recommendations;
}

export function InternetSearchPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("general");
  const [category, setCategory] = useState("");
  const [language, setLanguage] = useState("en");
  const [region, setRegion] = useState("global");
  const [maxResults, setMaxResults] = useState(10);
  const [includeImages, setIncludeImages] = useState(false);
  const [includeVideos, setIncludeVideos] = useState(false);
  const [includeNews, setIncludeNews] = useState(false);
  const [includeAcademic, setIncludeAcademic] = useState(false);
  const [timeRange, setTimeRange] = useState("any");
  const [safeSearch, setSafeSearch] = useState("moderate");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<InternetSearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTypes, setSearchTypes] = useState<any[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  useEffect(() => {
    fetchCategories();
    fetchSearchTypes();
    loadSearchHistory();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchSuggestions(searchQuery);
    }
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/ai/internet-search?type=categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSearchTypes = async () => {
    try {
      const response = await fetch('/api/ai/internet-search?type=searchTypes');
      const data = await response.json();
      if (data.success) {
        setSearchTypes(data.searchTypes);
      }
    } catch (error) {
      console.error('Failed to fetch search types:', error);
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/ai/internet-search?type=suggestions&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const loadSearchHistory = () => {
    const history = localStorage.getItem('internetSearchHistory');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  };

  const saveSearchHistory = (query: string) => {
    const newHistory = [query, ...searchHistory.filter(q => q !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('internetSearchHistory', JSON.stringify(newHistory));
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    saveSearchHistory(searchQuery);
    
    try {
      const response = await fetch('/api/ai/internet-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          searchType,
          category: category || undefined,
          language,
          region,
          maxResults,
          includeImages,
          includeVideos,
          includeNews,
          includeAcademic,
          timeRange,
          safeSearch
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
        setSelectedTab("overview");
      } else {
        console.error('Search failed:', data.error);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
  };

  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
  };

  const exportResults = () => {
    if (!searchResults) return;

    const exportData = {
      searchQuery,
      searchResults,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `internet-search-${searchQuery.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareResults = () => {
    if (!searchResults) return;

    const shareData = {
      title: `Search Results for: ${searchQuery}`,
      text: searchResults.overview.summary,
      url: window.location.href
    };

    if (navigator.share) {
      navigator.share(shareData);
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n\n${shareData.text}\n\n${shareData.url}`);
    }
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'High': return 'text-green-600 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getReliabilityIcon = (reliability: string) => {
    switch (reliability) {
      case 'High': return <CheckCircle size={16} />;
      case 'Medium': return <AlertCircle size={16} />;
      case 'Low': return <AlertCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return <Newspaper size={16} />;
      case 'academic': return <BookOpen size={16} />;
      case 'images': return <Image size={16} />;
      case 'videos': return <Video size={16} />;
      case 'encyclopedia': return <BookOpen size={16} />;
      default: return <Globe size={16} />;
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Globe },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'sources', label: 'Sources', icon: ExternalLink },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'data', label: 'Data', icon: TrendingUp },
    { id: 'related', label: 'Related', icon: BookOpen }
  ];

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-heading text-foreground">AI Internet Search</h2>
            <p className="text-muted-foreground mt-1">
              Search and retrieve comprehensive information from the internet using AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 btn-secondary"
            >
              <Filter size={16} />
              Filters
            </button>
            {searchResults && (
              <>
                <button
                  onClick={exportResults}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Download size={16} />
                  Export
                </button>
                <button
                  onClick={shareResults}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search for anything on the internet..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-3 input"
          />
          <button
            onClick={handleSearch}
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSearching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          </button>
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-3 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Recent searches:</p>
            <div className="flex flex-wrap gap-2">
              {searchHistory.slice(0, 5).map((query, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(query)}
                  className="px-3 py-1 text-sm btn-secondary"
                >
                  {query}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-sm btn-secondary"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-muted rounded-lg space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Search Type
                </label>
                <select
                  value={searchType}
                  onChange={(e) => setSearchType(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-600 text-heading text-foreground"
                >
                  {searchTypes.map((type) => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-600 text-heading text-foreground"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Max Results
                </label>
                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-600 text-heading text-foreground"
                >
                  <option value={5}>5 Results</option>
                  <option value={10}>10 Results</option>
                  <option value={20}>20 Results</option>
                  <option value={50}>50 Results</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeImages}
                  onChange={(e) => setIncludeImages(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Images</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeVideos}
                  onChange={(e) => setIncludeVideos(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Videos</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeNews}
                  onChange={(e) => setIncludeNews(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">News</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={includeAcademic}
                  onChange={(e) => setIncludeAcademic(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-600"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300">Academic</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults && (
        <div className="space-y-4">
          {/* Results Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-heading text-foreground">
                Search Results
              </h3>
              <p className="text-sm text-muted-foreground">
                Query: "{searchResults.searchMetadata.query}" • 
                Type: {searchResults.searchMetadata.searchType} • 
                Confidence: {searchResults.searchMetadata.confidence}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className={`flex items-center gap-1 ${
                searchResults.searchMetadata.confidence === 'High' ? 'text-green-600 dark:text-green-400' :
                searchResults.searchMetadata.confidence === 'Medium' ? 'text-yellow-600 dark:text-yellow-400' :
                'text-red-600 dark:text-red-400'
              }`}>
                <CheckCircle size={16} />
                <span className="text-sm font-medium">{searchResults.searchMetadata.confidence}</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    selectedTab === tab.id
                      ? 'bg-white dark:bg-slate-600 text-heading text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="card p-6">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-heading text-foreground mb-3">Overview</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                    {searchResults.overview.summary}
                  </p>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold text-heading text-foreground mb-3">Key Facts</h5>
                  <ul className="space-y-2">
                    {searchResults.overview.keyFacts.map((fact, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <CheckCircle size={16} className="text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300">{fact}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-lg font-semibold text-heading text-foreground mb-3">Current Status</h5>
                    <p className="text-slate-700 dark:text-slate-300">{searchResults.overview.currentStatus}</p>
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-heading text-foreground mb-3">Importance</h5>
                    <p className="text-slate-700 dark:text-slate-300">{searchResults.overview.importance}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'details' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-semibold text-heading text-foreground mb-3">Detailed Information</h4>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">
                    {searchResults.detailedInformation.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-lg font-semibold text-heading text-foreground mb-3">Technical Details</h5>
                    <p className="text-slate-700 dark:text-slate-300">{searchResults.detailedInformation.technicalDetails}</p>
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-heading text-foreground mb-3">Historical Context</h5>
                    <p className="text-slate-700 dark:text-slate-300">{searchResults.detailedInformation.historicalContext}</p>
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-heading text-foreground mb-3">Current Trends</h5>
                    <p className="text-slate-700 dark:text-slate-300">{searchResults.detailedInformation.currentTrends}</p>
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-heading text-foreground mb-3">Future Outlook</h5>
                    <p className="text-slate-700 dark:text-slate-300">{searchResults.detailedInformation.futureOutlook}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'sources' && (
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-heading text-foreground mb-3">Sources & References</h4>
                <div className="space-y-3">
                  {searchResults.sources.map((source, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(source.type)}
                          <h5 className="font-semibold text-heading text-foreground">{source.title}</h5>
                        </div>
                        <div className={`flex items-center gap-1 ${getReliabilityColor(source.reliability)}`}>
                          {getReliabilityIcon(source.reliability)}
                          <span className="text-xs font-medium">{source.reliability}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{source.snippet}</p>
                      <div className="flex items-center justify-between">
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          <ExternalLink size={14} className="inline mr-1" />
                          Visit Source
                        </a>
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {new Date(source.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'news' && (
              <div className="space-y-4">
                <h4 className="text-xl font-semibold text-heading text-foreground mb-3">News & Updates</h4>
                <div className="space-y-3">
                  {searchResults.newsAndUpdates.map((news, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <h5 className="font-semibold text-heading text-foreground">{news.headline}</h5>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          news.relevance === 'High' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          news.relevance === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {news.relevance}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{news.summary}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                          <span>{news.source}</span>
                          <span>{new Date(news.date).toLocaleDateString()}</span>
                        </div>
                        <a
                          href={news.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium"
                        >
                          <ExternalLink size={14} className="inline mr-1" />
                          Read More
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'data' && (
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-heading text-foreground mb-3">Data & Statistics</h4>
                
                <div>
                  <h5 className="text-lg font-semibold text-heading text-foreground mb-3">Key Metrics</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {searchResults.dataAndStatistics.metrics.map((metric, index) => (
                      <div key={index} className="p-4 bg-muted rounded-lg">
                        <div className="text-2xl font-bold text-heading text-foreground">
                          {metric.value} {metric.unit}
                        </div>
                        <div className="text-sm text-muted-foreground">{metric.metric}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                          Source: {metric.source} • {metric.date}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="text-lg font-semibold text-heading text-foreground mb-3">Trends</h5>
                    <p className="text-slate-700 dark:text-slate-300">{searchResults.dataAndStatistics.trends}</p>
                  </div>
                  <div>
                    <h5 className="text-lg font-semibold text-heading text-foreground mb-3">Comparisons</h5>
                    <p className="text-slate-700 dark:text-slate-300">{searchResults.dataAndStatistics.comparisons}</p>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'related' && (
              <div className="space-y-6">
                <h4 className="text-xl font-semibold text-heading text-foreground mb-3">Related Topics</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.relatedTopics.map((topic, index) => (
                    <div key={index} className="p-4 bg-muted rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-heading text-foreground">{topic.topic}</h5>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          topic.relevance === 'High' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                          topic.relevance === 'Medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {topic.relevance}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{topic.description}</p>
                    </div>
                  ))}
                </div>

                <div>
                  <h5 className="text-lg font-semibold text-heading text-foreground mb-3">Practical Applications</h5>
                  <div className="space-y-3">
                    {searchResults.practicalApplications.map((app, index) => (
                      <div key={index} className="p-4 bg-muted rounded-lg">
                        <h6 className="font-semibold text-heading text-foreground mb-2">{app.application}</h6>
                        <p className="text-sm text-muted-foreground mb-3">{app.description}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Benefits:</div>
                            <ul className="text-sm text-muted-foreground">
                              {app.benefits.map((benefit, idx) => (
                                <li key={idx}>• {benefit}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Considerations:</div>
                            <ul className="text-sm text-muted-foreground">
                              {app.considerations.map((consideration, idx) => (
                                <li key={idx}>• {consideration}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Recommendations */}
          {searchResults.recommendations && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                AI Recommendations
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Next Steps:</h5>
                  <ul className="list-disc list-inside text-blue-700 dark:text-blue-300">
                    {searchResults.recommendations.nextSteps.map((step, index) => (
                      <li key={index}>{step}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Additional Searches:</h5>
                  <ul className="list-disc list-inside text-blue-700 dark:text-blue-300">
                    {searchResults.recommendations.additionalSearches.map((search, index) => (
                      <li key={index}>{search}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
