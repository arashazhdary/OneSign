using System.Text.Json;
using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.Commands;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class UpdateAccessPackageCommandHandler : IRequestHandler<UpdateAccessPackageCommand, Result<AccessPackageDto>>
{
    private readonly IAccessPackageRepository _repository;

    public UpdateAccessPackageCommandHandler(IAccessPackageRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AccessPackageDto>> Handle(UpdateAccessPackageCommand request, CancellationToken cancellationToken)
    {
        var package = await _repository.GetByIdAsync(request.PackageId, cancellationToken);
        if (package == null || package.TenantId != request.TenantId)
            return Result.Failure<AccessPackageDto>("NotFound", "Access package not found");

        if (request.Name != null)
            package.Name = request.Name;
        if (request.Description != null)
            package.Description = request.Description;
        if (request.RoleIds != null)
            package.RoleIdsJson = JsonSerializer.Serialize(request.RoleIds);
        if (request.ApplicationIds != null)
            package.ApplicationIdsJson = JsonSerializer.Serialize(request.ApplicationIds);
        if (request.IsEnabled.HasValue)
            package.IsEnabled = request.IsEnabled.Value;

        await _repository.UpdateAsync(package, cancellationToken);

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
