using MediatR;

namespace Onesign.Modules.Security.Application.Queries;

public class CheckMfaRequirementQuery : IRequest<bool>
{
    public Guid TenantId { get; set; }
    public Guid UserId { get; set; }
    public Guid? OrgUnitId { get; set; }
    public bool IsAdmin { get; set; }
}
