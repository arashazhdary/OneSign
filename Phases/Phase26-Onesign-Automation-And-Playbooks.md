# onesign – Phase 26: Automation & Playbooks Center

## 1. مقدمه و هدف فاز ۲۶

### 1.1 خلاصه

Phase 26 می‌خواهد onesign را از یک سیستم «monitor & report» تبدیل کند به یک پلتفرم که **واقعاً عمل می‌کند**:

- اگر login مشکوک شد → session را revoke کن، MFA را enforce کن، به SecOps پیام بده.
- اگر کاربر از شرکت خارج شد → accessها را revoke کن، privileges را drop کن، tickets لازم را بساز.
- اگر tenant پرریسک شد → گزارش اختصاصی برای SecurityOfficer بفرست، access review را kick کن.

اسم این فاز: **Automation & Playbooks Center**

بدون این فاز، سیستم تو فقط داد می‌زند: «ببین چه خبر است»  
با این فاز، سیستم می‌گوید: «من خودم جلوی فاجعه را می‌گیرم».

### 1.2 پیش‌نیازها (فازهای قبلی)

این فاز روی این قابلیت‌ها سوار می‌شود:

- Auth / Sign-in events (Phase 1+)
- OrgUnit و Authorization (Phase 2, 7)
- Federation / SCIM / Lifecycle (Phase 4, 15)
- PrivilegedAccess / JIT / BreakGlass (Phase 16)
- AdaptiveSecurity / Risk (Phase 17)
- Extensibility / Webhooks (Phase 18)
- MultiRegion DR (Phase 20)
- Environment & Hybrid (Phase 21)
- Crypto / Privacy / DSR (Phase 22, 23)
- Insights & Reporting (Phase 25)

Phase 26 از **همه‌ی این‌ها رویداد و action** می‌سازد.

---

## 2. Personas و Scope

### 2.1 Tenant Security Officer / Tenant Admin

می‌خواهد:

- بدون کد، playbook بسازد:
  - «اگر HighRiskSignIn از کشور غیرمجاز → session را expire کن + MFA required کن + email به SecurityOfficer».
  - «اگر کاربر سه بار پشت‌سرهم login fail داشت → account را lock کن و ticket بساز».
- پلی‌بوک‌ها را **per tenant** مدیریت و تست کند.

### 2.2 Global Admin / Platform Owner

می‌خواهد:

- یک **گالری template** global از playbookها داشته باشد:
  - Best practice ها: «MFA enforcement playbook»، «High risk sign in response»، «Leaver automation».
- بعضی playbookها را **global enforced** کند (non-optional).

### 2.3 Dev / Integrator (Optional)

می‌خواهد:

- webhook / outbound integration را به SIEM / ticketing / Slack/Teams وصل کند.
- از API، playbook‌ها را manage کند.

---

## 3. Scope فاز ۲۶

### 3.1 In scope

- تعریف مفهوم **Automation Workflow / Playbook**:
  - Trigger (event)
  - Conditions (filters)
  - Actions (internal + external)
- موتور اجرا (Execution Engine) برای:
  - واکنش event driven به events ماژول‌ها
  - اجرای sequence از actions
  - retry, throttling, idempotency
- UI برای:
  - لیست و مدیریت playbookهای tenant
  - گالری templateهای global
  - تست playbook روی sample event
- API برای:
  - CRUD روی playbookها
  - تست‌کردن (dry-run)
- Audit کامل روی executionها

### 3.2 Out of scope

- ساخت full visual BPMN engine (در این فاز نه؛ flowها rule-based و نسبتاً ساده‌اند)
- workflow طولانی human-in-the-loop چندمرحله‌ای (فعلاً فقط reaction chain خودکار)

---

## 4. مفاهیم کلیدی

### 4.1 Event

Eventهایی که می‌توانند Trigger شوند، مثلا:

- Auth:
  - `Auth.SignInSucceeded`
  - `Auth.SignInFailed`
  - `Auth.HighRiskSignInDetected`
- AccessRequests:
  - `AccessRequest.Created`
  - `AccessRequest.Approved`
  - `AccessRequest.Rejected`
- IdentityLifecycle:
  - `Lifecycle.JoinerCreated`
  - `Lifecycle.MoverDetected`
  - `Lifecycle.LeaverDetected`
- PrivilegedAccess:
  - `PrivilegedAccess.JITGranted`
  - `PrivilegedAccess.BreakGlassUsed`
- Governance:
  - `Governance.AccessReviewOverdue`
- Insights (Phase 25):
  - `Insights.TenantRiskScoreHigh`

هر event دارای payload استاندارد است (TenantId, UserId, AppId, Risk, IP, Location, Device, ...).

### 4.2 Condition

شرط روی payload event:

- مثال:
  - `riskScore >= High`
  - `country NOT IN [IR, DE, ...]`
  - `user.MfaEnabled = false`
  - `app.Type = "Privileged"`

می‌توان با DSL ساده (JSON based) یا rule builder این را نگه داشت.

### 4.3 Action

Actionهایی که سیستم انجام می‌دهد:

- Internal actions:
  - `RevokeSessions(userId)`
  - `RequireMfaNextSignIn(userId)`
  - `LockUserAccount(userId)`
  - `DisableAppAccess(userId, appId)`
  - `TriggerAccessReview(appId or orgUnit)`
  - `CreateLifecycleEvent(Leaver)` (اگر لازم کوتاه‌تر)
- Notification actions:
  - `SendEmail(to, template, data)`
  - `SendToChannel(Slack/Teams/Webhook)`
- Extensibility actions:
  - `InvokeWebhook(url, payload)`
  - `PushEventToQueue(topic, message)`

یک playbook می‌تواند یک chain از actions داشته باشد.

---

## 5. معماری و ماژول

### 5.1 ماژول جدید – Onesign.Modules.Automation

تعریف ماژول:

- `Onesign.Modules.Automation`
  - entities:
    - AutomationWorkflow
    - AutomationTrigger
    - AutomationCondition
    - AutomationAction
    - AutomationExecution (logs)
  - services:
    - `IAutomationEngine`
    - `IAutomationRepository`
  - jobs:
    - background worker برای execution queue (اگر async)

### 5.2 Event Bus داخلی

Phase 26 باید از **event bus داخلی** که قبلاً برای Observability/Notifications استفاده شده، consume کند.  
اگر تا این فاز EventBus formal نداری، اینجا حداقل برای internal use اضافه می‌شود.

Event flow:

- ماژول‌های مختلف (Auth, AccessRequests, Lifecycle, ...) → publish domain events  
- Automation module → subscribe → evaluate workflows → enqueue execution  

---

## 6. مدل داده

### 6.1 AutomationWorkflow

```text
AutomationWorkflow
- Id (Guid, PK)
- TenantId (Guid?)              // null برای global templates
- Name (string)
- Description (string?)
- ScopeType (string)            // "Tenant", "Global"
- IsTemplate (bool)             // اگر global template
- IsEnabled (bool)
- Severity (string?)            // "Info", "Warning", "Critical" (اختیاری)
- CreatedAt (DateTimeOffset)
- CreatedByUserId (Guid)
- UpdatedAt (DateTimeOffset?)
- UpdatedByUserId (Guid?)



7. Engine – Execution Flow
7.1 Flow کلی

Event جدید (مثلا Auth.HighRiskSignInDetected) از Auth module روی EventBus publish می‌شود.

Automation module:

همه workflows فعال که:

Trigger.EventType = event type

(ScopeType = Tenant و TenantId = event.tenantId) یا global workflows

را واکشی می‌کند.

برای هر workflow:

conditions را روی payload event evaluate می‌کند.

اگر conditions true:

یک AutomationExecution می‌سازد.

sequence از actions را اجرا می‌کند (sync یا async queue).

برای هر action:

براساس ActionType:

توابع داخلی (Auth/Identity/Access/...) را call می‌کند یا

Webhook/NotificationCenter را invoke می‌کند.

نتیجه را در Execution log ثبت می‌کند.

7.2 الزامات

Idempotency:

باید بتوانی تضمین کنی event دوبار trigger نشود یا execution duplicate نشود (eventId + workflowId unique).

Throttling:

محدودسازی تعداد executions per tenant per minute/hour.

Retry:

برای actions failure (مثلاً webhook down) retry با backoff.

8. API – Backend
8.1 Tenant Automation APIs

Base: /api/tenant/automation/workflows

8.1.1 List / Get

GET /api/tenant/automation/workflows

لیست workflows tenant + نسخه‌هایی که از template global clone شده‌اند.

GET /api/tenant/automation/workflows/{id}

8.1.2 Create / Update / Delete

POST /api/tenant/automation/workflows

body:

Name

Description

Triggers[]

Conditions[]

Actions[]

IsEnabled

PUT /api/tenant/automation/workflows/{id}

DELETE /api/tenant/automation/workflows/{id}

8.1.3 Enable / Disable

POST /api/tenant/automation/workflows/{id}/enable

POST /api/tenant/automation/workflows/{id}/disable

8.1.4 Test / Dry Run

POST /api/tenant/automation/workflows/{id}/test

body: sampleEventPayload

خروجی:

آیا conditions match می‌شود؟

چه actions اجرا می‌شوند؟ (simulate فقط، بدون اثر واقعی)

8.1.5 Executions

GET /api/tenant/automation/executions?workflowId=&status=&from=&to=

برای مانیتور execution ها

Permissions:

TenantAdmin, TenantSecurityOfficer.

8.2 Global Automation Template APIs

Base: /api/global/automation/templates

8.2.1 Template CRUD

GET /api/global/automation/templates

GET /api/global/automation/templates/{id}

POST /api/global/automation/templates

PUT /api/global/automation/templates/{id}

DELETE /api/global/automation/templates/{id}

8.2.2 Enforce / Publish

POST /api/global/automation/templates/{id}/publish

template در گالری tenantها ظاهر می‌شود.

POST /api/global/automation/templates/{id}/enforce

global enforced workflow:

برای همه tenants فعال (با respect به config).

tenant ممکن است نتواند disable کند (بسته به design).

Permissions:

فقط GlobalAdmin / PlatformOwner.

9. UI – Admin Portal
9.1 Tenant Automation Center

Route: /tenant/automation

Tabs:

Workflows

Executions

Templates (from global gallery)

9.1.1 Workflows tab

لیست workflows tenant:

Name

Triggers (event types)

IsEnabled

LastExecutionAt

Success/Failure ratio

Actions:

Create new workflow:

Stepper UI:

انتخاب Trigger(s):

dropdown از event types (Auth, AccessRequests, ...)

تعریف Conditions:

rule builder ساده:

field (riskScore, user.mfaEnabled, location.country, ...)

operator (=, !=, >, in, not in, ...)

value

نمایش JSON expression برای advanced users.

تعریف Actions:

انتخاب ActionType:

Revoke sessions, Require MFA, Lock account, Send email, Webhook, ...

تنظیم configهای هر action.

Review & Save.

Edit, Duplicate, Delete.

9.1.2 Executions tab

جدول:

ExecutionId

WorkflowName

EventType

StartedAt

Status

ActionsExecutedCount / ActionsFailedCount

جزئیات (drawer / modal):

snapshot payload (mask شده برای PII)

log actions

9.1.3 Templates tab

لیست global templates:

Name

Description

RecommendedFor (e.g. “high risk sign in”, “leaver automation”)

Actions:

"Use this template" → یک workflow tenant از روی template ساخته می‌شود.

9.2 Global Automation Center

Route: /global/automation

Tabs:

Templates

Global Workflows (enforced)

Executions (global-level)

Templates tab:

CRUD templateها.

Publish / Enforce دکمه‌ها.

تعیین اینکه tenantها می‌توانند disable یا override کنند یا نه (flags در template).

10. Cross-Cutting
10.1 Multi tenant

Workflowها per tenant (TenantId) ذخیره می‌شوند.

Global templates بدون TenantId، و execution‌شان در scope tenant خاص است.

هیچ execution یا snapshot نباید cross-tenant را mix کند.

10.2 Security

این فاز بسیار حساس است:

Workflow اشتباه می‌تواند:

همه accounts را lock کند

دسترسی را قطع کند

باید:

Roleهای قوی برای AutomationAdmin تعریف شود.

بعضی actions (مثل LockUserAccount, DisableAppAccess) require confirmation در UI یا extra role.

10.3 Privacy

PayloadSnapshot در AutomationExecution نباید PII کامل را ذخیره کند:

ایمیل، تلفن، ... را mask کن

فقط فیلدهای لازم برای debugging را نگه دار

احترم به DSR:

وقتی کاربر anonymized شد، executions قدیمی نباید PII را ذخیره کرده باشند.

10.4 Observability

برای هر workflow execution:

log مناسب (info / warning / error)

metrics:

executions per tenant

success/failure rate

action latency

10.5 No TODO

هیچ TODO / NotImplemented در Automation module مجاز نیست.

حتی test / dry-run باید کامل کار کند.

11. User Story ها (خلاصه)
Epic 26.1 – Event-driven Security Automation

US 26.1.1 – به عنوان Tenant Security Officer، می‌خواهم اگر HighRiskSignIn تشخیص داده شد و کاربر MFA ندارد، session او revoke شود و MFA برای دفعه بعدی اجباری شود و یک ایمیل فوری دریافت کنم.

Epic 26.2 – Governance & Lifecycle Automation

US 26.2.1 – به عنوان Tenant Admin، می‌خواهم وقتی Leaver شناسایی شد، تمام دسترسی‌های حساس کاربر به صورت خودکار revoke شود و یک گزارش برای HR/IT ارسال شود.

Epic 26.3 – Global Templates

US 26.3.1 – به عنوان Global Admin، می‌خواهم یک template «High Risk Sign-In Response» بسازم و آن را برای همه tenants publish و enforce کنم.

Epic 26.4 – Debug & Audit

US 26.4.1 – به عنوان SecurityOfficer، می‌خواهم execution هر workflow را ببینم تا بفهمم چرا یک action اجرا شده (یا نشده).

12. Dev Tasks – High Level
Backend

ایجاد Onesign.Modules.Automation

پیاده‌سازی:

entities (Workflow, Trigger, Condition, Action, Execution)

EF mappings + migrations

EventBus subscription ها برای eventهای اصلی

IAutomationEngine (evaluate conditions + execute actions)

Tenant & Global APIs

ادغام با:

Auth/Identity services (برای actions)

NotificationCenter

Extensibility/Webhook infra

Unit/Integration tests

Frontend

اضافه کردن:

/tenant/automation + tabs

/global/automation + tabs

UI builder برای:

Trigger selection

Condition rule builder

Action configuration

Execution viewer

i18n for all texts

13. Acceptance Criteria Phase 26

برای یک tenant تستی:

تعریف workflow:

Trigger = Auth.HighRiskSignInDetected

Condition = riskScore > threshold

Actions = RevokeSessions, RequireMfaNextSignIn, SendEmail

وقتی event واقعی fire می‌شود:

session کاربر revoke شود

دفعه بعدی login MFA اجباری باشد

email به SecurityOfficer بیاید

Execution log معتبر در AutomationExecution ثبت شود.

Global template:

ایجاد، publish و enforce می‌شود.

tenant آن را در Template tab می‌بیند (اگر اجازه override دارد یا ندارد).

هیچ TODO / stub در کد Automation باقی نماند.
