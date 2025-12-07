import { useState, useCallback } from 'react';
import type { Project } from '@/types';
import { projectStorage } from '@services/index';
import { toast } from '@stores/index';

export function useProjects() {
    const [projects, setProjects] = useState<Project[]>(() => projectStorage.getAll());
    const [isLoading, setIsLoading] = useState(false);

    const refresh = useCallback(() => {
        setProjects(projectStorage.getAll());
    }, []);

    const getById = useCallback((id: string) => {
        return projectStorage.getById(id);
    }, []);

    const create = useCallback(async (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
        setIsLoading(true);
        try {
            const newProject = projectStorage.create(data);
            refresh();
            toast.success('Thành công', 'Đã tạo dự án mới');
            return newProject;
        } catch (error) {
            toast.error('Lỗi', 'Không thể tạo dự án');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [refresh]);

    const update = useCallback(async (id: string, data: Partial<Project>) => {
        setIsLoading(true);
        try {
            const updated = projectStorage.update(id, data);
            refresh();
            toast.success('Thành công', 'Đã cập nhật dự án');
            return updated;
        } catch (error) {
            toast.error('Lỗi', 'Không thể cập nhật dự án');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [refresh]);

    const remove = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            projectStorage.delete(id);
            refresh();
            toast.success('Thành công', 'Đã xóa dự án');
        } catch (error) {
            toast.error('Lỗi', 'Không thể xóa dự án');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [refresh]);

    return {
        projects,
        isLoading,
        refresh,
        getById,
        create,
        update,
        remove,
    };
}
