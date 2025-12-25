import { useMemo, useState } from 'react';
import { Button, Checkbox } from '@components/ui';
import { ChevronDown } from 'lucide-react';
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
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());

    // Group the attributes (no safely filtering needed as search is removed)
    const groupedAttributes = useMemo(() => {
        const groups: Record<string, TaskTypeAttribute[]> = {};
        attributes.forEach((attr) => {
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
    }, [attributes]);

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
        <div className="space-y-6">
            <div className="space-y-6">
                {groupedAttributes.map(({ name, attributes }) => {
                    const selectedCount = attributes.filter(a => selectedIds.includes(a.id)).length;
                    const isAllSelected = selectedCount === attributes.length && attributes.length > 0;
                    const isCollapsed = collapsedGroups.has(name);

                    return (
                        <div key={name} className="border border-neutral-200 rounded-xl bg-white shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md">
                            <div
                                className="flex items-center gap-3 p-4 bg-neutral-50/50 border-b border-neutral-100 cursor-pointer select-none"
                                onClick={() => toggleGroupCollapse(name)}
                            >
                                <div className={`
                                    p-1.5 rounded-md text-neutral-500 transition-transform duration-200
                                    ${isCollapsed ? '-rotate-90' : 'rotate-0'}
                                    hover:bg-neutral-200/50
                                `}>
                                    <ChevronDown size={18} />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-base font-semibold text-neutral-800">{name}</h3>
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-600">
                                            {selectedCount}/{attributes.length}
                                        </span>
                                    </div>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleToggleGroup(attributes);
                                    }}
                                    className={`
                                        h-8 px-3 text-xs font-medium transition-colors
                                        ${isAllSelected
                                            ? 'text-red-600 hover:text-red-700 hover:bg-red-50'
                                            : 'text-primary-600 hover:text-primary-700 hover:bg-primary-50'}
                                    `}
                                >
                                    {isAllSelected ? 'Deselect All' : 'Select All'}
                                </Button>
                            </div>

                            {!isCollapsed && (
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 bg-white animate-fade-in">
                                    {attributes.map(attr => {
                                        const isSelected = selectedIds.includes(attr.id);
                                        return (
                                            <div
                                                key={attr.id}
                                                onClick={() => handleToggleAttribute(attr.id)}
                                                className={`
                                                    relative flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 group
                                                    ${isSelected
                                                        ? 'border-primary-500 bg-primary-50/30 shadow-sm'
                                                        : 'border-transparent bg-neutral-50 hover:bg-neutral-100 hover:border-neutral-200'}
                                                `}
                                            >
                                                <div className="pt-0.5 shrink-0">
                                                    <Checkbox
                                                        checked={isSelected}
                                                        onChange={() => { }} // Handled by container click
                                                        className={`
                                                            pointer-events-none transition-colors
                                                            ${isSelected ? 'border-primary-500 text-primary-500' : 'border-neutral-300'}
                                                        `}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-1">
                                                    <p className={`
                                                        text-sm font-semibold leading-tight break-words
                                                        ${isSelected ? 'text-primary-900' : 'text-neutral-700'}
                                                    `}>
                                                        {attr.label}
                                                    </p>
                                                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono break-all">
                                                        <span>{attr.name}</span>
                                                        {attr.dataType && (
                                                            <span className="px-1.5 py-0.5 rounded bg-neutral-200/50 text-neutral-600 uppercase tracking-wider text-[10px]">
                                                                {attr.dataType}
                                                            </span>
                                                        )}
                                                    </div>
                                                    {attr.required && (
                                                        <span className="inline-block text-[10px] font-medium text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded mt-1">
                                                            Required
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
