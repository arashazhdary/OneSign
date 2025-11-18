using System.Text.Json;
using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Modules.IdentityLifecycle.Application.Queries;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class GetAccessPackageDetailsQueryHandler : IRequestHandler<GetAccessPackageDetailsQuery, Result<AccessPackageDto>>
{
    private readonly IAccessPackageRepository _repository;

    public GetAccessPackageDetailsQueryHandler(IAccessPackageRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AccessPackageDto>> Handle(GetAccessPackageDetailsQuery request, CancellationToken cancellationToken)
    {
        var package = await _repository.GetByIdAsync(request.PackageId, cancellationToken);
        if (package == null || package.TenantId != request.TenantId)
            return Result.Failure<AccessPackageDto>("NotFound", "Access package not found");

        var dto = new AccessPackageDto
        {
            Id = package.Id,
            TenantId = package.TenantId,
            Name = package.Name,
            Description = package.Description,
            RoleIds = JsonSerializer.Deserialize<List<Guid>>(package.RoleIdsJson) ?? new(),
            ApplicationIds = JsonSerializer.Deserialize<List<Guid>>(package.ApplicationIdsJson) ?? new(),
            IsEnabled = package.IsEnabled,
            CreatedAt = package.CreatedAt
        };

        return Result.Success(dto);
    }
}
