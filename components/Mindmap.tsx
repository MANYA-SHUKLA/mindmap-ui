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

/**
 * Mindmap Component - Fully Data-Driven
 * 
 * This component is completely data-driven. The entire visualization is generated
 * from the data prop (typically from data/mindmap.json). No nodes are hardcoded.
 * 
 * To update the mindmap:
 * 1. Modify data/mindmap.json
 * 2. The component will automatically sync and re-render
 * 
 * Features:
 * - Dynamic node generation from data structure
 * - Automatic layout calculation based on hierarchy
 * - Edge generation from parent-child relationships
 * - All node properties (label, summary, description, metadata) come from data
 */
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
  const [searchQuery, setSearchQuery] = useState('');
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

  // Handle node click - toggle collapse/expand with smooth transitions
  const onNodeClick: NodeMouseHandler = useCallback(
    (event, node) => {
      event.stopPropagation();
      const nodeData = node.data.originalNode as MindmapNode;

      // Toggle collapse/expand with animation
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

      // Select node and show side panel with smooth transition
      const wasAlreadySelected = selectedNodeId === node.id;
      setSelectedNodeId(node.id);
      
      // Only toggle side panel if clicking a different node
      if (!wasAlreadySelected || !showSidePanel) {
        setShowSidePanel(true);
      }

      // Highlight related nodes (parent, self, and children)
      const relatedNodes = new Set<string>([node.id]);
      
      // Add children
      if (nodeData.children) {
        nodeData.children.forEach((child) => relatedNodes.add(child.id));
      }
      
      // Find and add parent node
      const findParent = (currentNode: MindmapNode, targetId: string, parent: MindmapNode | null = null): MindmapNode | null => {
        if (currentNode.id === targetId) return parent;
        if (currentNode.children) {
          for (const child of currentNode.children) {
            const found = findParent(child, targetId, currentNode);
            if (found) return found;
          }
        }
        return null;
      };
      
      const parent = findParent(mindmapData.root, node.id);
      if (parent) {
        relatedNodes.add(parent.id);
      }
      
      setHighlightedNodes(relatedNodes);
    },
    [selectedNodeId, showSidePanel, mindmapData]
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

  // Add child node
  const handleAddChildNode = useCallback(
    (parentId: string) => {
      const parentNode = findNode(parentId);
      if (!parentNode) return;

      const newNodeId = `${parentId}-child-${Date.now()}`;
      const newNode: MindmapNode = {
        id: newNodeId,
        label: 'New Node',
        summary: 'Click to edit',
        description: 'Add a description here',
        metadata: {
          tags: ['new'],
        },
        children: [],
      };

      const updatedRoot = updateNodeInTree(parentId, {
        children: [...(parentNode.children || []), newNode],
      });
      setMindmapData({ ...mindmapData, root: updatedRoot });
      
      // Expand parent if collapsed
      setCollapsedNodes((prev) => {
        const newSet = new Set(prev);
        newSet.delete(parentId);
        return newSet;
      });

      // Select the new node
      setSelectedNodeId(newNodeId);
    },
    [mindmapData, findNode, updateNodeInTree]
  );

  // Delete node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      if (nodeId === mindmapData.root.id) {
        // Don't allow deleting root node
        return;
      }

      const deleteNodeFromTree = (
        node: MindmapNode,
        targetId: string
      ): MindmapNode | null => {
        if (node.id === targetId) {
          return null; // Mark for deletion
        }
        if (node.children) {
          const filteredChildren = node.children
            .map((child) => deleteNodeFromTree(child, targetId))
            .filter((child): child is MindmapNode => child !== null);
          return { ...node, children: filteredChildren };
        }
        return node;
      };

      const updatedRoot = deleteNodeFromTree(mindmapData.root, nodeId);
      if (updatedRoot) {
        setMindmapData({ ...mindmapData, root: updatedRoot });
        setSelectedNodeId(null);
        setShowSidePanel(false);
        setHighlightedNodes(new Set());
      }
    },
    [mindmapData]
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

  // Search functionality
  const searchNodes = useCallback((query: string): string[] => {
    if (!query.trim()) return [];
    
    const results: string[] = [];
    const searchLower = query.toLowerCase();
    
    const searchInNode = (node: MindmapNode) => {
      const matchesLabel = node.label.toLowerCase().includes(searchLower);
      const matchesSummary = node.summary.toLowerCase().includes(searchLower);
      const matchesDescription = node.description.toLowerCase().includes(searchLower);
      const matchesTags = node.metadata?.tags?.some((tag: string) =>
        tag.toLowerCase().includes(searchLower)
      );
      
      if (matchesLabel || matchesSummary || matchesDescription || matchesTags) {
        results.push(node.id);
      }
      
      if (node.children) {
        node.children.forEach(searchInNode);
      }
    };
    
    searchInNode(mindmapData.root);
    return results;
  }, [mindmapData]);

  // Update highlighted nodes based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const searchResults = searchNodes(searchQuery);
      setHighlightedNodes(new Set(searchResults));
    } else {
      // Only clear if no node is selected
      if (!selectedNodeId) {
        setHighlightedNodes(new Set());
      }
    }
  }, [searchQuery, searchNodes, selectedNodeId]);

  // Update node styles based on state with smooth transitions
  const nodesWithStyles = useMemo(() => {
    return nodes.map((node) => {
      const isHighlighted = highlightedNodes.has(node.id);
      const isHovered = hoveredNodeId === node.id;
      const isSelected = selectedNodeId === node.id;
      const isCollapsed = collapsedNodes.has(node.id);
      const nodeData = node.data.originalNode as MindmapNode;
      const hasChildren = nodeData?.children && nodeData.children.length > 0;

      return {
        ...node,
        style: {
          ...node.style,
          opacity: highlightedNodes.size > 0 && !isHighlighted ? 0.3 : 1,
          transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: isSelected ? 1000 : isHovered ? 100 : isHighlighted ? 50 : 1,
        },
        data: {
          ...node.data,
          isHighlighted,
          isHovered,
          isSelected,
          isCollapsed: hasChildren ? isCollapsed : false,
        },
      };
    });
  }, [nodes, highlightedNodes, hoveredNodeId, selectedNodeId, collapsedNodes]);

  // Update edge styles with smooth transitions
  const edgesWithStyles = useMemo(() => {
    return edges.map((edge) => {
      const isHighlighted =
        highlightedNodes.has(edge.source) || highlightedNodes.has(edge.target);
      const isHovered =
        hoveredNodeId === edge.source || hoveredNodeId === edge.target;
      const isSelected =
        selectedNodeId === edge.source || selectedNodeId === edge.target;

      return {
        ...edge,
        style: {
          stroke: isSelected
            ? '#8b5cf6'
            : isHighlighted
            ? '#6366f1'
            : isHovered
            ? '#818cf8'
            : 'rgba(148, 163, 184, 0.5)',
          strokeWidth: isSelected ? 4 : isHighlighted ? 3 : isHovered ? 2.5 : 2,
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
        },
        animated: isHighlighted || isSelected,
        zIndex: isSelected ? 100 : isHighlighted ? 50 : 1,
      };
    });
  }, [edges, highlightedNodes, hoveredNodeId, selectedNodeId]);

  // Hover tooltip with enhanced contextual information
  const hoverTooltip = useMemo(() => {
    if (!hoveredNodeId) return null;
    const node = findNode(hoveredNodeId);
    if (!node) return null;

    // Don't show tooltip if side panel is open for this node
    if (selectedNodeId === hoveredNodeId && showSidePanel) return null;

    return (
      <div className="absolute top-4 left-4 z-50 animate-fade-in pointer-events-none">
        <div className="bg-gradient-to-br from-white/95 via-indigo-50/95 to-purple-50/95 dark:from-gray-900/95 dark:via-indigo-900/30 dark:to-purple-900/30 backdrop-blur-xl border-2 border-indigo-200/50 dark:border-indigo-700/50 rounded-2xl shadow-2xl p-5 max-w-sm transform transition-all duration-300">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h3 className="font-bold text-lg bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
              {node.label}
            </h3>
            {node.children && node.children.length > 0 && (
              <span className="flex-shrink-0 px-2 py-1 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold border border-indigo-200/50 dark:border-indigo-700/50">
                {node.children.length} {node.children.length === 1 ? 'child' : 'children'}
              </span>
            )}
          </div>
          {/* Summary - primary information shown on hover (as per requirements) */}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-3 font-medium">{node.summary}</p>
          {node.metadata?.tags && node.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {node.metadata.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="text-xs px-3 py-1.5 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-700 dark:text-indigo-300 rounded-full font-medium border border-indigo-200/50 dark:border-indigo-700/50 shadow-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          {node.metadata?.inputs && node.metadata.inputs.length > 0 && (
            <div className="mt-3 pt-3 border-t border-indigo-200/50 dark:border-indigo-700/50">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mb-1">Inputs:</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{node.metadata.inputs.join(', ')}</p>
            </div>
          )}
          {node.metadata?.outputs && node.metadata.outputs.length > 0 && (
            <div className="mt-2">
              <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">Outputs:</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{node.metadata.outputs.join(', ')}</p>
            </div>
          )}
        </div>
      </div>
    );
  }, [hoveredNodeId, findNode, selectedNodeId, showSidePanel]);

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
        defaultViewport={{ x: 0, y: 0, zoom: 1 }}
        minZoom={0.1}
        maxZoom={2}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        selectNodesOnDrag={false}
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
            
            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search nodes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md text-gray-900 dark:text-gray-100"
              />
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
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
            onAddChildNode={handleAddChildNode}
            onDeleteNode={handleDeleteNode}
            isRootNode={selectedNode.id === mindmapData.root.id}
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

