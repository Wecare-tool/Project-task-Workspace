import type { Project } from '@/types';
import { Modal } from '@components/shared';
import { FormBuilder } from '@components/shared';
import { projectSchema, projectFormFields, type ProjectFormData } from '../schema';

interface ProjectFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ProjectFormData) => void;
    project?: Project | null;
    isLoading?: boolean;
}

export function ProjectForm({
    isOpen,
    onClose,
    onSubmit,
    project,
    isLoading = false
}: ProjectFormProps) {
    const isEditing = !!project;

    const defaultValues: Partial<ProjectFormData> = project
        ? {
            name: project.name,
            code: project.code,
            description: project.description || '',
            status: project.status,
            startDate: new Date(project.startDate),
            endDate: project.endDate ? new Date(project.endDate) : undefined,
        }
        : {
            status: 'active',
            startDate: new Date(),
        };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={isEditing ? 'Chỉnh sửa dự án' : 'Tạo dự án mới'}
            size="lg"
        >
            <FormBuilder<ProjectFormData>
                fields={projectFormFields}
                schema={projectSchema}
                defaultValues={defaultValues}
                onSubmit={onSubmit}
                onCancel={onClose}
                isLoading={isLoading}
                submitText={isEditing ? 'Cập nhật' : 'Tạo mới'}
            />
        </Modal>
    );
}
