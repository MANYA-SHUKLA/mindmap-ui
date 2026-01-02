export interface MindmapNode {
  id: string;
  label: string;
  summary: string; // Quick info shown on hover
  description: string; // Detailed description for side panel
  metadata?: {
    inputs?: string[];
    outputs?: string[];
    notes?: string;
    tags?: string[];
    [key: string]: any;
  };
  children?: MindmapNode[];
  collapsed?: boolean; // For expand/collapse state
  position?: { x: number; y: number }; // For manual positioning (optional)
}

export interface MindmapData {
  root: MindmapNode;
  title?: string;
  version?: string;
}

