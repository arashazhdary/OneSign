# onesign – Phase 7 Policy Engine (RBAC++ / ABAC-lite)

## 1. محدوده Phase 7

### 1.1 هدف کلی

Phase 7 تمرکز دارد روی تبدیل کردن Authorization از چیز ساده "Role check" به یک **Policy Engine قابل‌فروش در Enterprise**:

- Central Policy Engine per tenant
- مدل‌سازی Policy به شکل ساختارمند (نه if-else پراکنده)
- ترکیب Role + OrgUnit + Attributes + RiskLevel در تصمیم
- اعمال Policy روی:
  - Login / Token issuance (کدام scopes / claims مجازند)
  - Access به Applications
  - Feature flags سمت SSO

این فاز یعنی جواب «بله» به سوال‌های RFP مثل:

- "Do you support attribute-based access control (ABAC)?"
- "Can we define contextual policies based on org structure, device and risk?"
- "Can we restrict scopes per app, per user segment, per risk?"

### 1.2 چه چیزی اضافه می‌شود

برای هر tenant:

- **Policy Model**:
  - PolicyDefinition
  - PolicyCondition (tree ساده)
  - PolicyTarget (Application / Scope / Resource category)
  - Effect: Allow / Deny
- **Policy Evaluation Engine**:
  - ورودی:
    - User (roles, claims, orgUnits)
    - Client/App
    - Tenant
    - RiskContext (from Phase 3)
  - خروجی:
    - تصمیم Allow/Deny
    - scopes و claims مجاز
- **Policy Sets per tenant**:
  - Default policies
  - Custom policies per app/scope
- **UI برای Tenant Admin**:
  - Policy list
  - Policy editor (GUI ساده، نه DSL متنی کامل)
  - Policy simulation / test

### 1.3 عمداً چه چیزهایی در Phase 7 نیست

فعلاً نمی‌زنیم:

- DSL پیچیده شبیه Rego/OPA
- Graph-based relationship permission (مثل Zanzibar)
- Full-blown "entitlements" product مستقل

Phase 7 فقط:

- Policy Engine ساختارمند، قابل‌مدیریت، قابل‌توضیح در RFP  
- با complexity کنترل‌شده، ولی کفایت‌دار برای Enterprise.

---

## 2. معماری و ماژول‌ها

### 2.1 ماژول Authorization/Policy

اضافه کن:

- `Onesign.Modules.Authorization` (یا اگر قبلاً ماژول Policy داری، این فاز آن را بزرگ می‌کند.)

ساختار:

```text
Onesign.Modules.Authorization/
  Domain/
    Entities/
      PolicyDefinition.cs
      PolicyConditionGroup.cs
      PolicyCondition.cs
      PolicyTarget.cs
      PolicyAssignment.cs
    Enums/
      PolicyEffect.cs          // Allow, Deny
      PolicyTargetType.cs      // Application, Scope, TenantFeature
      ConditionOperator.cs     // Equals, NotEquals, In, NotIn, GreaterOrEqual, LessOrEqual
      ConditionLogicalOperator.cs // And, Or
      AttributeSourceType.cs   // UserClaim, UserRole, OrgUnit, Tenant, Client, RiskContext
    Services/
      IPolicyEvaluationService.cs
      IPolicyDefinitionService.cs
    Repositories/
      IPolicyDefinitionRepository.cs
      IPolicyAssignmentRepository.cs
  Application/
    DTOs/
      PolicyDefinitionDto.cs
      PolicyConditionGroupDto.cs
      PolicyConditionDto.cs
      PolicyTargetDto.cs
      CreateOrUpdatePolicyRequest.cs
      PolicyTestRequestDto.cs
      PolicyTestResultDto.cs
    Commands/
      CreateOrUpdatePolicyDefinitionCommand.cs
      DeletePolicyDefinitionCommand.cs
      ReorderPolicyDefinitionsCommand.cs
      AssignPolicyToTargetCommand.cs
      UnassignPolicyFromTargetCommand.cs
      TestPolicyCommand.cs
    Queries/
      GetPoliciesQuery.cs
      GetPolicyDetailsQuery.cs
      GetPolicyAssignmentsQuery.cs
  Infrastructure/
    EfCore/Entities/
      PolicyDefinitionEntity.cs
      PolicyConditionGroupEntity.cs
      PolicyConditionEntity.cs
      PolicyTargetEntity.cs
      PolicyAssignmentEntity.cs
    EfCore/Configurations/
      PolicyDefinitionEntityTypeConfiguration.cs
      PolicyConditionGroupEntityTypeConfiguration.cs
      PolicyConditionEntityTypeConfiguration.cs
      PolicyTargetEntityTypeConfiguration.cs
      PolicyAssignmentEntityTypeConfiguration.cs
    EfCore/Repositories/
      PolicyDefinitionRepository.cs
      PolicyAssignmentRepository.cs


2.2 مدل Policy

PolicyDefinition

public class PolicyDefinition
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }

    public string Name { get; private set; }
    public string Description { get; private set; }

    public PolicyEffect Effect { get; private set; }  // Allow or Deny
    public int Priority { get; private set; }          // smaller = evaluated earlier

    public ICollection<PolicyConditionGroup> ConditionGroups { get; private set; }
}


منطق:

اگر هر ConditionGroup → true شود، Policy match شده است.

سپس Effect اعمال می‌شود.

PolicyConditionGroup

public class PolicyConditionGroup
{
    public Guid Id { get; private set; }
    public Guid PolicyDefinitionId { get; private set; }

    public ConditionLogicalOperator LogicalOperator { get; private set; } // And, Or
    public ICollection<PolicyCondition> Conditions { get; private set; }
}


PolicyCondition

public class PolicyCondition
{
    public Guid Id { get; private set; }
    public Guid ConditionGroupId { get; private set; }

    public AttributeSourceType SourceType { get; private set; }    // UserRole, OrgUnit, RiskContext, ...
    public string SourceKey { get; private set; }                  // claim type, orgUnitCode, riskProperty name
    public ConditionOperator Operator { get; private set; }        // Equals, In, ...
    public string Value { get; private set; }                      // stored as string, parsed based on Source
}


PolicyTarget

public class PolicyTarget
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }

    public PolicyTargetType TargetType { get; private set; }  // Application, Scope, TenantFeature
    public string TargetKey { get; private set; }             // e.g. application clientId, scope name, feature key
}


PolicyAssignment

public class PolicyAssignment
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }
    public Guid PolicyDefinitionId { get; private set; }
    public Guid PolicyTargetId { get; private set; }

    public int Order { get; private set; }                   // evaluation order per target
}

3. Epics و User Storyها – Phase 7
Epic 1 – Policy Engine (Backend)
US 1.1 – تعریف Policy per tenant

به عنوان Tenant Admin
می‌خواهم Policyهای متنی و ساختارمند تعریف کنم
تا بتوانم access را بر اساس رول، سازمان، و context کنترل کنم.

Acceptance:

PolicyDefinition:

Name, Description

Effect (Allow/Deny)

Priority

ConditionGroups شامل Conditions

حداقل AttributeSourceTypeهای زیر پشتیبانی شوند:

UserRole (role name)

OrgUnit (code or id)

UserClaim (email, department, country)

RiskContext (RiskLevel) (از Phase 3)

Client (Application type یا Id)

Operators حداقل:

Equals, NotEquals

In, NotIn

GreaterOrEqual, LessOrEqual (مثلا برای RiskScore)

US 1.2 – اتصال Policy به Application / Scope

به عنوان Tenant Admin
می‌خواهم برای هر application یا scope policyهای اختصاصی تعریف کنم
تا برخی appها سختگیرانه‌تر باشند.

Acceptance:

PolicyTarget:

TargetType = Application, TargetKey = clientId

TargetType = Scope, TargetKey = scope name

PolicyAssignment:

لیست policyها per target با Order

مثال:

"App Finance-Portal":

Policy 1: Deny اگر UserRole in {External}

Policy 2: Allow اگر OrgUnit in {Finance} AND RiskLevel <= Medium

US 1.3 – Evaluation Engine

به عنوان سیستم
می‌خواهم هنگام login/token issuance، Policy مانند یک engine مرکزی تصمیم بگیرد
تا همه‌ی تصمیم‌های authorization سازگار و قابل‌ردگیری باشند.

Acceptance:

Service: IPolicyEvaluationService:

public interface IPolicyEvaluationService
{
    Task<PolicyDecision> EvaluateAsync(PolicyEvaluationContext context);
}


Context:

TenantId

UserId

Roles

Claims

OrgUnits

Client/Application

RequestedScopes

RiskLevel / RiskScore

خروجی PolicyDecision:

IsAllowed

DeniedReasonCode (در صورت عدم اجازه)

AllowedScopes (subset of requested)

ExtraClaimsToAdd (optional)

منطق:

Policyها به ترتیب Priority/Order بررسی شوند.

وقفه بعد از اولین Deny یا Allow مطابق طراحی (مثلاً "first match wins" یا "deny overrides allow" – در این فاز: Deny بر Allow ارجح است.)

Epic 2 – Integration with Authentication & Token Pipeline
US 2.1 – اعمال Policy روی Login و Token

به عنوان سیستم
می‌خواهم هنگام ورود و گرفتن token، Policy را اجرا کنم
تا user فقط به چیزی که مجاز است دسترسی داشته باشد.

Acceptance:

در Authorization Code + PKCE flow (Phase 1):

بعد از احراز هویت user و قبل از issue token:

صدا زدن IPolicyEvaluationService برای app و scopes درخواست شده.

اگر IsAllowed == false:

خطای مناسب OAuth2 برگردد (مثلاً access_denied با error_description قابل‌نمایش).

اگر AllowedScopes subset از requested باشد:

فقط همان scopes در token ثبت شوند.

در Federation login (SAML/OIDC – Phase 4):

بعد از JIT provisioning و پیش از token issuance:

Policy evaluation با context کامل (roles, orgUnits, risk, ...)

Epic 3 – Policy Management UI (Tenant)
US 3.1 – لیست Policyها

به عنوان Tenant Admin
می‌خواهم تمام Policyهای tenant را ببینم
تا بتوانم آن‌ها را manage کنم.

Acceptance:

صفحه /tenant/policies

جدول:

Name

Effect (Allow/Deny)

Priority

تعداد Targets

وضعیت (Active/Disabled اگر آینده خواستی اضافه کنی – در این فاز فیلد Active هم می‌توان اضافه کرد.)

US 3.2 – Policy Editor (GUI ساده)

به عنوان Tenant Admin
می‌خواهم بدون نوشتن DSL، به صورت visual یک Policy بسازم
تا تیم غیر‌فنی هم بتواند policyهای ساده را مدیریت کند.

Acceptance:

فرم create/edit:

Name, Description

Effect (Allow/Deny)

Priority

ConditionGroups:

LogicalOperator (AND/OR)

List of Conditions:

AttributeSourceType (UserRole, OrgUnit, UserClaim, RiskContext, Client)

SourceKey (مثلا "role", "department", "country", "RiskLevel")

Operator (Equals/In/NotIn/…)

Value (input با validation ساده)

ارتباط با Target:

انتخاب:

Applications → checkbox list

Scopes → multi-select

ساخت PolicyAssignment ها

US 3.3 – Policy Test / Simulation

به عنوان Tenant Admin
می‌خواهم بتوانم بدون تاثیر روی کاربر واقعی، یک Policy را test کنم
تا مطمئن شوم قبل از rollout درست کار می‌کند.

Acceptance:

فرم Test:

انتخاب user (یا وارد کردن fake attributes)

انتخاب application و scopes

انتخاب RiskLevel (Low/Medium/High)

backend:

endpoint تست، از IPolicyEvaluationService استفاده می‌کند ولی واقعی token صادر نمی‌کند.

خروجی:

Allow / Deny

scopes مجاز

کدام Policy match شد (name/id)

Epic 4 – Default Policies & Safety
US 4.1 – Default Policy Behaviors

به عنوان سیستم
می‌خواهم در tenantهایی که Policy تعریف نکرده‌اند، رفتار پیش‌فرض مشخص و امن باشد
تا کار خراب نشود.

Acceptance:

اگر هیچ Policy برای target (app/scope) تعریف نشده:

رفتار: Allow بر اساس RBAC پایه (roles → app access) مثل قبل.

اگر Policyها تعریف شده‌اند:

Policy Engine تصمیم می‌گیرد.

Deny همیشه باید audit شود (Phase 6).

US 4.2 – Migration رفتار قدیمی

به عنوان سیستم
نمی‌خواهم با فعال شدن Policy Engine، سیستم‌های قبلی بشکنند
تا rollout بدون ریسک باشد.

Acceptance:

فاز rollout:

flag per tenant: PolicyEngineEnabled

در این Phase 7:

پرچم را اضافه کن

default = false برای tenantهای موجود

UI:

در Tenant Settings گزینه روشن کردن Policy Engine.

وقتی خاموش است:

رفتار قبلی (RBAC ساده)

وقتی روشن شد:

همه تصمیم‌ها از طریق Policy Evaluation.

4. Dev Tasks – Backend
4.1 Database و Entities

Task B7-1 – اضافه کردن Entities و DbSet ها

اضافه Entities:

PolicyDefinitionEntity

PolicyConditionGroupEntity

PolicyConditionEntity

PolicyTargetEntity

PolicyAssignmentEntity

اضافه DbSet ها در OnesignDbContext.

Task B7-2 – EF Configurations

PolicyDefinition:

index روی (TenantId, Name)

index روی (TenantId, Priority)

PolicyTarget:

unique index (TenantId, TargetType, TargetKey)

PolicyAssignment:

index (TenantId, PolicyTargetId, Order)

Task B7-3 – Migration Phase 7

ایجاد جداول Authorization/Policy

افزودن ستون PolicyEngineEnabled به جدول TenantConfig یا معادل آن.

4.2 Services – PolicyDefinition & Evaluation

Task B7-4 – پیاده‌سازی IPolicyDefinitionService

مدیریت create/update/delete PolicyDefinition:

validate:

ConditionGroups خالی نباشد

Conditions معتبر باشند

مدیریت assignments:

AssignPolicyToTarget

UnassignPolicyFromTarget

ReorderPolicyDefinitions per target.

Task B7-5 – پیاده‌سازی IPolicyEvaluationService

Input:

PolicyEvaluationContext (TenantId, User, Client, RequestedScopes, RiskContext)

Behavior:

اگر PolicyEngineEnabled == false:

return decision که رفتار قبلی را mirror کند (مثلاً Allow همه requestedScopes که RBAC اجازه می‌دهد).

اگر true:

resolve PolicyTargets برای app/scopes

load PolicyAssignments per target

evaluate به ترتیب Priority/Order:

evaluate ConditionGroups:

AND/OR logic

Condition evaluation بر اساس AttributeSourceType و Operator

ترکیب Allow/Deny:

Deny بر Allow ارجح

اگر هیچ Policy match نشد → fallback به RBAC پایه

پرکردن PolicyDecision:

IsAllowed

AllowedScopes

DeniedReasonCode

MatchedPolicyIds

4.3 API Endpoints – Tenant Policy Management

Base: /api/tenant/policies

Task B7-6 – Policy CRUD

GET /api/tenant/policies

لیست PolicyDefinitionDto per tenant

GET /api/tenant/policies/{id}

جزئیات شامل ConditionGroups و Conditions

POST /api/tenant/policies

CreateOrUpdatePolicyRequest (برای create)

PUT /api/tenant/policies/{id}

CreateOrUpdatePolicyRequest (برای update)

DELETE /api/tenant/policies/{id}

Task B7-7 – Policy Assignments

GET /api/tenant/policies/assignments

لیست mapping بین policies و targets

POST /api/tenant/policies/{id}/assignments

AssignPolicyToTargetCommand

DELETE /api/tenant/policies/assignments/{assignmentId}

POST /api/tenant/policies/assignments/reorder

ReorderPolicyDefinitionsCommand per target

Task B7-8 – Policy Test Endpoint

POST /api/tenant/policies/test

Body: PolicyTestRequestDto

userId (optional)

user roles/claims/orgUnits (override optional)

clientId

requestedScopes

riskLevel

Output: PolicyTestResultDto

IsAllowed

AllowedScopes

DeniedReasonCode

MatchedPolicies

4.4 Integration with Auth Pipeline

Task B7-9 – AuthServer Integration

در ماژول Auth (مربوط به Phase1/3/4):

در flowهای:

Authorization Code + PKCE

Client Credentials (اگر داری)

Federation logins

قبل از issue token:

ساخت PolicyEvaluationContext

فراخوانی IPolicyEvaluationService

اگر Deny:

access_denied یا خطای مناسب

IAuditWriter → AuditEvent با Category = Security, Action = "Policy.Deny"

اگر AllowedScopes subset شد:

همان subset را در token قرار بده.

Task B7-10 – Audit Integration

هر بار که Policy evaluation انجام می‌شود:

در صورت Deny:

ثبت AuditEvent با:

Action: "Policy.Deny"

DataJson: شامل app, scopes, matched policy id

در صورت Allow:

optional: ثبت event در سطح پایین‌تر، مثلاً فقط اگر feature debug روشن است.

5. Dev Tasks – Frontend (Admin Portal)
5.1 – Tenant Policy List & Detail

Task F7-1 – صفحه /tenant/policies

جدول:

Name

Effect (badge: Allow/Deny)

Priority

TargetsCount

دکمه:

New Policy

Edit / Delete

Task F7-2 – صفحه / Modal Policy Editor

فرم:

Name, Description

Effect dropdown

Priority

ConditionGroups UI:

هر group:

LogicalOperator: AND/OR

لیست Conditions:

AttributeSourceType:

dropdown: UserRole, OrgUnit, UserClaim, RiskLevel, Client

SourceKey:

برای UserRole: ثابت "role"

برای OrgUnit: "orgUnitCode"

برای RiskLevel: "RiskLevel"

برای UserClaim: قابل وارد کردن (مثلاً "department")

Operator: Equals, NotEquals, In, NotIn, ...

Value: text/multi-select

Target selection:

Applications:

لیست Applications موجود (فراخوانی API از Module Applications)

checkbox multi-select

Scopes:

لیست scopes استاندارد (از config/Auth module)

همه متن‌ها دو زبانه با i18n.

5.2 – Policy Test UI

Task F7-3 – پنجره Test Policy

از صفحه Policy Editor:

دکمه "Test Policy"

فرم:

انتخاب user از tenant (dropdown search)

یا وارد کردن:

roles

orgUnits

country/department (claims)

انتخاب application

انتخاب scopes

انتخاب RiskLevel

نمایش نتیجه:

Allow / Deny

AllowedScopes

MatchedPolicies (نام و id)

5.3 – Tenant Settings: PolicyEngine Toggle

Task F7-4 – Switch Policy Engine

در صفحه Tenant Settings:

Switch: "Policy Engine (advanced authorization)"

توضیح:

وقتی خاموش:

سیستم مثل قبل فقط RBAC ساده را اجرا می‌کند.

وقتی روشن:

همه تصمیم‌های auth/scopes از طریق Policy Engine.

API:

PUT /api/tenant/settings/security (یا endpoint مناسب موجود) → فیلد PolicyEngineEnabled.

6. Cross-cutting Tasks

Task X7-1 – Localization

تمام خطاها و labels مربوط به Policy (مثلاً "Scope denied due to policy") باید message code داشته باشند.

i18n در UI: فارسی/انگلیسی.

Task X7-2 – Observability Integration (Phase 6)

Search در Observability:

Category جدید: Authorization

Actions:

"Policy.Created"

"Policy.Updated"

"Policy.Deleted"

"Policy.Assigned"

"Policy.Unassigned"

"Policy.Deny"

این‌ها در Activity / Audit Log tenant و global دیده شوند.

Task X7-3 – Performance

Evaluation:

cache policy definitions per tenant در memory (با invalidation هنگام تغییر).

evaluation در هر login باید خفیف باشد و با چند ده policy/condition هم قابل قبول بماند.

مراقبت از N+1 query:

هنگام Evaluation، همه Policyها را در یک بار load کن، نه در هر request جدا.

Task X7-4 – Safety & Debuggability

اگر در Evaluation exception خورد:

fallback امن: Deny with clear error.

log + AuditEvent.

ابزار debug:

از طریق Policy Test endpoint/ UI، admin بتواند رفتار را بازتولید کند.

7. نکات طراحی Phase 7

Policy Engine اگر کثیف پیاده شود، تبدیل می‌شود به جهنم دِباک و support.

Ruleها را ساده نگه دار:

no nested condition trees beyond یک سطح group + conditions.

Deny باید همیشه audit شود؛ این مهم‌ترین data برای تیم security است.

PolicyEngineEnabled را جدی بگیر؛ rollout بدون این flag یعنی احتمالا خودت اولین قربانی می‌شوی.