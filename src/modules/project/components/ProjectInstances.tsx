import { useState } from 'react';
import { ProjectTaskInstances } from './ProjectTaskInstances';
import { ProjectActionLog } from './ProjectActionLog';
import { cn } from '@utils/index';
import { ListChecks, Zap } from 'lucide-react';

interface ProjectInstancesProps {
    projectId: string;
}

export function ProjectInstances({ projectId }: ProjectInstancesProps) {
    const [activeTab, setActiveTab] = useState<'tasks' | 'actions'>('tasks');

    return (
        <div className="h-full flex flex-col">
            {/* Sub-navigation */}
            <div className="flex items-center px-4 pt-4 border-b border-dark-100 bg-white">
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'tasks'
                            ? "border-primary-500 text-primary-600"
                            : "border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300"
                    )}
                >
                    <ListChecks className="w-4 h-4" />
                    Task Instances
                </button>
                <button
                    onClick={() => setActiveTab('actions')}
                    className={cn(
                        "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors",
                        activeTab === 'actions'
                            ? "border-accent-500 text-accent-600"
                            : "border-transparent text-dark-500 hover:text-dark-700 hover:border-dark-300"
                    )}
                >
                    <Zap className="w-4 h-4" />
                    Action Log
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden bg-dark-50">
                {activeTab === 'tasks' ? (
                    <ProjectTaskInstances projectId={projectId} />
                ) : (
                    <ProjectActionLog projectId={projectId} />
                )}
            </div>
        </div>
    );
}
