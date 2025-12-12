import { useEffect, useState } from 'react';
import { useDataverse } from '@stores/dataverseStore';
import { Button } from '@components/ui';
import { DataTable, CommandBar, type CommandBarItem } from '@components/shared';
import type { TableColumn } from '@/types';
import type { TaskTypeAttributeMapping } from '@services/dataverseTypes';
import { exportToCsv } from '@/utils/exportUtils';
import { Plus } from 'lucide-react';

export function TaskAttributeMappingPage() {
    const {
        taskTypeAttributeMappings,
        taskTypes,
        isLoading,
        isInitialized,
        refreshTaskTypeAttributeMappings,
        initialize,
    } = useDataverse();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<TaskTypeAttributeMapping[]>([]);

    useEffect(() => {
        if (!isInitialized && !isLoading) {
            initialize();
        }
    }, [isInitialized, isLoading, initialize]);

    const getTaskTypeName = (id: string) => taskTypes.find((t: any) => t.id === id)?.name || id.slice(0, 8);

    const columns: TableColumn<TaskTypeAttributeMapping>[] = [
        { key: 'name', label: 'Name', sortable: true },
        { key: 'taskTypeId', label: 'Task Type', sortable: true, render: (v) => getTaskTypeName(v as string) },
        { key: 'attributeId', label: 'Attribute ID', render: (v) => <span className="font-mono text-xs">{(v as string).slice(0, 12)}...</span> },
        { key: 'isVisible', label: 'Visible', render: (v) => v ? 'Yes' : 'No' },
    ];

    // Filter based on search query
    const filteredData = taskTypeAttributeMappings.filter((item: any) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getTaskTypeName(item.taskTypeId).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const commandBarItems: CommandBarItem[] = [
        {
            key: 'new',
            label: 'New',
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: () => { },
            disabled: true,
            variant: 'ghost'
        },
        {
            key: 'edit',
            label: 'Edit',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
            onClick: () => { },
            disabled: true,
            variant: 'ghost'
        },
        {
            key: 'deactivate',
            label: 'Deactivate',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
            onClick: () => { },
            disabled: true,
            variant: 'ghost'
        },
        {
            key: 'refresh',
            label: 'Refresh',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
            onClick: refreshTaskTypeAttributeMappings,
            variant: 'ghost'
        },
        {
            key: 'export',
            label: 'Export to Excel',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
            onClick: () => {
                const dataToExport = selectedRows.length > 0 ? selectedRows : filteredData;
                exportToCsv(dataToExport, 'task-attribute-mappings');
            },
            variant: 'ghost'
        }
    ];

    const filterContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
                <label className="block text-xs font-medium text-dark-700 mb-1">
                    Task Type
                </label>
                <select className="input w-full text-sm h-8" title="Lọc theo task type">
                    <option value="">Tất cả</option>
                    {taskTypes.map((t: any) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-dark-700 mb-1">
                    Sắp xếp
                </label>
                <select className="input w-full text-sm h-8" title="Sắp xếp theo">
                    <option value="name">Name (A-Z)</option>
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

    return (
        <div className="space-y-2 animate-fade-in">
            <CommandBar
                onSearch={setSearchQuery}
                searchValue={searchQuery}
                onFilterClick={() => setShowFilters(!showFilters)}
                isFilterActive={showFilters}
                filterContent={filterContent}
                items={commandBarItems}
                selectedCount={selectedRows.length}
            />

            {/* Data Table */}
            <div className="card p-3">
                <DataTable<TaskTypeAttributeMapping>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    emptyMessage={searchQuery ? "Không tìm thấy kết quả phù hợp" : "No data"}
                    selectable
                    onSelectionChange={setSelectedRows}
                    onRowClick={(row) => {
                        console.log('Row clicked', row);
                    }}
                />
                <div className="mt-4 text-sm text-dark-400">
                    Total: {filteredData.length} records
                </div>
            </div>
        </div>
    );
}
