# onesign – Phase 9 Account Center & Self-Service

## 1. محدوده Phase 9

### 1.1 هدف کلی

Phase 9 تمرکز دارد روی این‌که end user احساس کند با یک **سامانه هویتی جدی و مدرن** کار می‌کند، نه یک صفحه لاگین عهد بوق:

- Account Center مستقل برای کاربر نهایی
- Self-service برای:
  - پروفایل
  - تغییر پسورد
  - مدیریت MFA
  - نشست‌ها و دیوایس‌ها
  - Activity / Login history
  - Consentها و دسترسی اپ‌ها
  - Recovery و Notification preference
- ادغام کامل با:
  - Security (Phase 3)
  - Policy Engine (Phase 7)
  - Observability (Phase 6)

Personas:

- **End User**
  - پروفایل، زبان، timezone
  - پسورد، MFA، sessionها
  - دیوایس‌ها، trusted devices
  - consentها (کدوم app چی می‌بینه)
- **Tenant Admin / Support**
  - از پنل خودش بتواند view مشابه end user داشته باشد (impersonate-view / read-only)
  - reset MFA / password کمک کند
- **Security / Compliance team**
  - مطمئن باشند user می‌تواند privacy/consent را خودش مدیریت کند

### 1.2 چه چیزهایی اضافه می‌شود

برای هر user (در context یک tenant):

- **Account Center Portal:**
  - App React مستقل:
    - `/account` یا چیزی مثل `https://account.tenant-domain/...`
  - navigation:
    - Profile
    - Security
    - Devices & Sessions
    - Activity
    - Apps & Consents
    - Recovery & Notifications

- **Self-Service Security:**
  - Change password
  - MFA methods:
    - اضافه/حذف TOTP
    - مدیریت trusted deviceها (از Phase 3)
    - backup codes

- **Sessions & Devices:**
  - دیدن همه sessionهای فعال
  - terminate session
  - لیست دیوایس‌ها (browser/user-agent, last seen, trust status)

- **Activity & Login History:**
  - آخرین ورودها
  - محل تقریبی (کشور / شهر) + IP
  - eventهای حساس (MFA, password change)

- **Apps & Consents:**
  - کدام appها به حساب دسترسی دارند
  - چه scopes/claims برای هر app داده شده
  - Revoke consent

- **Recovery & Notifications:**
  - Recovery email / phone
  - notification preferences (security alerts, new login, password change)

### 1.3 عمداً چه چیزهایی الان نیست

فعلاً نمی‌زنیم:

- Full GDPR automation (DPO workflows کامل)
- Data export پیشرفته با فرمت‌های مختلف
- Account delete اتوماتیک بدون process اداری (فقط request/flag)

Phase 9 فقط:

- End-user Account Center قابل استفاده و enterprise-grade
- integration با security, policy, observability

---

## 2. معماری و ماژول‌ها

### 2.1 ماژول AccountCenter یا گسترش Identity

پیشنهاد:

- ماژول جدید:
  - `Onesign.Modules.AccountCenter`
- و reuse شدید از:
  - Identity / Users (Phase 1)
  - Security (Phase 3)
  - Observability (Phase 6)
  - Policy (Phase 7)

ساختار:

```text
Onesign.Modules.AccountCenter/
  Domain/
    Entities/
      UserProfile.cs          // profile + preferences per tenant-user
      UserDevice.cs           // دیوایس‌های شناخته‌شده
      UserRecoveryOption.cs   // email/phone/backup contacts
      UserNotificationPreference.cs
      UserConsent.cs          // اپ و scopes برای consent
    Enums/
      DeviceType.cs           // Browser, Mobile, Desktop
      RecoveryType.cs         // Email, Sms
      NotificationChannel.cs  // Email, Sms, InApp
      NotificationEventType.cs// NewLogin, PasswordChanged, MfaChanged, NewDevice
    Services/
      IAccountProfileService.cs
      IAccountSecurityService.cs
      ISessionOverviewService.cs
      IDeviceService.cs
      IConsentService.cs
      INotificationPreferenceService.cs
    Repositories/
      IUserProfileRepository.cs
      IUserDeviceRepository.cs
      IUserRecoveryOptionRepository.cs
      IUserNotificationPreferenceRepository.cs
      IUserConsentRepository.cs
  Application/
    DTOs/
      AccountProfileDto.cs
      UpdateAccountProfileRequest.cs
      ChangePasswordRequest.cs
      UserDeviceDto.cs
      UserSessionDto.cs
      UserActivityEntryDto.cs
      MfaMethodDto.cs
      UserConsentDto.cs
      UserRecoveryOptionDto.cs
      UpdateRecoveryOptionsRequest.cs
      NotificationPreferenceDto.cs
      UpdateNotificationPreferenceRequest.cs
    Commands/
      UpdateAccountProfileCommand.cs
      ChangePasswordCommand.cs
      RegisterDeviceCommand.cs
      RemoveDeviceCommand.cs
      TerminateSessionCommand.cs
      TerminateAllSessionsCommand.cs
      UpdateRecoveryOptionsCommand.cs
      UpdateNotificationPreferencesCommand.cs
      RevokeConsentCommand.cs
    Queries/
      GetAccountProfileQuery.cs
      GetUserDevicesQuery.cs
      GetUserSessionsQuery.cs
      GetUserActivityQuery.cs
      GetUserMfaMethodsQuery.cs
      GetUserConsentsQuery.cs
      GetRecoveryOptionsQuery.cs
      GetNotificationPreferencesQuery.cs
  Infrastructure/
    EfCore/Entities/
      UserProfileEntity.cs
      UserDeviceEntity.cs
      UserRecoveryOptionEntity.cs
      UserNotificationPreferenceEntity.cs
      UserConsentEntity.cs
    EfCore/Configurations/
      UserProfileEntityTypeConfiguration.cs
      UserDeviceEntityTypeConfiguration.cs
      UserRecoveryOptionEntityTypeConfiguration.cs
      UserNotificationPreferenceEntityTypeConfiguration.cs
      UserConsentEntityTypeConfiguration.cs
    EfCore/Repositories/
      UserProfileRepository.cs
      UserDeviceRepository.cs
      UserRecoveryOptionRepository.cs
      UserNotificationPreferenceRepository.cs
      UserConsentRepository.cs


2.2 UserProfile per tenant-user

مدل:

public class UserProfile
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }
    public string UserId { get; private set; }          // link به GlobalUser/TenantUser

    public string DisplayName { get; private set; }
    public string PreferredLanguage { get; private set; } // en, fa, ...
    public string TimeZone { get; private set; }          // IANA
    public string AvatarUrl { get; private set; }

    public DateTime CreatedAt { get; private set; }
    public DateTime UpdatedAt { get; private set; }
}

2.3 UserDevice + Sessions

UserDevice:

public class UserDevice
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }
    public string UserId { get; private set; }

    public string DeviceId { get; private set; }        // internal identifier
    public DeviceType DeviceType { get; private set; }  // Browser, Mobile, Desktop
    public string UserAgent { get; private set; }
    public string Os { get; private set; }
    public string Browser { get; private set; }

    public bool IsTrusted { get; private set; }
    public DateTime FirstSeenAt { get; private set; }
    public DateTime LastSeenAt { get; private set; }
    public string LastIpAddress { get; private set; }
    public string LastCountry { get; private set; }
}


Sessions:

session storage قبلاً در Phaseهای قبلی فرض شده؛ اینجا فقط سرویس read + terminate می‌خواهی:

ISessionOverviewService با DTO UserSessionDto.

2.4 Consent & Apps

UserConsent:

public class UserConsent
{
    public Guid Id { get; private set; }

    public Guid TenantId { get; private set; }
    public string UserId { get; private set; }

    public string ClientId { get; private set; }
    public string ApplicationName { get; private set; }

    public string GrantedScopes { get; private set; }  // comma-separated or JSON
    public DateTime GrantedAt { get; private set; }
    public DateTime? LastUsedAt { get; private set; }
}


این باید با Authorization/Token issuance ادغام شود؛ زمانی که user consents می‌دهد، این رکورد ایجاد/آپدیت شود.

3. Epics و User Storyها – Phase 9
Epic 1 – Account Center Shell & Navigation
US 1.1 – Account Center entrypoint

به عنوان End User
می‌خواهم یک مرکز حساب کاربری داشته باشم
تا همه چیز مرتبط با حسابم را در یک جا مدیریت کنم.

Acceptance:

آدرس:

/account روی همان Login domain یا subdomain مستقل (مثل account.your-sso.com)

بعد از login:

user می‌تواند از Login Portal یا از اپ client به Account Center هدایت شود.

سمت backend:

نیاز به API set جدید تحت /api/account/* (tenant + user scoped).

US 1.2 – Navigation ساختاریافته

به عنوان End User
می‌خواهم تنظیمات حساب به صورت دسته‌بندی شده باشد
تا گیج نشوم.

Acceptance:

تب‌ها در Account Center:

Profile

Security

Devices & Sessions

Activity

Apps & Consents

Recovery & Notifications

Epic 2 – Profile Management
US 2.1 – مشاهده و ویرایش پروفایل

به عنوان End User
می‌خواهم نام نمایشی، زبان و timezone خودم را تنظیم کنم
تا تجربه کاربری و ایمیل‌ها مطابق ترجیحاتم باشد.

Acceptance:

فرم Profile:

DisplayName

PreferredLanguage

TimeZone

Avatar (اختیاری)

Endpoint:

GET /api/account/profile

PUT /api/account/profile

multi-tenant:

پروفایل per tenant-user (ممکن است user در چند tenant باشد، پروفایل‌ها جدا).

Epic 3 – Security (Password, MFA, Backup, Trusted Devices)
US 3.1 – تغییر پسورد

به عنوان End User
می‌خواهم خودم پسوردم را عوض کنم
تا برای کارهای ساده مجبور به تماس با پشتیبانی نباشم.

Acceptance:

فرم:

CurrentPassword

NewPassword

ConfirmPassword

validation توسط password policy tenant (از Phase 1/3).

Endpoint:

POST /api/account/security/change-password

Audit:

event "Account.PasswordChanged" ثبت شود.

US 3.2 – مشاهده و مدیریت MFA Methods

به عنوان End User
می‌خواهم ببینم چه روش‌های MFA فعالی دارم و بتوانم مدیریت‌شان کنم
تا کنترل کامل روی امنیت حسابم داشته باشم.

Acceptance:

لیست MFA methods:

TOTP App

SMS (اگر فعال است)

Recovery codes

Endpoint:

GET /api/account/security/mfa-methods

عملیات:

POST /api/account/security/mfa/totp/setup

POST /api/account/security/mfa/totp/confirm

DELETE /api/account/security/mfa/totp

POST /api/account/security/mfa/recovery-codes/regenerate

ادغام با Security module:

استفاده از همان سرویس MFA Phase 3، فقط endpointهای end-user.

US 3.3 – Trusted Devices

به عنوان End User
می‌خواهم لیست دیوایس‌هایی که بهشان اعتماد داده‌ام را ببینم و مدیریت کنم
تا در صورت نیاز، اعتماد را پس بگیرم.

Acceptance:

لیست UserDevice با:

DeviceType, Browser/OS, LastSeen, LastIp, Country, IsTrusted

عملیات:

DELETE /api/account/devices/{id} (حذف اعتماد/دیوایس)

DELETE /api/account/devices (حذف همه trusted devices)

Audit:

"Account.TrustedDevice.Removed"

Epic 4 – Sessions & Activity
US 4.1 – مشاهده و kill کردن Sessions

به عنوان End User
می‌خواهم تمام sessionهای باز روی حسابم را ببینم و در صورت شک kill کنم
تا امنیت حسابم حفظ شود.

Acceptance:

صفحه Sessions:

لیست:

sessionId

device/browser

location approx

createdAt

lastActivityAt

current (علامت بزن)

عملیات:

GET /api/account/sessions

DELETE /api/account/sessions/{sessionId}

DELETE /api/account/sessions (kill all except current)

ادغام با Session storage (Phaseهای قبل):

استفاده از ISessionOverviewService.

US 4.2 – Activity / Login History

به عنوان End User
می‌خواهم تاریخچه ورود و فعالیت‌های امنیتی خودم را ببینم
تا اگر اتفاقی مشکوک دیدم، سریع متوجه شوم.

Acceptance:

Activity list:

Login success/fail

MFA challenge

Password change

New device

Endpoint:

GET /api/account/activity?from=...&to=...

منبع:

از AuditEvents (Phase 6) با filter:

ActorId = current user

Category = Auth, Security

Epic 5 – Apps & Consents
US 5.1 – لیست اپ‌ها و consentها

به عنوان End User
می‌خواهم ببینم چه اپلیکیشن‌هایی به حساب من دسترسی دارند
و چه scopes و اطلاعاتی را می‌بینند.

Acceptance:

صفحه Apps & Consents:

لیست:

ApplicationName

ClientId

GrantedScopes

GrantedAt

LastUsedAt

Endpoint:

GET /api/account/consents

منبع:

UserConsent entity.

US 5.2 – Revoke consent

به عنوان End User
می‌خواهم دسترسی یک اپ را لغو کنم
تا دیگر نتواند به داده‌ها / tokenهای من دسترسی داشته باشد.

Acceptance:

دکمه revoke روی هر app:

POST /api/account/consents/{id}/revoke

رفتار:

همه refresh tokenهای مرتبط با آن client برای این user revoke شوند.

next login آن app نیاز به consent مجدد دارد.

Audit:

"Account.Consent.Revoked" ثبت شود.

Epic 6 – Recovery & Notifications
US 6.1 – Recovery options

به عنوان End User
می‌خواهم recovery email/phone خودم را تنظیم کنم
تا اگر password/MFA را از دست دادم، بتوانم خودم بازیابی کنم.

Acceptance:

RecoveryOptions:

Email

Phone (اختیاری)

Endpoint:

GET /api/account/recovery-options

PUT /api/account/recovery-options

verification:

برای email/phone جدید، OTP verification.

ادغام با existing email/SMS infra (اگر داری).

US 6.2 – Notification preferences

به عنوان End User
می‌خواهم تعیین کنم چه نوع اعلان‌های امنیتی را روی چه کانالی دریافت کنم
تا هم آگاه باشم و هم اسپم نشود.

Acceptance:

NotificationPreference per event type:

NewLogin

NewDeviceTrusted

PasswordChanged

MFAChanged

Channels:

Email

Sms

InApp

Endpoint:

GET /api/account/notification-preferences

PUT /api/account/notification-preferences

هنگام رخ دادن event:

از این تنظیمات برای trigger notification استفاده شود (Phase بعدی می‌تواند delivery را گسترش دهد).

4. Dev Tasks – Backend
4.1 Database & Entities

Task B9-1 – تعریف Entities و DbSet

اضافه کردن:

UserProfileEntity

UserDeviceEntity

UserRecoveryOptionEntity

UserNotificationPreferenceEntity

UserConsentEntity

اضافه DbSetها در DbContext.

Task B9-2 – EF Configurations و Index

UserProfile:

unique (TenantId, UserId)

UserDevice:

index (TenantId, UserId, DeviceId)

UserConsent:

index (TenantId, UserId, ClientId)

UserNotificationPreference:

unique per (TenantId, UserId, NotificationEventType)

Task B9-3 – Migration Phase 9

ساخت جداول AccountCenter بدون دست زدن به داده‌های قبلی.

4.2 Services

Task B9-4 – IAccountProfileService

GetProfileAsync(tenantId, userId)

UpdateProfileAsync(tenantId, userId, UpdateAccountProfileRequest)

Task B9-5 – IAccountSecurityService

ChangePasswordAsync(tenantId, userId, ChangePasswordRequest):

validate current password

enforce password policy

update credential

audit event

GetMfaMethodsAsync(tenantId, userId)

wrapper روی MFA services موجود برای TOTP/SMS و recovery codes.

Task B9-6 – ISessionOverviewService

اگر قبلاً وجود دارد، آن را گسترش بده:

GetUserSessionsAsync(tenantId, userId)

TerminateSessionAsync(tenantId, userId, sessionId)

TerminateAllSessionsAsync(tenantId, userId, excludeCurrent)

Task B9-7 – IDeviceService

RegisterOrUpdateDeviceAsync(tenantId, userId, context):

هنگام login، device info را update کند.

GetUserDevicesAsync(tenantId, userId)

RemoveDeviceAsync(tenantId, userId, deviceId)

RemoveAllDevicesAsync(tenantId, userId)

Task B9-8 – IConsentService

GetUserConsentsAsync(tenantId, userId)

RevokeConsentAsync(consentId, tenantId, userId):

revoke refresh tokens for that client+user

set consent revoked or delete row.

Task B9-9 – INotificationPreferenceService

GetPreferencesAsync(tenantId, userId)

UpdatePreferencesAsync(tenantId, userId, UpdateNotificationPreferenceRequest)

Task B9-10 – RecoveryOptions Service

GetRecoveryOptionsAsync(tenantId, userId)

UpdateRecoveryOptionsAsync(tenantId, userId, UpdateRecoveryOptionsRequest):

trigger verification flows (send email/SMS with OTP)

mark verified flags.

4.3 API Endpoints – Account (End User)

Base: /api/account

Task B9-11 – Profile API

GET /api/account/profile

PUT /api/account/profile

Task B9-12 – Security API

POST /api/account/security/change-password

GET /api/account/security/mfa-methods

POST /api/account/security/mfa/totp/setup

POST /api/account/security/mfa/totp/confirm

DELETE /api/account/security/mfa/totp

POST /api/account/security/mfa/recovery-codes/regenerate

Task B9-13 – Devices & Sessions API

GET /api/account/devices

DELETE /api/account/devices/{deviceId}

DELETE /api/account/devices // remove all trusted

GET /api/account/sessions

DELETE /api/account/sessions/{sessionId}

DELETE /api/account/sessions // kill all except current

Task B9-14 – Activity API

GET /api/account/activity

از Observability module (AuditEvents) query کند.

Task B9-15 – Consents API

GET /api/account/consents

POST /api/account/consents/{id}/revoke

Task B9-16 – Recovery & Notifications API

GET /api/account/recovery-options

PUT /api/account/recovery-options

GET /api/account/notification-preferences

PUT /api/account/notification-preferences

همه endpointها:

context: tenant + user از token

access control: فقط خود user؛ Tenant Admin از مسیر دیگری view/admin می‌کند.

4.4 Integration با سایر ماژول‌ها

Task B9-17 – ادغام با Login Flow

هنگام login موفق:

DeviceService.RegisterOrUpdateDeviceAsync

اگر new device → event برای notification (Phase بعدی) و AuditEvent.

Task B9-18 – ادغام با MFA / Security

MFA methods endpointها از سرویس Phase 3 استفاده کنند؛ فقط wrapper هستند.

وقتی user MFA changes انجام می‌دهد:

notification preferences apply شوند (برای ارسال email/SMS بعداً).

Task B9-19 – ادغام با Consent / Token issuance

هنگام صدور token (Phase 1/7):

زمانی که user در اولین بار consent می‌دهد:

UserConsent ایجاد شود.

برای subsequent tokens:

LastUsedAt update شود.

هنگام revoke consent:

refresh tokens دسته مربوطه revoke.

Task B9-20 – Observability / Audit

با IAuditWriter (Phase 6):

"Account.Profile.Updated"

"Account.PasswordChanged"

"Account.Mfa.Changed"

"Account.Device.Removed"

"Account.Sessions.Terminated"

"Account.Consent.Revoked"

"Account.RecoveryOptions.Updated"

"Account.NotificationPreferences.Updated"

5. Dev Tasks – Frontend (Account Center React)
5.1 – Shell & Routing

Task F9-1 – Account Center App

اگر Login Portal جداست، یک React app جدید:

/account/*

Layout:

Sidebar یا tabs:

Profile

Security

Devices & Sessions

Activity

Apps & Consents

Recovery & Notifications

Task F9-2 – اتصال به Auth

Account Center فقط با user logged-in در context قابل دسترسی باشد.

استفاده از همان tokenهایی که login portal دارد.

5.2 – صفحات

Task F9-3 – Profile Page

فرم:

DisplayName

Language (dropdown)

TimeZone (dropdown)

نمایش Avatar + upload (اگر scope Phase 9 اجازه می‌دهد، فقط انتخاب عکس ساده).

call:

GET /api/account/profile

PUT /api/account/profile

Task F9-4 – Security Page

دو بخش:

Change Password

MFA Methods

Change Password:

فرم با current/new/confirm

validations

نمایش errorهای policy با پیام‌های localized.

MFA Methods:

نمایش mfa-methods

دکمه:

"Set up Authenticator App"

"Regenerate recovery codes"

flow setup TOTP:

نمایش QR code + secret

input OTP → confirm endpoint.

Task F9-5 – Devices & Sessions Page

Devices tab:

جدول UserDevice:

DeviceType (icon)

Browser/OS

LastSeenAt

LastIp/Country

IsTrusted

دکمه:

"Remove" per device

"Remove all trusted devices"

Sessions tab:

لیست sessions:

Device

Location

CreatedAt

LastActivityAt

علامت "This device"

actions:

"Sign out" per session

"Sign out from all other sessions"

Task F9-6 – Activity Page

لیست Activity entries:

Time

Type (Login success/fail, Password change, MFA events)

Location (Country)

Device

فیلتر by date range.

Task F9-7 – Apps & Consents Page

لیست UserConsent:

ApplicationName

scopes (badgeها)

GrantedAt

LastUsedAt

دکمه:

"Revoke access" per app.

Confirmation modal که توضیح می‌دهد app بعداً نیاز به login+consent مجدد دارد.

Task F9-8 – Recovery & Notifications Page

Recovery options section:

Email

Phone

status: Verified / Not verified

دکمه ارسال code برای verify.

Notification preferences:

جدول:

EventType (NewLogin, NewDevice, PasswordChanged, MFAChanged)

checkbox برای کانال‌های Email/SMS/InApp

call GET/PUT /api/account/notification-preferences.

6. Cross-cutting Tasks

Task X9-1 – Localization

تمام متن‌های Account Center دو زبانه.

هیچ متن خام انگلیسی/فارسی در JSX بدون i18n.

Task X9-2 – Security & Privacy

مطمئن شو:

user فقط به داده‌های خودش دسترسی دارد (tenant + user scoped).

هیچ identifier داخلی حساس در UI نشان داده نشود.

Activity و logs:

IP/adress تا حد لازم نمایش داده شود، نه full internal details.

Task X9-3 – Performance

Activity و Consents و Sessions:

pagination (یا at least take محدود).

Queryهای AuditEvents برای Activity حتماً indexهای Phase 6 را استفاده کنند.

Task X9-4 – UX

هر action حساس (password, MFA, revoke consent, kill sessions):

confirmation modal

feedback واضح (success/error).

7. نکات طراحی Phase 9

اگر این فاز را نزنی، از دید user سیستم تو هنوز در سطح «فقط یک login form» است.

Account Center باید آن‌قدر تمیز باشد که:

user عادی بدون آموزش بفهمد چطور security خودش را مدیریت کند.

از Security و Observability که قبلاً ساختی مصرف‌کننده‌ی واقعی بساز:

Activity page = مصرف‌کننده‌ی واقعی Audit.

Devices/Sessions = مصرف‌کننده‌ی واقعی Session + Trusted devices.