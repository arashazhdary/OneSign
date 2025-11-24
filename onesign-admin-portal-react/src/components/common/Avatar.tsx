import { useState } from 'react';
import { User } from 'lucide-react';
import { cn } from '@/utils/cn';

export interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  shape?: 'circle' | 'square';
  status?: 'online' | 'offline' | 'away' | 'busy';
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  status,
  className,
}) => {
  const [imageError, setImageError] = useState(false);

  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
  };

  const statusSizes = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
  };

  const statusColors = {
    online: 'bg-success-500',
    offline: 'bg-slate-400',
    away: 'bg-warning-500',
    busy: 'bg-danger-500',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const showImage = src && !imageError;
  const showInitials = !showImage && name;
  const showIcon = !showImage && !showInitials;

  return (
    <div className="relative inline-block">
      <div
        className={cn(
          'flex items-center justify-center overflow-hidden bg-gradient-to-br from-primary-400 to-secondary-500',
          shape === 'circle' ? 'rounded-full' : 'rounded-lg',
          sizeClasses[size],
          className
        )}
      >
        {showImage && (
          <img
            src={src}
            alt={alt || name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        )}

        {showInitials && (
          <span className="font-semibold text-white select-none">
            {getInitials(name!)}
          </span>
        )}

        {showIcon && (
          <User className="w-1/2 h-1/2 text-white" />
        )}
      </div>

      {/* Status Indicator */}
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-white dark:border-slate-900',
            statusSizes[size],
            statusColors[status]
          )}
        />
      )}
    </div>
  );
};

export default Avatar;
