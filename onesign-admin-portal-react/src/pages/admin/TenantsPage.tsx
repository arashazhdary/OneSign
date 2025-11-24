import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Building2, Users, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Dropdown from '@/components/common/Dropdown';
import Badge from '@/components/common/Badge';

interface Tenant {
  id: string;
  name: string;
  domain: string;
  status: 'active' | 'inactive' | 'suspended';
  plan: 'free' | 'basic' | 'pro' | 'enterprise';
  userCount: number;
  appCount: number;
  createdAt: string;
  owner?: { name: string; email: string };
}

const TenantsPage = () => {
  const { t } = useTranslation();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedTenants, setSelectedTenants] = useState<Tenant[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    plan: 'free',
    status: 'active',
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockTenants: Tenant[] = Array.from({ length: 20 }, (_, i) => ({
        id: `tenant-${i + 1}`,
        name: `Company ${i + 1}`,
        domain: `company${i + 1}.com`,
        status: ['active', 'inactive', 'suspended'][i % 3] as any,
        plan: ['free', 'basic', 'pro', 'enterprise'][i % 4] as any,
        userCount: Math.floor(Math.random() * 100) + 10,
        appCount: Math.floor(Math.random() * 20) + 1,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        owner: { name: `Owner ${i + 1}`, email: `owner${i + 1}@company${i + 1}.com` },
      }));
      setTenants(mockTenants);
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Tenant>[] = [
    {
      key: 'name',
      label: t('tenants.name'),
      sortable: true,
      filterable: true,
      render: (_, tenant) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{tenant.name}</p>
            <p className="text-sm text-slate-500">{tenant.domain}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      label: t('tenants.plan'),
      sortable: true,
      render: (plan) => (
        <Badge variant={plan === 'enterprise' ? 'primary' : plan === 'pro' ? 'secondary' : plan === 'basic' ? 'info' : 'default'} pill>
          {t(`tenants.${plan}`)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      render: (status) => (
        <Badge variant={status === 'active' ? 'success' : status === 'inactive' ? 'warning' : 'danger'} dot>
          {t(`users.${status}`)}
        </Badge>
      ),
    },
    {
      key: 'userCount',
      label: t('tenants.userCount'),
      sortable: true,
      render: (count) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{count}</span>
        </div>
      ),
    },
    {
      key: 'appCount',
      label: t('tenants.appCount'),
      sortable: true,
      render: (count) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-slate-400" />
          <span className="text-sm">{count}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      align: 'right',
      render: (_, tenant) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" leftIcon={<Edit className="w-4 h-4" />} />
          <Button variant="ghost" size="sm" leftIcon={<Trash2 className="w-4 h-4 text-danger-600" />} />
        </div>
      ),
    },
  ];

  return (
    <>
      <Helmet>
        <title>{t('tenants.title')} - OneSign Admin Portal</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('tenants.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">{t('tenants.subtitle')}</p>
          </div>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            {t('tenants.addTenant')}
          </Button>
        </motion.div>

        <Card>
          <DataTable columns={columns} data={tenants} loading={loading} searchable exportable selectable onSelectionChange={setSelectedTenants} />
        </Card>

        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={t('tenants.addTenant')}>
          <div className="space-y-4">
            <Input label={t('tenants.name')} value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label={t('tenants.domain')} value={formData.domain} onChange={(e) => setFormData({ ...formData, domain: e.target.value })} />
            <Dropdown
              label={t('tenants.plan')}
              options={[
                { value: 'free', label: t('tenants.free') },
                { value: 'basic', label: t('tenants.basic') },
                { value: 'pro', label: t('tenants.pro') },
                { value: 'enterprise', label: t('tenants.enterprise') },
              ]}
              value={formData.plan}
              onChange={(value) => setFormData({ ...formData, plan: value })}
            />
          </div>
        </Modal>
      </div>
    </>
  );
};

export default TenantsPage;
