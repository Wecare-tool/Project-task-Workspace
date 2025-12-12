import { z } from 'zod';
import type { FormField, SelectOption } from '@/types';

// Validation schema
export const projectSchema = z.object({
    name: z.string().min(1, 'Project name is required').max(100, 'Project name max 100 characters'),
    code: z.string().min(1, 'Project code is required').max(20, 'Project code max 20 characters'),
    description: z.string().max(500, 'Description max 500 characters').optional(),
    status: z.enum(['active', 'archived', 'on-hold']),
    startDate: z.date({ required_error: 'Start date is required' }),
    endDate: z.date().optional().nullable(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Status options
export const projectStatusOptions: SelectOption[] = [
    { value: 'active', label: 'Active' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'archived', label: 'Archived' },
];

// Form fields
export const projectFormFields: FormField[] = [
    {
        name: 'name',
        label: 'Project Name',
        type: 'text',
        placeholder: 'Enter project name',
        required: true,
    },
    {
        name: 'code',
        label: 'Project Code',
        type: 'text',
        placeholder: 'Ex: PRJ-001',
        required: true,
        helperText: 'Short code to identify the project',
    },
    {
        name: 'description',
        label: 'Description',
        type: 'textarea',
        placeholder: 'Detailed project description',
    },
    {
        name: 'status',
        label: 'Status',
        type: 'select',
        options: projectStatusOptions,
        required: true,
    },
    {
        name: 'startDate',
        label: 'Start Date',
        type: 'date',
        required: true,
    },
    {
        name: 'endDate',
        label: 'End Date',
        type: 'date',
    },
];
