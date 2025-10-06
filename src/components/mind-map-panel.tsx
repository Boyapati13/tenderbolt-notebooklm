"use client";

import { useCallback, useEffect, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from "reactflow";
import "reactflow/dist/style.css";

const initialNodes: Node[] = [
  {
    id: "1",
    type: "default",
    position: { x: 250, y: 25 },
    data: { label: "Tender Requirements" },
    style: { background: "#f0f9ff", border: "1px solid #0ea5e9", borderRadius: "8px" },
  },
  {
    id: "2",
    type: "default",
    position: { x: 100, y: 125 },
    data: { label: "Technical Specs" },
    style: { background: "#f0fdf4", border: "1px solid #22c55e", borderRadius: "8px" },
  },
  {
    id: "3",
    type: "default",
    position: { x: 400, y: 125 },
    data: { label: "Commercial Terms" },
    style: { background: "#fefce8", border: "1px solid #eab308", borderRadius: "8px" },
  },
  {
    id: "4",
    type: "default",
    position: { x: 50, y: 225 },
    data: { label: "Performance Metrics" },
    style: { background: "#fdf2f8", border: "1px solid #ec4899", borderRadius: "8px" },
  },
  {
    id: "5",
    type: "default",
    position: { x: 200, y: 225 },
    data: { label: "Compliance Standards" },
    style: { background: "#f3e8ff", border: "1px solid #a855f7", borderRadius: "8px" },
  },
  {
    id: "6",
    type: "default",
    position: { x: 350, y: 225 },
    data: { label: "Delivery Schedule" },
    style: { background: "#fff7ed", border: "1px solid #f97316", borderRadius: "8px" },
  },
];

const initialEdges: Edge[] = [
  { id: "e1-2", source: "1", target: "2", animated: true },
  { id: "e1-3", source: "1", target: "3", animated: true },
  { id: "e2-4", source: "2", target: "4", animated: true },
  { id: "e2-5", source: "2", target: "5", animated: true },
  { id: "e3-6", source: "3", target: "6", animated: true },
];

export function MindMapPanel() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [insights, setInsights] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/insights")
      .then((r) => r.json())
      .then((d) => setInsights(d.insights ?? []))
      .catch(() => {});
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const addNodeFromInsight = useCallback((insight: any) => {
    const newNode: Node = {
      id: `insight-${insight.id}`,
      type: "default",
      position: { 
        x: Math.random() * 300 + 100, 
        y: Math.random() * 200 + 100 
      },
      data: { 
        label: insight.content.length > 30 
          ? insight.content.substring(0, 30) + "..." 
          : insight.content 
      },
      style: { 
        background: insight.type === "requirement" ? "#f0f9ff" : 
                   insight.type === "compliance" ? "#f0fdf4" :
                   insight.type === "risk" ? "#fef2f2" : "#fff7ed",
        border: insight.type === "requirement" ? "1px solid #0ea5e9" :
               insight.type === "compliance" ? "1px solid #22c55e" :
               insight.type === "risk" ? "1px solid #ef4444" : "1px solid #f97316",
        borderRadius: "8px",
        fontSize: "12px",
      },
    };
    setNodes((nds) => [...nds, newNode]);
  }, [setNodes]);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-1">
        <div className="text-xs font-medium">Mind Map</div>
        <div className="text-xs opacity-70">Drag & connect</div>
      </div>
      
      <div className="flex-1 rounded border border-foreground/20 overflow-hidden mb-1">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          fitView
        >
          <Controls />
          <MiniMap />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      
      <div className="flex-1 overflow-auto">
        <div className="text-xs opacity-70 mb-1">Add from insights:</div>
        <div className="flex flex-wrap gap-1">
          {insights.slice(0, 3).map((insight) => (
            <button
              key={insight.id}
              className="text-xs px-1 py-0.5 rounded bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
              onClick={() => addNodeFromInsight(insight)}
            >
              {insight.type}: {insight.content.substring(0, 15)}...
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
