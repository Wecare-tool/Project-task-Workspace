import { useEffect } from 'react';
import { useDataverse } from '@stores/dataverseStore';
import { Button } from '@components/ui';
import { RefreshCw, Database, AlertCircle, CheckCircle } from 'lucide-react';

export function DataversePage() {
    const {
        taskTypes,
        taskTypeAttributes,
        eventTypes,
        actionTypeNews,
        eventSourceTypes,
        taskDependencies,
        isLoading,
        isInitialized,
        error,
        initialize,
        refreshTaskTypes,
        refreshTaskTypeAttributes,
        refreshEventTypes,
        refreshActionTypeNews,
        refreshEventSourceTypes,
        refreshTaskDependencies,
    } = useDataverse();

    useEffect(() => {
        if (!isInitialized && !isLoading) {
            initialize();
        }
    }, [isInitialized, isLoading, initialize]);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary-100">
                        <Database className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900">Dataverse Data</h1>
                        <p className="text-dark-500">Data loaded from Microsoft Dataverse API</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isInitialized && (
                        <div className="flex items-center gap-2 text-success-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Connected</span>
                        </div>
                    )}
                    <Button
                        onClick={initialize}
                        variant="secondary"
                        isLoading={isLoading}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh All
                    </Button>
                </div>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="card bg-danger-50 border-danger-200">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-danger-600" />
                        <div>
                            <p className="font-medium text-danger-800">Connection Error</p>
                            <p className="text-sm text-danger-600">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Task Types */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-dark-900">
                        Task Types
                        <span className="ml-2 text-sm font-normal text-dark-400">
                            ({taskTypes.length} records)
                        </span>
                    </h3>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={refreshTaskTypes}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Code</th>
                                <th>Task Domain</th>
                                <th>Is Step Type</th>
                                <th>Owner Type</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskTypes.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-dark-400">No data loaded</td></tr>
                            ) : (
                                taskTypes.map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-medium">{item.name}</td>
                                        <td>{item.code}</td>
                                        <td>{item.description || '-'}</td>
                                        <td>{item.isStepType ? 'Yes' : 'No'}</td>
                                        <td>{item.ownerType || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Task Type Attributes */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-dark-900">
                        Task Type Attributes
                        <span className="ml-2 text-sm font-normal text-dark-400">
                            ({taskTypeAttributes.length} records)
                        </span>
                    </h3>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={refreshTaskTypeAttributes}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Attribute</th>
                                <th>Group</th>
                                <th>Attribute Options</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskTypeAttributes.length === 0 ? (
                                <tr><td colSpan={4} className="text-center py-8 text-dark-400">No data loaded</td></tr>
                            ) : (
                                taskTypeAttributes.map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-medium">{item.label}</td>
                                        <td>{item.name}</td>
                                        <td>{item.group || '-'}</td>
                                        <td>{item.options?.join(', ') || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Event Types */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-dark-900">
                        Event Types
                        <span className="ml-2 text-sm font-normal text-dark-400">
                            ({eventTypes.length} records)
                        </span>
                    </h3>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={refreshEventTypes}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Code</th>
                                <th>Description</th>
                                <th>Active</th>
                                <th>Retry Limit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventTypes.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-dark-400">No data loaded</td></tr>
                            ) : (
                                eventTypes.map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-medium">{item.name}</td>
                                        <td>{item.code}</td>
                                        <td>{item.description || '-'}</td>
                                        <td>{item.isActive ? 'Yes' : 'No'}</td>
                                        <td>{item.retryLimit ?? '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Action Type News */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-dark-900">
                        Action Types
                        <span className="ml-2 text-sm font-normal text-dark-400">
                            ({actionTypeNews.length} records)
                        </span>
                    </h3>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={refreshActionTypeNews}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {actionTypeNews.length === 0 ? (
                                <tr><td colSpan={2} className="text-center py-8 text-dark-400">No data loaded</td></tr>
                            ) : (
                                actionTypeNews.map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-medium">{item.name}</td>
                                        <td>{item.description || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Event Source Types */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-dark-900">
                        Event Source Types
                        <span className="ml-2 text-sm font-normal text-dark-400">
                            ({eventSourceTypes.length} records)
                        </span>
                    </h3>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={refreshEventSourceTypes}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventSourceTypes.length === 0 ? (
                                <tr><td colSpan={2} className="text-center py-8 text-dark-400">No data loaded</td></tr>
                            ) : (
                                eventSourceTypes.map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-medium">{item.name}</td>
                                        <td>{item.description || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Task Dependencies */}
            <div className="card">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-dark-900">
                        Task Dependencies
                        <span className="ml-2 text-sm font-normal text-dark-400">
                            ({taskDependencies.length} records)
                        </span>
                    </h3>
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={refreshTaskDependencies}
                        leftIcon={<RefreshCw className="w-4 h-4" />}
                    >
                        Refresh
                    </Button>
                </div>
                <div className="overflow-x-auto">
                    <table className="table w-full">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Event Type</th>
                                <th>Parent Task</th>
                                <th>Child Task</th>
                                <th>Outcome</th>
                            </tr>
                        </thead>
                        <tbody>
                            {taskDependencies.length === 0 ? (
                                <tr><td colSpan={5} className="text-center py-8 text-dark-400">No data loaded</td></tr>
                            ) : (
                                taskDependencies.map((item) => (
                                    <tr key={item.id}>
                                        <td className="font-medium">{item.name || '-'}</td>
                                        <td>{item.eventTypeId || '-'}</td>
                                        <td>{item.parentTaskId || '-'}</td>
                                        <td>{item.childTaskId || '-'}</td>
                                        <td>{item.outcome || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
