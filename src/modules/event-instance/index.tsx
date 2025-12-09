import { useState } from 'react';
import { z } from 'zod';
import type { EventInstance, TableColumn, FormField } from '@/types';

import { Button } from '@components/ui';
import { Modal, ConfirmModal, DataTable, FormBuilder, CommandBar } from '@components/shared';
import { formatDateTime } from '@utils/index';
import { Plus } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useEventInstances } from './hooks';

const schema = z.object({
    eventTypeId: z.string().min(1, 'Loại sự kiện là bắt buộc'),
    taskInstanceId: z.string().min(1, 'Công việc là bắt buộc'),
    timestamp: z.date({ required_error: 'Thời gian là bắt buộc' }),
    source: z.string().max(100).optional(),
});

type FormData = z.infer<typeof schema>;

export function EventInstancePage() {

    const {
        events: items,
        isLoading,
        create,
        update,
        remove,
        eventTypeOptions,
        taskOptions,
        getEventTypeName,
        getTaskName
    } = useEventInstances();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<EventInstance | null>(null);
    const [deleteItem, setDeleteItem] = useState<EventInstance | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<EventInstance[]>([]);

    useKeyboardShortcuts([
        {
            combo: { key: 'c' },
            handler: () => {
                setSelected(null);
                setIsFormOpen(true);
            },
            description: 'Create new event'
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

    const columns: TableColumn<EventInstance>[] = [
        { key: 'eventTypeId', label: 'Loại sự kiện', sortable: true, render: (v) => getEventTypeName(v as string) },
        { key: 'taskInstanceId', label: 'Công việc', render: (v) => <span className="line-clamp-1">{getTaskName(v as string)}</span> },
        { key: 'timestamp', label: 'Thời gian', sortable: true, width: '160px', render: (v) => formatDateTime(v as Date) },
        { key: 'source', label: 'Nguồn', width: '120px', render: (v) => (v as string) || '-' },
    ];

    const formFields: FormField[] = [
        { name: 'eventTypeId', label: 'Loại sự kiện', type: 'select', options: eventTypeOptions, required: true, placeholder: 'Chọn loại' },
        { name: 'taskInstanceId', label: 'Công việc', type: 'select', options: taskOptions, required: true, placeholder: 'Chọn công việc' },
        { name: 'timestamp', label: 'Thời gian', type: 'datetime', required: true },
        { name: 'source', label: 'Nguồn', type: 'text', placeholder: 'VD: API, Manual...' },
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
            // Error handled in hook
        }
    };

    // Filter based on search query
    const filteredData = items.filter((item: any) =>
        getEventTypeName(item.eventTypeId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTaskName(item.taskInstanceId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filterContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Loại sự kiện
                </label>
                <select className="input w-full text-sm h-8" title="Lọc theo loại">
                    <option value="">Tất cả</option>
                    {eventTypeOptions.map((e: any) => (
                        <option key={e.value} value={e.value}>{e.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Sắp xếp
                </label>
                <select className="input w-full text-sm h-8" title="Sắp xếp theo">
                    <option value="timestamp">Thời gian</option>
                    <option value="eventType">Loại sự kiện</option>
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
                    onClick={() => setDeleteItem(selectedRows[0])}
                    leftIcon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>}
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
                <DataTable<EventInstance>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "Không tìm thấy kết quả phù hợp" : "Chưa có sự kiện nào"}
                />
            </div>

            {/* Modals */}
            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }} title={selected ? 'Chỉnh sửa' : 'Thêm sự kiện'} size="md">
                <FormBuilder<FormData> fields={formFields} schema={schema}
                    defaultValues={selected ? { ...selected, timestamp: new Date(selected.timestamp) } : { timestamp: new Date() }}
                    onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} isLoading={isLoading} />
            </Modal>
            <ConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)}
                onConfirm={async () => {
                    if (deleteItem) {
                        await remove(deleteItem.id);
                    }
                    setDeleteItem(null);
                }}
                title="Xóa sự kiện" message="Bạn có chắc chắn muốn xóa?" isLoading={isLoading} />
        </div>
    );
}
