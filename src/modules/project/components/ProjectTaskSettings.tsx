import { useState, useMemo } from 'react';
import { useDataverse } from '@stores/dataverseStore';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent, Input } from '@components/ui';
import { Plus, Search, Trash2, Settings } from 'lucide-react';
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
        eventTypeTaskTypeMappings,
        taskTypeAttributeMappings,
        taskTypeAttributes, // Keep attributes logic as is
        createEventTypeTaskTypeMapping,
        deactivateEventTypeTaskTypeMapping,
        createTaskType,
        createTaskTypeAttributeMapping,
        updateTaskTypeAttributeMapping,
        refreshTaskTypeAttributeMappings,
        isLoading
    } = useDataverse();

    const [selectedTaskTypeId, setSelectedTaskTypeId] = useState<string | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const [quickAddSearch, setQuickAddSearch] = useState('');
    const [availableSearchTerm, setAvailableSearchTerm] = useState('');
    const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

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

    // Filtered Task Types (for Modal) - shows all, including already added
    const filteredTaskTypes = useMemo(() =>
        allTaskTypesWithStatus.filter(t =>
            t.name.toLowerCase().includes(availableSearchTerm.toLowerCase()) ||
            (t.description || '').toLowerCase().includes(availableSearchTerm.toLowerCase())
        ),
        [allTaskTypesWithStatus, availableSearchTerm]
    );

    // Filtered Quick Add Options (only show available, not added)
    const quickAddOptions = useMemo(() => {
        if (!quickAddSearch) return [];
        return allTaskTypesWithStatus
            .filter(t => !t.isAdded && t.name.toLowerCase().includes(quickAddSearch.toLowerCase()))
            .slice(0, 5); // Limit to 5 results
    }, [allTaskTypesWithStatus, quickAddSearch]);

    // Attribute Settings Logic - Unchanged
    const handleAttributeSelectionChange = async (selectedIds: string[]) => {
        if (!selectedTaskTypeId) return;

        try {
            const currentAttrMappings = taskTypeAttributeMappings.filter(m => m.taskTypeId === selectedTaskTypeId);

            for (const attr of taskTypeAttributes) {
                const isSelected = selectedIds.includes(attr.id);
                const mapping = currentAttrMappings.find(m => m.attributeId === attr.id);

                if (isSelected) {
                    if (mapping) {
                        if (!mapping.isVisible) {
                            await updateTaskTypeAttributeMapping(mapping.id, { crdfd_taskinstanceuxvisible: true });
                        }
                    } else {
                        await createTaskTypeAttributeMapping({
                            crdfd_name: `${selectedTaskType?.name}-${attr.name}`,
                            'crdfd_TaskType@odata.bind': `/crdfd_task_types(${selectedTaskTypeId})`,
                            'crdfd_Attribute@odata.bind': `/crdfd_attributes(${attr.id})`,
                            crdfd_taskinstanceuxvisible: true
                        });
                    }
                } else {
                    if (mapping && mapping.isVisible) {
                        await updateTaskTypeAttributeMapping(mapping.id, { crdfd_taskinstanceuxvisible: false });
                    }
                }
            }
            await refreshTaskTypeAttributeMappings();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update attribute settings');
        }
    };

    // Derived selected attribute IDs for the component
    const selectedAttributeIds = useMemo(() => {
        if (!selectedTaskTypeId) return [];
        return taskTypeAttributeMappings
            .filter(m => m.taskTypeId === selectedTaskTypeId && m.isVisible)
            .map(m => m.attributeId);
    }, [selectedTaskTypeId, taskTypeAttributeMappings]);

    // Handlers
    const handleAddTaskType = async (taskTypeId: string) => {
        try {
            await createEventTypeTaskTypeMapping({
                crdfd_name: 'Project-TaskType Mapping',
                'crdfd_Project@odata.bind': `/crdfd_projects(${projectId})`,
                'crdfd_Nexttask@odata.bind': `/crdfd_task_types(${taskTypeId})`
                // EventType is intentionally left blank for Project-specific mappings
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

    return (
        <div className="flex h-full border rounded-lg overflow-hidden bg-white shadow-sm">
            {/* Sidebar List */}
            <div className="w-1/3 border-r bg-neutral-50 flex flex-col">
                <div className="p-3 border-b space-y-3">
                    {/* Quick Add Dropdown */}
                    <div className="relative">
                        <Input
                            placeholder="Quick add task type..."
                            className="h-9 text-sm bg-white border-primary-200 focus:border-primary-500"
                            value={quickAddSearch}
                            onChange={(e) => {
                                setQuickAddSearch(e.target.value);
                                setIsQuickAddOpen(true);
                            }}
                            onFocus={() => setIsQuickAddOpen(true)}
                            onBlur={() => setTimeout(() => setIsQuickAddOpen(false), 200)} // Delay to allow click
                        />
                        {isQuickAddOpen && quickAddSearch && (
                            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-48 overflow-auto">
                                {quickAddOptions.length === 0 ? (
                                    <div className="p-2 text-xs text-neutral-500 text-center">No matches found</div>
                                ) : (
                                    quickAddOptions.map(t => (
                                        <div
                                            key={t.id}
                                            className="px-3 py-2 text-sm hover:bg-primary-50 cursor-pointer flex justify-between items-center group"
                                            onClick={() => handleAddTaskType(t.id)}
                                        >
                                            <span className="font-medium text-neutral-700">{t.name}</span>
                                            <Plus className="w-3 h-3 text-primary-500 opacity-0 group-hover:opacity-100" />
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>

                    <Button className="w-full justify-start" size="sm" onClick={() => setIsAddModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" /> Add Task Type
                    </Button>
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
                            <span className={`font-medium text-sm ${selectedTaskTypeId === taskType.id ? 'text-primary-700' : 'text-neutral-700'}`}>
                                {taskType.name}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 text-neutral-400 hover:text-red-500 hover:bg-red-50"
                                onClick={(e) => handleRemoveTaskType(taskType.id, e)}
                            >
                                <Trash2 className="w-3.5 h-3.5" />
                            </Button>
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
                                <span className="text-xs font-normal text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                                    {selectedTaskType.code}
                                </span>
                            </h2>
                            <p className="text-sm text-neutral-500 mt-1">{selectedTaskType.description || 'Configure task settings'}</p>
                        </div>

                        <Tabs defaultValue="attributes" className="flex-1 flex flex-col overflow-hidden">
                            <div className="px-4 pt-2 bg-neutral-50/50 border-b">
                                <TabsList>
                                    <TabsTrigger value="attributes">Attributes</TabsTrigger>
                                    <TabsTrigger value="actions">Action Flow</TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="attributes" className="flex-1 overflow-y-auto p-6">
                                <div className="max-w-4xl">
                                    <h3 className="text-sm font-semibold text-neutral-900 mb-4">Visible Attributes</h3>
                                    <TaskTypeAttributeSettings
                                        attributes={taskTypeAttributes}
                                        selectedIds={selectedAttributeIds}
                                        onSelectionChange={handleAttributeSelectionChange}
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="actions" className="flex-1 overflow-hidden p-6">
                                <TaskActionFlow taskTypeId={selectedTaskType.id} />
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

            {/* Add Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title="Add Task Type to Project"
                className="w-[70%] h-[85%] max-w-none"
            >
                <div className="flex flex-col h-full space-y-4">
                    <div className="flex justify-between items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                            <Input
                                placeholder="Search available task types to add..."
                                className="pl-9"
                                value={availableSearchTerm}
                                onChange={e => setAvailableSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" className="text-primary-600 border-primary-200 hover:bg-primary-50" onClick={() => { setIsAddModalOpen(false); setIsCreateModalOpen(true); }}>
                            + Create New
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto border rounded-md divide-y">
                        {filteredTaskTypes.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500">
                                <p className="mb-2">No matching task types found.</p>
                                <Button variant="ghost" onClick={() => { setIsAddModalOpen(false); setIsCreateModalOpen(true); }}>
                                    Create new task type
                                </Button>
                            </div>
                        ) : (
                            filteredTaskTypes.map(t => (
                                <div key={t.id} className={`p-3 flex justify-between items-center transition-colors ${t.isAdded ? 'bg-neutral-50 opacity-70' : 'hover:bg-neutral-50'
                                    }`}>
                                    <div className="flex flex-col">
                                        <span className={`text-sm font-medium ${t.isAdded ? 'text-neutral-500' : 'text-neutral-900'
                                            }`}>{t.name}</span>
                                        <span className="text-xs text-neutral-500">{t.description || 'No description'}</span>
                                    </div>
                                    {t.isAdded ? (
                                        <div className="flex items-center gap-2">
                                            <Button size="sm" variant="ghost" disabled className="text-green-600 cursor-not-allowed">
                                                Added
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-8 w-8 p-0 text-neutral-400 hover:text-red-500 hover:bg-red-50"
                                                onClick={(e) => handleRemoveTaskTypeFromModal(t.id, e)}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button size="sm" variant="secondary" onClick={() => handleAddTaskType(t.id)}>Add</Button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </Modal>

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
