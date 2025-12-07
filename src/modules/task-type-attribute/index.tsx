import { useState } from 'react';
import type { TaskTypeAttribute, TableColumn } from '@/types';
import { useDataverse } from '@stores/dataverseStore';
import { Button } from '@components/ui';
import { DataTable } from '@components/shared';
import { Plus } from 'lucide-react';

export function TaskTypeAttributePage() {
    const { taskTypeAttributes, isLoading } = useDataverse();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    const columns: TableColumn<TaskTypeAttribute>[] = [
        { key: 'label', label: 'Name', sortable: true },
        { key: 'name', label: 'Attribute', sortable: true, render: (v) => <span className="font-mono text-xs bg-dark-100 px-2 py-0.5 rounded">{v as string}</span> },
        { key: 'group', label: 'Group', render: (v) => (v as string) || '-' },
        { key: 'options', label: 'Options', render: (v) => (v as string[])?.join(', ') || '-' },
    ];

    // Filter based on search query
    const filteredData = taskTypeAttributes.filter(item =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.group?.toLowerCase().includes(searchQuery.toLowerCase())
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
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                        >
                            Add attribute
                        </Button>
                    </div>

                    {/* Right side - Filter & Search */}
                    <div className="flex items-center gap-2 flex-1 justify-end">
                        <Button
                            variant={showFilters ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                            leftIcon={<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>}
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
                                    Group
                                </label>
                                <select className="input w-full text-sm h-8" title="Lọc theo group">
                                    <option value="">Tất cả</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-dark-700 mb-1">
                                    Sắp xếp
                                </label>
                                <select className="input w-full text-sm h-8" title="Sắp xếp theo">
                                    <option value="label">Name (A-Z)</option>
                                    <option value="name">Attribute (A-Z)</option>
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
                <DataTable<TaskTypeAttribute>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    emptyMessage={searchQuery ? "Không tìm thấy kết quả phù hợp" : "Chưa có thuộc tính nào"}
                />
            </div>
        </div>
    );
}
