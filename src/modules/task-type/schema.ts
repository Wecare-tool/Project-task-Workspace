import { z } from 'zod';
import type { FormField } from '@/types';

// Validation schema - only include fields that exist in Dataverse table
export const taskTypeSchema = z.object({
    name: z.string().min(1, 'Name is required').max(100),
    brief: z.string().max(500).optional(),
    ownerType: z.string().optional(),
    taskDomain: z.string().optional(),
});

export type TaskTypeFormData = z.infer<typeof taskTypeSchema>;

// Form fields - align with Dataverse table structure
export const taskTypeFormFields: FormField[] = [
    { name: 'name', label: 'Name', type: 'text', placeholder: 'e.g., Bug Fix', required: true },
    { name: 'brief', label: 'Brief', type: 'textarea', placeholder: 'Short summary' },
    {
        name: 'ownerType',
        label: 'Owner Type',
        type: 'select',
        options: [
            { label: 'Tech', value: '0' },
            { label: 'User', value: '1' },
        ],
    },
    {
        name: 'taskDomain',
        label: 'Task Domain',
        type: 'select',
        options: [
            { label: 'Non task (Q&A, Feedback, Discussion)', value: '191920000' },
            { label: 'General', value: '191920001' },
            { label: 'Daily operation', value: '191920002' },
            { label: 'Process review', value: '191920003' },
            { label: 'Step review', value: '191920004' },
            { label: 'UX', value: '191920005' },
            { label: 'App level', value: '191920006' },
            { label: 'Data', value: '191920007' },
            { label: 'Flow/Automation', value: '191920008' },
        ],
    },
];
