import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  className?: string;
}

const statusColors: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  completed: 'bg-green-100 text-green-800',
  success: 'bg-green-100 text-green-800',
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  warning: 'bg-yellow-100 text-yellow-800',
  error: 'bg-red-100 text-red-800',
  failed: 'bg-red-100 text-red-800',
  rejected: 'bg-red-100 text-red-800',
  inactive: 'bg-gray-100 text-gray-800',
  suspended: 'bg-red-100 text-red-800',
  default: 'bg-gray-100 text-gray-800',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant,
  className = '',
}) => {
  const normalizedStatus = status.toLowerCase().replace(/\s+/g, '_');
  const colorClass = variant
    ? statusColors[variant] || statusColors.default
    : statusColors[normalizedStatus] || statusColors.default;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
