import { useState } from 'react';
import { z } from 'zod';
import type { TableColumn, FormField } from '@/types';
import { useDataverse } from '@stores/dataverseStore';
import type { EventSourceTypeNew } from '@services/dataverseTypes';
import { Button } from '@components/ui';
import { Modal, ConfirmModal, DataTable, FormBuilder } from '@components/shared';
import { Plus, Webhook } from 'lucide-react';

const schema = z.object({
    name: z.string().min(1, 'Tên là bắt buộc').max(100),
    code: z.string().min(1, 'Mã là bắt buộc').max(20),
    description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof schema>;

const formFields: FormField[] = [
    { name: 'name', label: 'Tên nguồn sự kiện', type: 'text', placeholder: 'VD: API Gateway', required: true },
    { name: 'code', label: 'Mã', type: 'text', placeholder: 'VD: API', required: true },
    { name: 'description', label: 'Mô tả', type: 'textarea', placeholder: 'Mô tả chi tiết' },
];

const columns: TableColumn<EventSourceTypeNew>[] = [
    { key: 'code', label: 'Mã', sortable: true, width: '120px', render: (v) => <span className="font-mono text-sm bg-dark-100 px-2 py-0.5 rounded">{v as string}</span> },
    { key: 'name', label: 'Tên', sortable: true },
    { key: 'description', label: 'Mô tả', render: (v) => <span className="text-dark-500 line-clamp-1">{(v as string) || '-'}</span> },
];

export function EventSourceTypePage() {
    const { eventSourceTypes, isLoading } = useDataverse();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<EventSourceTypeNew | null>(null);
    const [deleteItem, setDeleteItem] = useState<EventSourceTypeNew | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<EventSourceTypeNew[]>([]);

    const handleSubmit = async (data: FormData) => {
        console.warn('Submit not implemented for Dataverse');
        setIsFormOpen(false); setSelected(null);
    };

    // Filter based on search query
    const filteredData = eventSourceTypes.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
                            leftIcon={<Webhook className="w-3.5 h-3.5" />}
                        >
                            <span className="hidden sm:inline">Bộ lọc</span>
                        </Button>
                        <div className="w-full sm:w-auto sm:max-w-xs">
                            <div className="relative">
                                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dark-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="input pl-9 pr-9 py-1.5 text-sm h-8 w-full"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery('')}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600 transition-colors"
                                        title="Xóa tìm kiếm"
                                    >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
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
                                    Sắp xếp
                                </label>
                                <select className="input w-full text-sm h-8" title="Sắp xếp theo">
                                    <option value="name">Tên (A-Z)</option>
                                    <option value="code">Mã (A-Z)</option>
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
                <DataTable<EventSourceTypeNew>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    onEdit={undefined}
                    onDelete={undefined}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "Không tìm thấy kết quả phù hợp" : "Chưa có nguồn sự kiện nào"}
                />
            </div>

            {/* Modals */}
            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }} title={selected ? 'Chỉnh sửa' : 'Thêm nguồn sự kiện'} size="md">
                <FormBuilder<FormData> fields={formFields} schema={schema}
                    defaultValues={selected ? { name: selected.name, code: selected.code, description: selected.description } : {}}
                    onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} isLoading={isLoading} />
            </Modal>
            <ConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)} onConfirm={async () => { setDeleteItem(null); }}
                title="Xóa nguồn sự kiện" message={`Xóa "${deleteItem?.name}"?`} isLoading={isLoading} />
        </div>
    );
}
