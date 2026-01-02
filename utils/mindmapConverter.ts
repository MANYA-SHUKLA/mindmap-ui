import { Node, Edge, Position } from 'reactflow';
import { MindmapNode } from '@/types/mindmap';

interface NodeData {
  label: string;
  summary: string;
  description: string;
  metadata?: any;
  originalNode: MindmapNode;
}

const NODE_WIDTH = 200;
const NODE_HEIGHT = 100;
const HORIZONTAL_SPACING = 350;
const VERTICAL_SPACING = 200;

export function convertMindmapToFlow(
  rootNode: MindmapNode,
  collapsedNodes: Set<string> = new Set()
): { nodes: Node<NodeData>[]; edges: Edge[] } {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];
  const nodePositions = new Map<string, { x: number; y: number }>();

  // Calculate positions using a hierarchical layout
  function calculatePositions(
    node: MindmapNode,
    level: number = 0,
    index: number = 0,
    parentX: number = 0,
    parentY: number = 0,
    siblingCount: number = 1,
    parentId: string | null = null
  ) {
    const isCollapsed = collapsedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0 && !isCollapsed;

    let x: number, y: number;

    if (level === 0) {
      // Root node at center
      x = 0;
      y = 0;
    } else {
      // Use a radial layout for mindmap - distribute children around parent
      // For level 1, use a circle around root
      // For deeper levels, use a more structured approach
      if (level === 1) {
        // First level: distribute evenly in a circle
        const angle = (index / siblingCount) * Math.PI * 2;
        const radius = HORIZONTAL_SPACING;
        x = parentX + Math.cos(angle) * radius;
        y = parentY + Math.sin(angle) * radius;
      } else {
        // Deeper levels: use a fan layout
        const angle = (index / siblingCount) * Math.PI * 1.5 - Math.PI * 0.75;
        const radius = HORIZONTAL_SPACING;
        x = parentX + Math.cos(angle) * radius;
        y = parentY + Math.sin(angle) * radius;
      }
    }

    nodePositions.set(node.id, { x, y });

    // Create node
    nodes.push({
      id: node.id,
      type: 'mindmapNode',
      position: { x, y },
      data: {
        label: node.label,
        summary: node.summary,
        description: node.description,
        metadata: node.metadata,
        originalNode: node,
      },
    });

    // Create edge from parent
    if (parentId) {
      edges.push({
        id: `edge-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        animated: false,
      });
    }

    // Process children
    if (hasChildren && node.children) {
      const childCount = node.children.length;
      node.children.forEach((child, childIndex) => {
        calculatePositions(
          child,
          level + 1,
          childIndex,
          x,
          y,
          childCount,
          node.id
        );
      });
    }
  }

  calculatePositions(rootNode);

  return { nodes, edges };
}

