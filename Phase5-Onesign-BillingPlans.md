# onesign – Phase 5 Billing, Plans, Quotas & Usage

## 1. محدوده Phase 5

### 1.1 هدف کلی

Phase 5 تمرکزش این است که onesign را از «پلتفرم تکنیکی خفن» تبدیل کند به **محصول قابل فروش**:

- Plan و Subscription per-tenant (Free / Pro / Enterprise یا custom)
- Billing-friendly model (رو تراکنش، رو تعداد user، رو feature، رو request)
- Usage metrics و quota enforcement (کاربر، اپلیکیشن، SSO events، IdP و غیره)
- Global Billing Admin برای صاحب SaaS
- Tenant Self-service: دیدن Plan، usage، upgrade request

بدون این فاز، همه فازهای قبل یک PoC گنده‌اند.

### 1.2 چه چیزی اضافه می‌شود

برای هر tenant:

- Plan و Subscription:
  - current plan
  - billing period (ماهانه، سالانه)
  - trial start/end
  - وضعیت: Trial, Active, PastDue, Suspended, Canceled
- PlanFeatures:
  - max users
  - max applications
  - max IdP/federation connections
  - max orgUnits
  - max active sessions per user (اختیاری)
  - feature flags:
    - OrgHierarchyEnabled
    - AdvancedSecurityEnabled (Phase 3)
    - FederationEnabled (Phase 4)
    - ScimEnabled
- Usage & Quotas:
  - تقریبی:
    - user count (TenantUser)
    - active users (MAU)
    - application count
    - IdP count
    - monthly login count
    - SCIM operations count
- Enforcement:
  - soft limit → warning و log
  - hard limit → block عملیات خاص (مثلاً ایجاد user جدید)

### 1.3 چه چیزهایی عمداً در Phase 5 نیست

چیزهایی که الان **نمی‌زنیم**:

- ادغام واقعی با PSP (Stripe, Braintree) (فاز بعد → Payment Integration)
- Invoicing کامل و PDF مالیاتی
- Tax/VAT پیچیده
- Revenue recognition و accounting

این فاز فقط:

- data model بیزنسی
- usage و limit
- admin UI  
را بالا می‌آورد که وقتی رفتی Stripe یا درگاه بانکی، فقط integration مالی را اضافه کنی.

---

## 2. معماری و ماژول‌ها

### 2.1 ماژول Billing

اضافه شود:

- `Onesign.Modules.Billing`

ساختار:

```text
Onesign.Modules.Billing/
  Domain/
    Entities/
      Plan.cs
      PlanFeature.cs
      TenantSubscription.cs
      TenantUsageSnapshot.cs
      UsageCounter.cs
    Enums/
      SubscriptionStatus.cs    // Trial, Active, PastDue, Suspended, Canceled
      PlanType.cs              // Free, Pro, Enterprise, Custom
      UsageMetricType.cs       // Users, ActiveUsers, Applications, Logins, IdpConnections, ScimCalls, ...
      LimitType.cs             // Hard, Soft
    Services/
      IPlanService.cs
      ISubscriptionService.cs
      IUsageService.cs
      IQuotaEnforcementService.cs
    Repositories/
      IPlanRepository.cs
      ISubscriptionRepository.cs
      IUsageRepository.cs
  Application/
    DTOs/
      PlanDto.cs
      PlanFeatureDto.cs
      CreateOrUpdatePlanRequest.cs
      TenantSubscriptionDto.cs
      UpdateTenantSubscriptionRequest.cs
      TenantUsageSummaryDto.cs
      TenantUsageDetailsDto.cs
      TenantQuotaStatusDto.cs
    Commands/
      CreateOrUpdatePlanCommand.cs
      ActivatePlanCommand.cs
      DeactivatePlanCommand.cs
      AssignSubscriptionToTenantCommand.cs
      ChangeTenantPlanCommand.cs
      MarkSubscriptionStatusCommand.cs
      RecordUsageEventCommand.cs
      RecalculateTenantUsageCommand.cs
    Queries/
      GetPlansQuery.cs
      GetPlanDetailsQuery.cs
      GetTenantSubscriptionQuery.cs
      GetTenantUsageSummaryQuery.cs
      GetTenantUsageDetailsQuery.cs
      GetOverQuotaTenantsQuery.cs
  Infrastructure/
    EfCore/Entities/
      PlanEntity.cs
      PlanFeatureEntity.cs
      TenantSubscriptionEntity.cs
      TenantUsageSnapshotEntity.cs
      UsageCounterEntity.cs
    EfCore/Configurations/
      PlanEntityTypeConfiguration.cs
      PlanFeatureEntityTypeConfiguration.cs
      TenantSubscriptionEntityTypeConfiguration.cs
      TenantUsageSnapshotEntityTypeConfiguration.cs
      UsageCounterEntityTypeConfiguration.cs
    EfCore/Repositories/
      PlanRepository.cs
      SubscriptionRepository.cs
      UsageRepository.cs


2.2 مدل داده (خلاصه)

Plan

public class Plan
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }          // "Free", "Pro", ...
    public string Code { get; private set; }          // "free", "pro", "enterprise"
    public PlanType Type { get; private set; }

    public bool IsActive { get; private set; }

    public IReadOnlyCollection<PlanFeature> Features { get; private set; }
}


PlanFeature

public class PlanFeature
{
    public Guid Id { get; private set; }
    public Guid PlanId { get; private set; }

    public string Key { get; private set; }       // "MaxUsers", "MaxApps", "OrgHierarchyEnabled"
    public string Value { get; private set; }     // تشریح: int / bool / string serialized
    public LimitType? LimitType { get; private set; } // Hard/Soft برای limit ها
}


TenantSubscription

public class TenantSubscription
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid PlanId { get; private set; }

    public SubscriptionStatus Status { get; private set; }
    public DateTime StartedAt { get; private set; }
    public DateTime? TrialEndsAt { get; private set; }
    public DateTime? CurrentPeriodEndsAt { get; private set; }

    public bool IsTrial => Status == SubscriptionStatus.Trial && TrialEndsAt >= UtcNow;
}


UsageCounter

public class UsageCounter
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public UsageMetricType MetricType { get; private set; }
    public int PeriodYear { get; private set; }
    public int PeriodMonth { get; private set; }

    public long Value { get; private set; }      // تعداد login، SCIM call، ...
}


TenantUsageSnapshot

public class TenantUsageSnapshot
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public DateTime CapturedAt { get; private set; }

    public int UserCount { get; private set; }
    public int ActiveUsersLast30Days { get; private set; }
    public int ApplicationCount { get; private set; }
    public int IdpConnectionCount { get; private set; }
    public long LoginsThisMonth { get; private set; }
    public long ScimCallsThisMonth { get; private set; }
}

3. Epics و User Story ها – Phase 5
Epic 1 – Plan ها و Feature Flags
US 1.1 – تعریف Plan های سراسری

به عنوان SaaS Owner (Global Admin)
می‌خواهم Plan های مختلف را تعریف کنم
تا بتوانم tenant ها را روی Plan مناسب شان قرار دهم.

Acceptance:

Plan:

Name, Code, Type, IsActive

Features: key/value با LimitType

نمونه:

Free:

MaxUsers = 50, LimitType = Hard

MaxApplications = 3

OrgHierarchyEnabled = false

FederationEnabled = false

Pro:

MaxUsers = 1000

OrgHierarchyEnabled = true

AdvancedSecurityEnabled = true

FederationEnabled = true

ScimEnabled = false

Enterprise:

بیشتر یا Unlimited با تماس فروش

Endpoint:

GET /api/global/billing/plans

POST /api/global/billing/plans

PUT /api/global/billing/plans/{id}

DELETE /api/global/billing/plans/{id} (اگر استفاده نشده)

US 1.2 – فعال/غیرفعال کردن Plan

به عنوان SaaS Owner
می‌خواهم بتوانم یک Plan را active/deactive کنم
تا برای tenant های جدید استفاده/عدم استفاده شود.

Acceptance:

Plan.IsActive قابل toggle

Plan deactivated نباید برای tenant جدید assign شود، ولی برای tenant قدیمی می‌تواند باقی بماند.

Epic 2 – Subscription per Tenant
US 2.1 – انتساب Plan به Tenant

به عنوان Global Admin
می‌خواهم Plan را برای هر tenant تنظیم کنم
تا بدانم این tenant در چه level ی است.

Acceptance:

TenantSubscription:

TenantId, PlanId

Status, StartedAt, TrialEndsAt, CurrentPeriodEndsAt

Endpoint:

GET /api/global/billing/tenants/{tenantId}/subscription

POST /api/global/billing/tenants/{tenantId}/subscription (یا PUT)

Plan تغییر:

ChangeTenantPlanCommand:

PlanId جدید

ثبت در Audit

US 2.2 – Trial و Status

به عنوان سیستم
می‌خواهم status subscription را نگه دارم
تا بتوانم رفتار سیستم را بر اساس Trial/Active/Suspended تنظیم کنم.

Acceptance:

Status های:

Trial

Active

PastDue

Suspended

Canceled

در این فاز:

PastDue/Suspended بیشتر برای future billing integration هستند، ولی flag آماده است.

Endpoint:

POST /api/global/billing/tenants/{tenantId}/status → MarkSubscriptionStatusCommand

Epic 3 – Usage Metrics
US 3.1 – Snapshot دوره‌ای Usage per Tenant

به عنوان SaaS Owner
می‌خواهم بدانم هر tenant چقدر resource مصرف کرده
تا بتوانم billing، upgrade، و capacity plan انجام دهم.

Acceptance:

TenantUsageSnapshot:

روزانه یا ساعتی (فاز ۵ → روزانه کافی است)

UserCount, ActiveUsersLast30Days, ApplicationCount, IdpConnectionCount, LoginsThisMonth, ScimCallsThisMonth

سرویس Usage:

روزانه job (یا command) که snapshot را برای همه tenants به روز کند.

US 3.2 – Counting login و SCIM و غیره

به عنوان سیستم
می‌خواهم رویدادهای مهم را در UsageCounter ذخیره کنم
تا بتوانم usage per month را track کنم.

Acceptance:

هر login موفق:

افزایش UsageCounter برای MetricType = Logins، PeriodYear, PeriodMonth

هر SCIM call:

افزایش UsageCounter برای MetricType = ScimCalls

روش جمع:

Transaction-safe increment

Epic 4 – Quota Enforcement
US 4.1 – جلوگیری از تجاوز limit های سخت

به عنوان سیستم
نمی‌خواهم tenant بتواند فراتر از limit های سخت plan خودش resource مصرف کند
تا سیستم پایدار و بیزنس پایبند به وعده‌ها باشد.

Acceptance:

عملیات‌های حساس:

ایجاد TenantUser جدید

ایجاد ApplicationClient جدید

ایجاد IdP/federation provider جدید

فعال کردن OrgHierarchy / Federation / Security features

IQuotaEnforcementService:

public interface IQuotaEnforcementService
{
    Task CheckCanCreateUserAsync(Guid tenantId);
    Task CheckCanCreateApplicationAsync(Guid tenantId);
    Task CheckFeatureEnabledAsync(Guid tenantId, string featureKey);
}


اگر limit Hard رد شد:

برگشت خطای معنی دار (کد + message)

log + optional AuditEvent

US 4.2 – هشدار قبل از رسیدن به limit

به عنوان Tenant Admin
می‌خواهم قبل از این که سیستم من را قطع کند، بدانم نزدیک limit هستم
تا اقدام کنم (پاکسازی، upgrade plan).

Acceptance:

Threshold مثلا ۸۰٪:

اگر user count به ۸۰٪ MaxUsers رسید:

در Admin Portal روی Dashboard یا Billing Tab یک warning

Endpoint:

GET /api/tenant/billing/quota-status

TenantQuotaStatusDto:

UserCount, MaxUsers, UsagePercent

AppCount, MaxApps, ...

Flags: NearLimitUsers, NearLimitApps, ...

Epic 5 – Tenant Billing View (Self-service)
US 5.1 – دیدن Plan و Usage در پنل Tenant

به عنوان Tenant Admin
می‌خواهم Plan فعلی و مصرف خودم را ببینم
تا بدانم کجای کارم و آیا باید upgrade کنم.

Acceptance:

صفحه /tenant/billing

نمایش:

PlanName, PlanType

TrialEndsAt

UsageSummary:

UserCount / MaxUsers

ApplicationCount / MaxApplications

IdpCount / MaxIdps

LoginsThisMonth و limit (اگر وجود دارد)

پیشنهاد:

اگر نزدیک limit → پیام recommend upgrade

US 5.2 – درخواست Upgrade

در این فاز، هنوز پرداخت آنلاین نمی‌زنیم، اما:

Acceptance:

Tenant Admin بتواند روی "Request Upgrade to Pro/Enterprise" کلیک کند:

ارسال یک request (مثلاً در DB و ایمیل به SaaS Owner)

Endpoint:

POST /api/tenant/billing/upgrade-requests (ساختار ساده: TenantId, TargetPlanId, Comment)

Epic 6 – Global Billing Admin Dashboard
US 6.1 – لیست tenant ها با وضعیت Billing

به عنوان SaaS Owner
می‌خواهم تمام tenant ها با Plan و Usage را ببینم
تا بتوانم مشتری‌های پرمصرف، نزدیک limit یا risk را شناسایی کنم.

Acceptance:

صفحه /global/billing/tenants

جدول:

TenantName

PlanName

Status

UserCount / MaxUsers

LoginsThisMonth / Limit

Flags مثل: OverLimit, NearLimit

Endpoint:

GET /api/global/billing/tenants?filter=... → بر اساس Query GetOverQuotaTenants و GetTenantUsageSummary

4. Dev Tasks – Backend
4.1 Database و Entities

Task B5-1 – اضافه کردن Entities و DbSet ها

اضافه Entities در Onesign.Modules.Billing.Infrastructure.EfCore.Entities:

PlanEntity

PlanFeatureEntity

TenantSubscriptionEntity

TenantUsageSnapshotEntity

UsageCounterEntity

اضافه DbSet ها در OnesignDbContext.

Task B5-2 – EF Configurations

Plan:

unique index روی Code

PlanFeature:

index روی PlanId

TenantSubscription:

unique index روی TenantId (یک subscription فعال در هر زمان)

TenantUsageSnapshot:

index روی TenantId, CapturedAt

UsageCounter:

unique index (TenantId, MetricType, PeriodYear, PeriodMonth)

Task B5-3 – Migration Phase 5

ساخت جداول billing

seeding اولیه Plan ها (Free, Pro, Enterprise) به صورت optional (یا JSON seeding)

mapping هیچ داده‌ی قبلی ضروری نیست، ولی می‌توان:

برای tenant های موجود:

assign Plan = Free و SubscriptionStatus = Trial یا Active بر اساس تصمیم تو.

4.2 Services

Task B5-4 – پیاده سازی IPlanService

CRUD برای Plan و PlanFeature

متد:

GetPlanForTenantAsync(tenantId) → بر اساس TenantSubscription

Task B5-5 – پیاده سازی ISubscriptionService

ایجاد و تغییر subscription:

AssignSubscriptionToTenantAsync

ChangeTenantPlanAsync

MarkStatusAsync

مدیریت TrialEnd و CurrentPeriodEndsAt (فقط set/update، نه billing real)

Task B5-6 – پیاده سازی IUsageService

RecordUsageEventAsync(tenantId, metricType)

update UsageCounter

RecalculateSnapshotForTenantAsync(tenantId)

شمارش:

TenantUser count از Identity module

Application count از Applications module

Idp count از Federation module

LoginsThisMonth از UsageCounter

ScimCallsThisMonth از UsageCounter

Task B5-7 – پیاده سازی IQuotaEnforcementService

متدها:

CheckCanCreateUserAsync(tenantId)

CheckCanCreateApplicationAsync(tenantId)

CheckCanCreateIdpAsync(tenantId)

CheckFeatureEnabledAsync(tenantId, featureKey)

استفاده:

قبل از عملیات create در Identity, Applications, Federation

رفتار:

plan features را خوانده و compare با current usage

پرتاب business exception با code مناسب اگر Hard limit رد شده است.

4.3 Application Layer

Task B5-8 – Commands / Queries Plan

GetPlansQuery

GetPlanDetailsQuery

CreateOrUpdatePlanCommand

ActivatePlanCommand

DeactivatePlanCommand

Task B5-9 – Commands / Queries Subscription

GetTenantSubscriptionQuery

AssignSubscriptionToTenantCommand

ChangeTenantPlanCommand

MarkSubscriptionStatusCommand

Task B5-10 – Usage Queries

GetTenantUsageSummaryQuery

GetTenantUsageDetailsQuery

GetOverQuotaTenantsQuery

RecalculateTenantUsageCommand

Task B5-11 – Usage Recording

RecordUsageEventCommand (برای استفاده توسط ماژول‌های دیگر یا event handlers)

4.4 API Endpoints – Global Billing

Base: /api/global/billing

Task B5-12 – Plan API

GET /api/global/billing/plans

GET /api/global/billing/plans/{id}

POST /api/global/billing/plans

PUT /api/global/billing/plans/{id}

DELETE /api/global/billing/plans/{id} (اگر استفاده نشده)

Task B5-13 – Tenant Subscription API (Global scope)

GET /api/global/billing/tenants/{tenantId}/subscription

POST /api/global/billing/tenants/{tenantId}/subscription

POST /api/global/billing/tenants/{tenantId}/status (MarkSubscriptionStatus)

Task B5-14 – Tenant Billing Overview API (Global)

GET /api/global/billing/tenants → لیست tenantها با Plan و usage summary

4.5 API Endpoints – Tenant Billing

Base: /api/tenant/billing

Task B5-15 – Tenant Billing Overview

GET /api/tenant/billing/summary

برگرداندن:

Plan info

UsageSummary

QuotaStatus

Task B5-16 – Tenant Quota Status

GET /api/tenant/billing/quota-status

TenantQuotaStatusDto

Task B5-17 – Upgrade Request

POST /api/tenant/billing/upgrade-requests

ثبت درخواست upgrade در DB یا ارسال رویداد

4.6 Integration Hooks

Task B5-18 – Hook در Identity / Applications / Federation

در:

ایجاد TenantUser → call CheckCanCreateUserAsync و RecordUsageEventAsync(metric: UsersCreated?) (رکورد exact user count از snapshot می‌آید)

ایجاد ApplicationClient → CheckCanCreateApplicationAsync

ایجاد IdP (SAML/OIDC) → CheckCanCreateIdpAsync

در login موفق:

RecordUsageEventAsync(metricType: Logins)

Task B5-19 – Scheduled Snapshot Job

یک job (مثلاً HostedService یا scheduled command) که روزانه:

برای تمام tenants:

RecalculateSnapshotForTenantAsync

5. Dev Tasks – Frontend (Admin Portal)
5.1 – Global Billing Admin UI

Task F5-1 – صفحه /global/billing/plans

لیست Plan ها

فرم ایجاد/ویرایش:

name, code, type, active

لیست Features:

key dropdown:

"MaxUsers", "MaxApps", "MaxIdps", "OrgHierarchyEnabled", "AdvancedSecurityEnabled", "FederationEnabled", "ScimEnabled"

value

limitType برای limitها

i18n برای تمام labels

Task F5-2 – صفحه /global/billing/tenants

جدول:

TenantName

PlanName

Status

UserCount/MaxUsers

LoginsThisMonth

Badges:

OverLimit, NearLimit

امکان:

انتخاب tenant → ویرایش subscription (choose plan, change status)

5.2 – Tenant Billing UI

Task F5-3 – صفحه /tenant/billing

نمایش:

Plan:

name, type

TrialEndsAt, CurrentPeriodEndsAt

Usage Cards:

Users: UserCount / MaxUsers

Applications: AppCount / MaxApps

IdPs: IdpCount / MaxIdps

LoginsThisMonth (با limit اگر وجود دارد)

اگر near limit:

banner warning

دکمه "Request Upgrade":

Modal:

انتخاب TargetPlan (Pro, Enterprise)

توضیح optional

call POST /api/tenant/billing/upgrade-requests

6. Cross-cutting Tasks

Task X5-1 – Audit

AuditEvent برای:

ایجاد/ویرایش/حذف Plan

تغییر Subscription برای Tenant

تغییر Status (Suspended, Canceled, ...)

Generate snapshot یا حداقل تغییر plan

Task X5-2 – Unit Tests

تست برای IQuotaEnforcementService:

tenant زیر limit → اجازه

tenant روی hard limit → block

soft limit → فقط warning flag

تست IUsageService:

RecordUsageEvent و snapshot

Task X5-3 – Performance & Safety

UsageCounter update:

atomic increment

Snapshot:

queries efficient (index روی TenantId)

آماده بودن برای scale:

امکان Archive snapshots قدیمی (آینده)

7. نکات طراحی Phase 5

Plan و Subscription را ساده ولی واقعی نگه دار، نه ERP مالی.

Quota enforcement را از روز اول وسط code پخش نکن؛ همه جا فقط از IQuotaEnforcementService استفاده کن.

Usage snapshot را دقیقاً تا حدی نگه دار که برای billing و RFP کافی باشد، نه دیتاویئرهاوس.

اگر در این فاز Billing را نصفه و الکی پیاده کنی، تمام فازهای قبلی از دید بیزنس زمین‌خورده محسوب می‌شوند.