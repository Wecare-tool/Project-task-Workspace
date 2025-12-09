import { useState } from 'react';
import type { TaskType, TableColumn } from '@/types';
import { Button } from '@components/ui'; // Input removed
import { Modal, ConfirmModal, DataTable, FormBuilder, CommandBar } from '@components/shared';
import { Plus } from 'lucide-react';
import { useTaskTypes } from './hooks';
import { taskTypeSchema, taskTypeFormFields, type TaskTypeFormData } from './schema';
import { useToast } from '@/hooks/useToast';

const columns: TableColumn<TaskType>[] = [
    {
        key: 'code', label: 'Mã', sortable: true, width: '100px',
        render: (v) => <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">{v as string}</span>
    },
    {
        key: 'name', label: 'Tên loại', sortable: true,
        render: (v, row) => (
            <div className="flex items-center gap-2">
                {row.color && (
                    <div
                        className="w-3 h-3 rounded-full task-type-color-indicator"
                        style={{ backgroundColor: row.color }}
                    />
                )}
                <span className="font-medium text-neutral-900">{v as string}</span>
            </div>
        )
    },
    { key: 'description', label: 'Mô tả', render: (v) => <span className="text-neutral-500 line-clamp-1">{(v as string) || '-'}</span> },
];

export function TaskTypePage() {
    const toast = useToast();
    const { taskTypes, isLoading, create, update, remove } = useTaskTypes();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<TaskType | null>(null);
    const [deleteItems, setDeleteItems] = useState<TaskType[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<TaskType[]>([]);

    const handleSubmit = async (data: TaskTypeFormData) => {
        try {
            if (selected) {
                await update(selected.id, data);
                toast.success('Cập nhật loại công việc thành công');
            } else {
                await create(data);
                toast.success('Tạo loại công việc mới thành công');
            }
            setIsFormOpen(false);
            setSelected(null);
        } catch (error) {
            toast.error('Có lỗi xảy ra');
        }
    };

    // Filter task types based on search query
    const filteredTaskTypes = taskTypes.filter((task: any) =>
        task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filterContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
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
                <label className="block text-xs font-medium text-neutral-700 mb-1">
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
                    onClick={() => setDeleteItems(selectedRows)}
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
                <DataTable<TaskType>
                    data={filteredTaskTypes}
                    columns={columns}
                    keyField="id"
                    searchable={false}
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

            <ConfirmModal isOpen={deleteItems.length > 0} onClose={() => setDeleteItems([])}
                onConfirm={async () => {
                    try {
                        for (const item of deleteItems) {
                            await remove(item.id);
                        }
                        toast.success('Đã xóa thành công');
                        setDeleteItems([]);
                        setSelectedRows([]);
                    } catch (error) {
                        toast.error('Có lỗi xảy ra khi xóa');
                    }
                }}
                title="Xóa loại công việc"
                message={deleteItems.length > 1
                    ? `Bạn có chắc chắn muốn xóa ${deleteItems.length} loại công việc đã chọn?`
                    : `Xóa "${deleteItems[0]?.name}"?`
                }
                isLoading={isLoading} />
        </div>
    );
}
