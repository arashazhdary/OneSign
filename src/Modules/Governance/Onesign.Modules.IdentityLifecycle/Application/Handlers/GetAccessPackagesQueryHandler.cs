using System.Text.Json;
using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Modules.IdentityLifecycle.Application.Queries;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class GetAccessPackagesQueryHandler : IRequestHandler<GetAccessPackagesQuery, Result<List<AccessPackageDto>>>
{
    private readonly IAccessPackageRepository _repository;

    public GetAccessPackagesQueryHandler(IAccessPackageRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<AccessPackageDto>>> Handle(GetAccessPackagesQuery request, CancellationToken cancellationToken)
    {
        var packages = await _repository.GetByTenantAsync(request.TenantId, cancellationToken);

        var dtos = packages.Select(p => new AccessPackageDto
        {
            Id = p.Id,
            TenantId = p.TenantId,
            Name = p.Name,
            Description = p.Description,
            RoleIds = JsonSerializer.Deserialize<List<Guid>>(p.RoleIdsJson) ?? new(),
            ApplicationIds = JsonSerializer.Deserialize<List<Guid>>(p.ApplicationIdsJson) ?? new(),
            IsEnabled = p.IsEnabled,
            CreatedAt = p.CreatedAt
        }).ToList();

        return Result.Success(dtos);
    }
}
