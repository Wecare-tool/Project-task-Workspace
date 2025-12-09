import { useCallback } from 'react';
import { useDataverse } from '@stores/dataverseStore';

export function useProjects() {
    const { projects, isLoading, refreshProjects } = useDataverse();

    const refresh = refreshProjects;

    const getById = useCallback((id: string) => {
        return projects.find((p: any) => p.id === id);
    }, [projects]);

    const create = useCallback(async (_data: any) => {
        console.warn('Create not implemented for Dataverse projects yet');
    }, []);

    const update = useCallback(async (_id: string, _data: any) => {
        console.warn('Update not implemented for Dataverse projects yet');
    }, []);

    const remove = useCallback(async (_id: string) => {
        console.warn('Delete not implemented for Dataverse projects yet');
    }, []);

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
