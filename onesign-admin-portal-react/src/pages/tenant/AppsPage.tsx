import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Copy, RefreshCw, Globe, Smartphone, Monitor, Code } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Dropdown from '@/components/common/Dropdown';
import Badge from '@/components/common/Badge';
import { tenantService } from '@/lib/api/services/tenant.service';

interface App {
  id: string;
  name: string;
  clientId: string;
  type: 'web' | 'mobile' | 'desktop' | 'api';
  status: 'active' | 'inactive';
  createdAt: string;
  lastUsed?: string;
}

const AppsPage = () => {
  const { t } = useTranslation();
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'web' as 'web' | 'mobile' | 'desktop' | 'api',
    description: '',
  });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const response = await tenantService.getApplications();
      setApps(response.items || []);
    } catch (error) {
      console.error('Error fetching apps:', error);
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = async () => {
    try {
      await tenantService.createApplication({
        name: formData.name,
        type: formData.type,
        description: formData.description,
      });
      toast.success(t('apps.appCreated') || 'Application created successfully');
      setIsAddModalOpen(false);
      setFormData({ name: '', type: 'web', description: '' });
      fetchApps();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm(t('apps.confirmDelete') || 'Are you sure you want to delete this application?')) return;
    try {
      await tenantService.deleteApplication(appId);
      toast.success(t('apps.appDeleted') || 'Application deleted successfully');
      fetchApps();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleRegenerateSecret = async (appId: string) => {
    try {
      const result = await tenantService.regenerateClientSecret(appId);
      toast.success(t('apps.secretRegenerated') || 'Client secret regenerated');
      navigator.clipboard.writeText(result.clientSecret);
      toast.success('New secret copied to clipboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'web':
        return <Globe className="w-4 h-4" />;
      case 'mobile':
        return <Smartphone className="w-4 h-4" />;
      case 'desktop':
        return <Monitor className="w-4 h-4" />;
      case 'api':
        return <Code className="w-4 h-4" />;
    }
  };

  const columns: Column<App>[] = [
    {
      key: 'name',
      label: t('apps.name'),
      sortable: true,
      filterable: true,
      render: (_, app) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center">
            {getTypeIcon(app.type)}
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{app.name}</p>
            <p className="text-xs text-slate-500 font-mono">{app.clientId}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      label: t('apps.type'),
      sortable: true,
      render: (type) => (
        <Badge variant="info">
          {t(`apps.${type}`)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      render: (status) => (
        <Badge variant={status === 'active' ? 'success' : 'warning'} dot>
          {t(`users.${status}`)}
        </Badge>
      ),
    },
    {
      key: 'lastUsed',
      label: t('apps.lastUsed'),
      sortable: true,
      render: (lastUsed) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {lastUsed ? new Date(lastUsed).toLocaleDateString() : t('users.never')}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      align: 'right',
      render: (_, app) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Copy className="w-4 h-4" />}
            onClick={() => {
              navigator.clipboard.writeText(app.clientId);
              toast.success('Client ID copied!');
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<RefreshCw className="w-4 h-4" />}
            onClick={() => handleRegenerateSecret(app.id)}
          />
          <Button variant="ghost" size="sm" leftIcon={<Edit className="w-4 h-4" />} />
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4 text-danger-600" />}
            onClick={() => handleDeleteApp(app.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('apps.title')} - OneSign Admin Portal</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('apps.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">{t('apps.subtitle')}</p>
          </div>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            {t('apps.addApp')}
          </Button>
        </motion.div>

        <Card>
          <DataTable columns={columns} data={apps} loading={loading} searchable exportable />
        </Card>

        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('apps.addApp')}>
          <div className="space-y-4">
            <Input label={t('apps.name')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Dropdown
              label={t('apps.type')}
              options={[
                { value: 'web', label: t('apps.web'), icon: <Globe className="w-4 h-4" /> },
                { value: 'mobile', label: t('apps.mobile'), icon: <Smartphone className="w-4 h-4" /> },
                { value: 'desktop', label: t('apps.desktop'), icon: <Monitor className="w-4 h-4" /> },
                { value: 'api', label: t('apps.api'), icon: <Code className="w-4 h-4" /> },
              ]}
              value={formData.type}
              onChange={(value) => setFormData({ ...formData, type: value as 'web' | 'mobile' | 'desktop' | 'api' })}
            />
            <Input label={t('apps.description')} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="ghost" onClick={() => setIsAddModalOpen(false)}>
                {t('common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleCreateApp}>
                {t('common.create')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default AppsPage;
