import { useCallback, useMemo } from 'react';
import { useDataverse } from '@stores/dataverseStore';
import { projectStorage } from '@services/index';
// import { toast } from '@stores/index';

export function useTaskInstances() {
    const { taskInstances: tasks, isLoading, refreshTaskInstances, taskTypes } = useDataverse();

    // Fallback to local project storage for now as projects are not in Dataverse yet
    const projects = useMemo(() => projectStorage.getAll(), []);

    const projectOptions = useMemo(() => projects.map(p => ({ value: p.id, label: p.name })), [projects]);
    const taskTypeOptions = useMemo(() => taskTypes.map(t => ({ value: t.id, label: t.name })), [taskTypes]);

    const refresh = refreshTaskInstances;

    const getById = useCallback((id: string) => tasks.find(t => t.id === id), [tasks]);
    const getProjectName = useCallback((id: string) => projects.find(p => p.id === id)?.name || '-', [projects]);
    const getTaskTypeName = useCallback((id: string) => taskTypes.find(t => t.id === id)?.name || '-', [taskTypes]);

    // Disable CRUD writes for now as they are handled via Dataverse (read-only in this step or need impl)
    const create = useCallback(async (_data: any) => {
        console.warn('Create not implemented for Dataverse instances yet');
    }, []);

    const update = useCallback(async (_id: string, _data: any) => {
        console.warn('Update not implemented for Dataverse instances yet');
    }, []);

    const remove = useCallback(async (_id: string) => {
        console.warn('Delete not implemented for Dataverse instances yet');
    }, []);

    return { tasks, isLoading, refresh, getById, create, update, remove, projectOptions, taskTypeOptions, getProjectName, getTaskTypeName };
}
