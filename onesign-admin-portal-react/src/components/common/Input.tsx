import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/utils/cn';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            className={cn(
              'w-full rounded-lg border bg-white dark:bg-slate-800 px-4 py-2.5 text-slate-900 dark:text-slate-100 placeholder-slate-400 transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
              error
                ? 'border-danger-500 focus:ring-danger-500'
                : 'border-slate-300 dark:border-slate-600',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              className
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightIcon}
            </div>
          )}
        </div>

        {(error || helperText) && (
          <p
            className={cn(
              'mt-1.5 text-sm',
              error
                ? 'text-danger-600 dark:text-danger-400'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            {error || helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
