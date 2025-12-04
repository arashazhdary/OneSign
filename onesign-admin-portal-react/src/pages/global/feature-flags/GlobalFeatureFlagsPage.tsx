import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from '@/components/common/Modal';
import DataTable, { Column } from '@/components/common/DataTable';
import { globalService } from '@/lib/api/services/global.service';
import { Helmet } from 'react-helmet-async';

type TargetAudience = 'all' | 'specific' | 'percentage';

interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description: string;
  enabled: boolean;
  targetAudience: TargetAudience;
  targetTenants?: string[];
  rolloutPercentage?: number;
  scheduledRollout?: {
    startDate: string;
    endDate?: string;
  };
  abTestConfig?: {
    variantA: string;
    variantB: string;
    splitPercentage: number;
  };
  createdAt: string;
  updatedAt: string;
}

interface FeatureFlagHistory {
  id: string;
  flagId: string;
  action: string;
  previousValue: string;
  newValue: string;
  performedBy: string;
  timestamp: string;
}

export default function GlobalFeatureFlagsPage() {
  const { t } = useTranslation();
  const [flags, setFlags] = useState<FeatureFlag[]>([]);
  const [history, setHistory] = useState<FeatureFlagHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<{ flag: FeatureFlag; newState: boolean } | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    key: '',
    description: '',
    enabled: false,
    targetAudience: 'all' as TargetAudience,
    targetTenants: '',
    rolloutPercentage: 100,
    enableSchedule: false,
    startDate: '',
    endDate: '',
    enableABTest: false,
    variantA: '',
    variantB: '',
    splitPercentage: 50
  });

  const fetchFlags = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await globalService.getFeatureFlags();
      setFlags(data || []);
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async (flagId: string) => {
    try {
      const data = await globalService.getFeatureFlagHistory(flagId);
      setHistory(data || []);
      setIsHistoryModalOpen(true);
    } catch (err: any) {
      setError(err.message || t('common.failedToFetchHistory'));
    }
  };

  const toggleFlag = async (flag: FeatureFlag, newState: boolean) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await globalService.toggleFeatureFlag(flag.id, newState);
      setSuccess(t('global.featureFlags.messages.flagToggled', { name: flag.name, state: newState ? t('common.enabled') : t('common.disabled') }));
      fetchFlags();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
      setConfirmToggle(null);
    }
  };

  const createFlag = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const payload: any = {
        name: formData.name,
        key: formData.key,
        description: formData.description,
        enabled: formData.enabled,
        targetAudience: formData.targetAudience
      };

      if (formData.targetAudience === 'specific') {
        payload.targetTenants = formData.targetTenants.split(',').map(t => t.trim());
      }
      if (formData.targetAudience === 'percentage') {
        payload.rolloutPercentage = formData.rolloutPercentage;
      }
      if (formData.enableSchedule) {
        payload.scheduledRollout = {
          startDate: formData.startDate,
          endDate: formData.endDate || undefined
        };
      }
      if (formData.enableABTest) {
        payload.abTestConfig = {
          variantA: formData.variantA,
          variantB: formData.variantB,
          splitPercentage: formData.splitPercentage
        };
      }

      await globalService.createFeatureFlag(payload);
      setSuccess(t('global.featureFlags.messages.created'));
      setIsCreateModalOpen(false);
      resetForm();
      fetchFlags();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const deleteFlag = async (flagId: string) => {
    if (!confirm(t('global.featureFlags.confirmDelete'))) return;

    setLoading(true);
    setError('');
    try {
      await globalService.deleteFeatureFlag(flagId);
      setSuccess(t('global.featureFlags.messages.deleted'));
      fetchFlags();
    } catch (err: any) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      key: '',
      description: '',
      enabled: false,
      targetAudience: 'all',
      targetTenants: '',
      rolloutPercentage: 100,
      enableSchedule: false,
      startDate: '',
      endDate: '',
      enableABTest: false,
      variantA: '',
      variantB: '',
      splitPercentage: 50
    });
  };

  useEffect(() => {
    fetchFlags();
  }, []);

  const flagColumns: Column<FeatureFlag>[] = [
    { key: 'name', label: t('common.name'), render: (flag) => <span className="font-semibold">{flag.name}</span> },
    { key: 'key', label: t('global.featureFlags.key'), render: (flag) => <code className="text-xs bg-gray-100 px-2 py-1 rounded">{flag.key}</code> },
    { key: 'description', label: t('common.description') },
    {
      key: 'enabled',
      label: t('common.status'),
      render: (flag) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setConfirmToggle({ flag, newState: !flag.enabled });
          }}
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            flag.enabled ? 'bg-green-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              flag.enabled ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      )
    },
    {
      key: 'targetAudience',
      label: t('global.featureFlags.target'),
      render: (flag) => {
        if (flag.targetAudience === 'all') return t('global.featureFlags.allUsers');
        if (flag.targetAudience === 'specific') return t('global.featureFlags.tenantCount', { count: flag.targetTenants?.length || 0 });
        return t('global.featureFlags.rolloutPercentage', { percentage: flag.rolloutPercentage });
      }
    }
  ];

  const historyColumns: Column<FeatureFlagHistory>[] = [
    { key: 'timestamp', label: t('common.timestamp'), render: (h) => new Date(h.timestamp).toLocaleString() },
    { key: 'action', label: t('common.action') },
    { key: 'performedBy', label: t('common.performedBy') },
    { key: 'previousValue', label: t('global.featureFlags.previous'), render: (h) => <code className="text-xs">{h.previousValue}</code> },
    { key: 'newValue', label: t('global.featureFlags.new'), render: (h) => <code className="text-xs">{h.newValue}</code> }
  ];

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t('global.featureFlags.title')}</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
        >
          {t('global.featureFlags.createButton')}
        </button>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
          {success}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">{t('global.featureFlags.totalFlags')}</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{flags.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">{t('global.featureFlags.enabled')}</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {flags.filter(f => f.enabled).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">{t('global.featureFlags.disabled')}</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">
            {flags.filter(f => !f.enabled).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-500">{t('global.featureFlags.abTests')}</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">
            {flags.filter(f => f.abTestConfig).length}
          </div>
        </div>
      </div>

      {/* Feature Flags Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <DataTable
          data={flags}
          columns={flagColumns}
          loading={loading}
          emptyMessage={t('global.featureFlags.noFlags')}
          actions={(flag) => (
            <div className="flex gap-2">
              <button
                onClick={() => fetchHistory(flag.id)}
                className="text-indigo-600 hover:text-indigo-900 font-medium"
              >
                {t('common.history')}
              </button>
              <button
                onClick={() => deleteFlag(flag.id)}
                className="text-red-600 hover:text-red-900 font-medium"
              >
                {t('common.delete')}
              </button>
            </div>
          )}
        />
      </div>

      {/* Confirm Toggle Modal */}
      {confirmToggle && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmToggle(null)}
          title={t('common.confirmAction')}
          size="sm"
          footer={
            <>
              <button
                onClick={() => setConfirmToggle(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={() => toggleFlag(confirmToggle.flag, confirmToggle.newState)}
                className={`px-4 py-2 rounded-lg text-white ${
                  confirmToggle.newState ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {confirmToggle.newState ? t('common.enable') : t('common.disable')}
              </button>
            </>
          }
        >
          <p>
            {t('global.featureFlags.confirmToggle', {
              action: confirmToggle.newState ? t('common.enable') : t('common.disable'),
              name: confirmToggle.flag.name
            })}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {t('global.featureFlags.toggleWarning', {
              audience: confirmToggle.flag.targetAudience === 'all' ? t('global.featureFlags.allUsers') : t('global.featureFlags.targetedUsers')
            })}
          </p>
        </Modal>
      )}

      {/* Create Feature Flag Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetForm();
        }}
        title={`${t('common.create')} ${t('common.featureFlag')}`}
        size="xl"
        footer={
          <>
            <button
              onClick={() => {
                setIsCreateModalOpen(false);
                resetForm();
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              {t('common.cancel')}
            </button>
            <button
              onClick={createFlag}
              disabled={!formData.name || !formData.key || loading}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {t('global.featureFlags.createFlag')}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.name')} *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t('global.featureFlags.key')} *</label>
              <input
                type="text"
                value={formData.key}
                onChange={(e) => setFormData({ ...formData, key: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('common.description')}</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.enabled}
                onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">{t('global.featureFlags.enableImmediately')}</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">{t('global.featureFlags.targetAudience')}</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.targetAudience === 'all'}
                  onChange={() => setFormData({ ...formData, targetAudience: 'all' })}
                  className="mr-2"
                />
                <span>{t('global.featureFlags.allUsers')}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.targetAudience === 'specific'}
                  onChange={() => setFormData({ ...formData, targetAudience: 'specific' })}
                  className="mr-2"
                />
                <span>{t('global.featureFlags.specificTenants')}</span>
              </label>
              {formData.targetAudience === 'specific' && (
                <input
                  type="text"
                  value={formData.targetTenants}
                  onChange={(e) => setFormData({ ...formData, targetTenants: e.target.value })}
                  placeholder={t('global.featureFlags.tenantIdsPlaceholder')}
                  className="w-full ml-6 px-3 py-2 border border-gray-300 rounded-lg"
                />
              )}
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={formData.targetAudience === 'percentage'}
                  onChange={() => setFormData({ ...formData, targetAudience: 'percentage' })}
                  className="mr-2"
                />
                <span>{t('global.featureFlags.percentageRollout')}</span>
              </label>
              {formData.targetAudience === 'percentage' && (
                <div className="ml-6">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.rolloutPercentage}
                    onChange={(e) => setFormData({ ...formData, rolloutPercentage: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 mt-1">{formData.rolloutPercentage}%</div>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.enableSchedule}
                onChange={(e) => setFormData({ ...formData, enableSchedule: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">{t('global.featureFlags.scheduleRollout')}</span>
            </label>
            {formData.enableSchedule && (
              <div className="grid grid-cols-2 gap-4 ml-6">
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t('global.featureFlags.startDate')}</label>
                  <input
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t('global.featureFlags.endDateOptional')}</label>
                  <input
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={formData.enableABTest}
                onChange={(e) => setFormData({ ...formData, enableABTest: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm font-medium text-gray-700">{t('global.featureFlags.enableABTesting')}</span>
            </label>
            {formData.enableABTest && (
              <div className="space-y-3 ml-6">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.variantA}
                    onChange={(e) => setFormData({ ...formData, variantA: e.target.value })}
                    placeholder={t('global.featureFlags.variantA')}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={formData.variantB}
                    onChange={(e) => setFormData({ ...formData, variantB: e.target.value })}
                    placeholder={t('global.featureFlags.variantB')}
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-600 mb-1">{t('global.featureFlags.splitPercentage')}</label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.splitPercentage}
                    onChange={(e) => setFormData({ ...formData, splitPercentage: parseInt(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-sm text-gray-600 mt-1">
                    A: {formData.splitPercentage}% / B: {100 - formData.splitPercentage}%
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        title={t('global.featureFlags.historyTitle')}
        size="xl"
      >
        <DataTable
          data={history}
          columns={historyColumns}
          emptyMessage={t('global.featureFlags.noHistory')}
        />
      </Modal>
    </div>
  );
}
