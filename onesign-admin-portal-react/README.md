# OneSign Admin Portal - React Edition

A modern, beautiful, and performant admin portal built with React 18, Vite, TypeScript, and Tailwind CSS.

## ✨ Features

### 🎨 Modern UI/UX Design
- **Beautiful Interface**: Sleek, minimalistic design inspired by Figma prototypes and premium admin templates
- **Smooth Animations**: Framer Motion-powered animations for a polished user experience
- **Glass Morphism**: Modern frosted glass effects for a premium look
- **Gradient Accents**: Stunning gradient backgrounds and text effects
- **Dark Mode**: Built-in dark mode with smooth transitions

### 🚀 Performance Optimized
- **Vite Build Tool**: Lightning-fast HMR and optimized production builds
- **Code Splitting**: Automatic route-based code splitting with React.lazy
- **Tree Shaking**: Eliminates unused code for smaller bundle sizes
- **Modern Bundles**: Leverages ES modules for faster loading

### 📱 Responsive & Accessible
- **Mobile-First**: Fully responsive design that works on all devices
- **Accessibility**: WCAG compliant with proper ARIA attributes
- **Keyboard Navigation**: Full keyboard support throughout the app
- **Focus Management**: Clear focus indicators for better UX

### 🌍 Internationalization
- **Multi-language Support**: English and Farsi (Persian) out of the box
- **RTL Support**: Full Right-to-Left layout support for Farsi
- **Dynamic Language Switching**: Change language on the fly
- **Persistent Preferences**: Language selection saved to localStorage
- **Complete Translation Coverage**: ~420 translation keys across all pages

### 🛠️ Developer Experience
- **TypeScript**: Full type safety and IntelliSense support
- **Path Aliases**: Clean imports with @ prefix
- **Hot Module Replacement**: Instant updates during development
- **Organized Structure**: Clear separation of concerns
- **Production Ready**: Zero TypeScript errors, optimized build

## 📦 Tech Stack

- **React 18** - Latest React with concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Next-generation frontend tooling
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Production-ready animation library
- **React Router v6** - Client-side routing
- **Zustand** - Lightweight state management with persistence
- **React Hook Form** - Performant forms with validation
- **Recharts** - Composable charting library
- **Lucide React** - Beautiful consistent icons
- **React Hot Toast** - Beautiful notifications
- **i18next** - Internationalization framework
- **react-i18next** - React bindings for i18next
- **React Helmet Async** - Document head management

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Clone the repository**
   ```bash
   cd onesign-admin-portal-react
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration.

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Default Login

For development/demo purposes:
- Email: Any valid email
- Password: Any password

## 📁 Project Structure

```
onesign-admin-portal-react/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, fonts, etc.
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Shared components (Button, Card, Input, etc.)
│   │   │   ├── Avatar.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── DataTable.tsx (with i18n)
│   │   │   ├── Dropdown.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Sidebar.tsx (with i18n)
│   │   │   ├── Tabs.tsx
│   │   │   ├── Tooltip.tsx
│   │   │   └── TopBar.tsx (with i18n)
│   │   ├── admin/         # Admin-specific components
│   │   ├── tenant/        # Tenant-specific components
│   │   └── global/        # Global admin components
│   ├── hooks/             # Custom React hooks
│   │   └── useLanguage.ts # Language switching hook
│   ├── i18n/              # Internationalization
│   │   ├── config.ts      # i18next configuration
│   │   └── locales/       # Translation files
│   │       ├── en.json    # English translations (~420 keys)
│   │       └── fa.json    # Farsi translations (~420 keys)
│   ├── layouts/           # Layout components (AdminLayout, TenantLayout, etc.)
│   ├── pages/             # Page components (route-based)
│   │   ├── admin/         # Admin pages (all with i18n)
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── TenantsPage.tsx
│   │   │   ├── RolesPage.tsx
│   │   │   ├── ApiKeysPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── tenant/        # Tenant pages (all with i18n)
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── UsersPage.tsx
│   │   │   ├── AppsPage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   ├── RolesPage.tsx
│   │   │   └── AuditPage.tsx
│   │   ├── global/        # Global pages
│   │   └── auth/          # Authentication pages
│   │       └── LoginPage.tsx (with i18n)
│   ├── services/          # API service layer
│   │   └── apiClient.ts   # Axios instance with interceptors
│   ├── stores/            # Zustand state management stores
│   │   ├── authStore.ts   # Authentication state
│   │   └── uiStore.ts     # UI state (sidebar, theme)
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts       # Shared types
│   ├── utils/             # Utility functions
│   │   └── cn.ts          # Class name utility
│   ├── App.tsx            # Main App component with routing
│   ├── main.tsx           # Application entry point
│   ├── index.css          # Global styles
│   └── vite-env.d.ts      # Vite environment type definitions
├── index.html             # HTML template
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite configuration
└── package.json           # Project dependencies
```

## 🎯 Key Improvements Over Next.js Version

### 1. **Performance**
- ⚡ 3-5x faster development server startup
- 📦 Smaller bundle sizes with better tree-shaking
- 🔄 Instant HMR updates
- 🚀 Optimized production builds

### 2. **UI/UX Enhancements**
- 🎨 Complete redesign with modern aesthetics
- ✨ Smooth animations and transitions
- 🌓 Improved dark mode implementation
- 💅 Better spacing and typography
- 🎭 Glass morphism effects
- 🌈 Gradient accents throughout

### 3. **Architecture**
- 🧩 Cleaner component structure
- 🔌 More maintainable routing
- 📦 Better state management with Zustand
- 🛡️ Type-safe throughout

### 4. **Developer Experience**
- 🔧 Simpler configuration
- 🔍 Better debugging experience
- 📚 Cleaner import paths
- 🚦 Faster builds

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check

# Testing
npm run test         # Run tests
npm run test:ui      # Run tests with UI
```

## 🎨 Design System

### Colors
- **Primary**: Blue (#3b82f6) - Main brand color
- **Secondary**: Purple (#a855f7) - Accent color
- **Success**: Green (#22c55e) - Success states
- **Warning**: Amber (#f59e0b) - Warning states
- **Danger**: Red (#ef4444) - Error states

### Typography
- **Font Family**: Inter (sans-serif)
- **Headings**: Bold, clear hierarchy
- **Body**: Regular weight, optimal line height

### Spacing
- Consistent 8px grid system
- Generous white space
- Card-based layouts

## 🌍 Internationalization (i18n)

### Supported Languages

- 🇬🇧 **English** (en)
- 🇮🇷 **فارسی** (fa) - Farsi/Persian with full RTL support

### Features

- **Language Switcher**: Available in TopBar component
- **Persistent Selection**: Language preference saved to localStorage
- **RTL Layout**: Automatic layout direction change for Farsi
- **Complete Coverage**: All UI text translated across ~420 keys
- **Type-Safe**: Full TypeScript support for translation keys

### Translation Structure

```json
{
  "common": { ... },      // Common UI elements (50+ keys)
  "nav": { ... },         // Navigation items (20+ keys)
  "auth": { ... },        // Authentication pages (17+ keys)
  "users": { ... },       // User management (35+ keys)
  "tenants": { ... },     // Tenant management (30+ keys)
  "roles": { ... },       // Role management (25+ keys)
  "settings": { ... },    // Settings pages (40+ keys)
  "dashboard": { ... },   // Dashboard elements (50+ keys)
  "apps": { ... },        // Application management (30+ keys)
  "apiKeys": { ... },     // API key management (25+ keys)
  "audit": { ... }        // Audit logs (20+ keys)
}
```

### Usage in Components

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('users.totalUsers')}</p>
    </div>
  );
}
```

### Adding New Translations

1. Add keys to both `src/i18n/locales/en.json` and `src/i18n/locales/fa.json`
2. Use `t('category.key')` in your components
3. Keys are automatically type-checked by TypeScript

## 🔐 Authentication

The app uses JWT-based authentication with the following flow:
1. User logs in via `/login`
2. Token stored in Zustand + localStorage
3. Protected routes check authentication state
4. Automatic redirect to login if not authenticated
5. Token automatically included in API requests via Axios interceptors

## 🌍 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploy to Netlify

1. **Connect your repository**
2. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. **Environment variables**: Add your environment variables in Netlify dashboard

### Deploy to Vercel

1. **Import project** to Vercel
2. **Framework preset**: Vite
3. **Build settings** are auto-detected
4. **Add environment variables** in project settings

### Deploy to Static Hosting

The built app is a static site that can be deployed to:
- AWS S3 + CloudFront
- Google Cloud Storage
- GitHub Pages
- Any static hosting service

## 🔧 Configuration

### Vite Configuration

Edit `vite.config.ts` to customize:
- Build options
- Dev server settings
- Plugin configuration
- Path aliases

### Tailwind Configuration

Edit `tailwind.config.js` to customize:
- Colors and theme
- Fonts
- Animations
- Custom utilities

## 📚 Key Migrations from Next.js

### Routing
- **Before (Next.js)**: File-based routing in `/app` directory
- **After (React)**: Centralized routing in `App.tsx` using React Router

### Navigation
- **Before**: `<Link href="/path">` from `next/link`
- **After**: `<Link to="/path">` from `react-router-dom`

### Images
- **Before**: `<Image>` from `next/image`
- **After**: Standard `<img>` tags with optimized srcsets

### Metadata
- **Before**: `export const metadata` or `<Head>` from `next/head`
- **After**: `<Helmet>` from `react-helmet-async`

### API Calls
- **Before**: Server-side with `getServerSideProps` or `getStaticProps`
- **After**: Client-side with `useEffect` + `fetch/axios`

### Environment Variables
- **Before**: `NEXT_PUBLIC_` prefix
- **After**: `VITE_` prefix

## ✅ Implementation Status

### Completed Features

- ✅ **Core Infrastructure**
  - React 18 + TypeScript + Vite setup
  - Tailwind CSS with custom theme
  - React Router v6 routing
  - Zustand state management
  - Production build optimization

- ✅ **Internationalization**
  - i18next integration
  - English and Farsi translations (~420 keys)
  - RTL layout support
  - Language switcher component
  - Persistent language selection

- ✅ **Common Components** (All with i18n)
  - Avatar, Badge, Button, Card
  - DataTable (advanced with search, filter, pagination)
  - Dropdown, Input, Modal
  - Sidebar with menu search
  - TopBar with notifications
  - Tabs (controlled/uncontrolled)
  - Tooltip

- ✅ **Admin Pages** (All with i18n)
  - Dashboard with stats and charts
  - Users management (CRUD)
  - Tenants management
  - Roles & Permissions
  - API Keys management
  - Settings (4 tabs: General, Security, Notifications, Integrations)

- ✅ **Tenant Pages** (All with i18n)
  - Dashboard with analytics
  - Users management
  - Apps management
  - Settings (4 tabs)
  - Roles & Permissions
  - Audit logs

- ✅ **Authentication**
  - Login page with i18n
  - JWT token handling
  - Protected routes
  - Auto-redirect

- ✅ **Build & Production**
  - Zero TypeScript errors
  - Zero build warnings
  - Optimized bundle splitting
  - Production-ready build

### Pending Features

- ⏳ Real API integration (currently using mock data)
- ⏳ Advanced form validation
- ⏳ Image upload components
- ⏳ Advanced charts and analytics
- ⏳ Email notification templates
- ⏳ Export to PDF/Excel functionality

## 🐛 Recent Fixes

### Build Optimization (Latest)
- Fixed TypeScript compilation errors
- Resolved Framer Motion type conflicts in Button component
- Fixed Tabs component to support controlled/uncontrolled modes
- Corrected CSS custom property usage
- Added Vite environment type definitions
- Removed unused imports and variables

### i18n Integration
- Complete translation coverage across all pages
- DataTable component fully localized
- TopBar and Sidebar navigation localized
- Language switcher with persistence
- RTL layout support for Farsi

## 🤝 Contributing

This is a migrated project. For contributing guidelines, please refer to the main project repository.

## 🏗️ Migration Notes

This project was successfully migrated from Next.js 14 to React 18 + Vite with the following improvements:
- 3-5x faster development server
- Smaller bundle sizes
- Complete UI/UX redesign
- Full internationalization support
- Better type safety
- Production-ready build

## 📄 License

This project is part of the OneSign platform.

## 🙏 Acknowledgments

- Design inspiration from Figma community and premium admin templates
- Icons from Lucide React
- Animations powered by Framer Motion
- Built with love using React and Vite

---

**Made with ❤️ for OneSign Admin Portal**
