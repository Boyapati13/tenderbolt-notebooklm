'use client';

import { useState, useCallback } from 'react';
import { Search, Loader2, X, ShoppingCart, Info, ExternalLink, Settings } from 'lucide-react';

// Simplified product structure, matching Algolia's response format
interface Product {
  objectID: string;
  name: string;
  brand?: string;
  description?: string;
  price?: number;
  currency?: string;
  imageUrl?: string;
  url?: string;
}

// Main Product Search Panel Component
export function ProductSearchPanel() {
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [configError, setConfigError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setProducts([]);
      setError(null);
      setConfigError(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setConfigError(null);

    try {
      const response = await fetch('/api/ai/product-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery, hitsPerPage: 20 }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for specific configuration error from the backend
        if (data.error === 'Search Service Not Configured') {
          throw new Error('CONFIG_ERROR::' + data.message);
        }
        throw new Error(data.message || 'Failed to fetch products');
      }

      setProducts(data.products || []);

    } catch (e: any) {
      if (e.message?.startsWith('CONFIG_ERROR::')) {
        setConfigError(e.message.replace('CONFIG_ERROR::', ''));
      } else {
        setError(e.message || "An unexpected error occurred.");
      }
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="h-full flex flex-col p-4 bg-slate-900 text-white">
      <Header />
      <SearchInput 
        query={query} 
        setQuery={setQuery} 
        onSearch={handleSearch} 
        isLoading={isLoading} 
        isDisabled={!!configError}
      />
      <ResultsArea 
        isLoading={isLoading}
        error={error}
        configError={configError}
        products={products}
        onProductSelect={setSelectedProduct}
      />
      {selectedProduct && 
        <ProductDetailModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
        />
      }
    </div>
  );
}

const Header = () => (
  <div className="mb-4">
    <h2 className="text-xl font-bold text-white flex items-center gap-2">
      <ShoppingCart size={20} />
      Algolia Product Search
    </h2>
    <p className="text-sm text-slate-400">Powered by a dedicated, high-speed search index.</p>
  </div>
);

const SearchInput = ({ query, setQuery, onSearch, isLoading, isDisabled }: any) => (
  <div className="relative mb-4">
    <input
      type="text"
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        if (!isDisabled) onSearch(e.target.value);
      }}
      placeholder={isDisabled ? "Search is disabled" : "Search for products..."}
      className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={isDisabled}
    />
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
    {isLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 animate-spin" size={18} />}
  </div>
);

const ResultsArea = ({ isLoading, error, configError, products, onProductSelect }: any) => {
  if (configError) {
    return <ConfigErrorState message={configError} />;
  }
  if (isLoading && products.length === 0) {
    return <LoadingState />;
  }
  if (error) {
    return <ErrorState message={error} />;
  }
  if (products.length === 0) {
    return <InitialState />;
  }
  return (
    <div className="flex-1 overflow-auto pr-2 -mr-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product: Product) => (
          <ProductCard key={product.objectID} product={product} onSelect={onProductSelect} />
        ))}
      </div>
    </div>
  );
};

const ProductCard = ({ product, onSelect }: { product: Product, onSelect: (p: Product) => void }) => (
  <div 
    className="bg-slate-800/80 p-4 rounded-lg border border-slate-700 hover:border-blue-500 transition-all cursor-pointer flex flex-col justify-between"
    onClick={() => onSelect(product)}
  >
    <div>
      {product.imageUrl && 
        <img src={product.imageUrl} alt={product.name} className="w-full h-32 object-cover rounded-md mb-3" />
      }
      <h3 className="font-bold text-base text-white truncate">{product.name}</h3>
      {product.brand && <p className="text-sm text-slate-400">{product.brand}</p>}
    </div>
    <div className="mt-3">
      {product.price != null && 
        <p className="text-lg font-semibold text-blue-400">{product.currency || '$'}{product.price.toFixed(2)}</p>
      }
      <span className="text-sm text-blue-400 hover:underline mt-1 w-full text-left">View Details</span>
    </div>
  </div>
);

const ProductDetailModal = ({ product, onClose }: { product: Product, onClose: () => void }) => (
  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
    <div 
      className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 border border-slate-700 shadow-2xl relative animate-fade-in-up"
      onClick={(e) => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white transition-colors rounded-full">
        <X size={20} />
      </button>
      <div className="flex flex-col sm:flex-row gap-6">
        {product.imageUrl && 
          <img src={product.imageUrl} alt={product.name} className="w-full sm:w-1/3 h-auto object-cover rounded-lg" />
        }
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white mb-1">{product.name}</h2>
          {product.brand && <p className="text-lg text-slate-400 mb-4">by {product.brand}</p>}
          {product.description && <p className="text-slate-300 mb-4">{product.description}</p>}
          {product.price != null && <p className="text-3xl font-bold text-blue-400 mb-4">{product.currency || '$'}{product.price.toFixed(2)}</p>}
          {product.url && 
            <a href={product.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <ExternalLink size={16} />
              View on Website
            </a>
          }
        </div>
      </div>
    </div>
  </div>
);

const LoadingState = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500">
    <Loader2 size={32} className="animate-spin mb-4" />
    <p>Searching for products...</p>
  </div>
);

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-full text-red-400 text-center p-4">
    <Info size={32} className="mb-4"/>
    <p className="font-bold">Search Error</p>
    <p className="text-sm text-red-300/80">{message}</p>
  </div>
);

const ConfigErrorState = ({ message }: { message: string }) => (
    <div className="flex flex-col items-center justify-center h-full text-yellow-400 text-center p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/50">
        <Settings size={32} className="mb-4"/>
        <p className="font-bold text-lg">Search Service Not Configured</p>
        <p className="text-sm text-yellow-300/80 mb-4 max-w-lg">{message}</p>
        <div className="text-left bg-slate-900/50 p-3 rounded-md text-xs text-slate-300">
            <p className="font-bold mb-1">Action Required:</p>
            <p>To enable product search, an administrator must add the following keys to the project's environment variables (`.env.local`):</p>
            <code className="block bg-slate-900 p-2 rounded-md mt-2 text-slate-200">
                ALGOLIA_APP_ID=YOUR_APP_ID<br/>
                ALGOLIA_SEARCH_ONLY_API_KEY=YOUR_SEARCH_ONLY_KEY<br/>
                ALGOLIA_INDEX_NAME=YOUR_INDEX_NAME
            </code>
        </div>
    </div>
);

const InitialState = () => (
  <div className="flex flex-col items-center justify-center h-full text-slate-500 text-center">
    <ShoppingCart size={40} className="mb-4"/>
    <p className="font-bold text-lg">Product Search</p>
    <p className="text-sm">Type in the search bar to find products instantly.</p>
  </div>
);
