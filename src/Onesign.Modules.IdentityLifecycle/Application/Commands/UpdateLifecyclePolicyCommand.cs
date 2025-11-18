using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Commands;

public class UpdateLifecyclePolicyCommand : IRequest<Result<LifecyclePolicyDto>>
{
    public Guid TenantId { get; set; }
    public Guid PolicyId { get; set; }
    public string? Name { get; set; }
    public string? OrgUnitCode { get; set; }
    public string? JobRole { get; set; }
    public string? Location { get; set; }
    public string? EmploymentType { get; set; }
    public List<Guid>? AccessPackageIds { get; set; }
    public bool? IsEnabled { get; set; }
}
