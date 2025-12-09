import { useState } from 'react';
import type { TaskInstance, TableColumn } from '@/types';
import { Button } from '@components/ui'; // Input removed
import { Modal, ConfirmModal, DataTable, FormBuilder, StatusBadge, PriorityBadge, CommandBar } from '@components/shared';
import { Plus } from 'lucide-react';
import { formatDate } from '@utils/index';
import { useTaskInstances } from './hooks';
import { taskInstanceSchema, getTaskFormFields, type TaskInstanceFormData } from './schema';
import { useToast } from '@/hooks/useToast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function TaskInstancePage() {
    const toast = useToast();
    const { tasks, isLoading, create, update, remove, projectOptions, taskTypeOptions, getProjectName, getTaskTypeName } = useTaskInstances();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<TaskInstance | null>(null);
    const [deleteItem, setDeleteItem] = useState<TaskInstance | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<TaskInstance[]>([]);

    useKeyboardShortcuts([
        {
            combo: { key: 'c' },
            handler: () => {
                setSelected(null);
                setIsFormOpen(true);
            },
            description: 'Create new task'
        },
        {
            combo: { key: 'Delete' },
            handler: () => {
                if (selectedRows.length > 0) {
                    setDeleteItem(selectedRows[0]);
                }
            },
            description: 'Delete selected'
        },
        {
            combo: { key: 'Backspace' },
            handler: () => {
                if (selectedRows.length > 0) {
                    setDeleteItem(selectedRows[0]);
                }
            },
            description: 'Delete selected'
        }
    ]);

    const columns: TableColumn<TaskInstance>[] = [
        {
            key: 'title', label: 'Title', sortable: true,
            render: (v, row) => (
                <div>
                    <div className="font-medium text-neutral-900">{v as string}</div>
                    <div className="text-xs text-neutral-400">{getProjectName(row.projectId)} / {getTaskTypeName(row.taskTypeId)}</div>
                </div>
            )
        },
        { key: 'status', label: 'Status', sortable: true, width: '140px', render: (v) => <StatusBadge status={v as string} /> },
        { key: 'priority', label: 'Priority', sortable: true, width: '120px', render: (v) => <PriorityBadge priority={v as string} /> },
        { key: 'dueDate', label: 'Due Date', sortable: true, width: '120px', render: (v) => v ? formatDate(v as Date) : '-' },
        { key: 'assignee', label: 'Assignee', width: '140px', render: (v) => (v as string) || '-' },
    ];

    const handleSubmit = async (data: TaskInstanceFormData) => {
        try {
            if (selected) {
                await update(selected.id, data);
                toast.success('Task updated successfully');
            } else {
                await create(data);
                toast.success('Task created successfully');
            }
            setIsFormOpen(false);
            setSelected(null);
        } catch (error) {
            toast.error('An error occurred');
        }
    };

    const formFields = getTaskFormFields(projectOptions, taskTypeOptions);

    // Filter based on search query
    const filteredData = tasks.filter((task: any) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignee?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getProjectName(task.projectId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTaskTypeName(task.taskTypeId).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filterContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Status
                </label>
                <select className="input w-full text-sm h-8" title="Filter by status">
                    <option value="">All</option>
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                    <option value="completed">Completed</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Priority
                </label>
                <select className="input w-full text-sm h-8" title="Filter by priority">
                    <option value="">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Sort by
                </label>
                <select className="input w-full text-sm h-8" title="Sort by">
                    <option value="title">Title</option>
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                </select>
            </div>
            <div className="flex items-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="w-full"
                >
                    Close filters
                </Button>
            </div>
        </div>
    );

    const actions = (
        <>
            <Button
                variant="primary"
                size="sm"
                onClick={() => { setSelected(null); setIsFormOpen(true); }}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                title="Create task (c)"
            >
                Add task
            </Button>
            {selectedRows.length === 1 && (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => { setSelected(selectedRows[0]); setIsFormOpen(true); }}
                    leftIcon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                >
                    Edit
                </Button>
            )}
            {selectedRows.length > 0 && (
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => setDeleteItem(selectedRows[0])}
                    leftIcon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
                    title="Delete (Backspace/Delete)"
                >
                    Delete {selectedRows.length > 1 ? `(${selectedRows.length})` : ''}
                </Button>
            )}
        </>
    );

    return (
        <div className="space-y-2 animate-fade-in">
            <CommandBar
                onSearch={setSearchQuery}
                searchValue={searchQuery}
                onFilterClick={() => setShowFilters(!showFilters)}
                isFilterActive={showFilters}
                filterContent={filterContent}
                actions={actions}
                selectedCount={selectedRows.length}
            />

            {/* Data Table */}
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
                />
            </div>

            {/* Modals */}
            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }}
                title={selected ? 'Edit Task' : 'Add New Task'} size="lg">
                <FormBuilder<TaskInstanceFormData> fields={formFields} schema={taskInstanceSchema}
                    defaultValues={selected ? {
                        title: selected.title, description: selected.description, taskTypeId: selected.taskTypeId,
                        projectId: selected.projectId, status: selected.status, priority: selected.priority,
                        dueDate: selected.dueDate ? new Date(selected.dueDate) : undefined,
                        startDate: selected.startDate ? new Date(selected.startDate) : undefined, assignee: selected.assignee
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
