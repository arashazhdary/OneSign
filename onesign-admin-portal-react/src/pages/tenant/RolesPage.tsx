import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Shield, Users, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Badge from '@/components/common/Badge';
import { tenantService } from '@/lib/api/services/tenant.service';

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
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
  });

  const [availablePermissions, setAvailablePermissions] = useState<string[]>([
    'users.read',
    'users.write',
    'users.delete',
    'apps.read',
    'apps.write',
    'apps.delete',
    'notifications.read',
    'notifications.write',
    'settings.read',
    'settings.write',
  ]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchPermissions = async () => {
    try {
      const permissions = await tenantService.getAvailablePermissions();
      if (permissions && permissions.length > 0) {
        setAvailablePermissions(permissions);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
  };

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await tenantService.getRoles();
      setRoles(response.items || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      toast.error(t('common.error'));
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
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEdit(role)}
            leftIcon={<Edit className="w-4 h-4" />}
            disabled={role.isSystem}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(role)}
            leftIcon={<Trash2 className="w-4 h-4 text-danger-600" />}
            disabled={role.isSystem}
          />
        </div>
      ),
    },
  ];

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
    if (!confirm(`${t('roles.deleteRole')}: ${role.name}?`)) return;
    try {
      await tenantService.deleteRole(role.id);
      toast.success(t('roles.roleDeleted') || 'Role deleted successfully');
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleAddRole = async () => {
    try {
      await tenantService.createRole({
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      });
      toast.success(t('roles.roleCreated') || 'Role created successfully');
      setIsAddModalOpen(false);
      setFormData({ name: '', description: '', permissions: [] });
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
    }
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;
    try {
      await tenantService.updateRole(selectedRole.id, {
        name: formData.name,
        description: formData.description,
        permissions: formData.permissions,
      });
      toast.success(t('roles.roleUpdated') || 'Role updated successfully');
      setIsEditModalOpen(false);
      setSelectedRole(null);
      setFormData({ name: '', description: '', permissions: [] });
      fetchRoles();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t('common.error'));
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
              <Button variant="primary" onClick={isEditModalOpen ? handleUpdateRole : handleAddRole}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default RolesPage;
