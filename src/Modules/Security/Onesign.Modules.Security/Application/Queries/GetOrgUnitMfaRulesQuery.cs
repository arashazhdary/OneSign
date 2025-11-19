using MediatR;
using Onesign.Modules.Security.Application.DTOs;

namespace Onesign.Modules.Security.Application.Queries;

public class GetOrgUnitMfaRulesQuery : IRequest<List<OrgUnitMfaRuleDto>>
{
    public Guid TenantId { get; set; }
}
