// Dataverse data types matching the API schema

// Task Type from Dataverse
export interface DataverseTaskType {
    crdfd_task_typeid?: string;
    crdfd_name: string;
    crdfd_issteptype?: boolean;
    crdfd_stepstage?: number;
    crdfd_ownertype?: number;
    'crdfd_ownertype@OData.Community.Display.V1.FormattedValue'?: string;
    crdfd_taskdoman?: number;
    'crdfd_taskdoman@OData.Community.Display.V1.FormattedValue'?: string;
    crdfd_tasktypename?: string;
    createdon?: string;
    modifiedon?: string;
    [key: string]: unknown;
}

// Task Type Attribute from Dataverse
export interface DataverseTaskTypeAttribute {
    crdfd_tasktypeattributeid?: string;
    crdfd_name: string;
    crdfd_group?: string;
    crdfd_attribute?: string;
    crdfd_attributeoptions?: string;
    createdon?: string;
    modifiedon?: string;
}

// Event Type from Dataverse
export interface DataverseEventType {
    central_eventtypeid?: string;
    central_name: string;
    crdfd_description?: string;
    _crdfd_eventsourcetype_value?: string;
    crdfd_isactive?: boolean;
    crdfd_retrylimit?: number;
    createdon?: string;
    modifiedon?: string;
}

// Mapping functions to convert Dataverse records to local types
import type { TaskType, TaskTypeAttribute, EventType } from '@/types';
import { generateId } from '@utils/index';

export function mapDataverseTaskType(item: DataverseTaskType): TaskType {
    // Get formatted values (labels) for option set fields
    const ownerTypeLabel = item['crdfd_ownertype@OData.Community.Display.V1.FormattedValue'] as string || '';
    const taskDomanLabel = item['crdfd_taskdoman@OData.Community.Display.V1.FormattedValue'] as string || '';

    return {
        id: item.crdfd_task_typeid || generateId(),
        name: item.crdfd_tasktypename || item.crdfd_name || '',
        code: item.crdfd_name || '',
        description: taskDomanLabel, // Use label for taskdoman
        color: '#3b82f6',
        isStepType: item.crdfd_issteptype || false,
        stepStage: item.crdfd_stepstage,
        ownerType: ownerTypeLabel,
        createdAt: item.createdon ? new Date(item.createdon) : new Date(),
        updatedAt: item.modifiedon ? new Date(item.modifiedon) : new Date(),
    };
}

export function mapDataverseTaskTypeAttribute(item: DataverseTaskTypeAttribute): TaskTypeAttribute {
    return {
        id: item.crdfd_tasktypeattributeid || generateId(),
        taskTypeId: '', // Will need to be linked separately
        name: item.crdfd_attribute || item.crdfd_name || '',
        label: item.crdfd_name || '',
        dataType: 'string' as const,
        required: false,
        order: 0,
        group: item.crdfd_group,
        options: item.crdfd_attributeoptions ?
            item.crdfd_attributeoptions.split(',').map(o => o.trim()) : undefined,
        createdAt: item.createdon ? new Date(item.createdon) : new Date(),
        updatedAt: item.modifiedon ? new Date(item.modifiedon) : new Date(),
    };
}

export function mapDataverseEventType(item: DataverseEventType): EventType {
    return {
        id: item.central_eventtypeid || generateId(),
        name: item.central_name || '',
        code: item.central_name?.toUpperCase().replace(/\s+/g, '_').slice(0, 20) || '',
        description: item.crdfd_description || '',
        eventSourceTypeId: item._crdfd_eventsourcetype_value || '',
        isActive: item.crdfd_isactive ?? true,
        retryLimit: item.crdfd_retrylimit,
        createdAt: item.createdon ? new Date(item.createdon) : new Date(),
        updatedAt: item.modifiedon ? new Date(item.modifiedon) : new Date(),
    };
}

// Action Type New from Dataverse
export interface DataverseActionTypeNew {
    crdfd_actiontypenewid?: string;
    crdfd_name: string;
    crdfd_description?: string;
    createdon?: string;
    modifiedon?: string;
}

export interface ActionTypeNew {
    id: string;
    name: string;
    description?: string;
}

export function mapDataverseActionTypeNew(item: DataverseActionTypeNew): ActionTypeNew {
    return {
        id: item.crdfd_actiontypenewid || generateId(),
        name: item.crdfd_name || '',
        description: item.crdfd_description || '',
    };
}

// Event Source Type from Dataverse
export interface DataverseEventSourceType {
    crdfd_event_source_typeid?: string;
    crdfd_name: string;
    crdfd_description?: string;
    createdon?: string;
    modifiedon?: string;
}

export interface EventSourceTypeNew {
    id: string;
    name: string;
    code: string;
    description?: string;
}

export function mapDataverseEventSourceType(item: DataverseEventSourceType): EventSourceTypeNew {
    return {
        id: item.crdfd_event_source_typeid || generateId(),
        name: item.crdfd_name || '',
        code: item.crdfd_name?.toUpperCase().replace(/\s+/g, '_').slice(0, 20) || '',
        description: item.crdfd_description || '',
    };
}

// ============ MAPPING TABLES ============

// Event Type - Task Type Mapping
export interface DataverseEventTypeTaskTypeMapping {
    crdfd_eventtypetasktypemappingid?: string;
    crdfd_name: string;
    '_crdfd_eventtypeid_value'?: string;
    '_crdfd_tasktypeid_value'?: string;
    crdfd_isinitialtask?: boolean;
}

export interface EventTypeTaskTypeMapping {
    id: string;
    name: string;
    eventTypeId: string;
    taskTypeId: string;
    isInitialTask: boolean;
}

export function mapEventTypeTaskTypeMapping(item: DataverseEventTypeTaskTypeMapping): EventTypeTaskTypeMapping {
    return {
        id: item.crdfd_eventtypetasktypemappingid || generateId(),
        name: item.crdfd_name || '',
        eventTypeId: item['_crdfd_eventtypeid_value'] || '',
        taskTypeId: item['_crdfd_tasktypeid_value'] || '',
        isInitialTask: item.crdfd_isinitialtask ?? false,
    };
}

// Task Type - Action Mapping
export interface DataverseTaskTypeAction {
    crdfd_tasktypexactionid?: string;
    crdfd_name: string;
    '_crdfd_tasktype_value'?: string;
    '_crdfd_actiontype_value'?: string;
    crdfd_stt?: number;
    crdfd_incharge?: string;
    crdfd_duration?: number;
}

export interface TaskTypeAction {
    id: string;
    name: string;
    taskTypeId: string;
    actionTypeId: string;
    order: number;
    inCharge?: string;
    duration?: number;
}

export function mapTaskTypeAction(item: DataverseTaskTypeAction): TaskTypeAction {
    return {
        id: item.crdfd_tasktypexactionid || generateId(),
        name: item.crdfd_name || '',
        taskTypeId: item['_crdfd_tasktype_value'] || '',
        actionTypeId: item['_crdfd_actiontype_value'] || '',
        order: item.crdfd_stt ?? 0,
        inCharge: item.crdfd_incharge,
        duration: item.crdfd_duration,
    };
}

// Task Type - Attribute Mapping
export interface DataverseTaskTypeAttributeMapping {
    crdfd_tasktype_attributeid?: string;
    crdfd_name: string;
    crdfd_taskinstanceuxvisible?: boolean;
    '_crdfd_attribute_value'?: string;
    '_crdfd_tasktype_value'?: string;
}

export interface TaskTypeAttributeMapping {
    id: string;
    name: string;
    taskTypeId: string;
    attributeId: string;
    isVisible: boolean;
}

export function mapTaskTypeAttributeMapping(item: DataverseTaskTypeAttributeMapping): TaskTypeAttributeMapping {
    return {
        id: item.crdfd_tasktype_attributeid || generateId(),
        name: item.crdfd_name || '',
        taskTypeId: item['_crdfd_tasktype_value'] || '',
        attributeId: item['_crdfd_attribute_value'] || '',
        isVisible: item.crdfd_taskinstanceuxvisible ?? true,
    };
}

// Task Dependency from Dataverse
export interface DataverseTaskDependency {
    crdfd_taskdependencyid?: string;
    crdfd_name: string;
    '_cr1bb_eventtype_value'?: string;
    '_cr1bb_parenttask_value'?: string;
    '_cr1bb_childtask_value'?: string;
    crdfd_outcome?: string;
    'crdfd_outcome@OData.Community.Display.V1.FormattedValue'?: string;
    createdon?: string;
    modifiedon?: string;
}

export interface TaskDependency {
    id: string;
    name: string;
    eventTypeId: string;
    parentTaskId: string;
    childTaskId: string;
    outcome?: string;
}

export function mapDataverseTaskDependency(item: DataverseTaskDependency): TaskDependency {
    return {
        id: item.crdfd_taskdependencyid || generateId(),
        name: item.crdfd_name || '',
        eventTypeId: item['_cr1bb_eventtype_value'] || '',
        parentTaskId: item['_cr1bb_parenttask_value'] || '',
        childTaskId: item['_cr1bb_childtask_value'] || '',
        outcome: item['crdfd_outcome@OData.Community.Display.V1.FormattedValue'] as string || item.crdfd_outcome,
    };
}

