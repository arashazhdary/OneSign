'use client';

/**
 * این فایل یک مثال کامل از نحوه استفاده از Custom Hooks،
 * Context Providers و Utilities است
 */

import { useState, useEffect } from 'react';

// Import Hooks
import {
  useUsers,
  useModal,
  useToast,
  useDebounce,
  useForm,
  useAuth,
  usePermissions,
  usePagination,
  useKeyPress,
} from '@/app/hooks';

// Import Utilities
import {
  formatCurrency,
  formatShortDate,
  timeAgo,
  isValidEmail,
  cn,
  capitalize,
} from '@/lib/utils';

/**
 * مثال: صفحه مدیریت کاربران
 */
export function UsersManagementExample() {
  // ========== Authentication & Permissions ==========
  const { user, isAuthenticated } = useAuth();
  const { hasPermission } = usePermissions();

  // ========== Data Fetching ==========
  const { data: users, loading, error, refetch } = useUsers();

  // ========== UI State ==========
  const modal = useModal();
  const toast = useToast();

  // ========== Search with Debounce ==========
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);

  // ========== Pagination ==========
  const pagination = usePagination({
    totalItems: users?.length || 0,
    itemsPerPage: 10,
    initialPage: 1,
  });

  // ========== Form Management ==========
  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      role: 'user',
    },
    validationRules: {
      name: {
        required: 'نام الزامی است',
        minLength: { value: 3, message: 'نام باید حداقل 3 کاراکتر باشد' },
      },
      email: {
        required: 'ایمیل الزامی است',
        validate: (value: string) => {
          if (!isValidEmail(value)) {
            return 'ایمیل معتبر نیست';
          }
          return true;
        },
      },
    },
    onSubmit: async (values) => {
      try {
        // Create user logic here
        toast.success(`کاربر ${values.name} با موفقیت ایجاد شد`);
        modal.close();
        refetch();
      } catch (error) {
        toast.error('خطا در ایجاد کاربر');
      }
    },
  });

  // ========== Keyboard Shortcuts ==========
  const ctrlS = useKeyPress('s', { ctrlKey: true });

  useEffect(() => {
    if (ctrlS) {
      form.handleSubmit();
    }
  }, [ctrlS]);

  // ========== Search Effect ==========
  useEffect(() => {
    if (debouncedSearch) {
      // Filter users based on search
      console.log('Searching for:', debouncedSearch);
    }
  }, [debouncedSearch]);

  // ========== Filtered & Paginated Data ==========
  const filteredUsers = users?.filter(
    (user) =>
      user.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      user.email?.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  const paginatedUsers = filteredUsers?.slice(
    pagination.startIndex,
    pagination.endIndex
  );

  // ========== Permissions Check ==========
  if (!isAuthenticated) {
    return <div>لطفا وارد شوید</div>;
  }

  if (!hasPermission('users.read')) {
    return <div>شما دسترسی به این صفحه ندارید</div>;
  }

  // ========== Render ==========
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">مدیریت کاربران</h1>

        {hasPermission('users.create') && (
          <button
            onClick={modal.open}
            className={cn(
              'rounded-lg bg-blue-500 px-4 py-2 text-white',
              'hover:bg-blue-600 transition-colors'
            )}
          >
            افزودن کاربر جدید
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="جستجوی کاربران..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-4 py-2"
        />
      </div>

      {/* Loading State */}
      {loading && <div>در حال بارگذاری...</div>}

      {/* Error State */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          خطا: {error.message}
        </div>
      )}

      {/* Users Table */}
      {!loading && !error && (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    نام
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    ایمیل
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    نقش
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    تاریخ ایجاد
                  </th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">
                    عملیات
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedUsers?.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {capitalize(user.name || '')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {user.role}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {timeAgo(user.createdAt || '')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button className="text-blue-600 hover:text-blue-800">
                        ویرایش
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              نمایش {pagination.startIndex + 1} تا {pagination.endIndex} از{' '}
              {filteredUsers?.length} کاربر
            </div>

            <div className="flex gap-2">
              <button
                onClick={pagination.previousPage}
                disabled={!pagination.hasPreviousPage}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm',
                  pagination.hasPreviousPage
                    ? 'hover:bg-gray-50'
                    : 'cursor-not-allowed opacity-50'
                )}
              >
                قبلی
              </button>

              <div className="flex items-center gap-1">
                {pagination.getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => pagination.goToPage(page)}
                    className={cn(
                      'rounded-lg px-4 py-2 text-sm',
                      page === pagination.currentPage
                        ? 'bg-blue-500 text-white'
                        : 'hover:bg-gray-50'
                    )}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={pagination.nextPage}
                disabled={!pagination.hasNextPage}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm',
                  pagination.hasNextPage
                    ? 'hover:bg-gray-50'
                    : 'cursor-not-allowed opacity-50'
                )}
              >
                بعدی
              </button>
            </div>
          </div>
        </>
      )}

      {/* Create User Modal */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6">
            <h2 className="mb-4 text-xl font-bold">افزودن کاربر جدید</h2>

            <form onSubmit={form.handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">نام</label>
                <input
                  type="text"
                  name="name"
                  value={form.values.name}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className={cn(
                    'w-full rounded-lg border px-4 py-2',
                    form.touched.name && form.errors.name
                      ? 'border-red-500'
                      : 'border-gray-300'
                  )}
                />
                {form.touched.name && form.errors.name && (
                  <p className="mt-1 text-sm text-red-500">{form.errors.name}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">ایمیل</label>
                <input
                  type="email"
                  name="email"
                  value={form.values.email}
                  onChange={form.handleChange}
                  onBlur={form.handleBlur}
                  className={cn(
                    'w-full rounded-lg border px-4 py-2',
                    form.touched.email && form.errors.email
                      ? 'border-red-500'
                      : 'border-gray-300'
                  )}
                />
                {form.touched.email && form.errors.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {form.errors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">نقش</label>
                <select
                  name="role"
                  value={form.values.role}
                  onChange={form.handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2"
                >
                  <option value="user">کاربر</option>
                  <option value="admin">ادمین</option>
                  <option value="moderator">مدیر</option>
                </select>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={modal.close}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={form.isSubmitting || !form.isValid}
                  className={cn(
                    'rounded-lg bg-blue-500 px-4 py-2 text-sm text-white',
                    form.isSubmitting || !form.isValid
                      ? 'cursor-not-allowed opacity-50'
                      : 'hover:bg-blue-600'
                  )}
                >
                  {form.isSubmitting ? 'در حال ایجاد...' : 'ایجاد کاربر'}
                </button>
              </div>

              <p className="text-xs text-gray-500">
                میانبر: Ctrl+S برای ذخیره
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-4 left-4 z-50 space-y-2">
        {toast.toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              'rounded-lg px-6 py-4 shadow-lg',
              t.type === 'success' && 'bg-green-500 text-white',
              t.type === 'error' && 'bg-red-500 text-white',
              t.type === 'warning' && 'bg-yellow-500 text-white',
              t.type === 'info' && 'bg-blue-500 text-white'
            )}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-medium">{t.message}</p>
                {t.description && (
                  <p className="mt-1 text-sm opacity-90">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => toast.remove(t.id)}
                className="text-xl font-bold opacity-75 hover:opacity-100"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UsersManagementExample;
