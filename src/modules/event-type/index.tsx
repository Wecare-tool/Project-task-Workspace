import { useState } from 'react';
import { z } from 'zod';
import type { EventType, TableColumn, FormField } from '@/types';
import { useDataverse } from '@stores/dataverseStore';
import { Button, Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui';
import { useToast } from '@/hooks/useToast';
import { Modal, DataTable, FormBuilder, CommandBar, ConfirmModal, type CommandBarItem } from '@components/shared';
import { Plus } from 'lucide-react';
import { exportToCsv } from '@/utils/exportUtils';


const eventTypeSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    eventSourceTypeId: z.string().min(1, 'Source Type is required'),
});

type FormData = z.infer<typeof eventTypeSchema>;

export function EventTypePage() {
    const {
        eventTypes,
        eventSourceTypes,
        isLoading,
        refreshEventTypes,
        createEventType,
        updateEventType,
        deactivateEventType,
    } = useDataverse();
    const toast = useToast();
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selected, setSelected] = useState<EventType | null>(null);
    const [deleteItem, setDeleteItem] = useState<EventType | null>(null);
    const [selectedRows, setSelectedRows] = useState<EventType[]>([]);







    const columns: TableColumn<EventType>[] = [
        { key: 'name', label: 'Name', sortable: true },
        {
            key: 'eventSourceTypeId',
            label: 'Source Type',
            sortable: true,
            render: (v) => eventSourceTypes.find(s => s.id === v)?.name || '-'
        },
        { key: 'description', label: 'Description', sortable: true, render: (v) => <span className="text-neutral-500 truncate block max-w-xs">{v as string || '-'}</span> },
    ];

    const formFields: FormField[] = [
        { name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'e.g. System Error' },
        {
            name: 'eventSourceTypeId',
            label: 'Source Type',
            type: 'select',
            required: true,
            options: eventSourceTypes.map(s => ({ label: s.name, value: s.id }))
        },
        { name: 'description', label: 'Description', type: 'textarea' },
    ];

    const filteredData = eventTypes.filter((item: EventType) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSubmit = async (data: FormData) => {
        try {
            const payload = {
                crdfd_name: data.name,
                crdfd_description: data.description,
                "crdfd_EventSource@odata.bind": `/crdfd_eventsourcetypes(${data.eventSourceTypeId})`
            };

            if (selected) {
                await updateEventType(selected.id, payload);
            } else {
                await createEventType(payload);
            }
            setIsFormOpen(false);
            setSelected(null);
        } catch (error) {
            console.error(error);
        }
    };

    const remove = async (id: string) => {
        await deactivateEventType(id);
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
            key: 'deactivate',
            label: 'Deactivate',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
            onClick: () => {
                if (selected) {
                    setDeleteItem(selected);
                } else if (selectedRows.length > 0) {
                    // Bulk delete not strictly implemented in this simple reconstruction, but safe to ignore for now or pick first
                    setDeleteItem(selectedRows[0]);
                } else {
                    toast.error('Select an item to deactivate');
                }
            },
            disabled: !selected && selectedRows.length === 0,
            variant: 'ghost',
        },
        {
            key: 'refresh',
            label: 'Refresh',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
            onClick: async () => {
                await refreshEventTypes();
                toast.success('Data refreshed');
            },
            variant: 'ghost'
        },
        {
            key: 'export',
            label: 'Export to Excel',
            icon: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>,
            onClick: () => {
                const dataToExport = filteredData.map(d => ({
                    ...d,
                    sourceType: eventSourceTypes.find(s => s.id === d.eventSourceTypeId)?.name
                }));
                exportToCsv(dataToExport, 'event-types');
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
                    <div className="p-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowFilters(false)} className="w-full">Close filters</Button>
                    </div>
                }
                items={commandBarItems}
            />

            <div className="card p-3">
                <DataTable<EventType>
                    data={filteredData}
                    columns={columns}
                    keyField="id"
                    searchable={false}
                    isLoading={isLoading}
                    emptyMessage={searchQuery ? "No matching event types found" : "No event types found"}
                    onRowClick={(row) => { setSelected(row); setIsFormOpen(true); }}
                    selectable={true}
                    onSelectionChange={setSelectedRows}
                />
            </div>

            <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setSelected(null); }} title={selected ? 'Edit Event Type' : 'Add Event Type'} className="!w-[85%] h-[90%] max-w-none">
                <Tabs defaultValue="general" className="w-full h-full flex flex-col">
                    <TabsList>
                        <TabsTrigger value="general">General</TabsTrigger>

                    </TabsList>
                    <TabsContent value="general" className="flex-1 overflow-y-auto">
                        <FormBuilder<FormData> fields={formFields} schema={eventTypeSchema}
                            defaultValues={selected ? { name: selected.name, description: selected.description, eventSourceTypeId: selected.eventSourceTypeId } : {}}
                            onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} isLoading={isLoading} />
                    </TabsContent>

                </Tabs>
            </Modal>
            <ConfirmModal isOpen={!!deleteItem} onClose={() => setDeleteItem(null)}
                onConfirm={async () => {
                    if (deleteItem) {
                        try {
                            await remove(deleteItem.id);
                            toast.success('Deactivated successfully');
                            setDeleteItem(null);
                            setSelectedRows([]);
                        } catch (e) {
                            toast.error('An error occurred during deactivation');
                        }
                    }
                }}
                title="Deactivate Event Type" message={`Deactivate "${deleteItem?.name}"?`} isLoading={isLoading} />
        </div>
    );
}
