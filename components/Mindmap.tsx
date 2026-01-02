'use client';

import { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  NodeMouseHandler,
  ReactFlowInstance,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { MindmapNode, MindmapData } from '@/types/mindmap';
import { convertMindmapToFlow } from '@/utils/mindmapConverter';
import MindmapNodeComponent from './MindmapNode';
import SidePanel from './SidePanel';
import DarkModeToggle from './DarkModeToggle';

interface MindmapProps {
  data: MindmapData;
}

const nodeTypes = {
  mindmapNode: MindmapNodeComponent,
};

export default function Mindmap({ data }: MindmapProps) {
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(
    new Set()
  );
  const [mindmapData, setMindmapData] = useState<MindmapData>(data);
  const [showSidePanel, setShowSidePanel] = useState(false);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Sync internal state when data prop changes (data-driven visualization)
  useEffect(() => {
    setMindmapData(data);
    // Reset selection state when data changes
    setSelectedNodeId(null);
    setShowSidePanel(false);
    setHighlightedNodes(new Set());
    setCollapsedNodes(new Set());
  }, [data]);

  // Find node in the tree
  const findNode = useCallback(
    (nodeId: string, node: MindmapNode = mindmapData.root): MindmapNode | null => {
      if (node.id === nodeId) return node;
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(nodeId, child);
          if (found) return found;
        }
      }
      return null;
    },
    [mindmapData]
  );

  // Update node in the tree
  const updateNodeInTree = useCallback(
    (
      nodeId: string,
      updates: Partial<MindmapNode>,
      node: MindmapNode = mindmapData.root
    ): MindmapNode => {
      if (node.id === nodeId) {
        return { ...node, ...updates };
      }
      if (node.children) {
        return {
          ...node,
          children: node.children.map((child) =>
            updateNodeInTree(nodeId, updates, child)
          ),
        };
      }
      return node;
    },
    [mindmapData]
  );

  // Convert mindmap data to flow format
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    return convertMindmapToFlow(mindmapData.root, collapsedNodes);
  }, [mindmapData, collapsedNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when data or collapsed state changes
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = convertMindmapToFlow(
      mindmapData.root,
      collapsedNodes
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [mindmapData, collapsedNodes, setNodes, setEdges]);

  // Handle node click - toggle collapse/expand
  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      event.stopPropagation();
      const nodeData = node.data.originalNode as MindmapNode;

      if (nodeData.children && nodeData.children.length > 0) {
        setCollapsedNodes((prev) => {
          const newSet = new Set(prev);
          if (newSet.has(node.id)) {
            newSet.delete(node.id);
          } else {
            newSet.add(node.id);
          }
          return newSet;
        });
      }

      // Select node and show side panel
      setSelectedNodeId(node.id);
      setShowSidePanel(true);

      // Highlight related nodes
      const relatedNodes = new Set<string>([node.id]);
      if (nodeData.children) {
        nodeData.children.forEach((child) => relatedNodes.add(child.id));
      }
      setHighlightedNodes(relatedNodes);
    },
    []
  );

  // Handle node hover
  const onNodeMouseEnter: NodeMouseHandler = useCallback((event, node) => {
    setHoveredNodeId(node.id);
  }, []);

  const onNodeMouseLeave: NodeMouseHandler = useCallback(() => {
    setHoveredNodeId(null);
  }, []);

  // Update node data
  const handleUpdateNode = useCallback(
    (nodeId: string, updates: Partial<MindmapNode>) => {
      const updatedRoot = updateNodeInTree(nodeId, updates);
      setMindmapData({ ...mindmapData, root: updatedRoot });
    },
    [mindmapData, updateNodeInTree]
  );

  // Fit to view
  const handleFitView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.fitView({ padding: 0.2, duration: 400 });
    }
  }, []);

  // Reset view
  const handleResetView = useCallback(() => {
    if (reactFlowInstance.current) {
      reactFlowInstance.current.setViewport({ x: 0, y: 0, zoom: 1 });
    }
  }, []);

  // Export data as JSON (bonus feature)
  const handleExportData = useCallback(() => {
    const dataStr = JSON.stringify(mindmapData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'mindmap-data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [mindmapData]);

  // Get selected node
  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findNode(selectedNodeId);
  }, [selectedNodeId, findNode]);

  // Update node styles based on state
  const nodesWithStyles = useMemo(() => {
    return nodes.map((node) => {
      const isHighlighted = highlightedNodes.has(node.id);
      const isHovered = hoveredNodeId === node.id;
      const isSelected = selectedNodeId === node.id;

      return {
        ...node,
        style: {
          ...node.style,
          opacity: highlightedNodes.size > 0 && !isHighlighted ? 0.3 : 1,
          transition: 'opacity 0.3s ease',
        },
        data: {
          ...node.data,
          isHighlighted,
          isHovered,
          isSelected,
        },
      };
    });
  }, [nodes, highlightedNodes, hoveredNodeId, selectedNodeId]);

  // Update edge styles
  const edgesWithStyles = useMemo(() => {
    return edges.map((edge) => {
      const isHighlighted =
        highlightedNodes.has(edge.source) || highlightedNodes.has(edge.target);

      return {
        ...edge,
        style: {
          stroke: isHighlighted 
            ? '#6366f1' 
            : 'rgba(148, 163, 184, 0.5)',
          strokeWidth: isHighlighted ? 3 : 2,
        },
        animated: isHighlighted,
      };
    });
  }, [edges, highlightedNodes]);

  // Hover tooltip
  const hoverTooltip = useMemo(() => {
    if (!hoveredNodeId) return null;
    const node = findNode(hoveredNodeId);
    if (!node) return null;

    return (
      <div className="absolute top-4 left-4 z-50 animate-fade-in">
        <div className="bg-gradient-to-br from-white/95 via-indigo-50/95 to-purple-50/95 dark:from-gray-900/95 dark:via-indigo-900/30 dark:to-purple-900/30 backdrop-blur-xl border-2 border-indigo-200/50 dark:border-indigo-700/50 rounded-2xl shadow-2xl p-5 max-w-sm transform transition-all duration-300 hover:scale-105">
          <h3 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            {node.label}
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3">{node.summary}</p>
          {node.metadata?.tags && (
            <div className="flex flex-wrap gap-2 mt-3">
              {node.metadata.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 rounded-full font-medium border border-indigo-200/50 dark:border-indigo-700/50 shadow-sm hover:scale-110 transition-transform duration-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }, [hoveredNodeId, findNode]);

  return (
    <div className="w-full h-screen relative">
      <ReactFlow
        nodes={nodesWithStyles}
        edges={edgesWithStyles}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onNodeMouseEnter={onNodeMouseEnter}
        onNodeMouseLeave={onNodeMouseLeave}
        nodeTypes={nodeTypes}
        fitView
        onInit={(instance) => {
          reactFlowInstance.current = instance;
        }}
        className="bg-transparent"
      >
        <Background 
          color="rgba(99, 102, 241, 0.1)" 
          gap={20}
          size={1}
        />
        <Controls 
          className="!bg-white/80 dark:!bg-gray-900/80 !backdrop-blur-xl !border-2 !border-indigo-200/50 dark:!border-indigo-700/50 !rounded-xl !shadow-xl"
        />
        <MiniMap
          nodeColor={(node) => {
            if (highlightedNodes.has(node.id)) return '#6366f1';
            if (selectedNodeId === node.id) return '#8b5cf6';
            return '#a5b4fc';
          }}
          maskColor="rgba(0, 0, 0, 0.2)"
          className="!bg-white/80 dark:!bg-gray-900/80 !backdrop-blur-xl !border-2 !border-indigo-200/50 dark:!border-indigo-700/50 !rounded-xl !shadow-xl"
        />
        <Panel position="top-left" className="m-4">
          <div className="bg-gradient-to-br from-white/95 via-indigo-50/95 to-purple-50/95 dark:from-gray-900/95 dark:via-indigo-900/30 dark:to-purple-900/30 backdrop-blur-xl rounded-2xl shadow-2xl p-5 space-y-3 border-2 border-indigo-200/50 dark:border-indigo-700/50 animate-fade-in">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent mb-2">
                  {mindmapData.title || 'Mindmap'}
                </h2>
                <div className="h-1 w-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full"></div>
              </div>
              <DarkModeToggle />
            </div>
            <button
              onClick={handleFitView}
              className="w-full px-5 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 hover:from-indigo-600 hover:to-purple-600 active:scale-95"
            >
              Fit to View
            </button>
            <button
              onClick={handleResetView}
              className="w-full px-5 py-3 bg-gradient-to-r from-gray-400 to-gray-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 hover:from-gray-500 hover:to-gray-600 active:scale-95"
            >
              Reset View
            </button>
            <button
              onClick={() => {
                setHighlightedNodes(new Set());
                setSelectedNodeId(null);
                setShowSidePanel(false);
              }}
              className="w-full px-5 py-3 bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 hover:from-gray-300 hover:to-gray-400 active:scale-95"
            >
              Clear Selection
            </button>
            <button
              onClick={handleExportData}
              className="w-full px-5 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 hover:from-emerald-600 hover:to-teal-600 active:scale-95 mt-2"
            >
              Export JSON
            </button>
          </div>
        </Panel>
      </ReactFlow>

      {/* Hover Tooltip */}
      {hoverTooltip}

      {/* Side Panel */}
      {showSidePanel && selectedNode && (
        <div className="absolute right-0 top-0 h-full z-50">
          <SidePanel
            selectedNode={selectedNode}
            onUpdateNode={handleUpdateNode}
            onClose={() => {
              setShowSidePanel(false);
              setSelectedNodeId(null);
              setHighlightedNodes(new Set());
            }}
          />
        </div>
      )}

      {/* Overlay when side panel is open */}
      {showSidePanel && (
        <div 
          className="absolute inset-0 bg-black/20 dark:bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => {
            setShowSidePanel(false);
            setSelectedNodeId(null);
            setHighlightedNodes(new Set());
          }}
        />
      )}
    </div>
  );
}

