import { useState, useMemo } from 'react';
import { useDataverse } from '@stores/dataverseStore';
import { DataTable, StatusBadge, CommandBar, type CommandBarItem } from '@components/shared';
import { formatDateTime, formatRelativeTime } from '@utils/index';
import type { ActionInstance, TableColumn } from '@/types';
import { RefreshCw, Download, Zap } from 'lucide-react';
import { exportToCsv } from '@/utils/exportUtils';
import { useToast } from '@/hooks/useToast';

interface ProjectActionLogProps {
    projectId: string;
}

export function ProjectActionLog({ projectId }: ProjectActionLogProps) {
    const { taskInstances, actionInstances, actionTypeNews: actionTypes, isLoading, refreshActionInstances } = useDataverse();
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState<ActionInstance[]>([]);

    // Get task IDs for this project
    const projectTaskIds = useMemo(() =>
        new Set(taskInstances.filter(t => t.projectId === projectId).map(t => t.id)),
        [taskInstances, projectId]
    );

    // Filter action instances by project's tasks
    const projectActionInstances = useMemo(() =>
        actionInstances.filter(a => projectTaskIds.has(a.taskInstanceId)),
        [actionInstances, projectTaskIds]
    );

    // Helper functions
    const getActionTypeName = (actionTypeId: string) => {
        const actionType = actionTypes.find(t => t.id === actionTypeId);
        return actionType?.name || 'Unknown';
    };

    const getTaskName = (taskInstanceId: string) => {
        const task = taskInstances.find(t => t.id === taskInstanceId);
        return task?.title || 'Unknown Task';
    };

    // Apply search filter
    const filteredData = useMemo(() =>
        projectActionInstances.filter(item =>
            getActionTypeName(item.actionTypeId).toLowerCase().includes(searchQuery.toLowerCase()) ||
            getTaskName(item.taskInstanceId).toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.status.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [projectActionInstances, searchQuery]
    );

    const columns: TableColumn<ActionInstance>[] = [
        {
            key: 'actionTypeId',
            label: 'Action Type',
            sortable: true,
            render: (v) => (
                <span className="font-medium text-dark-900">
                    {getActionTypeName(v as string)}
                </span>
            )
        },
        {
            key: 'taskInstanceId',
            label: 'Task',
            render: (v) => (
                <span className="text-dark-600 truncate block max-w-[200px]">
                    {getTaskName(v as string)}
                </span>
            )
        },
        {
            key: 'status',
            label: 'Status',
            width: '120px',
            render: (v) => <StatusBadge status={v as string} size="sm" />
        },
        {
            key: 'executedAt',
            label: 'Executed',
            width: '150px',
            render: (v) => v ? formatDateTime(v as Date) : '-'
        },
        {
            key: 'result',
            label: 'Result',
            width: '200px',
            render: (v) => v ? (
                <span className="text-sm text-dark-600 truncate block max-w-[180px]" title={v as string}>
                    {v as string}
                </span>
            ) : '-'
        },
    ];

    const commandBarItems: CommandBarItem[] = [
        {
            key: 'refresh',
            label: 'Refresh',
            icon: <RefreshCw className="w-3.5 h-3.5" />,
            onClick: async () => {
                await refreshActionInstances();
                toast.success('Data refreshed');
            },
            variant: 'ghost'
        },
        {
            key: 'export',
            label: 'Export',
            icon: <Download className="w-3.5 h-3.5" />,
            onClick: () => {
                const dataToExport = (selectedRows.length > 0 ? selectedRows : filteredData).map(item => ({
                    actionType: getActionTypeName(item.actionTypeId),
                    task: getTaskName(item.taskInstanceId),
                    status: item.status,
                    executedAt: item.executedAt ? formatDateTime(item.executedAt) : '-',
                    result: item.result || '-',
                    notes: item.notes || '-',
                }));
                exportToCsv(dataToExport, `project-action-log`);
                toast.success('Exported successfully');
            },
            variant: 'ghost'
        }
    ];

    // Status summary
    const statusSummary = useMemo(() => ({
        pending: filteredData.filter(a => a.status === 'pending').length,
        completed: filteredData.filter(a => a.status === 'completed').length,
        failed: filteredData.filter(a => a.status === 'failed').length,
        skipped: filteredData.filter(a => a.status === 'skipped').length,
    }), [filteredData]);

    return (
        <div className="h-full flex flex-col p-4 space-y-4">
            <CommandBar
                onSearch={setSearchQuery}
                searchValue={searchQuery}
                items={commandBarItems}
                selectedCount={selectedRows.length}
                placeholder="Search actions..."
            />

            <div className="flex-1 card p-3 overflow-hidden">
                {filteredData.length > 0 ? (
                    <DataTable<ActionInstance>
                        data={filteredData}
                        columns={columns}
                        keyField="id"
                        searchable={false}
                        isLoading={isLoading}
                        selectable
                        onSelectionChange={setSelectedRows}
                        emptyMessage="No matching actions found"
                    />
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-dark-400">
                        <Zap className="w-12 h-12 mb-3 opacity-50" />
                        <p className="font-medium">No action logs yet</p>
                        <p className="text-sm mt-1">Action logs will appear here as tasks are executed</p>
                    </div>
                )}
            </div>

            {/* Summary Footer */}
            <div className="flex items-center justify-between text-sm text-dark-500 px-1">
                <span>
                    {filteredData.length} action{filteredData.length !== 1 ? 's' : ''}
                    {searchQuery && ` matching "${searchQuery}"`}
                </span>
                <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-warning-500" />
                        {statusSummary.pending} pending
                    </span>
                    <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-success-500" />
                        {statusSummary.completed} completed
                    </span>
                    {statusSummary.failed > 0 && (
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-danger-500" />
                            {statusSummary.failed} failed
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
