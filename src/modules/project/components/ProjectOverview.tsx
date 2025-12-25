import { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useDataverse } from '@stores/dataverseStore';
import { formatDate, formatRelativeTime } from '@utils/index';
import { StatusBadge, PriorityBadge } from '@components/shared';
import {
    Calendar,
    CheckCircle2,
    Clock,
    ListChecks,
    Zap,
    TrendingUp,
    AlertCircle,
    Building2,
    PlayCircle,
    XCircle,
    Pause,
} from 'lucide-react';

interface ProjectOverviewProps {
    projectId: string;
    projectData: {
        name: string;
        status?: string;
        priority?: string;
        department?: string;
        startDate?: Date;
        endDate?: Date;
        description?: string;
    };
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

export function ProjectOverview({ projectId, projectData }: ProjectOverviewProps) {
    const { taskInstances, actionInstances } = useDataverse();

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

    // Calculate stats
    const stats = useMemo(() => {
        const total = projectTaskInstances.length;
        const completed = projectTaskInstances.filter(t => t.status === 'completed').length;
        const inProgress = projectTaskInstances.filter(t => t.status === 'in-progress').length;
        const blocked = projectTaskInstances.filter(t => t.status === 'blocked').length;
        const notStarted = projectTaskInstances.filter(t => t.status === 'not-started').length;

        return {
            total,
            completed,
            inProgress,
            blocked,
            notStarted,
            completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
            actionsTotal: projectActionInstances.length,
            actionsPending: projectActionInstances.filter(a => a.status === 'pending').length,
            actionsCompleted: projectActionInstances.filter(a => a.status === 'completed').length,
            actionsFailed: projectActionInstances.filter(a => a.status === 'failed').length,
        };
    }, [projectTaskInstances, projectActionInstances]);

    // Task status chart data
    const taskStatusData = useMemo(() => [
        { name: 'Not Started', value: stats.notStarted, color: TASK_STATUS_COLORS['not-started'] },
        { name: 'In Progress', value: stats.inProgress, color: TASK_STATUS_COLORS['in-progress'] },
        { name: 'Blocked', value: stats.blocked, color: TASK_STATUS_COLORS['blocked'] },
        { name: 'Completed', value: stats.completed, color: TASK_STATUS_COLORS['completed'] },
    ].filter(d => d.value > 0), [stats]);

    // Action status chart data
    const actionStatusData = useMemo(() => [
        { name: 'Pending', value: projectActionInstances.filter(a => a.status === 'pending').length, color: ACTION_STATUS_COLORS['pending'] },
        { name: 'Completed', value: projectActionInstances.filter(a => a.status === 'completed').length, color: ACTION_STATUS_COLORS['completed'] },
        { name: 'Failed', value: projectActionInstances.filter(a => a.status === 'failed').length, color: ACTION_STATUS_COLORS['failed'] },
        { name: 'Skipped', value: projectActionInstances.filter(a => a.status === 'skipped').length, color: ACTION_STATUS_COLORS['skipped'] },
    ].filter(d => d.value > 0), [projectActionInstances]);

    // Recent activity
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
                title: `Action: "${task?.title || 'Unknown'}"`,
                status: action.status,
                timestamp: new Date(action.executedAt || action.createdAt),
            });
        });

        return activities
            .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
            .slice(0, 6);
    }, [projectTaskInstances, projectActionInstances, taskInstances]);

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
            {/* Project Info Header */}
            <div className="card bg-gradient-to-r from-primary-50 to-accent-50 border-primary-200">
                <div className="flex justify-between items-start">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-dark-900">{projectData.name}</h2>
                        {projectData.description && (
                            <p className="text-dark-600 max-w-2xl">{projectData.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 mt-3">
                            {projectData.status && (
                                <StatusBadge status={projectData.status} />
                            )}
                            {projectData.priority && (
                                <PriorityBadge priority={projectData.priority} />
                            )}
                            {projectData.department && (
                                <span className="inline-flex items-center gap-1 text-sm text-dark-600">
                                    <Building2 className="w-4 h-4" />
                                    {projectData.department}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right text-sm text-dark-500 space-y-1">
                        {projectData.startDate && (
                            <div className="flex items-center gap-1 justify-end">
                                <Calendar className="w-4 h-4" />
                                Start: {formatDate(projectData.startDate)}
                            </div>
                        )}
                        {projectData.endDate && (
                            <div className="flex items-center gap-1 justify-end">
                                <Calendar className="w-4 h-4" />
                                End: {formatDate(projectData.endDate)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card bg-gradient-to-br from-primary-50 to-primary-100 border-primary-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-primary-600">Total Tasks</p>
                            <p className="text-3xl font-bold text-primary-900">{stats.total}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-primary-200">
                            <ListChecks className="w-6 h-6 text-primary-700" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-success-50 to-success-100 border-success-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-success-600">Completed</p>
                            <p className="text-3xl font-bold text-success-900">{stats.completed}</p>
                            <p className="text-xs text-success-600">{stats.completionRate}% complete</p>
                        </div>
                        <div className="p-3 rounded-xl bg-success-200">
                            <CheckCircle2 className="w-6 h-6 text-success-700" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-warning-50 to-warning-100 border-warning-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-warning-600">In Progress</p>
                            <p className="text-3xl font-bold text-warning-900">{stats.inProgress}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-warning-200">
                            <TrendingUp className="w-6 h-6 text-warning-700" />
                        </div>
                    </div>
                </div>

                <div className="card bg-gradient-to-br from-accent-50 to-accent-100 border-accent-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-accent-600">Actions</p>
                            <p className="text-3xl font-bold text-accent-900">{stats.actionsTotal}</p>
                            <p className="text-xs text-accent-600">{stats.actionsCompleted} done</p>
                        </div>
                        <div className="p-3 rounded-xl bg-accent-200">
                            <Zap className="w-6 h-6 text-accent-700" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Blocked Tasks Alert */}
            {stats.blocked > 0 && (
                <div className="card bg-danger-50 border-danger-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-danger-100">
                            <AlertCircle className="w-5 h-5 text-danger-600" />
                        </div>
                        <div>
                            <p className="font-medium text-danger-800">{stats.blocked} blocked task(s)</p>
                            <p className="text-sm text-danger-600">Requires attention to continue progress</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Charts and Progress Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Progress Card */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-dark-900 mb-4">Overall Progress</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between text-sm">
                            <span className="text-dark-600">Task Completion</span>
                            <span className="font-bold text-dark-900">{stats.completionRate}%</span>
                        </div>
                        <div className="h-4 bg-dark-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-500"
                                style={{ width: `${stats.completionRate}%` }}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                            <span className="flex items-center gap-1 text-dark-500">
                                <span className="w-2 h-2 rounded-full bg-success-500" /> Completed: {stats.completed}
                            </span>
                            <span className="flex items-center gap-1 text-dark-500">
                                <span className="w-2 h-2 rounded-full bg-primary-500" /> In Progress: {stats.inProgress}
                            </span>
                            <span className="flex items-center gap-1 text-dark-500">
                                <span className="w-2 h-2 rounded-full bg-dark-300" /> Not Started: {stats.notStarted}
                            </span>
                            {stats.blocked > 0 && (
                                <span className="flex items-center gap-1 text-dark-500">
                                    <span className="w-2 h-2 rounded-full bg-danger-500" /> Blocked: {stats.blocked}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Task Status Pie Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-dark-900 mb-4">Task Status</h3>
                    {taskStatusData.length > 0 ? (
                        <>
                            <div className="h-36">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={taskStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={30}
                                            outerRadius={55}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {taskStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [`${value} tasks`, '']}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                                {taskStatusData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-dark-600">{item.name}: {item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-36 flex items-center justify-center text-dark-400 text-sm">
                            No task data yet
                        </div>
                    )}
                </div>

                {/* Action Status Pie Chart */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-dark-900 mb-4">Action Status</h3>
                    {actionStatusData.length > 0 ? (
                        <>
                            <div className="h-36">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={actionStatusData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={30}
                                            outerRadius={55}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {actionStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            formatter={(value: number) => [`${value} actions`, '']}
                                            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                                {actionStatusData.map((item) => (
                                    <div key={item.name} className="flex items-center gap-1">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="text-dark-600">{item.name}: {item.value}</span>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="h-36 flex items-center justify-center text-dark-400 text-sm">
                            No action data yet
                        </div>
                    )}
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <h3 className="text-lg font-semibold text-dark-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Recent Activity
                </h3>
                {recentActivity.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {recentActivity.map((activity) => (
                            <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-dark-50 hover:bg-dark-100 transition-colors">
                                <div className="flex-shrink-0">
                                    {getStatusIcon(activity.status)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-medium text-dark-900 truncate text-sm">{activity.title}</p>
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
                        <ListChecks className="w-10 h-10 mx-auto mb-2 opacity-50" />
                        <p>No activity yet</p>
                        <p className="text-sm">Activity will appear here after deployment</p>
                    </div>
                )}
            </div>
        </div>
    );
}
