namespace Onesign.Modules.Security.Application.DTOs;

public class SecurityPolicyDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public int MfaRequirement { get; set; } // 0=None, 1=AdminsOnly, 2=AllUsers
    public bool AllowTrustedDevices { get; set; }
    public int TrustedDeviceExpireDays { get; set; }
    public int SessionTimeoutMinutes { get; set; }
    public int MaxFailedLoginAttempts { get; set; }
}
