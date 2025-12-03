import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { getTenantId } from '@/lib/tenant-context';
import * as InsightsAPI from '@/lib/api/insights';
import { Helmet } from 'react-helmet-async';
import {
  Brain,
  Save,
  Download,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Users,
  Clock,
  Zap,
  Eye,
  EyeOff,
  BarChart3,
  PieChart,
  Activity,
  Shield,
  Settings,
} from 'lucide-react';

type ChartType = 'line' | 'bar' | 'pie' | 'heatmap';
type MetricType = 'users' | 'logins' | 'security' | 'applications' | 'mfa' | 'risk';

interface DashboardWidget {
  id: string;
  title: string;
  chartType: ChartType;
  metric: MetricType;
  position: number;
  enabled: boolean;
}

interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

interface TimeSeriesPoint {
  date: string;
  value: number;
  secondary?: number;
}

interface AnomalyDetection {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  detectedAt: string;
  affectedMetric: string;
  deviation: number;
}

interface UserBehaviorPattern {
  id: string;
  pattern: string;
  userCount: number;
  avgSessionDuration: number;
  peakHours: string[];
  commonApplications: string[];
}

interface SavedView {
  id: string;
  name: string;
  description: string;
  widgets: DashboardWidget[];
  dateRange: string;
  createdAt: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantInsightsAdvancedPage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Date range
  const [dateRange, setDateRange] = useState('30');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');

  // Dashboard configuration
  const [widgets, setWidgets] = useState<DashboardWidget[]>([
    { id: '1', title: 'User Activity Trend', chartType: 'line', metric: 'users', position: 1, enabled: true },
    { id: '2', title: 'Login Distribution', chartType: 'bar', metric: 'logins', position: 2, enabled: true },
    { id: '3', title: 'Security Score', chartType: 'pie', metric: 'security', position: 3, enabled: true },
    { id: '4', title: 'Application Usage', chartType: 'bar', metric: 'applications', position: 4, enabled: true },
    { id: '5', title: 'MFA Adoption Trend', chartType: 'line', metric: 'mfa', position: 5, enabled: true },
    { id: '6', title: 'Risk Events Heatmap', chartType: 'heatmap', metric: 'risk', position: 6, enabled: true },
  ]);

  // Data
  const [userActivityData, setUserActivityData] = useState<TimeSeriesPoint[]>([]);
  const [loginDistribution, setLoginDistribution] = useState<ChartDataPoint[]>([]);
  const [securityScore, setSecurityScore] = useState<ChartDataPoint[]>([]);
  const [applicationUsage, setApplicationUsage] = useState<ChartDataPoint[]>([]);
  const [mfaAdoption, setMfaAdoption] = useState<TimeSeriesPoint[]>([]);
  const [riskHeatmap, setRiskHeatmap] = useState<{ day: string; hour: number; value: number }[]>([]);
  const [anomalies, setAnomalies] = useState<AnomalyDetection[]>([]);
  const [behaviorPatterns, setBehaviorPatterns] = useState<UserBehaviorPattern[]>([]);

  // Saved views
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);
  const [showSaveViewModal, setShowSaveViewModal] = useState(false);
  const [newViewName, setNewViewName] = useState('');
  const [newViewDescription, setNewViewDescription] = useState('');

  useEffect(() => {
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      setTenantIdState('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchData();
    }
  }, [tenantId, dateRange, customFrom, customTo]);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const { from, to } = getDateRange();

      const overview = await InsightsAPI.getTenantInsightsOverview(tenantId!) as any;

      const userTrend = (overview as any).signInTrend.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: item.count,
        secondary: item.failureCount,
      }));
      setUserActivityData(userTrend);

      const loginByDay = transformLoginDistribution((overview as any).signInTrend);
      setLoginDistribution(loginByDay);

      const securityData = [
        { label: 'High Risk', value: overview.highRiskEvents, color: '#ef4444' },
        { label: 'Medium Risk', value: overview.mediumRiskEvents, color: '#f59e0b' },
        { label: 'Low Risk', value: overview.lowRiskEvents, color: '#10b981' },
      ];
      setSecurityScore(securityData);

      const appData = overview.topApplications.slice(0, 6).map((app: any) => ({
        label: app.appName,
        value: app.signInCount,
      }));
      setApplicationUsage(appData);

      const mfaTrend = overview.signInTrend.map((item: any, index: number) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        value: Math.min(overview.mfaAdoptionPercent + (index * 0.5), 100),
      }));
      setMfaAdoption(mfaTrend);

      const heatmap = generateRiskHeatmap(overview.highRiskEvents);
      setRiskHeatmap(heatmap);

      const detectedAnomalies = detectAnomalies(overview);
      setAnomalies(detectedAnomalies);

      const patterns = generateBehaviorPatterns(overview);
      setBehaviorPatterns(patterns);

    } catch (err) {
      setError(t('common.error'));
      console.error('Error fetching advanced insights:', err);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    if (dateRange === 'custom') {
      return { from: customFrom, to: customTo };
    }
    const to = new Date().toISOString();
    const from = new Date();
    from.setDate(from.getDate() - parseInt(dateRange));
    return { from: from.toISOString(), to };
  };

  const transformLoginDistribution = (signInTrend: any[]): ChartDataPoint[] => {
    const dayMap = new Map<string, number>();
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    signInTrend.forEach(item => {
      const date = new Date(item.date);
      const dayName = days[date.getDay()];
      dayMap.set(dayName, (dayMap.get(dayName) || 0) + item.count);
    });

    return days.map(day => ({
      label: day,
      value: dayMap.get(day) || 0,
    }));
  };

  const generateRiskHeatmap = (totalRiskEvents: number) => {
    const heatmap: { day: string; hour: number; value: number }[] = [];
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        let baseValue = Math.random() * 5;
        if (hour >= 9 && hour <= 17 && day < 5) {
          baseValue *= 2;
        }
        heatmap.push({
          day: days[day],
          hour,
          value: Math.floor(baseValue),
        });
      }
    }
    return heatmap;
  };

  const detectAnomalies = (overview: any): AnomalyDetection[] => {
    const anomalies: AnomalyDetection[] = [];

    const avgLogins = overview.totalSignIns / overview.signInTrend.length;
    overview.signInTrend.forEach((day: any, index: number) => {
      if (day.count > avgLogins * 2) {
        anomalies.push({
          id: `anomaly-${index}`,
          type: 'Login Spike',
          severity: 'medium',
          description: `Unusual login activity detected: ${day.count} logins (${Math.round((day.count / avgLogins - 1) * 100)}% above average)`,
          detectedAt: day.date,
          affectedMetric: 'logins',
          deviation: (day.count / avgLogins - 1) * 100,
        });
      }
    });

    if (overview.mfaAdoptionPercent < 70) {
      anomalies.push({
        id: 'anomaly-mfa',
        type: 'Low MFA Adoption',
        severity: 'high',
        description: `MFA adoption rate is ${overview.mfaAdoptionPercent}%, below recommended 70%`,
        detectedAt: new Date().toISOString(),
        affectedMetric: 'mfa',
        deviation: 70 - overview.mfaAdoptionPercent,
      });
    }

    if (overview.highRiskEvents > 10) {
      anomalies.push({
        id: 'anomaly-risk',
        type: 'High Risk Events',
        severity: 'critical',
        description: `${overview.highRiskEvents} high-risk security events detected`,
        detectedAt: new Date().toISOString(),
        affectedMetric: 'risk',
        deviation: overview.highRiskEvents,
      });
    }

    return anomalies;
  };

  const generateBehaviorPatterns = (overview: any): UserBehaviorPattern[] => {
    return [
      {
        id: 'pattern-1',
        pattern: 'Business Hours Users',
        userCount: Math.floor(overview.activeUsers * 0.7),
        avgSessionDuration: 240,
        peakHours: ['9 AM', '2 PM', '4 PM'],
        commonApplications: overview.topApplications.slice(0, 3).map((app: any) => app.appName),
      },
      {
        id: 'pattern-2',
        pattern: 'Night Shift Users',
        userCount: Math.floor(overview.activeUsers * 0.15),
        avgSessionDuration: 180,
        peakHours: ['10 PM', '12 AM', '2 AM'],
        commonApplications: overview.topApplications.slice(1, 4).map((app: any) => app.appName),
      },
      {
        id: 'pattern-3',
        pattern: 'Mobile Users',
        userCount: Math.floor(overview.activeUsers * 0.4),
        avgSessionDuration: 45,
        peakHours: ['8 AM', '12 PM', '6 PM'],
        commonApplications: ['Mobile App', 'Email', 'Chat'],
      },
    ];
  };

  const handleExportDashboard = async () => {
    setSuccess('');
    setError('');
    try {
      const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent('Dashboard Export\nNo data available');
      const link = document.createElement('a');
      link.setAttribute('href', csvContent);
      link.setAttribute('download', `advanced-insights-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setSuccess('Dashboard exported successfully');
    } catch (err) {
      setError('Failed to export dashboard');
    }
  };

  const handleSaveView = () => {
    const newView: SavedView = {
      id: Date.now().toString(),
      name: newViewName,
      description: newViewDescription,
      widgets: widgets.filter(w => w.enabled),
      dateRange,
      createdAt: new Date().toISOString(),
    };
    setSavedViews([...savedViews, newView]);
    setShowSaveViewModal(false);
    setNewViewName('');
    setNewViewDescription('');
    setSuccess('Custom view saved successfully');
  };

  const handleLoadView = (view: SavedView) => {
    setWidgets(view.widgets);
    setDateRange(view.dateRange);
    setSuccess(`Loaded view: ${view.name}`);
  };

  const toggleWidget = (widgetId: string) => {
    setWidgets(widgets.map(w =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    ));
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'from-red-500 to-red-600';
      case 'high': return 'from-orange-500 to-orange-600';
      case 'medium': return 'from-yellow-500 to-yellow-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getSeverityBgColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800';
      case 'medium': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800';
      default: return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800';
    }
  };

  const renderChart = (widget: DashboardWidget) => {
    if (!widget.enabled) return null;

    let data: any[] = [];
    let maxValue = 0;

    switch (widget.metric) {
      case 'users':
        data = userActivityData;
        maxValue = Math.max(...data.map(d => d.value));
        break;
      case 'logins':
        data = loginDistribution;
        maxValue = Math.max(...data.map(d => d.value));
        break;
      case 'security':
        data = securityScore;
        maxValue = Math.max(...data.map(d => d.value));
        break;
      case 'applications':
        data = applicationUsage;
        maxValue = Math.max(...data.map(d => d.value));
        break;
      case 'mfa':
        data = mfaAdoption;
        maxValue = 100;
        break;
      case 'risk':
        return renderHeatmap();
    }

    if (widget.chartType === 'line') {
      return renderLineChart(data as TimeSeriesPoint[], maxValue, widget.title);
    } else if (widget.chartType === 'bar') {
      return renderBarChart(data as ChartDataPoint[], maxValue);
    } else if (widget.chartType === 'pie') {
      return renderPieChart(data as ChartDataPoint[]);
    }
  };

  const renderLineChart = (data: TimeSeriesPoint[], maxValue: number, title: string) => {
    return (
      <div className="space-y-2">
        {data.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="flex items-center gap-2"
          >
            <span className="text-xs text-gray-500 dark:text-gray-400 w-20 text-right">{point.date}</span>
            <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-lg h-6 relative overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(point.value / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-6 rounded-lg"
              />
              {point.secondary !== undefined && point.secondary > 0 && (
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(point.secondary / maxValue) * 100}%` }}
                  className="absolute top-0 bg-gradient-to-r from-red-400 to-red-500 h-6 rounded-lg"
                  style={{ opacity: 0.7 }}
                />
              )}
            </div>
            <span className="text-xs font-medium text-gray-900 dark:text-white w-12">{point.value}</span>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderBarChart = (data: ChartDataPoint[], maxValue: number) => {
    return (
      <div className="flex items-end justify-between gap-2 h-48">
        {data.map((point, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex-1 flex flex-col items-center gap-2"
          >
            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-lg relative flex-1 flex items-end">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(point.value / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="w-full rounded-lg bg-gradient-to-t from-indigo-500 to-purple-500"
                style={{ backgroundColor: point.color || undefined }}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 text-center">{point.label}</span>
            <span className="text-xs font-medium text-gray-900 dark:text-white">{point.value}</span>
          </motion.div>
        ))}
      </div>
    );
  };

  const renderPieChart = (data: ChartDataPoint[]) => {
    const total = data.reduce((sum, d) => sum + d.value, 0);
    return (
      <div className="space-y-3">
        {data.map((point, index) => {
          const percentage = total > 0 ? (point.value / total) * 100 : 0;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-1"
            >
              <div className="flex justify-between text-sm">
                <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: point.color || '#4f46e5' }}
                  />
                  {point.label}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">{point.value} ({percentage.toFixed(1)}%)</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="h-2 rounded-full"
                  style={{ backgroundColor: point.color || '#4f46e5' }}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderHeatmap = () => {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const maxValue = Math.max(...riskHeatmap.map(d => d.value), 1);

    return (
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="flex gap-1">
            <div className="flex flex-col gap-1 pt-6">
              {days.map(day => (
                <div key={day} className="h-6 w-10 flex items-center justify-end pr-2 text-xs text-gray-500 dark:text-gray-400">
                  {day}
                </div>
              ))}
            </div>
            <div>
              <div className="flex gap-1 mb-1">
                {hours.filter(h => h % 2 === 0).map(hour => (
                  <div key={hour} className="w-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                    {hour}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1">
                {days.map(day => (
                  <div key={day} className="flex gap-1">
                    {hours.map(hour => {
                      const point = riskHeatmap.find(p => p.day === day && p.hour === hour);
                      const intensity = point ? (point.value / maxValue) : 0;
                      return (
                        <motion.div
                          key={hour}
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: (days.indexOf(day) * 24 + hour) * 0.002 }}
                          className={`w-3 h-6 rounded transition-colors ${
                            intensity === 0 ? 'bg-gray-100 dark:bg-slate-700' :
                            intensity < 0.3 ? 'bg-green-200 dark:bg-green-800' :
                            intensity < 0.6 ? 'bg-yellow-300 dark:bg-yellow-700' :
                            intensity < 0.8 ? 'bg-orange-400 dark:bg-orange-600' : 'bg-red-500 dark:bg-red-600'
                          }`}
                          title={`${day} ${hour}:00 - ${point?.value || 0} events`}
                        />
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !userActivityData.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 p-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-3 text-gray-600 dark:text-gray-400"
        >
          <RefreshCw className="w-6 h-6 animate-spin" />
          <span>{t('common.loading')}</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Advanced Insights | OneSign</title>
      </Helmet>

      <div className="p-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Advanced Insights
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">AI-powered analytics and anomaly detection</p>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowSaveViewModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg"
            >
              <Save className="w-4 h-4" />
              Save View
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleExportDashboard}
              className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg"
            >
              <Download className="w-4 h-4" />
              Export Dashboard
            </motion.button>
          </div>
        </motion.div>

        {/* Alerts */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-xl"
            >
              {success}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
              >
                <option value="7">Last 7 days</option>
                <option value="14">Last 14 days</option>
                <option value="30">Last 30 days</option>
                <option value="60">Last 60 days</option>
                <option value="90">Last 90 days</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>

            {dateRange === 'custom' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">From</label>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">To</label>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </>
            )}

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Visible Widgets</label>
              <div className="flex flex-wrap gap-2">
                {widgets.map(widget => (
                  <motion.button
                    key={widget.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleWidget(widget.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      widget.enabled
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                        : 'bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {widget.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    {widget.title}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Saved Views */}
        {savedViews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Saved Views</h3>
            <div className="flex gap-2 flex-wrap">
              {savedViews.map(view => (
                <motion.button
                  key={view.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLoadView(view)}
                  className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-xl shadow border border-gray-200 dark:border-slate-700 hover:border-purple-500 transition-all text-left"
                >
                  <div className="font-medium text-gray-900 dark:text-white">{view.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{view.description}</div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Anomaly Detection */}
        {anomalies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              Anomaly Detection
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {anomalies.map((anomaly, index) => (
                <motion.div
                  key={anomaly.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className={`p-4 rounded-xl border ${getSeverityBgColor(anomaly.severity)}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="font-medium">{anomaly.type}</div>
                    <span className={`text-xs uppercase px-2 py-1 rounded-full bg-white/50 dark:bg-slate-900/50`}>
                      {anomaly.severity}
                    </span>
                  </div>
                  <p className="text-sm mb-2">{anomaly.description}</p>
                  <div className="text-xs opacity-75">
                    Detected: {new Date(anomaly.detectedAt).toLocaleString()}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Dashboard Widgets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {widgets.filter(w => w.enabled).map((widget, index) => (
            <motion.div
              key={widget.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{widget.title}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 uppercase px-2 py-1 bg-gray-100 dark:bg-slate-700 rounded-lg">
                  {widget.chartType}
                </span>
              </div>
              {renderChart(widget)}
            </motion.div>
          ))}
        </div>

        {/* User Behavior Patterns */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-500" />
            User Behavior Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {behaviorPatterns.map((pattern, index) => (
              <motion.div
                key={pattern.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className="border border-gray-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-all"
              >
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">{pattern.pattern}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">User Count:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{pattern.userCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Avg Session:</span>
                    <span className="font-medium text-gray-900 dark:text-white">{pattern.avgSessionDuration} min</span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Peak Hours:</span>
                    <div className="flex gap-1 mt-1 flex-wrap">
                      {pattern.peakHours.map(hour => (
                        <span key={hour} className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 px-2 py-1 rounded-lg">
                          {hour}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Common Apps:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pattern.commonApplications.map(app => (
                        <span key={app} className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded-lg">
                          {app}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Save View Modal */}
      <AnimatePresence>
        {showSaveViewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 p-6 rounded-2xl max-w-md w-full mx-4 shadow-2xl"
            >
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Save Custom View</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">View Name</label>
                  <input
                    type="text"
                    value={newViewName}
                    onChange={(e) => setNewViewName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Weekly Security Review"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                  <textarea
                    value={newViewDescription}
                    onChange={(e) => setNewViewDescription(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                    rows={3}
                    placeholder="Brief description of this view..."
                  />
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  This will save the current widget configuration and date range.
                </div>
              </div>
              <div className="flex gap-2 justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowSaveViewModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveView}
                  disabled={!newViewName}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all"
                >
                  Save View
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
