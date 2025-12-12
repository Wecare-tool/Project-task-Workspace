import { useState } from 'react';
import { z } from 'zod';
import type { TableColumn, FormField } from '@/types';
import { useDataverse } from '@stores/dataverseStore';
import type { ActionTypeNew } from '@services/dataverseTypes';
import { Button } from '@components/ui';
import { Modal, ConfirmModal, DataTable, FormBuilder, CommandBar, type CommandBarItem } from '@components/shared';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { exportToCsv } from '@/utils/exportUtils';

// Schema
const actionTypeSchema = z.object({
    name: z.string().min(1, 'Tên là bắt buộc').max(100),
    description: z.string().max(500).optional(),
});

type FormData = z.infer<typeof actionTypeSchema>;

const formFields: FormField[] = [
    { name: 'name', label: 'Action Type Name', type: 'text', placeholder: 'e.g., Send Email', required: true },
    { name: 'description', label: 'Description', type: 'textarea', placeholder: 'Detailed description' },
];

// Page
const columns: TableColumn<ActionTypeNew>[] = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'description', label: 'Description', render: (v) => <span className="text-dark-500 line-clamp-1">{(v as string) || '-'}</span> },
];

export function ActionTypePage() {
    const {
        actionTypeNews,
        isLoading,
        createActionTypeNew,
        updateActionTypeNew,
        deactivateActionTypeNew,
        refreshActionTypeNews
    } = useDataverse();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<ActionTypeNew | null>(null);
    const [deleteItem, setDeleteItem] = useState<ActionTypeNew | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedRows, setSelectedRows] = useState<ActionTypeNew[]>([]);
    const toast = useToast();

    const handleSubmit = async (data: FormData) => {
        try {
            const payload = {
                crdfd_name: data.name,
                crdfd_description: data.description
            };

            if (selected) {
                await updateActionTypeNew(selected.id, payload);
            } else {
                await createActionTypeNew(payload);
            }
            setIsFormOpen(false);
            setSelected(null);
        } catch (error) {
            console.error('Error saving action type:', error);
        }
    };

    // Filter based on search query
    const filteredData = actionTypeNews.filter((item: any) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
            key: 'deactivate',
            label: 'Deactivate',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
            onClick: () => setDeleteItem(selectedRows[0]),
            disabled: selectedRows.length === 0,
            variant: 'ghost'
        },
        {
            key: 'refresh',
            label: 'Refresh',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
            onClick: async () => {
                await refreshActionTypeNews();
                toast.success('Data refreshed');
            },
            variant: 'ghost'
        },
        {
            key: 'export',
            label: 'Export to Excel',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
            onClick: () => {
                const dataToExport = selectedRows.length > 0 ? selectedRows : filteredData;
                exportToCsv(dataToExport, 'action-types');
            },
            variant: 'ghost'
        }
    ];

    return (
        <div className="space-y-2 animate-fade-in">
            <CommandBar
                onSearch={setSearchQuery}
                searchValue={searchQuery}
                onFilterClick={() => setShowFilters(!showFilters)}
                isFilterActive={showFilters}
                filterContent={
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                        <div>
                            <label className="block text-xs font-medium text-dark-700 mb-1">
                                Sort by
                            </label>
                            <select className="input w-full text-sm h-8" title="Sort by">
                                <option value="name">Name (A-Z)</option>
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
                }
                items={commandBarItems}
                selectedCount={selectedRows.length}
            />

            {/* Data Table */}
            <div className="card p-3">
                <DataTable<ActionTypeNew>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "No matching results found" : "No action types found"}

                    onRowClick={(row) => {
                        setSelected(row);
                        setIsFormOpen(true);
                    }}
                />
            </div>

            {/* Modals */}
            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }} title={selected ? 'Edit Action type' : 'Add Action type'} size="md">
                <FormBuilder<FormData> fields={formFields} schema={actionTypeSchema}
                    defaultValues={selected ? { name: selected.name, description: selected.description } : {}}
                    onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} isLoading={isLoading} />
            </Modal>
            <ConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)}
                onConfirm={async () => {
                    if (deleteItem) {
                        try {
                            await deactivateActionTypeNew(deleteItem.id);
                            setDeleteItem(null);
                        } catch (e) {
                            console.error(e);
                        }
                    }
                }}
                title="Deactivate Action Type"
                message={`Deactivate "${deleteItem?.name}"?`}
                isLoading={isLoading} />
        </div>
    );
}
