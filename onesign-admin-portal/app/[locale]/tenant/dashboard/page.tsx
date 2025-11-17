'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';

export default function TenantDashboardPage() {
  const t = useTranslations();
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
      setTenantIdState('00000000-0000-0000-0000-000000000000');
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
      const usersResponse = await fetch(`http://localhost:7000/api/tenant/users?tenantId=${tenantId}&pageNumber=1&pageSize=1`);
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setStats(prev => ({ ...prev, totalUsers: usersData.totalCount || 0 }));
      }

      // Fetch applications count
      const appsResponse = await fetch(`http://localhost:7000/api/tenant/applications?tenantId=${tenantId}&pageNumber=1&pageSize=1`);
      if (appsResponse.ok) {
        const appsData = await appsResponse.json();
        setStats(prev => ({ ...prev, totalApplications: appsData.totalCount || 0 }));
      }

      // Fetch recent audit events count
      const auditResponse = await fetch(`http://localhost:7000/api/tenant/audit?tenantId=${tenantId}&pageNumber=1&pageSize=1`);
      if (auditResponse.ok) {
        const auditData = await auditResponse.json();
        setStats(prev => ({ ...prev, recentActivity: auditData.totalCount || 0 }));
      }
    } catch (error) {
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

