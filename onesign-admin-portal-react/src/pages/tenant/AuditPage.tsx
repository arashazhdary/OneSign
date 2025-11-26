import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import DataTable, { Column } from '@/components/common/DataTable';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import { formatRelativeTime } from '@/utils/formatters';
import { tenantService } from '@/lib/api/services/tenant.service';

interface AuditLog {
  id: string;
  action: string;
  user: {
    name: string;
    email: string;
  };
  resource: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failed';
  timestamp: string;
}

const AuditPage = () => {
  const { t } = useTranslation();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const response = await tenantService.getAuditLogs({ pageSize: 100 });
      setLogs(response.items || []);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'action',
      label: t('audit.action'),
      sortable: true,
      filterable: true,
      render: (action) => (
        <Badge variant="default" pill>
          {t(`audit.${action}`)}
        </Badge>
      ),
    },
    {
      key: 'user',
      label: t('audit.user'),
      sortable: true,
      render: (_, log) => (
        <div className="flex items-center gap-3">
          <Avatar name={log.user.name} size="sm" />
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{log.user.name}</p>
            <p className="text-xs text-slate-500">{log.user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'resource',
      label: t('audit.resource'),
      sortable: true,
      render: (resource) => <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{resource}</span>,
    },
    {
      key: 'details',
      label: t('audit.details'),
      render: (details) => <span className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-xs">{details}</span>,
    },
    {
      key: 'ipAddress',
      label: t('audit.ipAddress'),
      render: (ip) => <code className="text-xs font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{ip}</code>,
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      render: (status) => (
        <Badge variant={status === 'success' ? 'success' : 'danger'} dot>
          {t(`audit.${status}`)}
        </Badge>
      ),
    },
    {
      key: 'timestamp',
      label: t('audit.timestamp'),
      sortable: true,
      render: (timestamp) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {formatRelativeTime(timestamp)}
        </span>
      ),
    },
  ];

  const handleExport = async () => {
    try {
      const blob = await tenantService.exportAuditLogs({ format: 'csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      toast.success(t('audit.exportLogs') || 'Audit logs exported successfully');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error(t('common.error'));
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('audit.title')} - OneSign Admin Portal</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('audit.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">{t('audit.subtitle')}</p>
          </div>
          <Button variant="primary" onClick={handleExport} leftIcon={<Download className="w-4 h-4" />}>
            {t('audit.exportLogs')}
          </Button>
        </motion.div>

        <Card>
          <DataTable
            columns={columns}
            data={logs}
            loading={loading}
            searchable
            exportable
          />
        </Card>
      </div>
    </>
  );
};

export default AuditPage;
