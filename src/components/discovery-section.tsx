"use client";

import { useState, useEffect } from "react";
import { 
  Plus, Link, Youtube, Globe, FileText, ExternalLink, 
  Trash2, Edit3, Save, X, Play, Eye, CheckCircle,
  AlertCircle, Clock, Star, Tag, Search, Filter
} from "lucide-react";

type DiscoveryLink = {
  id: string;
  title: string;
  url: string;
  type: "website" | "youtube" | "document" | "article" | "other";
  description?: string;
  tags?: string[];
  verified?: boolean;
  addedAt: string;
  lastAccessed?: string;
  accessCount?: number;
};

type DiscoverySectionProps = {
  tenderId?: string;
};

export function DiscoverySection({ tenderId }: DiscoverySectionProps) {
  const [links, setLinks] = useState<DiscoveryLink[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLink, setEditingLink] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [newLink, setNewLink] = useState({
    title: "",
    url: "",
    type: "website" as const,
    description: "",
    tags: "",
    verified: false
  });

  useEffect(() => {
    fetchLinks();
  }, [tenderId]);

  const fetchLinks = async () => {
    try {
      const response = await fetch(`/api/discovery-links?tenderId=${tenderId || 'global'}`);
      const data = await response.json();
      setLinks(data.links || []);
    } catch (error) {
      console.error("Failed to fetch discovery links:", error);
    }
  };

  const addLink = async () => {
    if (!newLink.title || !newLink.url) return;

    try {
      const response = await fetch("/api/discovery-links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: tenderId || 'global',
          ...newLink,
          tags: newLink.tags.split(',').map(t => t.trim()).filter(Boolean)
        })
      });

      if (response.ok) {
        await fetchLinks();
        setNewLink({ title: "", url: "", type: "website", description: "", tags: "", verified: false });
        setShowAddForm(false);
      }
    } catch (error) {
      console.error("Failed to add link:", error);
    }
  };

  const updateLink = async (linkId: string, updates: Partial<DiscoveryLink>) => {
    try {
      const response = await fetch(`/api/discovery-links/${linkId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });

      if (response.ok) {
        await fetchLinks();
        setEditingLink(null);
      }
    } catch (error) {
      console.error("Failed to update link:", error);
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!confirm("Are you sure you want to delete this link?")) return;

    try {
      const response = await fetch(`/api/discovery-links/${linkId}`, {
        method: "DELETE"
      });

      if (response.ok) {
        await fetchLinks();
      }
    } catch (error) {
      console.error("Failed to delete link:", error);
    }
  };

  const trackAccess = async (linkId: string) => {
    try {
      await fetch(`/api/discovery-links/${linkId}/access`, {
        method: "POST"
      });
      await fetchLinks();
    } catch (error) {
      console.error("Failed to track access:", error);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "youtube": return <Youtube size={16} className="text-red-500" />;
      case "website": return <Globe size={16} className="text-blue-500" />;
      case "document": return <FileText size={16} className="text-green-500" />;
      case "article": return <FileText size={16} className="text-purple-500" />;
      default: return <Link size={16} className="text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "youtube": return "bg-red-50 text-red-700 border-red-200";
      case "website": return "bg-blue-50 text-blue-700 border-blue-200";
      case "document": return "bg-green-50 text-green-700 border-green-200";
      case "article": return "bg-purple-50 text-purple-700 border-purple-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const filteredLinks = links.filter(link => {
    const matchesSearch = link.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         link.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === "all" || link.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const linkTypes = [...new Set(links.map(link => link.type))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Link size={16} className="text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Discovery</h3>
            <p className="text-sm text-gray-600">External resources and verified sources</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          <Plus size={16} />
          Add Link
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search links..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          <option value="all">All Types</option>
          {linkTypes.map(type => (
            <option key={type} value={type}>
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Add Link Form */}
      {showAddForm && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-semibold text-gray-900">Add New Link</h4>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter link title"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="url"
                value={newLink.url}
                onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="https://example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={newLink.type}
                onChange={(e) => setNewLink({ ...newLink, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="website">Website</option>
                <option value="youtube">YouTube Video</option>
                <option value="document">Document</option>
                <option value="article">Article</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                value={newLink.tags}
                onChange={(e) => setNewLink({ ...newLink, tags: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="tag1, tag2, tag3"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={newLink.description}
              onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              rows={3}
              placeholder="Brief description of the link content"
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newLink.verified}
                onChange={(e) => setNewLink({ ...newLink, verified: e.target.checked })}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Verified source</span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              onClick={addLink}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200"
            >
              <Save size={16} />
              Add Link
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      <div className="space-y-3">
        {filteredLinks.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
              <Link size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {links.length === 0 ? "No discovery links yet" : "No links match your search"}
            </h3>
            <p className="text-gray-600 mb-4">
              Add websites, YouTube videos, and verified information sources to enhance your research
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 mx-auto"
            >
              <Plus size={16} />
              Add First Link
            </button>
          </div>
        ) : (
          filteredLinks.map((link) => (
            <div
              key={link.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {getTypeIcon(link.type)}
                    <h4 className="text-lg font-semibold text-gray-900 truncate">
                      {link.title}
                    </h4>
                    {link.verified && (
                      <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        <CheckCircle size={12} />
                        Verified
                      </div>
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor(link.type)}`}>
                      {link.type}
                    </span>
                  </div>
                  
                  {link.description && (
                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                      {link.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Added {new Date(link.addedAt).toLocaleDateString()}
                    </span>
                    {link.accessCount && link.accessCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye size={12} />
                        {link.accessCount} views
                      </span>
                    )}
                    {link.lastAccessed && (
                      <span className="flex items-center gap-1">
                        <ExternalLink size={12} />
                        Last accessed {new Date(link.lastAccessed).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {link.tags && link.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {link.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackAccess(link.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Open link"
                  >
                    <ExternalLink size={16} />
                  </a>
                  <button
                    onClick={() => setEditingLink(link.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    title="Edit link"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => deleteLink(link.id)}
                    className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete link"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      {links.length > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">{links.length}</div>
              <div className="text-sm text-gray-600">Total Links</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {links.filter(l => l.type === 'youtube').length}
              </div>
              <div className="text-sm text-gray-600">YouTube Videos</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {links.filter(l => l.type === 'website').length}
              </div>
              <div className="text-sm text-gray-600">Websites</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {links.filter(l => l.verified).length}
              </div>
              <div className="text-sm text-gray-600">Verified</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
