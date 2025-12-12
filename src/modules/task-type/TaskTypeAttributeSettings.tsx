import { useMemo, useState } from 'react';
import { Button, Checkbox, Input } from '@components/ui';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import type { TaskTypeAttribute } from '@/types';

interface TaskTypeAttributeSettingsProps {
    attributes: TaskTypeAttribute[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}

export function TaskTypeAttributeSettings({
    attributes,
    selectedIds,
    onSelectionChange,
}: TaskTypeAttributeSettingsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    // Filter attributes based on safe search
    const filteredAttributes = useMemo(() => {
        if (!searchQuery.trim()) return attributes;
        const lowerQuery = searchQuery.toLowerCase();
        return attributes.filter(attr =>
            (attr.label || '').toLowerCase().includes(lowerQuery) ||
            (attr.name || '').toLowerCase().includes(lowerQuery)
        );
    }, [attributes, searchQuery]);

    // Group the filtered attributes
    const groupedAttributes = useMemo(() => {
        const groups: Record<string, TaskTypeAttribute[]> = {};
        filteredAttributes.forEach((attr) => {
            const groupKey = attr.group || 'Ungrouped';
            if (!groups[groupKey]) groups[groupKey] = [];
            groups[groupKey].push(attr);
        });

        return Object.entries(groups)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([group, attrs]) => ({
                name: group,
                attributes: attrs.sort((a, b) => (a.label || '').localeCompare(b.label || '')),
            }));
    }, [filteredAttributes]);

    const handleToggleAttribute = (id: string) => {
        const newSelected = selectedIds.includes(id)
            ? selectedIds.filter(i => i !== id)
            : [...selectedIds, id];
        onSelectionChange(newSelected);
    };

    const handleToggleGroup = (groupAttributes: TaskTypeAttribute[]) => {
        const groupIds = groupAttributes.map(a => a.id);
        const allSelected = groupIds.every(id => selectedIds.includes(id));

        let newSelected: string[];
        if (allSelected) {
            // Deselect all in group
            newSelected = selectedIds.filter(id => !groupIds.includes(id));
        } else {
            // Select all in group (add missing ones)
            const missingIds = groupIds.filter(id => !selectedIds.includes(id));
            newSelected = [...selectedIds, ...missingIds];
        }
        onSelectionChange(newSelected);
    };

    const toggleGroupCollapse = (groupName: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(groupName)) {
                next.delete(groupName);
            } else {
                next.add(groupName);
            }
            return next;
        });
    };

    if (attributes.length === 0) {
        return <div className="text-center text-neutral-500 py-8">No attributes available.</div>;
    }

    return (
        <div className="space-y-4">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <Input
                    placeholder="Search attributes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            <div className="space-y-3">
                {groupedAttributes.length === 0 ? (
                    <div className="text-center text-neutral-500 py-8">No attributes match your search.</div>
                ) : (
                    groupedAttributes.map(({ name, attributes }) => {
                        const selectedCount = attributes.filter(a => selectedIds.includes(a.id)).length;
                        const isAllSelected = selectedCount === attributes.length && attributes.length > 0;
                        const isCollapsed = collapsedGroups.has(name);

                        return (
                            <div key={name} className="border rounded-lg bg-white shadow-sm overflow-hidden">
                                <div className="flex items-center gap-3 p-3 bg-neutral-50 border-b">
                                    <button
                                        onClick={() => toggleGroupCollapse(name)}
                                        className="p-1 hover:bg-neutral-200 rounded text-neutral-500 transition"
                                    >
                                        {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                                    </button>

                                    <div className="flex-1 font-medium text-neutral-700 flex items-center gap-2">
                                        {name}
                                        <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-200 text-neutral-600 font-normal">
                                            {selectedCount}/{attributes.length}
                                        </span>
                                    </div>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleToggleGroup(attributes)}
                                        className="h-8 text-xs font-medium text-primary-600 hover:text-primary-700 hover:bg-primary-50"
                                    >
                                        {isAllSelected ? 'Deselect All' : 'Select All'}
                                    </Button>
                                </div>

                                {!isCollapsed && (
                                    <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 bg-white">
                                        {attributes.map(attr => (
                                            <div
                                                key={attr.id}
                                                className={`
                                                    flex items-center gap-3 p-2 rounded border cursor-pointer transition select-none
                                                    ${selectedIds.includes(attr.id)
                                                        ? 'border-primary-200 bg-primary-50/50'
                                                        : 'border-transparent hover:bg-neutral-50 hover:border-neutral-200'}
                                                `}
                                                onClick={() => handleToggleAttribute(attr.id)}
                                            >
                                                <Checkbox
                                                    checked={selectedIds.includes(attr.id)}
                                                    onChange={() => { }} // Handle click on container
                                                    className="pointer-events-none shrink-0"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium text-neutral-700 truncate" title={attr.name}>
                                                        {attr.name || attr.label}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
