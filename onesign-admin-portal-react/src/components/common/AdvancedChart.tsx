import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import { cn } from '@/utils/cn';

export interface ChartData {
  [key: string]: string | number;
}

export interface AdvancedChartProps {
  data: ChartData[];
  type: 'area' | 'bar' | 'line' | 'pie' | 'radar';
  dataKeys: string[];
  xAxisKey?: string;
  colors?: string[];
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  className?: string;
}

const COLORS = [
  '#3b82f6', // primary-500
  '#a855f7', // secondary-500
  '#ec4899', // accent-500
  '#22c55e', // success-500
  '#f59e0b', // warning-500
  '#ef4444', // danger-500
];

const AdvancedChart: React.FC<AdvancedChartProps> = ({
  data,
  type,
  dataKeys,
  xAxisKey = 'name',
  colors = COLORS,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  className,
}) => {
  const renderChart = () => {
    switch (type) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <AreaChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />}
              <XAxis
                dataKey={xAxisKey}
                className="text-xs fill-slate-600 dark:fill-slate-400"
              />
              <YAxis className="text-xs fill-slate-600 dark:fill-slate-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Area
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />}
              <XAxis
                dataKey={xAxisKey}
                className="text-xs fill-slate-600 dark:fill-slate-400"
              />
              <YAxis className="text-xs fill-slate-600 dark:fill-slate-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={colors[index % colors.length]}
                  radius={[8, 8, 0, 0]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );

      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />}
              <XAxis
                dataKey={xAxisKey}
                className="text-xs fill-slate-600 dark:fill-slate-400"
              />
              <YAxis className="text-xs fill-slate-600 dark:fill-slate-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  strokeWidth={2}
                  dot={{ fill: colors[index % colors.length], r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey={dataKeys[0]}
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              {showLegend && <Legend />}
            </PieChart>
          </ResponsiveContainer>
        );

      case 'radar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RadarChart data={data}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey={xAxisKey} className="text-xs fill-slate-600 dark:fill-slate-400" />
              <PolarRadiusAxis className="text-xs fill-slate-600 dark:fill-slate-400" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                }}
              />
              {showLegend && <Legend />}
              {dataKeys.map((key, index) => (
                <Radar
                  key={key}
                  name={key}
                  dataKey={key}
                  stroke={colors[index % colors.length]}
                  fill={colors[index % colors.length]}
                  fillOpacity={0.5}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>
      )}
      <div className="w-full">{renderChart()}</div>
    </div>
  );
};

export default AdvancedChart;
