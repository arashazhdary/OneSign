import React from 'react';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="animate-pulse">
      <div className="overflow-x-auto bg-white dark:bg-slate-800 rounded-lg shadow">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
          <thead className="bg-slate-50 dark:bg-slate-900">
            <tr>
              {Array.from({ length: columns }).map((_, index) => (
                <th
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                >
                  <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-20" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <td key={colIndex} className="px-4 py-4 whitespace-nowrap">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TableSkeleton;
