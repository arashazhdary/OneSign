# OneSign — GitHub Issues Backlog

این سند خروجی بررسی معماری/کد/مستندات پروژه OneSign برای **کارهای باقیمانده** است. issueهای متناظر با اسکریپت زیر در GitHub ایجاد می‌شوند.

## وضعیت فعلی پروژه

| لایه | وضعیت کلی |
|------|-----------|
| **Backend (.NET 10)** | ۳۲+ ماژول پیاده شده؛ بدون `NotImplementedException` در `src/` |
| **Admin Portal (React)** | UI گسترده (~۱۳۶ صفحه)؛ **۵۰+ صفحه** هنوز mock/fallback دارند |
| **Login Portal (Next.js)** | SSO flows + branding cache (فرانت آماده؛ backend ETag ناقص) |
| **SDK** | `Onesign.Sdk.DotNet`, `Onesign.Sdk.AspNetCore`, `@onesign/sdk-node`, `@onesign/react-sdk`؛ CLI **ندارد** |
| **Phases 1–29** | spec و کد backend/modules عمدتاً موجود |
| **Phase 30** | Copilot پایه هست؛ Sidebar/Guided Security ناقص |

## ایجاد issueها در GitHub

```bash
# ۱. احراز هویت (یک بار)
/home/arash/PV/Projects/Arashazhdary/OneSign/.tools/gh_2.63.2_linux_amd64/bin/gh auth login

# ۲. پیش‌نمایش
./scripts/create-github-issues.sh --dry-run

# ۳. ایجاد (issue تکراری با همان عنوان skip می‌شود)
./scripts/create-github-issues.sh
```

با token:

```bash
GH_TOKEN=ghp_xxxx ./scripts/create-github-issues.sh
```

## فهرست issueها (۲۲ مورد)

| # | عنوان | اولویت | برچسب‌ها |
|---|--------|--------|----------|
| 1 | Admin: Users/Tenants/Roles/Apps → API | High | frontend |
| 2 | Admin: Policy Engine UI | High | frontend |
| 3 | Admin: Change Management → API | High | frontend |
| 4 | Admin: Global Operations — حذف mock | Medium | frontend |
| 5 | Admin: Tenant Ops دسته ۱ | Medium | frontend |
| 6 | Admin: Tenant Ops دسته ۲ | Medium | frontend |
| 7 | Phase 30: Copilot Sidebar + Guided Security | Medium | frontend, backend |
| 8 | Backend: Branding ETag/304 | Medium | backend |
| 9 | Backend: SendTestEmail + IEmailService | Medium | backend |
| 10 | Backend: SMS Provider production | Medium | backend |
| 11 | Phase 14: Onesign.Sdk.AspNetCore | Medium | sdk |
| 12 | Phase 14: @onesign/sdk-node | Medium | sdk |
| 13 | Phase 14: onesign-cli | Low | sdk |
| 14 | Phase 14: Dev Sandbox + Samples | Low | sdk |
| 15 | Phase 24: Platform Completion | Medium | backend, frontend |
| 16 | CI/CD: pipeline یکپارچه | Medium | infra |
| 17 | Infra: Helm/K8s production | Medium | infra |
| 18 | Testing: Integration/E2E گسترش | Medium | backend |
| 19 | Docs: README/License/Contributing | Low | docs |
| 20 | Docs: OpenAPI + Postman | Low | docs |
| 21 | Email: production IEmailService | Medium | backend, infra |

## شواهد کلیدی در کد

### TODOهای صریح در Admin Portal
- `onesign-admin-portal-react/src/pages/tenant/policies/TenantPoliciesPage.tsx` (۶ TODO)
- `onesign-admin-portal-react/src/pages/admin/UsersPage.tsx`, `TenantsPage.tsx`, `RolesPage.tsx`
- `onesign-admin-portal-react/src/pages/tenant/UsersPage.tsx`, `RolesPage.tsx`, `AppsPage.tsx`
- `onesign-admin-portal-react/src/pages/tenant/risk-events/TenantRiskEventsPage.tsx`

### TODO در Backend
- `src/Modules/Platform/Onesign.Modules.Tenants/Application/Commands/SendTestEmailCommandHandler.cs`

### Mock data (نمونه)
- `TenantChangeManagementPage.tsx`, `GlobalChangeManagementPage.tsx`
- `GlobalSecurityPage.tsx`, `GlobalMonitoringPage.tsx`, `GlobalAuditPage.tsx`
- `TenantIntegrationsPage.tsx`, `TenantIncidentsPage.tsx`, `admin/RolesPage.tsx`

## فازهای مستندات (مرجع)

همه در `Phases/`:
- Phase 14 — SDKs
- Phase 24 — Platform Completion
- Phase 27 — Change Management (backend ✅، UI mock)
- Phase 30 — Copilot Guided Experience (ناقص در UI layout)

---

*آخرین بررسی: ۲۰۲۶-۰۵-۲۰*
