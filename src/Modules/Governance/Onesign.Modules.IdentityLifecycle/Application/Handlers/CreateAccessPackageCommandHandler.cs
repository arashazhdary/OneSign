using System.Text.Json;
using MediatR;
using Onesign.Modules.IdentityLifecycle.Application.Commands;
using Onesign.Modules.IdentityLifecycle.Application.DTOs;
using Onesign.Modules.IdentityLifecycle.Domain.Entities;
using Onesign.Modules.IdentityLifecycle.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.IdentityLifecycle.Application.Handlers;

public class CreateAccessPackageCommandHandler : IRequestHandler<CreateAccessPackageCommand, Result<AccessPackageDto>>
{
    private readonly IAccessPackageRepository _repository;

    public CreateAccessPackageCommandHandler(IAccessPackageRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<AccessPackageDto>> Handle(CreateAccessPackageCommand request, CancellationToken cancellationToken)
    {
        var package = new AccessPackage
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name,
            Description = request.Description,
            RoleIdsJson = JsonSerializer.Serialize(request.RoleIds),
            ApplicationIdsJson = JsonSerializer.Serialize(request.ApplicationIds),
            IsEnabled = request.IsEnabled,
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(package, cancellationToken);

        var dto = new AccessPackageDto
        {
            Id = package.Id,
            TenantId = package.TenantId,
            Name = package.Name,
            Description = package.Description,
            RoleIds = request.RoleIds,
            ApplicationIds = request.ApplicationIds,
            IsEnabled = package.IsEnabled,
            CreatedAt = package.CreatedAt
        };

        return Result.Success(dto);
    }
}
