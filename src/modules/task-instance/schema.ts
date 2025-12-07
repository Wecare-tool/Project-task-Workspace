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
    { value: 'not-started', label: 'Chưa bắt đầu' },
    { value: 'in-progress', label: 'Đang thực hiện' },
    { value: 'blocked', label: 'Bị chặn' },
    { value: 'completed', label: 'Hoàn thành' },
];

export const taskPriorityOptions = [
    { value: 'low', label: 'Thấp' },
    { value: 'medium', label: 'Trung bình' },
    { value: 'high', label: 'Cao' },
    { value: 'critical', label: 'Khẩn cấp' },
];

export const getTaskFormFields = (projectOptions: { value: string; label: string }[], taskTypeOptions: { value: string; label: string }[]): FormField[] => [
    { name: 'title', label: 'Tiêu đề', type: 'text', placeholder: 'Nhập tiêu đề công việc', required: true },
    { name: 'projectId', label: 'Dự án', type: 'select', options: projectOptions, required: true, placeholder: 'Chọn dự án' },
    { name: 'taskTypeId', label: 'Loại công việc', type: 'select', options: taskTypeOptions, required: true, placeholder: 'Chọn loại' },
    { name: 'status', label: 'Trạng thái', type: 'select', options: taskStatusOptions, required: true },
    { name: 'priority', label: 'Độ ưu tiên', type: 'select', options: taskPriorityOptions, required: true },
    { name: 'startDate', label: 'Ngày bắt đầu', type: 'date' },
    { name: 'dueDate', label: 'Ngày đến hạn', type: 'date' },
    { name: 'assignee', label: 'Người phụ trách', type: 'text', placeholder: 'Tên người phụ trách' },
    { name: 'description', label: 'Mô tả', type: 'textarea', placeholder: 'Mô tả chi tiết công việc' },
];
