using System.Text.Json;
using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.Commands;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class UpdateLifecyclePolicyCommandHandler : IRequestHandler<UpdateLifecyclePolicyCommand, Result<LifecyclePolicyDto>>
{
    private readonly ILifecyclePolicyRepository _repository;

    public UpdateLifecyclePolicyCommandHandler(ILifecyclePolicyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<LifecyclePolicyDto>> Handle(UpdateLifecyclePolicyCommand request, CancellationToken cancellationToken)
    {
        var policy = await _repository.GetByIdAsync(request.PolicyId, cancellationToken);
        if (policy == null || policy.TenantId != request.TenantId)
            return Result.Failure<LifecyclePolicyDto>("NotFound", "Lifecycle policy not found");

        if (request.Name != null)
            policy.Name = request.Name;
        if (request.OrgUnitCode != null)
            policy.OrgUnitCode = request.OrgUnitCode;
        if (request.JobRole != null)
            policy.JobRole = request.JobRole;
        if (request.Location != null)
            policy.Location = request.Location;
        if (request.EmploymentType != null)
            policy.EmploymentType = request.EmploymentType;
        if (request.AccessPackageIds != null)
            policy.AccessPackageIdsJson = JsonSerializer.Serialize(request.AccessPackageIds);
        if (request.IsEnabled.HasValue)
            policy.IsEnabled = request.IsEnabled.Value;

        await _repository.UpdateAsync(policy, cancellationToken);

        var dto = new LifecyclePolicyDto
        {
            Id = policy.Id,
            TenantId = policy.TenantId,
            Name = policy.Name,
            OrgUnitCode = policy.OrgUnitCode,
            JobRole = policy.JobRole,
            Location = policy.Location,
            EmploymentType = policy.EmploymentType,
            AccessPackageIds = JsonSerializer.Deserialize<List<Guid>>(policy.AccessPackageIdsJson) ?? new(),
            IsEnabled = policy.IsEnabled,
            CreatedAt = policy.CreatedAt
        };

        return Result.Success(dto);
    }
}
