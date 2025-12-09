import { useState, useCallback, useMemo } from 'react';
import type { TaskDependency } from '@/types';
import { taskDependencyStorage, taskInstanceStorage } from '@services/index';
import { useToast } from '@/hooks/useToast';

export function useTaskDependencies() {
    const toast = useToast();
    const [dependencies, setDependencies] = useState<TaskDependency[]>(() => taskDependencyStorage.getAll());
    const [isLoading, setIsLoading] = useState(false);

    const tasks = useMemo(() => taskInstanceStorage.getAll(), []);
    const taskOptions = useMemo(() => tasks.map(t => ({ value: t.id, label: t.title })), [tasks]);

    const refresh = useCallback(() => setDependencies(taskDependencyStorage.getAll()), []);

    const getTaskName = useCallback((id: string) => tasks.find(t => t.id === id)?.title || '-', [tasks]);

    const create = useCallback(async (data: Omit<TaskDependency, 'id' | 'createdAt' | 'updatedAt'>) => {
        setIsLoading(true);
        try {
            const item = taskDependencyStorage.create(data);
            refresh();
            toast.success('Tạo mới thành công');
            return item;
        } catch (error) {
            toast.error('Có lỗi xảy ra');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [refresh, toast]);

    const update = useCallback(async (id: string, data: Partial<TaskDependency>) => {
        setIsLoading(true);
        try {
            const updated = taskDependencyStorage.update(id, data);
            refresh();
            toast.success('Cập nhật thành công');
            return updated;
        } catch (error) {
            toast.error('Có lỗi xảy ra');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [refresh, toast]);

    const remove = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            taskDependencyStorage.delete(id);
            refresh();
            toast.success('Đã xóa thành công');
        } catch (error) {
            toast.error('Có lỗi xảy ra');
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [refresh, toast]);

    return {
        dependencies,
        isLoading,
        refresh,
        create,
        update,
        remove,
        taskOptions,
        getTaskName
    };
}
