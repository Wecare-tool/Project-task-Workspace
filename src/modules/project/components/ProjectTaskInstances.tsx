import { useState, useMemo } from 'react';
import { useDataverse } from '@stores/dataverseStore';
import { DataTable, StatusBadge, PriorityBadge, CommandBar, type CommandBarItem } from '@components/shared';
import { formatDate, formatRelativeTime } from '@utils/index';
import type { TaskInstance, TableColumn } from '@/types';
import { RefreshCw, Download, ListChecks } from 'lucide-react';
import { exportToCsv } from '@/utils/exportUtils';
import { useToast } from '@/hooks/useToast';

interface ProjectTaskInstancesProps {
    projectId: string;
}

export function ProjectTaskInstances({ projectId }: ProjectTaskInstancesProps) {
    const { taskInstances, isLoading, refreshTaskInstances } = useDataverse();
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState<TaskInstance[]>([]);

    // Filter task instances by project
    const projectTaskInstances = useMemo(() =>
        taskInstances.filter(t => t.projectId === projectId),
        [taskInstances, projectId]
    );

    // Apply search filter
    const filteredData = useMemo(() =>
        projectTaskInstances.filter(item =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.status.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [projectTaskInstances, searchQuery]
    );

    const columns: TableColumn<TaskInstance>[] = [
        {
            key: 'title',
            label: 'Task',
            sortable: true,
            render: (v, row) => (
                <div className="min-w-0">
                    <p className="font-medium text-dark-900 truncate">{v as string}</p>
                    {row.description && (
                        <p className="text-xs text-dark-400 truncate">{row.description}</p>
                    )}
                </div>
            )
        },
        {
            key: 'status',
            label: 'Status',
            width: '130px',
            render: (v) => <StatusBadge status={v as string} size="sm" />
        },
        {
            key: 'priority',
            label: 'Priority',
            width: '100px',
            render: (v) => <PriorityBadge priority={v as string} size="sm" />
        },
        {
            key: 'dueDate',
            label: 'Due Date',
            width: '120px',
            render: (v) => v ? formatDate(v as Date) : '-'
        },
        {
            key: 'updatedAt',
            label: 'Last Updated',
            width: '140px',
            render: (v, row) => formatRelativeTime(v as Date || row.createdAt)
        },
    ];

    const commandBarItems: CommandBarItem[] = [
        {
            key: 'refresh',
            label: 'Refresh',
            icon: <RefreshCw className="w-3.5 h-3.5" />,
            onClick: async () => {
                await refreshTaskInstances();
                toast.success('Data refreshed');
            },
            variant: 'ghost'
        },
        {
            key: 'export',
            label: 'Export',
            icon: <Download className="w-3.5 h-3.5" />,
            onClick: () => {
                const dataToExport = selectedRows.length > 0 ? selectedRows : filteredData;
                exportToCsv(dataToExport.map(item => ({
                    ...item,
                    dueDate: item.dueDate ? formatDate(item.dueDate) : '-',
                    createdAt: formatDate(item.createdAt),
                    updatedAt: item.updatedAt ? formatDate(item.updatedAt) : '-',
                })), `project-task-instances`);
                toast.success('Exported successfully');
            },
            variant: 'ghost'
        }
    ];

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <CommandBar
                onSearch={setSearchQuery}
                searchValue={searchQuery}
                items={commandBarItems}
                selectedCount={selectedRows.length}
            />

            <div className="flex-1 card p-3 overflow-hidden">
                {filteredData.length > 0 ? (
                    <DataTable<TaskInstance>
                        data={filteredData}
                        columns={columns}
                        keyField="id"
                        searchable={false}
                        isLoading={isLoading}
                        selectable
                        onSelectionChange={setSelectedRows}
                        emptyMessage="No matching tasks found"
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-dark-400">
                        <ListChecks className="w-12 h-12 mb-3 opacity-50" />
                        <p className="font-medium">No task instances yet</p>
                        <p className="text-sm mt-1">Task instances will appear here after deployment</p>
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            <div className="flex items-center justify-between text-sm text-dark-500 px-1">
                <span>
                    {filteredData.length} task{filteredData.length !== 1 ? 's' : ''}
                    {searchQuery && ` matching "${searchQuery}"`}
                </span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-success-500" />
                        {filteredData.filter(t => t.status === 'completed').length} completed
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-primary-500" />
                        {filteredData.filter(t => t.status === 'in-progress').length} in progress
                    </span>
                </div>
            </div>
        </div>
    );
}
