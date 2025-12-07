import { useState } from 'react';
import type { TaskType, TableColumn } from '@/types';
import { Button, Input } from '@components/ui';
import { Modal, ConfirmModal, DataTable, FormBuilder } from '@components/shared';
import { Plus, Search, Filter, X } from 'lucide-react';
import { useTaskTypes } from './hooks';
import { taskTypeSchema, taskTypeFormFields, type TaskTypeFormData } from './schema';

const columns: TableColumn<TaskType>[] = [
    {
        key: 'code', label: 'Mã', sortable: true, width: '100px',
        render: (v) => <span className="font-mono text-xs bg-dark-100 px-2 py-0.5 rounded">{v as string}</span>
    },
    {
        key: 'name', label: 'Tên loại', sortable: true,
        render: (v, row) => (
            <div className="flex items-center gap-2">
                {row.color && <div className="w-3 h-3 rounded-full" style={{ backgroundColor: row.color }} />}
                <span className="font-medium">{v as string}</span>
            </div>
        )
    },
    { key: 'description', label: 'Mô tả', render: (v) => <span className="text-dark-500 line-clamp-1">{(v as string) || '-'}</span> },
];

export function TaskTypePage() {
    const { taskTypes, isLoading, create, update, remove } = useTaskTypes();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<TaskType | null>(null);
    const [deleteItem, setDeleteItem] = useState<TaskType | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<TaskType[]>([]);

    const handleSubmit = async (data: TaskTypeFormData) => {
        selected ? await update(selected.id, data) : await create(data);
        setIsFormOpen(false);
        setSelected(null);
    };

    // Filter task types based on search query
    const filteredTaskTypes = taskTypes.filter(task =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
                                    Màu sắc
                                </label>
                                <select className="input w-full text-sm h-8" title="Lọc theo màu sắc">
                                    <option value="">Tất cả</option>
                                    <option value="blue">Xanh dương</option>
                                    <option value="green">Xanh lá</option>
                                    <option value="red">Đỏ</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-dark-700 mb-1">
                                    Sắp xếp
                                </label>
                                <select className="input w-full text-sm h-8" title="Sắp xếp theo">
                                    <option value="name">Tên (A-Z)</option>
                                    <option value="code">Mã (A-Z)</option>
                                    <option value="date">Ngày tạo</option>
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
                <DataTable<TaskType>
                    data={filteredTaskTypes}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    onEdit={undefined}
                    onDelete={undefined}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "Không tìm thấy kết quả phù hợp" : "Chưa có loại công việc nào"}
                />
            </div>

            {/* Modals */}
            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }}
                title={selected ? 'Chỉnh sửa' : 'Thêm loại công việc'} size="md">
                <FormBuilder<TaskTypeFormData> fields={taskTypeFormFields} schema={taskTypeSchema}
                    defaultValues={selected ? { name: selected.name, code: selected.code, description: selected.description, color: selected.color } : {}}
                    onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} isLoading={isLoading} />
            </Modal>

            <ConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)}
                onConfirm={async () => { if (deleteItem) await remove(deleteItem.id); setDeleteItem(null); }}
                title="Xóa loại công việc" message={`Xóa "${deleteItem?.name}"?`} isLoading={isLoading} />
        </div>
    );
}
