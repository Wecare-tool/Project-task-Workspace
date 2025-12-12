import type { Project, TableColumn } from '@/types';
import { DataTable, StatusBadge } from '@components/shared';
import { formatDate } from '@utils/index';

interface ProjectListProps {
    projects: Project[];
    onView?: (project: Project) => void;
    onEdit?: (project: Project) => void;
    onDelete?: (project: Project) => void;
    isLoading?: boolean;
}

const columns: TableColumn<Project>[] = [
    {
        key: 'code',
        label: 'Code',
        sortable: true,
        width: '100px',
        render: (value) => (
            <span className="font-mono text-sm bg-dark-100 px-2 py-0.5 rounded">
                {value as string}
            </span>
        ),
    },
    {
        key: 'name',
        label: 'Project Name',
        sortable: true,
        render: (value, row) => (
            <div>
                <div className="font-medium text-dark-900">{value as string}</div>
                {row.description && (
                    <div className="text-sm text-dark-500 line-clamp-1">{row.description}</div>
                )}
            </div>
        ),
    },
    {
        key: 'status',
        label: 'Status',
        sortable: true,
        width: '150px',
        render: (value) => <StatusBadge status={value as string} />,
    },
    {
        key: 'startDate',
        label: 'Start Date',
        sortable: true,
        width: '120px',
        render: (value) => formatDate(value as Date),
    },
    {
        key: 'endDate',
        label: 'End Date',
        sortable: true,
        width: '120px',
        render: (value) => value ? formatDate(value as Date) : '-',
    },
];

export function ProjectList({
    projects,
    onView,
    onEdit,
    onDelete,
    isLoading = false,
}: ProjectListProps) {
    return (
        <DataTable<Project>
            data={projects}
            columns={columns}
            keyField="id"
            onView={onView}
            onEdit={onEdit}
            onDelete={onDelete}
            searchable
            searchPlaceholder="Search projects..."
            pagination
            pageSize={10}
            isLoading={isLoading}
            emptyMessage="No projects found. Create your first project!"
        />
    );
}
