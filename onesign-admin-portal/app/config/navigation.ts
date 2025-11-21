/**
 * Navigation Configuration
 * Menu structure and navigation items
 */

import { MenuItem } from '../types/navigation';

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'HomeIcon',
    href: '/dashboard',
  },
  {
    id: 'users',
    label: 'Users',
    icon: 'UsersIcon',
    children: [
      {
        id: 'all-users',
        label: 'All Users',
        href: '/users',
      },
      {
        id: 'invite-user',
        label: 'Invite User',
        href: '/users/invite',
      },
      {
        id: 'delegated-admins',
        label: 'Delegated Admins',
        href: '/users/delegated-admins',
      },
    ],
  },
  {
    id: 'applications',
    label: 'Applications',
    icon: 'RectangleStackIcon',
    children: [
      {
        id: 'all-apps',
        label: 'All Apps',
        href: '/applications',
      },
      {
        id: 'create-app',
        label: 'Create App',
        href: '/applications/create',
      },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    icon: 'ShieldCheckIcon',
    children: [
      {
        id: 'security-center',
        label: 'Security Center',
        href: '/security',
      },
      {
        id: 'mfa-management',
        label: 'MFA Management',
        href: '/security/mfa',
      },
      {
        id: 'adaptive-security',
        label: 'Adaptive Security',
        href: '/security/adaptive',
      },
      {
        id: 'privileged-access',
        label: 'Privileged Access',
        href: '/security/privileged-access',
      },
      {
        id: 'risk-events',
        label: 'Risk Events',
        href: '/security/risk-events',
        badge: 3,
      },
      {
        id: 'incidents',
        label: 'Incidents',
        href: '/security/incidents',
      },
    ],
  },
  {
    id: 'access-identity',
    label: 'Access & Identity',
    icon: 'KeyIcon',
    children: [
      {
        id: 'access-requests',
        label: 'Access Requests',
        href: '/access/requests',
        badge: 5,
      },
      {
        id: 'federation',
        label: 'Federation',
        href: '/access/federation',
      },
      {
        id: 'policies',
        label: 'Policies',
        href: '/access/policies',
      },
      {
        id: 'lifecycle',
        label: 'Lifecycle',
        href: '/access/lifecycle',
      },
    ],
  },
  {
    id: 'governance',
    label: 'Governance',
    icon: 'DocumentCheckIcon',
    children: [
      {
        id: 'privacy',
        label: 'Privacy',
        href: '/governance/privacy',
      },
      {
        id: 'campaigns',
        label: 'Campaigns',
        href: '/governance/campaigns',
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        href: '/governance/audit-logs',
      },
      {
        id: 'observability',
        label: 'Observability',
        href: '/governance/observability',
      },
    ],
  },
  {
    id: 'automation',
    label: 'Automation',
    icon: 'BoltIcon',
    children: [
      {
        id: 'workflows',
        label: 'Workflows',
        href: '/automation/workflows',
      },
      {
        id: 'change-management',
        label: 'Change Management',
        href: '/automation/change-management',
      },
      {
        id: 'copilot',
        label: 'Copilot',
        href: '/automation/copilot',
        badge: 'New',
      },
    ],
  },
  {
    id: 'developer',
    label: 'Developer',
    icon: 'CodeBracketIcon',
    children: [
      {
        id: 'api-keys',
        label: 'API Keys',
        href: '/developer/api-keys',
      },
      {
        id: 'service-accounts',
        label: 'Service Accounts',
        href: '/developer/service-accounts',
      },
      {
        id: 'extensibility',
        label: 'Extensibility',
        href: '/developer/extensibility',
      },
      {
        id: 'notifications',
        label: 'Notifications',
        href: '/developer/notifications',
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'Cog6ToothIcon',
    children: [
      {
        id: 'account',
        label: 'Account',
        href: '/settings/account',
      },
      {
        id: 'billing',
        label: 'Billing',
        href: '/settings/billing',
      },
      {
        id: 'org-units',
        label: 'Org Units',
        href: '/settings/org-units',
      },
      {
        id: 'general-settings',
        label: 'General Settings',
        href: '/settings/general',
      },
    ],
  },
];
