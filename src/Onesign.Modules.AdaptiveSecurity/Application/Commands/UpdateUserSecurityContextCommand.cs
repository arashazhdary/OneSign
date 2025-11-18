using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Commands;

public class UpdateUserSecurityContextCommand : IRequest<Result<UserSecurityContextDto>>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public string? LastLoginLocation { get; set; }
    public string? LastLoginDevice { get; set; }
    public List<string>? TrustedDevices { get; set; }
    public List<string>? TrustedLocations { get; set; }
}
