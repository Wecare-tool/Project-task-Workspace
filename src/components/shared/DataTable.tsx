import { useState, useMemo } from 'react';
import { cn, formatDate } from '@utils/index';
import { Button, Input } from '@components/ui';
import type { TableColumn, PaginationInfo } from '@/types';
import {
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    Search,
    Eye,
    Pencil,
    Trash2,
} from 'lucide-react';

interface DataTableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    keyField: keyof T;
    onView?: (row: T) => void;
    onEdit?: (row: T) => void;
    onDelete?: (row: T) => void;
    searchable?: boolean;
    searchPlaceholder?: string;
    pagination?: boolean;
    pageSize?: number;
    emptyMessage?: string;
    isLoading?: boolean;
    actions?: (row: T) => React.ReactNode;
    selectable?: boolean;
    onSelectionChange?: (selected: T[]) => void;
    onRowClick?: (row: T) => void;
    currentPage?: number;
    onPageChange?: (page: number) => void;
}

export function DataTable<T>({
    data,
    columns,
    keyField,
    onView,
    onEdit,
    onDelete,
    searchable = true,
    searchPlaceholder = 'Tìm kiếm...',
    pagination = true,
    pageSize: initialPageSize = 10,
    emptyMessage = 'Không có dữ liệu',
    isLoading = false,
    actions,
    selectable = false,
    onSelectionChange,
    onRowClick,
    currentPage: controlledPage,
    onPageChange,
}: DataTableProps<T>) {
    const [search, setSearch] = useState('');
    const [sortField, setSortField] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [internalPage, setInternalPage] = useState(1);
    const [pageSize] = useState(initialPageSize);
    const [selectedRows, setSelectedRows] = useState<T[]>([]);

    const currentPage = controlledPage ?? internalPage;

    const handlePageChange = (newPage: number) => {
        if (onPageChange) {
            onPageChange(newPage);
        } else {
            setInternalPage(newPage);
        }
    };

    // Filter data by search
    const filteredData = useMemo(() => {
        if (!search.trim()) return data;

        const searchLower = search.toLowerCase();
        return data.filter((row) =>
            columns.some((col) => {
                const value = row[col.key as keyof T];
                if (value == null) return false;
                return String(value).toLowerCase().includes(searchLower);
            })
        );
    }, [data, search, columns]);

    // Sort data
    const sortedData = useMemo(() => {
        if (!sortField) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aVal = a[sortField as keyof T];
            const bVal = b[sortField as keyof T];

            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            const comparison = String(aVal).localeCompare(String(bVal));
            return sortDirection === 'asc' ? comparison : -comparison;
        });
    }, [filteredData, sortField, sortDirection]);

    // Paginate data
    const paginatedData = useMemo(() => {
        if (!pagination) return sortedData;

        const start = (currentPage - 1) * pageSize;
        return sortedData.slice(start, start + pageSize);
    }, [sortedData, currentPage, pageSize, pagination]);

    // Pagination info
    const paginationInfo: PaginationInfo = useMemo(() => ({
        page: currentPage,
        pageSize,
        total: sortedData.length,
        totalPages: Math.ceil(sortedData.length / pageSize),
    }), [currentPage, pageSize, sortedData.length]);

    // Toggle sort
    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    // Render cell value
    const renderCell = (row: T, column: TableColumn<T>) => {
        const value = row[column.key as keyof T];

        if (column.render) {
            return column.render(value, row);
        }

        // Handle Date objects
        if (value instanceof Date) {
            return formatDate(value);
        }

        // Handle date strings
        if (typeof value === 'string' && column.key.toString().toLowerCase().includes('date')) {
            return formatDate(value);
        }

        return value != null ? String(value) : '-';
    };

    // Handle selection
    const handleSelectAll = (checked: boolean) => {
        const newSelection = checked ? [...paginatedData] : [];
        setSelectedRows(newSelection);
        onSelectionChange?.(newSelection);
    };

    const handleSelectRow = (row: T, checked: boolean) => {
        const newSelection = checked
            ? [...selectedRows, row]
            : selectedRows.filter(r => r[keyField] !== row[keyField]);
        setSelectedRows(newSelection);
        onSelectionChange?.(newSelection);
    };

    const isRowSelected = (row: T) => {
        return selectedRows.some(r => r[keyField] === row[keyField]);
    };

    const isAllSelected = paginatedData.length > 0 && paginatedData.every(row => isRowSelected(row));

    const hasActions = onView || onEdit || onDelete || actions;

    return (
        <div className="space-y-4">
            {/* Search */}
            {searchable && (
                <div className="max-w-sm">
                    <Input
                        type="text"
                        placeholder={searchPlaceholder}
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            handlePageChange(1);
                        }}
                        leftIcon={<Search className="w-4 h-4" />}
                    />
                </div>
            )}

            {/* Table */}
            <div className="table-container bg-white">
                <table className="table">
                    <thead>
                        <tr>
                            {selectable && (
                                <th className="w-12">
                                    <input
                                        type="checkbox"
                                        checked={isAllSelected}
                                        onChange={(e) => handleSelectAll(e.target.checked)}
                                        className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                                        aria-label="Chọn tất cả"
                                    />
                                </th>
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key.toString()}
                                    className={cn(
                                        column.sortable && 'cursor-pointer select-none hover:bg-dark-100',
                                        column.width && `w-[${column.width}]`
                                    )}
                                    onClick={() => column.sortable && handleSort(column.key.toString())}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{column.label}</span>
                                        {column.sortable && sortField === column.key && (
                                            sortDirection === 'asc'
                                                ? <ChevronUp className="w-4 h-4" />
                                                : <ChevronDown className="w-4 h-4" />
                                        )}
                                    </div>
                                </th>
                            ))}
                            {hasActions && <th className="w-24 text-center">Thao tác</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center py-12">
                                    <div className="flex items-center justify-center gap-2 text-dark-500">
                                        <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                                        <span>Đang tải...</span>
                                    </div>
                                </td>
                            </tr>
                        ) : paginatedData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + (hasActions ? 1 : 0)} className="text-center py-12 text-dark-500">
                                    {emptyMessage}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((row) => (
                                <tr key={String(row[keyField])} className={cn(isRowSelected(row) && 'bg-primary-50')}>
                                    {selectable && (
                                        <td>
                                            <input
                                                type="checkbox"
                                                checked={isRowSelected(row)}
                                                onChange={(e) => handleSelectRow(row, e.target.checked)}
                                                className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500"
                                                aria-label={`Chọn dòng ${String(row[keyField])}`}
                                            />
                                        </td>
                                    )}
                                    {columns.map((column) => (
                                        <td
                                            key={column.key.toString()}
                                            onClick={() => onRowClick && onRowClick(row)}
                                            className={cn(onRowClick && 'cursor-pointer')}
                                        >
                                            {renderCell(row, column)}
                                        </td>
                                    ))}
                                    {hasActions && (
                                        <td>
                                            <div className="flex items-center justify-center gap-1">
                                                {actions ? actions(row) : (
                                                    <>
                                                        {onView && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => onView(row)}
                                                                className="p-2"
                                                                title="Xem"
                                                            >
                                                                <Eye className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {onEdit && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => onEdit(row)}
                                                                className="p-2"
                                                                title="Sửa"
                                                            >
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                        {onDelete && (
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => onDelete(row)}
                                                                className="p-2 text-danger-600 hover:bg-danger-50"
                                                                title="Xóa"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination && paginationInfo.totalPages > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-dark-500">
                        Hiển thị {(paginationInfo.page - 1) * paginationInfo.pageSize + 1} -{' '}
                        {Math.min(paginationInfo.page * paginationInfo.pageSize, paginationInfo.total)}{' '}
                        trong tổng số {paginationInfo.total} bản ghi
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </Button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (paginationInfo.totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= paginationInfo.totalPages - 2) {
                                pageNum = paginationInfo.totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }
                            return (
                                <Button
                                    key={pageNum}
                                    variant={currentPage === pageNum ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => handlePageChange(pageNum)}
                                    className="w-9 h-9 p-0"
                                >
                                    {pageNum}
                                </Button>
                            );
                        })}

                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === paginationInfo.totalPages}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
