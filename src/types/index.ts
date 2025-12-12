// ============================================
// Base Types
// ============================================

export interface BaseEntity {
    id: string;
    createdAt: Date;
    updatedAt: Date;
}

// ============================================
// Project
// ============================================

export type ProjectStatus = 'active' | 'archived' | 'on-hold';

export interface Project extends BaseEntity {
    name: string;
    code: string;
    description?: string;
    status: ProjectStatus;
    startDate: Date;
    endDate?: Date;
}

// ============================================
// Task Type
// ============================================

export interface TaskType extends BaseEntity {
    name: string;
    code: string;
    description?: string;
    color?: string;
    icon?: string;
    isStepType?: boolean;
    stepStage?: number;
    ownerType?: string;
    [key: string]: unknown;
}

// ============================================
// Task Instance
// ============================================

export type TaskStatus = 'not-started' | 'in-progress' | 'blocked' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface TaskInstance extends BaseEntity {
    title: string;
    description?: string;
    taskTypeId: string;
    projectId: string;
    status: TaskStatus;
    priority: TaskPriority;
    dueDate?: Date;
    startDate?: Date;
    completedAt?: Date;
    assignee?: string;
}

// ============================================
// Action Type
// ============================================

export interface ActionType extends BaseEntity {
    name: string;
    code: string;
    description?: string;
    icon?: string;
}

// ============================================
// Action Instance
// ============================================

export type ActionStatus = 'pending' | 'completed' | 'failed' | 'skipped';

export interface ActionInstance extends BaseEntity {
    actionTypeId: string;
    taskInstanceId: string;
    status: ActionStatus;
    executedAt?: Date;
    result?: string;
    notes?: string;
}

// ============================================
// Event Source Type
// ============================================

export interface EventSourceType extends BaseEntity {
    name: string;
    code: string;
    description?: string;
}

// ============================================
// Event Type
// ============================================

export interface EventType extends BaseEntity {
    name: string;
    code: string;
    description?: string;
    eventSourceTypeId: string;
    isActive?: boolean;
    retryLimit?: number;
    [key: string]: unknown;
}

// ============================================
// Event Instance
// ============================================

export interface EventInstance extends BaseEntity {
    name: string;
    eventTypeId: string;
    taskInstanceId: string;
    timestamp: Date;
    data?: Record<string, unknown>;
    source?: string;
}



// ============================================
// Task Type Attribute
// ============================================

export type AttributeDataType = 'string' | 'number' | 'boolean' | 'date' | 'select' | 'multiselect';

export interface TaskTypeAttribute extends BaseEntity {
    taskTypeId: string;
    name: string;
    label: string;
    dataType: AttributeDataType;
    required: boolean;
    defaultValue?: string;
    options?: string[]; // For select/multiselect
    order: number;
    group?: string;
    [key: string]: unknown;
}

// ============================================
// Mapping Types (Many-to-Many)
// ============================================

export interface TaskTypeEventTypeMapping {
    id: string;
    taskTypeId: string;
    eventTypeId: string;
    isInitialTask?: boolean;
}

export interface TaskTypeActionTypeMapping {
    id: string;
    taskTypeId: string;
    actionTypeId: string;
}

export interface ProjectTaskTypeMapping {
    id: string;
    projectId: string;
    taskTypeId: string;
}

// ============================================
// Form & UI Types
// ============================================

export type FormFieldType =
    | 'text'
    | 'number'
    | 'email'
    | 'password'
    | 'textarea'
    | 'select'
    | 'multiselect'
    | 'checkbox'
    | 'date'
    | 'datetime'
    | 'color';

export interface FormField {
    name: string;
    label: string;
    type: FormFieldType;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    options?: SelectOption[];
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    helperText?: string;
}

export interface SelectOption {
    label: string;
    value: string;
    disabled?: boolean;
}

export interface TableColumn<T> {
    key: keyof T | string;
    label: string;
    sortable?: boolean;
    width?: string;
    render?: (value: unknown, row: T) => React.ReactNode;
}

export interface PaginationInfo {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T> {
    data: T;
    success: boolean;
    message?: string;
}

export interface ApiListResponse<T> {
    data: T[];
    pagination: PaginationInfo;
    success: boolean;
}

// ============================================
// Filter & Sort Types
// ============================================

export interface FilterOption {
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in';
    value: unknown;
}

export interface SortOption {
    field: string;
    direction: 'asc' | 'desc';
}

export interface QueryOptions {
    filters?: FilterOption[];
    sort?: SortOption;
    page?: number;
    pageSize?: number;
    search?: string;
}

// ============================================
// Toast/Notification Types
// ============================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

// ============================================
// Dashboard Types
// ============================================

export interface DashboardStats {
    totalProjects: number;
    activeProjects: number;
    archivedProjects: number;
    totalTasks: number;
    tasksByStatus: {
        notStarted: number;
        inProgress: number;
        blocked: number;
        completed: number;
    };
    recentProjects: Project[];
    recentTasks: TaskInstance[];
}

// ============================================
// CRM / Dataverse Types
// ============================================

export interface CRMTaskInstance {
    crdfd_task_instances: string; // Table Name or ID
    crdfd_task_instanceid: string;
    crdfd_name: string;
    _crdfd_tasktype_value: string;
    _crdfd_eventinstance_value?: string;
    crdfd_priority: number; // Assuming priority is number/enum, verify utilization
    crdfd_rank: number;
    crdfd_incharge?: string;
    cr1bb_trangthai: number; // Status code
    crdfd_deadline?: Date;
    crdfd_discussion?: string;
    crdfd_stepstage?: string;
    crdfd_structuredplan?: string;
    crdfd_taskresult?: string;
    crdfd_taskresultrecord?: string;
    crdfd_taskresulttable?: string;
}

export interface CRMEventInstance {
    crdfd_eventinstances: string; // Table Name or ID
    crdfd_eventinstanceid: string; // Primary Key usually ends with id
    crdfd_name: string;
    _crdfd_eventtype_value: string;
    crdfd_mesage?: string;
    crdfd_trangthai: number;
    crdfd_recordid?: string;
}

export interface CRMActionInstance {
    crdfd_actioninstances: string; // Table Name or ID
    crdfd_actioninstanceid: string;
    crdfd_name: string;
    _crdfd_taskinstance_value: string;
    crdfd_trangthai: number;
    _crdfd_tasktypexaction_value?: string;
}
