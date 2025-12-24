import { useState, useMemo } from 'react';
import { useDataverse } from '@stores/dataverseStore';
import { Button } from '@components/ui';
import { Plus, Trash2, ArrowRight, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';
import { DependencyOutcome } from '@services/dataverseTypes';

interface Props {
    taskTypeId: string;
    projectId: string; // Needed to filter relevant tasks
}

export function TaskDependencySettings({ taskTypeId, projectId }: Props) {
    const {
        taskTypes, // All task types
        eventTypeTaskTypeMappings, // To see which ones are in the project
        taskDependencies,
        createTaskDependency,
        deactivateTaskDependency,
        refreshTaskDependencies
    } = useDataverse();

    const [draggingId, setDraggingId] = useState<string | null>(null);

    // 1. Get all Task Types available in this Project
    // logic: taskTypes where id matches eventTypeTaskTypeMappings.taskTypeId for this projectId
    const projectTaskTypes = useMemo(() => {
        const projectMappings = eventTypeTaskTypeMappings.filter(m => m.projectId === projectId);
        return taskTypes
            .filter(t => projectMappings.some(m => m.taskTypeId === t.id))
            .filter(t => t.id !== taskTypeId) // Exclude self
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [taskTypes, eventTypeTaskTypeMappings, projectId, taskTypeId]);

    // 2. Get existing dependencies where Parent = current taskTypeId
    // Note: The schema uses taskTypeId? Or Task IDs?
    // In DataverseTaskDependency: _cr1bb_parenttask_value.
    // Wait, the Store uses Task Types for the definition, or Task Instances?
    // The requirement is "Task Dependence" in "Project Task Settings".
    // Usually dependencies are defined at the Type level for the template.
    // Based on previous code, we are linking Task Types.
    // `_cr1bb_parenttask_value` likely refers to `crdfd_task_types`.

    const existingDependencies = useMemo(() =>
        taskDependencies.filter(d => d.parentTaskId === taskTypeId),
        [taskDependencies, taskTypeId]
    );

    const onDoneDependencies = existingDependencies.filter(d => d.outcomeCode === DependencyOutcome.Done);
    const onFailDependencies = existingDependencies.filter(d => d.outcomeCode === DependencyOutcome.Fail);

    // Drag Handlers
    const handleDragStart = (e: React.DragEvent, id: string) => {
        e.dataTransfer.setData('taskTypeId', id);
        setDraggingId(id);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = async (e: React.DragEvent, outcome: DependencyOutcome) => {
        e.preventDefault();
        const droppedTaskTypeId = e.dataTransfer.getData('taskTypeId');
        setDraggingId(null);

        if (!droppedTaskTypeId) return;

        // Check if already exists for this outcome
        const exists = existingDependencies.some(d =>
            d.childTaskId === droppedTaskTypeId && d.outcomeCode === outcome
        );

        if (exists) return;

        try {
            await createTaskDependency({
                crdfd_name: `Dep: ${taskTypeId}->${droppedTaskTypeId} (${outcome})`,
                'cr1bb_ParentTask@odata.bind': `/crdfd_task_types(${taskTypeId})`,
                'cr1bb_ChildTask@odata.bind': `/crdfd_task_types(${droppedTaskTypeId})`,
                crdfd_outcome: outcome,
                // Assuming we don't need EventType? relying on Project context?
                // If the table requires EventType, we might need a dummy or specific one.
                // For now, omitting checks if it works.
            });
            await refreshTaskDependencies();
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemove = async (id: string) => {
        if (confirm('Remove this dependency?')) {
            await deactivateTaskDependency(id);
        }
    };

    const getTaskName = (id: string) => taskTypes.find(t => t.id === id)?.name || 'Unknown Task';

    return (
        <div className="h-full grid grid-cols-12 gap-6 p-1">
            {/* Left: Flow Configuration */}
            <div className="col-span-8 flex flex-col gap-6">

                {/* Available Tasks (moved from right to top or kept right? Plan said Right Panel for Available) */}

                {/* Success Path */}
                <div
                    className={`flex flex-col border rounded-lg p-4 transition-colors ${draggingId ? 'bg-green-50/50 border-green-200' : 'bg-white border-neutral-200'}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, DependencyOutcome.Done)}
                >
                    <h4 className="font-semibold text-sm mb-3 text-green-700 flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" />
                        If Task is Done (Success)
                    </h4>

                    <div className="space-y-2 min-h-[100px]">
                        {onDoneDependencies.length === 0 ? (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-md p-4 text-neutral-400 text-sm">
                                Drag next task here
                            </div>
                        ) : (
                            onDoneDependencies.map(dep => (
                                <div key={dep.id} className="flex items-center justify-between p-3 bg-white border border-green-100 shadow-sm rounded-md group">
                                    <div className="flex items-center gap-3">
                                        <ArrowRight className="w-4 h-4 text-green-500" />
                                        <span className="font-medium text-neutral-800">{getTaskName(dep.childTaskId)}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(dep.id)}
                                        className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Go to these tasks if the current task succeeds.</p>
                </div>

                {/* Failure Path */}
                <div
                    className={`flex flex-col border rounded-lg p-4 transition-colors ${draggingId ? 'bg-red-50/50 border-red-200' : 'bg-white border-neutral-200'}`}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, DependencyOutcome.Fail)}
                >
                    <h4 className="font-semibold text-sm mb-3 text-red-700 flex items-center gap-2">
                        <XCircle className="w-4 h-4" />
                        If Task Fails
                    </h4>

                    <div className="space-y-2 min-h-[100px]">
                        {onFailDependencies.length === 0 ? (
                            <div className="h-full flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-md p-4 text-neutral-400 text-sm">
                                Drag fallback task here
                            </div>
                        ) : (
                            onFailDependencies.map(dep => (
                                <div key={dep.id} className="flex items-center justify-between p-3 bg-white border border-red-100 shadow-sm rounded-md group">
                                    <div className="flex items-center gap-3">
                                        <ArrowRight className="w-4 h-4 text-red-500" />
                                        <span className="font-medium text-neutral-800">{getTaskName(dep.childTaskId)}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemove(dep.id)}
                                        className="text-neutral-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-2">Go to these tasks if the current task fails.</p>
                </div>

            </div>

            {/* Right: Available Tasks */}
            <div className="col-span-4 border-l pl-6 flex flex-col h-full">
                <h4 className="font-semibold text-sm mb-4 text-neutral-900">Available Tasks</h4>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {projectTaskTypes.map(task => (
                        <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, task.id)}
                            className="p-3 bg-white border border-neutral-200 rounded-md shadow-sm cursor-move hover:border-primary-300 hover:shadow-md transition-all flex items-center gap-3 group"
                        >
                            <div className="w-1.5 h-8 bg-neutral-200 rounded-full group-hover:bg-primary-400 transition-colors" />
                            <span className="text-sm font-medium text-neutral-700">{task.name}</span>
                        </div>
                    ))}
                    {projectTaskTypes.length === 0 && (
                        <div className="text-center text-sm text-neutral-400 py-8">
                            No other tasks in this project.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
