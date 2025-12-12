import { useState } from 'react';
import { z } from 'zod';
import type { EventInstance, TableColumn, FormField } from '@/types';
import { Modal, ConfirmModal, DataTable, FormBuilder, CommandBar, type CommandBarItem } from '@components/shared';
import { formatDateTime } from '@utils/index';
import { exportToCsv } from '@/utils/exportUtils';
import { Plus } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { useDataverse } from '@stores/dataverseStore';

// Schema
const schema = z.object({
    name: z.string().min(1, 'Name is required'),
});
type FormData = z.infer<typeof schema>;

const formFields: FormField[] = [
    { name: 'name', label: 'Event Name', type: 'text', required: true, placeholder: 'Event name' },
];

export function EventInstancePage() {
    const { eventInstances, isLoading, refreshEventInstances } = useDataverse();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRows, setSelectedRows] = useState<EventInstance[]>([]);
    const [showFilters, setShowFilters] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<EventInstance | null>(null);
    const [deleteItem, setDeleteItem] = useState<EventInstance | null>(null);
    const toast = useToast();

    const columns: TableColumn<EventInstance>[] = [
        { key: 'name', label: 'Event Name', sortable: true },
        { key: 'createdAt', label: 'Created At', sortable: true, render: (v) => formatDateTime(v as Date) },
    ];

    const filteredData = eventInstances.filter(item =>
        (item.source || '').toLowerCase().includes(searchQuery.toLowerCase())
        // Note: EventInstance in store might have source mapped to name? 
        // In types I added name property. Store mapping now maps name.
    );

    const handleSubmit = async (data: FormData) => {
        console.log('Submitting:', data);
        toast.success('Feature coming soon');
        setIsFormOpen(false);
    };

    const remove = async (id: string) => {
        console.log(id);
        toast.success('Delete not implemented');
        setDeleteItem(null);
    };

    const commandBarItems: CommandBarItem[] = [
        {
            key: 'new',
            label: 'New',
            icon: <Plus className="w-3.5 h-3.5" />,
            onClick: () => { setSelected(null); setIsFormOpen(true); },
            variant: 'ghost',
            disabled: true
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
                await refreshEventInstances();
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
                exportToCsv(dataToExport, 'event-instances');
            },
            variant: 'ghost'
        }
    ];

    const filterContent = (
        <div className="p-2"><p>No filters available</p></div>
    );

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
                <DataTable<EventInstance>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    selectable
                    onSelectionChange={setSelectedRows}
                    emptyMessage={searchQuery ? "No matching events found" : "No events found"}
                    onRowClick={(row) => {
                        setSelected(row);
                        setIsFormOpen(true);
                    }}
                />
            </div>

            {/* Modals */}
            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }} title={selected ? 'Edit Event' : 'New Event'} size="md">
                <FormBuilder<FormData> fields={formFields} schema={schema}
                    defaultValues={selected ? { name: selected.name } : {}}
                    onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} isLoading={isLoading} />
            </Modal>
            <ConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)}
                onConfirm={async () => {
                    if (deleteItem) {
                        await remove(deleteItem.id);
                        setDeleteItem(null);
                    }
                }}
                title="Delete Event" message="Are you sure?" isLoading={isLoading} />
        </div>
    );
}
