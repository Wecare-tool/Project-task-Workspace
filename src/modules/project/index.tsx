import { useState } from 'react';
import type { ProjectNew } from '@services/dataverseTypes';
import { Button } from '@components/ui';
import { DataTable, CommandBar } from '@components/shared';
import { Plus, RefreshCw } from 'lucide-react';
import { useProjects } from './hooks';
import type { TableColumn } from '@/types';
import { formatDate } from '@utils/index';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export function ProjectPage() {
    const { projects, isLoading, refresh } = useProjects();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<ProjectNew[]>([]);

    useKeyboardShortcuts([
        {
            combo: { key: 'c' },
            handler: () => {
                console.warn('Create not implemented for Dataverse projects yet');
            },
            description: 'Create new project'
        },
        {
            combo: { key: 'r', ctrl: true },
            handler: () => {
                refresh();
            },
            description: 'Refresh data'
        }
    ]);

    const columns: TableColumn<ProjectNew>[] = [
        { key: 'name', label: 'Tên dự án', sortable: true },
        { key: 'projectType', label: 'Loại', sortable: true, render: (v) => (v as string) || '-' },
        { key: 'status', label: 'Trạng thái', sortable: true, render: (v) => (v as string) || '-' },
        { key: 'priority', label: 'Độ ưu tiên', sortable: true, render: (v) => (v as string) || '-' },
        { key: 'department', label: 'Phòng ban', render: (v) => (v as string) || '-' },
        { key: 'startDate', label: 'Ngày bắt đầu', render: (v) => v ? formatDate(v as Date) : '-' },
        { key: 'endDate', label: 'Ngày kết thúc', render: (v) => v ? formatDate(v as Date) : '-' },
    ];

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.department?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filterContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Trạng thái
                </label>
                <select className="input w-full text-sm h-8" title="Lọc theo trạng thái">
                    <option value="">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="completed">Hoàn thành</option>
                    <option value="on-hold">Tạm dừng</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Sắp xếp
                </label>
                <select className="input w-full text-sm h-8" title="Sắp xếp theo">
                    <option value="name">Tên dự án</option>
                    <option value="startDate">Ngày bắt đầu</option>
                    <option value="priority">Độ ưu tiên</option>
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
                onClick={() => console.warn('Create not implemented')}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
                title="Create project (c)"
            >
                Add new
            </Button>
            <Button
                variant="secondary"
                size="sm"
                onClick={refresh}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
                Refresh
            </Button>
            {selectedRows.length === 1 && (
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => console.warn('Edit not implemented')}
                    leftIcon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                >
                    Edit
                </Button>
            )}
            {selectedRows.length > 0 && (
                <Button
                    variant="danger"
                    size="sm"
                    onClick={() => console.warn('Delete not implemented')}
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
                <DataTable<ProjectNew>
                    data={filteredProjects}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "Không tìm thấy kết quả phù hợp" : "Chưa có dự án nào"}
                />
            </div>
        </div>
    );
}
