# onesign – Phase 6 Observability, Audit Center & Compliance

## 1. محدوده Phase 6

### 1.1 هدف کلی

Phase 6 تمرکزش این است که onesign را برای **عملیات جدی در محیط Enterprise** قابل استفاده کند:

- System Log / Audit Center در سطح tenant و global
- Security & Login Analytics (نمودارها و reportهای امنیتی)
- Alerting ساده (روی eventها و thresholdها)
- External Log Streaming (به SIEM / webhook / log sink)
- ابزارهای Support / Incident Handling (جستجو، session termination، investigation)

بدون این فاز، اگر SOC / Security Team مشتری جلو تو بنشینند و بپرسند:

- «کجا بفهمیم کی، از کجا، چی کار کرده؟»
- «چطور alert می‌گیری که یه جای کار خراب شده؟»
- «چطور لاگ را ببریم تو SIEM خودمان؟»

جوابت الان عملاً خالی است.

### 1.2 چه چیزهایی اضافه می‌شود

برای هر tenant:

- **Activity / Audit Log کامل:**
  - Login موفق / ناموفق
  - MFA events
  - Token issued / revoked
  - Policy changes (Security, Federation, Billing)
  - User / Role / OrgUnit changes
  - Federation و SCIM operations
- **Security & Usage Analytics:**
  - Login trends
  - MFA adoption
  - Risk events (Phase 3)
  - Federation / SCIM usage
- **Alerting:**
  - Ruleهای ساده مثل:
    - تعداد login fail متوالی از یک IP
    - افزایش ناگهانی RiskEvent با سطح High
    - افت MFA usage
- **External Streaming:**
  - تنظیم مقصد برای ارسال AuditEvents (مثلاً Webhook / Syslog gateway)
- **Support Tools:**
  - جستجوی کامل log برای یک user
  - نمایش active sessions
  - Force logout برای user / tenant

برای SaaS Owner (Global Admin):

- **Operations Center:**
  - System Log cross-tenant (با فیلتر روی tenant)
  - نمودارهای کلان:
    - Login volume per tenant
    - Error / failure rates
    - High risk events
  - لیست tenants با وضعیت بد (خطا زیاد، risk بالا)

### 1.3 چه چیزهایی عمداً در Phase 6 نیست

چیزهایی که فعلاً نمی‌زنیم:

- Integration آماده out-of-the-box با Splunk / Datadog / Elastic (پلاگین اختصاصی)
- Alerting engine خیلی پیچیده با ruleهای time-window پیچیده
- Full-blown BI / reporting platform

Phase 6 فقط:

- **Audit و Observability جدی و قابل استفاده برای Security/Operations**
- پایه‌ای برای SIEM/Alerting پیچیده در آینده.

---

## 2. معماری و ماژول‌ها

### 2.1 ماژول Observability

اضافه کن:

- `Onesign.Modules.Observability`

این ماژول روی داده‌های زیر سوار می‌شود:

- AuditEvents (از قبل در سیستم، اما الان formal می‌شود)
- RiskEvents (از Phase 3)
- UsageSnapshots / UsageCounters (از Phase 5)
- Security / Federation / Identity events

ساختار:

```text
Onesign.Modules.Observability/
  Domain/
    Entities/
      AuditEvent.cs
      AuditEventIndex.cs      // view/denormalized برای سرچ سریع
      AlertRule.cs
      AlertChannel.cs
      AlertNotification.cs
      LogStreamSubscription.cs
      SavedFilter.cs
    Enums/
      AuditCategory.cs        // Auth, Security, UserManagement, Billing, Federation, Scim, ...
      AuditSeverity.cs        // Info, Warning, Error, Critical
      AlertRuleType.cs        // Threshold, EventPattern
      AlertChannelType.cs     // Email, Webhook
      LogStreamType.cs        // Webhook, SyslogHttpGateway
    Services/
      IAuditWriter.cs
      IAuditQueryService.cs
      IAlertEvaluationService.cs
      ILogStreamingService.cs
    Repositories/
      IAuditEventRepository.cs
      IAlertRuleRepository.cs
      IAlertChannelRepository.cs
      IAlertNotificationRepository.cs
      ILogS


نکته: اگر قبل از این یک Audit module ساده داشتی، در Phase 6 باید migrate/merge شود به این ماژول.

2.2 مدل AuditEvent

یک مدل جدی، نه لاگ نصفه:

public class AuditEvent
{
    public Guid Id { get; private set; }

    public Guid? TenantId { get; private set; }          // null برای eventهای global
    public string CorrelationId { get; private set; }    // برای ردیابی request
    public AuditCategory Category { get; private set; }
    public AuditSeverity Severity { get; private set; }

    public string ActorId { get; private set; }          // user id / system
    public string ActorDisplayName { get; private set; }
    public string ActorType { get; private set; }        // User, Service, System

    public string Action { get; private set; }           // "User.Login", "Mfa.Verify", "Tenant.SecurityPolicy.Updated", ...
    public string TargetType { get; private set; }       // "User", "Tenant", "Application", ...
    public string TargetId { get; private set; }

    public string IpAddress { get; private set; }
    public string UserAgent { get; private set; }
    public string Country { get; private set; }

    public DateTime OccurredAt { get; private set; }

    public string DataJson { get; private set; }         // payload خلاصه
}


این ستون‌ها باید index مناسب داشته باشند برای سرچ سریع.

3. Epics و User Storyها – Phase 6
Epic 1 – Unified Audit Log per Tenant (Activity Center)
US 1.1 – مشاهده Activity Log در سطح tenant

به عنوان Tenant Admin
می‌خواهم تمام activityهای مهم tenant خودم را ببینم
تا بتوانم رفتار سیستم و کاربران را بررسی کنم.

Acceptance:

صفحه "Activity / Audit Log" در Admin Portal → scope tenant

فیلترها:

Date range

Category (Auth, Security, UserManagement, Federation, Scim, Billing, ...)

Severity

Actor (user/email)

IP / Country

Action

endpoint:

POST /api/tenant/observability/audit/search

ورودی: AuditSearchFilterDto

خروجی: AuditSearchResultDto (paging)

US 1.2 – مشاهده جزئیات یک AuditEvent

به عنوان Tenant Admin
می‌خواهم بتوانم جزئیات یک event را ببینم
تا بفهمم دقیقاً چه چیزی تغییر کرده یا اتفاق افتاده است.

Acceptance:

کلیک روی row → modal/details

endpoint:

GET /api/tenant/observability/audit/{id}

Epic 2 – Global System Log & Operations Center
US 2.1 – System Log cross-tenant

به عنوان SaaS Owner / Global Admin
می‌خواهم تمام audit logهای سیستم را cross-tenant ببینم
تا بتوانم incidentها را در سطح کل SaaS بررسی کنم.

Acceptance:

صفحه /global/observability/audit

فیلترهای اضافه:

Tenant

endpoint:

POST /api/global/observability/audit/search

GET /api/global/observability/audit/{id}

US 2.2 – Dashboard کلی Observability

به عنوان SaaS Owner
می‌خواهم یک dashboard خلاصه داشته باشم
تا بتوانم وضعیت کلی امنیت/عملکرد را در چند ثانیه ببینم.

Acceptance:

نمودارها:

login count per day per tenant (top N)

failure-rate per tenant

تعداد RiskEventهای High در ۲۴ ساعت اخیر

تعداد SCIM operations per tenant

endpoint:

GET /api/global/observability/overview

Epic 3 – Alerting Rules & Notifications
US 3.1 – تعریف AlertRule per tenant

به عنوان Tenant Admin
می‌خواهم rule تعریف کنم که در صورت رخ دادن eventهای خاص به من خبر بدهد
تا مجبور نباشم ۲۴ ساعته داشبورد را نگاه کنم.

Acceptance:

مثال ruleها:

بیش از N login fail در ۱۰ دقیقه از یک IP

RiskEvent با Level = High بیش از M در ۱ ساعت

مدل AlertRule ساده:

public class AlertRule
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string Name { get; private set; }

    public AlertRuleType Type { get; private set; }        // Threshold
    public string MetricKey { get; private set; }          // e.g. "Auth.LoginFailed", "Security.RiskEvent.High"
    public int Threshold { get; private set; }
    public TimeSpan Window { get; private set; }           // 5 minutes, 1 hour
    public bool Enabled { get; private set; }
}


endpoint:

GET /api/tenant/observability/alerts/rules

POST /api/tenant/observability/alerts/rules

PUT /api/tenant/observability/alerts/rules/{id}

DELETE /api/tenant/observability/alerts/rules/{id}

US 3.2 – تعریف AlertChannel

به عنوان Tenant Admin
می‌خواهم مشخص کنم alertها به کجا بروند
تا تیم من آن‌ها را ببیند.

Acceptance:

Channel ها:

Email (simple)

Webhook (JSON payload)

endpoint:

GET /api/tenant/observability/alerts/channels

POST /api/tenant/observability/alerts/channels

PUT /api/tenant/observability/alerts/channels/{id}

DELETE /api/tenant/observability/alerts/channels/{id}

US 3.3 – مشاهده Alert Notifications

به عنوان Tenant Admin
می‌خواهم alertهای رخ‌داده را ببینم
تا بتوانم incident ها را track کنم.

Acceptance:

صفحه /tenant/observability/alerts

endpoint:

GET /api/tenant/observability/alerts/notifications

POST /api/tenant/observability/alerts/notifications/{id}/mark-read

Epic 4 – External Log Streaming
US 4.1 – Log Stream Subscription per tenant

به عنوان Tenant Admin
می‌خواهم audit logها را به SIEM/Log platform خودمان ارسال کنم
تا تمام security events در یک جا جمع شوند.

Acceptance:

LogStreamSubscription:

Type: Webhook, SyslogHttpGateway

TargetUrl

Auth header / token

Filter:

Category, Severity، اینها

endpoint:

GET /api/tenant/observability/log-streams

POST /api/tenant/observability/log-streams

PUT /api/tenant/observability/log-streams/{id}

DELETE /api/tenant/observability/log-streams/{id}

ILogStreamingService:

batch based:

مثلاً هر دقیقه N event را push می‌کند

failure handling:

retry policy ساده

backoff

Epic 5 – Support & Incident Tools
US 5.1 – جستجو براساس User

به عنوان Tenant Admin
می‌خواهم تمام activity های یک user را ببینم
تا اگر مشکلی پیش آمد، trace کنم.

Acceptance:

در صفحه Activity:

فیلتر سریع "By user"

backend:

SearchAuditEventsQuery با filter ActorId / ActorEmail

US 5.2 – مدیریت Sessionهای User

به عنوان Tenant Admin یا Support
می‌خواهم sessionهای فعال یک user را ببینم و kill کنم
تا اگر account compromise شد، همه دسترسی‌ها قطع شود.

Acceptance:

فرض بر وجود session storage (Phase 1)

endpoint:

GET /api/tenant/identity/users/{id}/sessions

DELETE /api/tenant/identity/users/{id}/sessions/{sessionId}

DELETE /api/tenant/identity/users/{id}/sessions (kill all)

UI:

در صفحه User details → tab "Sessions"

US 5.3 – Saved Filters

به عنوان Tenant Admin
می‌خواهم filterهای رایج Audit را ذخیره کنم
تا هر بار مجبور به تنظیم دستی فیلتر نباشم.

Acceptance:

SavedFilter:

Name, FilterJson

endpoint:

GET /api/tenant/observability/audit/saved-filters

POST /api/tenant/observability/audit/saved-filters

PUT /api/tenant/observability/audit/saved-filters/{id}

DELETE /api/tenant/observability/audit/saved-filters/{id}

4. Dev Tasks – Backend
4.1 Database و Entities

Task B6-1 – پیاده سازی AuditEventEntity

جدول AuditEvents:

ستون ها مطابق مدل AuditEvent

Index:

TenantId, OccurredAt DESC

TenantId, Category, OccurredAt

ActorId, OccurredAt

CorrelationId

Task B6-2 – جدول‌های Alert و LogStream

AlertRules

AlertChannels

AlertNotifications

LogStreamSubscriptions

SavedFilters

Task B6-3 – Migration Phase 6

ساخت همه جداول Observability

اگر Audit قبلی داشتی:

Migration برای map/port داده قبلی (یا نگه داشتن جداگانه، ولی target اصلی از این به بعد AuditEvents جدید است)

4.2 Services

Task B6-4 – AuditWriter

Interface: IAuditWriter

متدهایی مثل:

WriteAsync(AuditEvent event)

Helper برای ساخت event از context (tenant, user, request, action)

استفاده در کل سیستم:

Login success/fail

MFA

Token issued/revoked

User/Role changes

SecurityPolicy change

Federation/SCIM operations

BillingPlan/Subscription changes (Phase 5)

Task B6-5 – AuditQueryService

پیاده سازی IAuditQueryService:

SearchAsync(AuditSearchFilterDto filter) با paging

GetByIdAsync(id)

Query بهینه با indexها، بدون فاجعه کارایی.

Task B6-6 – AlertEvaluationService

منطق:

بر اساس AlertRuleها و AuditEvents/UsageCounters:

thresholdها را چک کند

در صورت trigger:

AlertNotification بسازد

IAlertChannelها را فراخوانی کند (Email/Webhook)

متد:

EvaluateForTenantAsync(Guid tenantId, DateTime since)

Task B6-7 – LogStreamingService

وظیفه:

خواندن AuditEvents جدید

grouping per LogStreamSubscription

ارسال batch به مقصد (Webhook/Syslog gateway)

متد:

PushBatchAsync(LogStreamSubscription sub, IReadOnlyCollection<AuditEvent> events)

4.3 Application Layer

Task B6-8 – Commands Audit و Alerts

WriteAuditEventCommand

CreateOrUpdateAlertRuleCommand

EnableAlertRuleCommand

DisableAlertRuleCommand

CreateOrUpdateAlertChannelCommand

CreateOrUpdateLogStreamSubscriptionCommand

CreateOrUpdateSavedFilterCommand

MarkAlertNotificationAsReadCommand

EvaluateAlertsForTenantCommand

PushAuditEventsToLogStreamCommand

Task B6-9 – Queries

SearchAuditEventsQuery

GetAuditEventDetailsQuery

GetAlertRulesQuery

GetAlertChannelsQuery

GetAlertNotificationsQuery

GetLogStreamSubscriptionsQuery

GetSavedFiltersQuery

4.4 API Endpoints

Task B6-10 – Tenant Observability API

Base: /api/tenant/observability

Audit:

POST /api/tenant/observability/audit/search

GET /api/tenant/observability/audit/{id}

GET /api/tenant/observability/audit/saved-filters

POST /api/tenant/observability/audit/saved-filters

PUT /api/tenant/observability/audit/saved-filters/{id}

DELETE /api/tenant/observability/audit/saved-filters/{id}

Alerts:

GET /api/tenant/observability/alerts/rules

POST /api/tenant/observability/alerts/rules

PUT /api/tenant/observability/alerts/rules/{id}

DELETE /api/tenant/observability/alerts/rules/{id}

GET /api/tenant/observability/alerts/channels

POST /api/tenant/observability/alerts/channels

PUT /api/tenant/observability/alerts/channels/{id}

DELETE /api/tenant/observability/alerts/channels/{id}

GET /api/tenant/observability/alerts/notifications

POST /api/tenant/observability/alerts/notifications/{id}/mark-read

Log Streams:

GET /api/tenant/observability/log-streams

POST /api/tenant/observability/log-streams

PUT /api/tenant/observability/log-streams/{id}

DELETE /api/tenant/observability/log-streams/{id}

Task B6-11 – Global Observability API

Base: /api/global/observability

Audit:

POST /api/global/observability/audit/search

GET /api/global/observability/audit/{id}

Overview:

GET /api/global/observability/overview

4.5 Scheduled Jobs

Task B6-12 – Alert Evaluation Job

job دوره‌ای (مثلاً هر ۱ دقیقه / ۵ دقیقه):

برای هر tenant با AlertRule فعال:

EvaluateAlertsForTenantCommand را اجرا کند.

Task B6-13 – Log Streaming Job

job دوره‌ای:

batch از AuditEvents جدید

اجرای PushAuditEventsToLogStreamCommand per subscription

5. Dev Tasks – Frontend (Admin Portal)
5.1 – Tenant Activity / Audit Log

Task F6-1 – صفحه /tenant/observability/audit

جدول:

Time

Category

Severity

Actor

Action

Target

IP / Country

فیلتر:

تاریخ، Category، Severity، Actor، Action

Pagination

دکمه "Save filter" → SavedFilter

Task F6-2 – Modal جزئیات AuditEvent

نمایش DataJson به صورت JSON formatted

نمایش تمام metadata (CorrelationId, UserAgent, ...)

5.2 – Tenant Alerts UI

Task F6-3 – صفحه /tenant/observability/alerts/rules

لیست rules

فرم ایجاد/ویرایش:

Name

MetricKey (dropdown از چند مورد تعریف‌شده)

Threshold

Window

Enabled

Task F6-4 – صفحه /tenant/observability/alerts/channels

لیست چنل ها (Email/Webhook)

فرم:

Type

Target email / URL

Auth header / token

Task F6-5 – صفحه /tenant/observability/alerts

لیست AlertNotificationها:

Time

RuleName

Severity/Level

لینک به Search (مثلاً apply filter برای investigation)

امکان mark-as-read

5.3 – Tenant Log Streams UI

Task F6-6 – صفحه /tenant/observability/log-streams

لیست subscriptions

فرم:

Type

TargetUrl

Filterهای ساده (Category/Severity)

5.4 – Global Operations Console

Task F6-7 – صفحه /global/observability/audit

همان UI Audit، اما با فیلتر Tenant

قابلیت jump به tenant billing/security از همین صفحه

Task F6-8 – صفحه /global/observability/overview

نمودارها:

Login per tenant (bar chart)

Failed login rate

تعداد RiskEvent High per tenant

top tenants با SCIM call زیاد

استفاده از endpoints overview + داده‌های Phase 3 و 5.

6. Cross-cutting Tasks

Task X6-1 – یکپارچه‌سازی Audit در کل سیستم

همه عملیات‌های حیاتی در:

Auth

Security (MFA, Policy)

Federation

SCIM

Billing/Plans/Subscription

Tenant/Org/User/Role management

باید از IAuditWriter استفاده کنند با Category/Action درست.

Task X6-2 – Localization

تمام پیام‌های خطا / labels جدید در API و UI قابل ترجمه (en/fa).

هیچ string خام در React و Controllerها برای text نمایشی.

Task X6-3 – Performance

تست load روی SearchAuditEvents:

pagination درست

indexها جواب می‌دهند

Log Streaming:

batch size مناسب

timeout و retry معقول

Task X6-4 – Security & Privacy

DataJson نباید شامل credential یا secret یا token خام باشد.

LogStreaming نباید secrets را بیرون بدهد.

Access control:

Tenant admin فقط به log tenant خود دسترسی دارد.

Global admin می‌تواند cross-tenant ببیند.

7. نکات طراحی Phase 6

Audit بدون مصرف‌کننده یعنی آشغال.
این فاز دقیقاً مصرف‌کننده را می‌سازد: UI، Alert، Streaming.

هیچ وقت منطق security را وابسته به log نکن؛ log فقط برای visibility و investigation است.

Rule engine را در این فاز ساده نگه دار (Threshold + Window).
اگر این را هم شل پیاده کنی، بعداً هیچ SOC تیمی روی محصولت جدی حساب نمی‌کند.