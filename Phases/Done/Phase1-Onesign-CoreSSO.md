# onesign – Phase 1 Core SSO Platform Specification

## 1. هدف و محدوده Phase 1

### 1.1. هدف کلی

پیاده‌سازی یک **Core SSO SaaS** کامل و قابل فروش برای مشتری‌های B2B / Enterprise متوسط، با این خصوصیات:

- Multi-tenant واقعی (هر مشتری = یک Tenant با تنظیمات جداگانه)
- Identity Provider مبتنی بر **OIDC Authorization Code + PKCE**
- **Email/Password** + یک Social Login (Google)
- دو Portal فرانت‌اند مستقل:
  - **Login Portal** (مخصوص End User)
  - **Admin Portal** (Global Admin + Tenant Admin)
- User / Tenant / Application / Token / Audit پایه
- SDK مینیمال ولی تمیز برای:
  - Backend .NET
  - Frontend React

### 1.2. در این فاز پیاده می‌شود

- Multi-tenant منطقی (single DB + TenantId در همه جداول)
- Tenant & TenantConfig + Branding پایه (logo + primary color)
- GlobalUser / TenantUser
- ApplicationClient و Redirect URIs
- OIDC:
  - Discovery document
  - Authorization Code + PKCE
  - Token issuance (access_token + id_token)
- Email/Password login
- Google Social Login
- Session Management ساده
- Audit log پایه
- Login Portal (React)
- Admin Portal (React)
- .NET SDK و React SDK مینیمال

### 1.3. در این فاز عمداً پیاده **نمی‌شود** (فقط در طراحی لحاظ می‌شود)

- OrgUnit / Delegated Admin UI
- RBAC پیچیده، ABAC، Policy Engine
- MFA پیشرفته، Risk Based، Device Fingerprint
- SCIM، SAML
- Per-tenant database / schema
- Billing پیچیده و Portal مالی

---

## 2. معماری کلان Phase 1

### 2.1. Backend – Modular Monolith (.NET 10)

Solution (داخل `src/`):

- `Onesign.Api`  
- `Onesign.Shared` (cross-cutting)  
- `Onesign.Modules.Tenants`  
- `Onesign.Modules.Identity`  
- `Onesign.Modules.Applications`  
- `Onesign.Modules.Audit`

هر ماژول ساختار داخلی مشابه دارد:

- `Domain/`
  - `Entities/`
  - `ValueObjects/`
  - `Events/`
  - `Services/`
  - `Repositories/`
- `Application/`
  - `Commands/`
  - `Queries/`
  - `DTOs/`
- `Infrastructure/`
  - `EfCore/Entities/`
  - `EfCore/Configurations/`
  - `EfCore/Repositories/`

### 2.2. Frontend – تفکیک کامل

1. **Login Portal**  
   Repo / پروژه: `onesign-login-portal`  
   - React / Next.js  
   - صفحات:
     - `/login`
     - `/forgot-password`
     - `/reset-password`
     - `/callback` (OIDC)
   - Multi-tenant aware (بر اساس domain و client_id)

2. **Admin Portal**  
   Repo / پروژه: `onesign-admin-portal`  
   - React / Next.js  
   - Role-based view (Global Admin / Tenant Admin)
   - صفحات:
     - `/admin/tenants` (Global)
     - `/tenant/dashboard`
     - `/tenant/users`
     - `/tenant/apps`
     - `/tenant/audit`

---

## 3. ساختار بک‌اند – پوشه‌ها، کلاس‌ها، DbContext

### 3.1. Solution structure

```text
src/
  Onesign.Api/
    Program.cs
    appsettings.json
    Controllers/
      Admin/
      Tenant/
      Auth/
      Discovery/
      Audit/
  Onesign.Shared/
    Abstractions/
    Exceptions/
    Result/
    Pagination/
    Tenant/
      ITenantContext.cs
      TenantContext.cs
    Security/
      ICurrentUserService.cs
  Onesign.Modules.Tenants/
    Domain/
      Entities/
        Tenant.cs
        TenantConfig.cs
        TenantDomain.cs (optional)
      Enums/
        TenantStatus.cs
      Repositories/
        ITenantRepository.cs
        ITenantConfigRepository.cs
    Application/
      DTOs/
        TenantDto.cs
        TenantSummaryDto.cs
        CreateTenantRequest.cs
        UpdateTenantStatusRequest.cs
      Commands/
        CreateTenantCommand.cs
        UpdateTenantStatusCommand.cs
      Queries/
        GetTenantsQuery.cs
    Infrastructure/
      EfCore/Entities/
        TenantEntity.cs
        TenantConfigEntity.cs
      EfCore/Configurations/
        TenantEntityTypeConfiguration.cs
        TenantConfigEntityTypeConfiguration.cs
      EfCore/Repositories/
        TenantRepository.cs
        TenantConfigRepository.cs

  Onesign.Modules.Identity/
    Domain/
      Entities/
        GlobalUser.cs
        TenantUser.cs
        PasswordResetToken.cs
        UserLoginSession.cs
        ExternalLogin.cs
      Enums/
        TenantUserStatus.cs
      Repositories/
        IGlobalUserRepository.cs
        ITenantUserRepository.cs
        IPasswordResetTokenRepository.cs
        IUserLoginSessionRepository.cs
        IExternalLoginRepository.cs
      Services/
        IPasswordHasher.cs
        IAuthService.cs
    Application/
      DTOs/
        GlobalUserDto.cs
        TenantUserDto.cs
        InviteUserRequest.cs
        ResetPasswordRequest.cs
        ResetPasswordConfirmRequest.cs
        LoginRequest.cs
      Commands/
        InviteUserToTenantCommand.cs
        CompleteFirstLoginCommand.cs
        DisableTenantUserCommand.cs
        RequestPasswordResetCommand.cs
        ConfirmPasswordResetCommand.cs
        PasswordLoginCommand.cs
      Queries/
        GetTenantUsersQuery.cs
        GetUserDetailsQuery.cs
    Infrastructure/
      EfCore/Entities/
        GlobalUserEntity.cs
        TenantUserEntity.cs
        PasswordResetTokenEntity.cs
        UserLoginSessionEntity.cs
        ExternalLoginEntity.cs
      EfCore/Configurations/
        GlobalUserEntityTypeConfiguration.cs
        TenantUserEntityTypeConfiguration.cs
      EfCore/Repositories/
        GlobalUserRepository.cs
        TenantUserRepository.cs
      Security/
        PasswordHasher.cs
        AuthService.cs

  Onesign.Modules.Applications/
    Domain/
      Entities/
        ApplicationClient.cs
        ClientRedirectUri.cs
        ClientSecret.cs
      Enums/
        ApplicationType.cs
        GrantType.cs
      Repositories/
        IApplicationClientRepository.cs
    Application/
      DTOs/
        ApplicationClientDto.cs
        CreateApplicationClientRequest.cs
        UpdateApplicationClientRequest.cs
        AddRedirectUriRequest.cs
        RedirectUriDto.cs
      Commands/
        CreateApplicationClientCommand.cs
        UpdateApplicationClientCommand.cs
        AddRedirectUriCommand.cs
        RemoveRedirectUriCommand.cs
      Queries/
        GetApplicationsForTenantQuery.cs
        GetApplicationDetailsQuery.cs
    Infrastructure/
      EfCore/Entities/
        ApplicationClientEntity.cs
        ClientRedirectUriEntity.cs
        ClientSecretEntity.cs
      EfCore/Configurations/
        ApplicationClientEntityTypeConfiguration.cs
      EfCore/Repositories/
        ApplicationClientRepository.cs

  Onesign.Modules.Audit/
    Domain/
      Entities/
        AuditEvent.cs
      Enums/
        AuditEventType.cs
      Repositories/
        IAuditEventRepository.cs
    Application/
      DTOs/
        AuditEventDto.cs
        AuditFilterRequest.cs
      Commands/
        AppendAuditEventCommand.cs
      Queries/
        GetAuditEventsQuery.cs
    Infrastructure/
      EfCore/Entities/
        AuditEventEntity.cs
      EfCore/Configurations/
        AuditEventEntityTypeConfiguration.cs
      EfCore/Repositories/
        AuditEventRepository.cs
