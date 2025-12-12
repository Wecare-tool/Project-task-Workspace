import { useEffect, useMemo, useState } from 'react';
import type { TaskType, TableColumn } from '@/types';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui';
import { TaskTypeAttributeSettings } from './TaskTypeAttributeSettings';
import { useToast } from '@/hooks/useToast';
import { useDataverse } from '@stores/dataverseStore';
import { Modal, DataTable, FormBuilder, CommandBar, ConfirmModal, type CommandBarItem } from '@components/shared';
import { Plus } from 'lucide-react';
import { exportToCsv } from '@/utils/exportUtils';
import { taskTypeSchema, taskTypeFormFields, type TaskTypeFormData } from './schema';

export function TaskTypePage() {
    const {
        taskTypes,
        taskTypeAttributes,
        taskTypeAttributeMappings,
        isLoading,
        refreshTaskTypes,
        refreshTaskTypeAttributeMappings,
        createTaskType,
        updateTaskType,
        deactivateTaskType,
        createTaskTypeAttributeMapping,
        updateTaskTypeAttributeMapping,
        deactivateTaskTypeAttributeMapping,
    } = useDataverse();
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<TaskType | null>(null);
    const [deleteItems, setDeleteItems] = useState<TaskType[]>([]);
    const [selectedRows, setSelectedRows] = useState<TaskType[]>([]);
    const [selectedAttributeIds, setSelectedAttributeIds] = useState<string[]>([]);

    const columns: TableColumn<TaskType>[] = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'description', label: 'Description', sortable: true, render: (v) => <span className="text-neutral-500 truncate block max-w-xs">{v as string || '-'}</span> },
        { key: 'ownerType', label: 'Owner Type', render: (v) => v === '0' ? 'Tech' : v === '1' ? 'User' : '-' },
    ];

    const filteredData = taskTypes.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (data: TaskTypeFormData) => {
        try {
            const payload = {
                crdfd_name: data.name,
                crdfd_brief: data.brief,
                crdfd_ownertype: data.ownerType ? Number(data.ownerType) : undefined,
                crdfd_taskdomain: data.taskDomain ? Number(data.taskDomain) : undefined
            };

            if (selected) {
                await updateTaskType(selected.id, payload);
            } else {
                await createTaskType(payload);
            }
            setIsFormOpen(false);
            setSelected(null);
        } catch (error) {
            console.error(error);
        }
    };

    const selectedTaskMappings = useMemo(() => {
        if (!selected) return [];
        return taskTypeAttributeMappings.filter((m) => m.taskTypeId === selected.id && m.isVisible);
    }, [selected, taskTypeAttributeMappings]);

    useEffect(() => {
        if (!isFormOpen || !selected) {
            setSelectedAttributeIds([]);
            return;
        }
        setSelectedAttributeIds(selectedTaskMappings.map((m) => m.attributeId));
    }, [isFormOpen, selected, selectedTaskMappings]);

    // Attribute handling logic removed - moved to TaskTypeAttributeSettings

    const handleSaveAttributes = async () => {
        if (!selected) return;
        try {
            const existingMappings = taskTypeAttributeMappings.filter((m) => m.taskTypeId === selected.id);
            const existingByAttr = new Map(existingMappings.map((m) => [m.attributeId, m]));

            const toActivate = selectedAttributeIds;
            const toDeactivate = existingMappings
                .filter((m) => !selectedAttributeIds.includes(m.attributeId))
                .map((m) => m.id);

            await Promise.all([
                ...toActivate.map(async (attrId) => {
                    const mapping = existingByAttr.get(attrId);
                    if (mapping) {
                        if (!mapping.isVisible) {
                            await updateTaskTypeAttributeMapping(mapping.id, { crdfd_taskinstanceuxvisible: true });
                        }
                    } else {
                        const attribute = taskTypeAttributes.find((a) => a.id === attrId);
                        await createTaskTypeAttributeMapping({
                            crdfd_name: `${selected.name} - ${attribute?.label || ''}`,
                            crdfd_taskinstanceuxvisible: true,
                            _crdfd_attribute_value: attrId,
                            _crdfd_tasktype_value: selected.id,
                        });
                    }
                }),
                ...toDeactivate.map((id) => deactivateTaskTypeAttributeMapping(id)),
            ]);

            await refreshTaskTypeAttributeMappings();
            toast.success('Attributes saved');
        } catch (error) {
            console.error(error);
            toast.error('Failed to save attributes');
        }
    };

    const remove = async (id: string) => {
        await deactivateTaskType(id);
    };

    const commandBarItems: CommandBarItem[] = [
        {
            key: 'new',
            label: 'New',
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: () => { setSelected(null); setIsFormOpen(true); },
            variant: 'ghost'
        },
        {
            key: 'edit',
            label: 'Edit',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
            onClick: () => { if (selected) { setIsFormOpen(true); } else { toast.error('Select an item first'); } },
            disabled: !selected,
            variant: 'ghost',
        },
        {
            key: 'deactivate',
            label: 'Deactivate',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
            onClick: () => {
                const itemsToDelete = selected ? [selected] : selectedRows;
                if (itemsToDelete.length === 0) {
                    toast.error('Select an item to deactivate');
                    return;
                }
                setDeleteItems(itemsToDelete);
            },
            disabled: !selected && selectedRows.length === 0,
            variant: 'ghost',
        },
        {
            key: 'refresh',
            label: 'Refresh',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
            onClick: async () => {
                await refreshTaskTypes();
                toast.success('Data refreshed');
            },
            variant: 'ghost'
        },
        {
            key: 'export',
            label: 'Export to Excel',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
            onClick: () => {
                const dataToExport = filteredData;
                exportToCsv(dataToExport, 'task-types');
            },
            variant: 'ghost'
        }
    ];

    return (
        <div className="space-y-2 animate-fade-in">
            <CommandBar
                onSearch={setSearchQuery}
                searchValue={searchQuery}
                onFilterClick={() => setShowFilters(!showFilters)}
                isFilterActive={showFilters}
                filterContent={
                    <div className="p-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="w-full">Close filters</Button>
                    </div>
                }
                items={commandBarItems}
            />

            <div className="card p-3">
                <DataTable<TaskType>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    emptyMessage={searchQuery ? "No matching task types found" : "No task types found"}
                    onRowClick={(row) => { setSelected(row); setIsFormOpen(true); }}
                    selectable={true}
                    onSelectionChange={setSelectedRows}
                />
            </div>

            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }}
                title={selected ? 'Edit Task type' : 'Add Task type'} className="!w-[85%] h-[90%] max-w-none">
                <Tabs defaultValue="general" className="w-full h-full flex flex-col">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>
                        {selected && <TabsTrigger value="setting">Attribute setting</TabsTrigger>}
                    </TabsList>
                    <TabsContent value="general" className="flex-1 overflow-y-auto">
                        <FormBuilder<TaskTypeFormData> fields={taskTypeFormFields} schema={taskTypeSchema}
                            defaultValues={selected ? { name: selected.name, brief: selected.description } : {}}
                            onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} isLoading={isLoading} />
                    </TabsContent>
                    <TabsContent value="setting" className="p-4 space-y-4 overflow-y-auto">
                        <div className="flex items-center justify-between gap-3 bg-white sticky top-0 z-10 py-2 border-b pb-4 mb-4">
                            <div>
                                <p className="font-medium text-lg">Attribute setting</p>
                                <p className="text-sm text-neutral-500">Configure visible attributes for this task type</p>
                            </div>
                            <Button size="sm" variant="primary" onClick={handleSaveAttributes} disabled={isLoading}>
                                Save Changes
                            </Button>
                        </div>

                        <TaskTypeAttributeSettings
                            attributes={taskTypeAttributes}
                            selectedIds={selectedAttributeIds}
                            onSelectionChange={setSelectedAttributeIds}
                        />
                    </TabsContent>
                </Tabs>
            </Modal>

            <ConfirmModal isOpen={deleteItems.length > 0} onClose={() => setDeleteItems([])}
                onConfirm={async () => {
                    try {
                        for (const item of deleteItems) {
                            await remove(item.id);
                        }
                        toast.success('Deactivated successfully');
                        setDeleteItems([]);
                        setSelectedRows([]);
                    } catch (error) {
                        const msg = error instanceof Error ? error.message : 'An error occurred during deactivation';
                        toast.error(msg);
                    }
                }}
                title="Deactivate Task Type"
                message={deleteItems.length > 1
                    ? `Are you sure you want to deactivate ${deleteItems.length} selected task types?`
                    : `Deactivate "${deleteItems[0]?.name}"?`
                }
                isLoading={isLoading} />
        </div>
    );
}
