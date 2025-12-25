import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useDataverse } from '@stores/dataverseStore';
import { formatDateTime, formatRelativeTime } from '@utils/index';
import { StatusBadge } from '@components/shared';
import {
    Activity,
    Zap,
    Clock,
    TrendingUp,
    CheckCircle2,
    XCircle,
    Pause,
    PlayCircle,
} from 'lucide-react';

interface ProjectDashboardProps {
    projectId: string;
}

const TASK_STATUS_COLORS = {
    'not-started': '#64748b',
    'in-progress': '#0ea5e9',
    'blocked': '#ef4444',
    'completed': '#22c55e',
};

const ACTION_STATUS_COLORS = {
    'pending': '#f59e0b',
    'completed': '#22c55e',
    'failed': '#ef4444',
    'skipped': '#94a3b8',
};

export function ProjectDashboard({ projectId }: ProjectDashboardProps) {
    const { taskInstances, actionInstances, actionTypes } = useDataverse();

    // Filter instances by project
    const projectTaskInstances = useMemo(() =>
        taskInstances.filter(t => t.projectId === projectId),
        [taskInstances, projectId]
    );

    const projectActionInstances = useMemo(() =>
        actionInstances.filter(a => {
            const taskInstance = taskInstances.find(t => t.id === a.taskInstanceId);
            return taskInstance?.projectId === projectId;
        }),
        [actionInstances, taskInstances, projectId]
    );

    // Task status chart data
    const taskStatusData = useMemo(() => [
        { name: 'Not Started', value: projectTaskInstances.filter(t => t.status === 'not-started').length, color: TASK_STATUS_COLORS['not-started'] },
        { name: 'In Progress', value: projectTaskInstances.filter(t => t.status === 'in-progress').length, color: TASK_STATUS_COLORS['in-progress'] },
        { name: 'Blocked', value: projectTaskInstances.filter(t => t.status === 'blocked').length, color: TASK_STATUS_COLORS['blocked'] },
        { name: 'Completed', value: projectTaskInstances.filter(t => t.status === 'completed').length, color: TASK_STATUS_COLORS['completed'] },
    ].filter(d => d.value > 0), [projectTaskInstances]);

    // Action status chart data
    const actionStatusData = useMemo(() => [
        { name: 'Pending', value: projectActionInstances.filter(a => a.status === 'pending').length, color: ACTION_STATUS_COLORS['pending'] },
        { name: 'Completed', value: projectActionInstances.filter(a => a.status === 'completed').length, color: ACTION_STATUS_COLORS['completed'] },
        { name: 'Failed', value: projectActionInstances.filter(a => a.status === 'failed').length, color: ACTION_STATUS_COLORS['failed'] },
        { name: 'Skipped', value: projectActionInstances.filter(a => a.status === 'skipped').length, color: ACTION_STATUS_COLORS['skipped'] },
    ].filter(d => d.value > 0), [projectActionInstances]);

    // Actions by type chart data
    const actionsByTypeData = useMemo(() => {
        const countByType: Record<string, number> = {};
        projectActionInstances.forEach(action => {
            const type = actionTypes.find(t => t.id === action.actionTypeId);
            const typeName = type?.name || 'Unknown';
            countByType[typeName] = (countByType[typeName] || 0) + 1;
        });
        return Object.entries(countByType).map(([name, count]) => ({
            name: name.length > 15 ? name.substring(0, 15) + '...' : name,
            count,
        }));
    }, [projectActionInstances, actionTypes]);

    // Timeline data
    const recentActivity = useMemo(() => {
        const activities: Array<{
            id: string;
            type: 'task' | 'action';
            title: string;
            status: string;
            timestamp: Date;
        }> = [];

        projectTaskInstances.forEach(task => {
            activities.push({
                id: task.id,
                type: 'task',
                title: task.title,
                status: task.status,
                timestamp: new Date(task.updatedAt || task.createdAt),
            });
        });

        projectActionInstances.forEach(action => {
            const task = taskInstances.find(t => t.id === action.taskInstanceId);
            activities.push({
                id: action.id,
                type: 'action',
                title: `Action on "${task?.title || 'Unknown Task'}"`,
                status: action.status,
                timestamp: new Date(action.executedAt || action.createdAt),
            });
        });

        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 10);
    }, [projectTaskInstances, projectActionInstances, taskInstances]);

    // Summary stats
    const summaryStats = useMemo(() => ({
        totalTasks: projectTaskInstances.length,
        completedTasks: projectTaskInstances.filter(t => t.status === 'completed').length,
        totalActions: projectActionInstances.length,
        failedActions: projectActionInstances.filter(a => a.status === 'failed').length,
    }), [projectTaskInstances, projectActionInstances]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="w-4 h-4 text-success-500" />;
            case 'failed': return <XCircle className="w-4 h-4 text-danger-500" />;
            case 'in-progress': return <PlayCircle className="w-4 h-4 text-primary-500" />;
            case 'blocked': return <Pause className="w-4 h-4 text-danger-500" />;
            default: return <Clock className="w-4 h-4 text-dark-400" />;
        }
    };

    return (
        <div className="space-y-6 p-4 overflow-auto h-full">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary-200">
                            <Activity className="w-5 h-5 text-primary-700" />
                        </div>
                        <div>
                            <p className="text-sm text-primary-600">Total Tasks</p>
                            <p className="text-2xl font-bold text-primary-900">{summaryStats.totalTasks}</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-success-50 to-success-100 border-success-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-success-200">
                            <CheckCircle2 className="w-5 h-5 text-success-700" />
                        </div>
                        <div>
                            <p className="text-sm text-success-600">Completed</p>
                            <p className="text-2xl font-bold text-success-900">{summaryStats.completedTasks}</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-accent-200">
                            <Zap className="w-5 h-5 text-accent-700" />
                        </div>
                        <div>
                            <p className="text-sm text-accent-600">Total Actions</p>
                            <p className="text-2xl font-bold text-accent-900">{summaryStats.totalActions}</p>
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-danger-50 to-danger-100 border-danger-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-danger-200">
                            <XCircle className="w-5 h-5 text-danger-700" />
                        </div>
                        <div>
                            <p className="text-sm text-danger-600">Failed Actions</p>
                            <p className="text-2xl font-bold text-danger-900">{summaryStats.failedActions}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task Status Distribution */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-dark-900 mb-4">Task Status</h3>
                    {taskStatusData.length > 0 ? (
                        <>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={taskStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {taskStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [`${value} tasks`, '']}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {taskStatusData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-dark-600">{item.name}: {item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-dark-400">
                            No task data yet
                        </div>
                    )}
                </div>

                {/* Action Status Distribution */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-dark-900 mb-4">Action Status</h3>
                    {actionStatusData.length > 0 ? (
                        <>
                            <div className="h-48">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={actionStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={40}
                                            outerRadius={70}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {actionStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [`${value} actions`, '']}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-2 mt-2">
                                {actionStatusData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-xs text-dark-600">{item.name}: {item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-dark-400">
                            No action data yet
                        </div>
                    )}
                </div>

                {/* Actions by Type */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-dark-900 mb-4">Actions by Type</h3>
                    {actionsByTypeData.length > 0 ? (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={actionsByTypeData} layout="vertical" margin={{ left: 10, right: 10 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                                    <Tooltip
                                        formatter={(value: number) => [`${value} actions`, '']}
                                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="h-48 flex items-center justify-center text-dark-400">
                            No action data yet
                        </div>
                    )}
                </div>
            </div>

            {/* Activity Timeline */}
            <div className="card">
                <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Activity Timeline
                </h3>
                {recentActivity.length > 0 ? (
                    <div className="space-y-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-dark-50 hover:bg-dark-100 transition-colors">
                                <div className="flex-shrink-0">
                                    {getStatusIcon(activity.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-dark-900 truncate">{activity.title}</p>
                                    <p className="text-xs text-dark-400">
                                        {activity.type === 'task' ? 'Task' : 'Action'} • {formatRelativeTime(activity.timestamp)}
                                    </p>
                                </div>
                                <StatusBadge status={activity.status} size="sm" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="py-8 text-center text-dark-400">
                        <Activity className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No activity yet</p>
                        <p className="text-sm">Activity will appear here as tasks and actions are executed</p>
                    </div>
                )}
            </div>
        </div>
    );
}
