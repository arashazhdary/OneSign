# Custom Hooks, Context Providers & Utilities

این مستند شامل تمام Custom Hooks، Context Providers و Utility Functions ساخته شده برای OneSign Admin Portal است.

## 📁 ساختار فایل‌ها

```
onesign-admin-portal/
├── app/
│   ├── hooks/                    # Custom React Hooks
│   │   ├── index.ts             # Export همه hooks
│   │   ├── useApi.ts            # Generic API hook
│   │   ├── useUsers.ts          # Users management
│   │   ├── useApplications.ts   # Applications management
│   │   ├── useIncidents.ts      # Incidents management
│   │   ├── useModal.ts          # Modal state
│   │   ├── useToast.ts          # Toast notifications
│   │   ├── useDisclosure.ts     # Open/close state
│   │   ├── useDebounce.ts       # Debounce values
│   │   ├── useLocalStorage.ts   # LocalStorage sync
│   │   ├── useMediaQuery.ts     # Responsive breakpoints
│   │   ├── useForm.ts           # Form management
│   │   ├── useFormValidation.ts # Validation helpers
│   │   ├── useAuth.ts           # Authentication
│   │   ├── usePermissions.ts    # Permission checks
│   │   ├── usePagination.ts     # Pagination logic
│   │   ├── useInfiniteScroll.ts # Infinite scroll
│   │   ├── useAsync.ts          # Async operations
│   │   ├── useInterval.ts       # Interval with cleanup
│   │   ├── useEventListener.ts  # Event listeners
│   │   ├── useClickOutside.ts   # Click outside detection
│   │   └── useKeyPress.ts       # Keyboard shortcuts
│   │
│   └── contexts/                 # React Context Providers
│       ├── index.ts             # Export همه contexts
│       ├── AuthContext.tsx      # Authentication state
│       ├── ThemeContext.tsx     # Theme management
│       ├── TenantContext.tsx    # Multi-tenancy
│       ├── NotificationContext.tsx # Notifications
│       └── UIContext.tsx        # UI state management
│
└── lib/
    └── utils/                    # Utility Functions
        ├── index.ts             # Export همه utilities
        ├── date.ts              # Date formatting
        ├── currency.ts          # Currency formatting
        ├── number.ts            # Number formatting
        ├── string.ts            # String helpers
        ├── email.ts             # Email validation
        ├── phone.ts             # Phone validation
        ├── password.ts          # Password validation
        ├── cn.ts                # className merger
        ├── colors.ts            # Color utilities
        └── storage.ts           # Storage helpers
```

---

## 🎣 Custom Hooks

### Data Fetching Hooks

#### `useApi<T>`
Generic API hook با مدیریت loading/error states.

```typescript
const { data, loading, error, execute, reset, refetch } = useApi(fetchUsers, {
  immediate: true,
  onSuccess: (data) => console.log('Success:', data),
  onError: (error) => console.error('Error:', error)
});
```

#### `useUsers()`
مدیریت کاربران.

```typescript
const { data: users, loading, error } = useUsers();
const { createUser, loading } = useCreateUser();
const { updateUser, loading } = useUpdateUser();
const { deleteUser, loading } = useDeleteUser();
```

#### `useApplications()`
مدیریت اپلیکیشن‌ها.

```typescript
const { data: applications, loading } = useApplications();
const { createApplication } = useCreateApplication();
```

#### `useIncidents()`
مدیریت رویدادها.

```typescript
const { data: incidents, loading } = useIncidents();
const { assignIncident } = useAssignIncident();
const { resolveIncident } = useResolveIncident();
```

---

### UI State Hooks

#### `useModal()`
مدیریت state مودال‌ها.

```typescript
const modal = useModal();

<button onClick={modal.open}>Open Modal</button>
<Modal isOpen={modal.isOpen} onClose={modal.close} />
```

#### `useToast()`
مدیریت toast notifications.

```typescript
const toast = useToast();

toast.success('عملیات موفقیت‌آمیز بود!');
toast.error('خطایی رخ داد');
toast.warning('هشدار');
toast.info('اطلاعات');
```

#### `useDisclosure()`
مدیریت حالت باز/بسته.

```typescript
const { isOpen, onOpen, onClose, onToggle } = useDisclosure();
```

#### `useDebounce<T>`
Debounce کردن مقادیر.

```typescript
const [search, setSearch] = useState('');
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  searchUsers(debouncedSearch);
}, [debouncedSearch]);
```

#### `useLocalStorage<T>`
همگام‌سازی با localStorage.

```typescript
const [theme, setTheme] = useLocalStorage('theme', 'light');
```

#### `useMediaQuery()`
Responsive breakpoints.

```typescript
const isMobile = useMediaQuery('(max-width: 768px)');
const { isMobile, isTablet, isDesktop } = useBreakpoint();
```

---

### Form Hooks

#### `useForm<T>`
مدیریت فرم با validation.

```typescript
const form = useForm({
  initialValues: { email: '', password: '' },
  validationRules: {
    email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    password: { required: true, minLength: 8 }
  },
  onSubmit: async (values) => {
    await login(values);
  }
});

<form onSubmit={form.handleSubmit}>
  <input
    name="email"
    value={form.values.email}
    onChange={form.handleChange}
    onBlur={form.handleBlur}
  />
  {form.errors.email && <span>{form.errors.email}</span>}
</form>
```

#### `useFormValidation()`
Validation helpers.

```typescript
const emailValidation = useFormValidation([
  validators.required(),
  validators.email()
]);
```

---

### Auth Hooks

#### `useAuth()`
دسترسی به authentication state.

```typescript
const { user, isAuthenticated, login, logout, refreshToken } = useAuth();

if (!isAuthenticated) {
  return <LoginPage />;
}
```

#### `usePermissions()`
بررسی مجوزها.

```typescript
const { hasPermission, hasRole, isAdmin } = usePermissions();

if (hasPermission('users.create')) {
  return <CreateUserButton />;
}

if (isAdmin()) {
  return <AdminPanel />;
}
```

---

### Pagination Hooks

#### `usePagination()`
منطق صفحه‌بندی.

```typescript
const pagination = usePagination({
  totalItems: 100,
  itemsPerPage: 10,
  initialPage: 1
});

const paginatedData = data.slice(
  pagination.startIndex,
  pagination.endIndex
);
```

#### `useInfiniteScroll()`
Infinite scroll.

```typescript
const { ref, isIntersecting } = useInfiniteScroll({
  threshold: 0.5,
  enabled: hasMore && !loading
});

useEffect(() => {
  if (isIntersecting) {
    loadMore();
  }
}, [isIntersecting]);
```

---

### Other Hooks

#### `useAsync<T>`
عملیات async.

```typescript
const { data, loading, error, execute } = useAsync(
  async (userId) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  }
);
```

#### `useInterval()`
setInterval با cleanup.

```typescript
useInterval(() => {
  setCount(count + 1);
}, 1000);
```

#### `useEventListener()`
Event listeners.

```typescript
useEventListener('resize', () => {
  console.log('Window resized');
});
```

#### `useClickOutside()`
تشخیص کلیک خارج از element.

```typescript
const ref = useRef<HTMLDivElement>(null);
useClickOutside(ref, () => {
  setIsOpen(false);
});
```

#### `useKeyPress()`
Keyboard shortcuts.

```typescript
const enterPressed = useKeyPress('Enter');
const saveShortcut = useKeyPress('s', { ctrlKey: true });
```

---

## 🌐 Context Providers

### AuthContext
مدیریت authentication.

```typescript
<AuthProvider>
  <App />
</AuthProvider>

// استفاده
const { user, login, logout } = useAuth();
```

**امکانات:**
- مدیریت user state
- login/logout
- token management
- refresh token
- permissions

---

### ThemeContext
مدیریت تم (light/dark).

```typescript
<ThemeProvider defaultTheme="system">
  <App />
</ThemeProvider>

// استفاده
const { theme, effectiveTheme, setTheme, toggleTheme } = useContext(ThemeContext);
```

**امکانات:**
- تشخیص تم سیستم
- ذخیره تم در localStorage
- تغییر تم

---

### TenantContext
Multi-tenancy support.

```typescript
<TenantProvider>
  <App />
</TenantProvider>

// استفاده
const { currentTenant, tenants, switchTenant } = useContext(TenantContext);
```

**امکانات:**
- مدیریت tenant جاری
- تغییر tenant
- مجوزهای tenant

---

### NotificationContext
مدیریت اعلان‌ها.

```typescript
<NotificationProvider>
  <App />
</NotificationProvider>

// استفاده
const { notifications, unreadCount, addNotification, markAsRead } = useContext(NotificationContext);
```

**امکانات:**
- ذخیره اعلان‌ها
- تعداد خوانده نشده
- علامت‌گذاری به عنوان خوانده شده

---

### UIContext
مدیریت UI state.

```typescript
<UIProvider>
  <App />
</UIProvider>

// استفاده
const { sidebarOpen, toggleSidebar, openModal, isLoading } = useContext(UIContext);
```

**امکانات:**
- وضعیت sidebar
- مدیریت modal‌ها
- loading states
- global loading

---

## 🛠️ Utilities

### Formatters

#### Date Utilities (`date.ts`)
```typescript
import { formatShortDate, formatLongDate, timeAgo } from '@/lib/utils/date';

formatShortDate(new Date());           // "12/31/2023"
formatLongDate(new Date());            // "December 31, 2023"
timeAgo(new Date());                   // "2 hours ago"
formatRelativeTime(futureDate);        // "in 3 days"
```

#### Currency Utilities (`currency.ts`)
```typescript
import { formatCurrency, formatUSD, formatCompactCurrency } from '@/lib/utils/currency';

formatUSD(1234.56);                    // "$1,234.56"
formatCompactCurrency(1234567);        // "$1.2M"
applyDiscount(100, 10);                // 90
```

#### Number Utilities (`number.ts`)
```typescript
import { formatNumber, formatPercentage, formatBytes } from '@/lib/utils/number';

formatWithSeparators(1234567);         // "1,234,567"
formatPercentage(0.856);               // "85.6%"
formatBytes(1024000);                  // "1.00 MB"
formatCompact(1234567);                // "1.2M"
```

#### String Utilities (`string.ts`)
```typescript
import { capitalize, camelCase, truncate, slugify } from '@/lib/utils/string';

capitalize('hello world');             // "Hello world"
camelCase('hello world');              // "helloWorld"
kebabCase('Hello World');              // "hello-world"
truncate('Long text...', 10);          // "Long te..."
slugify('Hello World!');               // "hello-world"
```

---

### Validators

#### Email Validation (`email.ts`)
```typescript
import { isValidEmail, maskEmail, isDisposableEmail } from '@/lib/utils/email';

isValidEmail('test@example.com');      // true
maskEmail('john@example.com');         // "j**n@example.com"
isDisposableEmail('test@tempmail.com');// true
```

#### Phone Validation (`phone.ts`)
```typescript
import { isValidPhone, formatUSPhone, maskPhone } from '@/lib/utils/phone';

isValidPhone('1234567890');            // true
formatUSPhone('1234567890');           // "(123) 456-7890"
maskPhone('1234567890');               // "******7890"
```

#### Password Validation (`password.ts`)
```typescript
import { validatePassword, checkPasswordStrength, generatePassword } from '@/lib/utils/password';

validatePassword('MyP@ss123');         // { valid: true, errors: [] }
checkPasswordStrength('weak');         // { score: 1, label: 'Weak', feedback: [...] }
generatePassword(16);                  // "Xy9@mK3#pL2$qR8!"
```

---

### Helpers

#### ClassName Merger (`cn.ts`)
```typescript
import { cn } from '@/lib/utils/cn';

cn('px-2 py-1', 'px-4');              // "py-1 px-4" (حل تعارض)
cn('text-red-500', { 'text-blue-500': isActive }); // "text-blue-500"
```

#### Color Utilities (`colors.ts`)
```typescript
import { hexToRgb, lighten, darken, getContrastColor } from '@/lib/utils/colors';

hexToRgb('#ff0000');                  // { r: 255, g: 0, b: 0 }
lighten('#3b82f6', 20);               // "#6fa3f8"
darken('#3b82f6', 20);                // "#1e5cd4"
getContrastColor('#000000');          // "#ffffff"
```

#### Storage Helpers (`storage.ts`)
```typescript
import { localStorage, sessionStorage, cookieStorage } from '@/lib/utils/storage';

localStorage.set('key', { data: 'value' });
const data = localStorage.get('key');
localStorage.setWithExpiry('key', data, 3600000); // 1 hour

sessionStorage.set('temp', 'data');
cookieStorage.set('token', 'abc123', 7); // 7 days
```

---

## 📦 نصب و استفاده

### Import Hooks
```typescript
import { useApi, useUsers, useModal, useForm } from '@/app/hooks';
```

### Import Contexts
```typescript
import { AuthProvider, ThemeProvider, useAuth } from '@/app/contexts';
```

### Import Utilities
```typescript
import { formatCurrency, isValidEmail, cn } from '@/lib/utils';
```

---

## 🎯 مثال‌های کاربردی

### مثال 1: فرم Login با Validation
```typescript
import { useForm, validators } from '@/app/hooks';
import { useAuth } from '@/app/contexts';

function LoginForm() {
  const { login } = useAuth();

  const form = useForm({
    initialValues: { email: '', password: '' },
    validationRules: {
      email: {
        required: 'ایمیل الزامی است',
        pattern: {
          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
          message: 'ایمیل معتبر نیست'
        }
      },
      password: {
        required: true,
        minLength: { value: 8, message: 'رمز عبور باید حداقل 8 کاراکتر باشد' }
      }
    },
    onSubmit: async (values) => {
      await login(values.email, values.password);
    }
  });

  return (
    <form onSubmit={form.handleSubmit}>
      <input
        type="email"
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      {form.touched.email && form.errors.email && (
        <span>{form.errors.email}</span>
      )}

      <button type="submit" disabled={form.isSubmitting}>
        {form.isSubmitting ? 'در حال ورود...' : 'ورود'}
      </button>
    </form>
  );
}
```

### مثال 2: جدول با Pagination
```typescript
import { useUsers, usePagination } from '@/app/hooks';

function UsersTable() {
  const { data: users, loading } = useUsers();

  const pagination = usePagination({
    totalItems: users?.length || 0,
    itemsPerPage: 10
  });

  const paginatedUsers = users?.slice(
    pagination.startIndex,
    pagination.endIndex
  );

  return (
    <div>
      <table>
        {paginatedUsers?.map(user => (
          <tr key={user.id}>
            <td>{user.name}</td>
          </tr>
        ))}
      </table>

      <div>
        <button
          onClick={pagination.previousPage}
          disabled={!pagination.hasPreviousPage}
        >
          قبلی
        </button>

        <span>{pagination.currentPage} / {pagination.totalPages}</span>

        <button
          onClick={pagination.nextPage}
          disabled={!pagination.hasNextPage}
        >
          بعدی
        </button>
      </div>
    </div>
  );
}
```

### مثال 3: Toast Notifications
```typescript
import { useToast } from '@/app/hooks';

function MyComponent() {
  const toast = useToast();

  const handleSave = async () => {
    try {
      await saveData();
      toast.success('داده‌ها با موفقیت ذخیره شد');
    } catch (error) {
      toast.error('خطا در ذخیره داده‌ها');
    }
  };

  return <button onClick={handleSave}>ذخیره</button>;
}
```

---

## 📝 نکات مهم

1. **TypeScript Support**: تمام hooks و utilities با TypeScript نوشته شده‌اند
2. **Tree Shaking**: تمام exports از فایل‌های index قابل tree-shake هستند
3. **SSR Safe**: تمام hooks با Next.js و SSR سازگار هستند
4. **Performance**: از useMemo و useCallback برای بهینه‌سازی استفاده شده
5. **Error Handling**: همه hooks دارای مدیریت خطای مناسب هستند

---

## 🚀 توسعه آینده

- [ ] افزودن تست‌های واحد
- [ ] بهبود مستندسازی
- [ ] افزودن storybook
- [ ] بهینه‌سازی بیشتر performance

---

تاریخ ساخت: 2025-11-21
نسخه: 1.0.0
