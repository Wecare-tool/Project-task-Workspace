import { z } from 'zod';
import type { FormField } from '@/types';

export const taskInstanceSchema = z.object({
    title: z.string().min(1, 'Tiêu đề là bắt buộc').max(200),
    description: z.string().max(1000).optional(),
    taskTypeId: z.string().min(1, 'Loại công việc là bắt buộc'),
    projectId: z.string().min(1, 'Dự án là bắt buộc'),
    status: z.enum(['not-started', 'in-progress', 'blocked', 'completed']),
    priority: z.enum(['low', 'medium', 'high', 'critical']),
    dueDate: z.date().optional().nullable(),
    startDate: z.date().optional().nullable(),
    assignee: z.string().optional(),
});

export type TaskInstanceFormData = z.infer<typeof taskInstanceSchema>;

export const taskStatusOptions = [
    { value: 'not-started', label: 'Not Started' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'blocked', label: 'Blocked' },
    { value: 'completed', label: 'Completed' },
];

export const taskPriorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
];

export const getTaskFormFields = (projectOptions: { value: string; label: string }[], taskTypeOptions: { value: string; label: string }[]): FormField[] => [
    { name: 'title', label: 'Title', type: 'text', placeholder: 'Enter task title', required: true },
    { name: 'projectId', label: 'Project', type: 'select', options: projectOptions, required: true, placeholder: 'Select project' },
    { name: 'taskTypeId', label: 'Task Type', type: 'select', options: taskTypeOptions, required: true, placeholder: 'Select type' },
    { name: 'status', label: 'Status', type: 'select', options: taskStatusOptions, required: true },
    { name: 'priority', label: 'Priority', type: 'select', options: taskPriorityOptions, required: true },
];
