# onesign – Phase 15 Identity Lifecycle Automation (Joiner / Mover / Leaver)

## 1. محدوده Phase 15

### 1.1 هدف کلی

Phase 15 تمرکز دارد روی تبدیل onesign از یک سیستم "access control" به یک **سیستم کامل Identity Lifecycle**:

- Joiner
  - وقتی کارمند جدیدی در HR سیستم ثبت می‌شود:
    - حسابش در onesign و downstream apps ساخته شود
    - baseline access بر اساس OrgUnit / JobRole / Location به صورت خودکار داده شود
- Mover
  - وقتی فردی نقش/دپارتمان/سازمان عوض می‌کند:
    - دسترسی‌های قدیمی غیرمرتبط جمع شود
    - دسترسی‌های جدید مرتبط داده شود
- Leaver
  - وقتی کارمندی ترک سازمان می‌کند:
    - session‌ها و tokens قطع شوند
    - حساب disable / deprovision شود
    - از همه SCIM targetها حذف شود

بدون این فاز، کل PolicyEngine / AccessRequests / Governance هنوز نیمه‌اتوماتیک است.

### 1.2 personas

- **HR System / HR Integration Owner**
  - می‌خواهد:
    - هویت‌ها از HR به onesign “source of truth” منتقل شوند
    - بدون دستکاری دستی، کارمندها join/move/leave شوند

- **Identity Admin / IGA Owner**
  - می‌خواهد:
    - Policy تعریف کند:
      - برای JobRole X و OrgUnit Y چه access packageهایی اعطا شوند
    - در صورت conflict یا SoD violation، alert و workflow داشته باشد

- **Tenant Admin / Security Officer**
  - می‌خواهد:
    - مطمئن باشد هیچ Leaver فعالی token و access ندارد
    - بتواند ببیند هر access از چه lifecycle eventی آمده

---

## 2. معماری و ماژول جدید

### 2.1 ماژول: Lifecycle / IdentityLifecycle

ماژول جدید:

- `Onesign.Modules.IdentityLifecycle`

مسئولیت‌ها:

- HR Connectors:
  - Inbound from:
    - HR CSV / SFTP (در این فاز مینیمال)
    - Generic SCIM inbound connector
- Lifecycle Engine:
  - تحلیل changeهای HR record و تبدیل به:
    - JoinerEvent
    - MoveEvent
    - LeaverEvent
- Lifecycle Policies:
  - Mapping از:
    - OrgUnit, JobRole, EmploymentType, Location
  - به:
    - AccessPackageها (مجموعه Roles/Apps/Policies)
- Event Dispatcher:
  - اعمال تغییرات:
    - ساخت/آپدیت User در onesign
    - call Federation / SCIM outbound (Phase 4)
    - call PolicyEngine (Phase 7) برای assign/unassign roles
    - trigger Governance/AccessReview در صورت تغییر مهم

### 2.2 مفاهیم کلیدی

- **HRIdentityRecord**
  - اطلاعات خام از HR:
    - ExternalId (مثلا EmployeeId)
    - FirstName / LastName / Email
    - OrgUnitCode
    - JobRole / Position
    - ManagerExternalId
    - EmploymentStatus (Active, OnLeave, Terminated)
    - StartDate / EndDate
- **LifecycleEvent**
  - Joiner:
    - HR record جدید (Active, StartDate <= امروز) و هنوز tenant user ندارد
  - Mover:
    - تغییر در OrgUnit / JobRole / Manager
  - Leaver:
    - EmploymentStatus = Terminated یا EndDate در گذشته

- **AccessPackage**
  - بسته‌ای از:
    - Roles
    - Application access
    - Optional policies (MFA, risk level)
  - نام مثل:
    - "Finance-Analyst-Base"
    - "IT-Admin-Core"

---

## 3. Epics و User Storyها – Phase 15

### Epic 1 – HR Inbound Connectors

#### US 15.1 – HR CSV Import (Batch)

به عنوان Identity Admin  
می‌خواهم بتوانم یک فایل CSV با لیست کارمندان را به onesign بدهم  
تا سیستم خودش Joiner/Mover/Leaver را تشخیص دهد.

Acceptance:

- Endpoint or job:
  - `/api/tenant/lifecycle/hr/csv-import`
- فرمت CSV:
  - EmployeeId, FirstName, LastName, Email, OrgUnitCode, JobRole, ManagerEmployeeId, EmploymentStatus, StartDate, EndDate
- Behavior:
  - parse و validate
  - ذخیره HRIdentityRecordها
  - تولید LifecycleEventها:
    - New active → Joiner
    - Changed OrgUnit/JobRole → Mover
    - Terminated → Leaver
  - Queue کردن events برای پردازش

#### US 15.2 – Generic SCIM Inbound Endpoint

به عنوان سازمانی که HR دارد ولی SCIM پشتیبانی می‌کند  
می‌خواهم HR من به عنوان SCIM Provider به onesign وصل شود  
تا مستقیم هویت‌ها را push کند.

Acceptance:

- Endpoint:
  - `/scim/v2/Users` (inbound)
- Behavior:
  - Map SCIM User به HRIdentityRecord
  - تولید Joiner/Mover/Leaver based on:
    - active flag
    - department, title, manager, etc.

(در این فاز لازم نیست full SCIM provider باشی، اما باید baseline create/update/deactivate را داشته باشی.)

---

### Epic 2 – Lifecycle Policies & Access Packages

#### US 15.3 – تعریف AccessPackage

به عنوان Identity Admin  
می‌خواهم AccessPackageها را تعریف کنم  
تا بتوانم Role/App/policy را به صورت یک واحد به lifecycle وصل کنم.

Acceptance:

- Entity: AccessPackage
  - Id, Name, Description
  - Roles: لیست RoleIds
  - Applications: لیست ApplicationClientIds
- API:
  - `POST /api/tenant/lifecycle/access-packages`
  - `GET /api/tenant/lifecycle/access-packages`
  - `PUT /api/tenant/lifecycle/access-packages/{id}`
  - `DELETE /api/tenant/lifecycle/access-packages/{id}` (soft delete)

#### US 15.4 – LifecyclePolicy per OrgUnit/JobRole

به عنوان Identity Admin  
می‌خواهم policy بگذارم که مثلا  
«هر کسی با JobRole = 'Sales.Rep' در OrgUnit = 'DE' این AccessPackageها را بگیرد»  
تا Joiner/Mover خودکار دسترسی درست بگیرند.

Acceptance:

- Entity: LifecyclePolicy
  - TenantId
  - Conditions:
    - OrgUnitCode (optional)
    - JobRole (optional)
    - Location (optional)
    - EmploymentType (optional)
  - AssignedAccessPackages: list
- API:
  - `POST /api/tenant/lifecycle/policies`
  - `GET /api/tenant/lifecycle/policies`
  - `PUT /api/tenant/lifecycle/policies/{id}`
  - `DELETE /api/tenant/lifecycle/policies/{id}`

- Evaluation:
  - روی Joiner/Mover, HRIdentityRecord را می‌گیرد
  - matched policies → مجموعه AccessPackageها

---

### Epic 3 – Lifecycle Engine (Joiner / Mover / Leaver Processing)

#### US 15.5 – Joiner Processing

به عنوان سیستم  
می‌خواهم وقتی JoinerEvent می‌آید:  
- User در onesign ساخته شود  
- AccessPackageهای مربوطه assign شود  
- provisioning به apps انجام شود  

Acceptance:

Joiner flow:

- Input: JoinerEvent (با HRIdentityRecord)
- Steps:
  1. اگر هنوز GlobalUser/TenantUser ندارد:
     - ساخت GlobalUser (اگر مدل تو دو سطحی است)
     - ساخت TenantUser در tenant
  2. Map HR attributes به:
     - OrgUnit (Phase 2)
     - JobRole entity (اگر داری) یا Claim custom
  3. Evaluate LifecyclePolicy:
     - لیست AccessPackageها را پیدا کن
  4. برای هر AccessPackage:
     - از PolicyEngine (Phase 7) بخواه Roles را assign کند
     - از Federation/SCIM (Phase 4) بخواه provisioning انجام دهد
  5. Audit:
     - "Lifecycle.JoinerProcessed"
  6. Notification:
     - NotificationCenter (Phase 11):
       - به Manager یا SecurityOfficer بگو joiner انجام شد (configurable)

#### US 15.6 – Mover Processing (Change of Org/Role)

به عنوان سیستم  
می‌خواهم وقتی HR می‌گوید شخصی OrgUnit/JobRoleش عوض شده:  
- AccessPackageهای قدیمی غیرمرتبط جمع شود  
- AccessPackageهای جدید اعطا شود  

Acceptance:

Mover flow:

- Input: MoverEvent با old HR snapshot و new HR snapshot
- Steps:
  1. Evaluate LifecyclePolicy برای old و new وضعیت
  2. diff:
     - toRemove = packagesOld - packagesNew
     - toAdd = packagesNew - packagesOld
  3. برای toRemove:
     - revoke roles via PolicyEngine
     - SCIM / Federation deprovision در targetها
  4. برای toAdd:
     - assign roles
     - provision
  5. Audit:
     - "Lifecycle.MoverProcessed"
  6. Optional:
     - اگر SoD violation ایجاد شد → Governance/SoD (Phase 10) را call کن:
       - mark violation یا require manual review

#### US 15.7 – Leaver Processing

به عنوان سیستم  
می‌خواهم وقتی شخصی Leaver شد (Terminated یا EndDate گذشته):  
- همه sessionها، tokens و accessها قطع شوند  
- از target systems حذف یا disable شود

Acceptance:

Leaver flow:

- Input: LeaverEvent
- Steps:
  1. Disable TenantUser (و شاید GlobalUser اگر هیچ tenant دیگری ندارد)
  2. Revoke active sessions/tokens (OIDC session mgmt, refresh tokens invalidation)
  3. Call PolicyEngine / Authorization:
     - remove role assignments
  4. Federation/SCIM:
     - disable/delete user در target systems
  5. Notification:
     - به Manager و SecurityOfficer (Optional)
  6. Audit:
     - "Lifecycle.LeaverProcessed"

---

### Epic 4 – Lifecycle Monitoring و UI

#### US 15.8 – Lifecycle Events Timeline

به عنوان Identity Admin  
می‌خواهم برای هر User یک timeline از Joiner/Mover/Leaver داشته باشم  
تا بدانم هر access از کجا آمده.

Acceptance:

- UI در Admin Portal:
  - User details → tab "Lifecycle"
- Backend API:
  - `GET /api/tenant/lifecycle/users/{userId}/events`
- نمایش:
  - JoinerEvent timestamp و details
  - MoverEvents با تغییرات (from → to)
  - LeaverEvent با دلیل (اگر از HR آمده)

#### US 15.9 – Lifecycle Processing Queue & Status

به عنوان IGA Owner  
می‌خواهم بدانم queue پردازش lifecycle خوب کار می‌کند یا نه  
تا اگر stuck شد، بفهمم.

Acceptance:

- Queue (background jobs) برای پردازش events
- API:
  - `GET /api/tenant/lifecycle/processing-status`
    - last processed time
    - count of pending events
    - number of failed events
- UI ساده در Admin Portal:
  - card یا page برای lifecycle processing health

---

## 4. Dev Tasks – Backend

### 4.1 Data Model & Entities

**Task B15-1 – HRIdentityRecord & LifecycleEvent Entities**

ایجاد در `Onesign.Modules.IdentityLifecycle.Domain`:

- `HRIdentityRecord`
  - TenantId
  - ExternalEmployeeId
  - FirstName, LastName
  - Email
  - OrgUnitCode
  - JobRole
  - ManagerExternalEmployeeId
  - EmploymentStatus (Active, OnLeave, Terminated)
  - StartDate, EndDate
  - LastSyncedAt

- `LifecycleEvent`
  - Id
  - TenantId
  - HRIdentityRecordId
  - EventType (Joiner, Mover, Leaver)
  - OldSnapshot (json)
  - NewSnapshot (json)
  - Status (Pending, Processed, Failed)
  - ErrorMessage
  - CreatedAt
  - ProcessedAt

**Task B15-2 – AccessPackage & LifecyclePolicy Entities**

در همان ماژول:

- `AccessPackage`
  - Id
  - TenantId
  - Name
  - Description
  - IsEnabled
- `AccessPackageRole` / `AccessPackageApplication`
- `LifecyclePolicy`
  - Id
  - TenantId
  - Name
  - Condition fields:
    - OrgUnitCode (nullable)
    - JobRole (nullable)
    - Location (nullable)
    - EmploymentType (nullable)
  - Navigation to AccessPackages

EF mappings و migration مربوطه.

### 4.2 HR Connectors

**Task B15-3 – CSV Import Handler**

- Endpoint:
  - `POST /api/tenant/lifecycle/hr/csv-import`
- Steps:
  - Parse CSV
  - For each row:
    - Upsert HRIdentityRecord
    - Detect Joiner/Mover/Leaver by comparing with previous record
    - Enqueue LifecycleEvent

**Task B15-4 – SCIM Inbound Controller (Minimal)**

- Basic SCIM `/scim/v2/Users` implementation:
  - `POST` create
  - `PATCH/PUT` update
  - `DELETE` deactivate
- Map به HRIdentityRecord + LifecycleEvent

### 4.3 Lifecycle Engine

**Task B15-5 – LifecyclePolicyEvaluator Service**

- Interface:
  - `I​LifecyclePolicyEvaluator`
    - `Task<IReadOnlyList<AccessPackage>> EvaluateAsync(HRIdentityRecord record)`
- Implementation:
  - match policies by:
    - OrgUnitCode / JobRole / Location / EmploymentType
  - allow multiple matches

**Task B15-6 – LifecycleProcessor Service**

- Service:
  - `I​LifecycleProcessor`
    - `Task ProcessEventAsync(LifecycleEvent @event)`

Joiner:

- create TenantUser & link to GlobalUser (استفاده از User module موجود)
- call PolicyEngine/Authorization to assign roles from AccessPackages
- call Federation/SCIM outbound (Phase 4) برای provisioning

Mover:

- evaluate policies old/new
- diff packages to add/remove
- call Authorization + Federation accordingly

Leaver:

- disable user
- revoke tokens & sessions
- remove roles
- outbound deprovision

**Task B15-7 – Background Worker / Queue**

- Queue table یا message queue integration:
  - LifecycleEvent با Status = Pending
- Background service:
  - fetch batch
  - call LifecycleProcessor
  - update Status and ProcessedAt
  - log errors و set Status = Failed با ErrorMessage

### 4.4 APIs برای AccessPackage و LifecyclePolicy

**Task B15-8 – AccessPackage APIs**

- `GET /api/tenant/lifecycle/access-packages`
- `GET /api/tenant/lifecycle/access-packages/{id}`
- `POST /api/tenant/lifecycle/access-packages`
- `PUT /api/tenant/lifecycle/access-packages/{id}`
- `DELETE /api/tenant/lifecycle/access-packages/{id}` (soft delete)

**Task B15-9 – LifecyclePolicy APIs**

- `GET /api/tenant/lifecycle/policies`
- `GET /api/tenant/lifecycle/policies/{id}`
- `POST /api/tenant/lifecycle/policies`
- `PUT /api/tenant/lifecycle/policies/{id}`
- `DELETE /api/tenant/lifecycle/policies/{id}`

### 4.5 Lifecycle Monitoring APIs

**Task B15-10 – User Lifecycle Timeline API**

- `GET /api/tenant/lifecycle/users/{userId}/events`
  - برگرداند:
    - list از LifecycleEventDto همراه با:
      - EventType
      - CreatedAt
      - خلاصه تغییرات

**Task B15-11 – Processing Status API**

- `GET /api/tenant/lifecycle/processing-status`
  - lastProcessedAt
  - pendingCount
  - failedCount (last N hours/days)

---

## 5. Dev Tasks – Frontend / Admin Portal

### 5.1 Lifecycle Management UI

**Task F15-1 – AccessPackages UI**

مسیر: `/tenant/lifecycle/access-packages`

- لیست:
  - Name
  - Description
  - Enabled
  - Count roles/apps
- فرم create/edit:
  - انتخاب roles از Authorization module
  - انتخاب apps از Applications module

**Task F15-2 – LifecyclePolicies UI**

مسیر: `/tenant/lifecycle/policies`

- لیست:
  - Name
  - Conditions (OrgUnit/JobRole/Location)
  - Packages count
- فرم:
  - انتخاب OrgUnit (از OrgHierarchy)
  - JobRole (string یا dropdown)
  - انتخاب AccessPackages

### 5.2 HR Import & Monitoring UI

**Task F15-3 – HR Import Page**

مسیر: `/tenant/lifecycle/hr-import`

- آپلود CSV
- مشاهده آخرین importها:
  - timestamp
  - count records
  - count Joiner/Mover/Leaver events تولید شده

**Task F15-4 – Lifecycle Status Widget**

مسیر: مثلا `/tenant/lifecycle/status` یا section در Governance/Security:

- نمایش:
  - pending events
  - failed events
  - last processed time

### 5.3 User Lifecycle Tab

**Task F15-5 – User Lifecycle Tab**

- در صفحه User Detail:
  - tab "Lifecycle"
- نمایش:
  - timeline events:
    - Joiner
    - Moves (با OrgUnit/Role changes)
    - Leaver
  - clickable برای دیدن details

---

## 6. Cross-cutting Tasks

**Task X15-1 – Integration با PolicyEngine و Authorization**

- تمام role assignment/unassignment از طریق سرویس‌های Phase 7 انجام شود، نه دستکاری مستقیم DB.
- AccessPackages باید نقش‌ها را از مدل رسمی role/permission بخوانند.

**Task X15-2 – Integration با Federation/SCIM**

- Provisioning/deprovisioning روی target systems از طریق Federation module (Phase 4):
  - نه این‌که Lifecycle module مستقیم API apps را صدا بزند.

**Task X15-3 – Integration با Governance و SoD**

- هنگام Mover:
  - اگر access جدید، SoD violation ایجاد کرد:
    - Governance module (Phase 10) را notify کن:
      - یا block
      - یا mark violation نیازمند review

**Task X15-4 – Observability و Audit**

- audit events:
  - "Lifecycle.JoinerDetected"
  - "Lifecycle.JoinerProcessed"
  - "Lifecycle.MoverDetected"
  - "Lifecycle.MoverProcessed"
  - "Lifecycle.LeaverDetected"
  - "Lifecycle.LeaverProcessed"
- metrics:
  - joiner/mover/leaver counts
  - processing latency
  - failure rate

**Task X15-5 – Security**

- HR inbound endpoints باید:
  - فقط برای منابع trusted (IP allowlist / API key / mTLS) باز باشند
- SCIM inbound باید:
  - authentication/authorization درست داشته باشد

**Task X15-6 – Localization**

- UI texts:
  - Lifecycle
  - AccessPackage
  - Joiner/Mover/Leaver
- دو زبانه با i18n.

---

## 7. نکات طراحی Phase 15

- این فاز جایی است که onesign از یک "SSO + IAM" به یک **IGA قابل احترام** نزدیک می‌شود.
- اشتباه کشنده:
  - HR sync را نصفه بسازی که فقط user را بسازد اما access روی policy/manual بماند.
  - Leaver را فقط در HR ثبت کنی، ولی sessionها و roles عملا زنده بمانند.

هدف Phase 15:

> هر تغییری در HR روی user، به شکل قابل پیش‌بینی، audit‌پذیر و اتوماتیک روی access در onesign و سیستم‌های مقصد منعکس شود.

اگر بعد از این فاز هنوز برای اضافه کردن کارمند جدید باید دستی role بدهی، یعنی این فاز را اشتباه اجرا کردی.
