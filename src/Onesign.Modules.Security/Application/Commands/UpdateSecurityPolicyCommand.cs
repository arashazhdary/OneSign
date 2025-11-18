using MediatR;
using Onesign.Modules.Security.Application.DTOs;

namespace Onesign.Modules.Security.Application.Commands;

public class UpdateSecurityPolicyCommand : IRequest<SecurityPolicyDto>
{
    public Guid TenantId { get; set; }
    public int MfaRequirement { get; set; }
    public bool AllowTrustedDevices { get; set; }
    public int TrustedDeviceExpireDays { get; set; }
    public int SessionTimeoutMinutes { get; set; }
    public int MaxFailedLoginAttempts { get; set; }
}
