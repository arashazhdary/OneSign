namespace Onesign.Modules.Audit.Domain.Enums;

public enum AuditEventType
{
    UserLogin = 1,
    UserLogout = 2,
    UserCreated = 3,
    UserUpdated = 4,
    UserDeleted = 5,
    UserInvited = 6,
    UserDisabled = 7,
    UserEnabled = 8,
    TenantCreated = 9,
    TenantUpdated = 10,
    TenantDeleted = 11,
    TenantStatusChanged = 12,
    ApplicationCreated = 13,
    ApplicationUpdated = 14,
    ApplicationDeleted = 15,
    ApplicationClientSecretAdded = 18,
    ApplicationClientSecretRemoved = 19,
    PasswordChanged = 16,
    PasswordReset = 17,
    OrgUnitCreated = 20,
    OrgUnitUpdated = 21,
    OrgUnitDeleted = 22,
    OrgUnitMoved = 23,
    UserOrgUnitAssigned = 24,
    UserOrgUnitRemoved = 25,
    ApplicationOrgUnitAssigned = 26,
    ApplicationOrgUnitRemoved = 27,
    DelegatedAdminCreated = 28,
    DelegatedAdminRemoved = 29
}

