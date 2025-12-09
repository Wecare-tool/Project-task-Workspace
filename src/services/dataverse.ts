// Dataverse API Configuration and Service

const CONFIG = {
    // Power Automate endpoint to get access token
    tokenEndpoint: 'https://de210e4bcd22e60591ca8e841aad4b.8e.environment.api.powerplatform.com:443/powerautomate/automations/direct/workflows/8a726ce87be943a784746a966fb1028a/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=LBWfWvNo6KkbYHVq2VvZaMrv5eusXpM0e9U4Tsc8Kxo',

    // Dataverse API base URL
    dataverseUrl: 'https://wecare-ii.crm5.dynamics.com/api/data/v9.2/',
};

// Table configurations with column mappings
export const DATAVERSE_TABLES = {
    taskTypes: {
        name: 'crdfd_task_types',
        columns: ['crdfd_name', 'crdfd_issteptype', 'crdfd_stepstage', 'crdfd_ownertype', 'crdfd_taskdoman', 'crdfd_tasktypename'],
        idField: 'crdfd_task_typeid',
    },
    taskTypeAttributes: {
        name: 'crdfd_tasktypeattributes',
        columns: ['crdfd_name', 'crdfd_group', 'crdfd_attribute', 'crdfd_attributeoptions'],
        idField: 'crdfd_tasktypeattributeid',
    },
    eventTypes: {
        name: 'central_eventtypes',
        columns: ['central_name', 'crdfd_description', '_crdfd_eventsourcetype_value', 'crdfd_isactive', 'crdfd_retrylimit'],
        idField: 'central_eventtypeid',
    },
    actionTypeNews: {
        name: 'crdfd_actiontypenews',
        columns: ['crdfd_actiontypenewid', 'crdfd_name', 'crdfd_description'],
        idField: 'crdfd_actiontypenewid',
    },
    eventSourceTypes: {
        name: 'crdfd_event_source_types',
        columns: ['crdfd_event_source_typeid', 'crdfd_name', 'crdfd_description'],
        idField: 'crdfd_event_source_typeid',
    },
    // Mapping tables
    eventTypeTaskTypeMappings: {
        name: 'crdfd_eventtypetasktypemappings',
        columns: ['crdfd_eventtypetasktypemappingid', 'crdfd_name', '_crdfd_eventtypeid_value', '_crdfd_tasktypeid_value', 'crdfd_isinitialtask'],
        idField: 'crdfd_eventtypetasktypemappingid',
    },
    taskTypeActions: {
        name: 'crdfd_tasktypexactions',
        columns: ['crdfd_tasktypexactionid', 'crdfd_name', '_crdfd_tasktype_value', '_crdfd_actiontype_value', 'crdfd_stt', 'crdfd_incharge', 'crdfd_duration'],
        idField: 'crdfd_tasktypexactionid',
    },
    taskTypeAttributeMappings: {
        name: 'crdfd_tasktype_attributes',
        columns: ['crdfd_tasktype_attributeid', 'crdfd_name', 'crdfd_taskinstanceuxvisible', '_crdfd_attribute_value', '_crdfd_tasktype_value'],
        idField: 'crdfd_tasktype_attributeid',
    },
    taskDependencies: {
        name: 'crdfd_taskdependencies',
        columns: ['crdfd_taskdependencyid', 'crdfd_name', '_cr1bb_eventtype_value', '_cr1bb_parenttask_value', '_cr1bb_childtask_value', 'crdfd_outcome'],
        idField: 'crdfd_taskdependencyid',
    },
    taskInstances: {
        name: 'crdfd_task_instances',
        columns: [
            'crdfd_task_instanceid', 'crdfd_name', '_crdfd_tasktype_value', '_crdfd_eventinstance_value',
            'crdfd_priority', 'crdfd_rank', '_crdfd_incharge_value', 'cr1bb_trangthai', 'crdfd_deadline',
            'crdfd_discussion', 'crdfd_stepstage', 'crdfd_structuredplan', 'crdfd_taskresult',
            'crdfd_taskresultrecord', 'crdfd_taskresulttable'
        ],
        idField: 'crdfd_task_instanceid',
    },
    eventInstances: {
        name: 'crdfd_eventinstances',
        columns: ['crdfd_eventinstanceid', 'crdfd_name', '_crdfd_eventtype_value', 'crdfd_recordid'],
        idField: 'crdfd_eventinstanceid',
    },
    actionInstances: {
        name: 'crdfd_actioninstances',
        columns: ['crdfd_actioninstanceid', 'crdfd_name', '_crdfd_taskinstance_value', 'crdfd_trangthai', '_crdfd_tasktypexaction_value'],
        idField: 'crdfd_actioninstanceid',
    },
};

// Token cache
let cachedToken: string | null = null;
let tokenExpiry: number = 0;

/**
 * Get access token from Power Automate flow
 */
export async function getAccessToken(): Promise<string> {
    // Return cached token if still valid
    if (cachedToken && Date.now() < tokenExpiry) {
        return cachedToken;
    }

    try {
        const response = await fetch(CONFIG.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({}),
        });

        if (!response.ok) {
            throw new Error(`Failed to get token: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        cachedToken = data.access_token || data.token;
        // Cache for 50 minutes (tokens usually last 60 minutes)
        tokenExpiry = Date.now() + 50 * 60 * 1000;

        return cachedToken!;
    } catch (error) {
        console.error('Error getting access token:', error);
        throw error;
    }
}

/**
 * Make authenticated request to Dataverse API
 */
export async function dataverseRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {
    const token = await getAccessToken();

    const response = await fetch(`${CONFIG.dataverseUrl}${endpoint}`, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'OData-MaxVersion': '4.0',
            'OData-Version': '4.0',
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Prefer': 'odata.include-annotations="*"',
            ...options.headers,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Dataverse API error:', errorText);
        throw new Error(`Dataverse API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

/**
 * Fetch all records from a Dataverse table
 */
export async function fetchTableData<T>(
    tableName: string,
    columns: string[],
    filter?: string
): Promise<T[]> {
    const selectQuery = `$select=${columns.join(',')}`;
    const filterQuery = filter ? `&$filter=${encodeURIComponent(filter)}` : '';

    const response = await dataverseRequest<{ value: T[] }>(
        `${tableName}?${selectQuery}${filterQuery}`
    );

    return response.value;
}

/**
 * Create a record in Dataverse
 */
export async function createRecord<T>(
    tableName: string,
    data: Partial<T>
): Promise<T> {
    const response = await dataverseRequest<T>(tableName, {
        method: 'POST',
        body: JSON.stringify(data),
    });

    return response;
}

/**
 * Update a record in Dataverse
 */
export async function updateRecord<T>(
    tableName: string,
    id: string,
    data: Partial<T>
): Promise<void> {
    await dataverseRequest(`${tableName}(${id})`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

/**
 * Delete a record from Dataverse
 */
export async function deleteRecord(
    tableName: string,
    id: string
): Promise<void> {
    await dataverseRequest(`${tableName}(${id})`, {
        method: 'DELETE',
    });
}

// Export config for external use
export { CONFIG as DATAVERSE_CONFIG };
