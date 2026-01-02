# Data-Driven Mindmap Guide

## ✅ Fully Data-Driven Implementation

This mindmap is **completely data-driven** - there are **NO hardcoded nodes** in the UI code. The entire visualization is generated dynamically from the JSON data file.

## 📊 Data Flow Architecture

```
data/mindmap.json
    ↓ (imported)
app/page.tsx
    ↓ (passed as prop)
components/Mindmap.tsx
    ↓ (converted)
utils/mindmapConverter.ts
    ↓ (generates)
React Flow Visualization (nodes + edges)
```

## 🔄 How It Works

1. **Data Source**: `data/mindmap.json` contains the entire mindmap structure
2. **Data Loading**: JSON is imported and passed to the Mindmap component
3. **Automatic Sync**: Component automatically updates when data prop changes
4. **Dynamic Conversion**: `convertMindmapToFlow()` recursively processes the data structure
5. **Visual Rendering**: React Flow renders nodes and edges based on converted data

## ✏️ Modifying the Mindmap

### Example 1: Adding a New Node

Edit `data/mindmap.json` and add a new child to any node:

```json
{
  "id": "frameworks",
  "label": "Frameworks & Libraries",
  "children": [
    {
      "id": "react",
      "label": "React",
      "summary": "A JavaScript library",
      "description": "..."
    },
    {
      "id": "angular",  // ← NEW NODE
      "label": "Angular",
      "summary": "A TypeScript-based framework",
      "description": "Angular is a platform and framework for building single-page client applications.",
      "metadata": {
        "tags": ["framework", "typescript"]
      }
    }
  ]
}
```

**Result**: The new "Angular" node automatically appears in the UI after page refresh.

### Example 2: Updating Node Text

Simply modify the JSON fields:

```json
{
  "id": "react",
  "label": "React.js",  // ← Updated label
  "summary": "A powerful JavaScript library for building user interfaces",  // ← Updated summary
  "description": "React is a declarative, efficient, and flexible JavaScript library..."  // ← Updated description
}
```

**Result**: 
- Updated label appears on the node
- Updated summary appears in hover tooltip
- Updated description appears in side panel

### Example 3: Changing Hierarchy

Move a node to a different parent by changing its location in the JSON:

```json
{
  "id": "root",
  "children": [
    {
      "id": "frameworks",
      "children": [
        {
          "id": "react",
          // ... react node data
        }
      ]
    },
    {
      "id": "tools",
      "children": [
        {
          "id": "react",  // ← Moved React here
          // ... react node data
        }
      ]
    }
  ]
}
```

**Result**: The node automatically moves to its new parent in the visualization.

### Example 4: Adding Metadata

Add or modify metadata fields:

```json
{
  "id": "react",
  "metadata": {
    "tags": ["library", "ui", "popular"],  // ← Added new tag
    "notes": "Most popular frontend library",
    "inputs": ["JavaScript knowledge", "JSX syntax"],  // ← Added inputs
    "outputs": ["Reusable components", "State management", "Virtual DOM"]  // ← Added outputs
  }
}
```

**Result**: 
- Tags appear in hover tooltip and node display
- Inputs/Outputs appear in hover tooltip and side panel
- Notes appear in side panel

## 🎯 Key Points

### ✅ What IS Data-Driven:
- All node labels, summaries, descriptions
- All node positions (calculated from hierarchy)
- All edges (generated from parent-child relationships)
- All metadata (tags, notes, inputs, outputs)
- Node hierarchy and structure
- Title and version information

### ❌ What is NOT Hardcoded:
- No node labels in component code
- No node positions in component code
- No edge definitions in component code
- No metadata in component code
- No hierarchy structure in component code

## 🔍 Code Verification

### Data Loading (app/page.tsx)
```typescript
import mindmapData from '@/data/mindmap.json';  // ← Data imported from JSON
<Mindmap data={mindmapData as MindmapData} />    // ← Passed as prop
```

### Data Sync (components/Mindmap.tsx)
```typescript
// Sync internal state when data prop changes (data-driven visualization)
useEffect(() => {
  setMindmapData(data);  // ← Updates when JSON changes
  // ... reset state
}, [data]);  // ← Reacts to data prop changes
```

### Data Conversion (utils/mindmapConverter.ts)
```typescript
export function convertMindmapToFlow(
  rootNode: MindmapNode,  // ← Takes data structure
  collapsedNodes: Set<string> = new Set()
): { nodes: Node[]; edges: Edge[] } {
  // Recursively processes data structure
  // Generates nodes and edges dynamically
  // No hardcoded values
}
```

## 🚀 Testing Data-Driven Behavior

1. **Add a Node**:
   - Edit `data/mindmap.json`
   - Add a new child node
   - Refresh the page
   - ✅ New node appears automatically

2. **Update Text**:
   - Change a `label` or `summary` in JSON
   - Refresh the page
   - ✅ Text updates automatically

3. **Change Hierarchy**:
   - Move a node to a different parent
   - Refresh the page
   - ✅ Structure updates automatically

4. **Add Metadata**:
   - Add new tags, inputs, or outputs
   - Refresh the page
   - ✅ Metadata appears in tooltips and side panel

## 📝 Data Structure Requirements

The JSON must follow this structure:

```typescript
interface MindmapData {
  title?: string;
  version?: string;
  root: MindmapNode;
}

interface MindmapNode {
  id: string;              // Required: Unique identifier
  label: string;           // Required: Display name
  summary: string;         // Required: Shown on hover
  description: string;      // Required: Shown in side panel
  metadata?: {             // Optional: Additional information
    tags?: string[];
    notes?: string;
    inputs?: string[];
    outputs?: string[];
    [key: string]: any;    // Can add custom fields
  };
  children?: MindmapNode[]; // Optional: Child nodes (creates hierarchy)
}
```

## ✨ Conclusion

The mindmap is **100% data-driven**. Simply modify `data/mindmap.json` to update the entire visualization - no UI code changes needed!

