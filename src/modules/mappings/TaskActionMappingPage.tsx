import { useEffect, useState } from 'react';
import { useDataverse } from '@stores/dataverseStore';
import { Button } from '@components/ui';
import { DataTable } from '@components/shared';
import type { TableColumn } from '@/types';
import type { TaskTypeAction } from '@services/dataverseTypes';
import { RefreshCw } from 'lucide-react';

export function TaskActionMappingPage() {
    const {
        taskTypeActions,
        taskTypes,
        actionTypeNews,
        isLoading,
        isInitialized,
        refreshTaskTypeActions,
        initialize,
    } = useDataverse();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (!isInitialized && !isLoading) {
            initialize();
        }
    }, [isInitialized, isLoading, initialize]);

    const getTaskTypeName = (id: string) => taskTypes.find(t => t.id === id)?.name || id.slice(0, 8);
    const getActionTypeName = (id: string) => actionTypeNews.find(a => a.id === id)?.name || id.slice(0, 8);

    const columns: TableColumn<TaskTypeAction>[] = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'taskTypeId', label: 'Task Type', sortable: true, render: (v) => getTaskTypeName(v as string) },
        { key: 'actionTypeId', label: 'Action Type', sortable: true, render: (v) => getActionTypeName(v as string) },
        { key: 'order', label: 'Order', sortable: true },
        { key: 'inCharge', label: 'In Charge', render: (v) => (v as string) || '-' },
        { key: 'duration', label: 'Duration', render: (v) => (v as React.ReactNode) ?? '-' },
    ];

    // Filter based on search query
    const filteredData = taskTypeActions.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTaskTypeName(item.taskTypeId).toLowerCase().includes(searchQuery.toLowerCase()) ||
        getActionTypeName(item.actionTypeId).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-2 animate-fade-in">
            {/* Command Bar */}
            <div className="card p-3">
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                    {/* Left side - Action Buttons */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={refreshTaskTypeActions}
                            isLoading={isLoading}
                            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                        >
                            Refresh
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                            <div>
                                <label className="block text-xs font-medium text-dark-700 mb-1">
                                    Task Type
                                </label>
                                <select className="input w-full text-sm h-8" title="Lọc theo task type">
                                    <option value="">Tất cả</option>
                                    {taskTypes.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-dark-700 mb-1">
                                    Action Type
                                </label>
                                <select className="input w-full text-sm h-8" title="Lọc theo action type">
                                    <option value="">Tất cả</option>
                                    {actionTypeNews.map(a => (
                                        <option key={a.id} value={a.id}>{a.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-dark-700 mb-1">
                                    Sắp xếp
                                </label>
                                <select className="input w-full text-sm h-8" title="Sắp xếp theo">
                                    <option value="name">Name (A-Z)</option>
                                    <option value="order">Order</option>
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
                <DataTable<TaskTypeAction>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    emptyMessage={searchQuery ? "Không tìm thấy kết quả phù hợp" : "No data"}
                />
                <div className="mt-4 text-sm text-dark-400">
                    Total: {filteredData.length} records
                </div>
            </div>
        </div>
    );
}
