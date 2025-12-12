import { useState } from 'react';
import type { ProjectNew } from '@services/dataverseTypes';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui';
import { Modal, ConfirmModal, DataTable, FormBuilder, CommandBar, type CommandBarItem } from '@components/shared';
import { Plus } from 'lucide-react';
import { useProjects } from './hooks';
import { ProjectTaskSettings } from './components/ProjectTaskSettings';
import type { TableColumn } from '@/types';
import { formatDate } from '@utils/index';
import { exportToCsv } from '@/utils/exportUtils';
import { useToast } from '@/hooks/useToast';
import { projectSchema, projectFormFields, type ProjectFormData } from './schema';

export function ProjectPage() {
    const { projects, isLoading, refresh, create, update, remove } = useProjects();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<ProjectNew[]>([]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<ProjectNew | null>(null);
    const [deleteItem, setDeleteItem] = useState<ProjectNew | null>(null);
    const toast = useToast();

    // Initial values for the form
    const initialValues: Partial<ProjectFormData> = selected ? {
        ...selected,
        status: (selected.status as any) || 'active',
        startDate: selected.startDate ? new Date(selected.startDate) : undefined,
        endDate: selected.endDate ? new Date(selected.endDate) : undefined,
    } : {
        status: 'active',
        startDate: new Date(),
    };

    const handleSubmit = async (data: ProjectFormData) => {
        try {
            // Transform form data to match API requirements
            const payload = {
                ...data,
                crdfd_startdate: data.startDate,
                crdfd_enddate: data.endDate,
            };

            if (selected) {
                await update(selected.id, payload as any);
                toast.success('Project updated successfully');
            } else {
                await create(payload as any);
                toast.success('Project created successfully');
            }
            setIsFormOpen(false);
            setSelected(null);
            refresh();
        } catch (error) {
            console.error('[ProjectPage] Error:', error);
            toast.error('An error occurred');
        }
    };

    const handleDelete = async () => {
        if (!deleteItem) return;
        try {
            await remove(deleteItem.id);
            toast.success('Project deleted successfully');
            setDeleteItem(null);
            setSelectedRows([]);
            refresh();
        } catch (error) {
            console.error('[ProjectPage] Delete Error:', error);
            toast.error('An error occurred during deletion');
        }
    };

    const columns: TableColumn<ProjectNew>[] = [
        { key: 'name', label: 'Project Name', sortable: true },
        { key: 'projectType', label: 'Type', sortable: true, render: (v) => (v as string) || '-' },
        { key: 'status', label: 'Status', sortable: true, render: (v) => (v as string) || '-' },
        { key: 'priority', label: 'Priority', sortable: true, render: (v) => (v as string) || '-' },
        { key: 'department', label: 'Department', render: (v) => (v as string) || '-' },
        { key: 'startDate', label: 'Start Date', render: (v) => v ? formatDate(v as Date) : '-' },
        { key: 'endDate', label: 'End Date', render: (v) => v ? formatDate(v as Date) : '-' },
    ];

    const filteredProjects = projects.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.department?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const filterContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Status
                </label>
                <select className="input w-full text-sm h-8" title="Filter by status">
                    <option value="">All</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Sort by
                </label>
                <select className="input w-full text-sm h-8" title="Sort by">
                    <option value="name">Project Name</option>
                    <option value="startDate">Start Date</option>
                    <option value="priority">Priority</option>
                </select>
            </div>
            <div className="flex items-end">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilters(false)}
                    className="w-full"
                >
                    Close filters
                </Button>
            </div>
        </div>
    );

    const commandBarItems: CommandBarItem[] = [
        {
            key: 'new',
            label: 'New',
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: () => { setSelected(null); setIsFormOpen(true); },
            variant: 'ghost'
        },
        {
            key: 'edit',
            label: 'Edit',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
            onClick: () => { setSelected(selectedRows[0]); setIsFormOpen(true); },
            disabled: selectedRows.length !== 1,
            variant: 'ghost'
        },
        {
            key: 'delete',
            label: 'Delete',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
            onClick: () => setDeleteItem(selectedRows[0]),
            disabled: selectedRows.length === 0,
            variant: 'ghost'
        },
        {
            key: 'refresh',
            label: 'Refresh',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
            onClick: () => {
                refresh();
                toast.success('Data refreshed');
            },
            variant: 'ghost'
        },
        {
            key: 'export',
            label: 'Export to Excel',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
            onClick: () => {
                const dataToExport = selectedRows.length > 0 ? selectedRows : filteredProjects;
                exportToCsv(dataToExport, 'projects');
            },
            variant: 'ghost'
        }
    ];

    const handleRowClick = (row: ProjectNew) => {
        setSelected(row);
        setIsFormOpen(true);
    };

    return (
        <div className="space-y-2 animate-fade-in">
            <CommandBar
                onSearch={setSearchQuery}
                searchValue={searchQuery}
                onFilterClick={() => setShowFilters(!showFilters)}
                isFilterActive={showFilters}
                filterContent={filterContent}
                items={commandBarItems}
                selectedCount={selectedRows.length}
            />

            {/* Data Table */}
            <div className="card p-3">
                <DataTable<ProjectNew>
                    data={filteredProjects}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "No matching projects found" : "No projects found"}
                    onRowClick={handleRowClick}
                />
            </div>

            {/* Modals */}
            {/* Modals */}
            <Modal
                isOpen={isFormOpen}
                onClose={() => { setIsFormOpen(false); setSelected(null); }}
                title={selected ? 'Edit Project' : 'New Project'}
                size={selected ? 'full' : 'lg'}
                className={selected ? "!w-[95%] !h-[95%] max-w-none" : "!max-w-[85vw]"}
            >
                <Tabs defaultValue="general" className="w-full h-full flex flex-col">
                    <div className="border-b px-1">
                        <TabsList>
                            <TabsTrigger value="general">General Information</TabsTrigger>
                            {selected && <TabsTrigger value="tasks">Task Configuration</TabsTrigger>}
                        </TabsList>
                    </div>

                    <TabsContent value="general" className="flex-1 overflow-y-auto p-1 pt-4">
                        <FormBuilder<ProjectFormData>
                            fields={projectFormFields}
                            schema={projectSchema}
                            defaultValues={initialValues}
                            onSubmit={handleSubmit}
                            onCancel={() => setIsFormOpen(false)}
                            isLoading={isLoading}
                        />
                    </TabsContent>

                    {selected && (
                        <TabsContent value="tasks" className="flex-1 overflow-hidden p-1 pt-4 h-full">
                            <ProjectTaskSettings projectId={selected.id} />
                        </TabsContent>
                    )}
                </Tabs>
            </Modal>

            <ConfirmModal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                onConfirm={handleDelete}
                title="Delete Project"
                message={`Are you sure you want to delete "${deleteItem?.name}"?`}
                isLoading={isLoading}
            />
        </div>
    );
}
