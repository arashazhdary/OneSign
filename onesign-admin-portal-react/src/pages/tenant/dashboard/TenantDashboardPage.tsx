import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { DEFAULT_TENANT_ID } from '@/lib/constants/testIds';
import { usersService, applicationsService, auditService } from '@/lib/api/services';
import { Helmet } from 'react-helmet-async';

export default function TenantDashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalApplications: 0,
    recentActivity: 0
  });
  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantIdState] = useState<string | null>(null);

  useEffect(() => {
    const contextTenantId = getTenantId();
    if (contextTenantId) {
      setTenantIdState(contextTenantId);
    } else {
      setTenantIdState(DEFAULT_TENANT_ID);
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchStats();
    }
  }, [tenantId]);

  const fetchStats = async () => {
    if (!tenantId) return;

    try {
      // Fetch users count
      const usersData = await usersService.getUsers({ page: 1, pageSize: 1 });
      setStats(prev => ({ ...prev, totalUsers: usersData.total || 0 }));

      // Fetch applications count
      const appsData = await applicationsService.getApplications({ page: 1, pageSize: 1 });
      setStats(prev => ({ ...prev, totalApplications: appsData.total || 0 }));

      // Fetch recent audit events count
      const auditData = await auditService.getTenantAuditLogs({ page: 1, pageSize: 1 });
      setStats(prev => ({ ...prev, recentActivity: auditData.total || 0 }));
    } catch (error: any) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">{t('tenant.dashboard.title')}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{t('tenant.dashboard.totalUsers')}</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{t('tenant.dashboard.totalApplications')}</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalApplications}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">{t('tenant.dashboard.recentActivity')}</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats.recentActivity}</p>
        </div>
      </div>
    </div>
  );
}

