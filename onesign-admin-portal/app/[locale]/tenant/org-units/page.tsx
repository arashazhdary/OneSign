'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { getTenantId } from '@/lib/tenant-context';

interface OrgUnitTreeNode {
  id: string;
  parentId: string | null;
  name: string;
  code?: string;
  level: number;
  status: number;
  children: OrgUnitTreeNode[];
}

export default function OrgUnitsPage() {
  const t = useTranslations();
  const locale = useLocale();
  const [tree, setTree] = useState<OrgUnitTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<OrgUnitTreeNode | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [newOrgUnitName, setNewOrgUnitName] = useState('');
  const [newParentId, setNewParentId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string>('');

  useEffect(() => {
    const tid = getTenantId();
    if (tid) {
      setTenantId(tid);
      fetchTree(tid);
    } else {
      setTenantId('00000000-0000-0000-0000-000000000000');
      fetchTree('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  const fetchTree = async (tid: string) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:7000/api/tenant/org-units/tree?tenantId=${tid}`, {
        headers: {
          'Accept-Language': locale
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTree(data);
        // Expand root nodes by default
        const rootIds = data.map((node: OrgUnitTreeNode) => node.id);
        setExpandedNodes(new Set(rootIds));
      } else {
        setError(t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/org-units?tenantId=${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale
        },
        body: JSON.stringify({
          parentId: newParentId || null,
          name: newOrgUnitName
        })
      });
      if (response.ok) {
        setShowCreateModal(false);
        setNewOrgUnitName('');
        setNewParentId(null);
        fetchTree(tenantId);
      } else {
        const errorData = await response.json();
        setError(errorData.errorMessage || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleUpdate = async () => {
    if (!selectedNode) return;
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/org-units/${selectedNode.id}?tenantId=${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale
        },
        body: JSON.stringify({
          name: newOrgUnitName
        })
      });
      if (response.ok) {
        setShowEditModal(false);
        setSelectedNode(null);
        setNewOrgUnitName('');
        fetchTree(tenantId);
      } else {
        const errorData = await response.json();
        setError(errorData.errorMessage || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleMove = async () => {
    if (!selectedNode) return;
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/org-units/${selectedNode.id}/move?tenantId=${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': locale
        },
        body: JSON.stringify({
          newParentId: newParentId || null
        })
      });
      if (response.ok) {
        setShowMoveModal(false);
        setSelectedNode(null);
        setNewParentId(null);
        fetchTree(tenantId);
      } else {
        const errorData = await response.json();
        setError(errorData.errorMessage || t('common.error'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const handleDelete = async (node: OrgUnitTreeNode) => {
    if (!confirm(t('tenant.orgUnits.confirmDelete'))) return;
    try {
      const response = await fetch(`http://localhost:7000/api/tenant/org-units/${node.id}?tenantId=${tenantId}`, {
        method: 'DELETE',
        headers: {
          'Accept-Language': locale
        }
      });
      if (response.ok) {
        fetchTree(tenantId);
      } else {
        const errorData = await response.json();
        alert(errorData.errorMessage || t('tenant.orgUnits.cannotDelete'));
      }
    } catch (err) {
      setError(t('common.error'));
    }
  };

  const renderTreeNode = (node: OrgUnitTreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id} style={{ marginLeft: `${level * 20}px` }}>
        <div className="flex items-center gap-2 py-1">
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="w-6 h-6 flex items-center justify-center"
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          ) : (
            <span className="w-6"></span>
          )}
          <span className="font-medium">{node.name}</span>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => {
                setSelectedNode(node);
                setNewOrgUnitName(node.name);
                setShowEditModal(true);
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              {t('common.edit')}
            </button>
            <button
              onClick={() => {
                setSelectedNode(node);
                setNewParentId(null);
                setShowMoveModal(true);
              }}
              className="text-green-600 hover:text-green-800"
            >
              {t('tenant.orgUnits.move')}
            </button>
            <button
              onClick={() => handleDelete(node)}
              className="text-red-600 hover:text-red-800"
            >
              {t('common.delete')}
            </button>
          </div>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getAllNodes = (nodes: OrgUnitTreeNode[]): OrgUnitTreeNode[] => {
    const result: OrgUnitTreeNode[] = [];
    nodes.forEach(node => {
      result.push(node);
      if (node.children) {
        result.push(...getAllNodes(node.children));
      }
    });
    return result;
  };

  if (loading) {
    return <div className="p-8">{t('common.loading')}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('tenant.orgUnits.title')}</h1>
        <button
          onClick={() => {
            setNewParentId(null);
            setNewOrgUnitName('');
            setShowCreateModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {t('tenant.orgUnits.createOrgUnit')}
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        {tree.length === 0 ? (
          <p>{t('tenant.orgUnits.noChildren')}</p>
        ) : (
          tree.map(node => renderTreeNode(node))
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">{t('tenant.orgUnits.createOrgUnit')}</h2>
            <div className="mb-4">
              <label className="block mb-2">{t('tenant.orgUnits.orgUnitName')}</label>
              <input
                type="text"
                value={newOrgUnitName}
                onChange={(e) => setNewOrgUnitName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="mb-4">
              <label className="block mb-2">{t('tenant.orgUnits.parentOrgUnit')}</label>
              <select
                value={newParentId || ''}
                onChange={(e) => setNewParentId(e.target.value || null)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">{t('tenant.orgUnits.root')}</option>
                {getAllNodes(tree).map(node => (
                  <option key={node.id} value={node.id}>{node.name}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 border rounded"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('common.create')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">{t('tenant.orgUnits.editOrgUnit')}</h2>
            <div className="mb-4">
              <label className="block mb-2">{t('tenant.orgUnits.orgUnitName')}</label>
              <input
                type="text"
                value={newOrgUnitName}
                onChange={(e) => setNewOrgUnitName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 border rounded"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('common.save')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move Modal */}
      {showMoveModal && selectedNode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96">
            <h2 className="text-xl font-bold mb-4">{t('tenant.orgUnits.move')}</h2>
            <div className="mb-4">
              <label className="block mb-2">{t('tenant.orgUnits.parentOrgUnit')}</label>
              <select
                value={newParentId || ''}
                onChange={(e) => setNewParentId(e.target.value || null)}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">{t('tenant.orgUnits.root')}</option>
                {getAllNodes(tree)
                  .filter(node => node.id !== selectedNode.id)
                  .map(node => (
                    <option key={node.id} value={node.id}>{node.name}</option>
                  ))}
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 border rounded"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleMove}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t('tenant.orgUnits.move')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

