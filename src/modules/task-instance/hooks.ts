import { useState, useCallback, useMemo } from 'react';
import type { TaskInstance } from '@/types';
import { taskInstanceStorage, projectStorage, taskTypeStorage } from '@services/index';
import { toast } from '@stores/index';

export function useTaskInstances() {
    const [tasks, setTasks] = useState<TaskInstance[]>(() => taskInstanceStorage.getAll());
    const [isLoading, setIsLoading] = useState(false);

    const projects = useMemo(() => projectStorage.getAll(), []);
    const taskTypes = useMemo(() => taskTypeStorage.getAll(), []);

    const projectOptions = useMemo(() => projects.map(p => ({ value: p.id, label: p.name })), [projects]);
    const taskTypeOptions = useMemo(() => taskTypes.map(t => ({ value: t.id, label: t.name })), [taskTypes]);

    const refresh = useCallback(() => setTasks(taskInstanceStorage.getAll()), []);
    const getById = useCallback((id: string) => taskInstanceStorage.getById(id), []);
    const getProjectName = useCallback((id: string) => projects.find(p => p.id === id)?.name || '-', [projects]);
    const getTaskTypeName = useCallback((id: string) => taskTypes.find(t => t.id === id)?.name || '-', [taskTypes]);

    const create = useCallback(async (data: Omit<TaskInstance, 'id' | 'createdAt' | 'updatedAt'>) => {
        setIsLoading(true);
        try {
            const item = taskInstanceStorage.create(data);
            refresh();
            toast.success('Thành công', 'Đã tạo công việc mới');
            return item;
        } finally { setIsLoading(false); }
    }, [refresh]);

    const update = useCallback(async (id: string, data: Partial<TaskInstance>) => {
        setIsLoading(true);
        try {
            const updated = taskInstanceStorage.update(id, data);
            refresh();
            toast.success('Thành công', 'Đã cập nhật công việc');
            return updated;
        } finally { setIsLoading(false); }
    }, [refresh]);

    const remove = useCallback(async (id: string) => {
        setIsLoading(true);
        try {
            taskInstanceStorage.delete(id);
            refresh();
            toast.success('Thành công', 'Đã xóa công việc');
        } finally { setIsLoading(false); }
    }, [refresh]);

    return { tasks, isLoading, refresh, getById, create, update, remove, projectOptions, taskTypeOptions, getProjectName, getTaskTypeName };
}
