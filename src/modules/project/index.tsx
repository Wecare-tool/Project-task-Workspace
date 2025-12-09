import { useState } from 'react';
import type { Project } from '@/types';
import { Button } from '@components/ui';
import { ConfirmModal } from '@components/shared';
import { Plus, FolderKanban } from 'lucide-react';
import { useProjects } from './hooks';
import { ProjectForm, ProjectList } from './components';
import type { ProjectFormData } from './schema';

export function ProjectPage() {
    const { projects, isLoading, create, update, remove } = useProjects();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [deleteProject, setDeleteProject] = useState<Project | null>(null);

    const handleCreate = () => {
        setSelectedProject(null);
        setIsFormOpen(true);
    };

    const handleEdit = (project: Project) => {
        setSelectedProject(project);
        setIsFormOpen(true);
    };

    const handleDelete = (project: Project) => {
        setDeleteProject(project);
    };

    const handleFormSubmit = async (data: ProjectFormData) => {
        const payload = { ...data, endDate: data.endDate ?? undefined };
        if (selectedProject) {
            await update(selectedProject.id, payload);
        } else {
            await create(payload);
        }
        setIsFormOpen(false);
        setSelectedProject(null);
    };

    const handleConfirmDelete = async () => {
        if (deleteProject) {
            await remove(deleteProject.id);
            setDeleteProject(null);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary-100">
                        <FolderKanban className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-dark-900">Dự án</h1>
                        <p className="text-dark-500">Quản lý tất cả dự án của bạn</p>
                    </div>
                </div>
                <Button onClick={handleCreate} leftIcon={<Plus className="w-4 h-4" />}>
                    Tạo dự án
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card">
                    <div className="text-sm text-dark-500">Tổng số dự án</div>
                    <div className="text-2xl font-bold text-dark-900">{projects.length}</div>
                </div>
                <div className="card">
                    <div className="text-sm text-dark-500">Đang hoạt động</div>
                    <div className="text-2xl font-bold text-success-600">
                        {projects.filter(p => p.status === 'active').length}
                    </div>
                </div>
                <div className="card">
                    <div className="text-sm text-dark-500">Đã lưu trữ</div>
                    <div className="text-2xl font-bold text-dark-400">
                        {projects.filter(p => p.status === 'archived').length}
                    </div>
                </div>
            </div>

            {/* Project List */}
            <div className="card">
                <ProjectList
                    projects={projects}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                />
            </div>

            {/* Create/Edit Modal */}
            <ProjectForm
                isOpen={isFormOpen}
                onClose={() => {
                    setIsFormOpen(false);
                    setSelectedProject(null);
                }}
                onSubmit={handleFormSubmit}
                project={selectedProject}
                isLoading={isLoading}
            />

            {/* Delete Confirmation */}
            <ConfirmModal
                isOpen={!!deleteProject}
                onClose={() => setDeleteProject(null)}
                onConfirm={handleConfirmDelete}
                title="Xóa dự án"
                message={`Bạn có chắc chắn muốn xóa dự án "${deleteProject?.name}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                isLoading={isLoading}
            />
        </div>
    );
}
