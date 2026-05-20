import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { globalService } from '@/lib/api/services/global.service';

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'Monthly' | 'Yearly';
  features: string[];
  maxUsers: number;
  maxApps: number;
  isActive: boolean;
  createdAt: string;
}

interface TenantSubscription {
  id: string;
  tenantId: string;
  tenantName: string;
  planId: string;
  planName: string;
  status: 'Active' | 'Suspended' | 'Cancelled' | 'Trial';
  startDate: string;
  endDate: string;
  monthlyRevenue: number;
  currency: string;
}

interface UsageData {
  tenantId: string;
  tenantName: string;
  userCount: number;
  appCount: number;
  apiCalls: number;
  storageGB: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  subscriptions: number;
  newSubscriptions: number;
  churnedSubscriptions: number;
}

interface Invoice {
  id: string;
  tenantId: string;
  tenantName: string;
  amount: number;
  currency: string;
  status: 'Pending' | 'Paid' | 'Overdue' | 'Cancelled';
  dueDate: string;
  paidDate?: string;
}

export default function GlobalBillingPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<'plans' | 'subscriptions' | 'usage' | 'invoices'>('plans');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Plans State
  const [plans, setPlans] = useState<Plan[]>([]);
  const [showCreatePlanModal, setShowCreatePlanModal] = useState(false);
  const [showEditPlanModal, setShowEditPlanModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [planName, setPlanName] = useState('');
  const [planDescription, setPlanDescription] = useState('');
  const [planPrice, setPlanPrice] = useState('');
  const [planCurrency, setPlanCurrency] = useState('USD');
  const [planBillingCycle, setPlanBillingCycle] = useState<'Monthly' | 'Yearly'>('Monthly');
  const [planMaxUsers, setPlanMaxUsers] = useState('');
  const [planMaxApps, setPlanMaxApps] = useState('');

  // Subscriptions State
  const [subscriptions, setSubscriptions] = useState<TenantSubscription[]>([]);
  const [showAssignSubscriptionModal, setShowAssignSubscriptionModal] = useState(false);
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');

  // Usage & Revenue State
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);

  // Invoices State
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    fetchPlans();
    fetchSubscriptions();
    fetchUsageData();
    fetchRevenueData();
    fetchInvoices();
  }, []);

  const fetchPlans = async () => {
    try {
      // GET /api/global/billing/plans
      const data = (await globalService.getBillingPlans()) as any;
      setPlans(Array.isArray(data) ? data : data?.plans || []);
    } catch (err) {
      console.error('Error fetching plans:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscriptions = async () => {
    try {
      // GET /api/global/billing/tenants
      const data = (await globalService.getTenantsBillingStatus()) as any;
      setSubscriptions(Array.isArray(data) ? data : data?.subscriptions || []);
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    }
  };

  const fetchUsageData = async () => {
    try {
      // GET /api/global/insights/usage (usage stats)
      const data = await globalService.getUsageStats();
      setUsageData(data);
    } catch (err) {
      console.error('Error fetching usage data:', err);
    }
  };

  const fetchRevenueData = async () => {
    try {
      // GET /api/global/insights/growth (revenue/growth stats)
      const data = await globalService.getGrowthStats();
      setRevenueData(data);
    } catch (err) {
      console.error('Error fetching revenue data:', err);
    }
  };

  const fetchInvoices = async () => {
    try {
      // Note: Global invoices endpoint not in spec, using tenants billing status as fallback
      const data = await globalService.getTenantsBillingStatus();
      setInvoices(data);
    } catch (err) {
      console.error('Error fetching invoices:', err);
    }
  };

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // POST /api/global/billing/plans
      await globalService.createBillingPlan({
        name: planName,
        description: planDescription,
        price: parseFloat(planPrice),
        currency: planCurrency
      });
      setSuccess(t('global.billing.planCreated'));
      setShowCreatePlanModal(false);
      resetPlanForm();
      fetchPlans();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
      console.error('Error creating plan:', err);
    }
  };

  const handleUpdatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) return;
    setError('');
    setSuccess('');

    try {
      // PUT /api/global/billing/plans/{id}
      await globalService.updateBillingPlan(selectedPlan.id, {
        name: planName,
        description: planDescription,
        price: parseFloat(planPrice),
        currency: planCurrency
      });
      setSuccess(t('global.billing.planUpdated'));
      setShowEditPlanModal(false);
      resetPlanForm();
      fetchPlans();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
      console.error('Error updating plan:', err);
    }
  };

  const handleAssignSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      // Note: assignSubscriptionToTenant not in spec - using tenant update
      await globalService.updateTenant(selectedTenantId, { plan: selectedPlanId });
      setSuccess(t('global.billing.subscriptionAssigned'));
      setShowAssignSubscriptionModal(false);
      setSelectedTenantId('');
      setSelectedPlanId('');
      fetchSubscriptions();
    } catch (err: any) {
      setError(err?.message || t('common.error'));
      console.error('Error assigning subscription:', err);
    }
  };

  const handleGenerateInvoice = async (tenantId: string) => {
    setError('');
    setSuccess('');

    try {
      setError(t('global.billing.invoiceNotAvailable') || 'Invoice generation is not available yet');
    } catch (err: any) {
      setError(err?.message || t('common.error'));
      console.error('Error generating invoice:', err);
    }
  };

  const resetPlanForm = () => {
    setPlanName('');
    setPlanDescription('');
    setPlanPrice('');
    setPlanCurrency('USD');
    setPlanBillingCycle('Monthly');
    setPlanMaxUsers('');
    setPlanMaxApps('');
    setSelectedPlan(null);
  };

  const openEditPlanModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setPlanName(plan.name);
    setPlanDescription(plan.description);
    setPlanPrice(plan.price.toString());
    setPlanCurrency(plan.currency);
    setPlanBillingCycle(plan.billingCycle);
    setPlanMaxUsers(plan.maxUsers.toString());
    setPlanMaxApps(plan.maxApps.toString());
    setShowEditPlanModal(true);
  };

  // Column Definitions
  const planColumns: Column<Plan>[] = [
    {
      key: 'name',
      label: t('global.billing.planName'),
      render: (plan) => (
        <div>
          <div className="font-medium">{plan.name}</div>
          <div className="text-xs text-gray-500">{plan.description}</div>
        </div>
      )
    },
    {
      key: 'price',
      label: t('global.billing.price'),
      render: (plan) => (
        <div className="font-semibold">
          {plan.currency} {plan.price.toFixed(2)}
          <span className="text-xs text-gray-500 ml-1">/ {plan.billingCycle}</span>
        </div>
      )
    },
    {
      key: 'maxUsers',
      label: t('global.billing.limits'),
      render: (plan) => (
        <div className="text-sm">
          <div>{plan.maxUsers} users</div>
          <div className="text-gray-500">{plan.maxApps} apps</div>
        </div>
      )
    },
    {
      key: 'isActive',
      label: t('global.billing.status'),
      render: (plan) => (
        <StatusBadge
          status={plan.isActive ? 'Active' : 'Inactive'}
        />
      )
    }
  ];

  const subscriptionColumns: Column<TenantSubscription>[] = [
    {
      key: 'tenantName',
      label: t('global.billing.tenant')
    },
    {
      key: 'planName',
      label: t('global.billing.plan')
    },
    {
      key: 'status',
      label: t('global.billing.status'),
      render: (sub) => {
        return <StatusBadge status={sub.status} />;
      }
    },
    {
      key: 'monthlyRevenue',
      label: t('global.billing.monthlyRevenue'),
      render: (sub) => `${sub.currency} ${sub.monthlyRevenue.toFixed(2)}`
    },
    {
      key: 'endDate',
      label: t('global.billing.endDate'),
      render: (sub) => new Date(sub.endDate).toLocaleDateString()
    }
  ];

  const usageColumns: Column<UsageData>[] = [
    {
      key: 'tenantName',
      label: t('global.billing.tenant')
    },
    {
      key: 'userCount',
      label: t('global.billing.users')
    },
    {
      key: 'appCount',
      label: t('global.billing.apps')
    },
    {
      key: 'apiCalls',
      label: t('global.billing.apiCalls'),
      render: (usage) => usage.apiCalls.toLocaleString()
    },
    {
      key: 'storageGB',
      label: t('global.billing.storage'),
      render: (usage) => `${usage.storageGB.toFixed(2)} GB`
    }
  ];

  const invoiceColumns: Column<Invoice>[] = [
    {
      key: 'tenantName',
      label: t('global.billing.tenant')
    },
    {
      key: 'amount',
      label: t('global.billing.amount'),
      render: (invoice) => `${invoice.currency} ${invoice.amount.toFixed(2)}`
    },
    {
      key: 'status',
      label: t('global.billing.status'),
      render: (invoice) => {
        const colors: Record<string, 'yellow' | 'green' | 'red' | 'gray'> = {
          Pending: 'yellow',
          Paid: 'green',
          Overdue: 'red',
          Cancelled: 'gray'
        };
        return <StatusBadge status={invoice.status} />;
      }
    },
    {
      key: 'dueDate',
      label: t('global.billing.dueDate'),
      render: (invoice) => new Date(invoice.dueDate).toLocaleDateString()
    },
    {
      key: 'paidDate',
      label: t('global.billing.paidDate'),
      render: (invoice) => invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '-'
    }
  ];

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
          {t('global.billing.title')}
        </h1>
        <p className="text-gray-600 mt-2">{t('global.billing.subtitle')}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90">{t('global.billing.totalRevenue')}</div>
          <div className="text-3xl font-bold">
            ${revenueData.reduce((sum, r) => sum + r.revenue, 0).toLocaleString()}
          </div>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90">{t('global.billing.activeSubscriptions')}</div>
          <div className="text-3xl font-bold">
            {subscriptions.filter(s => s.status === 'Active').length}
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90">{t('global.billing.totalPlans')}</div>
          <div className="text-3xl font-bold">{plans.length}</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
          <div className="text-sm opacity-90">{t('global.billing.pendingInvoices')}</div>
          <div className="text-3xl font-bold">
            {invoices.filter(i => i.status === 'Pending' || i.status === 'Overdue').length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('plans')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'plans'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {t('global.billing.plansTab')}
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'subscriptions'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {t('global.billing.subscriptionsTab')}
        </button>
        <button
          onClick={() => setActiveTab('usage')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'usage'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {t('global.billing.usageTab')}
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-6 py-3 font-medium ${
            activeTab === 'invoices'
              ? 'border-b-2 border-blue-600 text-blue-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          {t('global.billing.invoicesTab')}
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

      {/* Plans Tab */}
      {activeTab === 'plans' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('global.billing.managePlans')}</h2>
            <button
              onClick={() => setShowCreatePlanModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {t('global.billing.createPlan')}
            </button>
          </div>
          <DataTable
            data={plans}
            columns={planColumns}
            actions={(plan) => (
              <button
                onClick={() => openEditPlanModal(plan)}
                className="text-blue-600 hover:text-blue-800"
              >
                {t('common.edit')}
              </button>
            )}
          />
        </div>
      )}

      {/* Subscriptions Tab */}
      {activeTab === 'subscriptions' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">{t('global.billing.tenantSubscriptions')}</h2>
            <button
              onClick={() => setShowAssignSubscriptionModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {t('global.billing.assignSubscription')}
            </button>
          </div>
          <DataTable data={subscriptions} columns={subscriptionColumns} />
        </div>
      )}

      {/* Usage & Revenue Tab */}
      {activeTab === 'usage' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">{t('global.billing.revenueOverview')}</h2>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('global.billing.month')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('global.billing.revenue')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('global.billing.subscriptions')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('global.billing.newSubscriptions')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      {t('global.billing.churned')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {revenueData.map((data, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{data.month}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                        ${data.revenue.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{data.subscriptions}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                        +{data.newSubscriptions}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        -{data.churnedSubscriptions}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">{t('global.billing.usageByTenant')}</h2>
            <DataTable data={usageData} columns={usageColumns} />
          </div>
        </div>
      )}

      {/* Invoices Tab */}
      {activeTab === 'invoices' && (
        <div>
          <h2 className="text-xl font-semibold mb-4">{t('global.billing.invoiceManagement')}</h2>
          <DataTable
            data={invoices}
            columns={invoiceColumns}
            actions={(invoice) => (
              <div className="flex gap-2">
                {invoice.status === 'Pending' && (
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    {t('global.billing.markPaid')}
                  </button>
                )}
                <button className="text-green-600 hover:text-green-800 text-sm">
                  {t('global.billing.download')}
                </button>
              </div>
            )}
          />
        </div>
      )}

      {/* Create Plan Modal */}
      <Modal
        isOpen={showCreatePlanModal}
        onClose={() => {
          setShowCreatePlanModal(false);
          resetPlanForm();
          setError('');
        }}
        title={t('global.billing.createPlan')}
        size="lg"
      >
        <form onSubmit={handleCreatePlan} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('global.billing.planName')}</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('global.billing.description')}</label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border rounded"
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('global.billing.price')}</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border rounded"
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('global.billing.currency')}</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={planCurrency}
                onChange={(e) => setPlanCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('global.billing.billingCycle')}</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={planBillingCycle}
                onChange={(e) => setPlanBillingCycle(e.target.value as any)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('global.billing.maxUsers')}</label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border rounded"
                value={planMaxUsers}
                onChange={(e) => setPlanMaxUsers(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('global.billing.maxApps')}</label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border rounded"
                value={planMaxApps}
                onChange={(e) => setPlanMaxApps(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setShowCreatePlanModal(false);
                resetPlanForm();
                setError('');
              }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('common.create')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Plan Modal */}
      <Modal
        isOpen={showEditPlanModal}
        onClose={() => {
          setShowEditPlanModal(false);
          resetPlanForm();
          setError('');
        }}
        title={t('global.billing.editPlan')}
        size="lg"
      >
        <form onSubmit={handleUpdatePlan} className="space-y-4">
          {/* Same form fields as create modal */}
          <div>
            <label className="block text-sm font-medium mb-2">{t('global.billing.planName')}</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('global.billing.description')}</label>
            <textarea
              required
              rows={3}
              className="w-full px-3 py-2 border rounded"
              value={planDescription}
              onChange={(e) => setPlanDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('global.billing.price')}</label>
              <input
                type="number"
                step="0.01"
                required
                className="w-full px-3 py-2 border rounded"
                value={planPrice}
                onChange={(e) => setPlanPrice(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('global.billing.currency')}</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={planCurrency}
                onChange={(e) => setPlanCurrency(e.target.value)}
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('global.billing.billingCycle')}</label>
              <select
                className="w-full px-3 py-2 border rounded"
                value={planBillingCycle}
                onChange={(e) => setPlanBillingCycle(e.target.value as any)}
              >
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t('global.billing.maxUsers')}</label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border rounded"
                value={planMaxUsers}
                onChange={(e) => setPlanMaxUsers(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('global.billing.maxApps')}</label>
              <input
                type="number"
                required
                className="w-full px-3 py-2 border rounded"
                value={planMaxApps}
                onChange={(e) => setPlanMaxApps(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setShowEditPlanModal(false);
                resetPlanForm();
                setError('');
              }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('common.save')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Assign Subscription Modal */}
      <Modal
        isOpen={showAssignSubscriptionModal}
        onClose={() => {
          setShowAssignSubscriptionModal(false);
          setSelectedTenantId('');
          setSelectedPlanId('');
          setError('');
        }}
        title={t('global.billing.assignSubscription')}
      >
        <form onSubmit={handleAssignSubscription} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">{t('global.billing.tenantId')}</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded"
              value={selectedTenantId}
              onChange={(e) => setSelectedTenantId(e.target.value)}
              placeholder="tenant-id"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">{t('global.billing.selectPlan')}</label>
            <select
              required
              className="w-full px-3 py-2 border rounded"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
            >
              <option value="">{t('global.billing.choosePlan')}</option>
              {plans.filter(p => p.isActive).map(plan => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - {plan.currency} {plan.price}/{plan.billingCycle}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end pt-4">
            <button
              type="button"
              onClick={() => {
                setShowAssignSubscriptionModal(false);
                setSelectedTenantId('');
                setSelectedPlanId('');
                setError('');
              }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {t('global.billing.assign')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
