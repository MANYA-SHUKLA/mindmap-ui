import { Node, Edge, Position } from 'reactflow';
import { MindmapNode } from '@/types/mindmap';

interface NodeData {
  label: string;
  summary: string;
  description: string;
  metadata?: any;
  originalNode: MindmapNode;
}

// Layout constants optimized for mindmap visualization
const BASE_RADIUS = 250; // Base distance from parent to children
const LEVEL_SCALE = 0.85; // Scale factor for each level (children get progressively closer)
const MIN_SPACING = 180; // Minimum spacing between nodes at the same level
const MAX_ANGLE_SPAN = Math.PI * 1.6; // Maximum angle span for children (288 degrees)

/**
 * Converts hierarchical mindmap data into React Flow nodes and edges
 * Uses an optimized radial hierarchical layout algorithm specifically designed for mindmaps
 */
export function convertMindmapToFlow(
  rootNode: MindmapNode,
  collapsedNodes: Set<string> = new Set()
): { nodes: Node<NodeData>[]; edges: Edge[] } {
  const nodes: Node<NodeData>[] = [];
  const edges: Edge[] = [];

  /**
   * Calculate positions using an optimized radial hierarchical layout
   * This algorithm distributes nodes in a circular pattern around their parent,
   * creating an intuitive mindmap visualization
   */
  function calculatePositions(
    node: MindmapNode,
    level: number = 0,
    index: number = 0,
    parentX: number = 0,
    parentY: number = 0,
    siblingCount: number = 1,
    parentAngle: number = 0, // Angle from grandparent to parent (for alignment)
    parentId: string | null = null
  ) {
    const isCollapsed = collapsedNodes.has(node.id);
    const hasChildren = node.children && node.children.length > 0 && !isCollapsed;

    let x: number, y: number;
    let angle: number;

    if (level === 0) {
      // Root node at center
      x = 0;
      y = 0;
      angle = 0;
    } else {
      // Calculate radius based on level (deeper levels have smaller radius)
      const radius = BASE_RADIUS * Math.pow(LEVEL_SCALE, level - 1);

      if (level === 1) {
        // First level: distribute evenly in a full circle around root
        angle = (index / siblingCount) * Math.PI * 2;
      } else {
        // Deeper levels: distribute children in a fan around parent
        // Calculate the angle span based on number of siblings
        const angleSpan = Math.min(
          MAX_ANGLE_SPAN,
          siblingCount * (MIN_SPACING / radius)
        );

        // Start angle relative to parent's angle
        const startAngle = parentAngle - angleSpan / 2;
        
        // Distribute children evenly within the angle span
        if (siblingCount === 1) {
          // Single child: place it in the direction of parent's angle
          angle = parentAngle;
        } else {
          // Multiple children: distribute evenly
          angle = startAngle + (index / (siblingCount - 1)) * angleSpan;
        }
      }

      // Calculate position using polar coordinates
      x = parentX + Math.cos(angle) * radius;
      y = parentY + Math.sin(angle) * radius;
    }

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

    // Process children recursively
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
          angle, // Pass current angle as parent angle for children
          node.id
        );
      });
    }
  }

  // Start layout calculation from root
  calculatePositions(rootNode);

  return { nodes, edges };
}

