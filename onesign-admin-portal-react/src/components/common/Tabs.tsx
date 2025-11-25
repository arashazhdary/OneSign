import { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content?: React.ReactNode;
  disabled?: boolean;
  badge?: number | string;
}

export interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  defaultTab?: string;
  onChange?: (tabId: string) => void;
  onTabChange?: (tabId: string) => void;
  variant?: 'default' | 'pills' | 'underline';
  fullWidth?: boolean;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab: controlledActiveTab,
  defaultTab,
  onChange,
  onTabChange,
  variant = 'default',
  fullWidth = false,
  className,
}) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id);
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    onChange?.(tabId);
    onTabChange?.(tabId);
  };

  const activeTabContent = tabs.find((tab) => tab.id === activeTab)?.content;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Tab List */}
      <div
        className={cn(
          'flex',
          variant === 'underline'
            ? 'border-b border-slate-200 dark:border-slate-700'
            : variant === 'pills'
            ? 'gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg'
            : 'gap-2'
        )}
      >
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;

          return (
            <button
              key={tab.id}
              onClick={() => !tab.disabled && handleTabChange(tab.id)}
              disabled={tab.disabled}
              className={cn(
                'relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-200',
                fullWidth && 'flex-1 justify-center',
                tab.disabled && 'opacity-50 cursor-not-allowed',

                // Variant styles
                variant === 'underline' && [
                  'border-b-2',
                  isActive
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200',
                ],

                variant === 'pills' && [
                  'rounded-lg',
                  isActive
                    ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200',
                ],

                variant === 'default' && [
                  'rounded-lg',
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800',
                ]
              )}
            >
              {/* Active Indicator for Pills */}
              {variant === 'pills' && isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-white dark:bg-slate-700 rounded-lg shadow-sm"
                  style={{ zIndex: -1 }}
                  transition={{ type: 'spring', duration: 0.5, bounce: 0.2 }}
                />
              )}

              {tab.icon}
              <span>{tab.label}</span>

              {tab.badge !== undefined && (
                <span
                  className={cn(
                    'px-2 py-0.5 text-xs font-semibold rounded-full',
                    isActive
                      ? 'bg-primary-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTabContent && (
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTabContent}
        </motion.div>
      )}
    </div>
  );
};

export default Tabs;
