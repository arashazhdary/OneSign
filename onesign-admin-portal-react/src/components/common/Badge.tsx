import { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info' | 'default';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pill?: boolean;
}

const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  pill = false,
  className,
  ...props
}) => {
  const variantStyles = {
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    secondary: 'bg-secondary-100 text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300',
    success: 'bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-300',
    warning: 'bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300',
    danger: 'bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-medium',
        pill ? 'rounded-full' : 'rounded-md',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full',
            variant === 'primary' && 'bg-primary-600',
            variant === 'secondary' && 'bg-secondary-600',
            variant === 'success' && 'bg-success-600',
            variant === 'warning' && 'bg-warning-600',
            variant === 'danger' && 'bg-danger-600',
            variant === 'info' && 'bg-blue-600',
            variant === 'default' && 'bg-slate-600'
          )}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
