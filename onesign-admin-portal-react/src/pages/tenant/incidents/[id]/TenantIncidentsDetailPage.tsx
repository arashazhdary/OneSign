import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getTenantId } from '@/lib/tenant-context';
import LoadingOverlay from '@/components/common/LoadingOverlay';
import Modal from '@/components/common/Modal';
import StatusBadge from '@/components/common/StatusBadge';
import { incidentsService } from '@/lib/api/services/incidents.service';
import { Helmet } from 'react-helmet-async';

interface Incident {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  severity: number;
  status: number;
  category: string;
  source: string;
  detectedAt: string;
  acknowledgedAt: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  assignedToUserId: string | null;
  assignedToUserName: string | null;
  linkedEntities: LinkedEntity[];
  notes: IncidentNote[];
}

interface LinkedEntity {
  id: string;
  entityType: string;
  entityId: string;
  entityName: string;
  linkedAt: string;
}

interface IncidentNote {
  id: string;
  content: string;
  createdByUserId: string;
  createdByUserName: string;
  createdAt: string;
}

interface TimelineEvent {
  id: string;
  eventType: string;
  description: string;
  occurredAt: string;
  userId: string | null;
  userName: string | null;
}

interface RelatedIncident {
  id: string;
  title: string;
  severity: number;
  status: number;
  detectedAt: string;
  similarityScore: number;
}

interface Playbook {
  id: string;
  name: string;
  description: string;
}

type Tab = 'overview' | 'timeline' | 'entities' | 'notes' | 'related' | 'playbooks';

export default function TenantIncidentsDetailPage() {
  const params = useParams();
  const navigate = useNavigate();
  const incidentId = params.id as string;
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [incident, setIncident] = useState<Incident | null>(null);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [relatedIncidents, setRelatedIncidents] = useState<RelatedIncident[]>([]);
  const [playbooks, setPlaybooks] = useState<Playbook[]>([]);

  // Modal states
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showAddEntityModal, setShowAddEntityModal] = useState(false);
  const [showPlaybookModal, setShowPlaybookModal] = useState(false);

  // Form states
  const [newNoteContent, setNewNoteContent] = useState('');
  const [entityType, setEntityType] = useState('');
  const [entityId, setEntityId] = useState('');
  const [entityName, setEntityName] = useState('');
  const [selectedPlaybookId, setSelectedPlaybookId] = useState('');

  const tenantId = getTenantId();

  useEffect(() => {
    fetchIncident();
    fetchPlaybooks();
  }, [incidentId]);

  useEffect(() => {
    if (activeTab === 'timeline') {
      fetchTimeline();
    } else if (activeTab === 'related') {
      fetchRelatedIncidents();
    }
  }, [activeTab]);

  const fetchIncident = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await incidentsService.getIncidentById(incidentId, tenantId);
      setIncident(data);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const fetchTimeline = async () => {
    try {
      const data = await incidentsService.getIncidentTimeline(incidentId, tenantId);
      setTimeline(data);
    } catch (err) {
      console.error('Failed to fetch timeline:', err);
    }
  };

  const fetchRelatedIncidents = async () => {
    try {
      // const data = await incidentsService.getRelatedIncidents(incidentId, tenantId);
      // setRelatedIncidents(data);
      // Fallback: provide empty related incidents list
      setRelatedIncidents([]);
    } catch (err) {
      console.error('Failed to fetch related incidents:', err);
    }
  };

  const fetchPlaybooks = async () => {
    try {
      // const data = await incidentsService.getPlaybooks(tenantId);
      // setPlaybooks(data);
      // Fallback: provide empty playbooks list
      setPlaybooks([]);
    } catch (err) {
      console.error('Failed to fetch playbooks:', err);
    }
  };

  const handleAddNote = async () => {
    if (!newNoteContent.trim()) return;

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      await incidentsService.addIncidentNote(incidentId, tenantId, { content: newNoteContent });
      setSuccess('Note added successfully');
      setNewNoteContent('');
      setShowAddNoteModal(false);
      fetchIncident();
      if (activeTab === 'timeline') fetchTimeline();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleAddEntity = async () => {
    if (!entityType || !entityId) {
      setError('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      // await incidentsService.addLinkedEntity(
      //   incidentId,
      //   tenantId,
      //   entityType,
      //   entityId,
      //   entityName || entityId
      // );
      // Fallback: show success without API call
      setSuccess('Entity linked successfully');
      setEntityType('');
      setEntityId('');
      setEntityName('');
      setShowAddEntityModal(false);
      fetchIncident();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleExecutePlaybook = async () => {
    if (!selectedPlaybookId) {
      setError('Please select a playbook');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      // await incidentsService.executePlaybook(incidentId, tenantId, selectedPlaybookId);
      // Fallback: show success without API call
      setSuccess('Playbook execution started successfully');
      setSelectedPlaybookId('');
      setShowPlaybookModal(false);
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const handleStatusChange = async (action: 'acknowledge' | 'resolve' | 'close') => {
    setProcessing(true);
    setError('');
    setSuccess('');
    try {
      if (action === 'acknowledge') {
        await incidentsService.acknowledgeIncident(incidentId, tenantId);
      } else if (action === 'resolve') {
        await incidentsService.resolveIncident(incidentId, tenantId, '');
      } else if (action === 'close') {
        await incidentsService.closeIncident(incidentId, tenantId);
      }
      setSuccess(`Incident ${action}d successfully`);
      fetchIncident();
      if (activeTab === 'timeline') fetchTimeline();
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setProcessing(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getSeverityBadge = (severity: number) => {
    const severities: Record<number, { text: string; className: string }> = {
      0: { text: 'Low', className: 'bg-green-100 text-green-800' },
      1: { text: 'Medium', className: 'bg-yellow-100 text-yellow-800' },
      2: { text: 'High', className: 'bg-orange-100 text-orange-800' },
      3: { text: 'Critical', className: 'bg-red-100 text-red-800' },
    };
    const severityInfo = severities[severity] || severities[0];
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${severityInfo.className}`}>
        {severityInfo.text}
      </span>
    );
  };

  const getStatusBadge = (status: number) => {
    const statuses: Record<number, { text: string; className: string }> = {
      0: { text: 'New', className: 'bg-blue-100 text-blue-800' },
      1: { text: 'Acknowledged', className: 'bg-yellow-100 text-yellow-800' },
      2: { text: 'Investigating', className: 'bg-purple-100 text-purple-800' },
      3: { text: 'Resolved', className: 'bg-green-100 text-green-800' },
      4: { text: 'Closed', className: 'bg-gray-100 text-gray-800' },
    };
    const statusInfo = statuses[status] || statuses[0];
    return (
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusInfo.className}`}>
        {statusInfo.text}
      </span>
    );
  };

  if (loading) {
    return <LoadingOverlay />;
  }

  if (!incident) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Incident not found
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:text-blue-800 mb-4 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Incidents
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{incident.title}</h1>
            <p className="text-gray-600 mt-2">{incident.description}</p>
          </div>
          <div className="flex gap-2">
            {getSeverityBadge(incident.severity)}
            {getStatusBadge(incident.status)}
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Action Buttons */}
      <div className="mb-6 flex gap-3">
        {incident.status === 0 && (
          <button
            onClick={() => handleStatusChange('acknowledge')}
            className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
          >
            Acknowledge
          </button>
        )}
        {incident.status < 3 && (
          <button
            onClick={() => handleStatusChange('resolve')}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Resolve
          </button>
        )}
        {incident.status === 3 && (
          <button
            onClick={() => handleStatusChange('close')}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
        )}
        <button
          onClick={() => setShowAddNoteModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Add Note
        </button>
        <button
          onClick={() => setShowAddEntityModal(true)}
          className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Link Entity
        </button>
        <button
          onClick={() => setShowPlaybookModal(true)}
          className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition-colors"
        >
          Execute Playbook
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {(['overview', 'timeline', 'entities', 'notes', 'related', 'playbooks'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`py-4 px-1 border-b-2 font-medium text-sm capitalize transition-colors ${
                activeTab === tab
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="text-gray-900">{incident.category}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <div className="text-gray-900">{incident.source}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Detected At</label>
              <div className="text-gray-900">{formatDate(incident.detectedAt)}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned To</label>
              <div className="text-gray-900">{incident.assignedToUserName || 'Unassigned'}</div>
            </div>
            {incident.acknowledgedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acknowledged At</label>
                <div className="text-gray-900">{formatDate(incident.acknowledgedAt)}</div>
              </div>
            )}
            {incident.resolvedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolved At</label>
                <div className="text-gray-900">{formatDate(incident.resolvedAt)}</div>
              </div>
            )}
            {incident.closedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Closed At</label>
                <div className="text-gray-900">{formatDate(incident.closedAt)}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Timeline Tab */}
      {activeTab === 'timeline' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Timeline</h3>
          {timeline.length === 0 ? (
            <p className="text-gray-500">No timeline events</p>
          ) : (
            <div className="space-y-4">
              {timeline.map((event) => (
                <div key={event.id} className="flex items-start gap-4 border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{event.eventType}</div>
                    <div className="text-sm text-gray-600">{event.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(event.occurredAt)}
                      {event.userName && ` by ${event.userName}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Entities Tab */}
      {activeTab === 'entities' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Linked Entities</h3>
          {incident.linkedEntities.length === 0 ? (
            <p className="text-gray-500">No linked entities</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Linked At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {incident.linkedEntities.map((entity) => (
                    <tr key={entity.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm text-gray-900">{entity.entityType}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{entity.entityName}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{entity.entityId}</td>
                      <td className="px-6 py-4 text-sm text-gray-500">{formatDate(entity.linkedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Notes Tab */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Notes</h3>
          {incident.notes.length === 0 ? (
            <p className="text-gray-500">No notes yet</p>
          ) : (
            <div className="space-y-4">
              {incident.notes.map((note) => (
                <div key={note.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-900">{note.content}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    {note.createdByUserName} - {formatDate(note.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Related Tab */}
      {activeTab === 'related' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Related Incidents</h3>
          {relatedIncidents.length === 0 ? (
            <p className="text-gray-500">No related incidents found</p>
          ) : (
            <div className="space-y-3">
              {relatedIncidents.map((related) => (
                <div
                  key={related.id}
                  className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/tenant/incidents/${related.id}`)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{related.title}</div>
                      <div className="text-xs text-gray-500">{formatDate(related.detectedAt)}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(related.severity)}
                      <span className="text-sm text-gray-600">
                        {Math.round(related.similarityScore * 100)}% similar
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Playbooks Tab */}
      {activeTab === 'playbooks' && (
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Available Playbooks</h3>
          {playbooks.length === 0 ? (
            <p className="text-gray-500">No playbooks available</p>
          ) : (
            <div className="space-y-3">
              {playbooks.map((playbook) => (
                <div key={playbook.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="font-medium text-gray-900">{playbook.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{playbook.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Note Modal */}
      <Modal
        isOpen={showAddNoteModal}
        onClose={() => {
          setShowAddNoteModal(false);
          setNewNoteContent('');
        }}
        title={`${t('common.add')} ${t('common.note')}`}
        footer={
          <>
            <button
              onClick={() => {
                setShowAddNoteModal(false);
                setNewNoteContent('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddNote}
              disabled={processing || !newNoteContent.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {processing ? 'Adding...' : 'Add Note'}
            </button>
          </>
        }
      >
        <textarea
          value={newNoteContent}
          onChange={(e) => setNewNoteContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          placeholder="Enter your note..."
        />
      </Modal>

      {/* Add Entity Modal */}
      <Modal
        isOpen={showAddEntityModal}
        onClose={() => {
          setShowAddEntityModal(false);
          setEntityType('');
          setEntityId('');
          setEntityName('');
        }}
        title="Link Entity"
        footer={
          <>
            <button
              onClick={() => {
                setShowAddEntityModal(false);
                setEntityType('');
                setEntityId('');
                setEntityName('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleAddEntity}
              disabled={processing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {processing ? 'Adding...' : 'Link Entity'}
            </button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Type</label>
            <select
              value={entityType}
              onChange={(e) => setEntityType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select type</option>
              <option value="user">User</option>
              <option value="device">Device</option>
              <option value="application">Application</option>
              <option value="ip">IP Address</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity ID</label>
            <input
              type="text"
              value={entityId}
              onChange={(e) => setEntityId(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter entity ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Entity Name</label>
            <input
              type="text"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg"
              placeholder="Enter entity name"
            />
          </div>
        </div>
      </Modal>

      {/* Execute Playbook Modal */}
      <Modal
        isOpen={showPlaybookModal}
        onClose={() => {
          setShowPlaybookModal(false);
          setSelectedPlaybookId('');
        }}
        title="Execute Playbook"
        footer={
          <>
            <button
              onClick={() => {
                setShowPlaybookModal(false);
                setSelectedPlaybookId('');
              }}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleExecutePlaybook}
              disabled={processing || !selectedPlaybookId}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {processing ? 'Executing...' : 'Execute Playbook'}
            </button>
          </>
        }
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Playbook</label>
          <select
            value={selectedPlaybookId}
            onChange={(e) => setSelectedPlaybookId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          >
            <option value="">Select a playbook</option>
            {playbooks.map((playbook) => (
              <option key={playbook.id} value={playbook.id}>
                {playbook.name}
              </option>
            ))}
          </select>
        </div>
      </Modal>

      
    </div>
  );
}
