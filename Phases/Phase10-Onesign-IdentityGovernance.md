# onesign – Phase 10 Identity Governance & Access Reviews (IGA-lite)

## 1. محدوده Phase 10

### 1.1 هدف کلی

Phase 10 تمرکز دارد روی این‌که onesign از یک "IdP خوشگل" تبدیل شود به یک **محصول Governance** که جواب بخش‌های زیر RFP را بدهد:

- Access Review / Certification
- Periodic attestation برای:
  - User → App
  - Role → Assignment
  - OrgUnit → Users
- SoD (Segregation of Duties) rules و detection حداقلی
- Campaignهای recertification با workflow و audit کامل
- Reportهای قابل ارائه به تیم‌های Compliance و Audit

بدون این فاز، تو در برابر سوال‌هایی مثل:

- "Do you support periodic access reviews and certifications?"  
- "Can managers attest user access at least quarterly?”  

عملاً هیچ نداری.

### 1.2 personaها

- **Compliance Officer / Security Officer (Enterprise)**  
  می‌خواهد:
  - کمپین‌های access review تعریف کند
  - برای هر اپ/role/OrgUnit بداند چه کسی چه چیزی دارد
  - بتواند بگوید: "این دسترسی‌ها توسط مدیر مربوطه تأیید شده‌اند"

- **Tenant Admin / App Owner**  
  می‌خواهد:
  - لیست دسترسی‌های زیرمجموعه خودش را review کند
  - در یک UI ساده "Keep / Revoke" بزند

- **Global SaaS Owner (خودت)**  
  می‌خواهد:
  - بداند کدام tenantها governance را فعال کرده‌اند
  - بتواند Template و policy پیش‌فرض ارائه دهد

### 1.3 چه چیزی اضافه می‌شود در Phase 10

برای هر tenant:

- **Governance Module:**
  - AccessReviewCampaign
  - AccessReviewItem
  - ReviewerAssignment
  - SoDRule و SoDViolation (حداقلی)
  - GovernanceReport / Export

قابلیت‌ها:

- تعریف کمپین‌های Access Review:
  - By Application
  - By OrgUnit
  - By Role
- assignment خودکار reviewer:
  - Manager (بر اساس OrgUnit)
  - App Owner
- Workflow:
  - Pending → Approved / Revoked / Escalated
- Integration با:
  - Policy Engine (Phase 7)
  - OrgHierarchy (Phase 2)
  - Observability/Audit (Phase 6)
  - Billing (برای feature availability)

### 1.4 چه چیزی عمداً در Phase 10 نیست

فعلاً نمی‌زنیم:

- Full-blown IGA مثل SailPoint / Saviynt
- Complex SoD graph engine با rule DSL پیشرفته
- JML (Joiner-Mover-Leaver) full automation (فقط پایه را آماده می‌کنیم، orchestrator را می‌ذاریم فاز بعد)

Phase 10 فقط:

- Access Review campaigns جدی
- SoD rule-check ساده ولی کارآمد
- داده و گزارش قابل دفاع در مقابل Compliance

---

## 2. معماری و ماژول‌ها

### 2.1 ماژول جدید: Governance

ماژول مستقل:

- `Onesign.Modules.Governance`

ساختار:

```text
Onesign.Modules.Governance/
  Domain/
    Entities/
      AccessReviewCampaign.cs
      AccessReviewScope.cs
      AccessReviewItem.cs
      AccessReviewReviewer.cs
      SoDRule.cs
      SoDViolation.cs
      GovernanceExportJob.cs
    Enums/
      AccessReviewType.cs         // ByApplication, ByOrgUnit, ByRole
      AccessReviewStatus.cs       // Draft, Scheduled, Running, Completed, Cancelled
      AccessReviewItemStatus.cs   // Pending, Approved, Revoked, Escalated
      ReviewerType.cs             // Manager, AppOwner, CustomUser
      SoDSeverity.cs              // Low, Medium, High
    Services/
      IAccessReviewService.cs
      IAccessReviewExecutionService.cs
      ISoDService.cs
      IGovernanceExportService.cs
    Repositories/
      IAccessReviewCampaignRepository.cs
      IAccessReviewItemRepository.cs
      ISoDRuleRepository.cs
      ISoDViolationRepository.cs
  Application/
    DTOs/
      AccessReviewCampaignDto.cs
      CreateAccessReviewCampaignRequest.cs
      AccessReviewScopeDto.cs
      AccessReviewItemDto.cs
      ReviewerDto.cs
      SoDRuleDto.cs
      SoDViolationDto.cs
      GovernanceExportDto.cs
    Commands/
      CreateAccessReviewCampaignCommand.cs
      UpdateAccessReviewCampaignCommand.cs
      ScheduleAccessReviewCampaignCommand.cs
      CancelAccessReviewCampaignCommand.cs
      RunAccessReviewNowCommand.cs
      ApproveAccessReviewItemCommand.cs
      RevokeAccessReviewItemCommand.cs
      EscalateAccessReviewItemCommand.cs
      CreateSoDRuleCommand.cs
      UpdateSoDRuleCommand.cs
      DeleteSoDRuleCommand.cs
      GenerateGovernanceExportCommand.cs
    Queries/
      GetAccessReviewCampaignsQuery.cs
      GetAccessReviewCampaignDetailsQuery.cs
      GetAccessReviewItemsForReviewerQuery.cs
      GetSoDRulesQuery.cs
      GetSoDViolationsQuery.cs
      GetGovernanceExportsQuery.cs
  Infrastructure/
    EfCore/Entities/
      AccessReviewCampaignEntity.cs
      AccessReviewScopeEntity.cs
      AccessReviewItemEntity.cs
      AccessReviewReviewerEntity.cs
      SoDRuleEntity.cs
      SoDViolationEntity.cs
      GovernanceExportJobEntity.cs
    EfCore/Configurations/
      AccessReviewCampaignEntityTypeConfiguration.cs
      AccessReviewScopeEntityTypeConfiguration.cs
      AccessReviewItemEntityTypeConfiguration.cs
      AccessReviewReviewerEntityTypeConfiguration.cs
      SoDRuleEntityTypeConfiguration.cs
      SoDViolationEntityTypeConfiguration.cs
      GovernanceExportJobEntityTypeConfiguration.cs
    EfCore/Repositories/
      AccessReviewCampaignRepository.cs
      AccessReviewItemRepository.cs
      SoDRuleRepository.cs
      SoDViolationRepository.cs


2.2 مدل AccessReviewCampaign
public class AccessReviewCampaign
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }

    public string Name { get; private set; }
    public string Description { get; private set; }

    public AccessReviewType Type { get; private set; }    // ByApplication, ByOrgUnit, ByRole

    public DateTime StartAt { get; private set; }
    public DateTime DueAt { get; private set; }

    public AccessReviewStatus Status { get; private set; }  // Draft, Scheduled, Running, Completed, Cancelled

    public bool IsRecurring { get; private set; }
    public string RecurrenceCronExpression { get; private set; } // optional

    public ICollection<AccessReviewScope> Scopes { get; private set; }
}


AccessReviewScope:

public class AccessReviewScope
{
    public Guid Id { get; private set; }
    public Guid CampaignId { get; private set; }

    public string ApplicationClientId { get; private set; }  // for ByApplication
    public Guid? OrgUnitId { get; private set; }             // for ByOrgUnit
    public string RoleName { get; private set; }             // for ByRole
}


AccessReviewItem:

public class AccessReviewItem
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }
    public Guid CampaignId { get; private set; }

    public string UserId { get; private set; }
    public string UserDisplayName { get; private set; }

    public string ApplicationClientId { get; private set; }
    public string ApplicationName { get; private set; }

    public string RoleName { get; private set; }         // optional
    public Guid? OrgUnitId { get; private set; }         // optional

    public AccessReviewItemStatus Status { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ReviewedAt { get; private set; }

    public string ReviewerUserId { get; private set; }
    public string ReviewerDisplayName { get; private set; }

    public string DecisionReason { get; private set; }
}

2.3 SoD Rules و Violations

SoDRule:

public class SoDRule
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }

    public string Name { get; private set; }
    public string Description { get; private set; }

    public SoDSeverity Severity { get; private set; }

    public string ForbiddenRoleCombination { get; private set; }
    // e.g. "Finance.Approver;Finance.Requester" or JSON structure
}


SoDViolation:

public class SoDViolation
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }

    public Guid SoDRuleId { get; private set; }
    public string UserId { get; private set; }
    public string UserDisplayName { get; private set; }

    public string DetectedRoles { get; private set; }   // combination that hits the rule
    public DateTime DetectedAt { get; private set; }

    public bool IsResolved { get; private set; }
    public DateTime? ResolvedAt { get; private set; }
    public string ResolutionNote { get; private set; }
}

3. Epics و User Storyها – Phase 10
Epic 1 – Access Review Campaigns
US 1.1 – تعریف کمپین Access Review

به عنوان Compliance Officer
می‌خواهم کمپین review برای دسترسی کاربران تعریف کنم
تا مدیران بتوانند دسترسی‌ها را تأیید یا revoke کنند.

Acceptance:

Tenant Admin / Compliance نقش لازم برای ایجاد کمپین دارد.

می‌تواند:

Name, Description

Type: ByApplication / ByOrgUnit / ByRole

StartAt, DueAt

IsRecurring + Recurrence (مثلاً هر ۳ ماه یکبار)

Scope:

list of Applications

list of OrgUnits

list of Roles

Status اولیه: Draft

API:

POST /api/tenant/governance/access-reviews

PUT /api/tenant/governance/access-reviews/{id}

GET /api/tenant/governance/access-reviews

GET /api/tenant/governance/access-reviews/{id}

US 1.2 – Schedule و Run کمپین

به عنوان Compliance Officer
می‌خواهم کمپین‌ها را برنامه‌ریزی و اجرا کنم
تا در بازه‌های مشخص review انجام شود.

Acceptance:

Action:

Schedule: تغییر وضعیت از Draft به Scheduled

RunNow: اجرای فوری

API:

POST /api/tenant/governance/access-reviews/{id}/schedule

POST /api/tenant/governance/access-reviews/{id}/run-now

Execution:

برای هر Campaign:

بر اساس Type و Scope از:

OrgHierarchy (Phase 2)

UserAssignment / Roles

ApplicationClient mapping

AccessReviewItem های لازم را generate می‌کند.

US 1.3 – تولید AccessReviewItem بر اساس ساختار سازمانی

به عنوان سیستم
می‌خواهم در زمان اجرای کمپین، برای هر user/app/role item لازم را بسازم
تا reviewerها بتوانند تصمیم بگیرند.

Acceptance:

برای Type=ByApplication:

برای هر app در Scope:

همه userهایی که access به آن app دارند (از Policy/Role/Assignment) جمع شود.

یک AccessReviewItem per user+app (+role اگر relevant) ساخته شود.

برای Type=ByOrgUnit:

برای هر OrgUnit در Scope:

یوزرهای آن OrgUnit (Phase 2) + accessهایشان.

برای Type=ByRole:

برای Roleهای مشخص شده:

همه userهایی که آن Role را دارند.

Reviewer:

اگر Type=ByOrgUnit:

Manager همان OrgUnit به عنوان reviewer set شود.

اگر Type=ByApplication:

AppOwner (از metadata ماژول Applications) به عنوان reviewer.

اگر Type=ByRole:

Owner Role یا Security Officer.

Epic 2 – Review UI برای Reviewer (Manager/App Owner)
US 2.1 – داشبورد Reviewer

به عنوان Manager یا App Owner
می‌خواهم یک لیست واضح از آیتم‌هایی که باید review کنم داشته باشم
تا در زمان محدود بتوانم تصمیم بگیرم.

Acceptance:

صفحه /tenant/governance/reviews/my-tasks

لیست AccessReviewItem:

UserDisplayName

ApplicationName

RoleName (اگر relevant)

CampaignName

DueAt

Status (Pending/Approved/Revoked/Escalated)

API:

GET /api/tenant/governance/access-reviews/my-items

US 2.2 – تصمیم‌گیری روی هر item

به عنوان Reviewer
می‌خواهم بتوانم برای هر دسترسی تصمیم بگیرم که باقی بماند یا revoke شود
تا حداقل اصل "least privilege" رعایت شود.

Acceptance:

Actions per item:

Approve (Keep access)

Revoke (Remove access)

Escalate (مثلاً به Security Officer)

API:

POST /api/tenant/governance/access-reviews/items/{id}/approve

POST /api/tenant/governance/access-reviews/items/{id}/revoke

POST /api/tenant/governance/access-reviews/items/{id}/escalate

Behavior:

Approve:

Status = Approved

ReviewedAt set

Revoke:

Status = Revoked

revoke نقش/assignment مربوطه از User (integration با User/Role module)

Escalate:

Status = Escalated

notification برای مسئول بالاتر (Phase notification بعدی)

Epic 3 – SoD Rules & Violations
US 3.1 – تعریف SoD Rule ساده

به عنوان Compliance Officer
می‌خواهم ruleهایی تعریف کنم که ترکیب بعضی roleها را ممنوع کنند
تا تضاد منافع (SoD) کنترل شود.

Acceptance:

مثال:

نام rule: "Finance Requester + Approver not allowed"

ForbiddenRoleCombination:

["Finance.Requester", "Finance.Approver"]

API:

GET /api/tenant/governance/sod/rules

POST /api/tenant/governance/sod/rules

PUT /api/tenant/governance/sod/rules/{id}

DELETE /api/tenant/governance/sod/rules/{id}

US 3.2 – Detection SoD Violations

به عنوان سیستم
می‌خواهم userهایی که ترکیب roleهای ممنوع را دارند شناسایی کنم
تا به تیم امنیت گزارش دهم.

Acceptance:

Job:

periodic (مثلاً روزانه) یا دستی با command:

POST /api/tenant/governance/sod/run-check

behavior:

برای هر SoDRule:

تمام userهای tenant را scan می‌کند

userهایی که همه roles در ForbiddenRoleCombination را هم‌زمان دارند → SoDViolation جدید یا update violation موجود.

Violations API:

GET /api/tenant/governance/sod/violations

POST /api/tenant/governance/sod/violations/{id}/resolve

Epic 4 – گزارش‌گیری و Export
US 4.1 – Governance Export per Campaign

به عنوان Compliance Officer
می‌خواهم فایل export از نتایج access review داشته باشم
تا به auditor نشان دهم.

Acceptance:

generate export:

POST /api/tenant/governance/access-reviews/{id}/export

format:

حداقل CSV/Excel-friendly:

User

App

Role

Reviewer

Decision

DecisionTime

ذخیره GovernanceExportJobEntity:

status, file location

download API:

GET /api/tenant/governance/exports

GET /api/tenant/governance/exports/{id}/download

US 4.2 – Dashboard خلاصه Governance

به عنوان Tenant Admin
می‌خواهم ببینم وضعیت کمپین‌ها و SoD وضعیت‌شان چیست
تا بدانم کجا خطر داریم.

Acceptance:

metrics:

تعداد کمپین‌های Completed / Running / Overdue

درصد items Approved vs Revoked

تعداد SoD Violations open

API:

GET /api/tenant/governance/dashboard

4. Dev Tasks – Backend
4.1 Database & Entities

Task B10-1 – تعریف Entities و DbSetها

اضافه Entities:

AccessReviewCampaignEntity

AccessReviewScopeEntity

AccessReviewItemEntity

AccessReviewReviewerEntity

SoDRuleEntity

SoDViolationEntity

GovernanceExportJobEntity

اضافه DbSetها در DbContext Onesign.

Task B10-2 – EF Configurations و Indexها

AccessReviewCampaign:

index (TenantId, Status)

AccessReviewItem:

index (TenantId, CampaignId, ReviewerUserId, Status)

SoDRule:

index (TenantId, Name)

SoDViolation:

index (TenantId, SoDRuleId, UserId, IsResolved)

Task B10-3 – Migration Phase 10

ساخت جداول مربوط به Governance بدون دست بردن به schema قبلی.

4.2 Services – Access Review

Task B10-4 – IAccessReviewService

create/update/delete campaign (business rules)

schedule / cancel

retrieval of campaigns and details.

Task B10-5 – IAccessReviewExecutionService

job execution:

resolve scope → تولید AccessReviewItem.

integration:

از OrgHierarchy (Phase 2) برای mapping user ↔ OrgUnit.

از Applications/Assignments برای user-app-role mapping.

رعایت multi-tenant.

Task B10-6 – Reviewer assignment logic

policy:

ByOrgUnit → OrgUnit.Manager

ByApplication → Application.AppOwner

fallback: Security Officer role of tenant.

پیاده‌سازی در ExecutionService.

Task B10-7 – Review Decision Handling

Approve:

set item.Status = Approved

ReviewedAt = now

Revoke:

set item.Status = Revoked

revoke role/permission در ماژول User/Role

Escalate:

set item.Status = Escalated

create notification event (برای استفاده در فاز notification).

همه با Audit:

IAuditWriter:

"Governance.AccessReview.Approved"

"Governance.AccessReview.Revoked"

"Governance.AccessReview.Escalated"

4.3 Services – SoD

Task B10-8 – ISoDService

مدیریت rules:

Create/Update/Delete SoDRule

Detection:

متد RunSoDCheckAsync(tenantId)

برای هر SoDRule:

همه userها و rolesشان را از ماژول User/Role بگیرد.

userهایی که combination ممنوع را دارند → SoDViolation.

Resolution:

ResolveViolationAsync(violationId, resolutionNote)

Audit:

"Governance.SoD.ViolationCreated"

"Governance.SoD.ViolationResolved"

4.4 Governance Export

Task B10-9 – IGovernanceExportService

GenerateExportAsync(campaignId):

جمع‌آوری AccessReviewItem ها و serialize به CSV.

ذخیره فایل در storage (local/Blob) + GovernanceExportJobEntity.

API و download:

دریافت secure link یا stream.

4.5 API Endpoints – Tenant Governance

Base: /api/tenant/governance

Task B10-10 – Access Reviews API

GET /api/tenant/governance/access-reviews

GET /api/tenant/governance/access-reviews/{id}

POST /api/tenant/governance/access-reviews

PUT /api/tenant/governance/access-reviews/{id}

POST /api/tenant/governance/access-reviews/{id}/schedule

POST /api/tenant/governance/access-reviews/{id}/run-now

POST /api/tenant/governance/access-reviews/{id}/cancel

Task B10-11 – Review Items API

GET /api/tenant/governance/access-reviews/my-items

برای reviewer فعلی.

POST /api/tenant/governance/access-reviews/items/{id}/approve

POST /api/tenant/governance/access-reviews/items/{id}/revoke

POST /api/tenant/governance/access-reviews/items/{id}/escalate

Task B10-12 – SoD API

GET /api/tenant/governance/sod/rules

POST /api/tenant/governance/sod/rules

PUT /api/tenant/governance/sod/rules/{id}

DELETE /api/tenant/governance/sod/rules/{id}

POST /api/tenant/governance/sod/run-check

GET /api/tenant/governance/sod/violations

POST /api/tenant/governance/sod/violations/{id}/resolve

Task B10-13 – Export & Dashboard API

POST /api/tenant/governance/access-reviews/{id}/export

GET /api/tenant/governance/exports

GET /api/tenant/governance/exports/{id}/download

GET /api/tenant/governance/dashboard

تمام این endpointها:

tenant-scoped

permission: فقط roles مثل ComplianceOfficer, SecurityOfficer, TenantAdmin

my-items برای reviewerهای معمولی (manager / app owner).

5. Dev Tasks – Frontend (Tenant Governance UI)

در Admin Portal (Tenant Admin Portal):

5.1 – Governance Navigation

Task F10-1 – اضافه کردن بخش Governance

در navigation:

Governance

Access Reviews

SoD Rules

Dashboard

5.2 – Access Review Campaign UI

Task F10-2 – Campaign List Page

/tenant/governance/access-reviews

جدول:

Name

Type

Status

StartAt

DueAt

Progress (% items reviewed)

actions:

Create

Edit

Schedule/RunNow

View details

Task F10-3 – Campaign Editor

Form:

Name

Description

Type (ByApplication / ByOrgUnit / ByRole)

StartAt / DueAt

Recurrence (optional cron or simple "every X months")

Scope:

App selector (از ماژول Applications)

OrgUnit tree selector (از Phase 2)

Role selector

call create/update APIs.

Task F10-4 – Campaign Details & Progress

نشان‌دادن:

summary

تعداد items:

total

pending

approved

revoked

escalated

لینک به export و run check.

5.3 – Reviewer Task UI

Task F10-5 – My Review Items Page

/tenant/governance/my-reviews

لیست AccessReviewItem:

User

App

Role

Campaign

Status

DueAt

Batch actions:

select چند item → approve/revoke اکثریت (اختیاری در همین فاز، اما خوب است)

Task F10-6 – Review Item Detail

نمایش:

User info (DisplayName, OrgUnit)

App info

Roles این user در آن app

Activity اخیر (از Observability – optional خلاصه)

actions:

Approve / Revoke / Escalate

5.4 – SoD UI

Task F10-7 – SoD Rules Page

/tenant/governance/sod/rules

جدول:

Name

Severity

ForbiddenRoleCombination (خلاصه)

actions:

Create

Edit

Delete

Form:

Name

Description

Severity

انتخاب Roleها (multi-select از Role list)

Task F10-8 – SoD Violations Page

/tenant/governance/sod/violations

جدول:

User

DetectedRoles

RuleName

Severity

DetectedAt

IsResolved

actions:

Resolve (با وارد کردن ResolutionNote)

5.5 – Governance Dashboard UI

Task F10-9 – Dashboard

/tenant/governance/dashboard

کارت‌ها:

Active campaigns

Overdue campaigns

% Reviewed vs Pending

Open SoD Violations

نمودار ساده:

breakdown Approved vs Revoked per last X campaigns.

6. Cross-cutting Tasks

Task X10-1 – Localization

تمام متن‌ها (Governance / Access Review / SoD) i18n.

هیچ label خام انگلیسی/فارسی در JSX یا کنترلر.

Task X10-2 – Observability Integration

تمام 이벤트های governance را در Audit log ثبت کن:

Campaign.Created

Campaign.Scheduled

Campaign.Run

Campaign.Completed

AccessReviewItem.Approved/Revoked/Escalated

SoD.ViolationCreated/Resolved

Category = Governance.

Task X10-3 – Performance

AccessReviewItem ممکن است زیاد شود:

Pagination در API و UI.

Indexها درست.

SoD check:

حتماً به شکل batch، بدون N+1 روی user/role.

Task X10-4 – Security & Consistency

AccessRevocation واقعاً باید user assignment/role را در ماژول Auth حذف کند؛
هیچ‌چیز «فقط روی UI» نباید بماند.

اگر revoke در mid-way fail کرد:

item نباید Approved بخورد.

باید با error درست و audit ثبت شود.

7. نکات طراحی Phase 10

این فاز، onesign را از "SSO Platform" به "Light IGA Platform" نزدیک می‌کند؛
یعنی جایی که vendorهای enterprise ازت سوال سخت می‌پرسند.

اشتباه مرگبار:

Access Review را فقط به شکل یک grid read-only بسازی و revoke را دستی به عهده مشتری بگذاری.
باید واقعاً permission را revoke کنی.

SoD اینجا basic است ولی اگر درست طراحی شود، می‌توانی در فاز بعد DSL و engine را روی همین پایه‌ها سوار کنی.