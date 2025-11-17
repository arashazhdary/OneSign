# onesign – Phase 11 Notification Center & Communication Platform

## 1. محدوده Phase 11

### 1.1 هدف کلی

Phase 11 تمرکز دارد روی ساخت یک **Notification Platform جدی** که همه‌ی ماژول‌ها (Security, AccountCenter, Governance, DevPortal, Billing) بتوانند:

- رویداد تولید کنند
- براساس:
  - تنظیمات tenant
  - ترجیحات user
  - channelهای مجاز (Email/SMS/InApp/Webhook)
- نوتیفیکیشن قابل اعتماد، قابل لاگ و قابل audit ارسال کنند.

بدون این فاز، همه‌ی حرف‌هایی که قبلاً درباره:

- "ارسال هشدار امنیتی"
- "اعلان SoD Violations"
- "Notify Developer when webhook fails"
- "Security alert برای login جدید"

زدیم، دروغ عملی است.

### 1.2 personas

- **Tenant Admin / Security Officer**
  - می‌خواهد:
    - تعیین کند برای کدام رویدادها چه نوتیفیکیشنی برود
    - template و branding و زبان نوتیفیکیشن‌ها را کنترل کند
    - log و status ارسال‌ها را ببیند

- **End User**
  - قبلاً در Phase 9 Notification Preferences گذاشتیم
  - می‌خواهد:
    - بداند چه هشدارهایی به کجا می‌آید
    - بتواند تا حد ممکن opt-in/out کند (در محدوده policy)

- **Global SaaS Owner (خودت)**
  - می‌خواهد:
    - global channel config (SMTP, SMS provider, generic templates)
    - plan-based features (مثلاً SMS notification فقط برای plan خاص)

### 1.3 چه چیزی اضافه می‌شود

برای هر tenant:

- **Notification Center Module**
  - Channel config per tenant:
    - Email (from address, reply-to, branding)
    - SMS (sender id، provider routing)
    - In-App (feed داخلی + toast)
    - Webhook notifications (به غیر از DevPortal وبهوک‌های بیزنسی)
  - Template engine:
    - Template per event type
    - Multi-language
    - Variable binding (user, tenant, app، security context)
  - Routing rules:
    - event type + user preference + tenant policy ⇒ channels

قابلیت‌ها:

- Integration با:
  - Observability (Phase 6) برای log
  - Security (Phase 3) برای security alerts
  - AccountCenter (Phase 9) برای NotificationPreference
  - Governance (Phase 10) برای escalations / campaign reminders
  - Billing (Phase 5) برای plan-based availability

### 1.4 عمداً چه چیزهایی الان نیست

فعلاً نمی‌زنیم:

- Full-blown marketing campaign engine
- Complex sequence flows (drip campaigns)
- Multi-tenant template marketplace

Phase 11 فقط:

- **Notification Platform تراکنشی و security/governance-grade**
- با پایۀ قوی برای فازهای بعدی (workflow و campaignها)

---

## 2. معماری و ماژول‌ها

### 2.1 ماژول جدید: NotificationCenter

ماژول مستقل:

- `Onesign.Modules.NotificationCenter`

ساختار:

```text
Onesign.Modules.NotificationCenter/
  Domain/
    Entities/
      NotificationTemplate.cs
      NotificationChannelConfig.cs
      NotificationEventSubscription.cs
      NotificationOutboxItem.cs
      NotificationDeliveryLog.cs
    Enums/
      NotificationChannel.cs      // Email, Sms, InApp, Webhook
      NotificationStatus.cs       // Pending, Sending, Sent, Failed, Cancelled
      NotificationPriority.cs     // Low, Normal, High, Critical
    ValueObjects/
      TemplateLocalization.cs     // language-specific body/subject
      RecipientInfo.cs
    Services/
      INotificationTemplateService.cs
      INotificationRouter.cs
      INotificationOutboxService.cs
      INotificationSenderService.cs
      IChannelEmailSender.cs
      IChannelSmsSender.cs
      IChannelInAppSender.cs
      IChannelWebhookSender.cs
    Repositories/
      INotificationTemplateRepository.cs
      INotificationChannelConfigRepository.cs
      INotificationEventSubscriptionRepository.cs
      INotificationOutboxRepository.cs
      INotificationDeliveryLogRepository.cs
  Application/
    DTOs/
      NotificationTemplateDto.cs
      CreateNotificationTemplateRequest.cs
      UpdateNotificationTemplateRequest.cs
      NotificationChannelConfigDto.cs
      UpdateNotificationChannelConfigRequest.cs
      NotificationEventSubscriptionDto.cs
      UpdateNotificationEventSubscriptionRequest.cs
      NotificationDeliveryLogDto.cs
    Commands/
      CreateNotificationTemplateCommand.cs
      UpdateNotificationTemplateCommand.cs
      DeleteNotificationTemplateCommand.cs
      UpdateNotificationChannelConfigCommand.cs
      UpdateNotificationEventSubscriptionCommand.cs
      EnqueueNotificationCommand.cs
      RetryNotificationCommand.cs
      CancelNotificationCommand.cs
    Queries/
      GetNotificationTemplatesQuery.cs
      GetNotificationTemplateDetailsQuery.cs
      GetNotificationChannelConfigQuery.cs
      GetNotificationEventSubscriptionsQuery.cs
      GetNotificationDeliveryLogsQuery.cs
  Infrastructure/
    EfCore/Entities/
      NotificationTemplateEntity.cs
      NotificationChannelConfigEntity.cs
      NotificationEventSubscriptionEntity.cs
      NotificationOutboxItemEntity.cs
      NotificationDeliveryLogEntity.cs
    EfCore/Configurations/
      NotificationTemplateEntityTypeConfiguration.cs
      NotificationChannelConfigEntityTypeConfiguration.cs
      NotificationEventSubscriptionEntityTypeConfiguration.cs
      NotificationOutboxItemEntityTypeConfiguration.cs
      NotificationDeliveryLogEntityTypeConfiguration.cs
    EfCore/Repositories/
      NotificationTemplateRepository.cs
      NotificationChannelConfigRepository.cs
      NotificationEventSubscriptionRepository.cs
      NotificationOutboxRepository.cs
      NotificationDeliveryLogRepository.cs


2.2 مدل NotificationTemplate
public class NotificationTemplate
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }        // Guid.Empty برای global default
    public string EventType { get; private set; }     // e.g. "Security.NewLogin", "Account.PasswordChanged"

    public bool IsEnabled { get; private set; }

    public ICollection<TemplateLocalization> Localizations { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
}

public class TemplateLocalization
{
    public string Language { get; private set; }        // "en", "fa"
    public string Subject { get; private set; }         // برای Email
    public string BodyHtml { get; private set; }
    public string BodyText { get; private set; }        // optional
}

2.3 مدل NotificationChannelConfig
public class NotificationChannelConfig
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }

    public bool EmailEnabled { get; private set; }
    public string EmailFromAddress { get; private set; }
    public string EmailFromName { get; private set; }

    public bool SmsEnabled { get; private set; }
    public string SmsSenderId { get; private set; }

    public bool InAppEnabled { get; private set; }

    public bool WebhookEnabled { get; private set; }  // global per tenant (not DevPortal webhooks)

    public DateTime UpdatedAt { get; private set; }
}

2.4 Outbox و Delivery Log
public class NotificationOutboxItem
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }

    public string EventType { get; private set; }
    public NotificationChannel Channel { get; private set; }

    public string RecipientAddress { get; private set; }   // email/phone/userId/webhook url based on channel
    public string RecipientDisplayName { get; private set; }

    public string Language { get; private set; }

    public string PayloadJson { get; private set; }        // rendered payload, subject/body or structured for InApp

    public NotificationStatus Status { get; private set; }
    public NotificationPriority Priority { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? SentAt { get; private set; }
    public DateTime? FailedAt { get; private set; }
    public int RetryCount { get; private set; }
}

public class NotificationDeliveryLog
{
    public Guid Id { get; private set; }

    public Guid OutboxItemId { get; private set; }
    public Guid TenantId { get; private set; }

    public NotificationChannel Channel { get; private set; }
    public NotificationStatus Status { get; private set; }

    public string ProviderResponseCode { get; private set; }
    public string ProviderResponseMessage { get; private set; }

    public DateTime Timestamp { get; private set; }
}

3. Epics و User Storyها – Phase 11
Epic 1 – Core Notification Model & Outbox
US 1.1 – Outbox-based Delivery

به عنوان سیستم
می‌خواهم همه‌ی نوتیفیکیشن‌ها ابتدا وارد Outbox شوند
تا ارسال‌ها قابل retry و audit باشند.

Acceptance:

هیچ ماژولی مستقیم SMTP/SMS call نمی‌کند.

همه از INotificationRouter/INotificationOutboxService استفاده می‌کنند.

هر نوتیفیکیشن:

یک NotificationOutboxItem با Status = Pending ایجاد می‌کند.

worker/پردازش background مسئول ارسال است.

Epic 2 – Template & Multi-Language
US 2.1 – Template per EventType & Language

به عنوان Tenant Admin
می‌خواهم برای هر رویداد مهم، متن‌های Email/SMS را customize کنم
تا پیام مطابق فرهنگ و برند سازمانم باشد.

Acceptance:

بتواند برای EventTypeها مثل:

Security.NewLogin

Security.PasswordChanged

Security.MfaChanged

Account.TrustedDevice.New

Governance.AccessReview.Assigned

Governance.SoD.ViolationCreated

template تعریف کند.

API:

GET /api/tenant/notification/templates

GET /api/tenant/notification/templates/{id}

POST /api/tenant/notification/templates

PUT /api/tenant/notification/templates/{id}

DELETE /api/tenant/notification/templates/{id}

TemplateLocalization:

حداقل "en" و "fa" را پشتیبانی کند.

Epic 3 – Event Routing & User Preferences
US 3.1 – Map EventType → Channels بر اساس Tenant Policy

به عنوان Tenant Admin
می‌خواهم مشخص کنم برای هر EventType از کدام channelها استفاده شود
تا بتوانم بین email، sms و in-app تعادل بسازم.

Acceptance:

NotificationEventSubscription:

TenantId

EventType

DefaultChannels (Email, Sms, InApp)

OverrideUserPreference (bool) برای eventهای critical

API:

GET /api/tenant/notification/events

PUT /api/tenant/notification/events/{eventType}

US 3.2 – Respect Notification Preferences از Phase 9

به عنوان End User
می‌خواهم تنظیماتم در Phase 9 تعیین کند چه اعلان‌هایی روی کدام channel بیاید
تا کنترل منطقی روی نوتیفیکیشن‌ها داشته باشم.

Acceptance:

NotificationRouter:

داده‌های زیر را ترکیب می‌کند:

Tenant NotificationEventSubscription

User NotificationPreference (Phase 9)

روی EventTypeهایی که OverrideUserPreference=false است:

intersection بین tenant default و user preference انتخاب می‌شود.

روی EventTypeهایی که OverrideUserPreference=true است:

tenant می‌تواند enforce کند (مثلاً login security alerts همیشه email بیاید).

Epic 4 – Delivery & Retry
US 4.1 – Background Sender

به عنوان سیستم
می‌خواهم ارسال نوتیفیکیشن‌ها توسط worker انجام شود
تا کارهای HTTP هم‌زمان کند نشوند.

Acceptance:

سرویس background:

INotificationSenderService:

ProcessPendingAsync():

برداشتن N تا Pending با priority بالا

call channel sender مناسب

update status + DeliveryLog

exponential backoff روی failureها

Retry policy:

مثلاً حداکثر ۵ بار، با backoff.

Status:

Pending → Sending → Sent یا Failed

Epic 5 – Admin Logging & Monitoring
US 5.1 – Tenant Notification Log

به عنوان Tenant Admin
می‌خواهم log ارسال نوتیفیکیشن‌های حساب tenancy خودم را ببینم
تا بتوانم مشکلات را debug یا audit کنم.

Acceptance:

صفحه‌ی Log:

filter:

EventType

Channel

Status

User (recipient)

Date range

API:

GET /api/tenant/notification/logs

هر log entry:

EventType

Channel

Recipient (masked در صورت نیاز)

Status

ProviderResponseCode/Message

Timestamp

Epic 6 – Global Config & Provider Integration
US 6.1 – Global Email/SMS Provider Config

به عنوان SaaS Owner
می‌خواهم global provider config را تنظیم کنم
تا tenantها بتوانند یا از default config، یا از config اختصاصی خودشان استفاده کنند.

Acceptance:

Global config (مثلاً در config/secret، ولی حداقل abstractionش در کد):

SMTP provider(s)

SMS provider(s)

NotificationChannelConfig per tenant:

امکان override کردن:

FromName/Address

SmsSenderId

ولی providerهای اصلی از global خوانده شوند (یا multi-provider support).

4. Dev Tasks – Backend
4.1 Database & Entities

Task B11-1 – تعریف Entities و DbSetها

اضافه Entities:

NotificationTemplateEntity

NotificationChannelConfigEntity

NotificationEventSubscriptionEntity

NotificationOutboxItemEntity

NotificationDeliveryLogEntity

اضافه DbSetها در DbContext.

Task B11-2 – EF Configurations و Indexها

NotificationTemplate:

unique index روی (TenantId, EventType)

NotificationEventSubscription:

unique index روی (TenantId, EventType)

NotificationOutboxItem:

index روی (TenantId, Status, Priority, CreatedAt)

NotificationDeliveryLog:

index روی (TenantId, Channel, Status, Timestamp)

Task B11-3 – Migration Phase 11

ایجاد جداول NotificationCenter بدون دستکاری destructive روی جداول قبلی.

4.2 Services

Task B11-4 – INotificationTemplateService

متدها:

GetTemplatesAsync(tenantId)

GetTemplateAsync(tenantId, templateId)

CreateTemplateAsync(tenantId, CreateNotificationTemplateRequest)

UpdateTemplateAsync(tenantId, templateId, UpdateNotificationTemplateRequest)

DeleteTemplateAsync(tenantId, templateId)

رفتار:

اگر برای یک EventType در tenant template نباشد، از global default استفاده شود.

Task B11-5 – INotificationRouter

متد:

RouteAsync(NotificationEventContext context)

context شامل:

TenantId

EventType

Recipients (list of user ids/email/phone)

Payload (contextual data: ip, location, app info, etc)

رفتار:

گرفتن tenant NotificationEventSubscription

گرفتن user NotificationPreferences (Phase 9)

decide channels per recipient

resolve language (از UserProfile PreferredLanguage یا tenant default)

resolve template (tenant یا global) + render

برای هر recipient+channel یک NotificationOutboxItem بسازد.

Task B11-6 – INotificationOutboxService

متد:

EnqueueAsync(NotificationOutboxItem item)

GetPendingBatchAsync(int batchSize, NotificationPriority minPriority)

UpdateStatusAsync(itemId, status, providerResponse, retryCount, timestamps...)

Task B11-7 – INotificationSenderService و Channel Senders

INotificationSenderService:

ProcessPendingAsync():

batch گرفتن

بر اساس Channel:

IChannelEmailSender.SendAsync

IChannelSmsSender.SendAsync

IChannelInAppSender.SendAsync

IChannelWebhookSender.SendAsync

update OutboxItem + Insert NotificationDeliveryLog

Channel ارسال‌ها:

Email:

استفاده از SMTP client abstraction (نه sys-specific)

SMS:

interface که بعداً provider-specific پیاده می‌شود (placeholder ولی functional)

InApp:

ذخیره نوتیفیکیشن در جدول/ماژول InApp (در این فاز می‌توانی از NotificationDeliveryLog + endpoint read-only استفاده کنی)

Webhook:

call به endpoint با امضای ساده (HMAC)
(این non-DevPortal event webhooks است، برای usecaseهای عمومی)

4.3 API Endpoints – Tenant Notification config/log

Base: /api/tenant/notification

Task B11-8 – Template API

GET /api/tenant/notification/templates

GET /api/tenant/notification/templates/{id}

POST /api/tenant/notification/templates

PUT /api/tenant/notification/templates/{id}

DELETE /api/tenant/notification/templates/{id}

Task B11-9 – ChannelConfig API

GET /api/tenant/notification/channels

برگرداندن NotificationChannelConfigDto

PUT /api/tenant/notification/channels

UpdateNotificationChannelConfigRequest

Task B11-10 – Event Subscription API

GET /api/tenant/notification/events

لیست EventTypeهای شناخته شده + تنظیمات فعلی tenant.

PUT /api/tenant/notification/events/{eventType}

UpdateNotificationEventSubscriptionRequest:

DefaultChannels

OverrideUserPreference

Task B11-11 – Logs API

GET /api/tenant/notification/logs

فیلتر:

EventType

Channel

Status

Recipient (string search)

Date range

برگرداندن NotificationDeliveryLogDto (با masking مناسب برای email/phone).

4.4 Integration with existing modules

Task B11-12 – Security Module Integration (Phase 3)

برای EventTypeهای زیر از NotificationRouter استفاده شود:

Security.NewLogin

Security.NewDeviceTrusted

Security.PasswordChanged

Security.MfaChanged

Security.SuspiciousLoginDetected (اگر logic داری)

در لحظه‌ی event:

NotificationEventContext بساز و INotificationRouter.RouteAsync را صدا بزن.

Task B11-13 – AccountCenter Integration (Phase 9)

هنگام:

Password change

MFA change

RecoveryOptions change

علاوه بر audit، event مربوطه را به NotificationRouter بفرست.

Task B11-14 – Governance Integration (Phase 10)

برای events:

Governance.AccessReview.Assigned → به Reviewer ایمیل/نوتیف

Governance.AccessReview.DueSoon → reminder نزدیک due date

Governance.SoD.ViolationCreated → به SecurityOfficer

Governance.SoD.ViolationResolved → notification summarizing resolution

Task B11-15 – DevPortal & Billing Integration (Phase 5 & 8)

DevPortal:

DevPortal.ApiKey.Created (optional)

DevPortal.Webhook.Failed multiple times → notification for developer/app owner

Billing:

Billing.Subscription.QuotaNearLimit

Billing.Subscription.PlanWillExpire

(لازم نیست همه را هم‌زمان implement کنی، ولی interface NotificationRouter باید آمادۀ این overwhelm باشد.)

Task B11-16 – Observability Integration (Phase 6)

هر بار نوتیفیکیشن ایجاد یا ارسال می‌شود، علاوه بر DeliveryLog:

Audit/Observability event:

"Notification.Enqueued"

"Notification.Sent"

"Notification.Failed"

5. Dev Tasks – Frontend (Tenant Notification UI)

در Tenant Admin Portal:

5.1 – Notification Settings Navigation

Task F11-1 – اضافه کردن بخش Notification

در navigation:

Settings

Notification Settings

Notification Templates

Notification Logs

5.2 – Templates UI

Task F11-2 – Templates List Page

/tenant/settings/notification/templates

جدول:

EventType

TenantOverride? (yes/no)

IsEnabled

actions:

Create Template (برای event جدید)

Edit (برای ویرایش localizationها)

Delete (برای حذف override و برگشت به global default)

Task F11-3 – Template Editor

صفحه/Modal:

انتخاب EventType (dropdown از لیست eventها)

per-language tabs:

Subject

BodyHtml (Editor)

BodyText (optional)

پیش‌نمایش (preview) بر اساس sample payload.

5.3 – Channels & Events UI

Task F11-4 – Channel Config Page

/tenant/settings/notification/channels

فرم:

EmailEnabled (toggle)

EmailFromName

EmailFromAddress

SmsEnabled

SmsSenderId

InAppEnabled

WebhookEnabled

نمایش warning اگر plan فعلی tenant اجازه channel خاصی را نمی‌دهد (integration با Billing).

Task F11-5 – Event Routing Page

/tenant/settings/notification/events

جدول:

EventType

Description (localized)

DefaultChannels (checkbox Email/SMS/InApp)

OverrideUserPreference (toggle)

call:

GET/PUT EventSubscription API

5.4 – Logs UI

Task F11-6 – Notification Logs Page

/tenant/settings/notification/logs

فیلترها:

EventType (dropdown)

Channel (Email/SMS/InApp/Webhook)

Status (Sent/Failed)

Recipient (input)

Date range picker

جدول:

Time

EventType

Channel

Recipient (masked)

Status

ProviderResponseCode (short)

جزئیات (drawer/modal):

Payload خلاصه

full provider response (اگر safe است)

6. Cross-cutting Tasks

Task X11-1 – Localization

تمام UI متن‌ها در بخش Notification دو زبانه.

EventType descriptions باید از i18n یا metadata مرکزی event registry بیاید.

Task X11-2 – Security & Privacy

Masking:

در logs UI:

email → u***@domain.com

phone → +98******1234

Tenant isolation:

هیچ tenantی نوتیفیکیشن‌های tenant دیگر را نمی‌بیند.

Task X11-3 – Performance & Reliability

Outbox queries:

use paging و indexها

Sender:

حتماً idempotent رفتار کند (اگر یک OutboxItem دوبار picked شد، duplicate ارسال نشود).

Failure handling:

خطاهای transient (timeout، provider 5xx) → retry

خطاهای permanent (invalid address) → fail بدون retry.

Task X11-4 – Developer Experience

INotificationRouter باید interface تمیز داشته باشد که سایر ماژول‌ها راحت از آن استفاده کنند:

بدون وابستگی به EF یا infrastructure

فقط با context ساده و strongly-typed payload.

7. نکات طراحی Phase 11

بدون Notification Center، Security/Account/Governance نصفه‌کاره‌اند و توی real enterprise پروژه‌ات ضعیف حساب می‌شود.

اشتباه کلاسیک:

ماژول‌ها مستقیم SmtpClient.Send بزنند، بدون outbox, retry, log.
این را کلاً ممنوع کن.

این فاز foundation یک "Communication Layer" است؛
اگر خوب طراحی شود، بعداً روی همین:

workflow notification

approval flows

even marketing / engagement
سوار می‌کنی.
