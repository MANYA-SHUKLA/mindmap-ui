'use client';

import { MindmapNode } from '@/types/mindmap';

interface SidePanelProps {
  selectedNode: MindmapNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<MindmapNode>) => void;
  onAddChildNode?: (parentId: string) => void;
  onDeleteNode?: (nodeId: string) => void;
  isRootNode?: boolean;
  onClose: () => void;
}

export default function SidePanel({
  selectedNode,
  onUpdateNode,
  onAddChildNode,
  onDeleteNode,
  isRootNode = false,
  onClose,
}: SidePanelProps) {
  if (!selectedNode) return null;

  const handleFieldUpdate = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, { [field]: value });
  };

  return (
    <div className="w-96 h-full overflow-y-auto animate-slide-in-right">
      <div className="h-full bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 dark:from-gray-900 dark:via-indigo-900/30 dark:to-purple-900/30 backdrop-blur-xl border-l border-white/20 dark:border-gray-700/50 shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Node Details
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-2"></div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 hover:from-red-100 hover:to-red-200 dark:hover:from-red-900 dark:hover:to-red-800 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-2xl font-light flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:rotate-90"
            >
              ×
            </button>
          </div>

          <div className="space-y-6 animate-fade-in">
            {/* Label */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                Label
              </label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={(e) => handleFieldUpdate('label', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Summary */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-indigo-600 transition-colors">
                Summary (Hover Info)
              </label>
              <textarea
                value={selectedNode.summary}
                onChange={(e) => handleFieldUpdate('summary', e.target.value)}
                rows={2}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md resize-none text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Description */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-indigo-600 transition-colors">
                Description
              </label>
              <textarea
                value={selectedNode.description}
                onChange={(e) => handleFieldUpdate('description', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md resize-none text-gray-900 dark:text-gray-100"
              />
            </div>

            {/* Metadata */}
            {selectedNode.metadata && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/30 dark:to-purple-900/30 rounded-xl p-5 border border-indigo-100/50 dark:border-indigo-800/50">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent mb-4">
                  Metadata
                </h3>

                {/* Tags */}
                {selectedNode.metadata.tags && (
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Tags (comma-separated)
                    </label>
                    <input
                      type="text"
                      value={selectedNode.metadata.tags.join(', ')}
                      onChange={(e) =>
                        handleFieldUpdate('metadata', {
                          ...selectedNode.metadata,
                          tags: e.target.value.split(',').map((t) => t.trim()),
                        })
                      }
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}

                {/* Notes */}
                {selectedNode.metadata.notes && (
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Notes
                    </label>
                    <textarea
                      value={selectedNode.metadata.notes}
                      onChange={(e) =>
                        handleFieldUpdate('metadata', {
                          ...selectedNode.metadata,
                          notes: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-300 hover:shadow-md resize-none"
                    />
                  </div>
                )}

                {/* Inputs */}
                {selectedNode.metadata.inputs && (
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Inputs
                    </label>
                    <input
                      type="text"
                      value={selectedNode.metadata.inputs.join(', ')}
                      onChange={(e) =>
                        handleFieldUpdate('metadata', {
                          ...selectedNode.metadata,
                          inputs: e.target.value.split(',').map((t) => t.trim()),
                        })
                      }
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}

                {/* Outputs */}
                {selectedNode.metadata.outputs && (
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      Outputs
                    </label>
                    <input
                      type="text"
                      value={selectedNode.metadata.outputs.join(', ')}
                      onChange={(e) =>
                        handleFieldUpdate('metadata', {
                          ...selectedNode.metadata,
                          outputs: e.target.value.split(',').map((t) => t.trim()),
                        })
                      }
                      className="w-full px-4 py-2.5 border-2 border-gray-200 dark:border-gray-700 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600 hover:shadow-md text-gray-900 dark:text-gray-100"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Node Actions */}
            <div className="pt-5 mt-5 border-t-2 border-indigo-200 dark:border-indigo-700 space-y-3">
              <div className="flex gap-3">
                {onAddChildNode && (
                  <button
                    onClick={() => {
                      onAddChildNode(selectedNode.id);
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 hover:from-emerald-600 hover:to-teal-600 active:scale-95 flex items-center justify-center gap-2"
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Child
                  </button>
                )}
                {onDeleteNode && !isRootNode && (
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this node and all its children?')) {
                        onDeleteNode(selectedNode.id);
                        onClose();
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 hover:from-red-600 hover:to-pink-600 active:scale-95 flex items-center justify-center gap-2"
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
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                    Delete
                  </button>
                )}
              </div>
            </div>

            {/* Node Info */}
            <div className="pt-5 mt-5 border-t-2 border-indigo-200 dark:border-indigo-700 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl p-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-indigo-700 dark:text-indigo-400">Node ID:</span>{' '}
                  <span className="font-mono text-xs bg-white/60 dark:bg-gray-800/60 px-2 py-1 rounded border border-indigo-200 dark:border-indigo-700 text-gray-900 dark:text-gray-100">
                    {selectedNode.id}
                  </span>
                </p>
                {selectedNode.children && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-semibold text-purple-700 dark:text-purple-400">Children:</span>{' '}
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-xs font-bold shadow-md">
                      {selectedNode.children.length}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
