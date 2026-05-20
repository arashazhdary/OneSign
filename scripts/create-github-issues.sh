#!/usr/bin/env bash
# Creates GitHub issues for the OneSign remaining-work backlog.
# Prerequisites: gh auth login (or GH_TOKEN / GITHUB_TOKEN with repo scope)
#
# Usage:
#   ./scripts/create-github-issues.sh
#   ./scripts/create-github-issues.sh --dry-run
#   GH_TOKEN=ghp_xxx ./scripts/create-github-issues.sh

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GH_BIN="${GH_BIN:-$ROOT/.tools/gh_2.63.2_linux_amd64/bin/gh}"
REPO="${GITHUB_REPO:-arashazhdary/OneSign}"
DRY_RUN=false

# gh reads GH_TOKEN / GITHUB_TOKEN from the environment
if [[ -n "${GH_TOKEN:-}" ]]; then
  export GH_TOKEN
elif [[ -n "${GITHUB_TOKEN:-}" ]]; then
  export GH_TOKEN="${GITHUB_TOKEN}"
fi

if [[ "${1:-}" == "--dry-run" ]]; then
  DRY_RUN=true
fi

if [[ ! -x "$GH_BIN" ]]; then
  echo "gh not found at $GH_BIN. Set GH_BIN or install gh."
  exit 1
fi

if [[ -z "${GH_TOKEN:-}" ]] && ! "$GH_BIN" auth status >/dev/null 2>&1; then
  echo "Not authenticated. Run: $GH_BIN auth login"
  echo "Or: GH_TOKEN=<your-token> $0"
  exit 1
fi

ensure_labels() {
  local labels=(
    "area:backend"
    "area:frontend"
    "area:sdk"
    "area:infra"
    "area:docs"
    "type:enhancement"
    "type:chore"
    "priority:high"
    "priority:medium"
    "priority:low"
    "epic"
  )
  for label in "${labels[@]}"; do
    if ! "$GH_BIN" label list --repo "$REPO" --json name -q ".[].name" 2>/dev/null | grep -qx "$label"; then
      if [[ "$DRY_RUN" == true ]]; then
        echo "[dry-run] would create label: $label"
      else
        color="0E8A16"
        case "$label" in
          area:*) color="1D76DB" ;;
          type:*) color="FBCA04" ;;
          priority:high) color="B60205" ;;
          priority:medium) color="D93F0B" ;;
          priority:low) color="C2E0C6" ;;
          epic) color="5319E7" ;;
        esac
        if ! "$GH_BIN" label create "$label" --repo "$REPO" --color "$color"; then
          echo "WARN: could not create label '$label' (may already exist)" >&2
        fi
      fi
    fi
  done
}

issue_exists() {
  local title="$1"
  "$GH_BIN" issue list --repo "$REPO" --search "in:title \"${title}\"" --json title -q ".[].title" 2>/dev/null | grep -Fxq "$title"
}

create_issue() {
  local title="$1"
  local labels="$2"
  local body="$3"

  if issue_exists "$title"; then
    echo "SKIP (exists): $title"
    return 0
  fi

  if [[ "$DRY_RUN" == true ]]; then
    echo "CREATE: $title [$labels]"
    return 0
  fi

  "$GH_BIN" issue create --repo "$REPO" --title "$title" --label "$labels" --body "$body"
  echo "CREATED: $title"
}

ensure_labels

# --- Issues ---

create_issue \
  "[Admin Portal] اتصال صفحات مدیریت کاربران، مستأجران و نقش‌ها به API واقعی" \
  "area:frontend,priority:high,epic" \
  "$(cat <<'EOF'
## خلاصه
صفحات اصلی مدیریت در `onesign-admin-portal-react` هنوز عملیات CRUD و ناوبری کامل را به API وصل نکرده‌اند و TODOهای متعددی دارند.

## محدوده
- `src/pages/admin/UsersPage.tsx` — detail، تغییر وضعیت، دعوت، حذف
- `src/pages/admin/TenantsPage.tsx` — detail، users، settings، status، delete
- `src/pages/admin/RolesPage.tsx` — detail، permissions editor، users (همچنین حذف mock fallback)
- `src/pages/tenant/UsersPage.tsx` — detail، role assignment، status، invite
- `src/pages/tenant/RolesPage.tsx` — detail، permissions، users
- `src/pages/tenant/AppsPage.tsx` — detail و edit

## معیار پذیرش
- [ ] هیچ `// TODO` در فایل‌های بالا باقی نماند
- [ ] در خطای API، fallback به mock data حذف شود (نمایش خطای واقعی)
- [ ] مسیرهای detail و modalها کار کنند
- [ ] تست‌های integration مرتبط به‌روز شوند

## مراجع
- `docs/OneSign-Features-Complete.md` — بخش مدیریت کاربران و نقش‌ها
EOF
)"

create_issue \
  "[Admin Portal] یکپارچه‌سازی Policy Engine (Tenant Policies)" \
  "area:frontend,priority:high,epic" \
  "$(cat <<'EOF'
## خلاصه
`TenantPoliciesPage.tsx` تمام عملیات policy را با TODO علامت‌گذاری کرده و به API متصل نیست.

## محدوده
- fetch / create / update / delete / evaluate / assign policies
- اتصال به `PolicyController` و ماژول `Onesign.Modules.Authorization`

## معیار پذیرش
- [ ] CRUD کامل policy از UI
- [ ] evaluate و assignment از UI
- [ ] حذف mock/placeholder در صفحه policies و detail

## مراجع
- `Phases/Phase7-Onesign-PolicyEngine.md`
- `src/Onesign.IntegrationTests/Controllers/PolicyControllerTests.cs`
EOF
)"

create_issue \
  "[Admin Portal] اتصال Change Management به API (حذف mock)" \
  "area:frontend,priority:high,epic" \
  "$(cat <<'EOF'
## خلاصه
صفحات Change Management در Admin Portal از داده mock استفاده می‌کنند در حالی که ماژول `Onesign.Modules.ChangeManagement` در backend پیاده شده است.

## محدوده
- `src/pages/tenant/change-management/TenantChangeManagementPage.tsx`
- `src/pages/global/change-management/GlobalChangeManagementPage.tsx`
- `src/pages/global/changes/audit/GlobalChangesAuditPage.tsx`

## معیار پذیرش
- [ ] لیست، جزئیات، simulate، approve/reject، apply، schedule از API واقعی
- [ ] حذف `mockData` و پیام‌های simulation mock
- [ ] audit log از API

## مراجع
- `Phases/Phase 27 - Change Management & Policy Simulation Center.md`
EOF
)"

create_issue \
  "[Admin Portal] حذف mock data از صفحات Global Operations" \
  "area:frontend,priority:medium,epic" \
  "$(cat <<'EOF'
## خلاصه
بخش قابل توجهی از صفحات Global Admin هنوز از mock/fallback استفاده می‌کنند.

## محدوده (حداقل)
- `GlobalSecurityPage.tsx`
- `GlobalMonitoringPage.tsx`
- `GlobalAuditPage.tsx`
- `GlobalDiagnosticsPage.tsx`
- `GlobalMigrationsPage.tsx`
- `GlobalPlatformPage.tsx`
- `GlobalIntegrationsPage.tsx`
- `GlobalWebhooksPage.tsx`
- `GlobalRateLimitingPage.tsx`
- `GlobalLicensesPage.tsx`
- `GlobalMaintenancePage.tsx`
- `GlobalRegionsPage.tsx`
- `GlobalBillingPage.tsx`
- `GlobalTenantsPage.tsx`

## معیار پذیرش
- [ ] هر صفحه به endpoint(های) متناظر backend متصل شود
- [ ] mock arrays و fallback حذف شوند
- [ ] loading/error/empty states استاندارد

## مراجع
- `Phases/Phase24-Onesign-PlatformCompletionAndIntegration.md`
EOF
)"

create_issue \
  "[Admin Portal] حذف mock data از صفحات Tenant Operations (دسته ۱)" \
  "area:frontend,priority:medium,epic" \
  "$(cat <<'EOF'
## خلاصه
صفحات عملیاتی tenant که backend دارند هنوز mock استفاده می‌کنند.

## محدوده
- Integrations (`TenantIntegrationsPage`, detail)
- Incidents (`TenantIncidentsPage`)
- Hunting (`TenantHuntingPage`)
- Sessions (`TenantSessionsPage`)
- Webhooks (`TenantWebhooksPage`)
- Risk Events (`TenantRiskEventsPage` — TODO API)
- Alerts (`TenantAlertsPage` — شامل Coming Soon templates)
- API Usage (`TenantApiUsagePage`)

## معیار پذیرش
- [ ] داده از سرویس‌های `src/lib/api/services/*` خوانده شود
- [ ] mock حذف شود
- [ ] Risk Events و Alerts به API واقعی وصل شوند
EOF
)"

create_issue \
  "[Admin Portal] حذف mock data از صفحات Tenant Operations (دسته ۲)" \
  "area:frontend,priority:medium,epic" \
  "$(cat <<'EOF'
## خلاصه
صفحات پیکربندی، گزارش و عملیات داده هنوز mock دارند.

## محدوده
- Exports / Imports
- Reports Compliance
- Certificates, Domains, IP Whitelist
- Data Retention, Schedules, Templates, Quotas
- Tokens, Conditional Access
- Delegated Admins (detail با loadMockData)
- Service Accounts (list + detail)
- Org Units detail
- Automation workflow executions
- Notifications + templates detail

## معیار پذیرش
- [ ] اتصال کامل به APIهای موجود
- [ ] حذف mock و fallback
EOF
)"

create_issue \
  "[Phase 30] Copilot Sidebar و تجربه راهنمای امنیتی (Guided Security)" \
  "area:frontend,area:backend,priority:medium,epic" \
  "$(cat <<'EOF'
## خلاصه
Copilot backend و صفحه `TenantCopilotPage` وجود دارد، اما Phase 30 نیاز به پنل کناری context-aware در Layout و قابلیت‌های Guided Security دارد.

## محدوده Backend
- `ICopilotOrchestrator` — Action mapping (CreateAutomationDraft, CreateHuntDraft, Open*)
- Context builder برای Incident, Policy, ChangeSet, Dashboard
- `POST /api/tenant/copilot/query` و global معادل — تست integration

## محدوده Frontend
- Copilot toggle در Layout Tenant/Global (نه فقط صفحه جدا)
- ارسال `ContextType` و `ContextId` از صفحات Incident/Policy/ChangeSet
- رندر SuggestedActions قابل کلیک

## معیار پذیرش
- [ ] Copilot از هر صفحه مرتبط context صحیح می‌فرستد
- [ ] پیشنهادها action واقعی ایجاد می‌کنند (draft automation/hunt)
- [ ] تست‌های unit/integration طبق Q30.3

## مراجع
- `Phases/Phase 30 – Onesign Copilot & Guided Security Experience.md`
- `src/Modules/Integration/Onesign.Modules.Copilot/`
EOF
)"

create_issue \
  "[Backend] پشتیبانی HTTP Caching برای Tenant Branding (ETag / 304)" \
  "area:backend,priority:medium" \
  "$(cat <<'EOF'
## خلاصه
Login Portal کش branding با ETag را پیاده کرده (`onesign-login-portal/lib/tenant-branding.ts`) اما `TenantBrandingController` هنوز `Cache-Control`، `ETag` و `304 Not Modified` ندارد.

## محدوده
- `src/Onesign.Api/Controllers/Tenant/TenantBrandingController.cs`
- `GET /api/tenant/branding`

## معیار پذیرش
- [ ] تولید ETag از محتوای branding
- [ ] پشتیبانی `If-None-Match` → 304
- [ ] هدرهای `Cache-Control` و `Last-Modified`
- [ ] تست integration برای conditional request

## مراجع
- `onesign-login-portal/API_CACHING_GUIDE.md`
- `BRANDING_CACHE_IMPLEMENTATION_SUMMARY.md`
EOF
)"

create_issue \
  "[Backend] اتصال SendTestEmail به IEmailService" \
  "area:backend,priority:medium" \
  "$(cat <<'EOF'
## خلاصه
`SendTestEmailCommandHandler` هنوز ایمیل واقعی ارسال نمی‌کند.

## محدوده
- `src/Modules/Platform/Onesign.Modules.Tenants/Application/Commands/SendTestEmailCommandHandler.cs`

## معیار پذیرش
- [ ] تزریق `IEmailService`
- [ ] ارسال واقعی test email با template tenant
- [ ] حذف TODOها
- [ ] تست واحد/یکپارچه
EOF
)"

create_issue \
  "[Backend] پیاده‌سازی SMS Provider تولیدی (جایگزین NullSmsService)" \
  "area:backend,priority:medium" \
  "$(cat <<'EOF'
## خلاصه
MFA از طریق SMS در `Program.cs` به `NullSmsService` متکی است.

## محدوده
- `Onesign.Shared.Sms.ISmsService`
- `MfaChallengeService`
- `NotificationDeliveryWorker`
- پیکربندی در `appsettings` (provider-agnostic)

## معیار پذیرش
- [ ] پیاده‌سازی حداقل یک provider واقعی (مثلاً Twilio/Azure) با feature flag
- [ ] مستندات راه‌اندازی
- [ ] تست integration برای ارسال MFA SMS در محیط dev
EOF
)"

create_issue \
  "[Phase 14] Onesign.Sdk.AspNetCore — NuGet package برای ASP.NET Core" \
  "area:sdk,priority:medium,epic" \
  "$(cat <<'EOF'
## خلاصه
فقط `Onesign.Sdk.DotNet` پایه وجود دارد؛ Phase 14 نیاز به `Onesign.Sdk.AspNetCore` با extension methods دارد.

## معیار پذیرش
- [ ] پروژه `src/Onesign.Sdk.AspNetCore`
- [ ] `AddOnesignAuthentication` / `UseOnesignAuthentication`
- [ ] JWT/OIDC validation، claims normalization
- [ ] README و نمونه sample app
- [ ] publish به NuGet (internal یا public)

## مراجع
- `Phases/Phase14-Onesign-SDKsAndIntegrationTooling.md`
EOF
)"

create_issue \
  "[Phase 14] @onesign/sdk-node — SDK برای Node.js/Express" \
  "area:sdk,priority:medium,epic" \
  "$(cat <<'EOF'
## خلاصه
SDK Node.js طبق Phase 14 هنوز ایجاد نشده است.

## معیار پذیرش
- [ ] پکیج npm `@onesign/sdk-node`
- [ ] middleware اعتبارسنجی token
- [ ] helpers برای OIDC discovery و JWKS
- [ ] README و نمونه Express

## مراجع
- `Phases/phase14-sdks-devtooling-prompt.txt`
EOF
)"

create_issue \
  "[Phase 14] onesign-cli — ابزار خط فرمان برای توسعه‌دهندگان" \
  "area:sdk,priority:low,epic" \
  "$(cat <<'EOF'
## خلاصه
CLI برای مدیریت client، redirect URIs و تولید config snippet وجود ندارد.

## معیار پذیرش
- [ ] دستورات: login، apps list/create، config export
- [ ] خروجی `.env` / `appsettings.json`
- [ ] مستندات نصب و استفاده

## مراجع
- `Phases/Phase14-Onesign-SDKsAndIntegrationTooling.md`
EOF
)"

create_issue \
  "[Phase 14] Dev Sandbox و Sample Apps" \
  "area:sdk,priority:low,epic" \
  "$(cat <<'EOF'
## خلاصه
محیط sandbox per-tenant و اپ‌های نمونه برای onboarding توسعه‌دهنده پیاده نشده.

## معیار پذیرش
- [ ] flag یا tenant type برای sandbox
- [ ] حداقل ۲ sample app (ASP.NET + React) در repo
- [ ] Postman collection یا export OpenAPI
- [ ] راهنمای quickstart در README

## مراجع
- `Phases/Phase14-Onesign-SDKsAndIntegrationTooling.md`
- `sdk/react-sdk/` (موجود — تکمیل مستندات و publish)
EOF
)"

create_issue \
  "[Phase 24] تکمیل Platform Completion — health، migrations UI، integration tests runner" \
  "area:backend,area:frontend,priority:medium,epic" \
  "$(cat <<'EOF'
## خلاصه
ماژول Platform و endpointهای global وجود دارند؛ UI و پوشش E2E باید با spec Phase 24 هم‌تراز شوند.

## محدوده
- Platform health aggregation verification
- Global migrations/diagnostics pages → API واقعی (حذف mock)
- اجرای integration test suite از Admin/API
- OpenAPI/Swagger publish

## معیار پذیرش
- [ ] `/api/global/platform/*` از UI قابل مشاهده و عملیاتی
- [ ] run integration tests از UI/API با نتیجه persist
- [ ] مستندات API به‌روز

## مراجع
- `Phases/Phase24-Onesign-PlatformCompletionAndIntegration.md`
EOF
)"

create_issue \
  "[CI/CD] یکپارچه‌سازی pipeline برای Backend + Admin Portal + Login Portal" \
  "area:infra,priority:medium" \
  "$(cat <<'EOF'
## خلاصه
- `.github/workflows/tests.yml` فقط backend tests
- `onesign-admin-portal-react/.github/workflows/ci-cd.yml` جداگانه
- `onesign-landing/.github/workflows/*` جداگانه

## معیار پذیرش
- [ ] workflow واحد یا matrix در root `.github/workflows`
- [ ] build + test برای هر سه اپ
- [ ] artifact/coverage گزارش
- [ ] (اختیاری) deploy staging
EOF
)"

create_issue \
  "[Infra] استقرار production — Helm/K8s برای stack کامل OneSign" \
  "area:infra,priority:medium" \
  "$(cat <<'EOF'
## خلاصه
`onesign-landing/k8s` وجود دارد؛ chart/مانیفست برای API، SQL Server، Redis و فرانت‌ها ناقص یا پراکنده است.

## معیار پذیرش
- [ ] Helm chart یا kustomize برای Onesign.Api
- [ ] manifests برای admin-portal-react و login-portal
- [ ] secrets/configmap pattern
- [ ] راهنمای DEPLOYMENT در root README

## مراجع
- `Phases/Phase21-Onesign-OnPrem-Hybrid-DeploymentKit.md`
- `onesign-landing/k8s/README.md`
EOF
)"

create_issue \
  "[Testing] گسترش پوشش Integration/E2E برای ماژول‌های بدون تست controller" \
  "area:backend,priority:medium" \
  "$(cat <<'EOF'
## خلاصه
`Onesign.IntegrationTests` بسیاری از controllerهای core را پوشش می‌دهد اما ماژول‌های جدیدتر (Hunting, Incidents, Automation, ChangeManagement, Copilot, Insights, Privacy) نیاز به تست E2E دارند.

## معیار پذیرش
- [ ] حداقل یک integration test per major module API
- [ ] E2E flow: login → tenant admin action → audit log
- [ ] اجرا در CI بدون flaky

## مراجع
- `src/Onesign.IntegrationTests/`
EOF
)"

create_issue \
  "[Docs] تکمیل README — License، Contributing، URLهای مستندات" \
  "area:docs,priority:low" \
  "$(cat <<'EOF'
## خلاصه
`README.md` placeholder دارد: License، Contributing guidelines، API docs URL، support email.

## معیار پذیرش
- [ ] فایل LICENSE یا SPDX در root
- [ ] CONTRIBUTING.md
- [ ] لینک‌های واقعی Swagger/OpenAPI و Developer Portal
- [ ] حذف placeholderها در README فارسی/انگلیسی
EOF
)"

create_issue \
  "[Docs] انتشار OpenAPI و Postman Collection برای توسعه‌دهندگان" \
  "area:docs,priority:low" \
  "$(cat <<'EOF'
## خلاصه
Phase 14 و DevPortal به OpenAPI منظم و Postman collection اشاره می‌کنند.

## معیار پذیرش
- [ ] export OpenAPI از `Onesign.Api` (Swagger)
- [ ] Postman collection در `docs/` یا `sdk/`
- [ ] نسخه‌گذاری هم‌زمان با API
EOF
)"

create_issue \
  "[Email] پیکربندی production برای IEmailService (SMTP/SendGrid)" \
  "area:backend,area:infra,priority:medium" \
  "$(cat <<'EOF'
## خلاصه
Magic link، password reset، invite و notification به `IEmailService` وابسته‌اند؛ نیاز به provider production و مستندات ops دارد.

## معیار پذیرش
- [ ] پیاده‌سازی provider قابل تنظیم از appsettings
- [ ] health check برای email
- [ ] runbook برای failure modes
- [ ] تست در staging

## مراجع
- handlers در `Onesign.Modules.Identity`
- `NotificationDeliveryWorker`
EOF
)"

echo ""
echo "Done. View issues: https://github.com/${REPO}/issues"
