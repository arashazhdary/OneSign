import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Shield, Users, Check, MoreVertical, Eye, UserCheck, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { ActionMenu } from '@/components/common/Dropdown';
import Badge from '@/components/common/Badge';
import { rolesService } from '@/lib/api/services';

interface Role {
  id: string;
  name: string;
  description: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
}

const RolesPage = () => {
  const { t } = useTranslation();
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [, setSelectedRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const availablePermissions = [
    'users.read',
    'users.write',
    'users.delete',
    'roles.read',
    'roles.write',
    'roles.delete',
    'apps.read',
    'apps.write',
    'apps.delete',
    'settings.read',
    'settings.write',
  ];

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
  }) => {
    setLoading(true);
    try {
      const response = await rolesService.getRoles(params);

      if (response?.data) {
        // Map API response to our Role interface
        const mappedRoles = response.data.map((role: any) => ({
          id: role.id,
          name: role.name,
          description: role.description || '',
          userCount: role.userCount || 0,
          permissions: role.permissions || [],
          isSystem: role.isSystem || false,
          createdAt: role.createdAt,
        }));

        setRoles(mappedRoles);
      } else {
        // Fallback to mock data if API fails
        const mockRoles: Role[] = [
          {
            id: 'role-1',
            name: 'Admin',
            description: 'Full system access with all permissions',
            userCount: 5,
            permissions: availablePermissions,
            isSystem: true,
            createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          },
          {
            id: 'role-2',
            name: 'Manager',
            description: 'Manage users and view reports',
            userCount: 12,
            permissions: ['users.read', 'users.write', 'apps.read', 'settings.read'],
            isSystem: true,
            createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
          },
          {
            id: 'role-3',
            name: 'Editor',
            description: 'Edit content and manage applications',
            userCount: 28,
            permissions: ['apps.read', 'apps.write', 'users.read'],
            isSystem: false,
            createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
          },
          {
            id: 'role-4',
            name: 'Viewer',
            description: 'Read-only access to all resources',
            userCount: 45,
            permissions: ['users.read', 'apps.read', 'settings.read'],
            isSystem: true,
            createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
          },
        ];
        setRoles(mockRoles);
      }
    } catch (error) {
      console.error('Failed to fetch roles:', error);
      toast.error(t('common.error'));
      // Fallback to mock data
      const mockRoles: Role[] = [
        {
          id: 'role-1',
          name: 'Admin',
          description: 'Full system access with all permissions',
          userCount: 5,
          permissions: availablePermissions,
          isSystem: true,
          createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
        },
        {
          id: 'role-2',
          name: 'Manager',
          description: 'Manage users and view reports',
          userCount: 12,
          permissions: ['users.read', 'users.write', 'apps.read', 'settings.read'],
          isSystem: true,
          createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
        },
        {
          id: 'role-3',
          name: 'Editor',
          description: 'Edit content and manage applications',
          userCount: 28,
          permissions: ['apps.read', 'apps.write', 'users.read'],
          isSystem: false,
          createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
        },
        {
          id: 'role-4',
          name: 'Viewer',
          description: 'Read-only access to all resources',
          userCount: 45,
          permissions: ['users.read', 'apps.read', 'settings.read'],
          isSystem: true,
          createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
        },
      ];
      setRoles(mockRoles);
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<Role>[] = [
    {
      key: 'name',
      label: t('roles.roleName'),
      sortable: true,
      filterable: true,
      render: (_, role) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium text-slate-900 dark:text-white">{role.name}</p>
              {role.isSystem && (
                <Badge variant="info" size="sm">
                  System
                </Badge>
              )}
            </div>
            <p className="text-sm text-slate-500">{role.description}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'userCount',
      label: t('roles.users'),
      sortable: true,
      render: (count) => (
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <span className="text-sm">
            {count} {t('roles.usersWithRole')}
          </span>
        </div>
      ),
    },
    {
      key: 'permissions',
      label: t('roles.permissions'),
      render: (permissions: string[]) => (
        <div className="flex flex-wrap gap-1">
          {permissions.slice(0, 3).map((perm) => (
            <Badge key={perm} variant="default" size="sm">
              {perm.split('.')[0]}
            </Badge>
          ))}
          {permissions.length > 3 && (
            <Badge variant="default" size="sm">
              +{permissions.length - 3}
            </Badge>
          )}
        </div>
      ),
    },
    {
      key: 'createdAt',
      label: t('common.createdAt'),
      sortable: true,
      render: (createdAt) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: 'actions',
      label: t('common.actions'),
      align: 'right',
      render: (_, role) => (
        <ActionMenu disabled={role.isSystem}
          items={[
            {
              label: t('common.view'),
              icon: <Eye className="w-4 h-4" />,
              onClick: () => handleView(role),
            },
            {
              label: t('roles.editPermissions'),
              icon: <Shield className="w-4 h-4" />,
              onClick: () => handleEditPermissions(role),
              disabled: role.isSystem,
            },
            {
              label: t('common.edit'),
              icon: <Edit className="w-4 h-4" />,
              onClick: () => handleEdit(role),
              disabled: role.isSystem,
            },
            {
              label: t('roles.manageUsers'),
              icon: <Users className="w-4 h-4" />,
              onClick: () => handleManageUsers(role),
            },
            { type: 'divider' },
            {
              label: t('common.delete'),
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => handleDelete(role),
              disabled: role.isSystem,
            },
          ]}
        />
      ),
    },
  ];

  const handleView = (role: Role) => {
    // TODO: Navigate to role detail page
    toast.success(t('common.view') + ': ' + role.name);
  };

  const handleEditPermissions = (role: Role) => {
    // TODO: Open permissions editor modal
    toast.success(t('roles.editPermissions') + ': ' + role.name);
  };

  const handleManageUsers = (role: Role) => {
    // TODO: Navigate to users with this role
    toast.success(t('roles.manageUsers') + ': ' + role.name);
  };

  const handleEdit = (role: Role) => {
    setSelectedRole(role);
    setFormData({
      name: role.name,
      description: role.description,
      permissions: role.permissions,
    });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (role: Role) => {
    if (confirm(`${t('roles.deleteRole')}: ${role.name}?`)) {
      setRoles((prev) => prev.filter((r) => r.id !== role.id));
      toast.success('Role deleted successfully');
    }
  };

  const togglePermission = (perm: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(perm)
        ? prev.permissions.filter((p) => p !== perm)
        : [...prev.permissions, perm],
    }));
  };

  return (
    <>
      <Helmet>
        <title>{t('roles.title')} - OneSign Admin Portal</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('roles.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">{t('roles.subtitle')}</p>
          </div>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            {t('roles.addRole')}
          </Button>
        </motion.div>

        <Card>
          <DataTable columns={columns} data={roles} loading={loading} searchable exportable />
        </Card>

        {/* Add/Edit Modal */}
        <Modal
          isOpen={isAddModalOpen || isEditModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setIsEditModalOpen(false);
            setSelectedRole(null);
            setFormData({ name: '', description: '', permissions: [] });
          }}
          title={isEditModalOpen ? t('roles.editRole') : t('roles.addRole')}
          size="lg"
        >
          <div className="space-y-4">
            <Input
              label={t('roles.roleName')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter role name"
            />
            <Input
              label={t('roles.description')}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter role description"
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                {t('roles.selectPermissions')}
              </label>
              <div className="grid grid-cols-2 gap-3">
                {availablePermissions.map((perm) => (
                  <button
                    key={perm}
                    onClick={() => togglePermission(perm)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 transition-all ${
                      formData.permissions.includes(perm)
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                        formData.permissions.includes(perm)
                          ? 'border-primary-500 bg-primary-500'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {formData.permissions.includes(perm) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">{perm}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setIsEditModalOpen(false);
                  setSelectedRole(null);
                  setFormData({ name: '', description: '', permissions: [] });
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button variant="primary">{t('common.save')}</Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default RolesPage;
