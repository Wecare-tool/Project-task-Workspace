import { memo } from 'react';
import {
    BaseEdge,
    EdgeLabelRenderer,
    getBezierPath,
} from '@xyflow/react';
import type { EdgeProps } from '@xyflow/react';
import { X } from 'lucide-react';

export interface FlowEdgeData extends Record<string, unknown> {
    outcome: 'success' | 'fail';
    onDelete?: (id: string) => void;
}

export const FlowEdge = memo(({
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
}: EdgeProps) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });

    const edgeData = data as FlowEdgeData | undefined;
    const isSuccess = edgeData?.outcome === 'success';

    const strokeColor = isSuccess ? '#22c55e' : '#ef4444';

    return (
        <>
            <BaseEdge
                path={edgePath}
                style={{
                    stroke: strokeColor,
                    strokeWidth: selected ? 3 : 2,
                    strokeDasharray: isSuccess ? undefined : '5 5',
                }}
                interactionWidth={20}
            />

            {/* Animated dot for success paths */}
            {isSuccess && (
                <circle r="4" fill={strokeColor}>
                    <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
                </circle>
            )}

            <EdgeLabelRenderer>
                <div
                    className="nodrag nopan absolute pointer-events-auto"
                    style={{
                        transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
                    }}
                >
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            edgeData?.onDelete?.(id);
                        }}
                        className={`
                            p-1.5 rounded-full bg-white border shadow-sm
                            hover:bg-red-50 hover:border-red-200 hover:text-red-500
                            transition-all opacity-0 hover:opacity-100
                            ${selected ? 'opacity-100' : ''}
                        `}
                        style={{ borderColor: strokeColor }}
                        title="Remove connection"
                    >
                        <X className="w-3 h-3" />
                    </button>
                </div>
            </EdgeLabelRenderer>
        </>
    );
});

FlowEdge.displayName = 'FlowEdge';
