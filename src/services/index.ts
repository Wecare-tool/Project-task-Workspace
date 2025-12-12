import type {
    Project,
    TaskType,
    TaskInstance,
    ActionType,
    ActionInstance,
    EventSourceType,
    EventType,
    EventInstance,

    TaskTypeAttribute,
    TaskTypeEventTypeMapping,
    TaskTypeActionTypeMapping,
    ProjectTaskTypeMapping,
} from '@/types';
import { createStorage } from './storage';

// Entity storage services
export const projectStorage = createStorage<Project>('projects');
export const taskTypeStorage = createStorage<TaskType>('task_types');
export const taskInstanceStorage = createStorage<TaskInstance>('task_instances');
export const actionTypeStorage = createStorage<ActionType>('action_types');
export const actionInstanceStorage = createStorage<ActionInstance>('action_instances');
export const eventSourceTypeStorage = createStorage<EventSourceType>('event_source_types');
export const eventTypeStorage = createStorage<EventType>('event_types');
export const eventInstanceStorage = createStorage<EventInstance>('event_instances');

export const taskTypeAttributeStorage = createStorage<TaskTypeAttribute>('task_type_attributes');

// Mapping storage services
export const taskTypeEventTypeMappingStorage = createStorage<TaskTypeEventTypeMapping>('task_type_event_type_mappings');
export const taskTypeActionTypeMappingStorage = createStorage<TaskTypeActionTypeMapping>('task_type_action_type_mappings');
export const projectTaskTypeMappingStorage = createStorage<ProjectTaskTypeMapping>('project_task_type_mappings');

// Re-export storage service
export * from './storage';
