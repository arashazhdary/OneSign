import { useState, useEffect } from 'react';
import { globalService } from '@/lib/api/services/global.service';
import { Helmet } from 'react-helmet-async';

interface MaintenanceWindow {
  id: string;
  title: string;
  description: string;
  type: 'scheduled' | 'emergency' | 'planned';
  status: 'upcoming' | 'in_progress' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  duration: number;
  affectedServices: string[];
  impactLevel: 'none' | 'low' | 'medium' | 'high';
  notifyUsers: boolean;
  notificationSent: boolean;
  createdBy: string;
  createdAt: string;
  notes: string;
  recurring: boolean;
  recurrencePattern?: string;
}

export default function GlobalMaintenancePage() {
  const [windows, setWindows] = useState<MaintenanceWindow[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history' | 'calendar'>('upcoming');
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    fetchWindows();
  }, []);

  const fetchWindows = async () => {
    try {
      const data = await globalService.getMaintenanceWindows?.();
      const mockData: MaintenanceWindow[] = [
        {
          id: '1',
          title: 'Database Upgrade',
          description: 'Upgrading PostgreSQL to version 15 for improved performance',
          type: 'scheduled',
          status: 'upcoming',
          startTime: '2024-11-25T02:00:00Z',
          endTime: '2024-11-25T04:00:00Z',
          duration: 120,
          affectedServices: ['API', 'Database', 'Admin Portal'],
          impactLevel: 'high',
          notifyUsers: true,
          notificationSent: true,
          createdBy: 'admin@example.com',
          createdAt: '2024-11-20T10:00:00Z',
          notes: 'Users will experience service interruption during this window',
          recurring: false,
        },
        {
          id: '2',
          title: 'Security Patches',
          description: 'Applying critical security patches to all servers',
          type: 'scheduled',
          status: 'upcoming',
          startTime: '2024-11-24T03:00:00Z',
          endTime: '2024-11-24T03:30:00Z',
          duration: 30,
          affectedServices: ['Web Servers', 'Load Balancers'],
          impactLevel: 'low',
          notifyUsers: true,
          notificationSent: false,
          createdBy: 'admin@example.com',
          createdAt: '2024-11-22T14:00:00Z',
          notes: 'Rolling deployment, minimal impact expected',
          recurring: false,
        },
        {
          id: '3',
          title: 'Weekly Backup Maintenance',
          description: 'Regular backup system maintenance and verification',
          type: 'planned',
          status: 'upcoming',
          startTime: '2024-11-24T01:00:00Z',
          endTime: '2024-11-24T01:30:00Z',
          duration: 30,
          affectedServices: ['Backup System'],
          impactLevel: 'none',
          notifyUsers: false,
          notificationSent: false,
          createdBy: 'system',
          createdAt: '2024-01-01T00:00:00Z',
          notes: 'Automated weekly maintenance',
          recurring: true,
          recurrencePattern: 'Every Sunday at 1:00 AM',
        },
        {
          id: '4',
          title: 'Emergency Network Repair',
          description: 'Fixing network connectivity issues in US-East datacenter',
          type: 'emergency',
          status: 'completed',
          startTime: '2024-11-22T10:00:00Z',
          endTime: '2024-11-22T11:30:00Z',
          duration: 90,
          affectedServices: ['All Services'],
          impactLevel: 'high',
          notifyUsers: true,
          notificationSent: true,
          createdBy: 'ops@example.com',
          createdAt: '2024-11-22T09:45:00Z',
          notes: 'Unplanned maintenance due to network failure',
          recurring: false,
        },
        {
          id: '5',
          title: 'Load Balancer Configuration',
          description: 'Updating load balancer rules and health checks',
          type: 'scheduled',
          status: 'completed',
          startTime: '2024-11-20T02:00:00Z',
          endTime: '2024-11-20T02:15:00Z',
          duration: 15,
          affectedServices: ['Load Balancers'],
          impactLevel: 'low',
          notifyUsers: false,
          notificationSent: false,
          createdBy: 'admin@example.com',
          createdAt: '2024-11-18T10:00:00Z',
          notes: 'Completed successfully',
          recurring: false,
        },
      ];
      setWindows(data || mockData);
    } catch (err: any) {
      console.error('Error fetching maintenance windows:', err);
      setWindows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await globalService.createMaintenanceWindow?.({
        title: 'New Maintenance Window',
        description: '',
        type: 'scheduled',
        startTime: new Date().toISOString(),
        endTime: new Date().toISOString(),
        affectedServices: [],
        impactLevel: 'low',
        notifyUsers: false,
      });
      setShowCreate(false);
      fetchWindows();
    } catch (error) {
      console.error('Failed to create maintenance window:', error);
    }
  };

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this maintenance window?')) return;
    try {
      await globalService.cancelMaintenanceWindow?.(id);
      fetchWindows();
    } catch (error) {
      console.error('Failed to cancel maintenance window:', error);
    }
  };

  const handleNotify = async (id: string) => {
    try {
      await globalService.sendMaintenanceNotification?.(id);
      fetchWindows();
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      scheduled: 'bg-blue-100 text-blue-800',
      emergency: 'bg-red-100 text-red-800',
      planned: 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100';
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      upcoming: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100';
  };

  const getImpactBadge = (impact: string) => {
    const colors = {
      none: 'bg-green-100 text-green-800',
      low: 'bg-blue-100 text-blue-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[impact as keyof typeof colors] || 'bg-gray-100';
  };

  const upcomingWindows = windows.filter(w => w.status === 'upcoming' || w.status === 'in_progress');
  const historicalWindows = windows.filter(w => w.status === 'completed' || w.status === 'cancelled');

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Maintenance Scheduler</h1>
          <p className="text-gray-600 mt-1">Schedule and manage platform maintenance windows</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Schedule Maintenance
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Upcoming</div>
          <div className="text-2xl font-bold">{upcomingWindows.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">This Week</div>
          <div className="text-2xl font-bold">
            {windows.filter(w => {
              const start = new Date(w.startTime);
              const weekFromNow = new Date();
              weekFromNow.setDate(weekFromNow.getDate() + 7);
              return start <= weekFromNow && w.status === 'upcoming';
            }).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Completed This Month</div>
          <div className="text-2xl font-bold">
            {windows.filter(w => w.status === 'completed').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Recurring Windows</div>
          <div className="text-2xl font-bold">
            {windows.filter(w => w.recurring).length}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('upcoming')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'upcoming'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Upcoming ({upcomingWindows.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            History ({historicalWindows.length})
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'calendar'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Calendar View
          </button>
        </div>
      </div>

      {/* Upcoming Tab */}
      {activeTab === 'upcoming' && (
        <div className="space-y-4">
          {upcomingWindows.map((window) => (
            <div key={window.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold">{window.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(window.type)}`}>
                      {window.type}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(window.status)}`}>
                      {window.status}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${getImpactBadge(window.impactLevel)}`}>
                      {window.impactLevel} impact
                    </span>
                    {window.recurring && (
                      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
                        Recurring
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{window.description}</p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Start:</span>
                      <span className="ml-2 font-semibold">
                        {new Date(window.startTime).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">End:</span>
                      <span className="ml-2 font-semibold">
                        {new Date(window.endTime).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span>
                      <span className="ml-2 font-semibold">{window.duration} minutes</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created by:</span>
                      <span className="ml-2 font-semibold">{window.createdBy}</span>
                    </div>
                  </div>

                  <div className="mt-3">
                    <span className="text-sm text-gray-500">Affected Services:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {window.affectedServices.map((service, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-gray-100 rounded">
                          {service}
                        </span>
                      ))}
                    </div>
                  </div>

                  {window.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded text-sm">
                      <span className="font-medium">Notes:</span> {window.notes}
                    </div>
                  )}

                  {window.recurring && window.recurrencePattern && (
                    <div className="mt-2 text-sm text-gray-600">
                      📅 {window.recurrencePattern}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  {window.notifyUsers && !window.notificationSent && (
                    <button
                      onClick={() => handleNotify(window.id)}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Send Notification
                    </button>
                  )}
                  {window.notificationSent && (
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">
                      ✓ Notified
                    </span>
                  )}
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-50">
                    Edit
                  </button>
                  <button
                    onClick={() => handleCancel(window.id)}
                    className="px-3 py-1 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Impact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {historicalWindows.map((window) => (
                <tr key={window.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium">{window.title}</div>
                    <div className="text-gray-500">{window.description}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(window.type)}`}>
                      {window.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm whitespace-nowrap">
                    {new Date(window.startTime).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">{window.duration} min</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getImpactBadge(window.impactLevel)}`}>
                      {window.impactLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(window.status)}`}>
                      {window.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View Tab */}
      {activeTab === 'calendar' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-lg font-semibold mb-2">Calendar View</h3>
            <p>Visual calendar view of maintenance windows would be displayed here</p>
            <p className="text-sm mt-2">Integration with calendar libraries like FullCalendar or React Big Calendar</p>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Schedule Maintenance Window</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  placeholder="e.g., Database Upgrade"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  placeholder="Describe the maintenance activity"
                  className="w-full border border-gray-300 rounded-lg p-2"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2">
                    <option value="scheduled">Scheduled</option>
                    <option value="emergency">Emergency</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Impact Level</label>
                  <select className="w-full border border-gray-300 rounded-lg p-2">
                    <option value="none">None</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg p-2"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Affected Services</label>
                <input
                  type="text"
                  placeholder="API, Database, Admin Portal (comma separated)"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Notify users about this maintenance</span>
                </label>
              </div>
              <div>
                <label className="flex items-center">
                  <input type="checkbox" className="mr-2" />
                  <span className="text-sm">Recurring maintenance</span>
                </label>
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
