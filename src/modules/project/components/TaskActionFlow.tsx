import { useState, useMemo } from 'react';
import { useDataverse } from '@stores/dataverseStore';
import { Button } from '@components/ui';
import { Plus, Trash2 } from 'lucide-react';


interface Props {
    taskTypeId: string;
}

export function TaskActionFlow({ taskTypeId }: Props) {
    const {
        actionTypeNews,
        taskTypeActions,
        createTaskTypeAction,
        deactivateTaskTypeAction,
        refreshTaskTypeActions, // kept for side effects
    } = useDataverse();

    const [draggingId, setDraggingId] = useState<string | null>(null);

    // Get actions for this task type
    const currentActions = useMemo(() =>
        taskTypeActions
            .filter(a => a.taskTypeId === taskTypeId)
            .sort((a, b) => a.order - b.order),
        [taskTypeActions, taskTypeId]
    );

    // Get name helper
    const getActionTypeName = (id: string) => actionTypeNews.find(a => a.id === id)?.name || 'Unknown Action';

    const handleDragStart = (e: React.DragEvent, id: string, type: 'source' | 'item') => {
        e.dataTransfer.setData('type', type);
        e.dataTransfer.setData('id', id);
        setDraggingId(id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        const id = e.dataTransfer.getData('id');
        setDraggingId(null);

        if (type === 'source') {
            // Add new action
            try {
                await createTaskTypeAction({
                    crdfd_name: `${getActionTypeName(id)}`,
                    'crdfd_TaskType@odata.bind': `/crdfd_task_types(${taskTypeId})`,
                    'crdfd_ActionType@odata.bind': `/central_actiontypes(${id})`,
                    crdfd_stt: currentActions.length + 1,
                    crdfd_incharge: 'User', // Default or selector
                    crdfd_duration: 1
                });
                await refreshTaskTypeActions();
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleRemove = async (id: string) => {
        if (confirm('Are you sure you want to remove this action?')) {
            await deactivateTaskTypeAction(id);
        }
    };

    return (
        <div className="h-full grid grid-cols-12 gap-4">
            {/* Library (Source) */}
            <div className="col-span-4 border-r pr-4 flex flex-col h-full bg-neutral-50/50 rounded-lg p-3">
                <h4 className="font-semibold text-sm mb-3 text-neutral-700">Action Library</h4>
                <div className="flex-1 overflow-y-auto space-y-2">
                    {actionTypeNews.map(action => (
                        <div
                            key={action.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, action.id, 'source')}
                            className="p-3 bg-white border border-neutral-200 rounded-md shadow-sm cursor-move hover:border-primary-300 hover:shadow-md transition-all flex items-center justify-between group"
                        >
                            <span className="text-sm font-medium text-neutral-800">{action.name}</span>
                            <Plus className="w-4 h-4 text-neutral-400 group-hover:text-primary-500" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Flow (Target) */}
            <div className="col-span-8 flex flex-col h-full">
                <h4 className="font-semibold text-sm mb-3 text-neutral-700">Action Execution Flow</h4>
                <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`flex-1 border-2 border-dashed rounded-lg p-4 transition-colors overflow-y-auto space-y-2 ${draggingId ? 'border-primary-300 bg-primary-50/30' : 'border-neutral-200 bg-white'
                        }`}
                >
                    {currentActions.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-neutral-400">
                            <span className="mb-2">Drag actions here to build the flow</span>
                        </div>
                    ) : (
                        currentActions.map((action, index) => (
                            <div
                                key={action.id}
                                className="p-3 bg-white border border-neutral-200 rounded-md shadow-sm flex items-center gap-3 relative group"
                            >
                                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-neutral-100 text-xs font-bold text-neutral-600">
                                    {index + 1}
                                </div>
                                <div className="flex-1">
                                    <span className="block text-sm font-medium text-neutral-900">
                                        {getActionTypeName(action.actionTypeId)}
                                    </span>
                                    {action.duration && (
                                        <span className="text-xs text-neutral-500">Duration: {action.duration}h</span>
                                    )}
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleRemove(action.id)}
                                    className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
