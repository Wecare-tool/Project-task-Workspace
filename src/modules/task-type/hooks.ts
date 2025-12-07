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
        create: async () => { console.warn('Create from Dataverse not implemented'); },
        update: async () => { console.warn('Update from Dataverse not implemented'); },
        remove: async () => { console.warn('Delete from Dataverse not implemented'); },
    };
}
