'use client';

import { useState, useEffect } from 'react';
import { securityService } from '@/lib/api/services';

interface IPWhitelist {
  id: string;
  ipAddress: string;
  description: string;
  createdBy: string;
  createdAt: string;
  lastAccess: string;
  accessCount: number;
  isActive: boolean;
}

export default function IPWhitelistPage() {
  const [whitelist, setWhitelist] = useState<IPWhitelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newIP, setNewIP] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchWhitelist();
  }, []);

  const fetchWhitelist = async () => {
    setLoading(true);
    try {
      const data = await securityService.getIPWhitelist?.();
      const mockData: IPWhitelist[] = [
        {
          id: '1',
          ipAddress: '192.168.1.100',
          description: 'Office Network',
          createdBy: 'admin@example.com',
          createdAt: '2024-01-15T10:00:00Z',
          lastAccess: '2024-11-22T14:30:00Z',
          accessCount: 1523,
          isActive: true,
        },
        {
          id: '2',
          ipAddress: '10.0.0.0/24',
          description: 'VPN Range',
          createdBy: 'admin@example.com',
          createdAt: '2024-02-20T09:00:00Z',
          lastAccess: '2024-11-22T12:00:00Z',
          accessCount: 856,
          isActive: true,
        },
      ];
      setWhitelist(data || mockData);
    } catch (err: any) {
      console.error('Error fetching IP whitelist:', err);
      setWhitelist([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    // await securityService.addIPWhitelist(tenantId, { ipAddress: newIP, description });
    setShowAdd(false);
    setNewIP('');
    setDescription('');
    fetchWhitelist();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this IP from whitelist?')) return;
    // await securityService.removeIPWhitelist(tenantId, id);
    fetchWhitelist();
  };

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">IP Whitelist</h1>
          <p className="text-gray-600 mt-1">Manage allowed IP addresses</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Add IP
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP Address</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Access Count</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Access</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {whitelist.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-mono text-sm">{item.ipAddress}</td>
                <td className="px-6 py-4 text-sm">{item.description}</td>
                <td className="px-6 py-4 text-sm">{item.accessCount.toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">{new Date(item.lastAccess).toLocaleString()}</td>
                <td className="px-6 py-4 text-sm">
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Modal */}
      {showAdd && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Add IP to Whitelist</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">IP Address or Range</label>
                <input
                  type="text"
                  value={newIP}
                  onChange={(e) => setNewIP(e.target.value)}
                  placeholder="192.168.1.100 or 10.0.0.0/24"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Office Network"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowAdd(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
