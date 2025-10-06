"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Download, ExternalLink, Star, Clock, DollarSign, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

interface ProductSpecification {
  [key: string]: string | number | boolean;
}

interface ProductPricing {
  currency: string;
  minPrice: number;
  maxPrice: number;
  unit: string;
}

interface ProductAvailability {
  inStock: boolean;
  suppliers: string[];
  leadTime: string;
}

interface ProductTechnicalDetails {
  dimensions?: string;
  weight?: string;
  power?: string;
  certifications?: string[];
}

interface ProductMarketAnalysis {
  competitors?: string[];
  marketShare?: string;
  trends?: string;
}

interface ProductSupplierInfo {
  contact?: string;
  website?: string;
  location?: string;
}

interface ProductCompliance {
  standards?: string[];
  certifications?: string[];
}

interface ProductImplementation {
  requirements?: string;
  compatibility?: string;
  support?: string;
}

interface WebSource {
  title: string;
  url: string;
  snippet: string;
  relevanceScore: number;
}

interface Product {
  name: string;
  brand: string;
  category: string;
  specifications: ProductSpecification;
  pricing: ProductPricing;
  availability: ProductAvailability;
  technicalDetails: ProductTechnicalDetails;
  marketAnalysis: ProductMarketAnalysis;
  supplierInfo: ProductSupplierInfo;
  compliance: ProductCompliance;
  implementation: ProductImplementation;
  relevanceScore: number;
  confidenceLevel: "High" | "Medium" | "Low";
  lastUpdated: string;
  webSources?: WebSource[];
  lastWebSearch?: string;
}

interface SearchMetadata {
  query: string;
  totalResults: number;
  searchTime: string;
  sources: string[];
  lastUpdated: string;
  webEnhanced?: boolean;
  lastWebSearch?: string;
}

interface Recommendations {
  bestMatch: string;
  alternatives: string[];
  considerations: string[];
}

interface ProductSearchResult {
  products: Product[];
  searchMetadata: SearchMetadata;
  recommendations: Recommendations;
}

export function ProductSearchPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("");
  const [specifications, setSpecifications] = useState("");
  const [maxResults, setMaxResults] = useState(10);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductSearchResult | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchSuggestions(searchQuery);
    }
  }, [searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/ai/product-search?type=categories');
      const data = await response.json();
      if (data.success) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  };

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(`/api/ai/product-search?type=suggestions&q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (data.success) {
        setSuggestions(data.suggestions);
      }
    } catch (error) {
      console.error('Failed to fetch suggestions:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    try {
      const response = await fetch('/api/ai/product-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: searchQuery,
          category: category || undefined,
          specifications: specifications || undefined,
          maxResults: maxResults
        }),
      });

      const data = await response.json();
      if (data.success) {
        setSearchResults(data.data);
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
    a.download = `product-search-${searchQuery.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case 'High': return 'text-green-600 dark:text-green-400';
      case 'Medium': return 'text-yellow-600 dark:text-yellow-400';
      case 'Low': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case 'High': return <CheckCircle size={16} />;
      case 'Medium': return <AlertCircle size={16} />;
      case 'Low': return <AlertCircle size={16} />;
      default: return <AlertCircle size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-heading text-foreground">AI Product Search</h2>
            <p className="text-muted-foreground mt-1">
              Search and retrieve comprehensive product information using AI
            </p>
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 btn-secondary"
          >
            <Filter size={16} />
            Filters
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search for products, specifications, suppliers..."
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

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <div className="mt-2 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-3 py-1 text-sm bg-white dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-full border border-slate-200 dark:border-slate-500 hover:bg-slate-100 dark:hover:bg-slate-500 transition-colors"
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
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Specifications
                </label>
                <input
                  type="text"
                  placeholder="e.g., voltage, capacity, size"
                  value={specifications}
                  onChange={(e) => setSpecifications(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-slate-600 text-heading text-foreground placeholder-slate-500 dark:placeholder-slate-400"
                />
              </div>
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
                Search Results ({searchResults.searchMetadata.totalResults})
              </h3>
              <p className="text-sm text-muted-foreground">
                Query: "{searchResults.searchMetadata.query}" • 
                Search time: {searchResults.searchMetadata.searchTime}
              </p>
            </div>
            <button
              onClick={exportResults}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download size={16} />
              Export Results
            </button>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {searchResults.products.map((product, index) => (
              <div
                key={index}
                className="card p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                {/* Product Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-heading text-foreground mb-1">
                      {product.name}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {product.brand} • {product.category}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`flex items-center gap-1 ${getConfidenceColor(product.confidenceLevel)}`}>
                      {getConfidenceIcon(product.confidenceLevel)}
                      <span className="text-xs font-medium">{product.confidenceLevel}</span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Star size={14} />
                      <span className="text-xs">{(product.relevanceScore * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                {/* Key Information */}
                <div className="space-y-3">
                  {/* Pricing */}
                  {product.pricing && (
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-green-600 dark:text-green-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {product.pricing.minPrice > 0 
                          ? `${product.pricing.currency} ${product.pricing.minPrice} - ${product.pricing.maxPrice} ${product.pricing.unit}`
                          : 'Contact for pricing'
                        }
                      </span>
                    </div>
                  )}

                  {/* Availability */}
                  {product.availability && (
                    <div className="flex items-center gap-2">
                      <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {product.availability.inStock ? 'In Stock' : 'Out of Stock'} • 
                        Lead time: {product.availability.leadTime}
                      </span>
                    </div>
                  )}

                  {/* Suppliers */}
                  {product.availability.suppliers && product.availability.suppliers.length > 0 && (
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-medium">Suppliers:</span> {product.availability.suppliers.slice(0, 3).join(', ')}
                      {product.availability.suppliers.length > 3 && ` +${product.availability.suppliers.length - 3} more`}
                    </div>
                  )}

                  {/* Web Sources */}
                  {product.webSources && product.webSources.length > 0 && (
                    <div className="flex items-center gap-2">
                      <ExternalLink size={16} className="text-purple-600 dark:text-purple-400" />
                      <span className="text-sm text-slate-700 dark:text-slate-300">
                        {product.webSources.length} web sources available
                      </span>
                    </div>
                  )}
                </div>

                {/* View Details Button */}
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-600">
                  <button className="w-full text-center text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                    View Full Details →
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Recommendations */}
          {searchResults.recommendations && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6">
              <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3">
                AI Recommendations
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-blue-800 dark:text-blue-200">Best Match:</span>
                  <p className="text-blue-700 dark:text-blue-300">{searchResults.recommendations.bestMatch}</p>
                </div>
                {searchResults.recommendations.alternatives && searchResults.recommendations.alternatives.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Alternatives:</span>
                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-300">
                      {searchResults.recommendations.alternatives.map((alt, index) => (
                        <li key={index}>{alt}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {searchResults.recommendations.considerations && searchResults.recommendations.considerations.length > 0 && (
                  <div>
                    <span className="font-medium text-blue-800 dark:text-blue-200">Considerations:</span>
                    <ul className="list-disc list-inside text-blue-700 dark:text-blue-300">
                      {searchResults.recommendations.considerations.map((consideration, index) => (
                        <li key={index}>{consideration}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-heading text-foreground">
                  {selectedProduct.name}
                </h3>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Basic Info */}
                  <div>
                    <h4 className="text-lg font-semibold text-heading text-foreground mb-3">Basic Information</h4>
                    <div className="space-y-2">
                      <div><span className="font-medium">Brand:</span> {selectedProduct.brand}</div>
                      <div><span className="font-medium">Category:</span> {selectedProduct.category}</div>
                      <div><span className="font-medium">Confidence:</span> 
                        <span className={`ml-2 ${getConfidenceColor(selectedProduct.confidenceLevel)}`}>
                          {selectedProduct.confidenceLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Specifications */}
                  {selectedProduct.specifications && Object.keys(selectedProduct.specifications).length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-heading text-foreground mb-3">Specifications</h4>
                      <div className="space-y-2">
                        {Object.entries(selectedProduct.specifications).map(([key, value]) => (
                          <div key={key}>
                            <span className="font-medium">{key}:</span> {String(value)}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Technical Details */}
                  {selectedProduct.technicalDetails && (
                    <div>
                      <h4 className="text-lg font-semibold text-heading text-foreground mb-3">Technical Details</h4>
                      <div className="space-y-2">
                        {selectedProduct.technicalDetails.dimensions && (
                          <div><span className="font-medium">Dimensions:</span> {selectedProduct.technicalDetails.dimensions}</div>
                        )}
                        {selectedProduct.technicalDetails.weight && (
                          <div><span className="font-medium">Weight:</span> {selectedProduct.technicalDetails.weight}</div>
                        )}
                        {selectedProduct.technicalDetails.power && (
                          <div><span className="font-medium">Power:</span> {selectedProduct.technicalDetails.power}</div>
                        )}
                        {selectedProduct.technicalDetails.certifications && (
                          <div>
                            <span className="font-medium">Certifications:</span>
                            <ul className="list-disc list-inside ml-4">
                              {selectedProduct.technicalDetails.certifications.map((cert, index) => (
                                <li key={index}>{cert}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Pricing */}
                  {selectedProduct.pricing && (
                    <div>
                      <h4 className="text-lg font-semibold text-heading text-foreground mb-3">Pricing</h4>
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          {selectedProduct.pricing.minPrice > 0 
                            ? `${selectedProduct.pricing.currency} ${selectedProduct.pricing.minPrice} - ${selectedProduct.pricing.maxPrice}`
                            : 'Contact for pricing'
                          }
                        </div>
                        <div className="text-sm text-green-700 dark:text-green-300">
                          {selectedProduct.pricing.unit}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Availability */}
                  {selectedProduct.availability && (
                    <div>
                      <h4 className="text-lg font-semibold text-heading text-foreground mb-3">Availability</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${selectedProduct.availability.inStock ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span>{selectedProduct.availability.inStock ? 'In Stock' : 'Out of Stock'}</span>
                        </div>
                        <div><span className="font-medium">Lead Time:</span> {selectedProduct.availability.leadTime}</div>
                        {selectedProduct.availability.suppliers && (
                          <div>
                            <span className="font-medium">Suppliers:</span>
                            <ul className="list-disc list-inside ml-4">
                              {selectedProduct.availability.suppliers.map((supplier, index) => (
                                <li key={index}>{supplier}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Web Sources */}
                  {selectedProduct.webSources && selectedProduct.webSources.length > 0 && (
                    <div>
                      <h4 className="text-lg font-semibold text-heading text-foreground mb-3">Web Sources</h4>
                      <div className="space-y-2">
                        {selectedProduct.webSources.map((source, index) => (
                          <a
                            key={index}
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block p-3 bg-muted rounded-lg hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                          >
                            <div className="font-medium text-heading text-foreground">{source.title}</div>
                            <div className="text-sm text-muted-foreground">{source.snippet}</div>
                            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">{source.url}</div>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
