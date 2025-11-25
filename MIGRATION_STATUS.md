# وضعیت مهاجرت از Next.js به React

## خلاصه

- **تعداد کل صفحات در Next.js**: 125 صفحه
- **تعداد صفحات منتقل شده به React**: 13 صفحه
- **درصد تکمیل**: ~10.4%
- **تعداد صفحات باقی‌مانده**: 112 صفحه

## صفحات منتقل شده (13 صفحه)

### Admin (6 صفحه)
- ✅ Dashboard (`/admin/dashboard`)
- ✅ Users (`/admin/users`)
- ✅ Tenants (`/admin/tenants`)
- ✅ Roles (`/admin/roles`)
- ✅ API Keys (`/admin/api-keys`)
- ✅ Settings (`/admin/settings`)

### Tenant (6 صفحه)
- ✅ Dashboard (`/tenant/dashboard`)
- ✅ Users (`/tenant/users`)
- ✅ Apps (`/tenant/apps`)
- ✅ Roles (`/tenant/roles`)
- ✅ Audit (`/tenant/audit`)
- ✅ Settings (`/tenant/settings`)

### Auth (1 صفحه)
- ✅ Login (`/login`)

## صفحات باقی‌مانده (112 صفحه)

### Auth & Onboarding
- ❌ Google OAuth Callback (`/auth/google/callback`)
- ❌ Complete First Login (`/complete-first-login`)

### Documentation
- ❌ Discovery Docs (`/docs/discovery`)
- ❌ UserInfo Docs (`/docs/userinfo`)

### Global Admin (42 صفحه)
- ❌ Access Reviews (`/global/access-reviews`)
- ❌ Alerts (`/global/alerts`)
- ❌ API Management (`/global/api-management`)
- ❌ Audit (`/global/audit`)
- ❌ Automation (`/global/automation`)
- ❌ Backups (`/global/backups`)
- ❌ Billing (`/global/billing`)
- ❌ Change Management (`/global/change-management`)
- ❌ Changes Audit (`/global/changes/audit`)
- ❌ Copilot (`/global/copilot`)
- ❌ Crypto (`/global/crypto`)
- ❌ Diagnostics (`/global/diagnostics`)
- ❌ Environments (`/global/environments`)
- ❌ Feature Flags (`/global/feature-flags`)
- ❌ Health (`/global/health`)
- ❌ Hunting (`/global/hunting`)
- ❌ Insights (`/global/insights`)
- ❌ Advanced Insights (`/global/insights/advanced`)
- ❌ Integrations (`/global/integrations`)
- ❌ Licenses (`/global/licenses`)
- ❌ Maintenance (`/global/maintenance`)
- ❌ Metrics (`/global/metrics`)
- ❌ Migrations (`/global/migrations`)
- ❌ Monitoring (`/global/monitoring`)
- ❌ Observability (`/global/observability`)
- ❌ Performance (`/global/performance`)
- ❌ Platform (`/global/platform`)
- ❌ Rate Limiting (`/global/rate-limiting`)
- ❌ Regions (`/global/regions`)
- ❌ Security (`/global/security`)
- ❌ Settings (`/global/settings`)
- ❌ Templates (`/global/templates`)
- ❌ Tenants (`/global/tenants`)
- ❌ Tenant Lifecycle (`/global/tenants/lifecycle`)
- ❌ Webhooks (`/global/webhooks`)

### Tenant Advanced (65 صفحه)
- ❌ Access Certifications (`/tenant/access/certifications`)
- ❌ Access Reviews (`/tenant/access/reviews`)
- ❌ Access Requests (`/tenant/access-requests`)
- ❌ Access Request Detail (`/tenant/access-requests/[id]`)
- ❌ Account (`/tenant/account`)
- ❌ Adaptive Security (`/tenant/adaptive-security`)
- ❌ Alerts (`/tenant/alerts`)
- ❌ Analytics (`/tenant/analytics`)
- ❌ Application Analytics (`/tenant/analytics/applications`)
- ❌ Security Analytics (`/tenant/analytics/security`)
- ❌ User Analytics (`/tenant/analytics/users`)
- ❌ API Keys (`/tenant/api-keys`)
- ❌ API Usage (`/tenant/api-usage`)
- ❌ App Detail (`/tenant/apps/[id]`)
- ❌ Automation (`/tenant/automation`)
- ❌ Automation Designer (`/tenant/automation/designer`)
- ❌ Workflow Detail (`/tenant/automation/workflows/[id]`)
- ❌ Workflow Executions (`/tenant/automation/workflows/[id]/executions`)
- ❌ Backups (`/tenant/backups`)
- ❌ Billing (`/tenant/billing`)
- ❌ Branding (`/tenant/branding`)
- ❌ Certificates (`/tenant/certificates`)
- ❌ Change Management (`/tenant/change-management`)
- ❌ Compliance (`/tenant/compliance`)
- ❌ Conditional Access (`/tenant/conditional-access`)
- ❌ Copilot (`/tenant/copilot`)
- ❌ Data Retention (`/tenant/data-retention`)
- ❌ Delegated Admins (`/tenant/delegated-admins`)
- ❌ Delegated Admin Detail (`/tenant/delegated-admins/[id]`)
- ❌ Domains (`/tenant/domains`)
- ❌ Exports (`/tenant/exports`)
- ❌ Extensibility (`/tenant/extensibility`)
- ❌ Federation (`/tenant/federation`)
- ❌ Governance (`/tenant/governance`)
- ❌ Governance Campaigns (`/tenant/governance/campaigns`)
- ❌ Hunting (`/tenant/hunting`)
- ❌ Imports (`/tenant/imports`)
- ❌ Incidents (`/tenant/incidents`)
- ❌ Incident Detail (`/tenant/incidents/[id]`)
- ❌ Insights (`/tenant/insights`)
- ❌ Advanced Insights (`/tenant/insights/advanced`)
- ❌ Integrations (`/tenant/integrations`)
- ❌ Integration Detail (`/tenant/integrations/[id]`)
- ❌ IP Whitelist (`/tenant/ip-whitelist`)
- ❌ Lifecycle (`/tenant/lifecycle`)
- ❌ MFA Management (`/tenant/mfa-management`)
- ❌ Notifications (`/tenant/notifications`)
- ❌ Notification Template Detail (`/tenant/notifications/templates/[id]`)
- ❌ Observability (`/tenant/observability`)
- ❌ Org Units (`/tenant/org-units`)
- ❌ Org Unit Detail (`/tenant/org-units/[id]`)
- ❌ Policies (`/tenant/policies`)
- ❌ Policy Detail (`/tenant/policies/[id]`)
- ❌ Privacy (`/tenant/privacy`)
- ❌ Privileged Access (`/tenant/privileged-access`)
- ❌ Quotas (`/tenant/quotas`)
- ❌ Reports (`/tenant/reports`)
- ❌ Compliance Reports (`/tenant/reports/compliance`)
- ❌ Risk Events (`/tenant/risk-events`)
- ❌ Risk Event Detail (`/tenant/risk-events/[id]`)
- ❌ Role Detail (`/tenant/roles/[id]`)
- ❌ Schedules (`/tenant/schedules`)
- ❌ Scopes (`/tenant/scopes`)
- ❌ Security (`/tenant/security`)
- ❌ Anomaly Detection (`/tenant/security/anomaly-detection`)
- ❌ Service Accounts (`/tenant/service-accounts`)
- ❌ Service Account Detail (`/tenant/service-accounts/[id]`)
- ❌ Sessions (`/tenant/sessions`)
- ❌ Templates (`/tenant/templates`)
- ❌ Tokens (`/tenant/tokens`)
- ❌ User Detail (`/tenant/users/[id]`)
- ❌ Webhooks (`/tenant/webhooks`)

## اقدامات انجام شده تاکنون

1. ✅ **فونت‌های فارسی**: فونت IRANYekanX به پروژه React اضافه شد
   - فایل‌های woff2 به `public/fonts/` منتقل شدند
   - فایل `styles/fonts.css` ایجاد شد
   - فونت به Tailwind Config و index.css اضافه شد

2. ✅ **پشتیبانی RTL**:
   - Hook `useDirection` در App.tsx فعال شد
   - تنظیمات direction به صورت خودکار با تغییر زبان تغییر می‌کند
   - فونت فارسی به font-family اضافه شد

3. ✅ **ساختار پایه**:
   - Layout‌های Admin، Tenant و Global ایجاد شده
   - صفحات اصلی Dashboard، Users، Tenants، Roles، Settings، API Keys
   - سیستم authentication و routing

## پیشنهادات برای ادامه کار

با توجه به تعداد بالای صفحات (112 صفحه باقی‌مانده)، پیشنهادات زیر ارائه می‌شود:

### اولویت 1: صفحات اصلی Global Admin
- Global Dashboard
- Global Tenants Management
- Global Settings
- Global Monitoring
- Global Security

### اولویت 2: صفحات اصلی Tenant
- Analytics Dashboard
- API Management
- Security & Compliance
- User Management (Detail Pages)
- App Management (Detail Pages)

### اولویت 3: ویژگی‌های پیشرفته
- Automation & Workflows
- Governance & Access Reviews
- Incident Management
- Advanced Analytics
- Copilot & AI Features

### اولویت 4: مدیریت و گزارش‌گیری
- Reports & Exports
- Compliance Reports
- Audit Logs (Advanced)
- Billing & Usage

## نکات مهم

1. **استفاده از Component Reusability**: بسیاری از صفحات می‌توانند از کامپوننت‌های مشترک استفاده کنند
2. **Lazy Loading**: با توجه به تعداد بالای صفحات، استفاده از lazy loading ضروری است
3. **Code Generation**: می‌توان از ابزارهای کدنویسی خودکار برای تسریع روند استفاده کرد
4. **Progressive Migration**: بهتر است به صورت تدریجی و با اولویت‌بندی، صفحات منتقل شوند

## آمار کلی

- **تخمین زمان**: با سرعت فعلی، تکمیل پروژه چندین هفته زمان می‌برد
- **پیشرفت فعلی**: تنها صفحات اصلی و پرکاربرد منتقل شده‌اند
- **نیاز به تصمیم‌گیری**: آیا تمام 125 صفحه باید منتقل شوند یا فقط صفحات پرکاربرد؟
