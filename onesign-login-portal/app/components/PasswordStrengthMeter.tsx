'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { PasswordStrength } from '@/hooks/useFormValidation';

interface PasswordStrengthMeterProps {
  strength: PasswordStrength;
  show: boolean;
}

export default function PasswordStrengthMeter({ strength, show }: PasswordStrengthMeterProps) {
  if (!show || strength.score === 0) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-2 space-y-2"
      >
        {/* Strength Bar */}
        <div className="relative h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${strength.percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full rounded-full transition-colors duration-300"
            style={{ backgroundColor: strength.color }}
          />
        </div>

        {/* Strength Label */}
        <div className="flex items-center justify-between">
          <motion.span
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-sm font-medium"
            style={{ color: strength.color }}
          >
            {strength.label}
          </motion.span>

          {/* Requirements Checklist */}
          <div className="flex items-center gap-1">
            <RequirementIndicator
              met={strength.score >= 1}
              tooltip="At least 8 characters"
            />
            <RequirementIndicator
              met={strength.score >= 2}
              tooltip="12+ characters"
            />
            <RequirementIndicator
              met={strength.score >= 3}
              tooltip="Mixed case & numbers"
            />
            <RequirementIndicator
              met={strength.score >= 4}
              tooltip="Special characters"
            />
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

interface RequirementIndicatorProps {
  met: boolean;
  tooltip: string;
}

function RequirementIndicator({ met, tooltip }: RequirementIndicatorProps) {
  return (
    <div className="group relative">
      <div
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          met ? 'bg-green-500 scale-100' : 'bg-slate-300 dark:bg-slate-600 scale-75'
        }`}
      />
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
        {tooltip}
      </div>
    </div>
  );
}
