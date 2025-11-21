# Navigation System Usage Guide

## Quick Start

### 1. Basic Usage with Layout Component

```tsx
import Layout from '@/app/components/Layout';

export default function MyPage() {
  const user = {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'Admin'
  };

  return (
    <Layout user={user}>
      <div>
        <h1>My Page Content</h1>
      </div>
    </Layout>
  );
}
```

### 2. Using with Custom Hooks

```tsx
import LayoutWithHooks from '@/app/components/LayoutWithHooks';

export default function DashboardPage() {
  return (
    <LayoutWithHooks>
      <div>
        <h1>Dashboard</h1>
      </div>
    </LayoutWithHooks>
  );
}
```

### 3. Using Navigation Hook

```tsx
'use client';

import { useNavigation } from '@/app/hooks/useNavigation';

export default function MyComponent() {
  const { theme, toggleTheme, language, changeLanguage } = useNavigation();

  return (
    <div>
      <button onClick={toggleTheme}>
        Current theme: {theme}
      </button>
      <button onClick={() => changeLanguage('fa')}>
        Change to Persian
      </button>
    </div>
  );
}
```

### 4. Using Notifications Hook

```tsx
'use client';

import { useNotifications } from '@/app/hooks/useNavigation';

export default function NotificationsExample() {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification
  } = useNotifications([]);

  const handleAddNotification = () => {
    addNotification({
      id: Date.now().toString(),
      title: 'New Notification',
      message: 'This is a test notification',
      type: 'info',
      read: false,
      timestamp: new Date()
    });
  };

  return (
    <div>
      <p>Unread: {unreadCount}</p>
      <button onClick={handleAddNotification}>Add Notification</button>
      <button onClick={markAllAsRead}>Mark All Read</button>
    </div>
  );
}
```

### 5. Customizing Menu Items

Edit `/app/config/navigation.ts`:

```tsx
export const menuItems: MenuItem[] = [
  {
    id: 'my-section',
    label: 'My Section',
    icon: 'HomeIcon',
    href: '/my-section',
    badge: 5, // Number badge
  },
  {
    id: 'new-feature',
    label: 'New Feature',
    icon: 'BoltIcon',
    href: '/new-feature',
    badge: 'New', // Text badge
    roles: ['admin'], // Only visible to admins
  },
];
```

### 6. Custom Breadcrumb Labels

```tsx
<Layout
  breadcrumbLabels={{
    '/users': 'User Management',
    '/users/create': 'Create New User',
    '/security': 'Security Dashboard',
  }}
>
  {children}
</Layout>
```

### 7. Tenant/Organization Switching

```tsx
const tenants = [
  { id: '1', name: 'Organization A' },
  { id: '2', name: 'Organization B' },
];

const handleTenantChange = (tenant) => {
  console.log('Switched to:', tenant.name);
  // Update your app state/context
};

<Layout
  tenant={tenants[0]}
  tenants={tenants}
  onTenantChange={handleTenantChange}
>
  {children}
</Layout>
```

## File Structure

```
app/
├── components/
│   ├── Sidebar.tsx              # Main sidebar component
│   ├── TopBar.tsx               # Top navigation bar
│   ├── Layout.tsx               # Main layout wrapper
│   ├── Breadcrumbs.tsx          # Breadcrumb navigation
│   ├── NotificationDropdown.tsx # Notifications dropdown
│   ├── Icon.tsx                 # Icon component
│   ├── LayoutExample.tsx        # Basic usage example
│   ├── LayoutWithHooks.tsx      # Advanced usage with hooks
│   └── navigation/
│       └── index.ts             # Easy imports
├── types/
│   └── navigation.ts            # TypeScript types
├── config/
│   └── navigation.ts            # Menu configuration
├── hooks/
│   └── useNavigation.ts         # Custom hooks
├── utils/
│   └── navigation.ts            # Helper functions
├── constants/
│   └── navigation.ts            # Constants
└── styles/
    └── navigation.css           # Custom animations
```

## Features

- ✅ Collapsible sidebar with smooth animations
- ✅ Nested menu items with expand/collapse
- ✅ Search functionality in sidebar
- ✅ Active route detection
- ✅ Badge notifications (number & text)
- ✅ Role-based menu visibility
- ✅ Tenant/organization switching
- ✅ Dark/light theme toggle
- ✅ Multi-language support
- ✅ Real-time notifications
- ✅ Breadcrumb navigation
- ✅ User profile menu
- ✅ Responsive mobile menu
- ✅ Keyboard navigation support
- ✅ Accessibility features

## Import Shortcuts

```tsx
// Instead of multiple imports:
import Sidebar from '@/app/components/Sidebar';
import TopBar from '@/app/components/TopBar';
import Layout from '@/app/components/Layout';

// Use single import:
import { Sidebar, TopBar, Layout, Icon } from '@/app/components/navigation';
```

## Styling

The navigation system uses Tailwind CSS. To customize colors and styles:

1. Edit Tailwind classes in components
2. Use `/app/styles/navigation.css` for custom animations
3. All colors support dark mode automatically

## Icons

Available icons in Icon component:
- HomeIcon, UsersIcon, RectangleStackIcon
- ShieldCheckIcon, KeyIcon, DocumentCheckIcon
- BoltIcon, CodeBracketIcon, Cog6ToothIcon
- ChevronDownIcon, ChevronRightIcon, MagnifyingGlassIcon
- BellIcon, UserCircleIcon, ArrowRightOnRectangleIcon
- SunIcon, MoonIcon, LanguageIcon
- Bars3Icon, XMarkIcon, BuildingOfficeIcon
- ChevronUpDownIcon

Add more icons in `/app/components/Icon.tsx`.

## Tips

1. **Performance**: Menu items are memoized and filtered efficiently
2. **SEO**: Use proper semantic HTML with nav, header, main tags
3. **Accessibility**: All interactive elements have proper ARIA labels
4. **Mobile**: Touch-friendly with proper tap targets
5. **Print**: Navigation hides automatically when printing
