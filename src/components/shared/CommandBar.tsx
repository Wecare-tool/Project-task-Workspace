import { type ReactNode, useRef } from 'react';
import { Button, Input } from '@components/ui';
import { Search, Filter, X } from 'lucide-react';
import { cn } from '@utils/index';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

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
    actions?: ReactNode; // Left side buttons (Add New, etc.)

    // Selection Actions
    selectedCount?: number;
    selectionActions?: ReactNode; // Alternative to actions when items are selected

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
            global: true // Allow focusing even if other inputs are focused? Maybe not. But global=true allows overriding.
            // Actually Ctrl+K is usually global.
        }
    ]);

    return (
        <div className={cn("card p-3", className)}>
            <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
                {/* Left side - Action Buttons */}
                <div className="flex items-center gap-2">
                    {hasSelection && selectionActions ? (
                        selectionActions
                    ) : (
                        actions
                    )}
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
                <div className="mt-3 pt-3 border-t border-neutral-100 animate-slide-down">
                    {filterContent}
                </div>
            )}
        </div>
    );
}
