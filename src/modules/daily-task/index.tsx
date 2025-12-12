import { useState } from 'react';
import type { TaskInstance, TableColumn } from '@/types';
import { Button } from '@components/ui';
import { Modal, ConfirmModal, DataTable, FormBuilder, StatusBadge, PriorityBadge, CommandBar, type CommandBarItem } from '@components/shared';
import { Plus, Calendar } from 'lucide-react';
import { formatDate } from '@utils/index';
import { exportToCsv } from '@/utils/exportUtils';
import { useDailyTasks } from './hooks';
import { taskInstanceSchema, getTaskFormFields, type TaskInstanceFormData } from '../task-instance/schema';

export function DailyTaskPage() {
    const { tasks, isLoading, create, update, remove, projectOptions, taskTypeOptions, getProjectName, getTaskTypeName } = useDailyTasks();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<TaskInstance | null>(null);
    const [deleteItem, setDeleteItem] = useState<TaskInstance | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<TaskInstance[]>([]);

    const columns: TableColumn<TaskInstance>[] = [
        {
            key: 'title', label: 'Title', sortable: true,
            render: (v, row) => (
                <div>
                    <div className="font-medium text-dark-900">{v as string}</div>
                    <div className="text-xs text-dark-400">{getProjectName(row.projectId)} / {getTaskTypeName(row.taskTypeId)}</div>
                </div>
            )
        },
        { key: 'status', label: 'Status', sortable: true, width: '140px', render: (v) => <StatusBadge status={v as string} /> },
        { key: 'priority', label: 'Priority', sortable: true, width: '120px', render: (v) => <PriorityBadge priority={v as string} /> },
        {
            key: 'dueDate',
            label: 'Due Date',
            sortable: true,
            width: '120px',
            render: (v) => {
                if (!v) return '-';
                const dueDate = new Date(v as Date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const isOverdue = dueDate < today;

                return (
                    <span className={isOverdue ? 'text-danger-600 font-semibold' : ''}>
                        {formatDate(v as Date)}
                    </span>
                );
            }
        },
        { key: 'assignee', label: 'Assignee', width: '140px', render: (v) => (v as string) || '-' },
    ];

    const handleSubmit = async (data: TaskInstanceFormData) => {
        selected ? await update(selected.id, data) : await create(data);
        setIsFormOpen(false);
        setSelected(null);
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

    // Calculate overdue tasks
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const overdueTasks = tasks.filter((t: any) => {
        if (!t.dueDate) return false;
        const dueDate = new Date(t.dueDate);
        return dueDate < today;
    });
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
            onClick: () => { setSelected(selectedRows[0]); setIsFormOpen(true); },
            disabled: selectedRows.length !== 1,
            variant: 'ghost'
        },
        {
            key: 'delete',
            label: 'Delete',
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
                window.location.reload(); // Temporary fallback as useDailyTasks doesn't expose refresh
            },
            variant: 'ghost'
        },
        {
            key: 'export',
            label: 'Export to Excel',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
            onClick: () => {
                const dataToExport = selectedRows.length > 0 ? selectedRows : filteredData;
                exportToCsv(dataToExport, 'daily-tasks');
            },
            variant: 'ghost'
        }
    ];

    const filterContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
                <label className="block text-xs font-medium text-dark-700 mb-1">
                    Status
                </label>
                <select className="input w-full text-sm h-8" title="Filter by status">
                    <option value="">All</option>
                    <option value="not-started">Not Started</option>
                    <option value="in-progress">In Progress</option>
                    <option value="blocked">Blocked</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-dark-700 mb-1">
                    Priority
                </label>
                <select className="input w-full text-sm h-8" title="Filter by priority">
                    <option value="">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-dark-700 mb-1">
                    Sort by
                </label>
                <select className="input w-full text-sm h-8" title="Sort by">
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
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

    return (
        <div className="space-y-2 animate-fade-in">
            {/* Header */}
            <div className="card p-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-dark-900">Daily Tasks</h1>
                        <p className="text-sm text-dark-500">Incomplete tasks due today or earlier</p>
                    </div>
                </div>
            </div>

            <CommandBar
                onSearch={setSearchQuery}
                searchValue={searchQuery}
                onFilterClick={() => setShowFilters(!showFilters)}
                isFilterActive={showFilters}
                filterContent={filterContent}
                items={commandBarItems}
                selectedCount={selectedRows.length}
            />

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                    { label: 'Total Due', value: tasks.length, color: 'text-dark-900' },
                    { label: 'Overdue', value: overdueTasks.length, color: 'text-danger-600' },
                    { label: 'In Progress', value: tasks.filter((t: any) => t.status === 'in-progress').length, color: 'text-primary-600' },
                    { label: 'Blocked', value: tasks.filter((t: any) => t.status === 'blocked').length, color: 'text-warning-600' },
                ].map(stat => (
                    <div key={stat.label} className="card p-3 text-center">
                        <div className="text-xs text-dark-500">{stat.label}</div>
                        <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    </div>
                ))}
            </div>

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
                    emptyMessage={searchQuery ? "No matching tasks found" : "No daily tasks - great job! 🎉"}
                    onRowClick={(row) => {
                        setSelected(row);
                        setIsFormOpen(true);
                    }}
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
                onConfirm={async () => { if (deleteItem) await remove(deleteItem.id); setDeleteItem(null); }}
                title="Delete Task" message={`Delete "${deleteItem?.title}"?`} isLoading={isLoading} />
        </div>
    );
}
