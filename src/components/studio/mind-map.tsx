"use client";

import { useState, useRef, useEffect } from "react";
import { Network, Plus, Minus, RotateCcw, Download, Share2, Save, 
  Edit3, Target, Zap, Sparkles, Eye, Settings, Copy, Trash2,
  Move, Link, Unlink, Search, Filter, Layers, Palette, Type } from "lucide-react";

interface MindMapProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

interface MindMapNode {
  id: string;
  text: string;
  x: number;
  y: number;
  level: number;
  color: string;
  size: number;
  connections: string[];
  metadata: {
    importance: number;
    category: string;
    notes: string;
    tags: string[];
  };
}

interface MindMapConnection {
  id: string;
  from: string;
  to: string;
  strength: number;
  type: "direct" | "indirect" | "causal";
  label?: string;
}

interface MindMapData {
  title: string;
  nodes: MindMapNode[];
  connections: MindMapConnection[];
  metadata: {
    complexity: string;
    categories: string[];
    totalNodes: number;
    totalConnections: number;
  };
}

export function MindMap({ tenderId, interactiveMode = "preview" }: MindMapProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [mindMapData, setMindMapData] = useState<MindMapData | null>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [recentMaps, setRecentMaps] = useState<MindMapData[]>([]);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const nodeColors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", 
    "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6B7280"
  ];

  const categories = [
    "concept", "process", "requirement", "benefit", "challenge", 
    "solution", "stakeholder", "timeline", "resource", "outcome"
  ];

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/ai/mind-map", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tenderId: tenderId || "tender_default",
          interactiveMode
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setMindMapData(data.mindMapData);
        // Add to recent maps
        setRecentMaps(prev => [data.mindMapData, ...prev.slice(0, 4)]);
      }
    } catch (error) {
      console.error("Error generating mind map:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
  };

  const handleNodeDrag = (nodeId: string, e: React.MouseEvent) => {
    if (interactiveMode === "edit" || interactiveMode === "collaborate") {
      setDraggedNode(nodeId);
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && draggedNode && mindMapData) {
      const deltaX = (e.clientX - dragStart.x) / zoom;
      const deltaY = (e.clientY - dragStart.y) / zoom;
      
      setMindMapData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          nodes: prev.nodes.map(node => 
            node.id === draggedNode 
              ? { ...node, x: node.x + deltaX, y: node.y + deltaY }
              : node
          )
        };
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDraggedNode(null);
  };

  const handleZoom = (delta: number) => {
    setZoom(prev => Math.max(0.1, Math.min(3, prev + delta)));
  };

  const handlePan = (deltaX: number, deltaY: number) => {
    setPan(prev => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY
    }));
  };

  const addNode = (parentId?: string) => {
    if (!mindMapData) return;
    
    const newNode: MindMapNode = {
      id: `node_${Date.now()}`,
      text: "New Node",
      x: Math.random() * 400 - 200,
      y: Math.random() * 400 - 200,
      level: parentId ? 
        (mindMapData.nodes.find(n => n.id === parentId)?.level || 0) + 1 : 0,
      color: nodeColors[Math.floor(Math.random() * nodeColors.length)],
      size: 1,
      connections: parentId ? [parentId] : [],
      metadata: {
        importance: 0.5,
        category: "concept",
        notes: "",
        tags: []
      }
    };

    setMindMapData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: [...prev.nodes, newNode],
        metadata: {
          ...prev.metadata,
          totalNodes: prev.metadata.totalNodes + 1
        }
      };
    });
  };

  const deleteNode = (nodeId: string) => {
    if (!mindMapData) return;
    
    setMindMapData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        nodes: prev.nodes.filter(node => node.id !== nodeId),
        connections: prev.connections.filter(conn => 
          conn.from !== nodeId && conn.to !== nodeId
        ),
        metadata: {
          ...prev.metadata,
          totalNodes: prev.metadata.totalNodes - 1
        }
      };
    });
  };

  const toggleFavorite = (nodeId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(nodeId)) {
      newFavorites.delete(nodeId);
    } else {
      newFavorites.add(nodeId);
    }
    setFavorites(newFavorites);
  };

  const downloadMap = () => {
    if (!mindMapData) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = `mind-map-${Date.now()}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const exportMap = () => {
    if (!mindMapData) return;
    
    const data = {
      title: mindMapData.title,
      nodes: mindMapData.nodes,
      connections: mindMapData.connections,
      metadata: mindMapData.metadata,
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mind-map-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredNodes = mindMapData?.nodes.filter(node => {
    const matchesCategory = filterCategory === "all" || node.metadata.category === filterCategory;
    const matchesSearch = searchTerm === "" || 
      node.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      node.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  }) || [];

  const selectedNodeData = mindMapData?.nodes.find(node => node.id === selectedNode);

  // Draw the mind map
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !mindMapData) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up coordinate system
    ctx.save();
    ctx.translate(pan.x, pan.y);
    ctx.scale(zoom, zoom);

    // Draw connections
    mindMapData.connections.forEach(conn => {
      const fromNode = mindMapData.nodes.find(n => n.id === conn.from);
      const toNode = mindMapData.nodes.find(n => n.id === conn.to);
      
      if (fromNode && toNode) {
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.strokeStyle = `rgba(59, 130, 246, ${conn.strength})`;
        ctx.lineWidth = 2;
        ctx.stroke();
        
        if (conn.label) {
          ctx.fillStyle = "#6B7280";
          ctx.font = "12px Arial";
          ctx.fillText(conn.label, (fromNode.x + toNode.x) / 2, (fromNode.y + toNode.y) / 2);
        }
      }
    });

    // Draw nodes
    filteredNodes.forEach(node => {
      const isSelected = selectedNode === node.id;
      const isFavorite = favorites.has(node.id);
      
      // Node circle
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.size * 20, 0, 2 * Math.PI);
      ctx.fillStyle = isSelected ? "#FEF3C7" : node.color;
      ctx.fill();
      ctx.strokeStyle = isSelected ? "#F59E0B" : "#374151";
      ctx.lineWidth = isSelected ? 3 : 2;
      ctx.stroke();
      
      // Node text
      ctx.fillStyle = "#1F2937";
      ctx.font = `${node.size * 14}px Arial`;
      ctx.textAlign = "center";
      ctx.fillText(node.text, node.x, node.y + 5);
      
      // Favorite indicator
      if (isFavorite) {
        ctx.fillStyle = "#F59E0B";
        ctx.beginPath();
        ctx.arc(node.x + 15, node.y - 15, 5, 0, 2 * Math.PI);
        ctx.fill();
      }
    });

    ctx.restore();
  }, [mindMapData, selectedNode, zoom, pan, filterCategory, searchTerm, favorites]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Network className="text-purple-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Mind Map</h3>
            <p className="text-sm text-gray-600">Visualize connections and relationships</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            title="Advanced Settings"
          >
            <Settings size={16} />
          </button>
          {mindMapData && (
            <>
              <button 
                onClick={downloadMap}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Download Image"
              >
                <Download size={16} />
              </button>
              <button 
                onClick={exportMap}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                title="Export Data"
              >
                <Save size={16} />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Search and Filter */}
      {mindMapData && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search nodes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Advanced Settings */}
      {showAdvanced && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Advanced Settings</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Zoom Level</label>
              <div className="flex items-center gap-2">
                <button onClick={() => handleZoom(-0.1)} className="p-1 text-gray-600 hover:text-gray-800">
                  <Minus size={16} />
                </button>
                <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
                <button onClick={() => handleZoom(0.1)} className="p-1 text-gray-600 hover:text-gray-800">
                  <Plus size={16} />
                </button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Reset View</label>
              <button 
                onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}
                className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-300 rounded text-sm hover:bg-gray-50"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Generate Button */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full py-4 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium transition-all duration-200 hover:scale-[1.02] shadow-lg"
      >
        {isGenerating ? (
          <>
            <RotateCcw className="animate-spin" size={20} />
            Generating Mind Map...
          </>
        ) : (
          <>
            <Network size={20} />
            Generate Mind Map
          </>
        )}
      </button>

      {/* Mind Map Content */}
      {mindMapData ? (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6">
            <h4 className="font-bold text-xl mb-2">{mindMapData.title}</h4>
            <div className="flex items-center gap-4 text-sm opacity-90">
              <span>{mindMapData.metadata.totalNodes} Nodes</span>
              <span>•</span>
              <span>{mindMapData.metadata.totalConnections} Connections</span>
              <span>•</span>
              <span>Complexity: {mindMapData.metadata.complexity}</span>
            </div>
            <div className="flex items-center gap-2 mt-2">
              {mindMapData.metadata.categories.map(category => (
                <div key={category} className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs">
                  {category}
                </div>
              ))}
            </div>
          </div>

          {/* Mind Map Canvas */}
          <div 
            ref={containerRef}
            className="relative bg-gray-50 min-h-[500px] overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              width={800}
              height={500}
              className="cursor-move"
              style={{ transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)` }}
            />
            
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <button 
                onClick={() => handleZoom(0.1)}
                className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
              >
                <Plus size={16} />
              </button>
              <button 
                onClick={() => handleZoom(-0.1)}
                className="p-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50"
              >
                <Minus size={16} />
              </button>
            </div>

            {/* Add Node Button */}
            {(interactiveMode === "edit" || interactiveMode === "collaborate") && (
              <button
                onClick={() => addNode()}
                className="absolute bottom-4 right-4 p-3 bg-purple-600 text-white rounded-full shadow-lg hover:bg-purple-700 transition-colors"
              >
                <Plus size={20} />
              </button>
            )}
          </div>

          {/* Node Details Panel */}
          {selectedNodeData && (
            <div className="border-t border-gray-200 p-6">
              <h5 className="font-semibold text-gray-900 mb-4">Node Details</h5>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Text</label>
                  <input
                    type="text"
                    value={selectedNodeData.text}
                    onChange={(e) => {
                      setMindMapData(prev => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          nodes: prev.nodes.map(node => 
                            node.id === selectedNode 
                              ? { ...node, text: e.target.value }
                              : node
                          )
                        };
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={selectedNodeData.metadata.category}
                    onChange={(e) => {
                      setMindMapData(prev => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          nodes: prev.nodes.map(node => 
                            node.id === selectedNode 
                              ? { ...node, metadata: { ...node.metadata, category: e.target.value } }
                              : node
                          )
                        };
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={selectedNodeData.metadata.notes}
                    onChange={(e) => {
                      setMindMapData(prev => {
                        if (!prev) return prev;
                        return {
                          ...prev,
                          nodes: prev.nodes.map(node => 
                            node.id === selectedNode 
                              ? { ...node, metadata: { ...node.metadata, notes: e.target.value } }
                              : node
                          )
                        };
                      });
                    }}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
              
              <div className="flex items-center gap-2 mt-4">
                <button
                  onClick={() => toggleFavorite(selectedNode)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                    favorites.has(selectedNode)
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-gray-100 text-gray-700 hover:bg-yellow-100 hover:text-yellow-700"
                  }`}
                >
                  <Target size={16} />
                  {favorites.has(selectedNode) ? "Favorited" : "Add to Favorites"}
                </button>
                {(interactiveMode === "edit" || interactiveMode === "collaborate") && (
                  <button
                    onClick={() => deleteNode(selectedNode)}
                    className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 size={16} />
                    Delete Node
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="bg-gray-50 border-t border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {filteredNodes.length} of {mindMapData.metadata.totalNodes} nodes visible
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">
                  <Share2 size={16} />
                  Share
                </button>
                <button 
                  onClick={exportMap}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : !isGenerating && (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <div className="w-16 h-16 bg-gray-200 rounded-lg mx-auto mb-4 flex items-center justify-center">
            <Network size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No mind map generated yet</h3>
          <p className="text-gray-600 mb-4">Click Generate to create an interactive mind map</p>
        </div>
      )}

      {/* Recent Maps */}
      {recentMaps.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Maps</h4>
          <div className="space-y-2">
            {recentMaps.map((map, index) => (
              <button
                key={index}
                onClick={() => setMindMapData(map)}
                className="w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="font-medium text-gray-900 text-sm">{map.title}</h5>
                    <p className="text-xs text-gray-600">{map.metadata.totalNodes} nodes • {map.metadata.complexity}</p>
                  </div>
                  <div className="text-xs text-gray-500">{map.metadata.categories[0]}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
