import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/utils/cn';
import Avatar from './Avatar';

export interface ActivityItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  description?: string;
  timestamp: Date | string;
  icon?: React.ReactNode;
  iconColor?: string;
}

export interface ActivityTimelineProps {
  activities: ActivityItem[];
  className?: string;
}

const ActivityTimeline: React.FC<ActivityTimelineProps> = ({
  activities,
  className,
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      {activities.map((activity, index) => (
        <motion.div
          key={activity.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="relative pl-8 pb-4"
        >
          {/* Timeline line */}
          {index < activities.length - 1 && (
            <div className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
          )}

          {/* Icon */}
          <div
            className={cn(
              'absolute left-0 top-1 w-8 h-8 rounded-full flex items-center justify-center',
              activity.iconColor || 'bg-primary-100 dark:bg-primary-900/20'
            )}
          >
            {activity.icon || (
              <div className="w-3 h-3 rounded-full bg-primary-500" />
            )}
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3 flex-1">
                <Avatar
                  name={activity.user.name}
                  src={activity.user.avatar}
                  size="sm"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-slate-900 dark:text-white">
                      {activity.user.name}
                    </span>
                    <span className="text-slate-600 dark:text-slate-400">
                      {activity.action}
                    </span>
                  </div>
                  {activity.description && (
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {activity.description}
                    </p>
                  )}
                </div>
              </div>
              <time className="text-xs text-slate-500 dark:text-slate-500 whitespace-nowrap">
                {formatDistanceToNow(new Date(activity.timestamp), {
                  addSuffix: true,
                })}
              </time>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default ActivityTimeline;
