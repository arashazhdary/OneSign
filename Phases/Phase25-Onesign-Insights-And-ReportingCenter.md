# onesign – Phase 25: Insights & Reporting Center

## 1. مقدمه و هدف فاز ۲۵

### 1.1 خلاصه

Phase 25 می‌خواهد onesign را از یک "SSO جعبه سیاه" تبدیل کند به یک پلتفرم با:

- داشبوردهای قابل فهم برای Tenant Admin و Global Admin  
- اینسایت امنیتی و استفاده از SSO  
- گزارش‌های آماده برای MFA coverage, risky sign-ins, app usage, access requests, lifecycle  
- گزارش‌های قابل دانلود (CSV)  
- گزارش‌های زمان‌بندی شده ایمیلی با استفاده از NotificationCenter  

اگر فقط raw log داشته باشیم و هیچ Insight و گزارش واقعی ندهیم، برای مشتری enterprise onesign فقط یک "login box" است نه یک "security platform".

### 1.2 وضعیت فعلی (خلاصه فازهای قبل)

تا قبل از Phase 25، موارد زیر پیاده سازی شده است:

- Multi tenant SSO, OIDC/OAuth2, Federation, Authorization (RBAC, ABAC), OrgUnit  
- Billing, Governance, Access Review, NotificationCenter  
- Observability (logs, metrics, traces)  
- DevPortal, AccessRequests, IdentityLifecycle, PrivilegedAccess, AdaptiveSecurity, Extensibility  
- MultiRegion DR, Environment و On Prem or Hybrid deployment  
- Crypto و JWKS (Phase 22)  
- Privacy و Data Subject Requests و retention (Phase 23)  

Phase 25 روی این زیرساخت سوار می‌شود و داده‌های موجود را به insight های قابل مصرف تبدیل می‌کند.

---

## 2. دامنه و Personas

### 2.1 Tenant Security Officer / Tenant Admin

می‌خواهد:

- Overview از وضعیت امنیتی tenant:
  - MFA adoption  
  - SSO coverage برای اپ‌ها  
  - High risk sign in ها  
  - حجم AccessRequests و زمان پاسخ  
  - فعالیت‌های Lifecycle (joiner, mover, leaver)  
- گزارش per app و per user:
  - چه اپ‌هایی واقعا استفاده می‌شوند  
  - چه کاربرانی MFA ندارند  
- Export گزارش‌ها به CSV برای تحلیل خارج از سیستم  

### 2.2 Global Admin / Platform Owner

می‌خواهد:

- Cross tenant insights:
  - فعال ترین tenants  
  - MFA adoption per tenant  
  - tenants پرریسک (failed login زیاد, high risk sign in, emergency access بالا)  
- گزارش adoption برای فروش و upsell  

### 2.3 Auditor / Compliance

می‌خواهد:

- مدارک قابل ارائه:
  - گزارش usage  
  - گزارش MFA coverage  
  - summary از governance و access review activity  

---

## 3. محدوده فاز ۲۵

### 3.1 In scope

- Aggregated insights و snapshot های روزانه برای:
  - Tenant level usage  
  - App level usage  
  - User level security posture  
- API های خواندنی برای Tenant و Global insights  
- CSV export برای گزارش های کلیدی  
- Scheduled report subscriptions و ایمیل گزارش ها از طریق NotificationCenter  
- UI در Admin Portal برای:
  - Tenant insights (Overview, Apps, Users, Reports)  
  - Global insights (Tenants overview, Risky tenants, Reports)  

### 3.2 Out of scope

- تصمیم گیری های جدید security policy بر اساس این Insights (فقط read only و گزارش)  
- ساخت data warehouse جداگانه  
- تجمیع real time dashboard پیچیده (aggregation روزانه کافی است)  

---

## 4. معماری و ماژول

### 4.1 ماژول جدید: Onesign.Modules.Insights

یک ماژول جدید معرفی می‌شود:

- `Onesign.Modules.Insights`
  - مسئول:
    - نگهداری snapshot های Aggregated  
    - API های Insights  
    - ReportSubscription  
    - job های Aggregation و Scheduled Reports  

در صورت وجود ماژول Observability:

- Observability ماژول log, metric, trace سطح پایین را نگه می‌دارد  
- Insights روی داده های domain موجود (Auth events, AccessRequests, Lifecycle, ...) aggregation انجام می‌دهد  

### 4.2 وابستگی ها

Insights module فقط به صورت read only به ماژول های زیر وابسته است:

- Identity و Users  
- Tenants و Applications/Clients  
- Auth/Audit events (Sign in log)  
- AdaptiveSecurity (risk score / high risk flags)  
- AccessRequests  
- IdentityLifecycle  
- PrivilegedAccess  
- NotificationCenter (برای email reports)  

---

## 5. مدل داده و موجودیت ها

### 5.1 TenantDailyUsageSnapshot

یک snapshot روزانه در سطح tenant.

```text
TenantDailyUsageSnapshot
- Id (Guid, PK)
- TenantId (Guid, FK to Tenant)
- Date (date, UTC)

- TotalUsers (int)
- ActiveUsers (int)                    // کاربرانی که در آن روز لاگین کرده اند
- MfaEnabledUsers (int)

- TotalApplications (int)
- ApplicationsWithSSOEnabled (int)

- TotalSignInCount (int)
- FailedSignInCount (int)
- HighRiskSignInCount (int)            // از AdaptiveSecurity یا risk flags

- AccessRequestCount (int)             // تعداد ایجاد شده در آن روز
- AccessRequestApprovedCount (int)

- LifecycleEventsCount (int)           // joiner, mover, leaver

- EmergencyAccessCount (int)           // break glass یا emergency privilege
- CreatedAt (DateTimeOffset)


5.2 ApplicationDailyUsageSnapshot

تحلیل روزانه per app داخل هر tenant.

ApplicationDailyUsageSnapshot
- Id (Guid, PK)
- TenantId (Guid)
- ApplicationId (Guid)
- Date (date, UTC)

- UniqueUsers (int)
- SignInCount (int)
- FailedSignInCount (int)
- HighRiskSignInCount (int)
- CreatedAt (DateTimeOffset)

5.3 UserSecurityPosture

وضعیت امنیتی کاربر در tenant.

UserSecurityPosture
- Id (Guid, PK)
- TenantId (Guid)
- UserId (Guid)

- LastSignInAt (DateTimeOffset?)
- MfaEnabled (bool)
- EnabledAppsCount (int)              // تعداد اپ‌هایی که کاربر به آن ها دسترسی دارد
- UsedAppsLast30DaysCount (int)       // تعداد اپ هایی که در ۳۰ روز اخیر استفاده کرده
- HighRiskEventsLast30Days (int)

- IsAnonymized (bool)                 // برای هماهنگی با Privacy و DSR
- UpdatedAt (DateTimeOffset)

5.4 ReportSubscription

تعریف subscription برای گزارش های زمان بندی شده.

ReportSubscription
- Id (Guid, PK)

- ScopeType (string)
  // "Tenant" یا "Global"
- ScopeId (Guid, nullable)
  // اگر ScopeType = Tenant, مقدار TenantId
  // اگر Global, ممکن است null یا Id logical

- ReportType (string)
  // "TenantSecuritySummary"
  // "TenantUsageSummary"
  // "GlobalTenantsOverview"
  // و موارد مشابه

- CronOrFrequency (string)
  // مثلا "Daily", "Weekly", یا یک cron ساده

- EmailRecipients (string)
  // comma separated (در صورت نیاز در آینده جدول جدا)

- IsActive (bool)

- CreatedAt (DateTimeOffset)
- CreatedByUserId (Guid)
- UpdatedAt (DateTimeOffset?)
- UpdatedByUserId (Guid?)

6. Aggregation jobs
6.1 DailyInsightsAggregationJob

Job: DailyInsightsAggregationJob

اجرا: روزانه (per environment)

رفتار:

برای هر Tenant:

محاسبه TenantDailyUsageSnapshot برای تاریخ هدف (مثلا روز قبل):

از Identity module:

TotalUsers

تعداد کاربران با MFA فعال (MfaEnabledUsers)

از Applications/Clients:

TotalApplications

ApplicationsWithSSOEnabled (اپ هایی که واقعا پشت SSO هستند)

از Auth/Audit events:

TotalSignInCount در آن روز

FailedSignInCount

HighRiskSignInCount (براساس risk flag از AdaptiveSecurity)

از AccessRequests:

AccessRequestCount

AccessRequestApprovedCount

از IdentityLifecycle:

LifecycleEventsCount (joiner, mover, leaver)

از PrivilegedAccess:

EmergencyAccessCount (break glass و …)

Upsert رکورد TenantDailyUsageSnapshot:

اگر وجود دارد، update

اگر نه، insert

محاسبه ApplicationDailyUsageSnapshot:

از sign in events per application:

group by TenantId, ApplicationId, Date

UniqueUsers, SignInCount, FailedSignInCount, HighRiskSignInCount

برای هر group:

Upsert ApplicationDailyUsageSnapshot

محاسبه UserSecurityPosture:

برای هر کاربر active در tenant:

LastSignInAt از auth events

MfaEnabled از user profile

EnabledAppsCount از authorization

UsedAppsLast30DaysCount از usage events در ۳۰ روز اخیر

HighRiskEventsLast30Days از risk events

Upsert UserSecurityPosture

اگر کاربر توسط Privacy/DSR anonymize شده:

IsAnonymized = true

Audit:

برای هر اجرای موفق:

"Insights.SnapshotGenerated" با tenantId و date و summary counts

Performance:

اجرا به صورت batch per tenant

استفاده از index ها روی TenantId, Date, ApplicationId

7. API طراحی – Backend
7.1 Tenant level Insights API

Base route: /api/tenant/insights

7.1.1 Overview

GET /api/tenant/insights/overview?from=YYYY-MM-DD&to=YYYY-MM-DD

ورودی:

from, to (date)

خروجی:

timeSeries از TenantDailyUsageSnapshot بین from و to

summary:

averageDailyActiveUsers

mfaAdoptionPercent (MfaEnabledUsers / TotalUsers)

ssoCoveragePercent (ApplicationsWithSSOEnabled / TotalApplications)

failedSignInRate

highRiskSignInRate

accessRequestVolumeLast30Days

7.1.2 Applications

GET /api/tenant/insights/apps?date=YYYY-MM-DD

خروجی:

لیست ApplicationDailyUsageSnapshot برای تاریخ مشخص

اگر date خالی، مثلا آخرین روز یا aggregate ۷ روز اخیر

فیلدها per app:

ApplicationId, ApplicationName

UniqueUsers

SignInCount

FailedSignInCount

HighRiskSignInCount

7.1.3 Users Security Posture

GET /api/tenant/insights/users/security-posture?sortBy=&mfaEnabled=&hasHighRisk=&page=&pageSize=

فیلترها:

mfaEnabled = true یا false

hasHighRisk = true یعنی HighRiskEventsLast30Days > 0

خروجی:

صفحه ای از UserSecurityPosture:

UserId, DisplayName, Email (اگر anonymized نیست)

MfaEnabled

LastSignInAt

EnabledAppsCount

UsedAppsLast30DaysCount

HighRiskEventsLast30Days

7.1.4 Export endpoints

GET /api/tenant/insights/export/overview?from=...&to=...&format=csv

GET /api/tenant/insights/export/users?format=csv&filter=...

خروجی:

فایل CSV (Content Type مناسب) با ستون های واضح و سازگار

Permissions:

همه endpoint های tenant insights فقط برای:

TenantAdmin, TenantSecurityOfficer, TenantPrivacyAdmin یا نقش معادل

7.2 Global level Insights API

Base route: /api/global/insights

7.2.1 Tenants overview

GET /api/global/insights/tenants/overview?from=...&to=...&sortBy=&page=&pageSize=

خروجی per tenant:

TenantId, TenantName

ActiveUsersTotal (در بازه)

TotalSignInCount

MfaAdoptionPercent

SsoCoveragePercent

HighRiskSignInCount

7.2.2 Risky tenants

GET /api/global/insights/tenants/risky

بر اساس معیارهای ساده:

MFA adoption پایین

نسبت FailedSignIn بالا

HighRiskSignInCount بالا

خروجی:

لیست tenants با score یا rank

7.2.3 Global export

GET /api/global/insights/export/tenants?from=...&to=...&format=csv

Permissions:

همه endpoint های global insights فقط برای GlobalAdmin / PlatformOwner

7.3 ReportSubscription APIs

Tenant scope:

GET /api/tenant/insights/report-subscriptions

POST /api/tenant/insights/report-subscriptions

PUT /api/tenant/insights/report-subscriptions/{id}

DELETE /api/tenant/insights/report-subscriptions/{id}

Global scope:

GET /api/global/insights/report-subscriptions

POST /api/global/insights/report-subscriptions

PUT /api/global/insights/report-subscriptions/{id}

DELETE /api/global/insights/report-subscriptions/{id}

ReportType نمونه:

TenantSecuritySummary

TenantUsageSummary

GlobalTenantsOverview

CronOrFrequency:

"Daily"

"Weekly"

امکان توسعه به cron expression

8. Scheduled reports
8.1 ScheduledReportsJob

Job: ScheduledReportsJob در Insights module

رفتار:

به صورت دوره ای (مثلا هر ساعت) اجرا شود.

کارها:

لود همه ReportSubscription با IsActive = true

بررسی براساس CronOrFrequency که کدام subscription الان باید fire شود

برای هر subscription فعال:

اگر ScopeType = Tenant:

tenant context را تنظیم کن

داده گزارش را بساز:

اگر ReportType = TenantSecuritySummary:

داده از /api/tenant/insights/overview (internally via service)

اگر TenantUsageSummary:

ترکیبی از overview و apps

اگر ScopeType = Global:

GlobalTenantsOverview داده از /api/global/insights/tenants/overview

یک HTML report ساده بساز:

جدول summary key metrics

لینک اختیاری به Admin Portal

با NotificationCenter:

ایمیل به EmailRecipients ارسال کن

Audit events:

"Insights.ReportGenerated"

"Insights.ReportDelivered"

هیچ implementation جعلی نباید باشد. Job واقعا باید summary بسازد و NotificationCenter را فراخوانی کند.

9. UI – Admin Portal
9.1 Tenant Admin – Insights

Route: /tenant/insights

Tabs:

Overview

Applications

Users

Reports

همه text ها باید از i18n بیایند (English و Persian).

9.1.1 Overview tab

API: /api/tenant/insights/overview

بخش ها:

فیلتر تاریخ:

from, to (مثلا date range picker)

نمودارها:

line chart برای:

daily active users

sign in count

failed sign in count

کارت های خلاصه:

MFA adoption percentage

SSO coverage percentage

High risk sign in count (7 یا 30 روز اخیر)

AccessRequests last 30 days

دکمه Export:

CSV download از export/overview

9.1.2 Applications tab

API: /api/tenant/insights/apps?date=...

جدول:

App name

UniqueUsers

SignInCount

FailedSignInCount

HighRiskSignInCount

قابلیت ها:

sorting

filtering ساده (مثلا حداقل UniqueUsers)

Export CSV

9.1.3 Users tab

API: /api/tenant/insights/users/security-posture

جدول:

User display name

Email (در صورت anonymized نبودن)

MfaEnabled (badge)

LastSignInAt

EnabledAppsCount

UsedAppsLast30DaysCount

HighRiskEventsLast30Days

فیلترها:

فقط کاربرانی که MFA ندارند

فقط کاربرانی که HighRiskEventsLast30Days > 0 دارند

Export CSV برای لیست کاربران

9.1.4 Reports tab

API:

GET /api/tenant/insights/report-subscriptions

POST/PUT/DELETE

UI:

جدول subscription ها:

ReportType

Frequency

EmailRecipients

IsActive

فرم ایجاد جدید:

انتخاب ReportType

انتخاب Frequency

وارد کردن EmailRecipients

toggle فعال بودن

9.2 Global Admin – Insights

Route: /global/insights

Tabs:

Tenants Overview

Risky Tenants

Reports

9.2.1 Tenants Overview tab

API: /api/global/insights/tenants/overview

جدول:

TenantName

ActiveUsers

TotalSignInCount

MfaAdoptionPercent

SsoCoveragePercent

HighRiskSignInCount

قابلیت ها:

sorting (مثلا بر اساس MFA adoption, risk, usage)

basic filters

CSV export

9.2.2 Risky Tenants tab

API: /api/global/insights/tenants/risky

نمایش:

لیست tenants با risk score

کارت summary برای بالاترین ریسک

9.2.3 Reports tab

مشابه Tenant Reports ولی برای scope Global:

Manage global ReportSubscription ها برای:

GlobalTenantsOverview

گزارش های cross tenant

10. Cross cutting concerns
10.1 Multi tenant و Environment

همه entity های Insights دارای TenantId هستند (به جز موارد global).

همه queries tenant scoped هستند.

Global endpoints فقط aggregate per tenant انجام می‌دهند، بدون mix کردن user level PII بین tenants.

10.2 Privacy و DSR

UserSecurityPosture باید با Privacy module هماهنگ باشد:

اگر یک user anonymized یا deleted شد:

IsAnonymized = true

از نمایش مستقیم نام یا email جلوگیری شود

Export های tenant insights فقط data مجاز برای Tenant Admin را نشان می‌دهند.

10.3 Security و Authorization

/api/tenant/insights/*:

فقط TenantAdmin, TenantSecurityOfficer, TenantPrivacyAdmin و نقش های مشابه

/api/global/insights/*:

فقط GlobalAdmin, PlatformOwner

هیچ endpoint insights نباید توسط End User معمولی قابل دسترس باشد.

10.4 Observability و Audit

برای aggregation و گزارش:

"Insights.SnapshotGenerated"

"Insights.ReportSubscriptionCreated"

"Insights.ReportSubscriptionUpdated"

"Insights.ReportSubscriptionDeleted"

"Insights.ReportGenerated"

"Insights.ReportDelivered"

Logging و metrics مناسب برای job ها و API ها.

10.5 Multi language

تمام متن های UI از سیستم i18n موجود استفاده می‌کنند.

خطاها و validation messages backend با الگوی localization موجود هماهنگ باشند.

10.6 بدون TODO و پیاده سازی نصفه

هیچ TODO در کد

بدون NotImplementedException

بدون endpoint یا صفحه ای که داده fake یا empty hard coded برگرداند

Aggregation باید واقعا از داده واقعی ماژول ها استفاده کند

11. User Story ها (خلاصه)
Epic 25.1 – Tenant Security & Usage Insights

US 25.1.1: به عنوان Tenant Security Officer، می‌خواهم یک داشبورد Overview داشته باشم تا وضعیت security و usage tenant را در بازه تاریخی ببینم.

US 25.1.2: به عنوان Tenant Admin، می‌خواهم per app usage ببینم تا بفهمم کدام اپ ها واقعا استفاده می‌شوند.

US 25.1.3: به عنوان Tenant Security Officer، می‌خواهم لیست کاربران با MFA غیرفعال و ریسک بالا را ببینم تا روی آن ها اقدام کنم.

Epic 25.2 – Global Insights

US 25.2.1: به عنوان Global Admin، می‌خواهم overview تمامی tenants را ببینم تا adoption و ریسک را مقایسه کنم.

US 25.2.2: به عنوان Global Admin، می‌خواهم tenants پرریسک را شناسایی کنم تا روی آن ها تمرکز کنم.

Epic 25.3 – Reports & Exports

US 25.3.1: به عنوان Tenant Admin، می‌خواهم گزارش های CSV داشبوردها را دانلود کنم.

US 25.3.2: به عنوان Tenant Security Officer، می‌خواهم گزارش های ایمیلی دوره ای دریافت کنم.

US 25.3.3: به عنوان Global Admin، می‌خواهم گزارش cross tenant برای مدیریت و board آماده داشته باشم.

12. Dev Tasks (سطح بالا)
12.1 Backend

ایجاد ماژول Onesign.Modules.Insights

پیاده سازی entities و EF mappings:

TenantDailyUsageSnapshot

ApplicationDailyUsageSnapshot

UserSecurityPosture

ReportSubscription

پیاده سازی DailyInsightsAggregationJob

پیاده سازی ScheduledReportsJob و ادغام با NotificationCenter

پیاده سازی API های tenant insights و global insights

پیاده سازی CSV export endpoints

رعایت authorization و audit

12.2 Frontend

اضافه کردن routes:

/tenant/insights با tabs

/global/insights با tabs

پیاده سازی component ها و صفحات:

Overview, Apps, Users, Reports (tenant)

TenantsOverview, RiskyTenants, Reports (global)

اتصال به API ها

i18n برای تمام متن ها

دانلود CSV ها

12.3 Tests

Unit و integration برای:

aggregation job

insights API ها

report subscription CRUD

scheduled reports job

Manual QA برای:

داشبورد tenant

داشبورد global

export CSV

دریافت ایمیل گزارش

13. Acceptance Criteria فاز ۲۵

برای یک tenant تستی با داده واقعی:

TenantDailyUsageSnapshot و ApplicationDailyUsageSnapshot و UserSecurityPosture به صورت روزانه پر می‌شوند.

داشبورد /tenant/insights داده واقعی نشان می‌دهد.

CSV export ها فایل معتبر تولید می‌کنند.

ایجاد یک ReportSubscription و اجرای ScheduledReportsJob منجر به ارسال ایمیل واقعی از NotificationCenter می‌شود.

برای Global Admin:

/global/insights tenants را با معیارهای مشخص نمایش می‌دهد.

Risky tenants tab درست محاسبه می‌شود.

هیچ TODO یا NotImplemented در کد مرتبط با Insights باقی نماند.
