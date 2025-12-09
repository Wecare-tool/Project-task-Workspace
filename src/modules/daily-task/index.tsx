import { useState } from 'react';
import type { TaskInstance, TableColumn } from '@/types';
import { Button, Input } from '@components/ui';
import { Modal, ConfirmModal, DataTable, FormBuilder, StatusBadge, PriorityBadge } from '@components/shared';
import { Plus, Search, Filter, X, Calendar } from 'lucide-react';
import { formatDate } from '@utils/index';
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

            {/* Command Bar */}
            <div className="card p-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                    {/* Left side - Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => { setSelected(null); setIsFormOpen(true); }}
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
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
                            >
                                Delete
                            </Button>
                        )}
                    </div>

                    {/* Right side - Filter & Search */}
                    <div className="flex items-center gap-2 flex-1 justify-end">
                        <Button
                            variant={showFilters ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            leftIcon={<Filter className="w-3.5 h-3.5" />}
                        >
                            <span className="hidden sm:inline">Bộ lọc</span>
                        </Button>
                        <div className="w-full sm:w-auto sm:max-w-xs">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-400" />
                                <Input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 pr-9 py-1.5 text-sm h-8"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors"
                                        title="Xóa tìm kiếm"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter Panel (collapsible) */}
                {showFilters && (
                    <div className="mt-3 pt-3 border-t border-dark-100 animate-slide-down">
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
                    </div>
                )}
            </div>

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
                    onEdit={undefined}
                    onDelete={undefined}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "No matching tasks found" : "No daily tasks - great job! 🎉"}
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
