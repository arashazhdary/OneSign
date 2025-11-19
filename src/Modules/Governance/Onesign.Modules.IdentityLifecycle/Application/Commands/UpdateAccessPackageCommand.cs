using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Commands;

public class UpdateAccessPackageCommand : IRequest<Result<AccessPackageDto>>
{
    public Guid TenantId { get; set; }
    public Guid PackageId { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public List<Guid>? RoleIds { get; set; }
    public List<Guid>? ApplicationIds { get; set; }
    public bool? IsEnabled { get; set; }
}
