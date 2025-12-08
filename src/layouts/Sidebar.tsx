import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@utils/index';
import { useAppStore } from '@stores/index';
import {
    FolderKanban,
    ListChecks,
    ClipboardList,
    Zap,
    Activity,
    Webhook,
    Calendar,
    GitBranch,
    Settings,
    ChevronLeft,
    ChevronRight,
    Layers,
} from 'lucide-react';

interface NavItem {
    label: string;
    path: string;
    icon: React.ReactNode;
}

interface NavGroup {
    title: string;
    items: NavItem[];
}

const navGroups: NavGroup[] = [
    {
        title: 'Project Management',
        items: [
            { label: 'Dashboard', path: '/', icon: <Activity className="w-5 h-5" /> },
            { label: 'Projects', path: '/projects', icon: <FolderKanban className="w-5 h-5" /> },
            { label: 'Daily Task', path: '/daily-tasks', icon: <Calendar className="w-5 h-5" /> },
        ],
    },
    {
        title: 'Type Configuration',
        items: [
            { label: 'Task Types', path: '/task-types', icon: <ClipboardList className="w-5 h-5" /> },
            { label: 'Action Types', path: '/action-types', icon: <Zap className="w-5 h-5" /> },
            { label: 'Event Types', path: '/event-types', icon: <Calendar className="w-5 h-5" /> },
            { label: 'Event Sources', path: '/event-source-types', icon: <Webhook className="w-5 h-5" /> },
            { label: 'Task Attributes', path: '/task-type-attributes', icon: <Layers className="w-5 h-5" /> },
            { label: 'Task Dependencies', path: '/dependencies', icon: <GitBranch className="w-5 h-5" /> },
        ],
    },
    {
        title: 'Instances',
        items: [
            { label: 'Task Instances', path: '/tasks', icon: <ListChecks className="w-5 h-5" /> },
            { label: 'Actions', path: '/action-instances', icon: <Activity className="w-5 h-5" /> },
            { label: 'Events', path: '/event-instances', icon: <Calendar className="w-5 h-5" /> },
        ],
    },
    {
        title: 'MAPPING',
        items: [
            { label: 'Task Type → Event Type', path: '/event-task-mapping', icon: <Calendar className="w-5 h-5" /> },
            { label: 'Task Type → Action', path: '/task-action-mapping', icon: <Zap className="w-5 h-5" /> },
            { label: 'Task Type → Attribute', path: '/task-attribute-mapping', icon: <Layers className="w-5 h-5" /> },
        ],
    },
];

export function Sidebar() {
    const location = useLocation();
    const { sidebarCollapsed, toggleSidebar } = useAppStore();

    return (
        <aside
            className={cn(
                'fixed left-0 top-0 z-40 h-screen bg-white border-r border-dark-100',
                'transition-all duration-300 ease-in-out',
                'flex flex-col',
                sidebarCollapsed ? 'w-20' : 'w-64'
            )}
        >
            {/* Logo */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-dark-100">
                {!sidebarCollapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <FolderKanban className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg gradient-text">PM2</span>
                    </div>
                )}
                <button
                    onClick={toggleSidebar}
                    className="p-2 rounded-lg hover:bg-dark-100 transition-colors"
                    title={sidebarCollapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
                >
                    {sidebarCollapsed ? (
                        <ChevronRight className="w-5 h-5 text-dark-500" />
                    ) : (
                        <ChevronLeft className="w-5 h-5 text-dark-500" />
                    )}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-2 space-y-2">
                {navGroups.map((group) => (
                    <div key={group.title}>
                        {!sidebarCollapsed && (
                            <h3 className="text-sm font-semibold text-dark-600 uppercase tracking-wider mb-1 px-2">
                                {group.title}
                            </h3>
                        )}
                        <ul className="space-y-1">
                            {group.items.map((item) => (
                                <li key={item.path}>
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            cn(
                                                isActive ? 'sidebar-link-active' : 'sidebar-link',
                                                sidebarCollapsed && 'justify-center px-0'
                                            )
                                        }
                                        title={sidebarCollapsed ? item.label : undefined}
                                    >
                                        <span className="flex-shrink-0">{item.icon}</span>
                                        {!sidebarCollapsed && (
                                            <span className="truncate">{item.label}</span>
                                        )}
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}
            </nav>

            {/* Footer */}
            {!sidebarCollapsed && (
                <div className="p-2 border-t border-dark-100">
                    <NavLink
                        to="/settings"
                        className={({ isActive }) =>
                            isActive ? 'sidebar-link-active' : 'sidebar-link'
                        }
                    >
                        <Settings className="w-5 h-5" />
                        <span>Cài đặt</span>
                    </NavLink>
                </div>
            )}
        </aside>
    );
}
