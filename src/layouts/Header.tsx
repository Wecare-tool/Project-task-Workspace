import { useLocation } from 'react-router-dom';
import { useAppStore } from '@stores/index';
import { Search, Menu, Bell, User } from 'lucide-react';

const pathTitles: Record<string, string> = {
    '/': 'Dashboard',
    '/projects': 'Projects',
    '/tasks': 'Tasks',
    '/dependencies': 'Task Dependencies',
    '/action-instances': 'Actions',
    '/event-instances': 'Events',
    '/settings': 'Settings',
    '/task-types': 'Task Types (crdfd_task_types)',
    '/action-types': 'Action Types (crdfd_actiontypenews)',
    '/event-types': 'Event Types (central_eventtypes)',
    '/event-source-types': 'Event Source Types (crdfd_event_source_types)',
    '/task-type-attributes': 'Task Type Attributes (crdfd_tasktypeattributes)',
    '/event-task-mapping': 'Task Type → Event Type (crdfd_eventtypetasktypemappings)',
    '/task-action-mapping': 'Task Type → Action (crdfd_tasktypexactions)',
    '/task-attribute-mapping': 'Task Type → Attribute (crdfd_tasktype_attributes)',
};

export function Header() {
    const location = useLocation();
    const { setMobileMenuOpen } = useAppStore();

    const currentTitle = pathTitles[location.pathname];

    return (
        <header className="h-16 bg-white border-b border-dark-100 sticky top-0 z-30">
            <div className="h-full px-4 md:px-6 flex items-center justify-between gap-4">
                {/* Left side */}
                <div className="flex items-center gap-4">
                    {/* Mobile menu button */}
                    <button
                        onClick={() => setMobileMenuOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-dark-100 transition-colors"
                        title="Open menu"
                        aria-label="Open menu"
                    >
                        <Menu className="w-5 h-5 text-dark-600" />
                    </button>

                    {/* Page title */}
                    {/* Page title */}
                    {currentTitle && (
                        <div className="flex flex-col">
                            <h1 className="text-xl font-semibold text-dark-900 hidden sm:block">
                                {currentTitle.split(' (')[0]}
                            </h1>
                            {currentTitle.includes('(') && (
                                <p className="text-xs text-dark-500 hidden sm:block">
                                    {currentTitle.split(' (')[1].replace(')', '')}
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Right side */}

                {/* Right side */}
                <div className="flex items-center gap-2">
                    {/* Mobile search */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-dark-100 transition-colors"
                        title="Search"
                        aria-label="Search"
                    >
                        <Search className="w-5 h-5 text-dark-600" />
                    </button>

                    {/* Notifications */}
                    <button
                        className="relative p-2 rounded-lg hover:bg-dark-100 transition-colors"
                        title="Notifications"
                        aria-label="Notifications"
                    >
                        <Bell className="w-5 h-5 text-dark-600" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-danger-500 rounded-full" />
                    </button>

                    {/* User menu */}
                    <button
                        className="flex items-center gap-2 p-2 rounded-lg hover:bg-dark-100 transition-colors"
                        title="User menu"
                        aria-label="User menu"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <User className="w-4 h-4 text-white" />
                        </div>
                    </button>
                </div>
            </div>
        </header>
    );
}
