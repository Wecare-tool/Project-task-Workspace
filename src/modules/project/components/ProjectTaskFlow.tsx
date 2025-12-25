import { useState, useMemo } from 'react';
import { useDataverse } from '@stores/dataverseStore';
import { ArrowRight, Trash2, CheckCircle2, XCircle, GitBranch } from 'lucide-react';
import { DependencyOutcome } from '@services/dataverseTypes';
import { toast } from 'react-hot-toast';

interface Props {
    projectId: string;
}

export function ProjectTaskFlow({ projectId }: Props) {
    const {
        taskTypes,
        eventTypeTaskTypeMappings,
        taskDependencies,
        createTaskDependency,
        deactivateTaskDependency,
        refreshTaskDependencies
    } = useDataverse();

    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [selectedParentId, setSelectedParentId] = useState<string | null>(null);

    // Get all Task Types in this Project
    const projectTaskTypes = useMemo(() => {
        const projectMappings = eventTypeTaskTypeMappings.filter(m => m.projectId === projectId);
        return taskTypes
            .filter(t => projectMappings.some(m => m.taskTypeId === t.id))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [taskTypes, eventTypeTaskTypeMappings, projectId]);

    // Get dependencies for selected parent task
    const existingDependencies = useMemo(() =>
        selectedParentId ? taskDependencies.filter(d => d.parentTaskId === selectedParentId) : [],
        [taskDependencies, selectedParentId]
    );

    const onDoneDependencies = existingDependencies.filter(d => d.outcomeCode === DependencyOutcome.Done);
    const onFailDependencies = existingDependencies.filter(d => d.outcomeCode === DependencyOutcome.Fail);

    // Available tasks for dragging (exclude selected parent)
    const availableTasks = useMemo(() =>
        projectTaskTypes.filter(t => t.id !== selectedParentId),
        [projectTaskTypes, selectedParentId]
    );

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

        if (!droppedTaskTypeId || !selectedParentId) return;

        const exists = existingDependencies.some(d =>
            d.childTaskId === droppedTaskTypeId && d.outcomeCode === outcome
        );

        if (exists) {
            toast.error('This dependency already exists');
            return;
        }

        try {
            await createTaskDependency({
                crdfd_name: `Dep: ${selectedParentId}->${droppedTaskTypeId} (${outcome})`,
                'cr1bb_ParentTask@odata.bind': `/crdfd_task_types(${selectedParentId})`,
                'cr1bb_ChildTask@odata.bind': `/crdfd_task_types(${droppedTaskTypeId})`,
                crdfd_outcome: outcome,
            });
            await refreshTaskDependencies();
            toast.success('Dependency added');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add dependency');
        }
    };

    const handleRemove = async (id: string) => {
        if (confirm('Remove this dependency?')) {
            await deactivateTaskDependency(id);
            toast.success('Dependency removed');
        }
    };

    const getTaskName = (id: string) => taskTypes.find(t => t.id === id)?.name || 'Unknown Task';

    return (
        <div className="h-full flex gap-4 p-2">
            {/* Left Panel: Task List */}
            <div className="w-[400px] shrink-0 border rounded-lg bg-neutral-50 flex flex-col">
                <div className="p-3 border-b">
                    <h3 className="text-sm font-semibold text-neutral-900 flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Project Tasks
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">Select a task to define its flow</p>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {projectTaskTypes.map(task => (
                        <div
                            key={task.id}
                            onClick={() => setSelectedParentId(task.id)}
                            className={`
                                p-3 rounded-md cursor-pointer transition-all border
                                ${selectedParentId === task.id
                                    ? 'bg-white border-primary-200 shadow-sm ring-1 ring-primary-100'
                                    : 'border-transparent hover:bg-white hover:border-neutral-200'}
                            `}
                        >
                            <span className={`text-sm font-medium ${selectedParentId === task.id ? 'text-primary-700' : 'text-neutral-700'}`}>
                                {task.name}
                            </span>
                        </div>
                    ))}
                    {projectTaskTypes.length === 0 && (
                        <div className="text-center py-8 text-neutral-400 text-sm">
                            No tasks in this project
                        </div>
                    )}
                </div>
            </div>

            {/* Center Panel: Flow Configuration */}
            {selectedParentId ? (
                <div className="flex-1 flex flex-col gap-4">
                    <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
                        <h3 className="text-lg font-semibold text-primary-900">
                            {getTaskName(selectedParentId)}
                        </h3>
                        <p className="text-sm text-primary-700">Define what happens after this task</p>
                    </div>

                    <div className="flex-1 grid grid-rows-2 gap-4">
                        {/* Success Path */}
                        <div
                            className={`flex flex-col border rounded-lg p-4 transition-colors ${draggingId ? 'bg-green-50/50 border-green-200' : 'bg-white border-neutral-200'}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, DependencyOutcome.Done)}
                        >
                            <h4 className="font-semibold text-sm mb-3 text-green-700 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                If Task Succeeds → Next Tasks
                            </h4>

                            <div className="flex-1 flex flex-wrap gap-2 min-h-[80px]">
                                {onDoneDependencies.length === 0 ? (
                                    <div className="w-full flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-md p-4 text-neutral-400 text-sm">
                                        Drag tasks here
                                    </div>
                                ) : (
                                    onDoneDependencies.map(dep => (
                                        <div key={dep.id} className="flex items-center gap-2 p-2 bg-white border border-green-100 shadow-sm rounded-md group">
                                            <ArrowRight className="w-3 h-3 text-green-500" />
                                            <span className="text-sm font-medium text-neutral-800">{getTaskName(dep.childTaskId)}</span>
                                            <button
                                                onClick={() => handleRemove(dep.id)}
                                                className="text-neutral-400 hover:text-red-500 ml-1"
                                                title="Remove dependency"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Failure Path */}
                        <div
                            className={`flex flex-col border rounded-lg p-4 transition-colors ${draggingId ? 'bg-red-50/50 border-red-200' : 'bg-white border-neutral-200'}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, DependencyOutcome.Fail)}
                        >
                            <h4 className="font-semibold text-sm mb-3 text-red-700 flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                If Task Fails → Fallback Tasks
                            </h4>

                            <div className="flex-1 flex flex-wrap gap-2 min-h-[80px]">
                                {onFailDependencies.length === 0 ? (
                                    <div className="w-full flex items-center justify-center border-2 border-dashed border-neutral-200 rounded-md p-4 text-neutral-400 text-sm">
                                        Drag fallback tasks here
                                    </div>
                                ) : (
                                    onFailDependencies.map(dep => (
                                        <div key={dep.id} className="flex items-center gap-2 p-2 bg-white border border-red-100 shadow-sm rounded-md group">
                                            <ArrowRight className="w-3 h-3 text-red-500" />
                                            <span className="text-sm font-medium text-neutral-800">{getTaskName(dep.childTaskId)}</span>
                                            <button
                                                onClick={() => handleRemove(dep.id)}
                                                className="text-neutral-400 hover:text-red-500 ml-1"
                                                title="Remove dependency"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
                    <GitBranch className="w-12 h-12 opacity-30 mb-4" />
                    <p className="font-medium text-neutral-600">Select a Task</p>
                    <p className="text-sm">Choose a task from the left to define its flow</p>
                </div>
            )}

            {/* Right Panel: Available Tasks to Drag */}
            {selectedParentId && (
                <div className="w-1/4 border rounded-lg bg-neutral-50 flex flex-col">
                    <div className="p-3 border-b">
                        <h3 className="text-sm font-semibold text-neutral-900">Available Tasks</h3>
                        <p className="text-xs text-neutral-500 mt-1">Drag to add as dependency</p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-2">
                        {availableTasks.map(task => (
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
                        {availableTasks.length === 0 && (
                            <div className="text-center text-sm text-neutral-400 py-8">
                                No other tasks available
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
