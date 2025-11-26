import React, { useState } from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/utils/cn';
import Button from './Button';
import Input from './Input';
import Dropdown from './Dropdown';

export interface SearchFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { value: string; label: string }[];
  value?: any;
}

export interface AdvancedSearchProps {
  onSearch: (query: string, filters: Record<string, any>) => void;
  filters?: SearchFilter[];
  placeholder?: string;
  className?: string;
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  onSearch,
  filters = [],
  placeholder,
  className,
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('common.searchPlaceholder');
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});

  const handleSearch = () => {
    onSearch(query, filterValues);
  };

  const handleClearFilters = () => {
    setFilterValues({});
    setQuery('');
    onSearch('', {});
  };

  const activeFiltersCount = Object.keys(filterValues).filter(
    (key) => filterValues[key]
  ).length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Search Bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={defaultPlaceholder}
            className="w-full pl-10 pr-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        {filters.length > 0 && (
          <Button
            variant={showFilters ? 'primary' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            leftIcon={<SlidersHorizontal className="w-4 h-4" />}
          >
            {t('common.filters')}
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        )}

        <Button variant="primary" onClick={handleSearch}>
          {t('common.search')}
        </Button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {showFilters && filters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filters.map((filter) => (
                  <div key={filter.key}>
                    {filter.type === 'select' && filter.options ? (
                      <Dropdown
                        label={filter.label}
                        options={filter.options}
                        value={filterValues[filter.key] || ''}
                        onChange={(value) =>
                          setFilterValues({ ...filterValues, [filter.key]: value })
                        }
                      />
                    ) : (
                      <Input
                        label={filter.label}
                        type={filter.type}
                        value={filterValues[filter.key] || ''}
                        onChange={(e) =>
                          setFilterValues({
                            ...filterValues,
                            [filter.key]: e.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={handleClearFilters}>
                  {t('common.clearAll')}
                </Button>
                <Button variant="primary" size="sm" onClick={handleSearch}>
                  {t('common.applyFilters')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdvancedSearch;
