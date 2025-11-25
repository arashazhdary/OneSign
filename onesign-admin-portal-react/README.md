# OneSign Admin Portal - React + Vite

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646cff.svg)](https://vitejs.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

پنل مدیریت مدرن OneSign با معماری React + Vite و قابلیت‌های پیشرفته.

## 🎯 ویژگی‌های کلیدی

### ✅ فنی
- ⚡ **Vite** - Build tool سریع و مدرن
- ⚛️ **React 18.3** - با Concurrent Features
- 📘 **TypeScript 5.5** - Type safety کامل
- 🎨 **Tailwind CSS 3.4** - Utility-first styling
- 🌐 **i18n Support** - پشتیبانی کامل از چند زبانه (FA/EN/AR)
- 🔐 **Zustand** - State management سبک و قدرتمند
- 📊 **Recharts** - نمودارهای تعاملی
- 🧪 **Vitest + Playwright** - Testing جامع

### ✅ UX/UI
- 🌓 **Dark/Light Mode** - تم پویا با system preference
- 📱 **PWA Ready** - نصب به عنوان اپلیکیشن
- ♿ **Accessible** - ARIA labels و keyboard navigation
- 📉 **Optimistic Updates** - تجربه سریع و روان
- 💀 **Skeleton Screens** - Loading states بهتر
- 🔄 **Auto Retry** - مدیریت خطاهای شبکه

### ✅ Developer Experience
- 🔥 **Hot Module Replacement** - تغییرات فوری
- 📦 **Code Splitting** - بارگذاری بهینه
- 🎯 **Path Aliases** - Import ساده‌تر
- 🔍 **ESLint + Prettier** - کد تمیز
- 🪝 **Pre-commit Hooks** - Quality assurance
- 📚 **Comprehensive Tests** - 68+ تست

## 📋 پیش‌نیازها

```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

## 🚀 شروع سریع

### نصب

```bash
# Clone repository
git clone https://github.com/DevFrogPlatform/OneSign.git
cd OneSign/onesign-admin-portal-react

# نصب dependencies
npm install

# کپی environment variables
cp .env.example .env.local

# اجرای development server
npm run dev
```

سایت در `http://localhost:3000` در دسترس خواهد بود.

## 📜 دستورات NPM

```bash
# Development
npm run dev              # شروع dev server با HMR
npm run dev:host        # شروع dev server در network

# Build
npm run build           # Build production
npm run preview         # پیش‌نمایش build

# Testing
npm run test            # اجرای unit tests
npm run test:ui         # Vitest UI
npm run test:coverage   # گزارش coverage
npm run test:e2e        # اجرای E2E tests
npm run test:e2e:ui     # Playwright UI mode

# Linting & Formatting
npm run lint            # ESLint check
npm run lint:fix        # Auto-fix issues
npm run format          # Format با Prettier

# Type Checking
npm run type-check      # TypeScript check بدون build
```

## 🏗️ معماری پروژه

```
onesign-admin-portal-react/
├── e2e/                          # Playwright E2E tests
│   ├── login.spec.ts
│   ├── users.spec.ts
│   ├── tenants.spec.ts
│   └── roles.spec.ts
├── public/                       # فایل‌های استاتیک
│   ├── manifest.json            # PWA manifest
│   └── sw.js                    # Service Worker
├── src/
│   ├── components/              # React components
│   │   ├── common/              # کامپوننت‌های مشترک
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── DataTable.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── LoadingState.tsx
│   │   │   ├── TableSkeleton.tsx
│   │   │   └── CardSkeleton.tsx
│   │   ├── email/               # Email templates
│   │   │   ├── EmailTemplate.tsx
│   │   │   ├── WelcomeEmail.tsx
│   │   │   ├── PasswordResetEmail.tsx
│   │   │   └── InvitationEmail.tsx
│   │   └── layout/              # Layout components
│   ├── hooks/                   # Custom React hooks
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useSessionManagement.ts
│   │   ├── useBulkOperations.ts
│   │   ├── useOptimisticUpdate.ts
│   │   └── useOptimisticList.ts
│   ├── i18n/                    # Internationalization
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── en.json          # 420+ translation keys
│   │       ├── fa.json
│   │       └── ar.json
│   ├── pages/                   # صفحات اصلی
│   │   ├── admin/
│   │   ├── superadmin/
│   │   └── tenant/
│   ├── services/                # API services
│   │   ├── api.ts               # API client با retry
│   │   ├── auth.api.ts
│   │   └── users.api.ts
│   ├── stores/                  # Zustand stores
│   │   ├── authStore.ts
│   │   └── themeStore.ts
│   ├── tests/                   # Unit & Integration tests
│   │   ├── components/
│   │   ├── hooks/
│   │   └── integration/
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   │   ├── sentry.ts            # Error tracking
│   │   ├── pwa.ts
│   │   └── validation.ts
│   ├── App.tsx                  # Root component
│   ├── main.tsx                 # Entry point
│   └── index.css                # Global styles
├── .env.example                 # نمونه environment variables
├── playwright.config.ts         # Playwright configuration
├── vite.config.ts              # Vite configuration
├── vitest.config.ts            # Vitest configuration
├── tailwind.config.js          # Tailwind configuration
├── tsconfig.json               # TypeScript configuration
└── package.json
```

## 🧪 استراتژی تست

### Unit Tests (Vitest + React Testing Library)
- **Components**: Button, Input, DataTable, Modal
- **Hooks**: useKeyboardShortcuts, useSessionManagement, useBulkOperations
- **Utils**: Validation, Formatting

### Integration Tests
- **Auth Flow**: Login, Logout, Token Refresh
- **CRUD Operations**: Users, Roles, Tenants
- **Bulk Operations**: Multi-select, Bulk delete/update
- **Export**: PDF, Excel, CSV

### E2E Tests (Playwright)
- **User Journeys**: Login → Dashboard → CRUD → Logout
- **Multi-browser**: Chrome, Firefox, Safari, Mobile
- **Visual Regression**: Screenshot comparison

```bash
# اجرای همه تست‌ها
npm run test:all

# فقط unit tests
npm run test

# فقط E2E tests
npm run test:e2e

# با UI
npm run test:ui
npm run test:e2e:ui
```

## 🌍 چند زبانگی (i18n)

پروژه از 3 زبان پشتیبانی می‌کند:

```typescript
// استفاده در کامپوننت
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('dashboard.welcome')}</h1>
      <button onClick={() => i18n.changeLanguage('fa')}>
        فارسی
      </button>
    </div>
  );
}
```

### افزودن ترجمه جدید

1. ترجمه را در `src/i18n/locales/[lang].json` اضافه کنید
2. از key در کامپوننت استفاده کنید: `t('your.key')`

## 🔐 احراز هویت

```typescript
// استفاده از auth store
import { useAuthStore } from '@/stores/authStore';

function MyComponent() {
  const { user, login, logout } = useAuthStore();

  const handleLogin = async () => {
    await login(credentials);
  };

  return user ? <Dashboard /> : <Login />;
}
```

## 📊 مدیریت State

### Zustand Stores

```typescript
// Auth Store
const useAuthStore = create<AuthState>((set) => ({
  user: null,
  login: (user) => set({ user }),
  logout: () => set({ user: null }),
}));

// Theme Store
const useThemeStore = create<ThemeState>((set) => ({
  theme: 'light',
  toggleTheme: () => set((state) => ({
    theme: state.theme === 'light' ? 'dark' : 'light'
  })),
}));
```

## 🎨 استایل و Theming

### Tailwind CSS

```tsx
// استفاده از utility classes
<button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700">
  Click me
</button>

// استفاده از custom colors
// tailwind.config.js
colors: {
  primary: '#3b82f6',
  secondary: '#a855f7',
}
```

### Dark Mode

```tsx
// Automatic dark mode support
<div className="bg-white dark:bg-slate-800">
  <p className="text-slate-900 dark:text-white">
    Auto dark mode
  </p>
</div>
```

## 📡 API Integration

### API Client

```typescript
import { apiClient } from '@/services/api';

// Automatic retry & token refresh
const users = await apiClient.get('/users');

// File upload با progress
await apiClient.uploadFile('/upload', file, {
  onProgress: (progress) => console.log(progress)
});

// File download
await apiClient.downloadFile('/export/pdf', 'users.pdf');
```

### Service Layer

```typescript
import { usersApi } from '@/services/users.api';

// Type-safe API calls
const users = await usersApi.list({ page: 1, pageSize: 10 });
const user = await usersApi.getById('123');
await usersApi.update('123', { name: 'Updated' });
await usersApi.delete('123');
```

## ⚡ Performance

### Code Splitting

```typescript
// Lazy loading صفحات
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Users = lazy(() => import('@/pages/admin/Users'));

// در Router
<Suspense fallback={<LoadingState />}>
  <Routes>
    <Route path="/dashboard" element={<Dashboard />} />
  </Routes>
</Suspense>
```

### Optimistic Updates

```typescript
import { useOptimisticList } from '@/hooks/useOptimisticList';

const { list, update, remove } = useOptimisticList(initialData);

// UI فوراً update می‌شود، در صورت خطا rollback می‌شود
await update(id, { name: 'New Name' }, updateFn, {
  successMessage: 'Updated successfully',
  errorMessage: 'Update failed'
});
```

## 🐛 Error Tracking

### Sentry Integration

```typescript
// خودکار در production فعال می‌شود
// .env
VITE_SENTRY_DSN=your_sentry_dsn

// Manual error reporting
import * as Sentry from '@sentry/react';

try {
  // risky operation
} catch (error) {
  Sentry.captureException(error);
}
```

## 📱 PWA Features

### قابلیت نصب

```typescript
// Auto install prompt
setupInstallPrompt();

// Manual trigger
const installButton = document.getElementById('install');
installButton?.addEventListener('click', () => {
  deferredPrompt.prompt();
});
```

### Offline Support

```typescript
// Service Worker خودکار cache می‌کند
// public/sw.js
const CACHE_NAME = 'onesign-v1';
const urlsToCache = ['/index.html', '/assets/*'];
```

## 🔒 Security

### Headers

```typescript
// vite.config.ts
headers: {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000'
}
```

### Input Validation

```typescript
import { validateEmail, validatePassword } from '@/utils/validation';

const errors = validateEmail(email);
if (errors.length > 0) {
  // handle errors
}
```

## 📦 Build و Deployment

### Production Build

```bash
npm run build

# Output
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── react-vendor-[hash].js
│   └── styles-[hash].css
└── manifest.json
```

### Docker Deployment

```bash
# Build image
docker build -t onesign-admin-portal .

# Run container
docker run -p 3000:80 onesign-admin-portal

# با docker-compose
docker-compose up -d
```

### Environment Variables

```bash
# .env.production
VITE_API_URL=https://api.production.com
VITE_SENTRY_DSN=your_production_dsn
VITE_GTM_ID=GTM-XXXXXX
```

## 🤝 مشارکت

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

### Commit Convention

```
feat: ویژگی جدید
fix: رفع bug
docs: تغییر مستندات
style: تغییر استایل (formatting, etc)
refactor: refactoring کد
test: افزودن تست
chore: کارهای maintenance
```

## 📄 License

این پروژه تحت لایسنس MIT است - فایل [LICENSE](LICENSE) را ببینید.

## 👥 تیم توسعه

- **Frontend Lead**: OneSign Team
- **Architecture**: DevFrog Platform
- **UI/UX**: Design Team

## 📞 پشتیبانی

- 📧 Email: support@onesign.com
- 🐛 Issues: [GitHub Issues](https://github.com/DevFrogPlatform/OneSign/issues)
- 📚 Docs: [Documentation](https://docs.onesign.com)

## 🎯 Roadmap

- [ ] Real-time notifications با WebSocket
- [ ] Advanced analytics dashboard
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Audit log system
- [ ] Two-factor authentication
- [ ] SSO integration

---

**Made with ❤️ by DevFrog Platform**
