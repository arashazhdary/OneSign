# onesign – Phase 12 Access Request & Approval Workflows

## 1. محدوده Phase 12

### 1.1 هدف کلی

Phase 12 تمرکز دارد روی این که onesign از یک "سیستم مدیریت دسترسی و گاورننس" تبدیل شود به یک **سیستم کامل Access Lifecycle** که شامل:

- Self-service access request برای کاربر
- Approval workflow چند مرحله ای
- اتصال مستقیم approval نهایی به:
  - PolicyEngine و Role assignment
  - Federation / SCIM برای provisioning به سیستم های مقصد
- Audit و Trace کامل: چه کسی، چه چیزی، کی درخواست داد و چه کسی تایید کرد یا رد کرد

بدون این فاز، همه سوال های RFP مثل:

- "How do users request access to new applications or roles"
- "Do you support multi step approval for access"
- "Is access granted only after documented approval"

جواب جدی نخواهند داشت.


### 1.2 personas

- **End User (Requestor)**  
  می خواهد:
  - از طریق Account Center ببیند چه app یا role هایی قابل درخواست است
  - درخواست بدهد، دلیل بنویسد، وضعیت درخواستش را ببیند
  - بداند درخواستش دست چه کسی است و چه اتفاقی افتاده

- **Manager / OrgUnit Admin (Approver)**  
  می خواهد:
  - لیست درخواست های زیرمجموعه خودش را ببیند
  - با چند کلیک Approve یا Reject کند
  - Reason بگذارد، بتواند escalate یا delegate کند

- **Application Owner / Security Officer**  
  می خواهد:
  - برای app های خودش approval step اختصاصی داشته باشد
  - حتما قبل از دسترسی به app های حساس، خودش تصمیم بگیرد

- **Tenant Admin / Governance Officer**  
  می خواهد:
  - Approval flow برای هر app/role یا دسته بندی تعریف کند
  - Policy بگذارد که بدون approval معتبر، هیچ دسترسی فعال نشود
  - گزارش بگیرد که چه دسترسی هایی بدون approval یا خارج از SLA تایید شده اند

### 1.3 چه چیزی در Phase 12 اضافه می شود

برای هر tenant:

- **Access Request Module** با قابلیت های زیر:
  - تعریف Approval Flow per:
    - Application
    - Role
    - OrgUnit (optional)
  - Self service request از طریق Account Center
  - Multi step approval:
    - Manager
    - AppOwner
    - SecurityOfficer
    - Custom approver
  - Integration با:
    - OrgHierarchy (Phase 2) برای پیدا کردن Manager
    - PolicyEngine و UserRole (Phase 7) برای اعطای دسترسی
    - Federation/SCIM (Phase 4) برای provisioning بیرونی
    - Governance (Phase 10) برای همگرایی با Access Review
    - NotificationCenter (Phase 11) برای نوتیف درخواست و یادآوری
    - Observability (Phase 6) برای audit و log


### 1.4 چه چیزهایی عمدا در این فاز نیست

فعلا نمی زنیم:

- Full workflow engine عمومی (BPM کامل)
- Request catalog پیچیده با dynamic form builder
- Rule های پیچیده SoD در لحظه request (از Phase 10 SoD استفاده حداقلی کافی است)
- Integration عمیق با HR system به عنوان "Joiner-Mover-Leaver" orchestrator کامل

Phase 12 فقط:

- Access Request و Approval Workflow جدی
- اتصال مستقیم به PolicyEngine، Federation و Notification
- Data model تمیز برای رشد در فازهای بعد

---

## 2. معماری و ماژول ها

### 2.1 ماژول جدید: AccessRequests

ماژول مستقل:

- `Onesign.Modules.AccessRequests`

ساختار:

```text
Onesign.Modules.AccessRequests/
  Domain/
    Entities/
      AccessRequest.cs
      AccessRequestItem.cs
      AccessApprovalFlow.cs
      AccessApprovalStepDefinition.cs
      AccessApprovalInstance.cs
      AccessApprovalDecision.cs
      AccessRequestSlaConfig.cs
    Enums/
      AccessRequestStatus.cs       // Draft, Submitted, InProgress, Approved, Rejected, Cancelled, Failed
      AccessApprovalStatus.cs      // Pending, Approved, Rejected, Skipped, Escalated
      AccessApprovalStepType.cs    // Manager, AppOwner, SecurityOfficer, CustomRole
      AccessTargetType.cs          // Application, Role
    ValueObjects/
      AccessTargetRef.cs           // ApplicationClientId or RoleName etc
    Services/
      IAccessRequestService.cs
      IAccessApprovalService.cs
      IAccessRequestWorkflowEngine.cs
      IAccessRequestProvisioningService.cs
    Repositories/
      IAccessRequestRepository.cs
      IAccessApprovalFlowRepository.cs
      IAccessApprovalInstanceRepository.cs
  Application/
    DTOs/
      AccessRequestDto.cs
      CreateAccessRequestRequest.cs
      AccessRequestItemDto.cs
      AccessApprovalFlowDto.cs
      CreateAccessApprovalFlowRequest.cs
      UpdateAccessApprovalFlowRequest.cs
      AccessApprovalInstanceDto.cs
      ApprovalDecisionDto.cs
      AccessRequestDashboardStatsDto.cs
    Commands/
      CreateAccessRequestCommand.cs
      SubmitAccessRequestCommand.cs
      CancelAccessRequestCommand.cs
      ApproveAccessRequestStepCommand.cs
      RejectAccessRequestStepCommand.cs
      EscalateAccessRequestStepCommand.cs
      CreateAccessApprovalFlowCommand.cs
      UpdateAccessApprovalFlowCommand.cs
    Queries/
      GetMyAccessRequestsQuery.cs
      GetAccessRequestsForApproverQuery.cs
      GetAccessRequestDetailsQuery.cs
      GetAccessApprovalFlowsQuery.cs
      GetAccessApprovalFlowDetailsQuery.cs
      GetAccessRequestDashboardStatsQuery.cs
  Infrastructure/
    EfCore/Entities/
      AccessRequestEntity.cs
      AccessRequestItemEntity.cs
      AccessApprovalFlowEntity.cs
      AccessApprovalStepDefinitionEntity.cs
      AccessApprovalInstanceEntity.cs
      AccessApprovalDecisionEntity.cs
      AccessRequestSlaConfigEntity.cs
    EfCore/Configurations/
      AccessRequestEntityTypeConfiguration.cs
      AccessRequestItemEntityTypeConfiguration.cs
      AccessApprovalFlowEntityTypeConfiguration.cs
      AccessApprovalStepDefinitionEntityTypeConfiguration.cs
      AccessApprovalInstanceEntityTypeConfiguration.cs
      AccessApprovalDecisionEntityTypeConfiguration.cs
      AccessRequestSlaConfigEntityTypeConfiguration.cs
    EfCore/Repositories/
      AccessRequestRepository.cs
      AccessApprovalFlowRepository.cs
      AccessApprovalInstanceRepository.cs


2.2 مدل AccessRequest
public class AccessRequest
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }

    public string RequestorUserId { get; private set; }
    public string RequestorDisplayName { get; private set; }

    public string Justification { get; private set; }

    public AccessRequestStatus Status { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime? SubmittedAt { get; private set; }
    public DateTime? CompletedAt { get; private set; }

    public ICollection<AccessRequestItem> Items { get; private set; }
}


AccessRequestItem:

public class AccessRequestItem
{
    public Guid Id { get; private set; }

    public Guid RequestId { get; private set; }
    public AccessTargetType TargetType { get; private set; }  // Application, Role

    public string ApplicationClientId { get; private set; }    // if TargetType = Application
    public string RoleName { get; private set; }               // if TargetType = Role

    public string ScopeDetails { get; private set; }           // optional extra info: environment, data-scope etc

    public bool IsApproved { get; private set; }
    public bool IsRejected { get; private set; }
}

2.3 مدل Approval Flow و Instance

AccessApprovalFlow:

public class AccessApprovalFlow
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }

    // تعریف می کند که چه target هایی به این flow وصل اند
    public AccessTargetType TargetType { get; private set; }
    public string ApplicationClientId { get; private set; }    // optional
    public string RoleName { get; private set; }               // optional

    public bool IsEnabled { get; private set; }

    public ICollection<AccessApprovalStepDefinition> Steps { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
}


AccessApprovalStepDefinition:

public class AccessApprovalStepDefinition
{
    public Guid Id { get; private set; }

    public Guid FlowId { get; private set; }

    public int Order { get; private set; }

    public AccessApprovalStepType StepType { get; private set; }    // Manager, AppOwner, SecurityOfficer, CustomRole

    public string CustomRoleName { get; private set; }              // for CustomRole

    public bool AllowDelegate { get; private set; }
    public bool AutoApproveIfNoOwner { get; private set; }          // optional behavior
}


AccessApprovalInstance:

public class AccessApprovalInstance
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }

    public Guid RequestId { get; private set; }
    public Guid RequestItemId { get; private set; }

    public Guid FlowId { get; private set; }
    public int CurrentStepOrder { get; private set; }

    public AccessApprovalStatus Status { get; private set; }        // Pending, Approved, Rejected

    public ICollection<AccessApprovalDecision> Decisions { get; private set; }
}


AccessApprovalDecision:

public class AccessApprovalDecision
{
    public Guid Id { get; private set; }

    public Guid ApprovalInstanceId { get; private set; }

    public int StepOrder { get; private set; }

    public string ApproverUserId { get; private set; }
    public string ApproverDisplayName { get; private set; }

    public AccessApprovalStatus Status { get; private set; }        // Approved, Rejected, Escalated
    public string Reason { get; private set; }

    public DateTime DecidedAt { get; private set; }
}

3. Epics و User Story ها – Phase 12
Epic 1 – تعریف Approval Flow per Application/Role
US 1.1 – تعریف Flow برای Application

به عنوان Tenant Admin
می خواهم برای هر Application حساس، یک approval flow تعریف کنم
تا قبل از اعطای دسترسی، chain تایید مناسبی اجرا شود.

Acceptance:

بتواند Flow تعریف کند برای:

ApplicationClientId مشخص

Steps:

Step 1: Manager

Step 2: AppOwner

Step 3: SecurityOfficer (optional)

API:

GET /api/tenant/access-requests/flows

GET /api/tenant/access-requests/flows/{id}

POST /api/tenant/access-requests/flows

PUT /api/tenant/access-requests/flows/{id}

DELETE /api/tenant/access-requests/flows/{id}

US 1.2 – Flow برای Role های حساس

به عنوان Security Officer
می خواهم برای Role های حساس (مثل "Finance.Approver") flow اختصاصی تعریف کنم
تا هر کسی نتواند به سادگی این role را بگیرد.

Acceptance:

Flow با TargetType = Role و RoleName مشخص.

Steps قابل تعریف مانند بالا.

اگر برای Application و Role هر دو flow تعریف شده باشد، باید سیاست مشخص داشته باشیم:

مثلا اول Role flow اعمال شود یا merge logic (در Phase 12 می توان سادۀ "بیشترین سخت گیری" را انتخاب کرد: union steps).

Epic 2 – Self Service Access Request از Account Center
US 2.1 – لیست Resource های قابل درخواست

به عنوان End User
می خواهم در Account Center لیست app ها و role هایی که قابل درخواست هستند را ببینم
تا بتوانم درخواست دسترسی جدید ثبت کنم.

Acceptance:

Account Center صفحه:

"Request Access"

backend:

GET /api/account/access-requests/catalog

بر اساس:

Apps و Roles که tenant آنها را requestable تعریف کرده

ممکن است شامل metadata (description, sensitivity) باشد

Catalog:

نهایی نیست، اما در Phase 12 حداقل:

ApplicationClientId, Name, Description, Category

RoleName, Description, SensitivityLevel

US 2.2 – ثبت Access Request

به عنوان End User
می خواهم بتوانم برای یک یا چند app/role درخواست بفرستم
تا سیستم بقیه workflow را مدیریت کند.

Acceptance:

فرم:

انتخاب یک یا چند مورد از catalog

Justification (required)

API:

POST /api/account/access-requests

body: CreateAccessRequestRequest:

Items: list of AccessTargetRef

Justification

Behavior:

ایجاد AccessRequest در وضعیت Submitted

ایجاد AccessApprovalInstance برای هر item بر اساس Flow مرتبط

ارسال رویداد به NotificationCenter:

EventType مثلا "AccessRequest.Submitted"

US 2.3 – مشاهده وضعیت درخواست ها

به عنوان End User
می خواهم در Account Center وضعیت درخواست هایم را ببینم
تا بدانم کجا گیر کرده است.

Acceptance:

صفحه:

"My Access Requests"

API:

GET /api/account/access-requests/my

هر مورد:

CreatedAt

Status (Submitted, InProgress, Approved, Rejected, Cancelled)

Items و وضعیت آنها

اگر ممکن بود:

مرحله فعلی: "Waiting for Manager", "Waiting for AppOwner"

Epic 3 – Approval Worklist برای Approver ها
US 3.1 – Worklist برای Approver

به عنوان Manager یا AppOwner یا SecurityOfficer
می خواهم یک لیست از درخواست هایی که منتظر تصمیم من هستند داشته باشم
تا به صورت متمرکز بتوانم آنها را بررسی کنم.

Acceptance:

Tenant Admin Portal صفحه:

"Access Approvals" برای کاربران approver

API:

GET /api/tenant/access-requests/approvals/my

هر item:

Requestor name

Target (App or Role)

Justification

CreatedAt

SLA status (optional: on time, near due, overdue)

US 3.2 – تصمیم گیری روی Step

به عنوان Approver
می خواهم روی هر مرحله Approve یا Reject یا Escalate کنم
تا workflow جلو برود یا متوقف شود.

Acceptance:

Actions:

Approve

Reject

Escalate (مثلا به SecurityOfficer)

API:

POST /api/tenant/access-requests/approvals/{approvalInstanceId}/approve

POST /api/tenant/access-requests/approvals/{approvalInstanceId}/reject

POST /api/tenant/access-requests/approvals/{approvalInstanceId}/escalate

Behavior در WorkflowEngine:

اگر Approved:

رفتن به step بعدی

اگر آخرین step بود:

mark RequestItem as approved

trigger Provisioning

اگر Rejected:

کل RequestItem → rejected

AccessRequest اگر همه items reject شوند → Rejected

اگر Escalated:

بسته به policy:

assign step به approver دیگر (مثلا SecurityOfficer)

Epic 4 – Workflow Engine و Provisioning
US 4.1 – WorkflowEngine

به عنوان سیستم
می خواهم تمام logic پیشروی step ها و وضعیت request ها در یک engine متمرکز باشد
تا رفتار قابل تست و قابل توسعه باشد.

Acceptance:

Interface:

IAccessRequestWorkflowEngine

StartWorkflowAsync(requestId, requestItemId)

AdvanceOnApprovalAsync(approvalInstanceId, decision)

Behavior:

در Start:

Flow مناسب برای target پیدا شود

ApprovalInstance ایجاد شود

اولین step pending شود

NotificationCenter برای approver notify کند

در Advance:

اگر step Approved و step بعدی وجود دارد:

current step به Approved

step بعدی Pending

NotificationCenter برای approver بعدی notify کند

اگر آخرین step Approved:

ApprovalInstance → Approved

RequestItem → IsApproved = true

call IAccessRequestProvisioningService

US 4.2 – Provisioning (Integration با PolicyEngine و Federation)

به عنوان سیستم
می خواهم بعد از approval نهایی، دسترسی واقعا به کاربر داده شود
تا approval فقط روی کاغذ نباشد.

Acceptance:

IAccessRequestProvisioningService:

بر اساس نوع target:

اگر Application:

به کمک PolicyEngine/Role module role یا permission لازم را به user بدهد

اگر لازم است اپلیکیشن downstream با SCIM/OIDC claim به روز شود

اگر Role:

role binding برای user ایجاد کند

Integration:

استفاده از سرویس های موجود در:

Authorization/PolicyEngine (Phase 7)

Federation/SCIM (Phase 4)

Audit:

"AccessRequest.ProvisioningStarted"

"AccessRequest.ProvisioningSucceeded"

"AccessRequest.ProvisioningFailed"

Epic 5 – SLA و Dashboard
US 5.1 – SLA config

به عنوان Governance Officer
می خواهم SLA برای تایید درخواست ها داشته باشم
تا بدانم کدام approver ها کند هستند و دسترسی ها بدون کنترل رها نشده اند.

Acceptance:

AccessRequestSlaConfig:

per tenant:

default approver SLA (ساعت یا روز)

critical request SLA کوتاه تر

استفاده در:

محاسبه overdue بودن steps

Dashboard

US 5.2 – Access Request Dashboard

به عنوان Tenant Admin
می خواهم یک dashboard خلاصه داشته باشم
تا بدانم چند درخواست معلق، تایید شده، رد شده و overdue وجود دارد.

Acceptance:

API:

GET /api/tenant/access-requests/dashboard

برگرداندن AccessRequestDashboardStatsDto:

total requests last N days

pending

approved

rejected

overdue approvals

UI:

در Admin Portal بخش جداگانه

4. Dev Tasks – Backend
4.1 Database & Entities

Task B12-1 – تعریف Entities و DbSet ها

اضافه Entities:

AccessRequestEntity

AccessRequestItemEntity

AccessApprovalFlowEntity

AccessApprovalStepDefinitionEntity

AccessApprovalInstanceEntity

AccessApprovalDecisionEntity

AccessRequestSlaConfigEntity

اضافه DbSet ها در DbContext مربوط به onesign.

Task B12-2 – EF Configurations و Index ها

AccessRequest:

index روی (TenantId, RequestorUserId, Status, CreatedAt)

AccessApprovalInstance:

index روی (TenantId, Status, CurrentStepOrder)

AccessApprovalDecision:

index روی (TenantId, ApproverUserId, DecidedAt)

AccessApprovalFlow:

index روی (TenantId, TargetType, ApplicationClientId, RoleName, IsEnabled)

Task B12-3 – Migration Phase 12

ساخت جداول جدید ماژول AccessRequests.

بدون تغییر destructive روی schema قبلی.

4.2 Services – AccessRequestService

Task B12-4 – IAccessRequestService

متدها:

CreateRequestAsync(tenantId, requestorUserId, CreateAccessRequestRequest)

GetMyRequestsAsync(tenantId, requestorUserId, filter/paging)

GetRequestDetailsAsync(tenantId, requestId)

CancelRequestAsync(tenantId, requestId, requestorUserId)

Behavior:

Create:

ایجاد AccessRequest در وضعیت Submitted

ایجاد AccessRequestItem ها

call WorkflowEngine.Start برای هر item

Cancel:

فقط اگر Request در وضعیت Submitted یا InProgress

Status = Cancelled، ApprovalInstance ها قفل شوند

audit "AccessRequest.Cancelled"

4.3 Services – Approval و WorkflowEngine

Task B12-5 – IAccessApprovalService

متدها:

GetApproverWorklistAsync(tenantId, approverUserId, filter/paging)

ApproveAsync(tenantId, approvalInstanceId, approverUserId, reason)

RejectAsync(tenantId, approvalInstanceId, approverUserId, reason)

EscalateAsync(tenantId, approvalInstanceId, approverUserId, reason)

Behavior:

Validations:

approverUserId باید مجاز به تصمیم روی این step باشد

بعد از تصمیم:

call WorkflowEngine.AdvanceOnApprovalAsync

Task B12-6 – IAccessRequestWorkflowEngine

StartWorkflowAsync(requestId, itemId):

پیدا کردن Flow مناسب:

ابتدا بر اساس ApplicationClientId و RoleName

اگر نبود، policy fallback (مثلا default flow)

ایجاد AccessApprovalInstance

تعیین CurrentStepOrder = اولین step

NotificationCenter event برای approver step اول

AdvanceOnApprovalAsync(approvalInstanceId, decision):

اگر Rejected:

ApprovalInstance.Status = Rejected

RequestItem.IsRejected = true

اگر همه items یا حداقل یکی rule خاص داشته باشد، AccessRequest را هم Rejected کن

اگر Approved:

اگر step بعدی وجود دارد:

CurrentStepOrder = next

Notification برای approver بعدی

اگر step بعدی وجود ندارد:

ApprovalInstance.Status = Approved

RequestItem.IsApproved = true

call ProvisioningService

اگر همه items approved:

AccessRequest.Status = Approved, CompletedAt = now

Escalate:

policy: مثلا assign step به SecurityOfficer نقش مشخص

Audit:

"AccessRequest.StepApproved"

"AccessRequest.StepRejected"

"AccessRequest.StepEscalated"

"AccessRequest.Completed"

4.4 Services – Provisioning

Task B12-7 – IAccessRequestProvisioningService

متد:

ProvisionAsync(tenantId, AccessRequest request, AccessRequestItem item)

Behavior:

برای TargetType = Application:

از PolicyEngine/Role module برای assign کردن role/permission مناسب به user استفاده کن

برای TargetType = Role:

role binding ایجاد کن

اگر Federation/SCIM لازم است:

event یا call به ماژول Federation برای push کردن تغییر

Failure:

اگر provisioning fail شود:

AccessRequest.Status = Failed (یا item را Failed علامت بزن)

audit event "AccessRequest.ProvisioningFailed"

Notification به SecurityOfficer یا TenantAdmin بفرست

4.5 APIs

AccessRequest APIs برای Account (end user):

Base: /api/account/access-requests

Task B12-8 – Account side APIs

GET /api/account/access-requests/catalog

لیست resource های قابل درخواست

GET /api/account/access-requests/my

لیست AccessRequestDto برای requestor

GET /api/account/access-requests/{id}

جزئیات درخواست

POST /api/account/access-requests

ایجاد request

POST /api/account/access-requests/{id}/cancel

لغو درخواست توسط requestor

AccessRequest APIs برای Tenant (admin و approver):

Base: /api/tenant/access-requests

Task B12-9 – Tenant side APIs

Flows:

GET /api/tenant/access-requests/flows

GET /api/tenant/access-requests/flows/{id}

POST /api/tenant/access-requests/flows

PUT /api/tenant/access-requests/flows/{id}

DELETE /api/tenant/access-requests/flows/{id}

Approvals:

GET /api/tenant/access-requests/approvals/my

POST /api/tenant/access-requests/approvals/{approvalInstanceId}/approve

POST /api/tenant/access-requests/approvals/{approvalInstanceId}/reject

POST /api/tenant/access-requests/approvals/{approvalInstanceId}/escalate

Dashboard:

GET /api/tenant/access-requests/dashboard

همه endpoint ها tenant scoped و role based (approver ها باید permission خاص داشته باشند).

5. Dev Tasks – Frontend
5.1 Account Center – Request Access

Task F12-1 – صفحه Request Access در Account Center

مسیر: /account/access-requests/request

از GET /api/account/access-requests/catalog:

نمایش لیست app ها و role های requestable

UI:

فیلتر بر اساس:

Application vs Role

Category

انتخاب یک یا چند resource

Justification text area

Action:

submit → call POST /api/account/access-requests

نمایش success و redirect به "My Requests"

Task F12-2 – صفحه My Access Requests

مسیر: /account/access-requests/my

جدول:

CreatedAt

Summary (مثلا "3 resources")

Status

کلیک روی هر مورد:

باز کردن جزئیات:

Items و وضعیت item به item

مرحله فعلی (اگر ممکن است)

دکمه Cancel برای درخواست هایی که هنوز InProgress یا Submitted هستند.

5.2 Admin Portal – Approval Worklist

Task F12-3 – صفحه Approvals برای Approver ها

مسیر: /tenant/access-requests/approvals/my

استفاده از GET /api/tenant/access-requests/approvals/my

جدول:

Requestor

Target (App/Role)

CreatedAt

Age / SLA indicator

اکشن:

Approve

Reject

Escalate

باز شدن panel جزئیات:

Justification

همه step های flow و وضعیتشان تا این لحظه

5.3 Admin Portal – Flow Management

Task F12-4 – صفحه Flow List

مسیر: /tenant/access-requests/flows

جدول:

TargetType (App/Role)

ApplicationClientId/Name یا RoleName

IsEnabled

Number of steps

Actions:

Create

Edit

Disable/Delete

Task F12-5 – Flow Editor

مسیر: /tenant/access-requests/flows/new و /tenant/access-requests/flows/{id}

Form:

TargetType: Application یا Role

انتخاب Application (از ماژول Applications) یا Role (از ماژول Authorization)

Steps: لیست قابل reorder

StepType: Manager / AppOwner / SecurityOfficer / CustomRole

CustomRoleName در صورت نیاز

AllowDelegate و AutoApproveIfNoOwner option

call:

POST / PUT flow APIs

5.4 Admin Portal – Dashboard

Task F12-6 – Access Request Dashboard

مسیر: /tenant/access-requests/dashboard

استفاده از GET /api/tenant/access-requests/dashboard

کارت ها:

Requests last 30 days

Pending approvals

Overdue approvals

Average approval time

نمودار ساده:

Approved vs Rejected

شاید breakdown per Application

6. Cross-cutting Tasks

Task X12-1 – Localization

همه متن های UI در Account Center و Admin Portal برای Access Requests دو زبانه.

EventType ها و labels از i18n.

Task X12-2 – Notification Integration

در StartWorkflow و Advance:

از NotificationCenter (Phase 11) استفاده شود برای:

notify approver ها:

EventType مثل "AccessRequest.StepPending"

notify requestor:

"AccessRequest.Approved"

"AccessRequest.Rejected"

هیچ سیستم دیگری مستقیم email یا sms نزند.

Task X12-3 – Observability و Audit

هر event مهم:

"AccessRequest.Submitted"

"AccessRequest.Cancelled"

"AccessRequest.StepApproved"

"AccessRequest.StepRejected"

"AccessRequest.StepEscalated"

"AccessRequest.ProvisioningStarted"

"AccessRequest.ProvisioningSucceeded"

"AccessRequest.ProvisioningFailed"

در Audit log ثبت شود و در Phase 6 Observability قابل مشاهده باشد.

Task X12-4 – SoD و Governance Integration (اختیاری ولی مهم)

قبل از نهایی شدن approval:

می توان check ساده با SoDService (Phase 10) انجام داد:

اگر دادن این Role باعث SoDViolation می شود:

یا block کنی

یا require SecurityOfficer approval step اضافه (در همین فاز اگر می خواهی سختگیر باشی)

Task X12-5 – Security

Permission model:

Approver ها فقط به request هایی دسترسی داشته باشند که step فعلی شان به آنها assign شده است.

Tenant Admin به همه درخواست های tenant دسترسی read-only دارد.

Input validation:

کاربر نتواند برای app/role هایی که در catalog نیستند درخواست fake بفرستد.

7. نکات طراحی Phase 12

این فاز، حلقه را می بندد:

PolicyEngine + Federation + Governance + Notification + Access Request

بدون آن، مدیریت دسترسی هنوز manual و خارج از سیستم انجام می شود.

اشتباه مرگبار:

Access Requests را بسازی ولی provisioning را به دست admin بگذاری که بیرون از سیستم role بدهد.

یا approval ها فقط در UI ذخیره شود و هیچ تاثیری روی real access نداشته باشد.

درست پیاده اگر بشود:

هر دسترسی جدید دقیقا یک trail دارد:

Requestor، justification، approver ها، زمان ها، provisioning، و بعد در Phase 10 access review دوباره به همین chain وصل می شوی.