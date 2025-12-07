import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { projectStorage, taskInstanceStorage } from '@services/index';
import { StatusBadge, PriorityBadge } from '@components/shared';
import { formatDate, formatRelativeTime } from '@utils/index';
import {
    FolderKanban,
    ListChecks,
    AlertCircle,
    CheckCircle,
    Clock,
    TrendingUp,
    ArrowRight,
} from 'lucide-react';

export function DashboardPage() {
    const projects = useMemo(() => projectStorage.getAll(), []);
    const tasks = useMemo(() => taskInstanceStorage.getAll(), []);

    // Project stats
    const projectStats = useMemo(() => ({
        total: projects.length,
        active: projects.filter(p => p.status === 'active').length,
        archived: projects.filter(p => p.status === 'archived').length,
        onHold: projects.filter(p => p.status === 'on-hold').length,
    }), [projects]);

    // Task stats
    const taskStats = useMemo(() => ({
        total: tasks.length,
        notStarted: tasks.filter(t => t.status === 'not-started').length,
        inProgress: tasks.filter(t => t.status === 'in-progress').length,
        blocked: tasks.filter(t => t.status === 'blocked').length,
        completed: tasks.filter(t => t.status === 'completed').length,
    }), [tasks]);

    // Chart data
    const taskChartData = useMemo(() => [
        { name: 'Not Started', value: taskStats.notStarted, color: '#64748b' },
        { name: 'In Progress', value: taskStats.inProgress, color: '#0ea5e9' },
        { name: 'Blocked', value: taskStats.blocked, color: '#ef4444' },
        { name: 'Completed', value: taskStats.completed, color: '#22c55e' },
    ].filter(d => d.value > 0), [taskStats]);

    // Recent items
    const recentProjects = useMemo(() =>
        [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
        , [projects]);

    const recentTasks = useMemo(() =>
        [...tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5)
        , [tasks]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-dark-900">Dashboard</h1>
                <p className="text-dark-500">Project and task overview</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Projects', value: projectStats.total, icon: FolderKanban, color: 'primary', link: '/projects' },
                    { label: 'Active', value: projectStats.active, icon: CheckCircle, color: 'success', link: '/projects' },
                    { label: 'Tasks', value: taskStats.total, icon: ListChecks, color: 'accent', link: '/tasks' },
                    { label: 'In Progress', value: taskStats.inProgress, icon: TrendingUp, color: 'warning', link: '/tasks' },
                ].map((stat) => (
                    <Link key={stat.label} to={stat.link} className="card-hover group">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-dark-500">{stat.label}</p>
                                <p className="text-3xl font-bold text-dark-900 mt-1">{stat.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-${stat.color}-100 group-hover:bg-${stat.color}-200 transition-colors`}>
                                <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task Status Distribution */}
                <div className="card">
                    <h3 className="text-lg font-semibold text-dark-900 mb-4">Task Status Distribution</h3>
                    {taskChartData.length > 0 ? (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={taskChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={50}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                    >
                                        {taskChartData.map((entry, index) => (
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
                    ) : (
                        <div className="h-64 flex items-center justify-center text-dark-400">
                            No task data yet
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 mt-4">
                        {taskChartData.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm text-dark-600">{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Projects */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-dark-900">Recent Projects</h3>
                        <Link to="/projects" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {recentProjects.length > 0 ? (
                        <div className="space-y-3">
                            {recentProjects.map((project) => (
                                <div key={project.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-50 hover:bg-dark-100 transition-colors">
                                    <div className="min-w-0">
                                        <p className="font-medium text-dark-900 truncate">{project.name}</p>
                                        <p className="text-xs text-dark-400">{formatRelativeTime(project.createdAt)}</p>
                                    </div>
                                    <StatusBadge status={project.status} size="sm" showIcon={false} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-dark-400">
                            <FolderKanban className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>No projects yet</p>
                        </div>
                    )}
                </div>

                {/* Recent Tasks */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-dark-900">Recent Tasks</h3>
                        <Link to="/tasks" className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    {recentTasks.length > 0 ? (
                        <div className="space-y-3">
                            {recentTasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-dark-50 hover:bg-dark-100 transition-colors">
                                    <div className="min-w-0 flex-1 mr-3">
                                        <p className="font-medium text-dark-900 truncate">{task.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <PriorityBadge priority={task.priority} size="sm" />
                                            {task.dueDate && (
                                                <span className="text-xs text-dark-400 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {formatDate(task.dueDate)}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <StatusBadge status={task.status} size="sm" showIcon={false} />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-dark-400">
                            <ListChecks className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p>No tasks yet</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Alert for blocked tasks */}
            {taskStats.blocked > 0 && (
                <div className="card bg-danger-50 border-danger-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-danger-100">
                            <AlertCircle className="w-5 h-5 text-danger-600" />
                        </div>
                        <div>
                            <p className="font-medium text-danger-800">{taskStats.blocked} blocked task(s)</p>
                            <p className="text-sm text-danger-600">Check and resolve blocked tasks to ensure project progress</p>
                        </div>
                        <Link to="/tasks" className="ml-auto">
                            <button className="btn-danger text-sm">View details</button>
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
