# onesign – Phase 3 Advanced Security & Compliance Ready

## 1. محدوده Phase 3

### 1.1. هدف کلی

Phase 3 روی این سه محور است:

- **MFA Engine** واقعی (TOTP + Email/SMS OTP)، قابل تنظیم per-tenant و per-OrgUnit
- **Risk & Device Awareness** پایه:
  - تشخیص دستگاه جدید / trusted device
  - تشخیص الگوهای ساده ریسک (مثلا IP/کشور جدید، تلاش‌های ناموفق زیاد)
- **Security Policy & Reporting**:
  - Security Policy per tenant (حداقل برای MFA)
  - گزارش‌های امنیتی و audit بهتر برای Compliance

### 1.2. چه چیزهایی اضافه می‌شود

برای هر tenant:

- Security Policy:
  - اجباری بودن MFA برای:
    - همه userها
    - فقط adminها
    - OrgUnitهای خاص (از Phase 2)
- MFA Engine:
  - TOTP (Authenticator app)
  - Email OTP پایه (SMS OTP اگر provider داشته باشیم → فقط به عنوان کانال اضافی، نه پیچیدگی)
- MFA Enrollment:
  - ثبت TOTP برای user
  - ارسال و تایید OTP
  - مدیریت و غیرفعال‌سازی روش‌های MFA
- MFA در Login Flow:
  - Password → اگر policy می‌خواهد، مرحله MFA
  - امکان "trust this device" (اگر policy اجازه دهد)
- Device Fingerprint:
  - ذخیره trusted devices به ازای TenantUser
  - تشخیص device جدید
- Risk Events:
  - ثبت رویدادهایی مثل:
    - Login از device جدید
    - Login از کشور/IP غیرعادی
    - چند failed login پشت‌سرهم
  - محاسبه یک RiskLevel ساده (Low/Medium/High)
- Security Reports:
  - در Admin Portal → صفحه Security Center:
    - تنظیمات MFA
    - لیست رویدادهای security
    - overview کوتاه از وضعیت MFA adoption

### 1.3. چه چیزهایی **عمداً** در Phase 3 نمی‌آید

اینها را هنوز نمی‌زنیم:

- Policy Engine عمومی ABAC / JSON rule engine کامل
- SCIM / SAML / LDAP integration
- Full SIEM integration
- GeoIP دیتابیس تجاری hardcore
- Advanced UEBA / Machine Learning risk

فاز ۳ فقط **“حداقل امنیت جدی”** برای این که در RFP نگویند «این چی‌ه دیگه»، نه Security Platform کامل.

---

## 2. معماری و ماژول‌ها

### 2.1. ماژول جدید Security

اضافه کن:

- `Onesign.Modules.Security`

ساختار:

```text
Onesign.Modules.Security/
  Domain/
    Entities/
      SecurityPolicy.cs
      OrgUnitMfaRule.cs
      UserMfaMethod.cs
      MfaChallenge.cs
      TrustedDevice.cs
      RiskEvent.cs
    Enums/
      MfaMethodType.cs        // Totp, EmailOtp, SmsOtp (SmsOtp optional/provider-based)
      MfaRequirementLevel.cs  // None, AdminsOnly, AllUsers
      RiskEventType.cs        // NewDeviceLogin, GeoAnomaly, MultipleFailedLogins, ...
      RiskLevel.cs            // Low, Medium, High
    Services/
      IMfaService.cs
      IMfaChallengeService.cs
      IDeviceFingerprintService.cs
      IRiskEvaluationService.cs
      ISecurityPolicyService.cs
    Repositories/
      ISecurityPolicyRepository.cs
      IOrgUnitMfaRuleRepository.cs
      IUserMfaMethodRepository.cs
      IMfaChallengeRepository.cs
      ITrustedDeviceRepository.cs
      IRiskEventRepository.cs
  Application/
    DTOs/
      SecurityPolicyDto.cs
      UpdateSecurityPolicyRequest.cs
      OrgUnitMfaRuleDto.cs
      UpdateOrgUnitMfaRulesRequest.cs
      UserMfaMethodDto.cs
      BeginTotpEnrollmentRequest.cs
      BeginTotpEnrollmentResponse.cs
      ConfirmTotpEnrollmentRequest.cs
      DisableMfaMethodRequest.cs
      MfaChallengeRequest.cs
      MfaChallengeResponse.cs
      VerifyMfaRequest.cs
      TrustedDeviceDto.cs
      RiskEventDto.cs
      RiskEventFilterRequest.cs
    Commands/
      UpdateSecurityPolicyCommand.cs
      UpdateOrgUnitMfaRulesCommand.cs
      BeginTotpEnrollmentCommand.cs
      ConfirmTotpEnrollmentCommand.cs
      DisableMfaMethodCommand.cs
      CreateMfaChallengeCommand.cs
      VerifyMfaChallengeCommand.cs
      MarkDeviceAsTrustedCommand.cs
      RecordRiskEventCommand.cs
    Queries/
      GetSecurityPolicyQuery.cs
      GetOrgUnitMfaRulesQuery.cs
      GetUserMfaMethodsQuery.cs
      GetTrustedDevicesQuery.cs
      GetRiskEventsQuery.cs
  Infrastructure/
    EfCore/Entities/
      SecurityPolicyEntity.cs
      OrgUnitMfaRuleEntity.cs
      UserMfaMethodEntity.cs
      MfaChallengeEntity.cs
      TrustedDeviceEntity.cs
      RiskEventEntity.cs
    EfCore/Configurations/
      SecurityPolicyEntityTypeConfiguration.cs
      OrgUnitMfaRuleEntityTypeConfiguration.cs
      UserMfaMethodEntityTypeConfiguration.cs
      MfaChallengeEntityTypeConfiguration.cs
      TrustedDeviceEntityTypeConfiguration.cs
      RiskEventEntityTypeConfiguration.cs
    EfCore/Repositories/
      SecurityPolicyRepository.cs
      OrgUnitMfaRuleRepository.cs
      UserMfaMethodRepository.cs
      MfaChallengeRepository.cs
      TrustedDeviceRepository.cs
      RiskEventRepository.cs
    Services/
      TotpProvider.cs
      EmailOtpProvider.cs
      BasicRiskEvaluationService.cs
      DeviceFingerprintService.cs


2.2. Entityها (خلاصه طراحی)

SecurityPolicy

public class SecurityPolicy
{
    public Guid TenantId { get; private set; }

    public MfaRequirementLevel MfaRequirementLevel { get; private set; } // None, AdminsOnly, AllUsers
    public bool AllowMfaRememberDevice { get; private set; }            // "trust this device"
    public int RememberDeviceDays { get; private set; }                 // e.g. 30
    public bool RequireMfaForSensitiveApps { get; private set; }       // optional toggle
    public int MaxFailedLoginAttempts { get; private set; }            // e.g. 5
    public bool EnableGeoAnomalyDetection { get; private set; }
    public RiskLevel BlockLevel { get; private set; }                  // e.g. High → block
}


OrgUnitMfaRule

public class OrgUnitMfaRule
{
    public Guid Id { get; private set; }
    public Guid TenantId { get; private set; }
    public Guid OrgUnitId { get; private set; }
    public bool MfaRequired { get; private set; }
}


UserMfaMethod

public class UserMfaMethod
{
    public Guid Id { get; private set; }
    public Guid TenantUserId { get; private set; }
    public MfaMethodType MethodType { get; private set; } // Totp, EmailOtp, ...
    public bool IsPrimary { get; private set; }
    public bool IsVerified { get; private set; }
    public string SecretEncrypted { get; private set; }   // برای TOTP
    public DateTime CreatedAt { get; private set; }
}


MfaChallenge

public class MfaChallenge
{
    public Guid Id { get; private set; }
    public Guid TenantUserId { get; private set; }
    public MfaMethodType MethodType { get; private set; }
    public string CodeHash { get; private set; }      // OTP / TOTP code hash
    public DateTime ExpiresAt { get; private set; }
    public bool Consumed { get; private set; }
    public string DeviceId { get; private set; }      // optional
    public string IpAddress { get; private set; }     // optional
}


TrustedDevice

public class TrustedDevice
{
    public Guid Id { get; private set; }
    public Guid TenantUserId { get; private set; }
    public string DeviceId { get; private set; } // fingerprint از سمت فرانت
    public string DeviceName { get; private set; }
    public DateTime FirstSeenAt { get; private set; }
    public DateTime LastSeenAt { get; private set; }
    public DateTime? ExpiresAt { get; private set; }
}


RiskEvent

public class RiskEvent
{
    public Guid Id { get; private set; }
    public Guid? TenantId { get; private set; }
    public Guid? TenantUserId { get; private set; }
    public RiskEventType EventType { get; private set; }
    public RiskLevel RiskLevel { get; private set; }
    public string IpAddress { get; private set; }
    public string Country { get; private set; }
    public string DeviceId { get; private set; }
    public string DetailsJson { get; private set; }
    public DateTime CreatedAt { get; private set; }
}

3. Epics و User Storyها – Phase 3
Epic 1 – Security Policy per Tenant
US 1.1 – مشاهده Security Policy

به عنوان Tenant Admin
می‌خواهم Security Policy فعلی tenantم را ببینم
تا بدانم الان سطح امنیت روی چه تنظیمی است.

Acceptance:

endpoint GET /api/tenant/security/policy

برگرداندن:

MfaRequirementLevel

AllowMfaRememberDevice, RememberDeviceDays

RequireMfaForSensitiveApps

MaxFailedLoginAttempts

EnableGeoAnomalyDetection

BlockLevel

مقادیر پیش‌فرض معقول برای tenantهای قدیمی که هنوز policy ندارند.

US 1.2 – تنظیم Security Policy

به عنوان Tenant Admin
می‌خواهم Security Policy را تنظیم کنم
تا بتوانم MFA و رفتار ریسک را به سیاست سازمانم نزدیک کنم.

Acceptance:

endpoint PUT /api/tenant/security/policy

اعتبارسنجی:

RememberDeviceDays در بازه منطقی (مثلا 0–90)

MaxFailedLoginAttempts > 0

تغییرات ثبت در AuditEvent.

Epic 2 – MFA Rule per OrgUnit (اختیاری، اما در محدوده Phase 3)
US 2.1 – فعال‌سازی/غیرفعال‌سازی MFA برای OrgUnit

به عنوان Tenant Admin
می‌خواهم برای هر OrgUnit مشخص کنم MFA الزامی هست یا نه
تا شعب حساس‌تر را سخت‌گیرانه‌تر کنم.

Acceptance:

endpoint:

GET /api/tenant/security/org-units/mfa-rules

PUT /api/tenant/security/org-units/mfa-rules

مدل:

لیستی از { orgUnitId, mfaRequired }

منطق نهایی نیاز به ترکیب دارد:

اگر SecurityPolicy.MfaRequirementLevel = AllUsers → همه لازم دارند، حتی اگر OrgUnitMfaRule false باشد.

اگر AdminsOnly → همه adminها همیشه MFA، OrgUnitMfaRule روی بقیه اعمال شود.

UI در Admin Portal: صفحه تنظیمات امنیت.

Epic 3 – MFA Enrollment برای User
US 3.1 – نمایش روش‌های MFA فعال برای کاربر

به عنوان End User
می‌خواهم بدانم روی اکانتم چه روش‌های MFA فعالی دارم
تا بتوانم آن‌ها را مدیریت کنم.

Acceptance:

endpoint GET /api/account/mfa/methods

برگرداندن:

لیست UserMfaMethodDto (نوع، IsPrimary، IsVerified، CreatedAt)

حفاظت:

فقط user خودش و فقط در context tenant فعلی.

US 3.2 – شروع راه‌اندازی TOTP

به عنوان End User
می‌خواهم TOTP را فعال کنم
تا بتوانم از Google Authenticator یا مشابه استفاده کنم.

Acceptance:

endpoint POST /api/account/mfa/totp/begin

Request: BeginTotpEnrollmentRequest (مثلا deviceName)

Response: BeginTotpEnrollmentResponse شامل:

sharedSecret (در فرانت QR می‌شود)

otpauthUrl

temporary enrollment id (اگر لازم باشد)

backend:

generate secret

encrypt و ذخیره در UserMfaMethod (IsVerified=false)

US 3.3 – تایید نهایی TOTP

به عنوان End User
می‌خواهم با وارد کردن code، TOTP را تایید کنم
تا از این به بعد به عنوان روش MFA از آن استفاده شود.

Acceptance:

endpoint POST /api/account/mfa/totp/confirm

Request: ConfirmTotpEnrollmentRequest (code)

backend:

verify TOTP با secret

در صورت موفقیت:

IsVerified = true

خطای multi-language مناسب در صورت code اشتباه.

US 3.4 – غیرفعال‌سازی یک روش MFA

به عنوان End User
می‌خواهم یکی از روش‌های MFA را disable کنم
تا در صورت گم شدن device آن را حذف کنم.

Acceptance:

endpoint POST /api/account/mfa/methods/disable

Request: DisableMfaMethodRequest (methodId)

محافظت:

حداقل یک روش MFA فعال باید باقی بماند اگر policy MFA اجباری است.

Epic 4 – MFA در Login Flow
US 4.1 – تشخیص اینکه Login نیاز به MFA دارد

به عنوان سیستم
می‌خواهم در لحظه login تشخیص دهم آیا این user/tenant/org نیاز به MFA دارد یا نه
تا فلوی درست را اجرا کنم.

Acceptance:

بعد از موفقیت PasswordLogin:

ترکیب زیر بررسی شود:

SecurityPolicy.MfaRequirementLevel

نقش user (admin یا نه)

OrgUnitMfaRule های OrgUnit اصلی user

وجود trusted device معتبر (اگر AllowMfaRememberDevice = true)

اگر MFA لازم نیست:

login کامل → issue tokens

اگر لازم است:

ایجاد MfaChallenge

برگرداندن response به Login Portal:

requiresMfa = true

challengeId

availableMethods (TOTP, EmailOtp, ...)

US 4.2 – ارسال code MFA و تایید

به عنوان End User
پس از وارد کردن username/password
اگر MFA لازم باشد می‌خواهم code را وارد کنم تا login کامل شود.

Acceptance:

endpoint POST /api/auth/mfa/verify

Request: VerifyMfaRequest (challengeId, methodType, code, deviceId, rememberDeviceFlag)

backend:

validate challenge

validate code (TOTP or OTP)

روی موفقیت:

کامل کردن login (issue tokens)

اگر rememberDeviceFlag و policy اجازه می‌دهد، TrustedDevice بسازد/به‌روزرسانی کند.

Epic 5 – Device Fingerprint و Trusted Device
US 5.1 – شناسایی device جدید

به عنوان سیستم
می‌خواهم بتوانم تشخیص دهم login از یک device جدید است یا نه
تا بتوانم رفتار امنیتی مناسبی داشته باشم.

Acceptance:

Login Portal هنگام login یک deviceId پایدار ارسال کند (cookie/localStorage).

backend:

در login، deviceId را با TrustedDeviceها match کند.

اگر match نشد:

یک RiskEvent با نوع NewDeviceLogin ثبت کند.

اگر MFA لازم و rememberDevice فعال → بعد از MFA، اجازه trust کردن بدهد.

US 5.2 – مدیریت trusted devices برای user

به عنوان End User
می‌خواهم بتوانم لیست trusted deviceهای خودم را ببینم و revoke کنم
تا اگر device گم شد، دسترسی‌اش را ببندم.

Acceptance:

endpoint:

GET /api/account/devices

DELETE /api/account/devices/{id}

Admin Portal optional (فقط نمایش/مدیریت برای Adminها) → در همین فاز در حد read-only یا حداقل حذف توسط admin.

Epic 6 – Risk Events و RiskLevel
US 6.1 – ثبت RiskEvent برای رخدادهای کلیدی

به عنوان سیستم
می‌خواهم رویدادهای پرریسک را ثبت کنم
تا بعداً تحلیل یا گزارش شود.

Acceptance:

سرویس IRiskEvaluationService:

ثبت event برای:

NewDeviceLogin

GeoAnomaly (مثلا country جدید نسبت به لاگین‌های قبلی user)

MultipleFailedLogins (مثلا n بار پشت هم)

ذخیره:

TenantId, TenantUserId (اگر وجود دارد)

IpAddress, Country (geo lookup ساده/پایه)

RiskLevel (Low/Medium/High)

DetailsJson

US 6.2 – اعمال action ساده بر اساس RiskLevel

به عنوان سیستم
می‌خواهم بر اساس RiskLevel برخی loginها را نیازمند MFA یا بلاک کنم
تا امنیت عملی داشته باشم.

Acceptance:

اگر RiskLevel ≥ Threshold:

RequireMfa حتی اگر policy معمولاً لازم نمی‌دانست.

اگر RiskLevel ≥ BlockLevel (از SecurityPolicy):

بلاک login و برگرداندن خطای قابل ترجمه.

Epic 7 – Security Reporting در Admin Portal
US 7.1 – صفحه Security Center

به عنوان Tenant Admin
می‌خواهم یک صفحه امنیتی واحد داشته باشم
تا تنظیمات و وضعیت امنیت tenant را ببینم.

Acceptance:

صفحه جدید /tenant/security

بخش Security Policy:

فرم ویرایش Policy (MFA, RememberDevice, Risk settings)

بخش OrgUnit MFA rules:

UI برای تنظیم MfaRequired per OrgUnit (درخت)

خلاصه وضعیت:

درصد userهایی که MFA فعال دارند (approx)

تعداد trusted devices

تعداد RiskEventها در بازه اخیر

US 7.2 – لیست Risk Events

به عنوان Tenant Admin
می‌خواهم لیست رویدادهای ریسک را ببینم
تا بتوانم موارد مشکوک را بررسی کنم.

Acceptance:

صفحه فرعی /tenant/security/risk-events

فیلتر:

date range

RiskLevel

EventType

User (optional)

داده‌ها از GET /api/tenant/security/risk-events

4. Dev Tasks – Backend
4.1. Database و Entities

Task B3-1 – اضافه کردن Entities و DbSetها

اضافه کردن Entityها در Onesign.Modules.Security.Infrastructure.EfCore.Entities

اضافه کردن DbSet در OnesignDbContext:

SecurityPolicies

OrgUnitMfaRules

UserMfaMethods

MfaChallenges

TrustedDevices

RiskEvents

Task B3-2 – EF Configurations

SecurityPolicyEntityTypeConfiguration

TenantId به عنوان PK یا unique key

OrgUnitMfaRuleEntityTypeConfiguration

unique (TenantId, OrgUnitId)

UserMfaMethodEntityTypeConfiguration

composite index روی TenantUserId, MethodType, IsPrimary

MfaChallengeEntityTypeConfiguration

Expiration index

TrustedDeviceEntityTypeConfiguration

unique (TenantUserId, DeviceId)

RiskEventEntityTypeConfiguration

indexes روی TenantId, CreatedAt, RiskLevel

Task B3-3 – Migration Phase 3

ایجاد Migration برای ساخت جداول امنیتی

مقدار دهی SecurityPolicy پیش‌فرض برای tenantهای موجود:

MfaRequirementLevel = None

AllowMfaRememberDevice = true

RememberDeviceDays = 30

MaxFailedLoginAttempts = 5

EnableGeoAnomalyDetection = false

BlockLevel = RiskLevel.High

4.2. Domain Services

Task B3-4 – پیاده‌سازی ISecurityPolicyService

متدها:

GetPolicyForTenantAsync(tenantId)

UpdatePolicyAsync(tenantId, newSettings)

GetEffectiveMfaRequirementAsync(tenantUser, orgUnitsOfUser, isAdmin, deviceTrusted, riskLevel)

این سرویس قرار است حکم نهایی را بدهد که:

آیا MFA لازم است یا نه

آیا login باید بلاک شود یا نه

Task B3-5 – پیاده‌سازی IMfaService و IMfaChallengeService

IMfaService:

تولید shared secret برای TOTP

verify TOTP code

تولید OTP برای Email/SMS (کد کوتاه، مثلاً 6 رقم)

IMfaChallengeService:

ساخت MfaChallenge

validate و consume challenge

enforce expiry

Task B3-6 – DeviceFingerprintService

تولید/تایید TrustedDevice:

در login از deviceId استفاده کند

اگر rememberDevice = true پس از MFA، TrustedDevice بسازد/به‌روزرسانی کند

Task B3-7 – BasicRiskEvaluationService

منطق:

اگر login با device جدید → RiskEvent(NewDeviceLogin, RiskLevel.Medium)

اگر country جدید برای user → RiskEvent(GeoAnomaly, Medium/High)

اگر consecutive failed logins بیش از حد → RiskEvent(MultipleFailedLogins, Medium/High)

متد:

EvaluateLoginRisk(tenantUser, deviceId, ip, country) → RiskLevel، و ثبت RiskEventها

4.3. Application Layer

Task B3-8 – Commands / Queries SecurityPolicy

GetSecurityPolicyQuery

UpdateSecurityPolicyCommand

GetOrgUnitMfaRulesQuery

UpdateOrgUnitMfaRulesCommand

Task B3-9 – MFA Enrollment Commands

GetUserMfaMethodsQuery

BeginTotpEnrollmentCommand

ConfirmTotpEnrollmentCommand

DisableMfaMethodCommand

Task B3-10 – MFA Login Flow Commands

CreateMfaChallengeCommand: پس از PasswordLogin اگر MFA لازم بود

VerifyMfaChallengeCommand: validate code, complete login, update TrustedDevice

Task B3-11 – Device Management & Risk

GetTrustedDevicesQuery

MarkDeviceAsTrustedCommand (در practice داخل VerifyMfa استفاده می‌شود)

DeleteTrustedDeviceCommand (برای account management)

RecordRiskEventCommand

GetRiskEventsQuery

4.4. API Endpoints

Task B3-12 – Tenant Security Policy API

Base: /api/tenant/security

GET /api/tenant/security/policy

Response: SecurityPolicyDto

PUT /api/tenant/security/policy

Request: UpdateSecurityPolicyRequest

OrgUnit MFA rules:

GET /api/tenant/security/org-units/mfa-rules

PUT /api/tenant/security/org-units/mfa-rules

Request: UpdateOrgUnitMfaRulesRequest (لیست OrgUnitMfaRuleDto)

Task B3-13 – Account MFA Management API

Base: /api/account/mfa

GET /api/account/mfa/methods

POST /api/account/mfa/totp/begin

BeginTotpEnrollmentRequest

POST /api/account/mfa/totp/confirm

ConfirmTotpEnrollmentRequest

POST /api/account/mfa/methods/disable

DisableMfaMethodRequest

Task B3-14 – Auth MFA Login API

Update POST /api/auth/login:

اگر password درست ولی MFA لازم:

برگرداندن:

requiresMfa = true

challengeId

availableMethods

اگر MFA لازم نیست:

login کامل مثل Phase 1

POST /api/auth/mfa/verify

VerifyMfaRequest (challengeId, methodType, code, deviceId, rememberDeviceFlag)

Task B3-15 – Account Devices API

Base: /api/account/devices

GET /api/account/devices

Returns TrustedDeviceDto[]

DELETE /api/account/devices/{id}

Task B3-16 – Risk Events API

Base: /api/tenant/security/risk-events

GET با RiskEventFilterRequest (از querystring) برای فیلتر:

date range

RiskLevel

EventType

User

همه endpointها باید:

multi-language را حفظ کنند (message codes یا استفاده از localization layer)

Multi-tenant با TenantId از ITenantContext

5. Dev Tasks – Frontend (Login Portal)
5.1. MFA Login Flow

Task F3-1 – اصلاح صفحه Login

بعد از submit فرم login:

اگر requiresMfa = false → همان رفتار قبلی

اگر requiresMfa = true → ریدایرکت به صفحه /mfa با challengeId

Task F3-2 – صفحه MFA Challenge

صفحه /mfa

نمایش:

روش منتخب یا انتخاب روش (اگر چند روش موجود)

فیلد code

checkbox "trust this device" (اگر policy AllowMfaRememberDevice)

ارسال VerifyMfaRequest به /api/auth/mfa/verify

هندل کردن خطاها با متن‌های دو زبانه (en/fa)

5.2. MFA Account Management

Task F3-3 – صفحه تنظیمات MFA در Login Portal

(اختیاری اما بسیار مفید، می‌تواند زیر یک /account/security باشد یا در Admin Portal هم نمایان شود)

صفحه:

نمایش UserMfaMethodDto[]

امکان:

شروع TOTP enrollment:

call begin → نمایش QR + secret

گرفتن code → call confirm

disable یک روش (با warning)

تمام متن‌ها از i18n، نه hardcoded.

6. Dev Tasks – Frontend (Admin Portal)
6.1. Security Center UI

Task F3-4 – صفحه /tenant/security

تب Security Policy:

فرم برای:

MfaRequirementLevel (select)

AllowMfaRememberDevice (toggle)

RememberDeviceDays

MaxFailedLoginAttempts

EnableGeoAnomalyDetection

BlockLevel

call:

GET /api/tenant/security/policy

PUT /api/tenant/security/policy

تب OrgUnit MFA Rules:

tree view OrgUnitها (از Phase 2)

برای هر node:

checkbox MfaRequired

call:

GET /api/tenant/security/org-units/mfa-rules

PUT /api/tenant/security/org-units/mfa-rules

Task F3-5 – Summary Widget

در صفحه Security:

نمایش:

تعداد userها، تعداد user با MFA فعال (approx)

تعداد risk events در ۳۰ روز اخیر

call:

GetUserMfaMethods aggregated endpoint (یا یک endpoint ساده آماری اگر نیاز شد)

GET /api/tenant/security/risk-events با filter

6.2. Risk Events UI

Task F3-6 – صفحه /tenant/security/risk-events

جدول با ستون‌ها:

Time

User

EventType

RiskLevel

IP / Country

فیلترها (در header یا sidebar):

date range picker

RiskLevel

EventType

User (optional autocomplete)

call:

GET /api/tenant/security/risk-events

7. Cross-Cutting Tasks

Task X3-1 – Integration با Audit

هر عملیات Phase 3 زیر باید AuditEvent ایجاد کند:

UpdateSecurityPolicy

UpdateOrgUnitMfaRules

Begin/Confirm/Disable MFA method

VerifyMfaChallenge (موفق/ناموفق)

MarkDeviceAsTrusted / DeleteTrustedDevice

Task X3-2 – Logging & Alerts

در RiskEvaluationService:

log داخلی برای RiskLevel بالا

در verify MFA و login:

log واضح برای شکست‌ها بدون لو دادن اطلاعات حساس

Task X3-3 – Unit Tests

تست برای:

تصمیم‌گیری ISecurityPolicyService برای سناریوهای:

No MFA

AdminsOnly

AllUsers

OrgUnitMfaRule override

Trusted device skip MFA

Risk-based override (force MFA یا block)

IMfaService (TOTP, OTP)

DeviceFingerprintService (trusted/new device)

Task X3-4 – Migration/Upgrade Script

سناریوی upgrade از Phase 2:

بدون شکستن login فعلی

tenants قدیمی → policy = None، MFA غیرفعال، ولی فریمورک آماده است

تست دستی:

tenant قدیمی بدون MFA → login مثل قبل

tenant جدید با MFA اجباری → login دو مرحله‌ای

8. نکات کلیدی طراحی Phase 3

MFA باید اختیاری per tenant باشد اما وقتی tenant active کرد، جریان login را واقعا enforce کند.

Device trust نباید حفره امنیتی بسازد:

DeviceId باید pseudo-random و مقاوم به حدس باشد.

expiry دقیق، نه “برای همیشه”.

Risk model ساده اما کاربردی:

Priority این فاز: ثبت و visibility، نه الگوریتم ML.

Multi language:

همه خطاهای MFA و security باید پیام‌های قابل ترجمه داشته باشند.

UI Security Center و MFA screens کاملا دو زبانه.

