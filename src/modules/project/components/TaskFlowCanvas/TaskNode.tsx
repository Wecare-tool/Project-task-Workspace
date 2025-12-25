import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { FileText, Trash2 } from 'lucide-react';

export interface TaskNodeData extends Record<string, unknown> {
    label: string;
    taskTypeId: string;
    onRemove?: (taskTypeId: string) => void;
}

export const TaskNode = memo(({ data, selected }: NodeProps) => {
    const nodeData = data as TaskNodeData;

    const handleRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        nodeData.onRemove?.(nodeData.taskTypeId);
    };

    return (
        <div
            className={`
                relative px-4 py-3 rounded-lg border-2 bg-white shadow-md min-w-[160px]
                transition-all duration-200
                ${selected
                    ? 'border-primary-500 shadow-lg ring-2 ring-primary-200'
                    : 'border-neutral-200 hover:border-primary-300 hover:shadow-lg'}
            `}
        >
            {/* Remove Button - shown when selected */}
            {selected && (
                <div className="absolute -top-9 left-1/2 -translate-x-1/2 z-10">
                    <button
                        onClick={handleRemove}
                        className="p-2 bg-white border border-red-200 rounded-lg shadow-lg hover:bg-red-50 text-red-600 transition-colors"
                        title="Remove from Project"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Input Handle */}
            <Handle
                type="target"
                position={Position.Left}
                className="!w-3 !h-3 !bg-neutral-400 !border-2 !border-white"
            />

            {/* Content */}
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-50 rounded-md text-primary-600">
                    <FileText className="w-4 h-4" />
                </div>
                <span className="font-medium text-sm text-neutral-800 pr-2">
                    {nodeData.label}
                </span>
            </div>

            {/* Output Handles - Success (top-right) and Fail (bottom-right) */}
            <Handle
                type="source"
                position={Position.Right}
                id="success"
                className="!w-3 !h-3 !bg-green-500 !border-2 !border-white !top-1/3"
                title="On Success"
            />
            <Handle
                type="source"
                position={Position.Right}
                id="fail"
                className="!w-3 !h-3 !bg-red-500 !border-2 !border-white !top-2/3"
                title="On Fail"
            />
        </div>
    );
});

TaskNode.displayName = 'TaskNode';

