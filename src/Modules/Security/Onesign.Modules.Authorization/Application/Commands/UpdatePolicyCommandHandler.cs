using MediatR;
using Onesign.Modules.Authorization.Application.DTOs;
using Onesign.Modules.Authorization.Domain.Entities;
using Onesign.Modules.Authorization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Authorization.Application.Commands;

public class UpdatePolicyCommandHandler : IRequestHandler<UpdatePolicyCommand, Result<PolicyDefinitionDto>>
{
    private readonly IPolicyDefinitionRepository _policyRepository;

    public UpdatePolicyCommandHandler(IPolicyDefinitionRepository policyRepository)
    {
        _policyRepository = policyRepository;
    }

    public async Task<Result<PolicyDefinitionDto>> Handle(UpdatePolicyCommand request, CancellationToken cancellationToken)
    {
        var existing = await _policyRepository.GetByIdAsync(request.Id, cancellationToken);
        if (existing == null)
            return Result.Failure<PolicyDefinitionDto>("Policy not found");

        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure<PolicyDefinitionDto>("Policy name is required");

        existing.Name = request.Name.Trim();
        existing.Description = request.Description.Trim();
        existing.Effect = request.Effect;
        existing.Priority = request.Priority;
        existing.Enabled = request.Enabled;
        existing.UpdatedAt = DateTime.UtcNow;
        existing.ConditionGroups = request.ConditionGroups.Select(g => new PolicyConditionGroup
        {
            Id = g.Id == Guid.Empty ? Guid.NewGuid() : g.Id,
            PolicyDefinitionId = existing.Id,
            LogicalOperator = g.LogicalOperator,
            Conditions = g.Conditions.Select(c => new PolicyCondition
            {
                Id = c.Id == Guid.Empty ? Guid.NewGuid() : c.Id,
                SourceType = c.SourceType,
                SourceKey = c.SourceKey.Trim(),
                Operator = c.Operator,
                Value = c.Value.Trim()
            }).ToList()
        }).ToList();

        await _policyRepository.UpdateAsync(existing, cancellationToken);

        var dto = new PolicyDefinitionDto
        {
            Id = existing.Id,
            TenantId = existing.TenantId,
            Name = existing.Name,
            Description = existing.Description,
            Effect = existing.Effect,
            Priority = existing.Priority,
            Enabled = existing.Enabled,
            CreatedAt = existing.CreatedAt,
            ConditionGroups = existing.ConditionGroups.Select(g => new PolicyConditionGroupDto
            {
                Id = g.Id,
                LogicalOperator = g.LogicalOperator,
                Conditions = g.Conditions.Select(c => new PolicyConditionDto
                {
                    Id = c.Id,
                    SourceType = c.SourceType,
                    SourceKey = c.SourceKey,
                    Operator = c.Operator,
                    Value = c.Value
                }).ToList()
            }).ToList()
        };

        return Result.Success(dto);
    }
}
