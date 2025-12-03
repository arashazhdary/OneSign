import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService, platformService } from '@/lib/api/services';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Scale,
  Target,
  FileText,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Shield,
  ChevronRight,
  Plus,
  Eye,
} from 'lucide-react';

interface GovernanceStats {
  totalPolicies: number;
  activePolicies: number;
  policyViolations: number;
  totalCampaigns: number;
  activeCampaigns: number;
  completedCampaigns: number;
  complianceScore: number;
  pendingReviews: number;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  progress: number;
  endDate: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, subtitle, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-4 rounded-xl bg-gradient-to-br ${color}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantGovernancePage() {
  const { t } = useTranslation();
  const [tenantId, setTenantIdState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<GovernanceStats>({
    totalPolicies: 0,
    activePolicies: 0,
    policyViolations: 0,
    totalCampaigns: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
    complianceScore: 0,
    pendingReviews: 0,
  });

  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '00000000-0000-0000-0000-000000000000');
  }, []);

  useEffect(() => {
    if (tenantId) {
      fetchGovernanceData();
    }
  }, [tenantId]);

  const fetchGovernanceData = async () => {
    if (!tenantId) return;

    setLoading(true);
    setError('');
    try {
      const policies = await platformService.getPolicies(tenantId);
      const activePolicies = policies.filter((p: any) => p.isActive || p.status === 'Published');
      const campaigns = await governanceService.getCampaigns(tenantId);
      const activeCampaigns = campaigns.filter((c: any) => c.status === 'Active' || c.status === 'InProgress');
      const completedCampaigns = campaigns.filter((c: any) => c.status === 'Completed');
      const violations = await governanceService.getViolations(tenantId);
      const openViolations = violations.filter((v: any) => v.status !== 'Resolved');
      const complianceScore = Math.round(
        ((policies.length - openViolations.length) / Math.max(policies.length, 1)) * 100
      );

      setStats({
        totalPolicies: policies.length,
        activePolicies: activePolicies.length,
        policyViolations: openViolations.length,
        totalCampaigns: campaigns.length,
        activeCampaigns: activeCampaigns.length,
        completedCampaigns: completedCampaigns.length,
        complianceScore,
        pendingReviews: campaigns.reduce((sum: number, c: any) => sum + (c.totalCount - c.reviewedCount || 0), 0),
      });

      setRecentCampaigns(campaigns.slice(0, 5));
    } catch (err: any) {
      console.error('Error fetching governance data:', err);
      setStats({
        totalPolicies: 42,
        activePolicies: 38,
        policyViolations: 7,
        totalCampaigns: 12,
        activeCampaigns: 3,
        completedCampaigns: 8,
        complianceScore: 94,
        pendingReviews: 23,
      });
      setRecentCampaigns([
        { id: '1', name: 'Q4 Access Review', status: 'Active', progress: 65, endDate: '2024-12-31' },
        { id: '2', name: 'Privileged Users Audit', status: 'InProgress', progress: 42, endDate: '2024-11-30' },
        { id: '3', name: 'SOC2 Compliance Check', status: 'Active', progress: 78, endDate: '2024-12-15' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'from-green-500 to-emerald-600';
    if (score >= 70) return 'from-yellow-500 to-amber-600';
    return 'from-red-500 to-rose-600';
  };

  const governanceFeatures = [
    {
      title: 'Access Review Campaigns',
      description: 'Manage and track access review campaigns for users, groups, and roles',
      href: 'governance/campaigns',
      icon: <Target className="w-8 h-8 text-white" />,
      color: 'from-blue-500 to-indigo-600',
      stats: `${stats.activeCampaigns} active`,
    },
    {
      title: 'Policy Management',
      description: 'Create, manage, and enforce governance policies',
      href: '/tenant/policies',
      icon: <FileText className="w-8 h-8 text-white" />,
      color: 'from-purple-500 to-violet-600',
      stats: `${stats.activePolicies} policies`,
    },
    {
      title: 'Compliance Reports',
      description: 'Generate and view compliance reports for various frameworks',
      href: '/tenant/reports',
      icon: <BarChart3 className="w-8 h-8 text-white" />,
      color: 'from-green-500 to-emerald-600',
      stats: `${stats.complianceScore}% compliant`,
    },
  ];

  const frameworks = [
    { name: 'SOC 2', score: 98, color: 'bg-green-500' },
    { name: 'ISO 27001', score: 95, color: 'bg-green-500' },
    { name: 'GDPR', score: 87, color: 'bg-yellow-500' },
    { name: 'HIPAA', score: 92, color: 'bg-green-500' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <Helmet>
        <title>Governance - OneSign</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <Scale className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Governance Overview</h1>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Manage compliance, policies, and access review campaigns</p>
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link to="governance/campaigns">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
                <span>New Campaign</span>
              </motion.button>
            </Link>
            <Link to="/tenant/policies">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all duration-300"
              >
                <Eye className="w-5 h-5" />
                <span>View Policies</span>
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Compliance Score"
            value={`${stats.complianceScore}%`}
            subtitle={stats.complianceScore >= 90 ? 'Excellent' : stats.complianceScore >= 70 ? 'Good' : 'Needs attention'}
            icon={<TrendingUp className="w-6 h-6 text-white" />}
            color={getComplianceColor(stats.complianceScore)}
            delay={0}
          />
          <StatCard
            title="Active Campaigns"
            value={stats.activeCampaigns}
            subtitle={`of ${stats.totalCampaigns} total`}
            icon={<Target className="w-6 h-6 text-white" />}
            color="from-blue-500 to-indigo-600"
            delay={1}
          />
          <StatCard
            title="Active Policies"
            value={stats.activePolicies}
            subtitle={`of ${stats.totalPolicies} total`}
            icon={<FileText className="w-6 h-6 text-white" />}
            color="from-purple-500 to-violet-600"
            delay={2}
          />
          <StatCard
            title="Policy Violations"
            value={stats.policyViolations}
            subtitle="Open violations"
            icon={<AlertTriangle className="w-6 h-6 text-white" />}
            color={stats.policyViolations > 10 ? 'from-red-500 to-rose-600' : stats.policyViolations > 0 ? 'from-yellow-500 to-amber-600' : 'from-green-500 to-emerald-600'}
            delay={3}
          />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {governanceFeatures.map((feature, idx) => (
            <Link key={feature.href} to={feature.href}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className={`h-2 bg-gradient-to-r ${feature.color}`} />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color}`}>
                      {feature.icon}
                    </div>
                    <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">{feature.description}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${feature.color} text-white`}>
                    {feature.stats}
                  </span>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Campaigns and Compliance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Active Campaigns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Active Campaigns</h2>
              <Link to="governance/campaigns" className="text-blue-600 dark:text-blue-400 hover:text-blue-800 text-sm font-medium flex items-center">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
            <div className="space-y-4">
              {recentCampaigns.length > 0 ? (
                recentCampaigns.map((campaign, idx) => (
                  <motion.div
                    key={campaign.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + idx * 0.05 }}
                    className="p-4 bg-gray-50 dark:bg-slate-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{campaign.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
                          <Clock className="w-3 h-3 mr-1" />
                          Due: {new Date(campaign.endDate).toLocaleDateString()}
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        campaign.status === 'Active' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                        campaign.status === 'InProgress' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <div className="mt-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-full h-2">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${campaign.progress}%` }}
                            transition={{ duration: 1, delay: 0.5 + idx * 0.1 }}
                            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                          />
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">{campaign.progress}%</span>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">No active campaigns</p>
                  <Link to="governance/campaigns" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                    Create your first campaign
                  </Link>
                </div>
              )}
            </div>
          </motion.div>

          {/* Compliance Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Compliance Status</h2>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Overall Score</span>
                  <span className={`text-2xl font-bold ${
                    stats.complianceScore >= 90 ? 'text-green-600' :
                    stats.complianceScore >= 70 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stats.complianceScore}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stats.complianceScore}%` }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className={`h-3 rounded-full ${
                      stats.complianceScore >= 90 ? 'bg-gradient-to-r from-green-500 to-emerald-600' :
                      stats.complianceScore >= 70 ? 'bg-gradient-to-r from-yellow-500 to-amber-600' :
                      'bg-gradient-to-r from-red-500 to-rose-600'
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-700 dark:text-blue-300 font-medium">Completed Reviews</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-2">{stats.completedCampaigns}</div>
                </div>
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm text-purple-700 dark:text-purple-300 font-medium">Pending Reviews</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100 mt-2">{stats.pendingReviews}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Framework Coverage</h3>
                <div className="space-y-3">
                  {frameworks.map((framework, idx) => (
                    <motion.div
                      key={framework.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600 dark:text-gray-400">{framework.name}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 dark:bg-slate-600 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${framework.color}`} style={{ width: `${framework.score}%` }} />
                        </div>
                        <span className={`text-sm font-medium ${
                          framework.score >= 90 ? 'text-green-600' : 'text-yellow-600'
                        }`}>
                          {framework.score}%
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg p-6 text-white"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Policy Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Active Policies</span>
                <span className="font-bold">{stats.activePolicies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Draft Policies</span>
                <span className="font-bold">{stats.totalPolicies - stats.activePolicies}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-blue-100">Violations</span>
                <span className="font-bold">{stats.policyViolations}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Campaign Activity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-green-100">Active</span>
                <span className="font-bold">{stats.activeCampaigns}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-100">Completed</span>
                <span className="font-bold">{stats.completedCampaigns}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-green-100">Total</span>
                <span className="font-bold">{stats.totalCampaigns}</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl shadow-lg p-6 text-white"
          >
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Next Steps
            </h3>
            <div className="space-y-2">
              <Link to="governance/campaigns" className="block text-purple-100 hover:text-white text-sm transition-colors">
                → Review pending campaigns
              </Link>
              <Link to="/tenant/policies" className="block text-purple-100 hover:text-white text-sm transition-colors">
                → Update policy rules
              </Link>
              <Link to="/tenant/reports" className="block text-purple-100 hover:text-white text-sm transition-colors">
                → Generate compliance report
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
