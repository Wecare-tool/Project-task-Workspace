import { useCallback } from 'react';
import { useDataverse } from '@stores/dataverseStore';

export function useProjects() {
    const {
        projects,
        isLoading,
        refreshProjects,
        createProject,
        updateProject,
        deactivateProject
    } = useDataverse();

    const refresh = refreshProjects;

    const getById = useCallback((id: string) => {
        return projects.find((p: any) => p.id === id);
    }, [projects]);

    const create = useCallback(async (data: any) => {
        await createProject(data);
    }, [createProject]);

    const update = useCallback(async (id: string, data: any) => {
        await updateProject(id, data);
    }, [updateProject]);

    const remove = useCallback(async (id: string) => {
        await deactivateProject(id);
    }, [deactivateProject]);

    return {
        projects,
        isLoading,
        refresh,
        getById,
        create,
        update,
        remove,
    };
}
