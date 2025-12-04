import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '@/hooks/useLocale';
import { useDirection } from '@/hooks/useDirection';
import { getTenantId } from '@/lib/tenant-context';
import { getCurrentUserScope, CurrentUserScopeDto } from '@/lib/api/users';
import { orgUnitsService } from '@/lib/api/services/org-units.service';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  ChevronRight,
  ChevronDown,
  Edit2,
  Trash2,
  Move,
  Lock,
  FolderTree,
  Users,
  Search,
  X,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-react';

interface OrgUnitTreeNode {
  id: string;
  parentId: string | null;
  name: string;
  code?: string;
  level: number;
  status: number;
  children: OrgUnitTreeNode[];
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  delay: number;
}

const StatCard = ({ title, value, icon, color, delay }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: delay * 0.1 }}
    className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
      </div>
      <div className={`p-4 rounded-xl ${color.replace('text-', 'bg-').replace('600', '100')}`}>
        {icon}
      </div>
    </div>
  </motion.div>
);

export default function TenantOrgUnitsPage() {
  const { t } = useTranslation();
  const locale = useLocale();
  const { isRTL } = useDirection();
  const [tree, setTree] = useState<OrgUnitTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<OrgUnitTreeNode | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [newOrgUnitName, setNewOrgUnitName] = useState('');
  const [newParentId, setNewParentId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string>('');
  const [userScope, setUserScope] = useState<CurrentUserScopeDto | null>(null);
  const [scopeLoading, setScopeLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const tid = getTenantId();
    if (tid) {
      setTenantId(tid);
      fetchTree(tid);
      fetchUserScope(tid);
    } else {
      setTenantId('00000000-0000-0000-0000-000000000000');
      fetchTree('00000000-0000-0000-0000-000000000000');
      fetchUserScope('00000000-0000-0000-0000-000000000000');
    }
  }, []);

  const fetchUserScope = async (tid: string) => {
    try {
      setScopeLoading(true);
      const scope = await getCurrentUserScope();
      setUserScope(scope);
    } catch (err) {
      console.error('Error fetching user scope:', err);
    } finally {
      setScopeLoading(false);
    }
  };

  const fetchTree = async (tid: string) => {
    try {
      setLoading(true);
      const data = await orgUnitsService.getTree();
      setTree(data);
      // Expand root nodes by default
      const rootIds = data.map((node: OrgUnitTreeNode) => node.id);
      setExpandedNodes(new Set(rootIds));
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
    setError('');
    setSuccess('');
    try {
      await orgUnitsService.create({
        tenantId,
        parentId: newParentId || null,
        name: newOrgUnitName
      });
      setShowCreateModal(false);
      setNewOrgUnitName('');
      setNewParentId(null);
      setSuccess(t('tenant.orgUnits.created') || 'Organization unit created successfully');
      fetchTree(tenantId);
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    }
  };

  const handleUpdate = async () => {
    if (!selectedNode) return;
    setError('');
    setSuccess('');
    try {
      await orgUnitsService.update(selectedNode.id, {
        name: newOrgUnitName
      });
      setShowEditModal(false);
      setSelectedNode(null);
      setNewOrgUnitName('');
      setSuccess(t('tenant.orgUnits.updated') || 'Organization unit updated successfully');
      fetchTree(tenantId);
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    }
  };

  const handleMove = async () => {
    if (!selectedNode) return;
    setError('');
    setSuccess('');
    try {
      await orgUnitsService.move(selectedNode.id, newParentId || null);
      setShowMoveModal(false);
      setSelectedNode(null);
      setNewParentId(null);
      setSuccess(t('tenant.orgUnits.moved') || 'Organization unit moved successfully');
      fetchTree(tenantId);
    } catch (err: any) {
      setError(err?.message || t('common.error'));
    }
  };

  const handleDelete = async (node: OrgUnitTreeNode) => {
    if (!confirm(t('tenant.orgUnits.confirmDelete'))) return;
    setError('');
    setSuccess('');
    try {
      await orgUnitsService.delete(node.id);
      setSuccess(t('tenant.orgUnits.deleted') || 'Organization unit deleted successfully');
      fetchTree(tenantId);
    } catch (err: any) {
      setError(err?.message || t('tenant.orgUnits.cannotDelete'));
    }
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

  const filterTreeByAllowedOrgUnits = (nodes: OrgUnitTreeNode[], allowedIds: string[]): OrgUnitTreeNode[] => {
    return nodes
      .filter(node => allowedIds.includes(node.id))
      .map(node => ({
        ...node,
        children: filterTreeByAllowedOrgUnits(node.children || [], allowedIds)
      }));
  };

  const canEditOrgUnit = (nodeId: string): boolean => {
    if (!userScope) return true;
    const isAdmin = userScope.isGlobalAdmin;
    if (isAdmin) return true;
    return userScope.allowedOrgUnitIds?.includes(nodeId) ?? false;
  };

  const getFilteredTree = (): OrgUnitTreeNode[] => {
    if (!userScope) {
      return tree;
    }
    const isAdmin = userScope.isGlobalAdmin;
    if (isAdmin) {
      return tree;
    }
    return filterTreeByAllowedOrgUnits(tree, userScope.allowedOrgUnitIds ?? []);
  };

  // Calculate stats
  const allNodes = getAllNodes(tree);
  const totalOrgUnits = allNodes.length;
  const rootOrgUnits = tree.length;
  const maxDepth = allNodes.reduce((max, node) => Math.max(max, node.level), 0);

  const renderTreeNode = (node: OrgUnitTreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isEditable = canEditOrgUnit(node.id);

    // Filter by search query
    if (searchQuery) {
      const matchesSearch = node.name.toLowerCase().includes(searchQuery.toLowerCase());
      const childrenMatch = node.children?.some(child =>
        child.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (!matchesSearch && !childrenMatch) return null;
    }

    return (
      <motion.div
        key={node.id}
        initial={{ opacity: 0, x: isRTL ? 10 : -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: level * 0.05 }}
        style={isRTL ? { marginRight: `${level * 24}px` } : { marginLeft: `${level * 24}px` }}
      >
        <div className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-200 hover:bg-gray-50 ${
          selectedNode?.id === node.id ? 'bg-indigo-50 border border-indigo-200' : ''
        }`}>
          {/* Expand/Collapse Button */}
          {hasChildren ? (
            <button
              onClick={() => toggleNode(node.id)}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isExpanded ? (
                <ChevronDown className="w-5 h-5 text-gray-500" />
              ) : (
                <ChevronRight className="w-5 h-5 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="w-8 h-8"></span>
          )}

          {/* Icon */}
          <div className={`p-2 rounded-lg ${isEditable ? 'bg-indigo-100' : 'bg-gray-100'}`}>
            <Building2 className={`w-5 h-5 ${isEditable ? 'text-indigo-600' : 'text-gray-400'}`} />
          </div>

          {/* Name */}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-medium ${isEditable ? 'text-gray-900' : 'text-gray-500'}`}>
                {node.name}
              </span>
              {!isEditable && (
                <Lock className="w-4 h-4 text-gray-400" />
              )}
              {node.code && (
                <code className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-500">
                  {node.code}
                </code>
              )}
            </div>
            {hasChildren && (
              <p className="text-xs text-gray-500 mt-0.5">
                {node.children.length} {t('tenant.orgUnits.children') || 'children'}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setSelectedNode(node);
                setNewOrgUnitName(node.name);
                setShowEditModal(true);
              }}
              disabled={!isEditable}
              className={`p-2 rounded-lg transition-colors ${
                isEditable ? 'text-blue-600 hover:bg-blue-50' : 'text-gray-300 cursor-not-allowed'
              }`}
              title={t('common.edit')}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSelectedNode(node);
                setNewParentId(null);
                setShowMoveModal(true);
              }}
              disabled={!isEditable}
              className={`p-2 rounded-lg transition-colors ${
                isEditable ? 'text-green-600 hover:bg-green-50' : 'text-gray-300 cursor-not-allowed'
              }`}
              title={t('tenant.orgUnits.move')}
            >
              <Move className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(node)}
              disabled={!isEditable}
              className={`p-2 rounded-lg transition-colors ${
                isEditable ? 'text-red-600 hover:bg-red-50' : 'text-gray-300 cursor-not-allowed'
              }`}
              title={t('common.delete')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="border-l-2 border-gray-200 ml-4">
            {node.children.map(child => renderTreeNode(child, level + 1))}
          </div>
        )}
      </motion.div>
    );
  };

  if (loading || scopeLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600 font-medium">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8" dir={locale === 'fa' ? 'rtl' : 'ltr'}>
      <Helmet>
        <title>{t('tenant.orgUnits.title')}</title>
      </Helmet>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {t('tenant.orgUnits.title')}
          </h1>
          <p className="text-gray-600 mt-2">{t('tenant.orgUnits.subtitle') || 'Manage your organizational structure'}</p>
        </div>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchTree(tenantId)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            {t('common.refresh') || 'Refresh'}
          </motion.button>
          {(!userScope || userScope.isGlobalAdmin || (userScope.allowedOrgUnitIds?.length ?? 0) > 0) && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setNewParentId(null);
                setNewOrgUnitName('');
                setShowCreateModal(true);
              }}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              {t('tenant.orgUnits.createOrgUnit')}
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title={t('tenant.orgUnits.totalOrgUnits') || 'Total Org Units'}
          value={totalOrgUnits}
          icon={<Building2 className="w-6 h-6 text-indigo-600" />}
          color="text-indigo-600"
          delay={0}
        />
        <StatCard
          title={t('tenant.orgUnits.rootOrgUnits') || 'Root Units'}
          value={rootOrgUnits}
          icon={<FolderTree className="w-6 h-6 text-blue-600" />}
          color="text-blue-600"
          delay={1}
        />
        <StatCard
          title={t('tenant.orgUnits.maxDepth') || 'Max Depth'}
          value={maxDepth + 1}
          icon={<Users className="w-6 h-6 text-green-600" />}
          color="text-green-600"
          delay={2}
        />
      </div>

      {/* Alerts */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-xl flex items-center gap-3"
          >
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto">
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-4 mb-6"
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder={t('tenant.orgUnits.searchPlaceholder') || 'Search org units...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Org Tree */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 p-6"
      >
        {getFilteredTree().length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">{t('tenant.orgUnits.noChildren')}</p>
          </div>
        ) : (
          <div className="space-y-1">
            {getFilteredTree().map(node => renderTreeNode(node))}
          </div>
        )}
      </motion.div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Plus className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t('tenant.orgUnits.createOrgUnit')}</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.orgUnits.orgUnitName')}
                  </label>
                  <input
                    type="text"
                    value={newOrgUnitName}
                    onChange={(e) => setNewOrgUnitName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('tenant.orgUnits.namePlaceholder') || 'Enter org unit name'}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.orgUnits.parentOrgUnit')}
                  </label>
                  <select
                    value={newParentId || ''}
                    onChange={(e) => setNewParentId(e.target.value || null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">{t('tenant.orgUnits.root')}</option>
                    {getAllNodes(tree).map(node => (
                      <option key={node.id} value={node.id}>
                        {'─'.repeat(node.level)} {node.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreate}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('common.create')}
                </motion.button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Edit2 className="w-6 h-6 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{t('tenant.orgUnits.editOrgUnit')}</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.orgUnits.orgUnitName')}
                  </label>
                  <input
                    type="text"
                    value={newOrgUnitName}
                    onChange={(e) => setNewOrgUnitName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdate}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('common.save')}
                </motion.button>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Move Modal */}
      <AnimatePresence>
        {showMoveModal && selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowMoveModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-green-100 rounded-xl">
                  <Move className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{t('tenant.orgUnits.move')}</h2>
                  <p className="text-gray-500">{selectedNode.name}</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('tenant.orgUnits.parentOrgUnit')}
                  </label>
                  <select
                    value={newParentId || ''}
                    onChange={(e) => setNewParentId(e.target.value || null)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">{t('tenant.orgUnits.root')}</option>
                    {getAllNodes(tree)
                      .filter(node => node.id !== selectedNode.id)
                      .map(node => (
                        <option key={node.id} value={node.id}>
                          {'─'.repeat(node.level)} {node.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleMove}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {t('tenant.orgUnits.move')}
                </motion.button>
                <button
                  onClick={() => setShowMoveModal(false)}
                  className="px-6 py-3 border border-gray-200 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
