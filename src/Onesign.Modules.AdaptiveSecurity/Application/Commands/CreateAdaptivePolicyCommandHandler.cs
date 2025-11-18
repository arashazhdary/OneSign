using MediatR;
using Onesign.Modules.AdaptiveSecurity.Application.DTOs;
using Onesign.Modules.AdaptiveSecurity.Domain.Entities;
using Onesign.Modules.AdaptiveSecurity.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.AdaptiveSecurity.Application.Commands;

public class CreateAdaptivePolicyCommandHandler : IRequestHandler<CreateAdaptivePolicyCommand, Result<AdaptivePolicyDto>>
{
    private readonly IAdaptivePolicyRepository _repository;

    public CreateAdaptivePolicyCommandHandler(IAdaptivePolicyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AdaptivePolicyDto>> Handle(CreateAdaptivePolicyCommand request, CancellationToken cancellationToken)
    {
        var policy = new AdaptivePolicy
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name,
            Description = request.Description,
            Conditions = request.Conditions,
            Actions = request.Actions,
            RiskThreshold = request.RiskThreshold,
            IsEnabled = request.IsEnabled,
            Priority = request.Priority,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(policy, cancellationToken);

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
