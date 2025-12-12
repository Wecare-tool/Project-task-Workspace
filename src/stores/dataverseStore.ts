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

    mapDataverseTaskInstance,
    mapDataverseEventInstance,
    mapDataverseActionInstance,
    mapDataverseProject,
    mapProjectTaskTypeMapping,
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

    DataverseTaskInstance,
    DataverseEventInstance,
    DataverseActionInstance,
    DataverseProject,
    ProjectNew,
    DataverseProjectTaskTypeMapping,
    ProjectTaskTypeMapping,
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
    projectTaskTypeMappings: ProjectTaskTypeMapping[];
    taskTypeActions: TaskTypeAction[];
    taskTypeAttributeMappings: TaskTypeAttributeMapping[];

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

    refreshProjects: () => Promise<void>;
    refreshProjectTaskTypeMappings: () => Promise<void>;
    createTaskType: (data: Partial<DataverseTaskType>) => Promise<void>;
    updateTaskType: (id: string, data: Partial<DataverseTaskType>) => Promise<void>;
    deactivateTaskType: (id: string) => Promise<void>;
    // Task Type Attribute
    createTaskTypeAttribute: (data: Partial<DataverseTaskTypeAttribute>) => Promise<void>;
    updateTaskTypeAttribute: (id: string, data: Partial<DataverseTaskTypeAttribute>) => Promise<void>;
    deactivateTaskTypeAttribute: (id: string) => Promise<void>;
    // Projects
    createProject: (data: Partial<DataverseProject>) => Promise<void>;
    updateProject: (id: string, data: Partial<DataverseProject>) => Promise<void>;
    deactivateProject: (id: string) => Promise<void>;
    // Task Instances
    createTaskInstance: (data: Partial<DataverseTaskInstance>) => Promise<void>;
    updateTaskInstance: (id: string, data: Partial<DataverseTaskInstance>) => Promise<void>;
    deactivateTaskInstance: (id: string) => Promise<void>;

    // Mappings
    createEventTypeTaskTypeMapping: (data: Partial<DataverseEventTypeTaskTypeMapping>) => Promise<void>;
    updateEventTypeTaskTypeMapping: (id: string, data: Partial<DataverseEventTypeTaskTypeMapping>) => Promise<void>;
    deactivateEventTypeTaskTypeMapping: (id: string) => Promise<void>;
    setInitialTaskTypeForEventType: (eventTypeId: string, taskTypeId: string) => Promise<void>;
    createTaskTypeAction: (data: Partial<DataverseTaskTypeAction>) => Promise<void>;
    updateTaskTypeAction: (id: string, data: Partial<DataverseTaskTypeAction>) => Promise<void>;
    deactivateTaskTypeAction: (id: string) => Promise<void>;
    createTaskTypeAttributeMapping: (data: Partial<DataverseTaskTypeAttributeMapping>) => Promise<void>;
    updateTaskTypeAttributeMapping: (id: string, data: Partial<DataverseTaskTypeAttributeMapping>) => Promise<void>;
    deactivateTaskTypeAttributeMapping: (id: string) => Promise<void>;
    // Project Task Type Mappings
    createProjectTaskTypeMapping: (data: Partial<DataverseProjectTaskTypeMapping>) => Promise<void>;
    deactivateProjectTaskTypeMapping: (id: string) => Promise<void>;
    // Event Types
    createEventType: (data: Partial<DataverseEventType>) => Promise<void>;
    updateEventType: (id: string, data: Partial<DataverseEventType>) => Promise<void>;
    deactivateEventType: (id: string) => Promise<void>;
    // Event Source Types
    createEventSourceType: (data: Partial<DataverseEventSourceType>) => Promise<void>;
    updateEventSourceType: (id: string, data: Partial<DataverseEventSourceType>) => Promise<void>;
    deactivateEventSourceType: (id: string) => Promise<void>;
    // Action Type New
    createActionTypeNew: (data: Partial<DataverseActionTypeNew>) => Promise<void>;
    updateActionTypeNew: (id: string, data: Partial<DataverseActionTypeNew>) => Promise<void>;
    deactivateActionTypeNew: (id: string) => Promise<void>;
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

    projects: [],
    projectTaskTypeMappings: [],
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

                // Refresh instances as well
                get().refreshTaskInstances(),
                get().refreshEventInstances(),
                get().refreshActionInstances(),
                get().refreshProjects(),
                get().refreshProjectTaskTypeMappings(),
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
            // Only fetch active records (statecode = 0)
            const data = await fetchTableData<DataverseTaskType>(config.name, config.columns, 'statecode eq 0');
            set({ taskTypes: data.map(mapDataverseTaskType) });
        } catch (error) {
            console.error('Error fetching task types:', error);
            throw error;
        }
    },

    refreshTaskTypeAttributes: async () => {
        try {
            const config = DATAVERSE_TABLES.taskTypeAttributes;
            const data = await fetchTableData<DataverseTaskTypeAttribute>(config.name, config.columns, 'statecode eq 0');
            set({ taskTypeAttributes: data.map(mapDataverseTaskTypeAttribute) });
        } catch (error) {
            console.error('Error fetching task type attributes:', error);
            throw error;
        }
    },

    refreshEventTypes: async () => {
        try {
            const config = DATAVERSE_TABLES.eventTypes;
            const data = await fetchTableData<DataverseEventType>(config.name, config.columns, 'statecode eq 0');
            set({ eventTypes: data.map(mapDataverseEventType) });
        } catch (error) {
            console.error('Error fetching event types:', error);
            throw error;
        }
    },

    refreshActionTypeNews: async () => {
        try {
            const config = DATAVERSE_TABLES.actionTypeNews;
            const data = await fetchTableData<DataverseActionTypeNew>(config.name, config.columns, 'statecode eq 0');
            set({ actionTypeNews: data.map(mapDataverseActionTypeNew) });
        } catch (error) {
            console.error('Error fetching action type news:', error);
            throw error;
        }
    },

    refreshEventSourceTypes: async () => {
        try {
            const config = DATAVERSE_TABLES.eventSourceTypes;
            const data = await fetchTableData<DataverseEventSourceType>(config.name, config.columns, 'statecode eq 0');
            set({ eventSourceTypes: data.map(mapDataverseEventSourceType) });
        } catch (error) {
            console.error('Error fetching event source types:', error);
            throw error;
        }
    },

    refreshTaskInstances: async () => {
        try {
            const config = DATAVERSE_TABLES.taskInstances;
            const data = await fetchTableData<DataverseTaskInstance>(config.name, config.columns, 'statecode eq 0');
            set({ taskInstances: data.map(mapDataverseTaskInstance) });
        } catch (error) {
            console.error('Error fetching task instances:', error);
            throw error;
        }
    },

    refreshEventInstances: async () => {
        try {
            const config = DATAVERSE_TABLES.eventInstances;
            const data = await fetchTableData<DataverseEventInstance>(config.name, config.columns, 'statecode eq 0');
            set({ eventInstances: data.map(mapDataverseEventInstance) });
        } catch (error) {
            console.error('Error fetching event instances:', error);
            throw error;
        }
    },

    refreshActionInstances: async () => {
        try {
            const config = DATAVERSE_TABLES.actionInstances;
            const data = await fetchTableData<DataverseActionInstance>(config.name, config.columns, 'statecode eq 0');
            set({ actionInstances: data.map(mapDataverseActionInstance) });
        } catch (error) {
            console.error('Error fetching action instances:', error);
            throw error;
        }
    },

    refreshEventTypeTaskTypeMappings: async () => {
        try {
            const config = DATAVERSE_TABLES.eventTypeTaskTypeMappings;
            const data = await fetchTableData<DataverseEventTypeTaskTypeMapping>(config.name, config.columns, 'statecode eq 0');
            set({ eventTypeTaskTypeMappings: data.map(mapEventTypeTaskTypeMapping) });
        } catch (error) {
            console.error('Error fetching event type task type mappings:', error);
            throw error;
        }
    },

    refreshTaskTypeActions: async () => {
        try {
            const config = DATAVERSE_TABLES.taskTypeActions;
            const data = await fetchTableData<DataverseTaskTypeAction>(config.name, config.columns, 'statecode eq 0');
            set({ taskTypeActions: data.map(mapTaskTypeAction) });
        } catch (error) {
            console.error('Error fetching task type actions:', error);
            throw error;
        }
    },

    refreshTaskTypeAttributeMappings: async () => {
        try {
            const config = DATAVERSE_TABLES.taskTypeAttributeMappings;
            const data = await fetchTableData<DataverseTaskTypeAttributeMapping>(config.name, config.columns, 'statecode eq 0');
            set({ taskTypeAttributeMappings: data.map(mapTaskTypeAttributeMapping) });
        } catch (error) {
            console.error('Error fetching task type attribute mappings:', error);
            throw error;
        }
    },



    refreshProjects: async () => {
        try {
            const config = DATAVERSE_TABLES.projects;
            const data = await fetchTableData<DataverseProject>(config.name, config.columns, 'statecode eq 0');
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

    // Task Type Attributes
    createTaskTypeAttribute: async (data: any) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.taskTypeAttributes.name, data);
            await get().refreshTaskTypeAttributes();
            toast.success('Success', 'Attribute created');
        } catch (error) {
            toast.error('Error', 'Failed to create attribute');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateTaskTypeAttribute: async (id: any, data: any) => {
        set({ isLoading: true });
        try {
            await updateRecord(DATAVERSE_TABLES.taskTypeAttributes.name, id, data);
            await get().refreshTaskTypeAttributes();
            toast.success('Success', 'Attribute updated');
        } catch (error) {
            toast.error('Error', 'Failed to update attribute');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deactivateTaskTypeAttribute: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.taskTypeAttributes.name, id);
            await get().refreshTaskTypeAttributes();
            toast.success('Success', 'Attribute deactivated');
        } catch (error) {
            toast.error('Error', 'Failed to deactivate attribute');
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

    setInitialTaskTypeForEventType: async (eventTypeId: string, taskTypeId: string) => {
        set({ isLoading: true });
        const config = DATAVERSE_TABLES.eventTypeTaskTypeMappings;
        try {
            const currentMappings = get().eventTypeTaskTypeMappings.filter((m: EventTypeTaskTypeMapping) => m.eventTypeId === eventTypeId);
            const target = currentMappings.find((m: EventTypeTaskTypeMapping) => m.taskTypeId === taskTypeId);
            const existingInitials = currentMappings.filter((m: EventTypeTaskTypeMapping) => m.isInitialTask && m.taskTypeId !== taskTypeId);

            // Clear other initials
            for (const mapping of existingInitials) {
                await updateRecord(config.name, mapping.id, { crdfd_isinitialtask: false });
            }

            if (target) {
                await updateRecord(config.name, target.id, { crdfd_isinitialtask: true });
            } else {
                await createRecord(config.name, {
                    crdfd_name: `ET-${eventTypeId}-TT-${taskTypeId}`,
                    'crdfd_EventTypeId@odata.bind': `/central_eventtypes(${eventTypeId})`,
                    'crdfd_Nexttask@odata.bind': `/crdfd_task_types(${taskTypeId})`,
                    crdfd_isinitialtask: true,
                });
            }

            await get().refreshEventTypeTaskTypeMappings();
            toast.success('Success', 'Initial task updated');
        } catch (error) {
            toast.error('Error', 'Failed to update initial task');
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

    // Event Types
    createEventType: async (data: any) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.eventTypes.name, data);
            await get().refreshEventTypes();
            toast.success('Success', 'Event type created');
        } catch (error) {
            toast.error('Error', 'Failed to create event type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateEventType: async (id: any, data: any) => {
        set({ isLoading: true });
        try {
            await updateRecord(DATAVERSE_TABLES.eventTypes.name, id, data);
            await get().refreshEventTypes();
            toast.success('Success', 'Event type updated');
        } catch (error) {
            toast.error('Error', 'Failed to update event type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deactivateEventType: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.eventTypes.name, id);
            await get().refreshEventTypes();
            toast.success('Success', 'Event type deactivated');
        } catch (error) {
            toast.error('Error', 'Failed to deactivate event type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Event Source Types
    createEventSourceType: async (data: any) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.eventSourceTypes.name, data);
            await get().refreshEventSourceTypes();
            toast.success('Success', 'Event Source Type created');
        } catch (error) {
            toast.error('Error', 'Failed to create Event Source Type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateEventSourceType: async (id: any, data: any) => {
        set({ isLoading: true });
        try {
            await updateRecord(DATAVERSE_TABLES.eventSourceTypes.name, id, data);
            await get().refreshEventSourceTypes();
            toast.success('Success', 'Event Source Type updated');
        } catch (error) {
            toast.error('Error', 'Failed to update Event Source Type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deactivateEventSourceType: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.eventSourceTypes.name, id);
            await get().refreshEventSourceTypes();
            toast.success('Success', 'Event Source Type deactivated');
        } catch (error) {
            toast.error('Error', 'Failed to deactivate Event Source Type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Project Task Type Mappings
    refreshProjectTaskTypeMappings: async () => {
        try {
            const config = DATAVERSE_TABLES.projectTaskTypeMappings;
            const data = await fetchTableData<DataverseProjectTaskTypeMapping>(config.name, config.columns, 'statecode eq 0');
            set({ projectTaskTypeMappings: data.map(mapProjectTaskTypeMapping) });
        } catch (error) {
            console.error('Error fetching project task type mappings:', error);
            throw error;
        }
    },

    createProjectTaskTypeMapping: async (data: any) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.projectTaskTypeMappings.name, data);
            await get().refreshProjectTaskTypeMappings();
            toast.success('Success', 'Project Task Type added');
        } catch (error) {
            toast.error('Error', 'Failed to add Project Task Type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deactivateProjectTaskTypeMapping: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.projectTaskTypeMappings.name, id);
            await get().refreshProjectTaskTypeMappings();
            toast.success('Success', 'Project Task Type removed');
        } catch (error) {
            toast.error('Error', 'Failed to remove Project Task Type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    // Action Type New
    createActionTypeNew: async (data: any) => {
        set({ isLoading: true });
        try {
            await createRecord(DATAVERSE_TABLES.actionTypeNews.name, data);
            await get().refreshActionTypeNews();
            toast.success('Success', 'Action Type created');
        } catch (error) {
            toast.error('Error', 'Failed to create Action Type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    updateActionTypeNew: async (id: any, data: any) => {
        set({ isLoading: true });
        try {
            await updateRecord(DATAVERSE_TABLES.actionTypeNews.name, id, data);
            await get().refreshActionTypeNews();
            toast.success('Success', 'Action Type updated');
        } catch (error) {
            toast.error('Error', 'Failed to update Action Type');
            throw error;
        } finally {
            set({ isLoading: false });
        }
    },

    deactivateActionTypeNew: async (id: any) => {
        set({ isLoading: true });
        try {
            await deactivateRecord(DATAVERSE_TABLES.actionTypeNews.name, id);
            await get().refreshActionTypeNews();
            toast.success('Success', 'Action Type deactivated');
        } catch (error) {
            toast.error('Error', 'Failed to deactivate Action Type');
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
