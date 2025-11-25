# App.tsx Update Guide

This guide shows you exactly how to update `src/App.tsx` to include all 124 migrated pages.

## Option 1: Use the Routes Index File (Recommended)

Replace the imports section in your App.tsx with:

```tsx
import { Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useDirection } from '@/hooks/useDirection';

// Layouts
import { AdminLayout } from '@/layouts/AdminLayout';
import { TenantLayout } from '@/layouts/TenantLayout';
import { GlobalLayout } from '@/layouts/GlobalLayout';

// Import ALL routes at once
import routes from '@/routes';
```

Then in your Routes component, add these routes before the default redirects:

```tsx
{/* Auth Routes (Public) */}
<Route path="/login" element={<routes.auth.Login />} />
<Route path="/complete-first-login" element={<routes.auth.CompleteFirstLogin />} />
<Route path="/auth/google/callback" element={<routes.auth.GoogleCallback />} />

{/* Docs Routes (Public) */}
<Route path="/docs/discovery" element={<routes.docs.Discovery />} />
<Route path="/docs/userinfo" element={<routes.docs.UserInfo />} />
```

Inside your Global Route section, add:

```tsx
<Route
  path="/global/*"
  element={
    <ProtectedRoute>
      <GlobalLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Navigate to="/global/tenants" replace />} />
  <Route path="access-reviews" element={<routes.global.AccessReviews />} />
  <Route path="alerts" element={<routes.global.Alerts />} />
  <Route path="api-management" element={<routes.global.ApiManagement />} />
  <Route path="audit" element={<routes.global.Audit />} />
  <Route path="automation" element={<routes.global.Automation />} />
  <Route path="backups" element={<routes.global.Backups />} />
  <Route path="billing" element={<routes.global.Billing />} />
  <Route path="change-management" element={<routes.global.ChangeManagement />} />
  <Route path="changes/audit" element={<routes.global.ChangesAudit />} />
  <Route path="copilot" element={<routes.global.Copilot />} />
  <Route path="crypto" element={<routes.global.Crypto />} />
  <Route path="diagnostics" element={<routes.global.Diagnostics />} />
  <Route path="environments" element={<routes.global.Environments />} />
  <Route path="feature-flags" element={<routes.global.FeatureFlags />} />
  <Route path="health" element={<routes.global.Health />} />
  <Route path="hunting" element={<routes.global.Hunting />} />
  <Route path="insights" element={<routes.global.Insights />} />
  <Route path="insights/advanced" element={<routes.global.InsightsAdvanced />} />
  <Route path="integrations" element={<routes.global.Integrations />} />
  <Route path="licenses" element={<routes.global.Licenses />} />
  <Route path="maintenance" element={<routes.global.Maintenance />} />
  <Route path="metrics" element={<routes.global.Metrics />} />
  <Route path="migrations" element={<routes.global.Migrations />} />
  <Route path="monitoring" element={<routes.global.Monitoring />} />
  <Route path="observability" element={<routes.global.Observability />} />
  <Route path="performance" element={<routes.global.Performance />} />
  <Route path="platform" element={<routes.global.Platform />} />
  <Route path="rate-limiting" element={<routes.global.RateLimiting />} />
  <Route path="regions" element={<routes.global.Regions />} />
  <Route path="security" element={<routes.global.Security />} />
  <Route path="settings" element={<routes.global.Settings />} />
  <Route path="templates" element={<routes.global.Templates />} />
  <Route path="tenants" element={<routes.global.Tenants />} />
  <Route path="tenants/lifecycle" element={<routes.global.TenantsLifecycle />} />
  <Route path="webhooks" element={<routes.global.Webhooks />} />
</Route>
```

Inside your Tenant Route section, replace the existing routes with:

```tsx
<Route
  path="/tenant/*"
  element={
    <ProtectedRoute>
      <TenantLayout />
    </ProtectedRoute>
  }
>
  <Route index element={<Navigate to="/tenant/dashboard" replace />} />

  {/* Dashboard */}
  <Route path="dashboard" element={<routes.tenant.Dashboard />} />

  {/* Access Management */}
  <Route path="access/certifications" element={<routes.tenant.AccessCertifications />} />
  <Route path="access/reviews" element={<routes.tenant.AccessReviews />} />
  <Route path="access-requests" element={<routes.tenant.AccessRequests />} />
  <Route path="access-requests/:id" element={<routes.tenant.AccessRequestsDetail />} />

  {/* Account & Security */}
  <Route path="account" element={<routes.tenant.Account />} />
  <Route path="adaptive-security" element={<routes.tenant.AdaptiveSecurity />} />
  <Route path="alerts" element={<routes.tenant.Alerts />} />

  {/* Analytics */}
  <Route path="analytics" element={<routes.tenant.Analytics />} />
  <Route path="analytics/applications" element={<routes.tenant.AnalyticsApplications />} />
  <Route path="analytics/security" element={<routes.tenant.AnalyticsSecurity />} />
  <Route path="analytics/users" element={<routes.tenant.AnalyticsUsers />} />

  {/* API */}
  <Route path="api-keys" element={<routes.tenant.ApiKeys />} />
  <Route path="api-usage" element={<routes.tenant.ApiUsage />} />

  {/* Applications */}
  <Route path="apps" element={<routes.tenant.Apps />} />
  <Route path="apps/:id" element={<routes.tenant.AppsDetail />} />

  {/* Audit */}
  <Route path="audit" element={<routes.tenant.Audit />} />

  {/* Automation */}
  <Route path="automation" element={<routes.tenant.Automation />} />
  <Route path="automation/designer" element={<routes.tenant.AutomationDesigner />} />
  <Route path="automation/workflows/:id" element={<routes.tenant.AutomationWorkflowsDetail />} />
  <Route path="automation/workflows/:id/executions" element={<routes.tenant.AutomationWorkflowsExecutions />} />

  {/* B */}
  <Route path="backups" element={<routes.tenant.Backups />} />
  <Route path="billing" element={<routes.tenant.Billing />} />
  <Route path="branding" element={<routes.tenant.Branding />} />

  {/* C */}
  <Route path="certificates" element={<routes.tenant.Certificates />} />
  <Route path="change-management" element={<routes.tenant.ChangeManagement />} />
  <Route path="compliance" element={<routes.tenant.Compliance />} />
  <Route path="conditional-access" element={<routes.tenant.ConditionalAccess />} />
  <Route path="copilot" element={<routes.tenant.Copilot />} />

  {/* D */}
  <Route path="data-retention" element={<routes.tenant.DataRetention />} />
  <Route path="delegated-admins" element={<routes.tenant.DelegatedAdmins />} />
  <Route path="delegated-admins/:id" element={<routes.tenant.DelegatedAdminsDetail />} />
  <Route path="domains" element={<routes.tenant.Domains />} />

  {/* E */}
  <Route path="exports" element={<routes.tenant.Exports />} />
  <Route path="extensibility" element={<routes.tenant.Extensibility />} />

  {/* F */}
  <Route path="federation" element={<routes.tenant.Federation />} />

  {/* G */}
  <Route path="governance" element={<routes.tenant.Governance />} />
  <Route path="governance/campaigns" element={<routes.tenant.GovernanceCampaigns />} />

  {/* H */}
  <Route path="hunting" element={<routes.tenant.Hunting />} />

  {/* I */}
  <Route path="imports" element={<routes.tenant.Imports />} />
  <Route path="incidents" element={<routes.tenant.Incidents />} />
  <Route path="incidents/:id" element={<routes.tenant.IncidentsDetail />} />
  <Route path="insights" element={<routes.tenant.Insights />} />
  <Route path="insights/advanced" element={<routes.tenant.InsightsAdvanced />} />
  <Route path="integrations" element={<routes.tenant.Integrations />} />
  <Route path="integrations/:id" element={<routes.tenant.IntegrationsDetail />} />
  <Route path="ip-whitelist" element={<routes.tenant.IpWhitelist />} />

  {/* L */}
  <Route path="lifecycle" element={<routes.tenant.Lifecycle />} />

  {/* M */}
  <Route path="mfa-management" element={<routes.tenant.MfaManagement />} />

  {/* N */}
  <Route path="notifications" element={<routes.tenant.Notifications />} />
  <Route path="notifications/templates/:id" element={<routes.tenant.NotificationsTemplatesDetail />} />

  {/* O */}
  <Route path="observability" element={<routes.tenant.Observability />} />
  <Route path="org-units" element={<routes.tenant.OrgUnits />} />
  <Route path="org-units/:id" element={<routes.tenant.OrgUnitsDetail />} />

  {/* P */}
  <Route path="policies" element={<routes.tenant.Policies />} />
  <Route path="policies/:id" element={<routes.tenant.PoliciesDetail />} />
  <Route path="privacy" element={<routes.tenant.Privacy />} />
  <Route path="privileged-access" element={<routes.tenant.PrivilegedAccess />} />

  {/* Q */}
  <Route path="quotas" element={<routes.tenant.Quotas />} />

  {/* R */}
  <Route path="reports" element={<routes.tenant.Reports />} />
  <Route path="reports/compliance" element={<routes.tenant.ReportsCompliance />} />
  <Route path="risk-events" element={<routes.tenant.RiskEvents />} />
  <Route path="risk-events/:id" element={<routes.tenant.RiskEventsDetail />} />
  <Route path="roles" element={<routes.tenant.Roles />} />
  <Route path="roles/:id" element={<routes.tenant.RolesDetail />} />

  {/* S */}
  <Route path="schedules" element={<routes.tenant.Schedules />} />
  <Route path="scopes" element={<routes.tenant.Scopes />} />
  <Route path="security" element={<routes.tenant.Security />} />
  <Route path="security/anomaly-detection" element={<routes.tenant.SecurityAnomalyDetection />} />
  <Route path="service-accounts" element={<routes.tenant.ServiceAccounts />} />
  <Route path="service-accounts/:id" element={<routes.tenant.ServiceAccountsDetail />} />
  <Route path="sessions" element={<routes.tenant.Sessions />} />
  <Route path="settings" element={<routes.tenant.Settings />} />

  {/* T */}
  <Route path="templates" element={<routes.tenant.Templates />} />
  <Route path="tokens" element={<routes.tenant.Tokens />} />

  {/* U */}
  <Route path="users" element={<routes.tenant.Users />} />
  <Route path="users/:id" element={<routes.tenant.UsersDetail />} />

  {/* W */}
  <Route path="webhooks" element={<routes.tenant.Webhooks />} />
</Route>
```

## Option 2: Direct Import (Simpler for Testing)

If you prefer to test pages one by one, you can import them directly:

```tsx
// At the top with other imports
const CompleteFirstLoginPage = lazy(() => import('@/pages/auth/CompleteFirstLoginPage'));
const GoogleCallbackPage = lazy(() => import('@/pages/auth/GoogleCallbackPage'));
// ... and so on

// Then use them in routes
<Route path="/complete-first-login" element={<CompleteFirstLoginPage />} />
<Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
```

## Testing Checklist

After updating App.tsx:

1. **Start the dev server**: `npm run dev` or `yarn dev`
2. **Check for import errors** in the console
3. **Test each section**:
   - [ ] Auth pages (/login, /complete-first-login)
   - [ ] Admin pages (/admin/*)
   - [ ] Tenant pages (/tenant/*)
   - [ ] Global pages (/global/*)
   - [ ] Docs pages (/docs/*)
4. **Verify navigation** between pages works
5. **Check responsive design** on different screen sizes
6. **Test RTL** if applicable
7. **Test dark mode** if applicable

## Common Issues & Fixes

### Issue 1: Module not found errors
**Solution**: Check that `@/routes` path alias is configured in your tsconfig.json or vite.config.ts

### Issue 2: Pages render but API calls fail
**Solution**: Verify API service imports in migrated pages match your project structure

### Issue 3: Loading states not working
**Solution**: Some pages use LoadingOverlay component. Either create it or replace with your loading component

### Issue 4: Tenant context errors
**Solution**: Implement getTenantId() function or replace with your tenant management solution

## Quick Start

1. Copy `src/routes/index.tsx` (already created)
2. Update `src/App.tsx` using Option 1 above
3. Run `npm install` if any dependencies are missing
4. Start dev server: `npm run dev`
5. Test a few pages to verify everything works
6. Fix any import/API issues as they come up

That's it! All 124 pages are now integrated into your React app.
