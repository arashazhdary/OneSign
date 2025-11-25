import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  className?: string;
  searchable?: boolean;
  multiple?: boolean;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  disabled = false,
  className,
  searchable = false,
  multiple = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValues, setSelectedValues] = useState<Set<string>>(
    new Set(multiple && value ? value.split(',') : [])
  );
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  const filteredOptions = searchable
    ? options.filter((opt) =>
        opt.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'Enter' && !isOpen) {
      setIsOpen(true);
    }
  };

  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newSelectedValues = new Set(selectedValues);
      if (newSelectedValues.has(optionValue)) {
        newSelectedValues.delete(optionValue);
      } else {
        newSelectedValues.add(optionValue);
      }
      setSelectedValues(newSelectedValues);
      onChange?.(Array.from(newSelectedValues).join(','));
    } else {
      onChange?.(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          {label}
        </label>
      )}

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between px-4 py-2.5 rounded-lg border bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          error
            ? 'border-danger-500'
            : 'border-slate-300 dark:border-slate-600',
          disabled && 'opacity-50 cursor-not-allowed',
          isOpen && 'ring-2 ring-primary-500'
        )}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon}
          <span
            className={cn(
              !selectedOption && 'text-slate-400',
              'text-sm truncate'
            )}
          >
            {multiple && selectedValues.size > 0
              ? `${selectedValues.size} selected`
              : selectedOption?.label || placeholder}
          </span>
        </span>
        <ChevronDown
          className={cn(
            'w-5 h-5 text-slate-400 transition-transform',
            isOpen && 'transform rotate-180'
          )}
        />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2 glass-strong rounded-lg shadow-soft-lg border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option, index) => {
                  const isSelected = multiple
                    ? selectedValues.has(option.value)
                    : option.value === value;

                  return (
                    <motion.button
                      key={option.value}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.15, delay: index * 0.02 }}
                      type="button"
                      onClick={() =>
                        !option.disabled && handleSelect(option.value)
                      }
                      disabled={option.disabled}
                      className={cn(
                        'w-full flex items-center justify-between px-4 py-2.5 text-sm text-left transition-colors',
                        isSelected
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800',
                        option.disabled &&
                          'opacity-50 cursor-not-allowed'
                      )}
                    >
                      <span className="flex items-center gap-2">
                        {option.icon}
                        <span>{option.label}</span>
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-primary-600" />
                      )}
                    </motion.button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-danger-600 dark:text-danger-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Dropdown;
