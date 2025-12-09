import { z } from 'zod';
import type { FormField } from '@/types';

// Validation schema
export const taskTypeSchema = z.object({
    name: z.string().min(1, 'Tên là bắt buộc').max(100),
    code: z.string().min(1, 'Mã là bắt buộc').max(20),
    description: z.string().max(500).optional(),
    color: z.string().optional(),
    icon: z.string().optional(),
});

export type TaskTypeFormData = z.infer<typeof taskTypeSchema>;

// Form fields
export const taskTypeFormFields: FormField[] = [
    { name: 'name', label: 'Tên loại', type: 'text', placeholder: 'VD: Bug Fix', required: true },
    { name: 'code', label: 'Mã', type: 'text', placeholder: 'VD: BUG', required: true },
    { name: 'description', label: 'Mô tả', type: 'textarea', placeholder: 'Mô tả chi tiết' },
    { name: 'color', label: 'Màu sắc', type: 'color' },
];
