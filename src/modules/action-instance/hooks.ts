import { useCallback, useMemo } from 'react';
import { useDataverse } from '@stores/dataverseStore';
// import { toast } from '@stores/index';

export function useActionInstances() {
    const { actionInstances: actions, isLoading, refreshActionInstances, actionTypeNews: actionTypes, taskInstances: tasks } = useDataverse();

    // Use actionTypeNews for action types as per store definition, or should it be something else?
    // In DataverseStore: actionTypeNews maps to ActionTypeNew. 
    // In ActionInstancePage: actionTypeOptions maps name and id.

    const actionTypeOptions = useMemo(() => actionTypes.map(a => ({ value: a.id, label: a.name })), [actionTypes]);
    const taskOptions = useMemo(() => tasks.map(t => ({ value: t.id, label: t.title })), [tasks]);

    const refresh = refreshActionInstances;

    const getActionTypeName = useCallback((id: string) => actionTypes.find(a => a.id === id)?.name || '-', [actionTypes]);
    const getTaskName = useCallback((id: string) => tasks.find(t => t.id === id)?.title || '-', [tasks]);

    const create = useCallback(async (_data: any) => {
        console.warn('Create not implemented for Dataverse actions yet');
    }, []);

    const update = useCallback(async (_id: string, _data: any) => {
        console.warn('Update not implemented for Dataverse actions yet');
    }, []);

    const remove = useCallback(async (_id: string) => {
        console.warn('Delete not implemented for Dataverse actions yet');
    }, []);

    return {
        actions,
        isLoading,
        refresh,
        create,
        update,
        remove,
        actionTypeOptions,
        taskOptions,
        getActionTypeName,
        getTaskName
    };
}
