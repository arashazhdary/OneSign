import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Search,
  Download,
  Filter,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';
import Button from './Button';
import Input from './Input';

export interface Column<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

export interface DataTableProps<T = any> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  searchable?: boolean;
  exportable?: boolean;
  selectable?: boolean;
  pageSize?: number;
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  className?: string;
  actions?: (row: T) => React.ReactNode;
}

function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = 'id',
  searchable = true,
  exportable = true,
  selectable = false,
  pageSize = 10,
  loading = false,
  emptyMessage,
  onRowClick,
  onSelectionChange,
  className,
  actions,
}: DataTableProps<T>) {
  const { t } = useTranslation();
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);

  const defaultEmptyMessage = emptyMessage || t('common.noData');

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [data, sortConfig]);

  // Filtering and searching
  const filteredData = useMemo(() => {
    let result = sortedData;

    // Apply search
    if (searchQuery) {
      result = result.filter((row) =>
        columns.some((col) => {
          const value = row[col.key];
          return value
            ?.toString()
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
        })
      );
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((row) =>
          row[key]?.toString().toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    return result;
  }, [sortedData, searchQuery, filters, columns]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (!current || current.key !== key) {
        return { key, direction: 'asc' };
      }
      if (current.direction === 'asc') {
        return { key, direction: 'desc' };
      }
      return null;
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const newSelection = new Set(paginatedData.map((row) => row[keyField]));
      setSelectedRows(newSelection);
      onSelectionChange?.(
        paginatedData.filter((row) => newSelection.has(row[keyField]))
      );
    }
  };

  const handleSelectRow = (row: T) => {
    const newSelection = new Set(selectedRows);
    const rowKey = row[keyField];

    if (newSelection.has(rowKey)) {
      newSelection.delete(rowKey);
    } else {
      newSelection.add(rowKey);
    }

    setSelectedRows(newSelection);
    onSelectionChange?.(
      filteredData.filter((r) => newSelection.has(r[keyField]))
    );
  };

  const handleExport = () => {
    const csv = [
      columns.map((col) => col.label).join(','),
      ...filteredData.map((row) =>
        columns.map((col) => row[col.key]).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
  };

  const getSortIcon = (key: string) => {
    if (!sortConfig || sortConfig.key !== key) {
      return <ChevronsUpDown className="w-4 h-4" />;
    }
    return sortConfig.direction === 'asc' ? (
      <ChevronUp className="w-4 h-4" />
    ) : (
      <ChevronDown className="w-4 h-4" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="skeleton h-16 rounded-lg" />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          {searchable && (
            <Input
              placeholder={t('common.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              rightIcon={
                searchQuery ? (
                  <button onClick={() => setSearchQuery('')}>
                    <X className="w-4 h-4" />
                  </button>
                ) : undefined
              }
            />
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<Filter className="w-4 h-4" />}
          >
            {t('common.filters')}
          </Button>

          {exportable && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              leftIcon={<Download className="w-4 h-4" />}
            >
              {t('common.export')}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg"
          >
            {columns
              .filter((col) => col.filterable)
              .map((col) => (
                <Input
                  key={col.key}
                  label={col.label}
                  value={filters[col.key] || ''}
                  onChange={(e) =>
                    setFilters({ ...filters, [col.key]: e.target.value })
                  }
                  placeholder={`${t('common.filterBy')} ${col.label}...`}
                />
              ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-700">
        <table className="w-full">
          <thead className="bg-slate-50 dark:bg-slate-800">
            <tr>
              {selectable && (
                <th className="px-4 py-3 text-left w-12">
                  <input
                    type="checkbox"
                    checked={
                      selectedRows.size === paginatedData.length &&
                      paginatedData.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={cn(
                    'px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700'
                  )}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{col.label}</span>
                    {col.sortable && getSortIcon(col.key)}
                  </div>
                </th>
              ))}
              {actions && (
                <th className="px-4 py-3 text-sm font-semibold text-slate-900 dark:text-white text-right">
                  {t('common.actions')}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            <AnimatePresence mode="popLayout">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                    className="px-4 py-8 text-center text-slate-500"
                  >
                    {defaultEmptyMessage}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, index) => (
                  <motion.tr
                    key={row[keyField]}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                    className={cn(
                      'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors',
                      onRowClick && 'cursor-pointer'
                    )}
                    onClick={() => onRowClick?.(row)}
                  >
                    {selectable && (
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(row[keyField])}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleSelectRow(row);
                          }}
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        className={cn(
                          'px-4 py-3 text-sm text-slate-700 dark:text-slate-300',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right'
                        )}
                      >
                        {col.render
                          ? col.render(row[col.key], row)
                          : row[col.key]}
                      </td>
                    ))}
                    {actions && (
                      <td className="px-4 py-3 text-sm text-right">
                        {actions(row)}
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            {t('common.showing')} {(currentPage - 1) * pageSize + 1} {t('common.to')}{' '}
            {Math.min(currentPage * pageSize, filteredData.length)} {t('common.of')}{' '}
            {filteredData.length} {t('common.results')}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              {t('common.previous')}
            </Button>

            <div className="flex items-center gap-1">
              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                if (
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                        page === currentPage
                          ? 'bg-primary-600 text-white'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      )}
                    >
                      {page}
                    </button>
                  );
                }
                if (page === currentPage - 2 || page === currentPage + 2) {
                  return <span key={page}>...</span>;
                }
                return null;
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              {t('common.next')}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;
