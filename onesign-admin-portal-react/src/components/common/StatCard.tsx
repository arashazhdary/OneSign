import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import Card from './Card';

export interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor?: string;
  iconBgColor?: string;
  delay?: number;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  iconColor = 'text-primary-600',
  iconBgColor = 'bg-primary-100 dark:bg-primary-900/20',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card hover className="relative overflow-hidden">
        {/* Background gradient decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-100/50 to-secondary-100/50 dark:from-primary-900/10 dark:to-secondary-900/10 rounded-full blur-3xl -mr-16 -mt-16" />

        <div className="relative flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
              {title}
            </p>
            <motion.p
              className="text-3xl font-bold text-slate-900 dark:text-white mb-2"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: delay + 0.2 }}
            >
              {value}
            </motion.p>
            {subtitle && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {subtitle}
              </p>
            )}
            {trend && (
              <div className="flex items-center gap-1 mt-2">
                <span
                  className={cn(
                    'text-xs font-semibold',
                    trend.isPositive
                      ? 'text-success-600 dark:text-success-400'
                      : 'text-danger-600 dark:text-danger-400'
                  )}
                >
                  {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                </span>
                <span className="text-xs text-slate-500">vs last month</span>
              </div>
            )}
          </div>

          <motion.div
            className={cn('p-3 rounded-xl', iconBgColor)}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
          >
            <Icon className={cn('w-6 h-6', iconColor)} />
          </motion.div>
        </div>
      </Card>
    </motion.div>
  );
};

export default StatCard;
