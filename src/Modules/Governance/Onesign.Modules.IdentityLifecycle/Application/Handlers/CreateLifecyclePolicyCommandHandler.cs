using System.Text.Json;
using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.Commands;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class CreateLifecyclePolicyCommandHandler : IRequestHandler<CreateLifecyclePolicyCommand, Result<LifecyclePolicyDto>>
{
    private readonly ILifecyclePolicyRepository _repository;

    public CreateLifecyclePolicyCommandHandler(ILifecyclePolicyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<LifecyclePolicyDto>> Handle(CreateLifecyclePolicyCommand request, CancellationToken cancellationToken)
    {
        var policy = new LifecyclePolicy
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name,
            OrgUnitCode = request.OrgUnitCode,
            JobRole = request.JobRole,
            Location = request.Location,
            EmploymentType = request.EmploymentType,
            AccessPackageIdsJson = JsonSerializer.Serialize(request.AccessPackageIds),
            IsEnabled = request.IsEnabled,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(policy, cancellationToken);

        var dto = new LifecyclePolicyDto
        {
            Id = policy.Id,
            TenantId = policy.TenantId,
            Name = policy.Name,
            OrgUnitCode = policy.OrgUnitCode,
            JobRole = policy.JobRole,
            Location = policy.Location,
            EmploymentType = policy.EmploymentType,
            AccessPackageIds = request.AccessPackageIds,
            IsEnabled = policy.IsEnabled,
            CreatedAt = policy.CreatedAt
        };

        return Result.Success(dto);
    }
}
