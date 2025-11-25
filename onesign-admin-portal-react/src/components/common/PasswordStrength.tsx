import React from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

export interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
  className?: string;
}

interface PasswordRequirement {
  label: string;
  regex: RegExp;
  met: boolean;
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  showRequirements = true,
  className,
}) => {
  const { t } = useTranslation();

  const requirements: PasswordRequirement[] = [
    {
      label: t('auth.passwordMinLength', { defaultValue: 'At least 8 characters' }),
      regex: /.{8,}/,
      met: password.length >= 8,
    },
    {
      label: t('auth.passwordUppercase', { defaultValue: 'One uppercase letter' }),
      regex: /[A-Z]/,
      met: /[A-Z]/.test(password),
    },
    {
      label: t('auth.passwordLowercase', { defaultValue: 'One lowercase letter' }),
      regex: /[a-z]/,
      met: /[a-z]/.test(password),
    },
    {
      label: t('auth.passwordNumber', { defaultValue: 'One number' }),
      regex: /[0-9]/,
      met: /[0-9]/.test(password),
    },
    {
      label: t('auth.passwordSpecial', { defaultValue: 'One special character' }),
      regex: /[^A-Za-z0-9]/,
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];

  const metCount = requirements.filter((req) => req.met).length;
  const strength = (metCount / requirements.length) * 100;

  const getStrengthLabel = () => {
    if (strength === 0) return { label: '', color: '' };
    if (strength <= 40) return { label: t('auth.weak', { defaultValue: 'Weak' }), color: 'bg-danger-500' };
    if (strength <= 60) return { label: t('auth.fair', { defaultValue: 'Fair' }), color: 'bg-warning-500' };
    if (strength <= 80) return { label: t('auth.good', { defaultValue: 'Good' }), color: 'bg-primary-500' };
    return { label: t('auth.strong', { defaultValue: 'Strong' }), color: 'bg-success-500' };
  };

  const strengthInfo = getStrengthLabel();

  if (!password) return null;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">
            {t('auth.passwordStrength', { defaultValue: 'Password Strength' })}
          </span>
          <span
            className={cn(
              'font-medium',
              strength <= 40 && 'text-danger-600',
              strength > 40 && strength <= 60 && 'text-warning-600',
              strength > 60 && strength <= 80 && 'text-primary-600',
              strength > 80 && 'text-success-600'
            )}
          >
            {strengthInfo.label}
          </span>
        </div>
        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strength}%` }}
            transition={{ duration: 0.3 }}
            className={cn('h-full rounded-full', strengthInfo.color)}
          />
        </div>
      </div>

      {/* Requirements */}
      {showRequirements && (
        <div className="space-y-2">
          {requirements.map((req, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 text-sm"
            >
              {req.met ? (
                <Check className="w-4 h-4 text-success-500 flex-shrink-0" />
              ) : (
                <X className="w-4 h-4 text-slate-400 flex-shrink-0" />
              )}
              <span
                className={cn(
                  'transition-colors',
                  req.met
                    ? 'text-success-600 dark:text-success-400'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                {req.label}
              </span>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrength;
