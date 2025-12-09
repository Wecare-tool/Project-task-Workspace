import { useMemo } from 'react';
import { useTaskInstances } from '../task-instance/hooks';

export function useDailyTasks() {
    const taskInstanceHooks = useTaskInstances();
    const { tasks, ...rest } = taskInstanceHooks;

    // Filter for incomplete tasks with due dates today or earlier
    const dailyTasks = useMemo(() => {
        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today

        return tasks.filter((task: any) => {
            // Must not be completed
            if (task.status === 'completed') return false;

            // Must have a due date
            if (!task.dueDate) return false;

            // Due date must be today or earlier
            const dueDate = new Date(task.dueDate);
            return dueDate <= today;
        });
    }, [tasks]);

    return {
        tasks: dailyTasks,
        ...rest
    };
}
