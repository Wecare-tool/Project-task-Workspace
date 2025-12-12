import { useState } from 'react';

import type { TaskTypeAttribute, TableColumn, FormField } from '@/types';
import { useToast } from '@/hooks/useToast';
import { useDataverse } from '@stores/dataverseStore';
import { Button } from '@components/ui';
import { Modal, DataTable, FormBuilder, CommandBar, type CommandBarItem } from '@components/shared';
import { Plus } from 'lucide-react';
import { exportToCsv } from '@/utils/exportUtils';
import { z } from 'zod';

// Schema for TaskTypeAttribute
const attributeSchema = z.object({
    label: z.string().min(1, 'Name is required'),
    name: z.string().min(1, 'Attribute key is required'),
    group: z.string().optional(),
    options: z.string().optional(), // Entered as comma-separated string
});

type AttributeFormData = z.infer<typeof attributeSchema>;

const formFields: FormField[] = [
    { name: 'label', label: 'Display Name', type: 'text', required: true, placeholder: 'e.g. Budget Amount' },
    { name: 'name', label: 'Attribute Key', type: 'text', required: true, placeholder: 'e.g. budget_amount' },
    { name: 'group', label: 'Group', type: 'text', placeholder: 'e.g. Financials' },
    { name: 'options', label: 'Options (for select)', type: 'textarea', placeholder: 'Comma separated values: Option A, Option B' },
];

export function TaskTypeAttributePage() {
    const { taskTypeAttributes, isLoading, refreshTaskTypeAttributes, createTaskTypeAttribute, updateTaskTypeAttribute } = useDataverse();
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<TaskTypeAttribute | null>(null);

    const columns: TableColumn<TaskTypeAttribute>[] = [
        { key: 'label', label: 'Name', sortable: true },
        { key: 'name', label: 'Attribute', sortable: true, render: (v) => <span className="font-mono text-xs bg-neutral-100 px-2 py-0.5 rounded text-neutral-700">{v as string}</span> },
        { key: 'group', label: 'Group', render: (v) => (v as string) || '-' },
        { key: 'options', label: 'Options', render: (v) => (v as string[])?.join(', ') || '-' },
    ];

    // Filter based on search query
    const filteredData = taskTypeAttributes.filter((item: any) =>
        item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.group?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (data: AttributeFormData) => {
        try {
            const payload = {
                crdfd_name: data.label,
                crdfd_attribute: data.name,
                crdfd_group: data.group,
                crdfd_attributeoptions: data.options
            };

            if (selected) {
                await updateTaskTypeAttribute(selected.id, payload);
            } else {
                await createTaskTypeAttribute(payload);
            }
            setIsFormOpen(false);
            setSelected(null);
        } catch (error) {
            console.error(error);
            // Toast handled in store
        }
    };

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
            onClick: () => { if (selected) { setIsFormOpen(true); } else { toast.error('Select an item first'); } },
            disabled: !selected,
            variant: 'ghost',
        },
        {
            key: 'delete',
            label: 'Deactivate',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
            onClick: () => { },
            disabled: true,
            variant: 'ghost'
        },
        {
            key: 'refresh',
            label: 'Refresh',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
            onClick: async () => {
                await refreshTaskTypeAttributes();
                toast.success('Data refreshed');
            },
            variant: 'ghost'
        },
        {
            key: 'export',
            label: 'Export to Excel',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
            onClick: () => {
                const dataToExport = filteredData;
                exportToCsv(dataToExport, 'task-attributes');
            },
            variant: 'ghost'
        }
    ];

    const filterContent = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Group
                </label>
                <select className="input w-full text-sm h-8" title="Filter by group">
                    <option value="">All</option>
                </select>
            </div>
            <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Sort by
                </label>
                <select className="input w-full text-sm h-8" title="Sort by">
                    <option value="label">Name (A-Z)</option>
                    <option value="name">Attribute (A-Z)</option>
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

    const handleRowClick = (row: TaskTypeAttribute) => {
        setSelected(row);
        setIsFormOpen(true);
    };

    const [currentPage, setCurrentPage] = useState(1);
    const PAGE_SIZE = 10;

    // Touch Swipe logic (keep existing)
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            // Swipe Left (finger moves left) -> Prev Page (Standard: Next Page)
            // But user requested: "vuốt ngang sang trái main content tu chuyen trang trước" (Swipe Left -> Prev Page)
            // Wait, let's re-read the request carefully.
            // Request: "khi vuốt ngang sang phải main content tu chuyen trang sau" (Swipe Right -> Next Page)
            // Request: "khi vuốt ngang sang trái main content tu chuyen trang trước" (Swipe Left -> Prev Page)

            // Distance = Start - End
            // Left Swipe: Start > End => Distance > 0.
            // Right Swipe: Start < End => Distance < 0.

            // Case: Left Swipe (Distance > 0) -> Prev Page
            if (currentPage > 1) {
                setCurrentPage(prev => prev - 1);
            }
        }

        if (isRightSwipe) {
            // Case: Right Swipe (Distance < 0) -> Next Page
            const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);
            if (currentPage < totalPages) {
                setCurrentPage(prev => prev + 1);
            }
        }
    };

    return (
        <div
            className="space-y-2 animate-fade-in"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
        >
            <CommandBar
                onSearch={setSearchQuery}
                searchValue={searchQuery}
                onFilterClick={() => setShowFilters(!showFilters)}
                isFilterActive={showFilters}
                filterContent={filterContent}
                items={commandBarItems}
            />

            {/* Data Table */}
            <div className="card p-3">
                <DataTable<TaskTypeAttribute>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    emptyMessage={searchQuery ? "No matching attributes found" : "No attributes found"}
                    onRowClick={handleRowClick}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    pageSize={PAGE_SIZE}
                />
            </div>

            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }} title={selected ? 'Edit Attribute' : 'New Attribute'}>
                <FormBuilder<AttributeFormData>
                    fields={formFields}
                    schema={attributeSchema}
                    defaultValues={selected ? {
                        label: selected.label,
                        name: selected.name,
                        group: selected.group,
                        options: selected.options?.join(', ')
                    } : {}}
                    onSubmit={handleSubmit}
                    onCancel={() => setIsFormOpen(false)}
                    isLoading={isLoading}
                />
            </Modal>
        </div>
    );
}
