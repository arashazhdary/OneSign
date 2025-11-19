namespace Onesign.Modules.Security.Domain.Enums;

public enum RiskEventType
{
    NewDeviceLogin = 1,
    GeoAnomaly = 2,
    MultipleFailedLogins = 3,
    SuspiciousActivity = 4,
    MfaFailed = 5
}
