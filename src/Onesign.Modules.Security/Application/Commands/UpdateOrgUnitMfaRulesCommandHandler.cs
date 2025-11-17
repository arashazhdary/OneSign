using MediatR;
using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Enums;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Modules.Security.Application.Commands;

public class UpdateOrgUnitMfaRulesCommandHandler : IRequestHandler<UpdateOrgUnitMfaRulesCommand, Unit>
{
    private readonly IOrgUnitMfaRuleRepository _repository;

    public UpdateOrgUnitMfaRulesCommandHandler(IOrgUnitMfaRuleRepository repository)
    {
        _repository = repository;
    }

    public async Task<Unit> Handle(UpdateOrgUnitMfaRulesCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var existingDict = existing.ToDictionary(r => r.OrgUnitId);

        foreach (var rule in request.Rules)
        {
            if (existingDict.TryGetValue(rule.OrgUnitId, out var existingRule))
            {
                existingRule.UpdateRequirement((MfaRequirementLevel)rule.MfaRequirement);
                await _repository.UpdateAsync(existingRule, cancellationToken);
            }
            else
            {
                var newRule = OrgUnitMfaRule.Create(
                    request.TenantId,
                    rule.OrgUnitId,
                    (MfaRequirementLevel)rule.MfaRequirement
                );
                await _repository.AddAsync(newRule, cancellationToken);
            }
        }

        return Unit.Value;
    }
}
