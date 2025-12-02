import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/utils/cn';

// ActionMenu component for dropdown menus
export interface ActionMenuItem {
  label?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  type?: 'divider';
  variant?: 'default' | 'danger';
}

export interface ActionMenuProps {
  trigger?: React.ReactNode;
  items: ActionMenuItem[];
  className?: string;
  disabled?: boolean;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  trigger,
  items,
  className,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: ActionMenuItem) => {
    if (item.disabled || item.type === 'divider') return;
    item.onClick?.();
    setIsOpen(false);
  };

  // Default trigger if none provided - Catalyst-style ellipsis button
  const defaultTrigger = (
    <button
      disabled={disabled}
      className={cn(
        'p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-slate-400'
      )}
    >
      <MoreVertical className="w-5 h-5" />
    </button>
  );

  return (
    <div className={cn('relative inline-block', className)} ref={menuRef}>
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={cn('cursor-pointer', disabled && 'cursor-not-allowed')}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (disabled) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-disabled={disabled}
      >
        {trigger || defaultTrigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-1 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 ring-1 ring-black/5 dark:ring-white/10"
          >
            <div className="py-1">
              {items.map((item, index) => {
                if (item.type === 'divider') {
                  return (
                    <div
                      key={index}
                      className="border-t border-slate-200 dark:border-slate-700 my-1"
                    />
                  );
                }

                const isDanger = item.variant === 'danger';

                return (
                  <button
                    key={index}
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={cn(
                      'w-full flex items-center px-3 py-2 text-sm text-left transition-colors duration-150',
                      'hover:bg-slate-50 dark:hover:bg-slate-700/50',
                      'focus:outline-none focus:bg-slate-50 dark:focus:bg-slate-700/50',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      isDanger && 'text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50',
                      item.disabled && 'opacity-50 cursor-not-allowed'
                    )}
                  >
                    {item.icon && (
                      <span className={cn(
                        'mr-3 flex-shrink-0',
                        isDanger ? 'text-red-500 dark:text-red-400' : 'text-slate-400 dark:text-slate-500'
                      )}>
                        {item.icon}
                      </span>
                    )}
                    <span className={cn(
                      'flex-1 truncate',
                      isDanger ? 'text-red-900 dark:text-red-100' : 'text-slate-900 dark:text-slate-100'
                    )}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export interface DropdownOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

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
  placeholder,
  label,
  error,
  disabled = false,
  className,
  searchable = false,
  multiple = false,
}) => {
  const { t } = useTranslation();
  const defaultPlaceholder = placeholder || t('common.selectOption');
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
              ? `${selectedValues.size} ${t('common.selected')}`
              : selectedOption?.label || defaultPlaceholder}
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
                  placeholder={t('common.searchPlaceholder')}
                  className="w-full px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            )}

            {/* Options List */}
            <div className="max-h-60 overflow-y-auto scrollbar-thin">
              {filteredOptions.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500 text-center">
                  {t('common.noOptionsFound')}
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
