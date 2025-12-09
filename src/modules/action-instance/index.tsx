import { useState } from 'react';
import { z } from 'zod';
import type { ActionInstance, TableColumn, FormField } from '@/types';

import { Button } from '@components/ui';
import { Modal, ConfirmModal, DataTable, FormBuilder, StatusBadge, CommandBar } from '@components/shared';
import { formatDateTime } from '@utils/index';
import { Plus } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useActionInstances } from './hooks';

const schema = z.object({
    actionTypeId: z.string().min(1, 'Loại hành động là bắt buộc'),
    taskInstanceId: z.string().min(1, 'Công việc là bắt buộc'),
    status: z.enum(['pending', 'completed', 'failed', 'skipped']),
    executedAt: z.date().optional().nullable(),
    result: z.string().max(500).optional(),
    notes: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

const statusOptions = [
    { value: 'pending', label: 'Chờ xử lý' },
    { value: 'completed', label: 'Hoàn thành' },
    { value: 'failed', label: 'Thất bại' },
    { value: 'skipped', label: 'Bỏ qua' },
];

export function ActionInstancePage() {
    const {
        actions: items,
        isLoading,
        create,
        update,
        remove,
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
        { key: 'actionTypeId', label: 'Loại hành động', sortable: true, render: (v) => getActionTypeName(v as string) },
        { key: 'taskInstanceId', label: 'Công việc', render: (v) => <span className="line-clamp-1">{getTaskName(v as string)}</span> },
        { key: 'status', label: 'Trạng thái', sortable: true, width: '130px', render: (v) => <StatusBadge status={v as string} /> },
        { key: 'executedAt', label: 'Thời gian', sortable: true, width: '150px', render: (v) => v ? formatDateTime(v as Date) : '-' },
    ];

    const formFields: FormField[] = [
        { name: 'actionTypeId', label: 'Loại hành động', type: 'select', options: actionTypeOptions, required: true, placeholder: 'Chọn loại' },
        { name: 'taskInstanceId', label: 'Công việc', type: 'select', options: taskOptions, required: true, placeholder: 'Chọn công việc' },
        { name: 'status', label: 'Trạng thái', type: 'select', options: statusOptions, required: true },
        { name: 'executedAt', label: 'Thời gian thực hiện', type: 'datetime' },
        { name: 'result', label: 'Kết quả', type: 'textarea', placeholder: 'Kết quả thực hiện' },
        { name: 'notes', label: 'Ghi chú', type: 'textarea', placeholder: 'Ghi chú thêm' },
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
    const filteredData = items.filter(item =>
        getActionTypeName(item.actionTypeId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTaskName(item.taskInstanceId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.result?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filterContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Trạng thái
                </label>
                <select className="input w-full text-sm h-8" title="Lọc theo trạng thái">
                    <option value="">Tất cả</option>
                    {statusOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Sắp xếp
                </label>
                <select className="input w-full text-sm h-8" title="Sắp xếp theo">
                    <option value="executedAt">Thời gian</option>
                    <option value="status">Trạng thái</option>
                </select>
            </div>
            <div className="flex items-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="w-full"
                >
                    Đóng bộ lọc
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
                title="Added new action (c)"
            >
                Add new
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
                    onClick={() => setDeleteItem(selectedRows[0])} // Note: This only deletes first selected item for now
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
                <DataTable<ActionInstance>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    onEdit={undefined}
                    onDelete={undefined}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "Không tìm thấy kết quả phù hợp" : "Chưa có hành động nào"}
                />
            </div>

            {/* Modals */}
            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }} title={selected ? 'Chỉnh sửa' : 'Thêm hành động'} size="lg">
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
                title="Xóa hành động" message="Bạn có chắc chắn muốn xóa?" isLoading={isLoading} />
        </div>
    );
}
