import { useState, useMemo } from 'react';
import { useDataverse } from '@stores/dataverseStore';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent, Input, Textarea } from '@components/ui';
import { Plus, Search, Trash2, Settings, FileText } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { TaskTypeAttributeSettings } from '@modules/task-type/TaskTypeAttributeSettings';
import { TaskActionFlow } from './TaskActionFlow';
import { Modal, FormBuilder } from '@components/shared';
import { taskTypeSchema, taskTypeFormFields } from '@modules/task-type/schema';

interface Props {
    projectId: string;
}

export function ProjectTaskSettings({ projectId }: Props) {
    const {
        taskTypes,
        projects,
        eventTypeTaskTypeMappings,
        taskTypeAttributeMappings,
        taskTypeAttributes, // Keep attributes logic as is
        createEventTypeTaskTypeMapping,
        deactivateEventTypeTaskTypeMapping,
        createTaskType,
        batchUpdateTaskTypeAttributeMappings,
        updateProject,
        updateEventTypeTaskTypeMapping,
        isLoading
    } = useDataverse();

    const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [quickAddSearch, setQuickAddSearch] = useState('');
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

    // Get Project
    const project = useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);

    // Mappings for this project (using EventTypeTaskTypeMapping table)
    const currentMappings = useMemo(() =>
        eventTypeTaskTypeMappings.filter(m => m.projectId === projectId),
        [eventTypeTaskTypeMappings, projectId]
    );

    // Task Types in this project
    const projectTaskTypes = useMemo(() =>
        taskTypes
            .filter(t => currentMappings.some(m => m.taskTypeId === t.id))
            .sort((a, b) => a.name.localeCompare(b.name)),
        [taskTypes, currentMappings]
    );


    // Selected Task Type Object
    const selectedTaskType = useMemo(() =>
        taskTypes.find(t => t.id === selectedTaskTypeId),
        [taskTypes, selectedTaskTypeId]
    );

    // All Task Types with added status
    const allTaskTypesWithStatus = useMemo(() =>
        taskTypes
            .map(t => ({
                ...t,
                isAdded: currentMappings.some(m => m.taskTypeId === t.id)
            }))
            .sort((a, b) => a.name.localeCompare(b.name)),
        [taskTypes, currentMappings]
    );


    // Filtered Quick Add Options (only show available, not added)
    const quickAddOptions = useMemo(() => {
        return allTaskTypesWithStatus
            .filter(t => !t.isAdded && (quickAddSearch ? t.name.toLowerCase().includes(quickAddSearch.toLowerCase()) : true));
    }, [allTaskTypesWithStatus, quickAddSearch]);

    const [optimisticSelectedIds, setOptimisticSelectedIds] = useState<string[] | null>(null);

    // Derived selected attribute IDs for the component
    // If we have an optimistic state, use it. Otherwise fall back to store data.
    const selectedAttributeIds = useMemo(() => {
        if (optimisticSelectedIds !== null) return optimisticSelectedIds;

        if (!selectedTaskTypeId) return [];
        return taskTypeAttributeMappings
            .filter(m => m.taskTypeId === selectedTaskTypeId && m.isVisible)
            .map(m => m.attributeId);
    }, [selectedTaskTypeId, taskTypeAttributeMappings, optimisticSelectedIds]);

    // Reset optimistic state when switching task types
    useMemo(() => {
        setOptimisticSelectedIds(null);
    }, [selectedTaskTypeId]);

    // Get current mapping for selected task
    const selectedMapping = useMemo(() =>
        currentMappings.find(m => m.taskTypeId === selectedTaskTypeId),
        [currentMappings, selectedTaskTypeId]
    );

    // Attribute Settings Logic - Optimized
    const handleAttributeSelectionChange = async (newSelectedIds: string[]) => {
        if (!selectedTaskTypeId) return;

        // 1. Optimistic Update
        setOptimisticSelectedIds(newSelectedIds);

        try {
            const currentAttrMappings = taskTypeAttributeMappings.filter(m => m.taskTypeId === selectedTaskTypeId);

            const updates: { id: string; data: Partial<any> }[] = [];
            const creates: Partial<any>[] = [];

            // Identify changes needed
            // A. Check for attributes that need to be made VISIBLE (in newSelectedIds)
            for (const attrId of newSelectedIds) {
                const mapping = currentAttrMappings.find(m => m.attributeId === attrId);
                if (mapping) {
                    // Already mapped, check if hidden
                    if (!mapping.isVisible) {
                        updates.push({ id: mapping.id, data: { crdfd_taskinstanceuxvisible: true } });
                    }
                } else {
                    // Not mapped, need to create
                    const attr = taskTypeAttributes.find(a => a.id === attrId);
                    if (attr) {
                        creates.push({
                            crdfd_name: `${selectedTaskType?.name}-${attr.name}`,
                            'crdfd_Tasktype@odata.bind': `/crdfd_task_types(${selectedTaskTypeId})`,
                            'crdfd_Attribute@odata.bind': `/crdfd_tasktypeattributes(${attr.id})`,
                            crdfd_taskinstanceuxvisible: true
                        });
                    }
                }
            }

            // B. Check for attributes that need to be HIDDEN (not in newSelectedIds)
            // We only care about existing visible mappings that are NOT in the new list
            for (const mapping of currentAttrMappings) {
                if (mapping.isVisible && !newSelectedIds.includes(mapping.attributeId)) {
                    updates.push({ id: mapping.id, data: { crdfd_taskinstanceuxvisible: false } });
                }
            }

            // 2. Perform Batch Update
            if (updates.length > 0 || creates.length > 0) {
                await batchUpdateTaskTypeAttributeMappings(updates, creates);
            }

            // 3. Clear optimistic state (store data should now match)
            setOptimisticSelectedIds(null);

        } catch (error) {
            console.error(error);
            toast.error('Failed to update attribute settings');
            // Revert optimistic update on error
            setOptimisticSelectedIds(null);
        }
    };

    // Handlers
    const handleAddTaskType = async (taskTypeId: string) => {
        // Check if mapping already exists
        const existingMapping = eventTypeTaskTypeMappings.find(m =>
            m.projectId === projectId && m.taskTypeId === taskTypeId
        );

        if (existingMapping) {
            toast.error('Task type already added to this project');
            return;
        }

        try {
            await createEventTypeTaskTypeMapping({
                crdfd_name: 'Project-TaskType Mapping',
                'crdfd_Project@odata.bind': `/crdfd_projects(${projectId})`,
                'crdfd_Task@odata.bind': `/crdfd_task_types(${taskTypeId})`
                // EventType is intentionally left blank for Project-specific mappings
                // NextTask will be set later when creating flow connections
            });
            // Keep modal open to add more tasks
            setQuickAddSearch(''); // Clear quick add
            setIsQuickAddOpen(false);
            toast.success('Task type added successfully');
        } catch (error) {
            toast.error('Failed to add task type');
        }
    };

    const handleCreateTaskType = async (data: any) => {
        try {
            const payload = {
                crdfd_name: data.name,
                crdfd_brief: data.brief,
                crdfd_ownertype: data.ownerType ? Number(data.ownerType) : undefined,
                crdfd_taskdomain: data.taskDomain ? Number(data.taskDomain) : undefined
            };

            await createTaskType(payload);
            setIsCreateModalOpen(false);
            setIsAddModalOpen(true); // Open add modal so they can select it
            toast.success('Task Type created. Please select it to add to project.');
        } catch (error) {
            toast.error('Failed to create task type');
        }
    };

    const handleRemoveTaskTypeFromModal = async (taskTypeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Remove this task type from the project?')) return;

        try {
            const mapping = currentMappings.find(m => m.taskTypeId === taskTypeId);
            if (mapping) {
                await deactivateEventTypeTaskTypeMapping(mapping.id);
                toast.success('Task type removed successfully');
            }
        } catch (error) {
            toast.error('Failed to remove task type');
        }
    };

    const handleRemoveTaskType = async (taskTypeId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (!confirm('Remove this task type from the project?')) return;

        const mapping = currentMappings.find(m => m.taskTypeId === taskTypeId);
        if (mapping) {
            await deactivateEventTypeTaskTypeMapping(mapping.id);
            if (selectedTaskTypeId === taskTypeId) setSelectedTaskTypeId(null);
        }
    };

    // Handler for Project Context
    const handleProjectContextChange = async (val: string) => {
        if (!project) return;
        try {
            await updateProject(project.id, { crdfd_projectcontext: val });
            toast.success('Project context updated');
        } catch (error) {
            toast.error('Failed to update project context');
        }
    };

    // Handler for Task Mapping updates (Task Context, Prompts)
    const handleTaskMappingUpdate = async (field: string, val: string) => {
        if (!selectedTaskTypeId) return;
        const mapping = currentMappings.find(m => m.taskTypeId === selectedTaskTypeId);
        if (!mapping) return;

        try {
            await updateEventTypeTaskTypeMapping(mapping.id, { [field]: val });
        } catch (error) {
            console.error(error);
            toast.error('Failed to update task settings');
        }
    };

    return (
        <div className="flex h-full border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Sidebar List */}
            <div className="w-[400px] shrink-0 border-r bg-neutral-50 flex flex-col">
                <div className="p-3 border-b bg-white">
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">Project Context</label>
                    <Textarea
                        className="w-full text-xs min-h-[80px] resize-y"
                        placeholder="Context for AI generation..."
                        defaultValue={project?.projectContext || ''}
                        onBlur={(e) => handleProjectContextChange(e.target.value)}
                    />
                </div>

                <div className="p-3 border-b">
                    {/* Quick Add Dropdown with Create New Button */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                placeholder="Search & add task type..."
                                className="h-9 text-sm bg-white border-primary-200 focus:border-primary-500 pl-9"
                                value={quickAddSearch}
                                onChange={(e) => {
                                    setQuickAddSearch(e.target.value);
                                    setIsQuickAddOpen(true);
                                }}
                                onFocus={() => setIsQuickAddOpen(true)}
                                onBlur={() => setTimeout(() => setIsQuickAddOpen(false), 200)} // Delay to allow click
                            />
                            {isQuickAddOpen && (
                                <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-96 overflow-auto">
                                    {quickAddOptions.length === 0 ? (
                                        <div className="p-3 text-xs text-neutral-500 text-center">
                                            {quickAddSearch ? 'No matches found' : 'All task types added'}
                                        </div>
                                    ) : (
                                        quickAddOptions.map(t => (
                                            <div
                                                key={t.id}
                                                className="px-3 py-2 text-sm hover:bg-primary-50 cursor-pointer flex justify-between items-center group"
                                                onClick={() => handleAddTaskType(t.id)}
                                            >
                                                <span className="font-medium text-neutral-700">{t.name}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                        <Button
                            size="sm"
                            variant="outline"
                            className="h-9 px-3 text-primary-600 border-primary-200 hover:bg-primary-50 whitespace-nowrap"
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-1" /> New
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {projectTaskTypes.map(taskType => (
                        <div
                            key={taskType.id}
                            onClick={() => setSelectedTaskTypeId(taskType.id)}
                            className={`
                                group flex items-center justify-between p-3 rounded-md cursor-pointer transition-all border
                                ${selectedTaskTypeId === taskType.id
                                    ? 'bg-white border-primary-200 shadow-sm ring-1 ring-primary-100'
                                    : 'border-transparent hover:bg-neutral-100/80'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-primary-50 rounded-md text-primary-600">
                                    <FileText className="w-4 h-4" />
                                </div>
                                <span className={`font-medium text-sm ${selectedTaskTypeId === taskType.id ? 'text-primary-700' : 'text-neutral-700'}`}>
                                    {taskType.name}
                                </span>
                            </div>
                            <button
                                type="button"
                                className="h-6 w-6 p-0.5 flex items-center justify-center rounded-md text-red-500 hover:bg-red-50 transition-colors"
                                onClick={(e) => handleRemoveTaskType(taskType.id, e)}
                                title="Remove task type"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {projectTaskTypes.length === 0 && (
                        <div className="text-center py-8 text-neutral-400 text-sm">
                            No task types found.
                        </div>
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-white">
                {selectedTaskType ? (
                    <div className="h-full flex flex-col">
                        <div className="p-4 border-b">
                            <h2 className="text-lg font-semibold text-neutral-900 flex items-center gap-2">
                                <Settings className="w-5 h-5 text-neutral-500" />
                                {selectedTaskType.name}
                            </h2>
                            <p className="text-sm text-neutral-500 mt-1">{selectedTaskType.description || 'Configure task settings'}</p>
                        </div>

                        {/* Task Context Section (General for this task in project) */}
                        <div className="px-6 py-4 border-b bg-neutral-50/30">
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Task Context (Planning)</label>
                            <Textarea
                                className="w-full text-sm min-h-[60px]"
                                placeholder="Specific context for this task..."
                                defaultValue={selectedMapping?.planningTaskContext || ''}
                                onBlur={(e) => handleTaskMappingUpdate('crdfd_planningtaskcontext', e.target.value)}
                                key={`context-${selectedTaskTypeId}`} // Re-render on switch
                            />
                        </div>

                        <Tabs defaultValue="attributes" className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-4 pt-2 bg-neutral-50/50 border-b">
                                <TabsList>
                                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                                    <TabsTrigger value="actions">Action Flow</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="attributes" className="flex-1 overflow-y-auto p-6">
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Attribute Prompt</label>
                                    <Textarea
                                        className="w-full text-sm mb-4"
                                        placeholder="Prompt for attribute generation..."
                                        defaultValue={selectedMapping?.attributePrompt || ''}
                                        onBlur={(e) => handleTaskMappingUpdate('crdfd_attributeprompt', e.target.value)}
                                        key={`attr-prompt-${selectedTaskTypeId}`}
                                    />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-neutral-900 mb-4">Visible Attributes</h3>
                                    <TaskTypeAttributeSettings
                                        attributes={taskTypeAttributes}
                                        selectedIds={selectedAttributeIds}
                                        onSelectionChange={handleAttributeSelectionChange}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="actions" className="flex-1 overflow-hidden p-6 flex flex-col">
                                <div className="mb-4 flex-shrink-0">
                                    <label className="block text-sm font-medium text-neutral-700 mb-1">Action Flow Prompt</label>
                                    <Textarea
                                        className="w-full text-sm"
                                        placeholder="Prompt for action flow generation..."
                                        defaultValue={selectedMapping?.actionPrompt || ''}
                                        onBlur={(e) => handleTaskMappingUpdate('crdfd_actionprompt', e.target.value)}
                                        key={`action-prompt-${selectedTaskTypeId}`}
                                    />
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <TaskActionFlow taskTypeId={selectedTaskType.id} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-400">
                        <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center mb-4">
                            <Settings className="w-8 h-8 opacity-50" />
                        </div>
                        <p className="font-medium text-neutral-600">No Task Type Selected</p>
                        <p className="text-sm">Select a task type to configure its attributes and action flow.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Task Type">
                <FormBuilder
                    fields={taskTypeFormFields}
                    schema={taskTypeSchema}
                    onSubmit={handleCreateTaskType}
                    onCancel={() => setIsCreateModalOpen(false)}
                    isLoading={isLoading}
                />
            </Modal>
        </div>
    );
}
