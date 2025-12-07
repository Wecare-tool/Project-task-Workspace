import { useState, useCallback, useMemo } from 'react';
import { z } from 'zod';
import type { EventInstance, TableColumn, FormField } from '@/types';
import { eventInstanceStorage, eventTypeStorage, taskInstanceStorage } from '@services/index';
import { toast } from '@stores/index';
import { Button, Input } from '@components/ui';
import { Modal, ConfirmModal, DataTable, FormBuilder } from '@components/shared';
import { formatDateTime } from '@utils/index';
import { Plus, Search, Filter, X } from 'lucide-react';

const schema = z.object({
    eventTypeId: z.string().min(1, 'Loại sự kiện là bắt buộc'),
    taskInstanceId: z.string().min(1, 'Công việc là bắt buộc'),
    timestamp: z.date({ required_error: 'Thời gian là bắt buộc' }),
    source: z.string().max(100).optional(),
});

type FormData = z.infer<typeof schema>;

export function EventInstancePage() {
    const [items, setItems] = useState<EventInstance[]>(() => eventInstanceStorage.getAll());
    const [isLoading, setIsLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<EventInstance | null>(null);
    const [deleteItem, setDeleteItem] = useState<EventInstance | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<EventInstance[]>([]);

    const eventTypes = useMemo(() => eventTypeStorage.getAll(), []);
    const tasks = useMemo(() => taskInstanceStorage.getAll(), []);
    const eventTypeOptions = useMemo(() => eventTypes.map(e => ({ value: e.id, label: e.name })), [eventTypes]);
    const taskOptions = useMemo(() => tasks.map(t => ({ value: t.id, label: t.title })), [tasks]);
    const getEventTypeName = useCallback((id: string) => eventTypes.find(e => e.id === id)?.name || '-', [eventTypes]);
    const getTaskName = useCallback((id: string) => tasks.find(t => t.id === id)?.title || '-', [tasks]);

    const refresh = useCallback(() => setItems(eventInstanceStorage.getAll()), []);

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
        setIsLoading(true);
        try {
            if (selected) { eventInstanceStorage.update(selected.id, data); toast.success('Thành công', 'Đã cập nhật'); }
            else { eventInstanceStorage.create(data); toast.success('Thành công', 'Đã tạo'); }
            refresh(); setIsFormOpen(false); setSelected(null);
        } finally { setIsLoading(false); }
    };

    // Filter based on search query
    const filteredData = items.filter(item =>
        getEventTypeName(item.eventTypeId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTaskName(item.taskInstanceId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.source?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-2 animate-fade-in">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-dark-700 mb-1">
                                    Loại sự kiện
                                </label>
                                <select className="input w-full text-sm h-8" title="Lọc theo loại">
                                    <option value="">Tất cả</option>
                                    {eventTypes.map(e => (
                                        <option key={e.id} value={e.id}>{e.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-dark-700 mb-1">
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
                    </div>
                )}
            </div>

            {/* Data Table */}
            <div className="card p-3">
                <DataTable<EventInstance>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    onEdit={undefined}
                    onDelete={undefined}
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
                onConfirm={async () => { if (deleteItem) { eventInstanceStorage.delete(deleteItem.id); refresh(); toast.success('Thành công', 'Đã xóa'); } setDeleteItem(null); }}
                title="Xóa sự kiện" message="Bạn có chắc chắn muốn xóa?" isLoading={isLoading} />
        </div>
    );
}
