import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Copy, RefreshCw, Globe, Smartphone, Monitor, Code, MoreVertical, Eye, Settings, Key } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { ActionMenu } from '@/components/common/Dropdown';
import Badge from '@/components/common/Badge';
import { applicationsService } from '@/lib/api/services';

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
  const [selectedAppForRedirectUris, setSelectedAppForRedirectUris] = useState<App | null>(null);
  const [showRedirectUrisModal, setShowRedirectUrisModal] = useState(false);
  const [selectedAppForSecrets, setSelectedAppForSecrets] = useState<App | null>(null);
  const [showSecretsModal, setShowSecretsModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    type: 'web' as 'web' | 'mobile' | 'desktop' | 'api',
    description: '',
  });

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    setLoading(true);
    try {
      const response = await applicationsService.getApplications(params);
      // Handle both items array and data array formats
      const appList = response?.items || response?.data || [];

      // Map API response to our App interface
      const mappedApps = appList.map((app: any) => ({
        id: app.id,
        name: app.name,
        clientId: app.clientId,
        type: (app.applicationType?.toLowerCase() || 'web') as 'web' | 'mobile' | 'desktop' | 'api',
        status: app.isEnabled ? 'active' : 'inactive',
        createdAt: app.createdAt,
        lastUsed: app.lastUsedAt,
      }));

      setApps(mappedApps);
    } catch (error) {
      console.error('Error fetching apps:', error);
      toast.error(t('common.error'));
      setApps([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (app: App) => {
    // TODO: Navigate to app detail page
    toast(t('common.view') + ': ' + app.name);
  };

  const handleEdit = (app: App) => {
    // TODO: Open edit modal or navigate to edit page
    toast(t('common.edit') + ': ' + app.name);
  };

  const handleManageRedirectURIs = (app: App) => {
    setSelectedAppForRedirectUris(app);
    setShowRedirectUrisModal(true);
  };

  const handleManageSecrets = (app: App) => {
    setSelectedAppForSecrets(app);
    setShowSecretsModal(true);
  };

  const handleCreateApp = async () => {
    try {
      await applicationsService.createApplication({
        tenantId: '',
        name: formData.name,
        applicationType: formData.type,
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
      await applicationsService.deleteApplication(appId);
      toast.success(t('apps.appDeleted') || 'Application deleted successfully');
      fetchApps();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleRegenerateSecret = async (appId: string) => {
    try {
      const result = await applicationsService.regenerateSecret(null, appId);
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
        <ActionMenu
          items={[
            {
              label: t('common.view'),
              icon: <Eye className="w-4 h-4" />,
              onClick: () => handleView(app),
            },
            {
              label: t('apps.copyClientId'),
              icon: <Copy className="w-4 h-4" />,
              onClick: () => {
                navigator.clipboard.writeText(app.clientId);
                toast.success(t('apps.clientIdCopied') || 'Client ID copied!');
              },
            },
            {
              label: t('apps.regenerateSecret'),
              icon: <RefreshCw className="w-4 h-4" />,
              onClick: () => handleRegenerateSecret(app.id),
            },
            {
              label: t('apps.manageRedirectUris'),
              icon: <Globe className="w-4 h-4" />,
              onClick: () => handleManageRedirectURIs(app),
            },
            {
              label: t('apps.manageSecrets'),
              icon: <Key className="w-4 h-4" />,
              onClick: () => handleManageSecrets(app),
            },
            {
              label: t('common.edit'),
              icon: <Edit className="w-4 h-4" />,
              onClick: () => handleEdit(app),
            },
            {
              type: 'divider',
            },
            {
              label: t('common.delete'),
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => handleDeleteApp(app.id),
              variant: 'danger',
            },
          ]}
        />
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
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('apps.type')}
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'web' | 'mobile' | 'desktop' | 'api' })}
              >
                <option value="web">{t('apps.web') || 'Web'}</option>
                <option value="mobile">{t('apps.mobile') || 'Mobile'}</option>
                <option value="desktop">{t('apps.desktop') || 'Desktop'}</option>
                <option value="api">{t('apps.api') || 'API'}</option>
              </select>
            </div>
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
