import { useState } from 'react';
import type { TaskInstance, TableColumn, FormField } from '@/types';
import { Modal, ConfirmModal, DataTable, FormBuilder, StatusBadge, PriorityBadge, CommandBar, type CommandBarItem } from '@components/shared';
import { Plus } from 'lucide-react';
import { formatDate } from '@utils/index';
import { exportToCsv } from '@/utils/exportUtils';
import { useDataverse } from '@stores/dataverseStore';
import { useToast } from '@/hooks/useToast';
import { z } from 'zod';

// Schema
const taskInstanceSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    status: z.string(),
    priority: z.string(),
});
type TaskInstanceFormData = z.infer<typeof taskInstanceSchema>;

const formFields: FormField[] = [
    { name: 'title', label: 'Title', type: 'text', required: true },
    { name: 'status', label: 'Status', type: 'select', options: [{ label: 'Not Started', value: 'not-started' }, { label: 'In Progress', value: 'in-progress' }, { label: 'Completed', value: 'completed' }] },
    { name: 'priority', label: 'Priority', type: 'select', options: [{ label: 'Low', value: 'low' }, { label: 'Medium', value: 'medium' }, { label: 'High', value: 'high' }] },
    { name: 'description', label: 'Description', type: 'textarea' }
];

export function TaskInstancePage() {
    const { taskInstances, isLoading, refreshTaskInstances, createTaskInstance, updateTaskInstance, deactivateTaskInstance } = useDataverse();
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState<TaskInstance[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<TaskInstance | null>(null);
    const [deleteItem, setDeleteItem] = useState<TaskInstance | null>(null);

    const columns: TableColumn<TaskInstance>[] = [
        { key: 'title', label: 'Task', sortable: true },
        { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v as any} /> },
        { key: 'priority', label: 'Priority', render: (v) => <PriorityBadge priority={v as any} /> },
        { key: 'dueDate', label: 'Due Date', render: (v) => v ? formatDate(v as Date) : '-' },
    ];

    const filteredData = taskInstances.filter(item =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const mapStatusToValue = (status: string) => {
        switch (status) {
            case 'in-progress': return 1;
            case 'completed': return 2;
            default: return 0;
        }
    };

    const mapPriorityToValue = (p: string) => {
        switch (p) {
            case 'high': return 2;
            case 'medium': return 1;
            default: return 0;
        }
    };

    const handleSubmit = async (data: TaskInstanceFormData) => {
        try {
            const payload: any = {
                crdfd_name: data.title,
                crdfd_discussion: data.description,
                cr1bb_trangthai: mapStatusToValue(data.status),
                crdfd_priority: mapPriorityToValue(data.priority),
            };

            if (selected) {
                await updateTaskInstance(selected.id, payload);
            } else {
                await createTaskInstance(payload);
            }
            setIsFormOpen(false);
            setSelected(null);
        } catch (e) {
            console.error(e);
        }
    };

    const remove = async (id: string) => {
        await deactivateTaskInstance(id);
    };

    const commandBarItems: CommandBarItem[] = [
        {
            key: 'new',
            label: 'New',
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: () => { setSelected(null); setIsFormOpen(true); },
            variant: 'ghost',
            disabled: true
        },
        {
            key: 'edit',
            label: 'Edit',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
            onClick: () => { setSelected(selectedRows[0]); setIsFormOpen(true); },
            disabled: selectedRows.length !== 1,
            variant: 'ghost'
        },
        {
            key: 'delete',
            label: 'Deactivate',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
            onClick: () => setDeleteItem(selectedRows[0]),
            disabled: selectedRows.length === 0,
            variant: 'ghost'
        },
        {
            key: 'refresh',
            label: 'Refresh',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
            onClick: async () => {
                await refreshTaskInstances();
                toast.success('Data refreshed');
            },
            variant: 'ghost'
        },
        {
            key: 'export',
            label: 'Export to Excel',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
            onClick: () => {
                const dataToExport = selectedRows.length > 0 ? selectedRows : filteredData;
                exportToCsv(dataToExport, 'task-instances');
            },
            variant: 'ghost'
        }
    ];

    const filterContent = (
        <div className="p-2"><p>No filters available</p></div>
    );

    return (
        <div className="space-y-2 animate-fade-in">
            <CommandBar
                onSearch={setSearchQuery}
                searchValue={searchQuery}
                onFilterClick={() => setShowFilters(!showFilters)}
                isFilterActive={showFilters}
                filterContent={filterContent}
                items={commandBarItems}
                selectedCount={selectedRows.length}
            />

            <div className="card p-3">
                <DataTable<TaskInstance>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "No matching tasks found" : "No tasks yet"}
                    onRowClick={(row) => {
                        setSelected(row);
                        setIsFormOpen(true);
                    }}
                />
            </div>

            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }}
                title={selected ? 'Edit Task' : 'Add New Task'} size="lg">
                <FormBuilder<TaskInstanceFormData> fields={formFields} schema={taskInstanceSchema}
                    defaultValues={selected ? {
                        title: selected.title,
                        description: selected.description || '',
                        status: selected.status,
                        priority: selected.priority
                    } : { status: 'not-started', priority: 'medium' }}
                    onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} isLoading={isLoading} />
            </Modal>

            <ConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)}
                onConfirm={async () => {
                    if (deleteItem) {
                        try {
                            await remove(deleteItem.id);
                            toast.success('Task deleted successfully');
                        } catch (e) {
                            toast.error('Failed to delete task');
                        }
                        setDeleteItem(null);
                    }
                }}
                title="Delete Task" message={`Delete "${deleteItem?.title}"?`} isLoading={isLoading} />
        </div>
    );
}
