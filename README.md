# Interactive Mindmap UI

An interactive, data-driven mindmap visualization built with Next.js 16, TypeScript, and Tailwind CSS 4. This application allows users to explore hierarchical data structures through an intuitive visual interface with rich interaction capabilities.

## 🚀 Features

### Core Functionality

- **Data-Driven Visualization**: The entire mindmap is generated from a JSON data file. Simply modify the data file to update the visualization without touching any UI code.
- **Hierarchical Layout**: Automatically arranges nodes in a radial, hierarchical structure optimized for mindmap visualization.
- **Interactive Nodes**: Rich interactions including hover, click, expand/collapse, and selection.

### Interactive Features

1. **Hover Interactions**
   - Hover over any node to see a tooltip with:
     - Node label
     - Quick summary
     - Tags (if available)

2. **Click Interactions**
   - Click a node to:
     - Expand or collapse its children (if it has children)
     - Select the node and open the side panel
     - Highlight related nodes and edges

3. **View Controls**
   - **Fit to View**: Automatically adjusts the viewport to show all visible nodes
   - **Reset View**: Resets zoom and pan to default position
   - **Clear Selection**: Clears current selection and highlights

4. **Edit Functionality**
   - Edit node properties directly in the side panel:
     - Label
     - Summary (shown on hover)
     - Description (detailed information)
     - Metadata (tags, notes, inputs, outputs)
   - Changes are reflected immediately in the visualization

5. **Export Functionality** (Bonus)
   - Export the current mindmap data as JSON
   - Download button in the control panel
   - Preserves all edits and structure

5. **Side Panel**
   - Displays detailed information about the selected node
   - Allows inline editing of all node properties
   - Shows metadata including tags, notes, inputs, and outputs

## 🛠️ Technologies Used

### Frameworks & Libraries

- **Next.js 16** (Latest): React framework for production with App Router
- **TypeScript**: Type-safe JavaScript for better code quality and maintainability
- **Tailwind CSS 4** (Latest): Utility-first CSS framework for rapid UI development
- **React Flow**: Powerful library for building node-based graphs and diagrams
- **Zustand**: Lightweight state management (installed but can be used for future enhancements)

### Why These Technologies?

- **Next.js 16**: Provides excellent developer experience, server-side rendering capabilities, and optimized performance out of the box
- **TypeScript**: Ensures type safety, reduces bugs, and improves code maintainability
- **Tailwind CSS 4**: Enables rapid UI development with utility classes and excellent customization options
- **React Flow**: Specialized library for building interactive node-based visualizations with built-in features like pan, zoom, and node interactions

## 📁 Project Structure

```
mindmap-ui/
├── app/
│   ├── layout.tsx          # Root layout with metadata
│   ├── page.tsx            # Main page component
│   └── globals.css         # Global styles
├── components/
│   ├── Mindmap.tsx         # Main mindmap component with all interactions
│   ├── MindmapNode.tsx     # Custom node component for React Flow
│   └── SidePanel.tsx       # Side panel for node details and editing
├── data/
│   └── mindmap.json        # Data file - modify this to update the mindmap
├── types/
│   └── mindmap.ts          # TypeScript type definitions
├── utils/
│   └── mindmapConverter.ts # Converts JSON data to React Flow format
└── README.md               # This file
```

## 📊 Data Structure

The mindmap is driven by a JSON file located at `data/mindmap.json`. The structure follows this format:

```typescript
interface MindmapNode {
  id: string;                    // Unique identifier
  label: string;                  // Display name
  summary: string;                // Quick info shown on hover
  description: string;            // Detailed description for side panel
  metadata?: {                    // Optional metadata
    inputs?: string[];
    outputs?: string[];
    notes?: string;
    tags?: string[];
    [key: string]: any;
  };
  children?: MindmapNode[];       // Child nodes (creates hierarchy)
  collapsed?: boolean;            // Initial collapse state (optional)
}
```

### Example Data Entry

```json
{
  "id": "react",
  "label": "React",
  "summary": "A JavaScript library for building user interfaces",
  "description": "React is a declarative, efficient, and flexible JavaScript library...",
  "metadata": {
    "tags": ["library", "ui"],
    "notes": "Most popular frontend library"
  },
  "children": [
    {
      "id": "hooks",
      "label": "React Hooks",
      "summary": "Functions that let you use state and lifecycle",
      "description": "..."
    }
  ]
}
```

## 🔄 Data Flow

1. **Data Loading**: The JSON file is imported in `app/page.tsx` and passed to the Mindmap component
2. **Conversion**: `mindmapConverter.ts` transforms the hierarchical JSON structure into React Flow nodes and edges
3. **Rendering**: React Flow renders the nodes and edges with custom styling
4. **Interactions**: User interactions (hover, click) update component state
5. **Updates**: When nodes are edited, the data structure is updated and the visualization re-renders

### How to Update the Mindmap

Simply edit `data/mindmap.json`:

- **Add a node**: Add a new entry to a `children` array
- **Update text**: Modify `label`, `summary`, or `description` fields
- **Change hierarchy**: Move nodes between different `children` arrays
- **Add metadata**: Add or modify fields in the `metadata` object

The visualization will automatically update when you refresh the page or when the component re-renders.

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the mindmap.

### Build for Production

```bash
npm run build
npm start
```

## 🎯 Usage Guide

### Exploring the Mindmap

1. **Hover** over nodes to see quick information
2. **Click** nodes to:
   - Expand/collapse children (if the node has children)
   - View detailed information in the side panel
   - Highlight related nodes
3. **Pan** by dragging the background
4. **Zoom** using mouse wheel or trackpad
5. **Use controls** in the top-left panel:
   - Fit to View: See all nodes at once
   - Reset View: Return to default position
   - Clear Selection: Remove highlights

### Editing Nodes

1. Click on a node to select it
2. The side panel will open on the right
3. Edit any field directly:
   - Label, Summary, Description
   - Tags (comma-separated)
   - Notes, Inputs, Outputs
4. Changes are applied immediately to the visualization

## 🏗️ Architecture

### Component Architecture

- **Mindmap Component**: Main orchestrator that:
  - Manages state (selected nodes, collapsed nodes, highlights)
  - Handles user interactions
  - Converts data to React Flow format
  - Renders the visualization

- **MindmapNode Component**: Custom React Flow node that:
  - Displays node information
  - Handles connection points
  - Applies styling based on state

- **SidePanel Component**: Provides:
  - Detailed node information display
  - Inline editing capabilities
  - Metadata management

### State Management

Currently using React's built-in state management (`useState`, `useMemo`, `useCallback`). The application is structured to easily integrate Zustand or other state management libraries if needed for more complex scenarios.

### Layout Algorithm

The layout uses a radial, hierarchical approach:
- Root node is centered
- First-level children are distributed in a circle around the root
- Deeper levels use a fan layout relative to their parent
- Spacing is automatically calculated to prevent overlaps

## 🎨 Customization

### Styling

- Modify Tailwind classes in components to change appearance
- Update node colors, sizes, and spacing in `MindmapNode.tsx`
- Adjust layout spacing in `mindmapConverter.ts` constants

### Layout

Modify the layout algorithm in `mindmapConverter.ts`:
- Change `HORIZONTAL_SPACING` and `VERTICAL_SPACING` constants
- Adjust the angle calculations for different distribution patterns
- Implement alternative layouts (tree, force-directed, etc.)

## 📝 Notes & Assumptions

### Assumptions Made

1. **Data Structure**: Assumes a single root node with hierarchical children
2. **Node IDs**: Must be unique across the entire tree
3. **Browser Support**: Modern browsers with ES6+ support
4. **Screen Size**: Optimized for desktop/laptop screens (responsive design can be added)

### Known Limitations

1. **No Persistence**: Edits are not saved to the JSON file automatically (would require backend or file system access)
2. **Layout**: Current layout works well for moderate-sized trees; very large trees may need optimization
3. **Mobile**: Touch interactions are supported but may need refinement for mobile devices

### Bonus Features Implemented

- **Export/Download Functionality**: Click "Export JSON" button to download the current mindmap data as a JSON file. This allows you to save your edits and share the data structure.

## 📄 License

This project is created as an assignment submission.

## 👤 Author

Created as part of a Frontend Development Internship assignment. by MANYA SHUKLA

---

**Note**: This is a frontend-only application. No backend is required. All data is loaded from the JSON file and managed in the browser.
