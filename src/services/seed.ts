import {
    projectStorage,
    taskTypeStorage,
    taskInstanceStorage,
    actionTypeStorage,
    eventSourceTypeStorage,
    eventTypeStorage,
} from '@services/index';
import { generateId } from '@utils/index';

// Sample data for seeding
const sampleProjects = [
    { name: 'Website Redesign', code: 'WEB-2024', description: 'Redesign company website with modern UI', status: 'active' as const, startDate: new Date('2024-01-15') },
    { name: 'Mobile App Development', code: 'APP-2024', description: 'Develop iOS and Android app', status: 'active' as const, startDate: new Date('2024-02-01') },
    { name: 'API Integration', code: 'API-2024', description: 'Integrate third-party APIs', status: 'on-hold' as const, startDate: new Date('2024-03-10') },
];

const sampleTaskTypes = [
    { name: 'Bug Fix', code: 'BUG', description: 'Fix software bugs', color: '#ef4444' },
    { name: 'Feature', code: 'FEAT', description: 'New feature development', color: '#22c55e' },
    { name: 'Documentation', code: 'DOC', description: 'Documentation tasks', color: '#3b82f6' },
    { name: 'Testing', code: 'TEST', description: 'Testing and QA', color: '#f59e0b' },
    { name: 'Design', code: 'DES', description: 'UI/UX design tasks', color: '#8b5cf6' },
];

const sampleActionTypes = [
    { name: 'Send Email', code: 'EMAIL', description: 'Gửi email thông báo' },
    { name: 'Create Ticket', code: 'TICKET', description: 'Tạo ticket hỗ trợ' },
    { name: 'Deploy', code: 'DEPLOY', description: 'Deploy ứng dụng' },
    { name: 'Review', code: 'REVIEW', description: 'Code review' },
];

const sampleEventSourceTypes = [
    { name: 'API Gateway', code: 'API', description: 'Sự kiện từ API' },
    { name: 'Manual', code: 'MANUAL', description: 'Thao tác thủ công' },
    { name: 'Webhook', code: 'WEBHOOK', description: 'Webhook từ external service' },
    { name: 'Scheduler', code: 'SCHEDULER', description: 'Scheduled job' },
];

const sampleEventTypes = [
    { name: 'Task Created', code: 'TASK_CREATED', description: 'Khi công việc được tạo' },
    { name: 'Task Completed', code: 'TASK_COMPLETED', description: 'Khi công việc hoàn thành' },
    { name: 'Task Blocked', code: 'TASK_BLOCKED', description: 'Khi công việc bị chặn' },
    { name: 'Comment Added', code: 'COMMENT_ADDED', description: 'Khi có comment mới' },
];

export function seedData() {
    // Seed projects
    if (projectStorage.count() === 0) {
        sampleProjects.forEach(p => projectStorage.create(p));
        console.log('✅ Seeded projects');
    }

    // Seed task types
    if (taskTypeStorage.count() === 0) {
        sampleTaskTypes.forEach(t => taskTypeStorage.create(t));
        console.log('✅ Seeded task types');
    }

    // Seed action types
    if (actionTypeStorage.count() === 0) {
        sampleActionTypes.forEach(a => actionTypeStorage.create(a));
        console.log('✅ Seeded action types');
    }

    // Seed event source types
    if (eventSourceTypeStorage.count() === 0) {
        sampleEventSourceTypes.forEach(e => eventSourceTypeStorage.create(e));
        console.log('✅ Seeded event source types');
    }

    // Seed event types (need event source type ids)
    if (eventTypeStorage.count() === 0) {
        const sources = eventSourceTypeStorage.getAll();
        if (sources.length > 0) {
            sampleEventTypes.forEach((e, i) => eventTypeStorage.create({
                ...e,
                eventSourceTypeId: sources[i % sources.length].id
            }));
            console.log('✅ Seeded event types');
        }
    }

    // Seed some tasks
    if (taskInstanceStorage.count() === 0) {
        const projects = projectStorage.getAll();
        const taskTypes = taskTypeStorage.getAll();

        if (projects.length > 0 && taskTypes.length > 0) {
            const sampleTasks = [
                { title: 'Fix login bug', status: 'completed' as const, priority: 'high' as const },
                { title: 'Implement user dashboard', status: 'in-progress' as const, priority: 'critical' as const },
                { title: 'Write API documentation', status: 'not-started' as const, priority: 'medium' as const },
                { title: 'Design new landing page', status: 'in-progress' as const, priority: 'high' as const },
                { title: 'Setup CI/CD pipeline', status: 'blocked' as const, priority: 'high' as const },
                { title: 'Unit test coverage', status: 'not-started' as const, priority: 'low' as const },
                { title: 'Mobile responsive fix', status: 'completed' as const, priority: 'medium' as const },
                { title: 'Database optimization', status: 'in-progress' as const, priority: 'critical' as const },
            ];

            sampleTasks.forEach((t, i) => taskInstanceStorage.create({
                ...t,
                projectId: projects[i % projects.length].id,
                taskTypeId: taskTypes[i % taskTypes.length].id,
                dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000 * 7),
            }));
            console.log('✅ Seeded task instances');
        }
    }
}
