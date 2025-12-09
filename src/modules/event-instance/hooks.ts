import { useCallback, useMemo } from 'react';
import { useDataverse } from '@stores/dataverseStore';

export function useEventInstances() {
    const { eventInstances: events, isLoading, refreshEventInstances, eventTypes } = useDataverse();

    // Fallback to local task storage if needed or fetch tasks from Dataverse too (but we can use taskInstances from Dataverse)
    // For now, let's keep consistency with task hook and pull tasks from storage or Dataverse
    // Ideally we should use useDataverse().taskInstances here
    const { taskInstances: tasks } = useDataverse();

    const eventTypeOptions = useMemo(() => eventTypes.map((e: any) => ({ value: e.id, label: e.name })), [eventTypes]);
    const taskOptions = useMemo(() => tasks.map((t: any) => ({ value: t.id, label: t.title })), [tasks]);

    const refresh = refreshEventInstances;

    const getEventTypeName = useCallback((id: string) => eventTypes.find((e: any) => e.id === id)?.name || '-', [eventTypes]);
    const getTaskName = useCallback((id: string) => tasks.find((t: any) => t.id === id)?.title || '-', [tasks]);

    const create = useCallback(async (_data: any) => {
        console.warn('Create not implemented for Dataverse events yet');
    }, []);

    const update = useCallback(async (_id: string, _data: any) => {
        console.warn('Update not implemented for Dataverse events yet');
    }, []);

    const remove = useCallback(async (_id: string) => {
        console.warn('Delete not implemented for Dataverse events yet');
    }, []);

    return {
        events,
        isLoading,
        refresh,
        create,
        update,
        remove,
        eventTypeOptions,
        taskOptions,
        getEventTypeName,
        getTaskName
    };
}
