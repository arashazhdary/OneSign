import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Mail, Shield, MoreVertical, Eye, UserCheck, UserX } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import { ActionMenu } from '@/components/common/Dropdown';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';
import { tenantService, TenantUserDto } from '@/lib/api/services/tenant.service';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  lastLogin?: string;
  avatar?: string;
}

const UsersPage = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users from API
      const response = await tenantService.getUsers(1, 100);

      // Map API response to local User interface
      const mappedUsers: User[] = response.items.map((user: TenantUserDto) => ({
        id: user.id,
        name: user.displayName || `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.roles?.[0] || 'User',
        status: user.status.toLowerCase() as 'active' | 'inactive' | 'suspended',
        createdAt: user.createdAt,
        lastLogin: user.lastLoginAt,
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(t('common.failedToLoadUsers'));
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: t('users.name'),
      sortable: true,
      filterable: true,
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.avatar} size="sm" status={user.status === 'active' ? 'online' : 'offline'} />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: t('users.role'),
      sortable: true,
      filterable: true,
      render: (role) => (
        <Badge
          variant={
            role === 'Admin'
              ? 'primary'
              : role === 'Manager'
              ? 'secondary'
              : role === 'Editor'
              ? 'info'
              : 'default'
          }
          pill
        >
          {role}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: t('common.status'),
      sortable: true,
      render: (status) => (
        <Badge
          variant={status === 'active' ? 'success' : status === 'inactive' ? 'warning' : 'danger'}
          dot
        >
          {t(`users.${status}`)}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      label: t('users.lastLogin'),
      sortable: true,
      render: (lastLogin) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {lastLogin ? new Date(lastLogin).toLocaleDateString() : t('users.never')}
        </span>
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
      render: (_, user) => (
        <ActionMenu
          items={[
            {
              label: t('common.view'),
              icon: <Eye className="w-4 h-4" />,
              onClick: () => handleView(user),
            },
            {
              label: t('common.edit'),
              icon: <Edit className="w-4 h-4" />,
              onClick: () => handleEdit(user),
            },
            {
              label: t('users.manageRoles'),
              icon: <Shield className="w-4 h-4" />,
              onClick: () => handleManageRoles(user),
            },
            {
              label: user.status === 'active' ? t('users.suspend') : t('users.activate'),
              icon: user.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />,
              onClick: () => handleToggleStatus(user),
            },
            {
              label: t('users.sendInvite'),
              icon: <Mail className="w-4 h-4" />,
              onClick: () => handleSendInvite(user),
            },
            {
              type: 'divider',
            },
            {
              label: t('common.delete'),
              icon: <Trash2 className="w-4 h-4" />,
              onClick: () => handleDelete(user),
              variant: 'danger',
            },
          ]}
        />
      ),
    },
  ];

  const handleView = (user: User) => {
    // TODO: Navigate to user detail page
    toast(t('common.view') + ': ' + user.name);
  };

  const handleManageRoles = (user: User) => {
    // TODO: Open role assignment modal
    toast(t('users.manageRoles') + ': ' + user.name);
  };

  const handleToggleStatus = async (user: User) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    const actionText = newStatus === 'active' ? t('users.activate') : t('users.suspend');

    try {
      // TODO: Call API to update user status
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: newStatus } : u))
      );
      toast.success(`${actionText}: ${user.name}`);
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleSendInvite = async (user: User) => {
    try {
      // TODO: Call API to send invite
      toast.success(`${t('users.inviteSent')}: ${user.email}`);
    } catch (error) {
      toast.error(t('common.error'));
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (confirm(t('users.deleteConfirm') || `Delete ${user.name}?`)) {
      try {
        await tenantService.deleteUser(user.id);
        setUsers((prev) => prev.filter((u) => u.id !== user.id));
        toast.success(t('users.userDeleted') || 'User deleted successfully');
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error(t('common.failedToDeleteUser'));
      }
    }
  };

  const handleSaveUser = async () => {
    try {
      if (selectedUser) {
        // Update existing user via API
        const nameParts = formData.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        await tenantService.updateUser(selectedUser.id, {
          firstName,
          lastName,
          status: formData.status === 'active' ? 'Active' : formData.status === 'inactive' ? 'Inactive' : 'Suspended',
          roles: [formData.role],
        });

        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? { ...u, name: formData.name, email: formData.email, role: formData.role, status: formData.status as any }
              : u
          )
        );
        toast.success(t('users.userUpdated') || 'User updated successfully');
        setIsEditModalOpen(false);
      } else {
        // Add new user via API
        const nameParts = formData.name.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';

        const newUserResponse = await tenantService.createUser({
          email: formData.email,
          firstName,
          lastName,
          roles: [formData.role],
          sendInvite: true,
        });

        const newUser: User = {
          id: newUserResponse.id,
          name: formData.name,
          email: formData.email,
          role: formData.role,
          status: 'active',
          createdAt: new Date().toISOString(),
        };
        setUsers((prev) => [newUser, ...prev]);
        toast.success(t('users.userAdded') || 'User added successfully');
        setIsAddModalOpen(false);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(t('common.failedToSaveUser'));
    }

    setFormData({ name: '', email: '', role: 'user', status: 'active' });
    setSelectedUser(null);
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) return;
    if (confirm(`Delete ${selectedUsers.length} users?`)) {
      try {
        // Delete users via API
        const selectedIds = selectedUsers.map((u) => u.id);
        await Promise.all(selectedIds.map((id) => tenantService.deleteUser(id)));

        setUsers((prev) => prev.filter((u) => !selectedIds.includes(u.id)));
        toast.success(`${selectedUsers.length} users deleted`);
        setSelectedUsers([]);
      } catch (error) {
        console.error('Error deleting users:', error);
        toast.error(t('common.failedToDeleteSomeUsers'));
      }
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('users.title')} - OneSign Admin Portal</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t('users.title')}</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">{t('users.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            {selectedUsers.length > 0 && (
              <Button
                variant="danger"
                onClick={handleBulkDelete}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                {t('common.delete')} ({selectedUsers.length})
              </Button>
            )}
            <Button
              variant="primary"
              onClick={() => setIsAddModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              {t('users.addUser')}
            </Button>
          </div>
        </motion.div>

        <Card>
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            searchable
            exportable
            selectable
            onSelectionChange={setSelectedUsers}
          />
        </Card>

        {/* Add User Modal */}
        <Modal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setFormData({ name: '', email: '', role: 'user', status: 'active' });
          }}
          title={t('users.addUser')}
        >
          <div className="space-y-4">
            <Input
              label={t('users.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter user name"
            />
            <Input
              label={t('users.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail className="w-4 h-4" />}
              placeholder="user@example.com"
            />
            <ActionMenu
              label={t('users.role')}
              options={[
                { value: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> },
                { value: 'manager', label: 'Manager' },
                { value: 'editor', label: 'Editor' },
                { value: 'user', label: 'User' },
                { value: 'viewer', label: 'Viewer' },
              ]}
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value })}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsAddModalOpen(false);
                  setFormData({ name: '', email: '', role: 'user', status: 'active' });
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSaveUser}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit User Modal */}
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedUser(null);
            setFormData({ name: '', email: '', role: 'user', status: 'active' });
          }}
          title={t('users.editUser')}
        >
          <div className="space-y-4">
            <Input
              label={t('users.name')}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label={t('users.email')}
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <ActionMenu
              label={t('users.role')}
              options={[
                { value: 'admin', label: 'Admin', icon: <Shield className="w-4 h-4" /> },
                { value: 'manager', label: 'Manager' },
                { value: 'editor', label: 'Editor' },
                { value: 'user', label: 'User' },
                { value: 'viewer', label: 'Viewer' },
              ]}
              value={formData.role}
              onChange={(value) => setFormData({ ...formData, role: value })}
            />
            <ActionMenu
              label={t('common.status')}
              options={[
                { value: 'active', label: t('users.active') },
                { value: 'inactive', label: t('users.inactive') },
                { value: 'suspended', label: t('users.suspended') },
              ]}
              value={formData.status}
              onChange={(value) => setFormData({ ...formData, status: value })}
            />
            <div className="flex justify-end gap-2 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedUser(null);
                  setFormData({ name: '', email: '', role: 'user', status: 'active' });
                }}
              >
                {t('common.cancel')}
              </Button>
              <Button variant="primary" onClick={handleSaveUser}>
                {t('common.save')}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default UsersPage;
