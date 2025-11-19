using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Domain.Enums;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Commands;

public class UpdateAdaptivePolicyCommand : IRequest<Result<AdaptivePolicyDto>>
{
    public Guid TenantId { get; set; }
    public Guid PolicyId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Conditions { get; set; } = "{}";
    public List<AdaptiveActionType> Actions { get; set; } = new();
    public RiskLevel RiskThreshold { get; set; }
    public bool IsEnabled { get; set; }
    public int Priority { get; set; }
}

public class UpdateAdaptivePolicyCommandHandler : IRequestHandler<UpdateAdaptivePolicyCommand, Result<AdaptivePolicyDto>>
{
    private readonly IAdaptivePolicyRepository _repository;

    public UpdateAdaptivePolicyCommandHandler(IAdaptivePolicyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AdaptivePolicyDto>> Handle(UpdateAdaptivePolicyCommand request, CancellationToken cancellationToken)
    {
        var policy = await _repository.GetByIdAsync(request.PolicyId, cancellationToken);

        if (policy == null)
            return Result.Failure<AdaptivePolicyDto>("PolicyNotFound", "Adaptive policy not found");

        if (policy.TenantId != request.TenantId)
            return Result.Failure<AdaptivePolicyDto>("Unauthorized", "Policy does not belong to this tenant");

        policy.Name = request.Name;
        policy.Description = request.Description;
        policy.Conditions = request.Conditions;
        policy.Actions = request.Actions;
        policy.RiskThreshold = request.RiskThreshold;
        policy.IsEnabled = request.IsEnabled;
        policy.Priority = request.Priority;
        policy.UpdatedAt = DateTime.UtcNow;

        await _repository.UpdateAsync(policy, cancellationToken);

        var dto = new AdaptivePolicyDto
        {
            Id = policy.Id,
            TenantId = policy.TenantId,
            Name = policy.Name,
            Description = policy.Description,
            Conditions = policy.Conditions,
            Actions = policy.Actions,
            RiskThreshold = policy.RiskThreshold,
            IsEnabled = policy.IsEnabled,
            Priority = policy.Priority,
            CreatedAt = policy.CreatedAt,
            UpdatedAt = policy.UpdatedAt
        };

        return Result.Success(dto);
    }
}
