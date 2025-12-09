import { create } from 'zustand';
import {
    fetchTableData,
    DATAVERSE_TABLES,
    createRecord,
    updateRecord,
    deactivateRecord
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
    mapDataverseTaskInstance,
    mapDataverseEventInstance,
    mapDataverseActionInstance,
    mapDataverseProject,
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
    TaskDependencyNew,
    DataverseTaskInstance,
    DataverseEventInstance,
    DataverseActionInstance,
    DataverseProject,
    ProjectNew,
} from '@services/dataverseTypes';
import type { TaskType, TaskTypeAttribute, EventType, TaskInstance, EventInstance, ActionInstance } from '@/types';
import { toast } from '@stores/index';

interface DataverseState {
    // Entity data
    taskTypes: TaskType[];
    taskTypeAttributes: TaskTypeAttribute[];
    eventTypes: EventType[];
    actionTypeNews: ActionTypeNew[];
    eventSourceTypes: EventSourceTypeNew[];
    taskInstances: TaskInstance[];
    eventInstances: EventInstance[];
    actionInstances: ActionInstance[];
    projects: ProjectNew[];
    // Mapping data
    eventTypeTaskTypeMappings: EventTypeTaskTypeMapping[];
    taskTypeActions: TaskTypeAction[];
    taskTypeAttributeMappings: TaskTypeAttributeMapping[];
    taskDependencies: TaskDependencyNew[];
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
    refreshTaskInstances: () => Promise<void>;
    refreshEventInstances: () => Promise<void>;
    refreshActionInstances: () => Promise<void>;
    refreshEventTypeTaskTypeMappings: () => Promise<void>;
    refreshTaskTypeActions: () => Promise<void>;
    refreshTaskTypeAttributeMappings: () => Promise<void>;
    refreshTaskDependencies: () => Promise<void>;
    refreshProjects: () => Promise<void>;
    createTaskType: (data: Partial<DataverseTaskType>) => Promise<void>;
    updateTaskType: (id: string, data: Partial<DataverseTaskType>) => Promise<void>;
    deactivateTaskType: (id: string) => Promise<void>;
    // Projects
    createProject: (data: Partial<DataverseProject>) => Promise<void>;
    updateProject: (id: string, data: Partial<DataverseProject>) => Promise<void>;
    deactivateProject: (id: string) => Promise<void>;
    // Task Instances
    createTaskInstance: (data: Partial<DataverseTaskInstance>) => Promise<void>;
    updateTaskInstance: (id: string, data: Partial<DataverseTaskInstance>) => Promise<void>;
    deactivateTaskInstance: (id: string) => Promise<void>;
    // Task Dependencies
    createTaskDependency: (data: Partial<DataverseTaskDependency>) => Promise<void>;
    updateTaskDependency: (id: string, data: Partial<DataverseTaskDependency>) => Promise<void>;
    deactivateTaskDependency: (id: string) => Promise<void>;
    // Mappings
    createEventTypeTaskTypeMapping: (data: Partial<DataverseEventTypeTaskTypeMapping>) => Promise<void>;
    updateEventTypeTaskTypeMapping: (id: string, data: Partial<DataverseEventTypeTaskTypeMapping>) => Promise<void>;
    deactivateEventTypeTaskTypeMapping: (id: string) => Promise<void>;
    createTaskTypeAction: (data: Partial<DataverseTaskTypeAction>) => Promise<void>;
    updateTaskTypeAction: (id: string, data: Partial<DataverseTaskTypeAction>) => Promise<void>;
    deactivateTaskTypeAction: (id: string) => Promise<void>;
    createTaskTypeAttributeMapping: (data: Partial<DataverseTaskTypeAttributeMapping>) => Promise<void>;
    updateTaskTypeAttributeMapping: (id: string, data: Partial<DataverseTaskTypeAttributeMapping>) => Promise<void>;
    deactivateTaskTypeAttributeMapping: (id: string) => Promise<void>;
}

export const useDataverseStore = create<DataverseState>((set: any, get: any) => ({
    taskTypes: [],
    taskTypeAttributes: [],
    eventTypes: [],
    actionTypeNews: [],
    eventSourceTypes: [],
    taskInstances: [],
    eventInstances: [],
    actionInstances: [],
    eventTypeTaskTypeMappings: [],
    taskTypeActions: [],
    taskTypeAttributeMappings: [],
    taskDependencies: [],
    projects: [],
    isLoading: false,
    isInitialized: false,
    error: null,

    initialize: async () => {
        if (get().isInitialized) return;
        set({ isLoading: true, error: null });
        try {
            const results = await Promise.allSettled([
                get().refreshTaskTypes(),
                get().refreshTaskTypeAttributes(),
                get().refreshEventTypes(),
                get().refreshActionTypeNews(),
                get().refreshEventSourceTypes(),
                get().refreshEventTypeTaskTypeMappings(),
                get().refreshTaskTypeActions(),
                get().refreshTaskTypeAttributeMappings(),
                get().refreshTaskDependencies(),
                // Refresh instances as well
                get().refreshTaskInstances(),
                get().refreshEventInstances(),
                get().refreshActionInstances(),
                get().refreshProjects(),
            ]);

            // Log failures
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    console.error(`Failed to load data for item index ${index}:`, result.reason);
                }
            });

            // Check if all failed (critical failure) or just some
            const allFailed = results.every(r => r.status === 'rejected');
            if (allFailed) {
                throw new Error('Failed to load any data from Dataverse');
            }

            set({ isInitialized: true });

            const someFailed = results.some(r => r.status === 'rejected');
            if (someFailed) {
                toast.warning('Connected with Warnings', 'Some data failed to load. Check console for details.');
            } else {
                toast.success('Connected', 'Data loaded from Dataverse');
            }
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

    refreshTaskInstances: async () => {
        try {
            const config = DATAVERSE_TABLES.taskInstances;
            const data = await fetchTableData<DataverseTaskInstance>(config.name, config.columns);
            set({ taskInstances: data.map(mapDataverseTaskInstance) });
        } catch (error) {
            console.error('Error fetching task instances:', error);
            throw error;
        }
    },

    refreshEventInstances: async () => {
        try {
            const config = DATAVERSE_TABLES.eventInstances;
            const data = await fetchTableData<DataverseEventInstance>(config.name, config.columns);
            set({ eventInstances: data.map(mapDataverseEventInstance) });
        } catch (error) {
            console.error('Error fetching event instances:', error);
            throw error;
        }
    },

    refreshActionInstances: async () => {
        try {
            const config = DATAVERSE_TABLES.actionInstances;
            const data = await fetchTableData<DataverseActionInstance>(config.name, config.columns);
            set({ actionInstances: data.map(mapDataverseActionInstance) });
        } catch (error) {
            console.error('Error fetching action instances:', error);
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

    refreshProjects: async () => {
        try {
            const config = DATAVERSE_TABLES.projects;
            const data = await fetchTableData<DataverseProject>(config.name, config.columns);
            set({ projects: data.map(mapDataverseProject) });
        } catch (error) {
            console.error('Error fetching projects:', error);
            throw error;
        }
    },

    createTaskType: async (data: any) => {
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

    updateTaskType: async (id: any, data: any) => {
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

    deactivateTaskType: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.taskTypes.name, id);
            await get().refreshTaskTypes();
            toast.success('Success', 'Task type deactivated');
        } catch (error) {
            toast.error('Error', 'Failed to deactivate task type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Projects
    createProject: async (data: any) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.projects.name, data);
            await get().refreshProjects();
            toast.success('Success', 'Project created');
        } catch (error) {
            toast.error('Error', 'Failed to create project');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateProject: async (id: any, data: any) => {
        set({ isLoading: true });
        try {
            await updateRecord(DATAVERSE_TABLES.projects.name, id, data);
            await get().refreshProjects();
            toast.success('Success', 'Project updated');
        } catch (error) {
            toast.error('Error', 'Failed to update project');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deactivateProject: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.projects.name, id);
            await get().refreshProjects();
            toast.success('Success', 'Project deactivated');
        } catch (error) {
            toast.error('Error', 'Failed to deactivate project');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Task Instances
    createTaskInstance: async (data: any) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.taskInstances.name, data);
            await get().refreshTaskInstances();
            toast.success('Success', 'Task instance created');
        } catch (error) {
            toast.error('Error', 'Failed to create task instance');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateTaskInstance: async (id: any, data: any) => {
        set({ isLoading: true });
        try {
            await updateRecord(DATAVERSE_TABLES.taskInstances.name, id, data);
            await get().refreshTaskInstances();
            toast.success('Success', 'Task instance updated');
        } catch (error) {
            toast.error('Error', 'Failed to update task instance');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deactivateTaskInstance: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.taskInstances.name, id);
            await get().refreshTaskInstances();
            toast.success('Success', 'Task instance deactivated');
        } catch (error) {
            toast.error('Error', 'Failed to deactivate task instance');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Task Dependencies
    createTaskDependency: async (data: any) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.taskDependencies.name, data);
            await get().refreshTaskDependencies();
            toast.success('Success', 'Task dependency created');
        } catch (error) {
            toast.error('Error', 'Failed to create task dependency');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateTaskDependency: async (id: any, data: any) => {
        set({ isLoading: true });
        try {
            await updateRecord(DATAVERSE_TABLES.taskDependencies.name, id, data);
            await get().refreshTaskDependencies();
            toast.success('Success', 'Task dependency updated');
        } catch (error) {
            toast.error('Error', 'Failed to update task dependency');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deactivateTaskDependency: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.taskDependencies.name, id);
            await get().refreshTaskDependencies();
            toast.success('Success', 'Task dependency deactivated');
        } catch (error) {
            toast.error('Error', 'Failed to deactivate task dependency');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Mappings
    createEventTypeTaskTypeMapping: async (data: any) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.eventTypeTaskTypeMappings.name, data);
            await get().refreshEventTypeTaskTypeMappings();
            toast.success('Success', 'Mapping created');
        } catch (error) {
            toast.error('Error', 'Failed to create mapping');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateEventTypeTaskTypeMapping: async (id: any, data: any) => {
        set({ isLoading: true });
        try {
            await updateRecord(DATAVERSE_TABLES.eventTypeTaskTypeMappings.name, id, data);
            await get().refreshEventTypeTaskTypeMappings();
            toast.success('Success', 'Mapping updated');
        } catch (error) {
            toast.error('Error', 'Failed to update mapping');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deactivateEventTypeTaskTypeMapping: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.eventTypeTaskTypeMappings.name, id);
            await get().refreshEventTypeTaskTypeMappings();
            toast.success('Success', 'Mapping deactivated');
        } catch (error) {
            toast.error('Error', 'Failed to deactivate mapping');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    createTaskTypeAction: async (data: any) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.taskTypeActions.name, data);
            await get().refreshTaskTypeActions();
            toast.success('Success', 'Task Type Action created');
        } catch (error) {
            toast.error('Error', 'Failed to create Task Type Action');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateTaskTypeAction: async (id: any, data: any) => {
        set({ isLoading: true });
        try {
            await updateRecord(DATAVERSE_TABLES.taskTypeActions.name, id, data);
            await get().refreshTaskTypeActions();
            toast.success('Success', 'Task Type Action updated');
        } catch (error) {
            toast.error('Error', 'Failed to update Task Type Action');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deactivateTaskTypeAction: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.taskTypeActions.name, id);
            await get().refreshTaskTypeActions();
            toast.success('Success', 'Task Type Action deactivated');
        } catch (error) {
            toast.error('Error', 'Failed to deactivate Task Type Action');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    createTaskTypeAttributeMapping: async (data: any) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.taskTypeAttributeMappings.name, data);
            await get().refreshTaskTypeAttributeMappings();
            toast.success('Success', 'Attribute Mapping created');
        } catch (error) {
            toast.error('Error', 'Failed to create Attribute Mapping');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateTaskTypeAttributeMapping: async (id: any, data: any) => {
        set({ isLoading: true });
        try {
            await updateRecord(DATAVERSE_TABLES.taskTypeAttributeMappings.name, id, data);
            await get().refreshTaskTypeAttributeMappings();
            toast.success('Success', 'Attribute Mapping updated');
        } catch (error) {
            toast.error('Error', 'Failed to update Attribute Mapping');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deactivateTaskTypeAttributeMapping: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.taskTypeAttributeMappings.name, id);
            await get().refreshTaskTypeAttributeMappings();
            toast.success('Success', 'Attribute Mapping deactivated');
        } catch (error) {
            toast.error('Error', 'Failed to deactivate Attribute Mapping');
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
