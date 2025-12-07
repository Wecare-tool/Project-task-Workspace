import { create } from 'zustand';
import {
    fetchTableData,
    DATAVERSE_TABLES,
    createRecord,
    updateRecord,
    deleteRecord
} from '@services/dataverse';
import {
    mapDataverseTaskType,
    mapDataverseTaskTypeAttribute,
    mapDataverseEventType,
    mapDataverseActionTypeNew,
    mapDataverseEventSourceType,
    mapEventTypeTaskTypeMapping,
    mapTaskTypeAction,
    mapTaskTypeAttributeMapping,
    mapDataverseTaskDependency,
} from '@services/dataverseTypes';
import type {
    DataverseTaskType,
    DataverseTaskTypeAttribute,
    DataverseEventType,
    DataverseActionTypeNew,
    ActionTypeNew,
    DataverseEventSourceType,
    EventSourceTypeNew,
    DataverseEventTypeTaskTypeMapping,
    EventTypeTaskTypeMapping,
    DataverseTaskTypeAction,
    TaskTypeAction,
    DataverseTaskTypeAttributeMapping,
    TaskTypeAttributeMapping,
    DataverseTaskDependency,
    TaskDependency,
} from '@services/dataverseTypes';
import type { TaskType, TaskTypeAttribute, EventType } from '@/types';
import { toast } from '@stores/index';

interface DataverseState {
    // Entity data
    taskTypes: TaskType[];
    taskTypeAttributes: TaskTypeAttribute[];
    eventTypes: EventType[];
    actionTypeNews: ActionTypeNew[];
    eventSourceTypes: EventSourceTypeNew[];
    // Mapping data
    eventTypeTaskTypeMappings: EventTypeTaskTypeMapping[];
    taskTypeActions: TaskTypeAction[];
    taskTypeAttributeMappings: TaskTypeAttributeMapping[];
    taskDependencies: TaskDependency[];
    // State
    isLoading: boolean;
    isInitialized: boolean;
    error: string | null;
    // Actions
    initialize: () => Promise<void>;
    refreshTaskTypes: () => Promise<void>;
    refreshTaskTypeAttributes: () => Promise<void>;
    refreshEventTypes: () => Promise<void>;
    refreshActionTypeNews: () => Promise<void>;
    refreshEventSourceTypes: () => Promise<void>;
    refreshEventTypeTaskTypeMappings: () => Promise<void>;
    refreshTaskTypeActions: () => Promise<void>;
    refreshTaskTypeAttributeMappings: () => Promise<void>;
    refreshTaskDependencies: () => Promise<void>;
    createTaskType: (data: Partial<DataverseTaskType>) => Promise<void>;
    updateTaskType: (id: string, data: Partial<DataverseTaskType>) => Promise<void>;
    deleteTaskType: (id: string) => Promise<void>;
}

export const useDataverseStore = create<DataverseState>((set, get) => ({
    taskTypes: [],
    taskTypeAttributes: [],
    eventTypes: [],
    actionTypeNews: [],
    eventSourceTypes: [],
    eventTypeTaskTypeMappings: [],
    taskTypeActions: [],
    taskTypeAttributeMappings: [],
    taskDependencies: [],
    isLoading: false,
    isInitialized: false,
    error: null,

    initialize: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true, error: null });
        try {
            await Promise.all([
                get().refreshTaskTypes(),
                get().refreshTaskTypeAttributes(),
                get().refreshEventTypes(),
                get().refreshActionTypeNews(),
                get().refreshEventSourceTypes(),
                get().refreshEventTypeTaskTypeMappings(),
                get().refreshTaskTypeActions(),
                get().refreshTaskTypeAttributeMappings(),
                get().refreshTaskDependencies(),
            ]);
            set({ isInitialized: true });
            toast.success('Connected', 'Data loaded from Dataverse');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load data';
            set({ error: message });
            toast.error('Connection Error', message);
        } finally {
            set({ isLoading: false });
        }
    },

    refreshTaskTypes: async () => {
        try {
            const config = DATAVERSE_TABLES.taskTypes;
            const data = await fetchTableData<DataverseTaskType>(config.name, config.columns);
            set({ taskTypes: data.map(mapDataverseTaskType) });
        } catch (error) {
            console.error('Error fetching task types:', error);
            throw error;
        }
    },

    refreshTaskTypeAttributes: async () => {
        try {
            const config = DATAVERSE_TABLES.taskTypeAttributes;
            const data = await fetchTableData<DataverseTaskTypeAttribute>(config.name, config.columns);
            set({ taskTypeAttributes: data.map(mapDataverseTaskTypeAttribute) });
        } catch (error) {
            console.error('Error fetching task type attributes:', error);
            throw error;
        }
    },

    refreshEventTypes: async () => {
        try {
            const config = DATAVERSE_TABLES.eventTypes;
            const data = await fetchTableData<DataverseEventType>(config.name, config.columns);
            set({ eventTypes: data.map(mapDataverseEventType) });
        } catch (error) {
            console.error('Error fetching event types:', error);
            throw error;
        }
    },

    refreshActionTypeNews: async () => {
        try {
            const config = DATAVERSE_TABLES.actionTypeNews;
            const data = await fetchTableData<DataverseActionTypeNew>(config.name, config.columns);
            set({ actionTypeNews: data.map(mapDataverseActionTypeNew) });
        } catch (error) {
            console.error('Error fetching action type news:', error);
            throw error;
        }
    },

    refreshEventSourceTypes: async () => {
        try {
            const config = DATAVERSE_TABLES.eventSourceTypes;
            const data = await fetchTableData<DataverseEventSourceType>(config.name, config.columns);
            set({ eventSourceTypes: data.map(mapDataverseEventSourceType) });
        } catch (error) {
            console.error('Error fetching event source types:', error);
            throw error;
        }
    },

    refreshEventTypeTaskTypeMappings: async () => {
        try {
            const config = DATAVERSE_TABLES.eventTypeTaskTypeMappings;
            const data = await fetchTableData<DataverseEventTypeTaskTypeMapping>(config.name, config.columns);
            set({ eventTypeTaskTypeMappings: data.map(mapEventTypeTaskTypeMapping) });
        } catch (error) {
            console.error('Error fetching event type task type mappings:', error);
            throw error;
        }
    },

    refreshTaskTypeActions: async () => {
        try {
            const config = DATAVERSE_TABLES.taskTypeActions;
            const data = await fetchTableData<DataverseTaskTypeAction>(config.name, config.columns);
            set({ taskTypeActions: data.map(mapTaskTypeAction) });
        } catch (error) {
            console.error('Error fetching task type actions:', error);
            throw error;
        }
    },

    refreshTaskTypeAttributeMappings: async () => {
        try {
            const config = DATAVERSE_TABLES.taskTypeAttributeMappings;
            const data = await fetchTableData<DataverseTaskTypeAttributeMapping>(config.name, config.columns);
            set({ taskTypeAttributeMappings: data.map(mapTaskTypeAttributeMapping) });
        } catch (error) {
            console.error('Error fetching task type attribute mappings:', error);
            throw error;
        }
    },

    refreshTaskDependencies: async () => {
        try {
            const config = DATAVERSE_TABLES.taskDependencies;
            const data = await fetchTableData<DataverseTaskDependency>(config.name, config.columns);
            set({ taskDependencies: data.map(mapDataverseTaskDependency) });
        } catch (error) {
            console.error('Error fetching task dependencies:', error);
            throw error;
        }
    },

    createTaskType: async (data) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.taskTypes.name, data);
            await get().refreshTaskTypes();
            toast.success('Success', 'Task type created');
        } catch (error) {
            toast.error('Error', 'Failed to create task type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateTaskType: async (id, data) => {
        set({ isLoading: true });
        try {
            await updateRecord(DATAVERSE_TABLES.taskTypes.name, id, data);
            await get().refreshTaskTypes();
            toast.success('Success', 'Task type updated');
        } catch (error) {
            toast.error('Error', 'Failed to update task type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deleteTaskType: async (id) => {
        set({ isLoading: true });
        try {
            await deleteRecord(DATAVERSE_TABLES.taskTypes.name, id);
            await get().refreshTaskTypes();
            toast.success('Success', 'Task type deleted');
        } catch (error) {
            toast.error('Error', 'Failed to delete task type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },
}));

export function useDataverse() {
    const store = useDataverseStore();
    if (!store.isInitialized && !store.isLoading) {
        store.initialize();
    }
    return store;
}
