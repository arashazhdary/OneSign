# onesign – Phase 4 Enterprise Federation & Provisioning

## 1. محدوده Phase 4

### 1.1 هدف کلی

Phase 4 تمرکز دارد روی قابلیت های Enterprise Integration:

- SAML 2.0 IdP برای هر tenant
- Federation با IdP های خارجی (Azure AD, Google Workspace, Okta و غیره)
- JIT Provisioning
- SCIM 2.0 برای user و group provisioning
- Attribute Mapping بین external IdP و مدل داخلی onesign

از این فاز به بعد، اگر توی RFP بنویسی "SAML + SCIM supported"، کسی نتواند راحت گیر بدهد که کشک است.

### 1.2 چه چیزی اضافه می‌شود

برای هر tenant:

- تعریف یک یا چند SAML Integration:
  - SAML IdP metadata
  - ACS URL, EntityId, Certificates
  - Attribute mappings برای email, displayName, roles, orgUnits
  - تنظیم IdP initiated و SP initiated
- تنظیم Federation برای OIDC external IdP ها:
  - Azure AD, Google Workspace و مشابه
  - Attribute mapping و JIT provisioning
- SCIM 2.0 Provider:
  - Endpoint های استاندارد `/scim/v2/Users` و `/scim/v2/Groups`
  - Token per tenant برای SCIM
  - Mapping SCIM User/Group به TenantUser, Role, OrgUnit
- JIT Provisioning:
  - وقتی user از IdP خارجی می‌آید و در سیستم نیست:
    - در لحظه ساخته شود (TenantUser + GlobalUser)
    - بر اساس attribute mapping و policy

### 1.3 عمدا چه چیزهایی نمی‌زنیم

چیزهایی که **در این فاز نیست**:

- SCIM client (یعنی onesign برود از بقیه سیستم ها کاربر بکشد)
- Provisioning بسیار پیچیده workflow-based
- Full blown rule engine برای mapping (در حد config ساده می‌مانیم)
- UI بسیار fancy برای هزاران نوع mapping ترکیبی
- Auto discovery برای صد نوع IdP مختلف

فاز ۴ فقط "Enterprise ready" در حد:  
"Do you support SAML and SCIM with attribute mapping and JIT provisioning?" → جواب: "Yes".

---

## 2. معماری و ماژول ها

### 2.1 ماژول جدید Federation

اضافه کن:

- `Onesign.Modules.Federation`

ساختار:

```text
Onesign.Modules.Federation/
  Domain/
    Entities/
      SamlProvider.cs
      SamlProviderCertificate.cs
      SamlApplicationBinding.cs
      OidcFederationProvider.cs
      AttributeMapping.cs
      ScimToken.cs
      ScimSyncLog.cs
    Enums/
      FederationType.cs      // Saml, Oidc
      NameIdFormat.cs
      AttributeMappingSource.cs  // SamlAttribute, SamlNameId, OidcClaim, ScimAttribute
    Services/
      ISamlService.cs
      IFederationLoginService.cs
      IAttributeMappingService.cs
      IScimService.cs
    Repositories/
      ISamlProviderRepository.cs
      IOidcFederationProviderRepository.cs
      IAttributeMappingRepository.cs
      IScimTokenRepository.cs
      IScimSyncLogRepository.cs
  Application/
    DTOs/
      SamlProviderDto.cs
      CreateOrUpdateSamlProviderRequest.cs
      SamlApplicationBindingDto.cs
      OidcFederationProviderDto.cs
      CreateOrUpdateOidcFederationProviderRequest.cs
      AttributeMappingDto.cs
      UpdateAttributeMappingsRequest.cs
      ScimTokenDto.cs
      RegenerateScimTokenRequest.cs
      ScimUserDto.cs
      ScimGroupDto.cs
      ScimPatchRequestDto.cs
    Commands/
      CreateOrUpdateSamlProviderCommand.cs
      EnableSamlProviderCommand.cs
      DisableSamlProviderCommand.cs
      BindSamlProviderToApplicationCommand.cs
      UnbindSamlProviderFromApplicationCommand.cs
      CreateOrUpdateOidcFederationProviderCommand.cs
      EnableOidcFederationProviderCommand.cs
      DisableOidcFederationProviderCommand.cs
      UpdateAttributeMappingsCommand.cs
      GenerateOrRotateScimTokenCommand.cs
      LogScimSyncEventCommand.cs
    Queries/
      GetSamlProvidersQuery.cs
      GetSamlProviderDetailsQuery.cs
      GetOidcFederationProvidersQuery.cs
      GetOidcFederationProviderDetailsQuery.cs
      GetAttributeMappingsQuery.cs
      GetScimTokenQuery.cs
      GetScimSyncLogsQuery.cs
  Infrastructure/
    EfCore/Entities/
      SamlProviderEntity.cs
      SamlProviderCertificateEntity.cs
      SamlApplicationBindingEntity.cs
      OidcFederationProviderEntity.cs
      AttributeMappingEntity.cs
      ScimTokenEntity.cs
      ScimSyncLogEntity.cs
    EfCore/Configurations/
      SamlProviderEntityTypeConfiguration.cs
      SamlApplicationBindingEntityTypeConfiguration.cs
      OidcFederationProviderEntityTypeConfiguration.cs
      AttributeMappingEntityTypeConfiguration.cs
      ScimTokenEntityTypeConfiguration.cs
      ScimSyncLogEntityTypeConfiguration.cs
    EfCore/Repositories/
      SamlProviderReposit


2.2 مدل اصلی

SamlProvider

public class SamlProvider
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }

    public string Name { get; private set; }
    public string EntityId { get; private set; }
    public string SingleSignOnUrl { get; private set; }
    public string SingleLogoutUrl { get; private set; }

    public NameIdFormat NameIdFormat { get; private set; } // Email, Persistent, ...
    public bool Enabled { get; private set; }

    public ICollection<SamlProviderCertificate> Certificates { get; private set; }
}


SamlApplicationBinding

public class SamlApplicationBinding
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid SamlProviderId { get; private set; }
    public Guid ApplicationClientId { get; private set; }

    public string AssertionConsumerServiceUrl { get; private set; }
    public string Audience { get; private set; }        // usually Application's EntityId
    public bool IdpInitiatedAllowed { get; private set; }
}


OidcFederationProvider

public class OidcFederationProvider
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }

    public string Name { get; private set; }
    public string Authority { get; private set; }     // discovery URL
    public string ClientId { get; private set; }
    public string ClientSecretEncrypted { get; private set; }
    public string[] Scopes { get; private set; }

    public bool Enabled { get; private set; }
    public bool JustInTimeProvisioningEnabled { get; private set; }
}


AttributeMapping

public class AttributeMapping
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }

    public FederationType FederationType { get; private set; } // Saml, Oidc, Scim
    public string SourceKey { get; private set; }              // مثلا "email", "given_name", "http://schemas..."
    public AttributeMappingSource SourceType { get; private set; }

    public string TargetField { get; private set; }            // "User.Email", "User.DisplayName", "Role", "OrgUnit", ...
    public string TransformExpression { get; private set; }    // ساده، مثل "toLower()", "split(';')[0]"
}


ScimToken

public class ScimToken
{
    public Guid TenantId { get; private set; }
    public string TokenHash { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
}


ScimSyncLog

public class ScimSyncLog
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public string ResourceType { get; private set; }  // "User" or "Group"
    public string ExternalId { get; private set; }
    public string Operation { get; private set; }     // "Create", "Update", "Delete"
    public bool Success { get; private set; }
    public string Message { get; private set; }
    public DateTime CreatedAt { get; private set; }
}

3. Epics و User Story ها – Phase 4
Epic 1 – SAML IdP Integration per tenant
US 1.1 تعریف SAML Provider برای tenant

به عنوان Tenant Admin
می‌خواهم برای سازمانم یک SAML IdP تعریف کنم
تا کاربران بتوانند با هویت سازمانی خودشان لاگین کنند.

Acceptance:

امکان ثبت SAML Provider:

Name

EntityId

SSO URL

SLO URL (اختیاری در این فاز)

NameIdFormat

Certificates

endpoint:

GET /api/tenant/federation/saml/providers

POST /api/tenant/federation/saml/providers

PUT /api/tenant/federation/saml/providers/{id}

DELETE /api/tenant/federation/saml/providers/{id} (اگر روی application ای bound نیست)

US 1.2 Bind کردن SAML به Application

به عنوان Tenant Admin
می‌خواهم بعضی applications را از طریق SAML در دسترس قرار دهم
تا کاربران از SSO سازمانی مستقیما به آن ها وارد شوند.

Acceptance:

امکان Bind:

انتخاب SAML Provider

انتخاب ApplicationClient

تنظیم:

ACS URL

Audience

IdpInitiatedAllowed

endpoint:

POST /api/tenant/federation/saml/bindings

GET /api/tenant/federation/saml/bindings

DELETE /api/tenant/federation/saml/bindings/{id}

US 1.3 پشتیبانی SP initiated و IdP initiated

به عنوان End User
می‌خواهم هم از طریق برنامه (SP initiated) و هم از پرتال SSO سازمانی (IdP initiated) وارد شوم.

Acceptance:

SP initiated:

Application به onesign ریدایرکت می‌کند

onesign تشخیص می‌دهد که باید SAML به IdP بفرستد

SAML AuthnRequest ساخته شود

سشن SSO onesign پس از Assertion ساخته شود

IdP initiated:

IdP SAML Response را مستقیم به onesign می‌فرستد

onesign ApplicationTarget را از Assertion یا Binding پیدا می‌کند

سشن را می‌سازد و به redirectUri مناسب می‌فرستد

Epic 2 – OIDC Federation و JIT Provisioning
US 2.1 تعریف OIDC Federation Provider

به عنوان Tenant Admin
می‌خواهم Azure AD یا Google Workspace را به صورت OIDC IdP به onesign وصل کنم
تا کاربران با اکانت سازمانی لاگین کنند.

Acceptance:

تنظیمات:

Authority

ClientId

ClientSecret

Scopes

JustInTimeProvisioningEnabled

endpoint:

GET /api/tenant/federation/oidc/providers

POST /api/tenant/federation/oidc/providers

PUT /api/tenant/federation/oidc/providers/{id}

DELETE /api/tenant/federation/oidc/providers/{id}

US 2.2 JIT Provisioning

به عنوان سیستم
می‌خواهم وقتی user اولین بار از IdP خارجی می‌آید و در سیستم نیست، در لحظه ایجاد شود
تا نیازی به provisioning دستی نباشد.

Acceptance:

اگر External Id عدم وجود:

ایجاد GlobalUser و TenantUser

تعیین email, displayName, roles, OrgUnits براساس attribute mapping

اگر موجود است:

update برخی فیلدها طبق policy (مثلا displayName)

Epic 3 – Attribute Mapping
US 3.1 تعریف mapping بین attributes خارجی و فیلدهای داخلی

به عنوان Tenant Admin
می‌خواهم مشخص کنم که کدام SAML attributes یا OIDC claims به کدام فیلدهای داخلی map شوند
تا ساخت و به روز رسانی userها و نقش ها درست انجام شود.

Acceptance:

تعریف mapping ها:

SourceType: SamlAttribute, SamlNameId, OidcClaim

SourceKey: مثلا "email", "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress
"

TargetField:

User.Email

User.DisplayName

Role (many)

OrgUnit (بر اساس کد یا نام)

endpoint:

GET /api/tenant/federation/mappings

PUT /api/tenant/federation/mappings

TransformExpression ساده:

مثل توابع ابتدایی: toLower(), split(';')[0]

این فاز در حد "string manip" ساده، نه rule engine پیچیده.

Epic 4 – SCIM 2.0 User و Group Provisioning
US 4.1 فعال سازی SCIM برای tenant

به عنوان Tenant Admin
می‌خواهم SCIM را برای tenant خود فعال کنم و یک token داشته باشم
تا Azure AD یا Okta بتواند user و group ها را به این سامانه push کند.

Acceptance:

endpoint:

GET /api/tenant/federation/scim/token

POST /api/tenant/federation/scim/token/rotate

ScimToken:

ذخیره hash شده

تاریخ انقضا اختیاری

US 4.2 SCIM Users endpoint

به عنوان External IdP
می‌خواهم بتوانم از طریق SCIM کاربران را بسازم، به روز کنم و حذف کنم
تا User lifecycle در یک جا متمرکز باشد.

Acceptance:

SCIM standard endpoints:

GET /scim/v2/Users

POST /scim/v2/Users

GET /scim/v2/Users/{id}

PUT /scim/v2/Users/{id}

PATCH /scim/v2/Users/{id}

DELETE /scim/v2/Users/{id}

Mapping:

userName -> TenantUser/GlobalUser unique identifier

emails -> User.Email

name.givenName, name.familyName -> DisplayName

active -> TenantUser enabled/disabled

groups → mapping به Roles یا OrgUnits بر اساس config

احراز هویت:

Bearer token SCIM per tenant

US 4.3 SCIM Groups endpoint

Acceptance:

SCIM endpoints:

GET /scim/v2/Groups

POST /scim/v2/Groups

GET /scim/v2/Groups/{id}

PATCH /scim/v2/Groups/{id}

DELETE /scim/v2/Groups/{id}

Mapping:

SCIM Group یا به Role map شود یا به OrgUnit (بسته به تنظیم tenant)

ذخیره ExternalId برای traceability

US 4.4 Logging و Monitoring SCIM

Acceptance:

هر عملیات SCIM در ScimSyncLog ذخیره شود:

ResourceType, ExternalId, Operation, Success, Message

4. Dev Tasks – Backend
4.1 Database و Entities

Task B4-1 اضافه کردن Entities و DbSet ها

اضافه کردن:

SamlProviderEntity

SamlProviderCertificateEntity

SamlApplicationBindingEntity

OidcFederationProviderEntity

AttributeMappingEntity

ScimTokenEntity

ScimSyncLogEntity

اضافه کردن DbSet ها در OnesignDbContext

Task B4-2 EF Configurations

SamlProvider:

index روی TenantId, Name

SamlApplicationBinding:

unique بر اساس (TenantId, ApplicationClientId) در هر provider

OidcFederationProvider:

index TenantId, Name

AttributeMapping:

index TenantId, FederationType

ScimToken:

unique TenantId

ScimSyncLog:

index TenantId, CreatedAt, ResourceType

Task B4-3 Migration Phase 4

ایجاد Migration برای ساخت جداول Federation

هیچ data migration پیچیده نیاز نیست، فقط ساخت structure

4.2 Services

Task B4-4 SamlService

قابلیت ها:

Parse SAML Response

Validate signature و certificate

Extract NameId و attributes

Generate AuthnRequest برای SP initiated

Task B4-5 FederationLoginService

متد:

HandleSamlLoginAsync(...)

HandleOidcLoginAsync(...)

منطق:

پیدا کردن tenant و provider

اجرای attribute mapping

JIT provisioning:

ایجاد یا به روز رسانی GlobalUser و TenantUser

در نهایت:

پاس دادن user به pipeline login اصلی (Phase 1) برای issue token و session

Task B4-6 AttributeMappingService

ورودی:

Dictionary<string, string> از attributes/claims

لیست AttributeMapping های tenant

خروجی:

ساخت یک مدل میانی:

UserEmail, UserDisplayName, Roles[], OrgUnitCodes[]

اعمال TransformExpression ساده

Task B4-7 ScimService

پیاده سازی core logic SCIM:

parsing SCIM requests

ساخت پاسخ SCIM با schema های استاندارد

استفاده از Identity و Organization برای:

ایجاد/به روز رسانی/حذف TenantUser

ارتباط user با Role یا OrgUnit بر اساس mapping

4.3 Application Layer

Task B4-8 SAML Provider Commands و Queries

GetSamlProvidersQuery

GetSamlProviderDetailsQuery

CreateOrUpdateSamlProviderCommand

EnableSamlProviderCommand

DisableSamlProviderCommand

BindSamlProviderToApplicationCommand

UnbindSamlProviderFromApplicationCommand

GetSamlBindingsQuery

Task B4-9 OIDC Federation Commands و Queries

GetOidcFederationProvidersQuery

GetOidcFederationProviderDetailsQuery

CreateOrUpdateOidcFederationProviderCommand

EnableOidcFederationProviderCommand

DisableOidcFederationProviderCommand

Task B4-10 Attribute Mapping Commands و Queries

GetAttributeMappingsQuery (per tenant and per FederationType)

UpdateAttributeMappingsCommand

Task B4-11 SCIM Token و Log

GetScimTokenQuery

GenerateOrRotateScimTokenCommand

LogScimSyncEventCommand

GetScimSyncLogsQuery

4.4 API Endpoints

Task B4-12 Tenant Federation API

Base: /api/tenant/federation

SAML:

GET /api/tenant/federation/saml/providers

GET /api/tenant/federation/saml/providers/{id}

POST /api/tenant/federation/saml/providers

PUT /api/tenant/federation/saml/providers/{id}

DELETE /api/tenant/federation/saml/providers/{id}

GET /api/tenant/federation/saml/bindings

POST /api/tenant/federation/saml/bindings

DELETE /api/tenant/federation/saml/bindings/{id}

OIDC:

GET /api/tenant/federation/oidc/providers

GET /api/tenant/federation/oidc/providers/{id}

POST /api/tenant/federation/oidc/providers

PUT /api/tenant/federation/oidc/providers/{id}

DELETE /api/tenant/federation/oidc/providers/{id}

Attribute mappings:

GET /api/tenant/federation/mappings

PUT /api/tenant/federation/mappings

SCIM token:

GET /api/tenant/federation/scim/token

POST /api/tenant/federation/scim/token/rotate

Task B4-13 Federation Login Endpoints

SAML endpoints:

POST /saml/{tenantSlug}/acs
برای دریافت SAML Response

optional:

GET /saml/{tenantSlug}/metadata

OIDC Federation:

GET /federation/oidc/{providerId}/signin

GET /federation/oidc/{providerId}/callback

اینا باید به FederationLoginService وصل شوند و در نهایت از pipeline login پایه Phase 1 برای issue token استفاده کنند.

Task B4-14 SCIM endpoints

Base: /scim/v2

Users:

GET /scim/v2/Users

POST /scim/v2/Users

GET /scim/v2/Users/{id}

PUT /scim/v2/Users/{id}

PATCH /scim/v2/Users/{id}

DELETE /scim/v2/Users/{id}

Groups:

GET /scim/v2/Groups

POST /scim/v2/Groups

GET /scim/v2/Groups/{id}

PATCH /scim/v2/Groups/{id}

DELETE /scim/v2/Groups/{id}

احراز هویت SCIM:

Bearer token در header

lookup ScimToken برای tenant

5. Dev Tasks – Frontend (Admin Portal)
5.1 Federation صفحه تنظیمات

Task F4-1 صفحه Federation در Admin Portal

مسیر /tenant/federation

Tab: SAML

Tab: OIDC

Tab: SCIM

Tab: Attribute Mapping

تمام متن ها دو زبانه با i18n.

5.2 SAML UI

Task F4-2 SAML Providers UI

لیست providers:

Name

EntityId

Enabled

فرم create/edit:

Name, EntityId, SSO URL, SLO URL, NameIdFormat, Certificates

toggle enable/disable

Task F4-3 SAML Bindings UI

صفحه ای در همان تب یا صفحه جدا:

لیست binding ها:

Application, Provider, ACS URL, IdpInitiatedAllowed

فرم create:

انتخاب ApplicationClient

انتخاب Provider

تنظیمات دیگر

5.3 OIDC Federation UI

Task F4-4 OIDC Providers UI

لیست providers:

Name, Authority, Enabled, JIT Enabled

فرم create/edit:

Authority, ClientId, ClientSecret, Scopes, JIT flag

5.4 SCIM UI

Task F4-5 SCIM Token UI

نمایش:

وجود یا عدم وجود token

تاریخ ساخت و انقضا

دکمه "Generate / Rotate"

هشدار امنیتی

call به /api/tenant/federation/scim/token/rotate

5.5 Attribute Mapping UI

Task F4-6 Attribute Mapping Editor

برای FederationType (Saml, Oidc, Scim) جدا:

جدول:

SourceType, SourceKey, TargetField, TransformExpression

قابلیت:

افزودن row جدید

ویرایش

حذف

کاندیداهای TargetField را ثابت و control شده بگذار:

User.Email

User.DisplayName

Role

OrgUnitCode

6. Cross-cutting Tasks

Task X4-1 Integration با Audit

برای عملیات:

ایجاد/ویرایش/حذف SamlProvider

ایجاد/ویرایش/حذف OidcFederationProvider

آپدیت AttributeMappings

Generate/Rotate SCIM token

عملیات SCIM (create/update/delete user/group)

Task X4-2 تست ها

Unit tests برای:

SamlService (parse / validate / mapping)

FederationLoginService (JIT provisioning سناریوهای اصلی)

AttributeMappingService (چند mapping ساده و چند mapping با Transform)

ScimService (basic create/update/delete user)

Task X4-3 Hardening

حواست به:

محدود کردن log تا اطلاعات حساس (مثل SAML assertion کامل) را لو ندهد

بررسی input ها برای حملات متنی (مثلا TransformExpression injection در حد ساده control شود)

7. نکات طراحی Phase 4

Federation نصفه یعنی فاجعه. یا حسابی پیاده می‌کنی یا می‌زنی فاز بعد.

SAML و SCIM باید به صورت tenant scoped کاملا شفاف باشند. هیچ داده cross-tenant نباید دیده شود.

Attribute Mapping را ساده و قابل فهم نگه دار، نه mini programming language.

اگر دیدی پیچیدگی mapping دارد تو را می‌کشد، آن را می‌اندازی Phase 5، اما در این فاز حداقل mapping های حیاتی را عملیاتی نگه دار: email، displayName، roles، orgUnits.

