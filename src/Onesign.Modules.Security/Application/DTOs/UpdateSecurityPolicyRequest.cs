namespace Onesign.Modules.Security.Application.DTOs;

public class UpdateSecurityPolicyRequest
{
    public int MfaRequirement { get; set; }
    public bool AllowTrustedDevices { get; set; }
    public int TrustedDeviceExpireDays { get; set; }
    public int SessionTimeoutMinutes { get; set; }
    public int MaxFailedLoginAttempts { get; set; }
}
