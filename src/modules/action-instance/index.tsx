import { useState } from 'react';
import { z } from 'zod';
import type { ActionInstance, TableColumn, FormField } from '@/types';

import { Button } from '@components/ui';
import { Modal, ConfirmModal, DataTable, FormBuilder, StatusBadge, CommandBar, type CommandBarItem } from '@components/shared';
import { formatDateTime } from '@utils/index';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useActionInstances } from './hooks';
import { Plus } from 'lucide-react';
import { exportToCsv } from '@/utils/exportUtils';

const schema = z.object({
    actionTypeId: z.string().min(1, 'Action Type is required'),
    taskInstanceId: z.string().min(1, 'Task is required'),
    status: z.enum(['pending', 'completed', 'failed', 'skipped']),
    executedAt: z.date().optional().nullable(),
    result: z.string().max(500).optional(),
    notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'skipped', label: 'Skipped' },
];

export function ActionInstancePage() {
    const {
        actions: items,
        isLoading,
        create,
        update,
        remove,
        refresh,
        actionTypeOptions,
        taskOptions,
        getActionTypeName,
        getTaskName
    } = useActionInstances();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<ActionInstance | null>(null);
    const [deleteItem, setDeleteItem] = useState<ActionInstance | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<ActionInstance[]>([]);

    useKeyboardShortcuts([
        {
            combo: { key: 'c' },
            handler: () => {
                setSelected(null);
                setIsFormOpen(true);
            },
            description: 'Add new action'
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

    const columns: TableColumn<ActionInstance>[] = [
        { key: 'actionTypeId', label: 'Action Type', sortable: true, render: (v) => getActionTypeName(v as string) },
        { key: 'taskInstanceId', label: 'Task', render: (v) => <span className="line-clamp-1">{getTaskName(v as string)}</span> },
        { key: 'status', label: 'Status', sortable: true, width: '130px', render: (v) => <StatusBadge status={v as string} /> },
        { key: 'executedAt', label: 'Time', sortable: true, width: '150px', render: (v) => v ? formatDateTime(v as Date) : '-' },
    ];

    const formFields: FormField[] = [
        { name: 'actionTypeId', label: 'Action Type', type: 'select', options: actionTypeOptions, required: true, placeholder: 'Select type' },
        { name: 'taskInstanceId', label: 'Task', type: 'select', options: taskOptions, required: true, placeholder: 'Select task' },
        { name: 'status', label: 'Status', type: 'select', options: statusOptions, required: true },
        { name: 'executedAt', label: 'Execution Time', type: 'datetime' },
        { name: 'result', label: 'Result', type: 'textarea', placeholder: 'Execution result' },
        { name: 'notes', label: 'Notes', type: 'textarea', placeholder: 'Additional notes' },
    ];

    const handleSubmit = async (data: FormData) => {
        try {
            if (selected) {
                await update(selected.id, data);
            } else {
                await create(data);
            }
            setIsFormOpen(false);
            setSelected(null);
        } catch (error) {
            // Error managed in hook
        }
    };

    // Filter based on search query
    const filteredData = items.filter((item: any) =>
        getActionTypeName(item.actionTypeId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTaskName(item.taskInstanceId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.result?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filterContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Status
                </label>
                <select className="input w-full text-sm h-8" title="Filter by status">
                    <option value="">All</option>
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Sort by
                </label>
                <select className="input w-full text-sm h-8" title="Sort by">
                    <option value="executedAt">Time</option>
                    <option value="status">Status</option>
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
            key: 'deactivate',
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
                await refresh();
            },
            variant: 'ghost'
        },
        {
            key: 'export',
            label: 'Export to Excel',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
            onClick: () => {
                // Flatten data for export to make it readable
                const dataToExport = (selectedRows.length > 0 ? selectedRows : filteredData).map(item => ({
                    ...item,
                    actionTypeName: getActionTypeName(item.actionTypeId),
                    taskName: getTaskName(item.taskInstanceId),
                    executedAt: item.executedAt ? formatDateTime(item.executedAt) : '-'
                }));
                exportToCsv(dataToExport, 'action-instances');
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
                filterContent={filterContent}
                items={commandBarItems}
                selectedCount={selectedRows.length}
            />

            {/* Data Table */}
            <div className="card p-3">
                <DataTable<ActionInstance>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "No matching results found" : "No actions found"}
                    onRowClick={(row) => {
                        setSelected(row);
                        setIsFormOpen(true);
                    }}
                />
            </div>

            {/* Modals */}
            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }} title={selected ? 'Edit Action' : 'Add Action'} size="lg">
                <FormBuilder<FormData> fields={formFields} schema={schema}
                    defaultValues={selected ? { ...selected, executedAt: selected.executedAt ? new Date(selected.executedAt) : undefined } : { status: 'pending' }}
                    onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} isLoading={isLoading} />
            </Modal>
            <ConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)}
                onConfirm={async () => {
                    if (deleteItem) {
                        await remove(deleteItem.id);
                    }
                    setDeleteItem(null);
                }}
                title="Delete Action" message="Are you sure you want to delete this action?" isLoading={isLoading} />
        </div>
    );
}
