import { type ReactNode, useRef } from 'react';
import { Button, Input } from '@components/ui';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@utils/index';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

export interface CommandBarItem {
    key: string;
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; // Added ghost for standard look
    show?: boolean;
}

export interface CommandBarProps {
    // Search
    onSearch?: (value: string) => void;
    searchValue?: string;
    searchPlaceholder?: string;
    hideSearch?: boolean;

    // Filter
    onFilterClick?: () => void;
    isFilterActive?: boolean;
    hideFilter?: boolean;
    filterContent?: ReactNode;

    // Actions
    items?: CommandBarItem[]; // New structured items prop
    actions?: ReactNode; // Legacy support

    // Selection Actions
    selectedCount?: number;
    selectionActions?: ReactNode; // Legacy support

    className?: string;
}

export function CommandBar({
    onSearch,
    searchValue = '',
    searchPlaceholder = 'Search... (Ctrl+K)',
    hideSearch = false,
    onFilterClick,
    isFilterActive = false,
    hideFilter = false,
    filterContent,
    items,
    actions,
    selectedCount = 0,
    selectionActions,
    className
}: CommandBarProps) {
    const hasSelection = selectedCount > 0;
    const searchInputRef = useRef<HTMLInputElement>(null);

    useKeyboardShortcuts([
        {
            combo: { key: 'k', ctrl: true },
            handler: (e) => {
                if (!hideSearch && onSearch) {
                    e.preventDefault();
                    searchInputRef.current?.focus();
                }
            },
            global: true
        }
    ]);

    const renderItems = () => {
        if (items) {
            return items.filter(item => item.show !== false).map(item => (
                <Button
                    key={item.key}
                    variant={item.variant || 'ghost'} // Default to ghost for ribbon style
                    size="sm"
                    onClick={item.onClick}
                    disabled={item.disabled}
                    leftIcon={item.icon}
                    className={cn(
                        "font-normal text-neutral-700 hover:bg-neutral-100 border-none shadow-none",
                        item.variant === 'primary' && "text-primary-600 hover:text-primary-700 hover:bg-primary-50",
                        item.variant === 'danger' && "text-red-600 hover:text-red-700 hover:bg-red-50"
                    )}
                >
                    {item.label}
                </Button>
            ));
        }

        // Legacy support
        if (hasSelection && selectionActions) {
            return selectionActions;
        }
        return actions;
    };

    return (
        <div className={cn("bg-white border-b border-neutral-200 sticky top-0 z-10", className)}>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between px-4 py-2">
                {/* Left side - Action Buttons */}
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                    {renderItems()}
                </div>

                {/* Right side - Filter & Search */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    {!hideFilter && onFilterClick && (
                        <Button
                            variant={isFilterActive ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={onFilterClick}
                            leftIcon={<Filter className="w-3.5 h-3.5" />}
                        >
                            <span className="hidden sm:inline">Bộ lọc</span>
                        </Button>
                    )}

                    {!hideSearch && onSearch && (
                        <div className="w-full sm:w-auto sm:max-w-xs">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                                <Input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder={searchPlaceholder}
                                    value={searchValue}
                                    onChange={(e) => onSearch(e.target.value)}
                                    className="pl-9 pr-9 py-1.5 text-sm h-8"
                                />
                                {searchValue && (
                                    <button
                                        onClick={() => {
                                            onSearch('');
                                            searchInputRef.current?.focus();
                                        }}
                                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                                        title="Clear search"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter Panel */}
            {isFilterActive && filterContent && (
                <div className="px-4 pb-3 border-t border-neutral-100 animate-slide-down">
                    <div className="pt-3">
                        {filterContent}
                    </div>
                </div>
            )}
        </div>
    );
}
