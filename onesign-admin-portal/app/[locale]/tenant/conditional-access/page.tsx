'use client';

import { useState, useEffect } from 'react';
import { securityService } from '@/lib/api/services';

interface ConditionalAccessPolicy {
  id: string;
  name: string;
  description: string;
  conditions: {
    locations?: string[];
    devices?: string[];
    riskLevel?: string;
    timeRange?: string;
  };
  action: 'allow' | 'deny' | 'mfa_required';
  priority: number;
  isEnabled: boolean;
  createdAt: string;
}

export default function ConditionalAccessPage() {
  const [policies, setPolicies] = useState<ConditionalAccessPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      // Mock data
      setPolicies([
        {
          id: '1',
          name: 'Block High Risk Locations',
          description: 'Block access from high-risk countries',
          conditions: {
            locations: ['North Korea', 'Iran'],
            riskLevel: 'high',
          },
          action: 'deny',
          priority: 1,
          isEnabled: true,
          createdAt: '2024-01-15T00:00:00Z',
        },
        {
          id: '2',
          name: 'Require MFA for External Access',
          description: 'Require MFA when accessing from outside office',
          conditions: {
            locations: ['External'],
            devices: ['Mobile', 'Unknown'],
          },
          action: 'mfa_required',
          priority: 2,
          isEnabled: true,
          createdAt: '2024-02-20T00:00:00Z',
        },
      ]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getActionBadge = (action: string) => {
    const colors = {
      allow: 'bg-green-100 text-green-800',
      deny: 'bg-red-100 text-red-800',
      mfa_required: 'bg-yellow-100 text-yellow-800',
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100';
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Conditional Access Policies</h1>
          <p className="text-gray-600 mt-1">Control access based on conditions</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Create Policy
        </button>
      </div>

      {/* Policies List */}
      <div className="space-y-4">
        {policies.map((policy) => (
          <div key={policy.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold">{policy.name}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getActionBadge(policy.action)}`}>
                    {policy.action.replace('_', ' ')}
                  </span>
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    Priority: {policy.priority}
                  </span>
                </div>
                <p className="text-gray-600 mt-1">{policy.description}</p>

                <div className="mt-4 space-y-2">
                  {policy.conditions.locations && (
                    <div className="flex items-start">
                      <span className="text-sm font-medium text-gray-500 w-32">Locations:</span>
                      <span className="text-sm">{policy.conditions.locations.join(', ')}</span>
                    </div>
                  )}
                  {policy.conditions.devices && (
                    <div className="flex items-start">
                      <span className="text-sm font-medium text-gray-500 w-32">Devices:</span>
                      <span className="text-sm">{policy.conditions.devices.join(', ')}</span>
                    </div>
                  )}
                  {policy.conditions.riskLevel && (
                    <div className="flex items-start">
                      <span className="text-sm font-medium text-gray-500 w-32">Risk Level:</span>
                      <span className="text-sm">{policy.conditions.riskLevel}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={policy.isEnabled}
                    onChange={() => {}}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
