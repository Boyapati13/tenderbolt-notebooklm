"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { 
  Network, Plus, Trash2, Edit3, Save, X, Download, Upload, Settings, 
  Share2, Copy, RotateCcw, ZoomIn, ZoomOut, Maximize2, Minimize2,
  Eye, EyeOff, Layers, Target, Zap, Sparkles, BarChart3, Users,
  RefreshCw, Play, Pause, SkipForward, SkipBack, Volume2, VolumeX,
  Star, Heart, Bookmark, Filter, Search, MoreHorizontal, ChevronDown,
  ChevronRight, ChevronUp, ChevronLeft, Move, Lock, Unlock, Link,
  Unlink, Palette, Type, Image, FileText, Calendar, Clock, AlertCircle
} from "lucide-react";

interface MindMapProps {
  tenderId?: string;
  interactiveMode?: "preview" | "edit" | "present" | "collaborate";
}

type NodeType = "requirement" | "compliance" | "risk" | "deadline" | "general" | "milestone" | "resource" | "stakeholder";

interface Node {
  id: string;
  label: string;
  type: NodeType;
  x: number;
  y: number;
  connections: string[];
  metadata: {
    description?: string;
    priority?: "low" | "medium" | "high" | "critical";
    status?: "pending" | "in-progress" | "completed" | "blocked";
    assignee?: string;
    dueDate?: string;
    tags?: string[];
    notes?: string;
  };
  style: {
    size: "small" | "medium" | "large";
    color: string;
    shape: "circle" | "rectangle" | "diamond" | "hexagon";
  };
}

interface Connection {
  id: string;
  from: string;
  to: string;
  type: "dependency" | "relationship" | "flow" | "timeline";
  label?: string;
  strength: "weak" | "medium" | "strong";
  style: {
    color: string;
    thickness: number;
    dashPattern?: number[];
  };
}

interface MindMapData {
  nodes: Node[];
  connections: Connection[];
  metadata: {
    title: string;
    description: string;
    version: string;
    lastModified: string;
    author: string;
  };
}

const nodeTypeConfig = {
  requirement: { 
    color: "bg-blue-100 border-blue-300 text-blue-800", 
    icon: FileText, 
    label: "Requirement" 
  },
  compliance: { 
    color: "bg-green-100 border-green-300 text-green-800", 
    icon: Target, 
    label: "Compliance" 
  },
  risk: { 
    color: "bg-red-100 border-red-300 text-red-800", 
    icon: AlertCircle, 
    label: "Risk" 
  },
  deadline: { 
    color: "bg-orange-100 border-orange-300 text-orange-800", 
    icon: Calendar, 
    label: "Deadline" 
  },
  milestone: { 
    color: "bg-purple-100 border-purple-300 text-purple-800", 
    icon: Target, 
    label: "Milestone" 
  },
  resource: { 
    color: "bg-yellow-100 border-yellow-300 text-yellow-800", 
    icon: Users, 
    label: "Resource" 
  },
  stakeholder: { 
    color: "bg-indigo-100 border-indigo-300 text-indigo-800", 
    icon: Users, 
    label: "Stakeholder" 
  },
  general: { 
    color: "bg-muted border-border text-muted-foreground", 
    icon: Network, 
    label: "General" 
  },
};

const priorityColors = {
  low: "text-green-600",
  medium: "text-yellow-600", 
  high: "text-orange-600",
  critical: "text-red-600"
};

const statusColors = {
  pending: "bg-muted text-muted-foreground",
  "in-progress": "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800"
};

export function MindMap({ tenderId, interactiveMode = "preview" }: MindMapProps) {
  const [mindMapData, setMindMapData] = useState<MindMapData>({
    nodes: [],
    connections: [],
    metadata: {
      title: "Tender Mind Map",
      description: "Interactive visualization of project relationships",
      version: "1.0",
      lastModified: new Date().toISOString(),
      author: "AI Assistant"
    }
  });
  
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Set<NodeType>>(new Set());
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentStep, setCurrentStep] = useState(0);
  const [animationSteps, setAnimationSteps] = useState<Node[]>([]);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });

  // Generate initial mind map from tender data
  const generateMindMap = useCallback(async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(`/api/insights?tenderId=${tenderId || "default"}`);
      const data = await response.json();
      const insights = data.insights || [];

      const nodes: Node[] = [
        {
          id: "center",
          label: "Tender Project",
          type: "general",
          x: 400,
          y: 300,
          connections: [],
          metadata: {
            description: "Main project node",
            priority: "high",
            status: "in-progress",
            tags: ["project", "main"]
          },
          style: {
            size: "large",
            color: "bg-gradient-to-r from-blue-500 to-purple-500",
            shape: "circle"
          }
        }
      ];

      // Add insight nodes with enhanced positioning
      insights.forEach((insight: any, index: number) => {
        const angle = (index / insights.length) * 2 * Math.PI;
        const radius = 200 + (index % 3) * 50; // Varying distances
        const x = 400 + radius * Math.cos(angle);
        const y = 300 + radius * Math.sin(angle);

        const nodeType = insight.type as NodeType || "general";
        const config = nodeTypeConfig[nodeType];

        nodes.push({
          id: `insight-${insight.id}`,
          label: insight.content.substring(0, 30) + (insight.content.length > 30 ? "..." : ""),
          type: nodeType,
          x,
          y,
          connections: ["center"],
          metadata: {
            description: insight.content,
            priority: index % 4 === 0 ? "critical" : index % 3 === 0 ? "high" : "medium",
            status: "pending",
            tags: [nodeType, "ai-generated"]
          },
          style: {
            size: index % 3 === 0 ? "large" : "medium",
            color: config.color,
            shape: "rectangle"
          }
        });
      });

      const connections: Connection[] = insights.map((insight: any, index: number) => ({
        id: `conn-${insight.id}`,
        from: "center",
        to: `insight-${insight.id}`,
        type: "relationship",
        strength: "medium",
        style: {
          color: "#6366f1",
          thickness: 2
        }
      }));

      setMindMapData({
        nodes,
        connections,
        metadata: {
          ...mindMapData.metadata,
          lastModified: new Date().toISOString()
        }
      });

      // Set up animation steps for presentation mode
      setAnimationSteps(nodes);
      setCurrentStep(0);
      
      showNotification("Mind map generated successfully!", "success");
    } catch (error) {
      console.error("Error generating mind map:", error);
      showNotification("Failed to generate mind map", "error");
    } finally {
      setIsGenerating(false);
    }
  }, [tenderId, mindMapData.metadata]);

  const addNode = () => {
    const newNode: Node = {
      id: `node-${Date.now()}`,
      label: "New Node",
      type: "general",
      x: 400 + (Math.random() - 0.5) * 300,
      y: 300 + (Math.random() - 0.5) * 200,
      connections: [],
      metadata: {
        description: "New node",
        priority: "medium",
        status: "pending",
        tags: ["manual"]
      },
      style: {
        size: "medium",
        color: "bg-muted border-border text-muted-foreground",
        shape: "circle"
      }
    };

    setMindMapData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString()
      }
    }));

    showNotification("Node added successfully!", "success");
  };

  const deleteNode = (nodeId: string) => {
    if (nodeId === "center") return;
    
    setMindMapData(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      connections: prev.connections.filter(conn => conn.from !== nodeId && conn.to !== nodeId),
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString()
      }
    }));
    setSelectedNode(null);
    showNotification("Node deleted successfully!", "success");
  };

  const updateNode = (nodeId: string, updates: Partial<Node>) => {
    setMindMapData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      ),
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString()
      }
    }));
    setEditingNode(null);
    showNotification("Node updated successfully!", "success");
  };

  const connectNodes = (fromId: string, toId: string) => {
    if (fromId === toId) return;

    const connectionExists = mindMapData.connections.some(
      conn => (conn.from === fromId && conn.to === toId) || 
              (conn.from === toId && conn.to === fromId)
    );

    if (connectionExists) return;

    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      from: fromId,
      to: toId,
      type: "relationship",
      strength: "medium",
      style: {
        color: "#6366f1",
        thickness: 2
      }
    };

    setMindMapData(prev => ({
      ...prev,
      connections: [...prev.connections, newConnection],
      metadata: {
        ...prev.metadata,
        lastModified: new Date().toISOString()
      }
    }));

    showNotification("Connection created!", "success");
  };

  const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
    if (interactiveMode === "preview") return;
    
    e.preventDefault();
    setDraggedNode(nodeId);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (draggedNode) {
      setMindMapData(prev => ({
        ...prev,
        nodes: prev.nodes.map(node => 
          node.id === draggedNode 
            ? { ...node, x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y }
            : node
        ),
        metadata: {
          ...prev.metadata,
          lastModified: new Date().toISOString()
        }
      }));
    } else if (isPanning) {
      setPan(prev => ({
        x: prev.x + e.movementX,
        y: prev.y + e.movementY
      }));
    }
  }, [draggedNode, dragOffset, isPanning]);

  const handleMouseUp = () => {
    setDraggedNode(null);
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setZoom(prev => Math.max(0.1, Math.min(3, prev * delta)));
  };

  const exportMindMap = () => {
    const dataStr = JSON.stringify(mindMapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mind-map-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Mind map exported successfully!", "success");
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const nextStep = () => {
    if (currentStep < animationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const showNotification = (message: string, type: "success" | "error" | "info") => {
    const notification = document.createElement("div");
    notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === "success" ? "bg-green-500 text-white" :
      type === "error" ? "bg-red-500 text-white" :
      "bg-blue-500 text-white"
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = "translateX(0)";
    }, 100);
    
    setTimeout(() => {
      notification.style.transform = "translateX(100%)";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  };

  const getModeIcon = () => {
    switch (interactiveMode) {
      case "preview": return <Eye size={16} />;
      case "edit": return <Edit3 size={16} />;
      case "present": return <Maximize2 size={16} />;
      case "collaborate": return <Users size={16} />;
      default: return <Eye size={16} />;
    }
  };

  const getModeColor = () => {
    switch (interactiveMode) {
      case "preview": return "text-blue-600 bg-blue-50 border-blue-200";
      case "edit": return "text-green-600 bg-green-50 border-green-200";
      case "present": return "text-purple-600 bg-purple-50 border-purple-200";
      case "collaborate": return "text-orange-600 bg-orange-50 border-orange-200";
      default: return "text-blue-600 bg-blue-50 border-blue-200";
    }
  };

  const filteredNodes = mindMapData.nodes.filter(node => 
    selectedFilters.size === 0 || selectedFilters.has(node.type)
  );

  useEffect(() => {
    if (draggedNode || isPanning) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [draggedNode, isPanning, handleMouseMove]);

  useEffect(() => {
    generateMindMap();
  }, [generateMindMap]);

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Network className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-heading text-foreground">Mind Map</h3>
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${getModeColor()}`}>
              {getModeIcon()}
              {interactiveMode.charAt(0).toUpperCase() + interactiveMode.slice(1)} Mode
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Advanced Options"
          >
            <Settings size={16} />
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="p-2 text-muted-foreground hover:text-green-600 transition-colors"
            title="Filter Nodes"
          >
            <Filter size={16} />
          </button>
          <button
            onClick={exportMindMap}
            className="p-2 text-muted-foreground hover:text-primary transition-colors"
            title="Export Mind Map"
          >
            <Download size={16} />
          </button>
        </div>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div className="bg-muted rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-semibold text-heading text-foreground">Advanced Mind Map Options</h4>
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Save size={16} className="text-gray-600" />
              <span className="text-sm">Save Layout</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Share2 size={16} className="text-gray-600" />
              <span className="text-sm">Share Map</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <Copy size={16} className="text-gray-600" />
              <span className="text-sm">Duplicate Node</span>
            </button>
            <button className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg hover:bg-muted transition-colors">
              <BarChart3 size={16} className="text-gray-600" />
              <span className="text-sm">Analytics</span>
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-semibold text-heading text-foreground mb-3">Filter by Node Type</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(nodeTypeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => {
                  const newFilters = new Set(selectedFilters);
                  if (newFilters.has(type as NodeType)) {
                    newFilters.delete(type as NodeType);
                  } else {
                    newFilters.add(type as NodeType);
                  }
                  setSelectedFilters(newFilters);
                }}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${
                  selectedFilters.has(type as NodeType)
                    ? `${config.color} border-current`
                    : "bg-white border-gray-300 hover:border-gray-400"
                }`}
              >
                <config.icon size={14} />
                <span className="text-sm">{config.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={generateMindMap}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="animate-spin" size={16} />
                Generating...
              </>
            ) : (
              <>
                <Zap size={16} />
                Generate Map
              </>
            )}
          </button>
          
          {interactiveMode === "edit" && (
            <button
              onClick={addNode}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={16} />
              Add Node
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom(prev => Math.max(0.1, prev - 0.1))}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ZoomOut size={16} />
            </button>
            <span className="text-sm text-gray-600 min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ZoomIn size={16} />
            </button>
          </div>

          {/* Presentation Controls */}
          {interactiveMode === "present" && (
            <div className="flex items-center gap-2">
              <button
                onClick={previousStep}
                disabled={currentStep === 0}
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                <SkipBack size={16} />
              </button>
              <button
                onClick={togglePlayback}
                className="p-2 text-muted-foreground hover:text-green-600 transition-colors"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button
                onClick={nextStep}
                disabled={currentStep === animationSteps.length - 1}
                className="p-2 text-muted-foreground hover:text-foreground disabled:opacity-50 transition-colors"
              >
                <SkipForward size={16} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div 
        ref={canvasRef}
        className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-lg relative"
        style={{ height: "600px" }}
        onWheel={handleWheel}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            setIsPanning(true);
          }
        }}
      >
        <div 
          className="relative w-full h-full"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: "center center"
          }}
        >
          {/* Connections */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {mindMapData.connections.map((conn) => {
              const fromNode = mindMapData.nodes.find(n => n.id === conn.from);
              const toNode = mindMapData.nodes.find(n => n.id === conn.to);
              
              if (!fromNode || !toNode) return null;

              return (
                <g key={conn.id}>
                  <line
                    x1={fromNode.x}
                    y1={fromNode.y}
                    x2={toNode.x}
                    y2={toNode.y}
                    stroke={conn.style.color}
                    strokeWidth={conn.style.thickness}
                    strokeDasharray={conn.style.dashPattern?.join(',')}
                    className="transition-all duration-300"
                  />
                  {conn.label && (
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2}
                      textAnchor="middle"
                      className="text-xs fill-gray-600"
                    >
                      {conn.label}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {filteredNodes.map((node) => {
            const config = nodeTypeConfig[node.type];
            const Icon = config.icon;
            const isSelected = selectedNode === node.id;
            const isEditing = editingNode === node.id;
            const isDragging = draggedNode === node.id;
            const isVisible = interactiveMode === "present" ? 
              animationSteps.slice(0, currentStep + 1).some(n => n.id === node.id) : true;

            if (!isVisible) return null;

            return (
              <div
                key={node.id}
                className={`absolute cursor-move select-none rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all duration-300 ${
                  config.color
                } ${
                  isSelected ? "ring-2 ring-blue-500 shadow-lg" : ""
                } ${
                  isDragging ? "opacity-80 scale-105" : ""
                } ${
                  interactiveMode === "preview" ? "cursor-pointer" : ""
                }`}
                style={{
                  left: node.x - 50,
                  top: node.y - 15,
                  transform: "translate(-50%, -50%)",
                  opacity: isVisible ? 1 : 0,
                  transition: "opacity 0.5s ease-in-out"
                }}
                onMouseDown={(e) => handleMouseDown(e, node.id)}
                onClick={() => setSelectedNode(node.id)}
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} />
                  <span className="truncate max-w-[120px]">{node.label}</span>
                  
                  {/* Priority Indicator */}
                  {node.metadata.priority && (
                    <div className={`w-2 h-2 rounded-full ${
                      node.metadata.priority === "critical" ? "bg-red-500" :
                      node.metadata.priority === "high" ? "bg-orange-500" :
                      node.metadata.priority === "medium" ? "bg-yellow-500" :
                      "bg-green-500"
                    }`} />
                  )}
                </div>

                {/* Node Actions */}
                {isSelected && interactiveMode === "edit" && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingNode(node.id);
                      }}
                      className="p-1 bg-white rounded shadow-md hover:bg-muted transition-colors"
                      title="Edit Node"
                    >
                      <Edit3 size={12} />
                    </button>
                    {node.id !== "center" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteNode(node.id);
                        }}
                        className="p-1 bg-white rounded shadow-md hover:bg-red-50 transition-colors"
                        title="Delete Node"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Canvas Overlay Info */}
        <div className="absolute top-4 left-4 bg-white bg-opacity-90 rounded-lg p-3 shadow-md">
          <div className="text-xs text-gray-600 space-y-1">
            <div>Nodes: {filteredNodes.length}</div>
            <div>Connections: {mindMapData.connections.length}</div>
            <div>Zoom: {Math.round(zoom * 100)}%</div>
          </div>
        </div>
      </div>

      {/* Node Details Panel */}
      {selectedNode && (
        <div className="bg-muted rounded-lg p-4">
          <h4 className="text-sm font-semibold text-heading text-foreground mb-3">Node Details</h4>
          {(() => {
            const node = mindMapData.nodes.find(n => n.id === selectedNode);
            if (!node) return null;
            
            return (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-600">Label</label>
                  <p className="text-sm text-heading text-foreground">{node.label}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-600">Type</label>
                  <p className="text-sm text-heading text-foreground">{nodeTypeConfig[node.type].label}</p>
                </div>
                {node.metadata.description && (
                  <div>
                    <label className="text-xs font-medium text-gray-600">Description</label>
                    <p className="text-sm text-heading text-foreground">{node.metadata.description}</p>
                  </div>
                )}
                <div className="flex gap-4">
                  {node.metadata.priority && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Priority</label>
                      <p className={`text-sm font-medium ${priorityColors[node.metadata.priority]}`}>
                        {node.metadata.priority}
                      </p>
                    </div>
                  )}
                  {node.metadata.status && (
                    <div>
                      <label className="text-xs font-medium text-gray-600">Status</label>
                      <p className={`text-sm px-2 py-1 rounded-full ${statusColors[node.metadata.status]}`}>
                        {node.metadata.status}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Sparkles size={16} className="text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <strong>Interactive Mind Map:</strong> 
            {interactiveMode === "preview" && " Click nodes to view details and explore connections."}
            {interactiveMode === "edit" && " Drag nodes to reposition, click to select, and use the edit button to modify."}
            {interactiveMode === "present" && " Use playback controls to animate the mind map creation process."}
            {interactiveMode === "collaborate" && " Real-time collaboration features coming soon!"}
          </div>
        </div>
      </div>
    </div>
  );
}