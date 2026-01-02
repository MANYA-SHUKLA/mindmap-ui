'use client';

import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';

interface NodeData {
  label: string;
  summary: string;
  description: string;
  metadata?: any;
  originalNode: any;
  isHighlighted?: boolean;
  isHovered?: boolean;
  isSelected?: boolean;
}

function MindmapNodeComponent({ data, selected }: NodeProps<NodeData>) {
  const isHighlighted = data.isHighlighted || false;
  const isHovered = data.isHovered || false;
  const isSelected = data.isSelected || selected || false;

  return (
    <div
      className={`group relative px-5 py-4 rounded-xl min-w-[200px] transition-all duration-300 ease-out
        ${
          isSelected
            ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/50 scale-110 border-2 border-white/50'
            : isHighlighted
            ? 'bg-gradient-to-br from-indigo-400/90 via-purple-400/90 to-pink-400/90 text-white shadow-xl shadow-purple-400/40 scale-105 border-2 border-white/30'
            : 'bg-gradient-to-br from-white/95 to-indigo-50/95 text-gray-800 shadow-lg shadow-indigo-200/30 border-2 border-indigo-200/50'
        }
        ${isHovered && !isSelected ? 'scale-105 shadow-xl shadow-indigo-300/50 border-indigo-400' : ''}
        hover:scale-110 hover:shadow-2xl hover:shadow-purple-400/50 hover:border-indigo-400/80
        backdrop-blur-sm
      `}
      style={{
        animation: isSelected ? 'glow 2s ease-in-out infinite' : undefined,
      }}
    >
      {/* Glow effect on hover */}
      <div
        className={`absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
          isSelected
            ? 'bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 blur-xl'
            : 'bg-gradient-to-br from-indigo-300 via-purple-300 to-pink-300 blur-xl'
        } -z-10`}
      />

      <Handle
        type="target"
        position={Position.Top}
        className="!w-4 !h-4 !bg-gradient-to-br !from-indigo-400 !to-purple-500 !border-2 !border-white !opacity-80 hover:!opacity-100 hover:!scale-125 transition-all duration-200"
        style={{ top: -8 }}
      />
      
      <div className="text-center relative z-10">
        <div
          className={`font-bold text-sm mb-2 transition-all duration-200 ${
            isSelected || isHighlighted
              ? 'text-white drop-shadow-lg'
              : 'text-gray-800 group-hover:text-indigo-700'
          }`}
        >
          {data.label}
        </div>
        
        {data.metadata?.tags && (
          <div className="flex flex-wrap gap-1.5 justify-center">
            {data.metadata.tags.slice(0, 2).map((tag: string, index: number) => (
              <span
                key={tag}
                className={`text-xs px-2.5 py-1 rounded-full font-medium transition-all duration-200 ${
                  isSelected || isHighlighted
                    ? 'bg-white/30 text-white backdrop-blur-sm border border-white/40'
                    : 'bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 border border-indigo-200/50'
                } group-hover:scale-110 group-hover:shadow-md`}
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-4 !h-4 !bg-gradient-to-br !from-purple-400 !to-pink-500 !border-2 !border-white !opacity-80 hover:!opacity-100 hover:!scale-125 transition-all duration-200"
        style={{ bottom: -8 }}
      />

      {/* Animated border on selection */}
      {isSelected && (
        <div className="absolute inset-0 rounded-xl border-2 border-white/60 animate-pulse-slow pointer-events-none" />
      )}
    </div>
  );
}

export default memo(MindmapNodeComponent);

