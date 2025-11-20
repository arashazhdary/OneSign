using System.Text.Json;
using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Modules.IdentityLifecycle.Application.Queries;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class GetLifecyclePoliciesQueryHandler : IRequestHandler<GetLifecyclePoliciesQuery, Result<List<LifecyclePolicyDto>>>
{
    private readonly ILifecyclePolicyRepository _repository;

    public GetLifecyclePoliciesQueryHandler(ILifecyclePolicyRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<LifecyclePolicyDto>>> Handle(GetLifecyclePoliciesQuery request, CancellationToken cancellationToken)
    {
        var policies = await _repository.GetByTenantAsync(request.TenantId, cancellationToken);

        var dtos = policies.Select(p => new LifecyclePolicyDto
        {
            Id = p.Id,
            TenantId = p.TenantId,
            Name = p.Name,
            OrgUnitCode = p.OrgUnitCode,
            JobRole = p.JobRole,
            Location = p.Location,
            EmploymentType = p.EmploymentType,
            AccessPackageIds = JsonSerializer.Deserialize<List<Guid>>(p.AccessPackageIdsJson) ?? new(),
            IsEnabled = p.IsEnabled,
            CreatedAt = p.CreatedAt
        }).ToList();

        return Result.Success(dtos);
    }
}
