import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import {
  Users,
  Package,
  Activity,
  HardDrive,
  Clock,
} from 'lucide-react';
import StatCard from '@/components/common/StatCard';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';
import { formatNumber, formatRelativeTime } from '@/utils/formatters';
import {
  tenantService,
  TenantStatsDto,
  RecentLoginDto,
  UserActivityStatsDto,
  ApplicationUsageDto
} from '@/lib/api/services/tenant.service';

const DashboardPage: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<TenantStatsDto>({
    activeUsers: 0,
    totalUsers: 0,
    totalApps: 0,
    activeApps: 0,
    apiCalls: 0,
    storageUsed: 0,
    storageTotal: 100,
  });
  const [recentLogins, setRecentLogins] = useState<RecentLoginDto[]>([]);
  const [userActivityStats, setUserActivityStats] = useState<UserActivityStatsDto[]>([]);
  const [applicationUsage, setApplicationUsage] = useState<ApplicationUsageDto[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch all dashboard data from API in parallel
      const [statsData, loginsData, activityData, appUsageData] = await Promise.all([
        tenantService.getTenantStats(),
        tenantService.getRecentLogins(10),
        tenantService.getUserActivityStats(7),
        tenantService.getApplicationUsage()
      ]);

      if (statsData) {
        setStats(statsData);
      }
      setRecentLogins(loginsData);
      setUserActivityStats(activityData);
      setApplicationUsage(appUsageData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <>
      <Helmet>
        <title>{t('dashboard.tenantDashboard')} - OneSign Admin Portal</title>
      </Helmet>

      <div className="space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            {t('dashboard.tenantDashboard')}
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            {t('dashboard.tenantOverview')}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title={t('dashboard.activeUsers')}
            value={formatNumber(stats.activeUsers)}
            subtitle={`${stats.totalUsers} ${t('dashboard.registered')}`}
            icon={Users}
            trend={{ value: 15, isPositive: true }}
            iconColor="text-success-600"
            iconBgColor="bg-success-100 dark:bg-success-900/20"
            delay={0}
          />

          <StatCard
            title={t('dashboard.totalApplications')}
            value={formatNumber(stats.totalApps)}
            subtitle={`${stats.activeApps} ${t('dashboard.activeNow')}`}
            icon={Package}
            trend={{ value: 2, isPositive: true }}
            iconColor="text-primary-600"
            iconBgColor="bg-primary-100 dark:bg-primary-900/20"
            delay={0.1}
          />

          <StatCard
            title={t('dashboard.apiUsage')}
            value={formatNumber(stats.apiCalls)}
            subtitle={t('dashboard.thisWeek')}
            icon={Activity}
            trend={{ value: 12, isPositive: true }}
            iconColor="text-secondary-600"
            iconBgColor="bg-secondary-100 dark:bg-secondary-900/20"
            delay={0.2}
          />

          <StatCard
            title={t('dashboard.storageUsed')}
            value={`${stats.storageUsed}GB`}
            subtitle={`${t('dashboard.of')} ${stats.storageTotal}GB`}
            icon={HardDrive}
            iconColor="text-warning-600"
            iconBgColor="bg-warning-100 dark:bg-warning-900/20"
            delay={0.3}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <Card>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                {t('dashboard.userActivity')}
              </h2>

              <div className="space-y-4">
                {userActivityStats.length > 0 ? (
                  userActivityStats.map((data, index) => {
                    const isWeekend = data.day === 'Saturday' || data.day === 'Sunday';
                    const maxUsers = Math.max(...userActivityStats.map(d => d.users), 1);
                    return (
                      <motion.div
                        key={data.day}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                        className="flex items-center gap-4"
                      >
                        <div className="w-20 text-sm font-medium text-slate-600 dark:text-slate-400">
                          {data.day}
                        </div>
                        <div className="flex-1 relative">
                          <div className="h-8 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${(data.users / maxUsers) * 100}%` }}
                              transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                              className={`h-full ${isWeekend ? 'bg-slate-300' : 'bg-primary-500'} rounded-lg`}
                            />
                          </div>
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-900 dark:text-white">
                            {data.users}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-center text-slate-500 py-8">{t('dashboard.noActivityData')}</p>
                )}
              </div>
            </Card>
          </motion.div>

          {/* Application Usage */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <Card>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6">
                {t('dashboard.applicationUsage')}
              </h2>

              <div className="space-y-4">
                {applicationUsage.length > 0 ? (
                  applicationUsage.map((app, index) => {
                    const colors = ['primary', 'secondary', 'success', 'accent'];
                    const color = colors[index % colors.length];
                    return (
                      <motion.div
                        key={app.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
                        className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">
                            {app.name}
                          </p>
                          <Badge variant={color as any} pill>
                            {app.usage}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mr-4">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${app.usage}%` }}
                              transition={{ duration: 1, delay: 0.7 + index * 0.1 }}
                              className={`h-full bg-${color}-500 rounded-full`}
                            />
                          </div>
                          <p className="text-xs text-slate-500">
                            {formatNumber(app.requests)} requests
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                ) : (
                  <p className="text-center text-slate-500 py-8">{t('dashboard.noApplicationData')}</p>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Recent Logins */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
        >
          <Card>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
                {t('dashboard.recentLogins')}
              </h2>
              <button className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
                {t('dashboard.viewAll')}
              </button>
            </div>

            <div className="space-y-4">
              {recentLogins.length > 0 ? (
                recentLogins.map((login, index) => (
                  <motion.div
                    key={login.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.8 + index * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Avatar name={login.userName} size="sm" status={login.success ? "online" : "offline"} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white">
                        {login.userName}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {login.email}
                      </p>
                    </div>
                    <div className="text-right hidden md:block">
                      <p className="text-xs font-medium text-slate-900 dark:text-white">
                        {login.location}
                      </p>
                      <p className="text-xs text-slate-500">{login.ipAddress}</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Clock className="w-3 h-3" />
                      {formatRelativeTime(login.timestamp)}
                    </div>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-8">{t('dashboard.noRecentLogins')}</p>
              )}
            </div>
          </Card>
        </motion.div>
      </div>
    </>
  );
};

export default DashboardPage;
