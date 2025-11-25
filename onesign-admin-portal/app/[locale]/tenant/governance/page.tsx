'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';
import { governanceService } from '@/lib/api/services';
import Link from 'next/link';

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

export default function GovernanceOverviewPage() {
  const t = useTranslations();
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
  const [recentViolations, setRecentViolations] = useState<any[]>([]);

  useEffect(() => {
    const contextTenantId = getTenantId();
    setTenantIdState(contextTenantId || '11111111-1111-1111-1111-111111111111');
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
      // Fetch policies
      const policies = await governanceService.getPolicies(tenantId);
      const activePolicies = policies.filter((p: any) => p.isActive || p.status === 'Published');

      // Fetch campaigns
      const campaigns = await governanceService.getCampaigns(tenantId);
      const activeCampaigns = campaigns.filter(
        (c: any) => c.status === 'Active' || c.status === 'InProgress'
      );
      const completedCampaigns = campaigns.filter((c: any) => c.status === 'Completed');

      // Fetch violations
      const violations = await governanceService.getViolations(tenantId);
      const openViolations = violations.filter((v: any) => v.status !== 'Resolved');

      // Calculate compliance score
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
      setRecentViolations(violations.slice(0, 5));
    } catch (err: any) {
      console.error('Error fetching governance data:', err);
      setError('Failed to load governance data');
      // Mock data
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
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBg = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 70) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const governanceFeatures = [
    {
      title: 'Access Review Campaigns',
      description: 'Manage and track access review campaigns for users, groups, and roles',
      href: 'governance/campaigns',
      icon: '🎯',
      color: 'from-blue-500 to-blue-600',
      stats: `${stats.activeCampaigns} active`,
    },
    {
      title: 'Policy Management',
      description: 'Create, manage, and enforce governance policies',
      href: '/tenant/policies',
      icon: '📋',
      color: 'from-purple-500 to-purple-600',
      stats: `${stats.activePolicies} policies`,
    },
    {
      title: 'Compliance Reports',
      description: 'Generate and view compliance reports for various frameworks',
      href: '/tenant/reports',
      icon: '📊',
      color: 'from-green-500 to-green-600',
      stats: `${stats.complianceScore}% compliant`,
    },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading governance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Governance Overview
          </h1>
          <p className="text-gray-600 mt-2">
            Manage compliance, policies, and access review campaigns
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="governance/campaigns"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Campaign
          </Link>
          <Link
            href="/tenant/policies"
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            View Policies
          </Link>
        </div>
      </div>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
          {error} - Showing sample data
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={`rounded-lg shadow-md p-6 border-l-4 ${
          stats.complianceScore >= 90 ? 'border-green-500 bg-white' :
          stats.complianceScore >= 70 ? 'border-yellow-500 bg-white' :
          'border-red-500 bg-white'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Compliance Score</p>
              <p className={`text-3xl font-bold mt-2 ${getComplianceColor(stats.complianceScore)}`}>
                {stats.complianceScore}%
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.complianceScore >= 90 ? 'Excellent' : stats.complianceScore >= 70 ? 'Good' : 'Needs attention'}
              </p>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Campaigns</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activeCampaigns}</p>
              <p className="text-xs text-gray-500 mt-1">of {stats.totalCampaigns} total</p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Active Policies</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.activePolicies}</p>
              <p className="text-xs text-gray-500 mt-1">of {stats.totalPolicies} total</p>
            </div>
            <div className="text-4xl">📋</div>
          </div>
        </div>

        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
          stats.policyViolations > 10 ? 'border-red-500' : stats.policyViolations > 0 ? 'border-yellow-500' : 'border-green-500'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Policy Violations</p>
              <p className={`text-3xl font-bold mt-2 ${
                stats.policyViolations > 10 ? 'text-red-600' : stats.policyViolations > 0 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {stats.policyViolations}
              </p>
              <p className="text-xs text-gray-500 mt-1">Open violations</p>
            </div>
            <div className="text-4xl">⚠️</div>
          </div>
        </div>
      </div>

      {/* Governance Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {governanceFeatures.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
          >
            <div className={`h-2 bg-gradient-to-r ${feature.color}`}></div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{feature.icon}</div>
                <svg
                  className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm mb-4">{feature.description}</p>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r ${feature.color} text-white`}>
                {feature.stats}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Active Campaigns and Pending Reviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Campaigns */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Active Campaigns</h2>
            <Link href="governance/campaigns" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
              View All →
            </Link>
          </div>
          <div className="space-y-4">
            {recentCampaigns.length > 0 ? (
              recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">Due: {new Date(campaign.endDate).toLocaleDateString()}</div>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      campaign.status === 'Active' ? 'bg-blue-100 text-blue-800' :
                      campaign.status === 'InProgress' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${campaign.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600">{campaign.progress}%</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>No active campaigns</p>
                <Link href="governance/campaigns" className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block">
                  Create your first campaign →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Compliance Status */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Compliance Status</h2>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Score</span>
                <span className={`text-2xl font-bold ${getComplianceColor(stats.complianceScore)}`}>
                  {stats.complianceScore}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all ${
                    stats.complianceScore >= 90 ? 'bg-green-500' :
                    stats.complianceScore >= 70 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${stats.complianceScore}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-700 font-medium">Completed Reviews</div>
                <div className="text-2xl font-bold text-blue-900 mt-1">{stats.completedCampaigns}</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-700 font-medium">Pending Reviews</div>
                <div className="text-2xl font-bold text-purple-900 mt-1">{stats.pendingReviews}</div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Framework Coverage</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">SOC 2</span>
                  <span className="font-medium text-green-600">98%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">ISO 27001</span>
                  <span className="font-medium text-green-600">95%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">GDPR</span>
                  <span className="font-medium text-yellow-600">87%</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">HIPAA</span>
                  <span className="font-medium text-green-600">92%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Policy Status</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Active Policies</span>
              <span className="font-bold text-blue-900">{stats.activePolicies}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Draft Policies</span>
              <span className="font-bold text-blue-900">{stats.totalPolicies - stats.activePolicies}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-blue-700">Violations</span>
              <span className="font-bold text-blue-900">{stats.policyViolations}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-4">Campaign Activity</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-green-700">Active</span>
              <span className="font-bold text-green-900">{stats.activeCampaigns}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Completed</span>
              <span className="font-bold text-green-900">{stats.completedCampaigns}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-green-700">Total</span>
              <span className="font-bold text-green-900">{stats.totalCampaigns}</span>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-purple-900 mb-4">Next Steps</h3>
          <div className="space-y-2">
            <Link href="governance/campaigns" className="block text-purple-700 hover:text-purple-900 text-sm">
              → Review pending campaigns
            </Link>
            <Link href="/tenant/policies" className="block text-purple-700 hover:text-purple-900 text-sm">
              → Update policy rules
            </Link>
            <Link href="/tenant/reports" className="block text-purple-700 hover:text-purple-900 text-sm">
              → Generate compliance report
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
