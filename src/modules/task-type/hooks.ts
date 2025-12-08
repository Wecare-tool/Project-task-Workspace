import { useDataverse } from '@stores/dataverseStore';

export function useTaskTypes() {
    const {
        taskTypes,
        isLoading,
        refreshTaskTypes,
    } = useDataverse();

    return {
        taskTypes,
        isLoading,
        refresh: refreshTaskTypes,
        getById: (id: string) => taskTypes.find(t => t.id === id),
        // CRUD operations disabled - using read-only from Dataverse
        create: async (_data: any) => { console.warn('Create from Dataverse not implemented'); },
        update: async (_id: string, _data: any) => { console.warn('Update from Dataverse not implemented'); },
        remove: async (_id: string) => { console.warn('Delete from Dataverse not implemented'); },
    };
}
