import { useState } from 'react';
import { z } from 'zod';
import type { TaskDependency, TableColumn, FormField } from '@/types';
import { Button } from '@components/ui';
import { Modal, ConfirmModal, DataTable, FormBuilder, CommandBar } from '@components/shared';
import { Plus, ArrowRight } from 'lucide-react';
import { useTaskDependencies } from './hooks';

const schema = z.object({
    parentTaskId: z.string().min(1, 'Công việc cha là bắt buộc'),
    childTaskId: z.string().min(1, 'Công việc con là bắt buộc'),
    dependencyType: z.enum(['blocks', 'required-by', 'relates-to']),
}).refine(data => data.parentTaskId !== data.childTaskId, {
    message: 'Công việc cha và con không được giống nhau',
    path: ['childTaskId'],
});

type FormData = z.infer<typeof schema>;

const dependencyTypeOptions = [
    { value: 'blocks', label: 'Chặn (Blocks)' },
    { value: 'required-by', label: 'Yêu cầu bởi (Required by)' },
    { value: 'relates-to', label: 'Liên quan đến (Relates to)' },
];

export function TaskDependencyPage() {
    const {
        dependencies: items,
        isLoading,
        create,
        update,
        remove,
        taskOptions,
        getTaskName
    } = useTaskDependencies();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<TaskDependency | null>(null);
    const [deleteItem, setDeleteItem] = useState<TaskDependency | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<TaskDependency[]>([]);

    const columns: TableColumn<TaskDependency>[] = [
        { key: 'parentTaskId', label: 'Công việc nguồn', render: (v) => <span className="line-clamp-1 font-medium text-neutral-900">{getTaskName(v as string)}</span> },
        {
            key: 'dependencyType', label: '', width: '140px', render: (v) => (
                <div className="flex items-center gap-2 text-neutral-400">
                    <ArrowRight className="w-4 h-4" />
                    <span className="text-xs">{dependencyTypeOptions.find(o => o.value === v)?.label || v as string}</span>
                </div>
            )
        },
        { key: 'childTaskId', label: 'Công việc đích', render: (v) => <span className="line-clamp-1 font-medium text-neutral-900">{getTaskName(v as string)}</span> },
    ];

    const formFields: FormField[] = [
        { name: 'parentTaskId', label: 'Công việc nguồn', type: 'select', options: taskOptions, required: true, placeholder: 'Chọn công việc' },
        { name: 'dependencyType', label: 'Loại quan hệ', type: 'select', options: dependencyTypeOptions, required: true },
        { name: 'childTaskId', label: 'Công việc đích', type: 'select', options: taskOptions, required: true, placeholder: 'Chọn công việc' },
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
        getTaskName(item.parentTaskId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTaskName(item.childTaskId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dependencyType.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filterContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Loại quan hệ
                </label>
                <select className="input w-full text-sm h-8" title="Lọc theo loại">
                    <option value="">Tất cả</option>
                    {dependencyTypeOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Sắp xếp
                </label>
                <select className="input w-full text-sm h-8" title="Sắp xếp theo">
                    <option value="parent">Công việc nguồn</option>
                    <option value="child">Công việc đích</option>
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
                Add dependency
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
                <DataTable<TaskDependency>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    onEdit={undefined}
                    onDelete={undefined}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "Không tìm thấy kết quả phù hợp" : "Chưa có quan hệ phụ thuộc nào"}
                />
            </div>

            {/* Modals */}
            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }} title={selected ? 'Chỉnh sửa' : 'Thêm phụ thuộc'} size="md">
                <FormBuilder<FormData> fields={formFields} schema={schema}
                    defaultValues={selected ? { parentTaskId: selected.parentTaskId, childTaskId: selected.childTaskId, dependencyType: selected.dependencyType } : { dependencyType: 'blocks' }}
                    onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} isLoading={isLoading} />
            </Modal>
            <ConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)}
                onConfirm={async () => {
                    if (deleteItem) {
                        await remove(deleteItem.id);
                    }
                    setDeleteItem(null);
                }}
                title="Xóa phụ thuộc" message="Bạn có chắc chắn muốn xóa quan hệ này?" isLoading={isLoading} />
        </div>
    );
}
