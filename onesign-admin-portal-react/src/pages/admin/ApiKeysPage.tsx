import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Copy, RefreshCw, Trash2, Key, Eye, EyeOff } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Dropdown from '@/components/common/Dropdown';
import Badge from '@/components/common/Badge';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  environment: 'production' | 'development' | 'staging';
  status: 'active' | 'revoked';
  createdBy: string;
  lastUsed?: string;
  expiresAt?: string;
  createdAt: string;
}

const ApiKeysPage = () => {
  const { t } = useTranslation();
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const [formData, setFormData] = useState({
    name: '',
    environment: 'production',
  });

  useEffect(() => {
    fetchApiKeys();
  }, []);

  const fetchApiKeys = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockKeys: ApiKey[] = Array.from({ length: 10 }, (_, i) => ({
        id: `key-${i + 1}`,
        name: `${['Production', 'Development', 'Staging'][i % 3]} API Key ${i + 1}`,
        key: `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
        environment: ['production', 'development', 'staging'][i % 3] as any,
        status: i % 5 === 0 ? 'revoked' : 'active',
        createdBy: 'Admin User',
        lastUsed: i % 2 === 0 ? new Date(Date.now() - i * 3600000).toISOString() : undefined,
        expiresAt: i % 3 === 0 ? new Date(Date.now() + 90 * 86400000).toISOString() : undefined,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
      }));
      setApiKeys(mockKeys);
    } catch (error) {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  const maskKey = (key: string, isVisible: boolean) => {
    if (isVisible) return key;
    return `${key.substring(0, 7)}${'•'.repeat(20)}${key.substring(key.length - 4)}`;
  };

  const columns: Column<ApiKey>[] = [
    {
      key: 'name',
      label: t('apiKeys.keyName'),
      sortable: true,
      filterable: true,
      render: (_, apiKey) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
            <Key className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{apiKey.name}</p>
            <p className="text-xs text-slate-500">{apiKey.createdBy}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'key',
      label: t('apiKeys.apiKey'),
      render: (_, apiKey) => (
        <div className="flex items-center gap-2">
          <code className="text-xs font-mono text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
            {maskKey(apiKey.key, visibleKeys.has(apiKey.id))}
          </code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleKeyVisibility(apiKey.id)}
            leftIcon={visibleKeys.has(apiKey.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          />
        </div>
      ),
    },
    {
      key: 'environment',
      label: t('apiKeys.environment'),
      sortable: true,
      render: (env) => (
        <Badge
          variant={
            env === 'production' ? 'danger' : env === 'staging' ? 'warning' : 'info'
          }
          pill
        >
          {t(`apiKeys.${env}`)}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      render: (status) => (
        <Badge variant={status === 'active' ? 'success' : 'default'} dot>
          {t(`apiKeys.${status}`)}
        </Badge>
      ),
    },
    {
      key: 'lastUsed',
      label: t('apiKeys.lastUsed'),
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
      render: (_, apiKey) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(apiKey.key);
              toast.success(t('apiKeys.keyCopied'));
            }}
            leftIcon={<Copy className="w-4 h-4" />}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRegenerate(apiKey)}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            disabled={apiKey.status === 'revoked'}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleRevoke(apiKey)}
            leftIcon={<Trash2 className="w-4 h-4 text-danger-600" />}
            disabled={apiKey.status === 'revoked'}
          />
        </div>
      ),
    },
  ];

  const handleRegenerate = async (apiKey: ApiKey) => {
    const newKey = `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    setApiKeys((prev) =>
      prev.map((k) => (k.id === apiKey.id ? { ...k, key: newKey } : k))
    );
    toast.success('API key regenerated successfully');
  };

  const handleRevoke = async (apiKey: ApiKey) => {
    if (confirm(t('apiKeys.confirmRevoke'))) {
      setApiKeys((prev) =>
        prev.map((k) => (k.id === apiKey.id ? { ...k, status: 'revoked' } : k))
      );
      toast.success(t('apiKeys.keyRevoked'));
    }
  };

  const handleAddKey = () => {
    const newKey: ApiKey = {
      id: `key-${Date.now()}`,
      name: formData.name,
      key: `sk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
      environment: formData.environment as any,
      status: 'active',
      createdBy: 'Current User',
      createdAt: new Date().toISOString(),
    };
    setApiKeys((prev) => [newKey, ...prev]);
    toast.success('API key created successfully');
    setIsAddModalOpen(false);
    setFormData({ name: '', environment: 'production' });
  };

  return (
    <>
      <Helmet>
        <title>{t('apiKeys.title')} - OneSign Admin Portal</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('apiKeys.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">{t('apiKeys.subtitle')}</p>
          </div>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            {t('apiKeys.addKey')}
          </Button>
        </motion.div>

        <Card>
          <DataTable columns={columns} data={apiKeys} loading={loading} searchable exportable />
        </Card>

        {/* Add Key Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setFormData({ name: '', environment: 'production' });
          }}
          title={t('apiKeys.addKey')}
        >
          <div className="space-y-4">
            <Input
              label={t('apiKeys.keyName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter API key name"
            />
            <Dropdown
              label={t('apiKeys.environment')}
              options={[
                { value: 'production', label: t('apiKeys.production') },
                { value: 'staging', label: t('apiKeys.staging') },
                { value: 'development', label: t('apiKeys.development') },
              ]}
              value={formData.environment}
              onChange={(value) => setFormData({ ...formData, environment: value })}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormData({ name: '', environment: 'production' });
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleAddKey}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default ApiKeysPage;
