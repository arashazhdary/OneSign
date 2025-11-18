1. محدوده Phase 2 – Org Hierarchy & Delegated Admin
1.1. چی اضافه می‌شود؟

برای هر tenant:

ساختار درختی سازمان (OrgUnit)

اتصال Userها به OrgUnit (یک Org اصلی + چند تا فرعی اگر لازم شد)

اتصال Applicationها به OrgUnit (این اپ برای کدام بخش‌ها قابل نمایش/استفاده است)

Delegated Admin:

Tenant Admin سراسری

Sub-admin که فقط روی یک شاخه از درخت سازمانی و زیرشاخه‌هایش اختیار دارد

فیلتر و محدود کردن دید:

لیست userها براساس OrgUnit

لیست appها براساس OrgUnit

پنل admin برای Sub-admin فقط داده‌های Org خودش را ببیند

1.2. چی عمدی اضافه نمی‌شود؟

هنوز اضافه نمی‌کنیم (Phase بعد):

MFA بر اساس OrgUnit

Policy Engine ABAC / Expression based

Rule های پیچیده (مثلا device, geo, risk)

SCIM / SAML / sync با HR

2. تغییرات معماری و Domain
2.1. ماژول جدید

اضافه کن:

Onesign.Modules.Organization

ساختار:

Onesign.Modules.Organization/
  Domain/
    Entities/
      OrgUnit.cs
      UserOrgUnit.cs
      ApplicationOrgUnit.cs
      DelegatedAdminScope.cs
    Enums/
      OrgUnitStatus.cs
      AdminScopeType.cs   // e.g. OrgOnly, OrgAndDescendants
    Services/
      IOrgTreeService.cs
      IOrgAuthorizationService.cs
    Repositories/
      IOrgUnitRepository.cs
      IUserOrgUnitRepository.cs
      IApplicationOrgUnitRepository.cs
      IDelegatedAdminRepository.cs
  Application/
    DTOs/
      OrgUnitDto.cs
      OrgUnitTreeNodeDto.cs
      CreateOrgUnitRequest.cs
      UpdateOrgUnitRequest.cs
      MoveOrgUnitRequest.cs
      AssignUserOrgUnitsRequest.cs
      AssignApplicationOrgUnitsRequest.cs
      DelegatedAdminDto.cs
      CreateDelegatedAdminRequest.cs
    Commands/
      CreateOrgUnitCommand.cs
      UpdateOrgUnitCommand.cs
      MoveOrgUnitCommand.cs
      DeleteOrgUnitCommand.cs
      AssignUserOrgUnitsCommand.cs
      AssignApplicationOrgUnitsCommand.cs
      CreateDelegatedAdminCommand.cs
      RemoveDelegatedAdminCommand.cs
    Queries/
      GetOrgUnitTreeQuery.cs
      GetOrgUnitDetailsQuery.cs
      GetUserOrgUnitsQuery.cs
      GetApplicationOrgUnitsQuery.cs
      GetDelegatedAdminsQuery.cs
  Infrastructure/
    EfCore/Entities/
      OrgUnitEntity.cs
      UserOrgUnitEntity.cs
      ApplicationOrgUnitEntity.cs
      DelegatedAdminScopeEntity.cs
    EfCore/Configurations/
      OrgUnitEntityTypeConfiguration.cs
      UserOrgUnitEntityTypeConfiguration.cs
      ApplicationOrgUnitEntityTypeConfiguration.cs
      DelegatedAdminScopeEntityTypeConfiguration.cs
    EfCore/Repositories/
      OrgUnitRepository.cs
      UserOrgUnitRepository.cs
      ApplicationOrgUnitRepository.cs
      DelegatedAdminRepository.cs

2.2. شکل Entityها (خلاصه)

OrgUnit

public class OrgUnit
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid? ParentId { get; private set; }
    public string Name { get; private set; }      // data, نه متن قابل ترجمه
    public string Code { get; private set; }      // اختیاری، برای HR sync بعدی
    public string Path { get; private set; }      // مثل "001/005/023"
    public int Level { get; private set; }        // 0 = root
    public int SortOrder { get; private set; }
    public OrgUnitStatus Status { get; private set; } // Active / Inactive
}


UserOrgUnit

public class UserOrgUnit
{
    public Guid TenantUserId { get; private set; }
    public Guid OrgUnitId { get; private set; }
    public bool IsPrimary { get; private set; }
}


ApplicationOrgUnit

public class ApplicationOrgUnit
{
    public Guid ApplicationClientId { get; private set; }
    public Guid OrgUnitId { get; private set; }
}


DelegatedAdminScope

public class DelegatedAdminScope
{
    public Guid Id { get; private set; }
    public Guid TenantUserId { get; private set; }   // این یوزر یک admin است
    public Guid OrgUnitId { get; private set; }     // ریشه اختیاراتش
    public AdminScopeType ScopeType { get; private set; } // OrgOnly, OrgAndDescendants
}

2.3. Authorization سطح Org

در Phase 2 قرار نیست کل سیستم را با if-else نابود کنیم. یک سرویس وسط می‌خواهیم:

public interface IOrgAuthorizationService
{
    bool CanManageUser(Guid currentTenantUserId, Guid targetTenantUserId);
    bool CanManageApplication(Guid currentTenantUserId, Guid applicationClientId);
    bool CanViewOrgUnit(Guid currentTenantUserId, Guid orgUnitId);
    OrgScope GetEffectiveScope(Guid currentTenantUserId);
}


Back-end و UI برای تمام عملیات مدیریت User و App از همین استفاده می‌کنند، نه منطق پخش شده.

3. Epics و User Storyها – Phase 2
Epic 1 ساختار سازمانی (Org Tree)
US 1.1 ایجاد ریشه OrgUnit برای هر Tenant

به عنوان System
می‌خواهم برای هر tenant یک OrgUnit ریشه داشته باشم
تا ساختار سازمانی به صورت درختی قابل گسترش باشد.

Acceptance:

برای هر tenant که Phase 1 دارد، یک OrgUnit root ساخته شود:

Name = “Root” یا اسم tenant

Level = 0

Path مثل “000”

این عملیات برای tenantهای جدید هم به صورت خودکار انجام شود.

US 1.2 مدیریت درخت OrgUnit

به عنوان Tenant Admin (سراسری)
می‌خواهم بتوانم OrgUnit های زیرمجموعه را ایجاد، ویرایش، جابه‌جا و حذف کنم
تا ساختار سازمانی را مطابق سازمان واقعی بسازم.

Acceptance:

ایجاد OrgUnit زیر یک Parent:

تعیین Name، SortOrder

تولید Path و Level جدید

ویرایش Name و SortOrder

Move OrgUnit به parent جدید:

آپدیت Path و Level خودش و همه descendantها

حذف:

فقط اگر خالی است (بدون UserOrgUnit و ApplicationOrgUnit)

اگر خالی نیست، با خطای مشخص و قابل فهم رد شود

Epic 2 اتصال Userها به OrgUnit
US 2.1 انتساب OrgUnit به User

به عنوان Tenant Admin
می‌خواهم برای هر user یک OrgUnit اصلی و در صورت نیاز چند OrgUnit اضافی تعریف کنم
تا بتوانم بعداً دسترسی‌ها و دیده‌شدن‌ها را بر اساس سازمان مدیریت کنم.

Acceptance:

هر TenantUser حداقل صفر یا یک OrgUnit primary دارد

امکان افزودن OrgUnitهای اضافی (IsPrimary = false)

در UI:

انتخاب OrgUnit از روی درخت

نمایش OrgUnit اصلی کنار user

US 2.2 فیلتر userها براساس OrgUnit

به عنوان Tenant Admin یا Delegated Admin
می‌خواهم userها را بر اساس OrgUnit فیلتر کنم
تا فقط کاربران مربوط به شاخه مدنظر را ببینم.

Acceptance:

endpoint لیست userها پارامتر orgUnitId بگیرد

فیلتر:

اگر admin سراسری است: userهایی که primary/secondary در آن OrgUnit یا زیرمجموعه‌ها هستند

اگر delegated admin است: محدود به scope خودش (Org و descendants)

در UI یک tree selector برای OrgUnit باشد که روی لیست userها اعمال شود.

Epic 3 اتصال Applications به OrgUnit
US 3.1 انتساب OrgUnit به Application

به عنوان Tenant Admin
می‌خواهم هر Application را به یک یا چند OrgUnit وصل کنم
تا بتوانم بعداً فقط برای بخش‌های مشخص سازمان نمایش دهم.

Acceptance:

هر ApplicationClient می‌تواند به چند OrgUnit وصل شود

UI:

انتخاب OrgUnitها از درخت

نمایش لیست OrgUnitهای مرتبط با هر app

US 3.2 فیلتر Applications براساس OrgUnit

Acceptance:

endpoint لیست applications پارامتر orgUnitId بگیرد

بازگشت فقط مواردی که به آن OrgUnit یا زیرمجموعه‌اش وصل شده‌اند

scoped توسط delegations:

delegated admin فقط appهای در scope خودش را ببیند.

Epic 4 Delegated Admin
US 4.1 تعریف Delegated Admin برای یک شاخه

به عنوان Tenant Admin سراسری
می‌خواهم بتوانم برای یک OrgUnit، delegated admin تعریف کنم
تا مدیر آن بخش فقط userها و appهای همان شاخه را مدیریت کند.

Acceptance:

تعریف DelegatedAdminScope:

انتخاب TenantUser (که نقش Admin دارد)

انتخاب OrgUnit

انتخاب ScopeType: فقط همان Org یا همراه زیرشاخه‌ها

اگر TenantUser delegated admin شد، در UI داشبورد خودش محدود به همان scope باشد.

US 4.2 محدودسازی دید و عملیات Delegated Admin

به عنوان سیستم
می‌خواهم هر delegated admin فقط داده‌های شاخه خودش را ببیند و مدیریت کند
تا از اشتباه یا سوءاستفاده جلوگیری شود.

Acceptance:

وقتی current user یک delegated admin است:

لیست userها → محدود به OrgUnitهای در scope

لیست appها → محدود به OrgUnitهای در scope

درخت OrgUnit → فقط شاخه مربوط، بقیه درخت non-interactive یا hidden

IOrgAuthorizationService تصمیم نهایی را می‌گیرد.

Epic 5 به‌روزرسانی پنل Admin (UI)
US 5.1 صفحه مدیریت درخت سازمانی

به عنوان Tenant Admin
می‌خواهم صفحه‌ای برای نمایش و ویرایش درخت OrgUnit داشته باشم
تا ساختار را به سادگی مدیریت کنم.

Acceptance:

صفحه /tenant/org-units

نمایش درخت کامل

Create / Edit / Move / Delete از طریق UI

همه متن‌ها دو زبانه (en/fa) از طریق i18n

US 5.2 فیلتر OrgUnit در لیست User و App

Acceptance:

صفحه Users:

فیلتر درختی OrgUnit در sidebar یا header

صفحه Apps:

همین فیلتر OrgUnit

Localized labels

US 5.3 صفحه Delegated Admins

Acceptance:

صفحه /tenant/delegated-admins

لیست DelegatedAdminScope ها

فرم ایجاد / حذف

نمایش:

User

OrgUnit

ScopeType

Epic 6 Migration از Phase 1
US 6.1 مهاجرت داده‌های موجود

به عنوان System
می‌خواهم داده‌های Phase 1 (tenant, user, app) بدون شکستن سیستم به مدل جدید OrgUnit منتقل شوند
تا بعد از اعمال OrgUnit چیزی خراب نشود.

Acceptance:

برای هر tenant:

ایجاد یک OrgUnit root

تمام userها → UserOrgUnit با OrgUnit = root، IsPrimary = true

تمام appها → ApplicationOrgUnit با OrgUnit = root

این migration idempotent و امن باشد.

4. Dev Tasks – Backend
4.1. Database و Entities

Task B2-1 اضافه کردن جدول‌ها

اضافه کردن entity و migrations برای:

OrgUnitEntity

UserOrgUnitEntity

ApplicationOrgUnitEntity

DelegatedAdminScopeEntity

تنظیم:

Index روی TenantId, Path

Unique (TenantId, Code) اگر Code وجود دارد

FK ها:

OrgUnit.TenantId → Tenant

UserOrgUnit.TenantUserId → TenantUser

ApplicationOrgUnit.ApplicationClientId → ApplicationClient

DelegatedAdminScope.TenantUserId → TenantUser, OrgUnitId → OrgUnit

Task B2-2 Migration اولیه OrgUnit + backfill

ساخت Migration برای:

ایجاد root OrgUnit برای tenantهای موجود

assign user و app ها به root

تست روی دیتابیس dev

4.2. Domain Services

Task B2-3 پیاده‌سازی IOrgTreeService

متدهای حداقلی:

OrgUnit CreateChild(Guid tenantId, Guid parentId, string name, int sortOrder);
OrgUnit UpdateOrgUnit(Guid orgUnitId, string name, int sortOrder);
void MoveOrgUnit(Guid orgUnitId, Guid newParentId);
void DeleteOrgUnit(Guid orgUnitId); // همراه چک‌های ایمنی
Task<IReadOnlyList<OrgUnit>> GetTreeForTenant(Guid tenantId);


Task B2-4 پیاده‌سازی IOrgAuthorizationService

استفاده از DelegatedAdminScope + TenantUser نقش admin:

تشخیص admin سراسری (TenantAdmin بدون Scope)

تشخیص delegated admin و محدوده‌ی OrgUnitهای مجاز

متدهای CanManageUser, CanManageApplication, CanViewOrgUnit, GetEffectiveScope کاملا پیاده شوند.

4.3. Application Layer

Task B2-5 Commands و Queries OrgUnit

CreateOrgUnitCommand

UpdateOrgUnitCommand

MoveOrgUnitCommand

DeleteOrgUnitCommand

GetOrgUnitTreeQuery

GetOrgUnitDetailsQuery

Task B2-6 Assignment ها

AssignUserOrgUnitsCommand

GetUserOrgUnitsQuery

AssignApplicationOrgUnitsCommand

GetApplicationOrgUnitsQuery

Task B2-7 Delegated Admin

CreateDelegatedAdminCommand

RemoveDelegatedAdminCommand

GetDelegatedAdminsQuery

در همه این‌ها:

TenantId از ITenantContext

مجوزها از IOrgAuthorizationService

لاگ و Audit برای عملیات حساس.

4.4. API Endpoints

در Onesign.Api، controllerهای جدید یا گسترش قبلی.

Base: /api/tenant/org-units

Task B2-8 OrgUnitsController

GET /api/tenant/org-units/tree

برمی‌گرداند OrgUnitTreeNodeDto[]

POST /api/tenant/org-units

CreateOrgUnitRequest

PUT /api/tenant/org-units/{orgUnitId}

UpdateOrgUnitRequest

POST /api/tenant/org-units/{orgUnitId}/move

MoveOrgUnitRequest

DELETE /api/tenant/org-units/{orgUnitId}

Base: /api/tenant/users/{tenantUserId}/org-units

GET → UserOrgUnits

PUT → AssignUserOrgUnitsRequest

Base: /api/tenant/applications/{applicationId}/org-units

GET / PUT مشابه

Base: /api/tenant/delegated-admins

GET → DelegatedAdminDto[]

POST → CreateDelegatedAdminRequest

DELETE /{id}

Task B2-9 به‌روزرسانی endpoints موجود

GET /api/tenant/users:

پارامتر جدید orgUnitId

فیلتر Org-aware

GET /api/tenant/applications:

پارامتر orgUnitId

همه responses و errors مطابق ساختار Phase1 و دو زبانه (با همان infra localization).

5. Dev Tasks – Admin Portal (فرانت)
5.1. صفحه درخت سازمانی

Task F2-1 Org Tree UI

صفحه /tenant/org-units

tree view:

expand/collapse

context menu یا دکمه‌های اضافه/ویرایش/حذف/جابجایی

call به:

GET /api/tenant/org-units/tree

POST/PUT/DELETE/...

تمام labels از i18n (en/fa)

5.2. اتصال Userها به OrgUnit

Task F2-2 User details modal

در صفحه Users:

روی هر user یک دکمه "Org Units"

modal:

نمایش OrgUnit اصلی (radio)

انتخاب چند OrgUnit دیگر (checkbox) از tree

call به:

GET /api/tenant/users/{id}/org-units

PUT /api/tenant/users/{id}/org-units

Task F2-3 فیلتر OrgUnit روی لیست User

sidebar یا toolbar:

tree یا dropdown برای انتخاب OrgUnit

هنگام انتخاب → بفرست orgUnitId روی GET /api/tenant/users

5.3. اتصال Applications به OrgUnit

Task F2-4 App OrgUnit assignment

روی هر app در لیست، دکمه "Org Visibility"

modal مشابه user

استفاده از GET/PUT endpoints application-org-units

Task F2-5 فیلتر OrgUnit روی لیست App

همان الگوی user list

orgUnitId روی GET /api/tenant/applications

5.4. Delegated Admin UI

Task F2-6 صفحه Delegated Admins

/tenant/delegated-admins

جدول:

User (email / displayName)

OrgUnit name

ScopeType

دکمه Add:

انتخاب user از لیست adminها

انتخاب OrgUnit

انتخاب ScopeType

call به POST /api/tenant/delegated-admins

دکمه delete:

call به DELETE /api/tenant/delegated-admins/{id}

5.5. محدودسازی UI برای Delegated Admin

Task F2-7 Scoped view

هنگام login در Admin Portal:

از backend نقش و delegated scopes را دریافت کن

اگر user delegated admin است:

درخت OrgUnit فقط scope خودش را نشان دهد

صفحه Users و Apps به صورت پیش‌فرض با orgUnitId scope خودش فیلتر شوند

ایجاد/ویرایش OrgUnit فقط در scope خودش مجاز باشد

همه متن‌ها دو زبانه، با i18n موجود.

6. Dev Tasks – Cross-cutting

Task X2-1 Integration با Audit

هر عملیات:

ایجاد/ویرایش/حذف OrgUnit

Assign UserOrgUnit

Assign ApplicationOrgUnit

Create/Delete DelegatedAdminScope
باید یک AuditEvent ذخیره کند.

Task X2-2 تست‌ها

تست واحد برای:

ایجاد/move OrgUnit (Path/Level درست)

حذف OrgUnit با و بدون child و assignment

scoped authorization:

global admin → همه چیز

delegated admin روی Org و descendants

تست integration ساده UI:

فیلتر OrgUnit روی user/app

