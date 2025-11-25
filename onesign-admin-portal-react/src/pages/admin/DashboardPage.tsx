import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Building2,
  Activity,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import Card from '@/components/common/Card';
import { formatNumber, formatRelativeTime } from '@/utils/formatters';

interface Activity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'critical';
}

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTenants: 0,
    activeTenants: 0,
    totalUsers: 0,
    apiCallsToday: 0,
  });
  const [activities, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      setStats({
        totalTenants: 45,
        activeTenants: 42,
        totalUsers: 1250,
        apiCallsToday: 125430,
      });

      setActivities([
        {
          id: '1',
          type: 'Tenant Created',
          description: 'New tenant "Acme Corp" has been created',
          timestamp: new Date(Date.now() - 300000).toISOString(),
          severity: 'info',
        },
        {
          id: '2',
          type: 'Security Alert',
          description: 'Multiple failed login attempts detected',
          timestamp: new Date(Date.now() - 900000).toISOString(),
          severity: 'warning',
        },
        {
          id: '3',
          type: 'System Update',
          description: 'Platform updated to version 2.5.1',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          severity: 'info',
        },
      ]);

      setLoading(false);
    }, 1000);
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="skeleton h-32 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertCircle className="w-5 h-5 text-danger-500" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-warning-500" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-success-500" />;
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('dashboard.title')} - OneSign Admin Portal</title>
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t('dashboard.title')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('dashboard.subtitle')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={t('dashboard.totalTenants')}
            value={formatNumber(stats.totalTenants)}
            subtitle={`${stats.activeTenants} ${t('dashboard.activeTenants')}`}
            icon={Building2}
            trend={{ value: 12, isPositive: true }}
            iconColor="text-primary-600"
            iconBgColor="bg-primary-100 dark:bg-primary-900/20"
            delay={0}
          />

          <StatCard
            title={t('dashboard.totalUsers')}
            value={formatNumber(stats.totalUsers)}
            subtitle={t('dashboard.acrossAllTenants')}
            icon={Users}
            trend={{ value: 8, isPositive: true }}
            iconColor="text-success-600"
            iconBgColor="bg-success-100 dark:bg-success-900/20"
            delay={0.1}
          />

          <StatCard
            title={t('dashboard.apiCalls')}
            value={formatNumber(stats.apiCallsToday)}
            subtitle={t('dashboard.today')}
            icon={Activity}
            trend={{ value: 15, isPositive: true }}
            iconColor="text-secondary-600"
            iconBgColor="bg-secondary-100 dark:bg-secondary-900/20"
            delay={0.2}
          />

          <StatCard
            title={t('dashboard.systemStatus')}
            value={t('dashboard.healthy')}
            subtitle={t('dashboard.allSystemsOperational')}
            icon={TrendingUp}
            iconColor="text-success-600"
            iconBgColor="bg-success-100 dark:bg-success-900/20"
            delay={0.3}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                  {t('dashboard.recentActivities')}
                </h2>
                <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
                  {t('dashboard.viewAll')}
                </button>
              </div>

              <div className="space-y-4">
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getSeverityIcon(activity.severity)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {activity.type}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(activity.timestamp)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* System Health */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                {t('dashboard.systemHealth')}
              </h2>

              <div className="space-y-4">
                {[
                  {
                    name: t('dashboard.apiGateway'),
                    status: 'healthy',
                    uptime: 99.9,
                    responseTime: 45,
                  },
                  {
                    name: t('dashboard.authService'),
                    status: 'healthy',
                    uptime: 99.8,
                    responseTime: 32,
                  },
                  {
                    name: t('dashboard.database'),
                    status: 'healthy',
                    uptime: 99.95,
                    responseTime: 28,
                  },
                  {
                    name: t('dashboard.analytics'),
                    status: 'degraded',
                    uptime: 98.5,
                    responseTime: 156,
                  },
                ].map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          service.status === 'healthy'
                            ? 'bg-success-500'
                            : service.status === 'degraded'
                            ? 'bg-warning-500'
                            : 'bg-danger-500'
                        } animate-pulse-soft`}
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {service.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {service.uptime}% {t('dashboard.uptime')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {service.responseTime}ms
                      </p>
                      <p className="text-xs text-slate-500">{t('dashboard.responseTime')}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
              {t('dashboard.quickActions')}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: t('dashboard.createTenant'), color: 'primary' },
                { label: t('dashboard.addAdmin'), color: 'secondary' },
                { label: t('dashboard.viewLogs'), color: 'accent' },
                { label: t('dashboard.settings'), color: 'success' },
              ].map((action, index) => (
                <motion.button
                  key={action.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-6 rounded-xl border-2 border-${action.color}-200 dark:border-${action.color}-800 hover:bg-${action.color}-50 dark:hover:bg-${action.color}-900/20 transition-all duration-200 text-center group`}
                >
                  <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-gradient">
                    {action.label}
                  </p>
                </motion.button>
              ))}
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default DashboardPage;
