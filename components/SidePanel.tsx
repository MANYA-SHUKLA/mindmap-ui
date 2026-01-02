'use client';

import { MindmapNode } from '@/types/mindmap';

interface SidePanelProps {
  selectedNode: MindmapNode | null;
  onUpdateNode: (nodeId: string, updates: Partial<MindmapNode>) => void;
  onClose: () => void;
}

export default function SidePanel({
  selectedNode,
  onUpdateNode,
  onClose,
}: SidePanelProps) {
  if (!selectedNode) return null;

  const handleFieldUpdate = (field: string, value: any) => {
    onUpdateNode(selectedNode.id, { [field]: value });
  };

  return (
    <div className="w-96 h-full overflow-y-auto animate-slide-in-right">
      <div className="h-full bg-gradient-to-br from-white via-indigo-50/30 to-purple-50/30 backdrop-blur-xl border-l border-white/20 shadow-2xl">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Node Details
              </h2>
              <div className="h-1 w-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full mt-2"></div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 hover:from-red-100 hover:to-red-200 text-gray-600 hover:text-red-600 text-2xl font-light flex items-center justify-center transition-all duration-200 hover:scale-110 hover:shadow-lg hover:rotate-90"
            >
              ×
            </button>
          </div>

          <div className="space-y-6 animate-fade-in">
            {/* Label */}
            <div className="group">
              <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-indigo-600 transition-colors">
                Label
              </label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={(e) => handleFieldUpdate('label', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-300 hover:shadow-md"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-300 hover:shadow-md resize-none"
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
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-300 hover:shadow-md resize-none"
              />
            </div>

            {/* Metadata */}
            {selectedNode.metadata && (
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 rounded-xl p-5 border border-indigo-100/50">
                <h3 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-4">
                  Metadata
                </h3>

                {/* Tags */}
                {selectedNode.metadata.tags && (
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-indigo-600 transition-colors">
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
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-300 hover:shadow-md"
                    />
                  </div>
                )}

                {/* Notes */}
                {selectedNode.metadata.notes && (
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-indigo-600 transition-colors">
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
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-indigo-600 transition-colors">
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
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-300 hover:shadow-md"
                    />
                  </div>
                )}

                {/* Outputs */}
                {selectedNode.metadata.outputs && (
                  <div className="mb-4 group">
                    <label className="block text-sm font-semibold text-gray-700 mb-2 group-hover:text-indigo-600 transition-colors">
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
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400 transition-all duration-200 hover:border-indigo-300 hover:shadow-md"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Node Info */}
            <div className="pt-5 mt-5 border-t-2 border-indigo-200 bg-gradient-to-r from-indigo-50/30 to-purple-50/30 rounded-xl p-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-indigo-700">Node ID:</span>{' '}
                  <span className="font-mono text-xs bg-white/60 px-2 py-1 rounded border border-indigo-200">
                    {selectedNode.id}
                  </span>
                </p>
                {selectedNode.children && (
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold text-purple-700">Children:</span>{' '}
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
