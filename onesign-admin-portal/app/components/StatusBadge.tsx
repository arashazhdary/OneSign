'use client';

interface StatusBadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export default function StatusBadge({ status, variant }: StatusBadgeProps) {
  const getVariantFromStatus = (status: string): string => {
    if (variant) return variant;

    const statusLower = status.toLowerCase();
    if (statusLower === 'active' || statusLower === 'enabled' || statusLower === 'success' || statusLower === 'resolved' || statusLower === 'closed') {
      return 'success';
    }
    if (statusLower === 'pending' || statusLower === 'in_progress' || statusLower === 'acknowledged') {
      return 'warning';
    }
    if (statusLower === 'inactive' || statusLower === 'disabled' || statusLower === 'error' || statusLower === 'critical') {
      return 'error';
    }
    if (statusLower === 'new' || statusLower === 'info') {
      return 'info';
    }
    return 'default';
  };

  const variantClass = getVariantFromStatus(status);

  const colorClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-300',
    success: 'bg-green-100 text-green-800 border-green-300',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    error: 'bg-red-100 text-red-800 border-red-300',
    info: 'bg-blue-100 text-blue-800 border-blue-300'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colorClasses[variantClass as keyof typeof colorClasses]}`}
    >
      {status}
    </span>
  );
}
