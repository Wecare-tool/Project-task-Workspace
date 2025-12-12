import { useDataverse } from '@stores/dataverseStore';
import type { TaskTypeFormData } from './schema';

export function useTaskTypes() {
    const {
        taskTypes,
        isLoading,
        refreshTaskTypes,
        createTaskType,
        updateTaskType,
        deactivateTaskType,
    } = useDataverse();

    // Map form data to Dataverse columns - only send fields that exist in table
    const mapFormDataToDataverse = (data: TaskTypeFormData) => {
        const mapped: any = {
            crdfd_tasktypename: data.name,
        };

        // Only add optional fields if they have values

        if (data.ownerType) {
            mapped.crdfd_ownertype = parseInt(data.ownerType, 10);
        }
        if (data.taskDomain) {
            mapped.crdfd_taskdoman = data.taskDomain;
        }

        console.log('[TaskType] Mapped data:', mapped);
        return mapped;
    };

    return {
        taskTypes,
        isLoading,
        refresh: refreshTaskTypes,
        getById: (id: string) => taskTypes.find((t: any) => t.id === id),
        create: async (data: TaskTypeFormData) => {
            console.log('[TaskType] Creating with form data:', data);
            const dataverseData = mapFormDataToDataverse(data);
            await createTaskType(dataverseData);
        },
        update: async (id: string, data: TaskTypeFormData) => {
            console.log('[TaskType] Updating', id, 'with form data:', data);
            const dataverseData = mapFormDataToDataverse(data);
            await updateTaskType(id, dataverseData);
        },
        remove: async (id: string) => {
            console.log('[TaskType] Removing:', id);
            await deactivateTaskType(id);
        },
    };
}
