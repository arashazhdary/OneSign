using MediatR;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetOrgUnitTreeQuery : IRequest<Result<List<OrgUnitTreeNodeDto>>>
{
    public Guid TenantId { get; set; }
}

