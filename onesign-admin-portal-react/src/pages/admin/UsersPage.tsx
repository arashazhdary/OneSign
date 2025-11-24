import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Plus, Edit, Trash2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import DataTable, { Column } from '@/components/common/DataTable';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Dropdown from '@/components/common/Dropdown';
import Badge from '@/components/common/Badge';
import Avatar from '@/components/common/Avatar';

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: '',
    status: 'active',
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockUsers: User[] = Array.from({ length: 25 }, (_, i) => ({
        id: `user-${i + 1}`,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        role: ['Admin', 'User', 'Manager', 'Viewer'][i % 4],
        status: ['active', 'inactive', 'suspended'][i % 3] as any,
        createdAt: new Date(Date.now() - i * 86400000).toISOString(),
        lastLogin: i % 3 === 0 ? new Date(Date.now() - i * 3600000).toISOString() : undefined,
      }));
      setUsers(mockUsers);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'User',
      sortable: true,
      filterable: true,
      render: (_, user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} src={user.avatar} size="sm" />
          <div>
            <p className="font-medium text-slate-900 dark:text-white">{user.name}</p>
            <p className="text-sm text-slate-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      filterable: true,
      render: (role) => (
        <Badge variant={role === 'Admin' ? 'primary' : role === 'Manager' ? 'secondary' : 'info'}>
          {role}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (status) => (
        <Badge
          variant={status === 'active' ? 'success' : status === 'inactive' ? 'warning' : 'danger'}
          dot
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Last Login',
      render: (lastLogin) => (
        <span className="text-sm text-slate-600 dark:text-slate-400">
          {lastLogin ? new Date(lastLogin).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (_, user) => (
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => handleEdit(user)} leftIcon={<Edit className="w-4 h-4" />} />
          <Button variant="ghost" size="sm" onClick={() => handleDelete(user)} leftIcon={<Trash2 className="w-4 h-4 text-danger-600" />} />
        </div>
      ),
    },
  ];

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setFormData({ name: user.name, email: user.email, role: user.role, status: user.status });
    setIsEditModalOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (confirm(`Delete ${user.name}?`)) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id));
      toast.success('User deleted');
    }
  };

  return (
    <>
      <Helmet>
        <title>Users Management - OneSign Admin Portal</title>
      </Helmet>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Users Management</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">Manage platform users</p>
          </div>
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add User
          </Button>
        </motion.div>

        <Card>
          <DataTable columns={columns} data={users} loading={loading} searchable exportable selectable onSelectionChange={setSelectedUsers} />
        </Card>

        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New User">
          <div className="space-y-4">
            <Input label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} leftIcon={<Mail className="w-4 h-4" />} />
            <Dropdown label="Role" options={[{ value: 'Admin', label: 'Admin' }, { value: 'User', label: 'User' }]} value={formData.role} onChange={(value) => setFormData({ ...formData, role: value })} />
          </div>
        </Modal>
      </div>
    </>
  );
};

export default UsersPage;
