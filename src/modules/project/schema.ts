import { z } from 'zod';
import type { FormField, SelectOption } from '@/types';

// Validation schema
export const projectSchema = z.object({
    name: z.string().min(1, 'Tên dự án là bắt buộc').max(100, 'Tên dự án tối đa 100 ký tự'),
    code: z.string().min(1, 'Mã dự án là bắt buộc').max(20, 'Mã dự án tối đa 20 ký tự'),
    description: z.string().max(500, 'Mô tả tối đa 500 ký tự').optional(),
    status: z.enum(['active', 'archived', 'on-hold']),
    startDate: z.date({ required_error: 'Ngày bắt đầu là bắt buộc' }),
    endDate: z.date().optional().nullable(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Status options
export const projectStatusOptions: SelectOption[] = [
    { value: 'active', label: 'Đang hoạt động' },
    { value: 'on-hold', label: 'Tạm dừng' },
    { value: 'archived', label: 'Đã lưu trữ' },
];

// Form fields
export const projectFormFields: FormField[] = [
    {
        name: 'name',
        label: 'Tên dự án',
        type: 'text',
        placeholder: 'Nhập tên dự án',
        required: true,
    },
    {
        name: 'code',
        label: 'Mã dự án',
        type: 'text',
        placeholder: 'VD: PRJ-001',
        required: true,
        helperText: 'Mã ngắn gọn để nhận diện dự án',
    },
    {
        name: 'description',
        label: 'Mô tả',
        type: 'textarea',
        placeholder: 'Mô tả chi tiết về dự án',
    },
    {
        name: 'status',
        label: 'Trạng thái',
        type: 'select',
        options: projectStatusOptions,
        required: true,
    },
    {
        name: 'startDate',
        label: 'Ngày bắt đầu',
        type: 'date',
        required: true,
    },
    {
        name: 'endDate',
        label: 'Ngày kết thúc',
        type: 'date',
    },
];
