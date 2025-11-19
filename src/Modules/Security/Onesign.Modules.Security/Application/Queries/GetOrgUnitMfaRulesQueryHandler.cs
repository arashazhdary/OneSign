using MediatR;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Modules.Security.Application.Queries;

public class GetOrgUnitMfaRulesQueryHandler : IRequestHandler<GetOrgUnitMfaRulesQuery, List<OrgUnitMfaRuleDto>>
{
    private readonly IOrgUnitMfaRuleRepository _repository;

    public GetOrgUnitMfaRulesQueryHandler(IOrgUnitMfaRuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<List<OrgUnitMfaRuleDto>> Handle(GetOrgUnitMfaRulesQuery request, CancellationToken cancellationToken)
    {
        var rules = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        return rules.Select(r => new OrgUnitMfaRuleDto
        {
            Id = r.Id,
            OrgUnitId = r.OrgUnitId,
            OrgUnitName = string.Empty,
            MfaRequirement = (int)r.MfaRequirement
        }).ToList();
    }
}
