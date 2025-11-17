using MediatR;
using Onesign.Modules.Developer.Application.DTOs;
using Onesign.Modules.Developer.Domain.Entities;
using Onesign.Modules.Developer.Domain.Enums;
using Onesign.Modules.Developer.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Developer.Application.Commands;

public class CreateServiceAccountCommandHandler : IRequestHandler<CreateServiceAccountCommand, Result<ServiceAccountDto>>
{
    private readonly IServiceAccountRepository _serviceAccountRepository;

    public CreateServiceAccountCommandHandler(IServiceAccountRepository serviceAccountRepository)
    {
        _serviceAccountRepository = serviceAccountRepository;
    }

    public async Task<Result<ServiceAccountDto>> Handle(CreateServiceAccountCommand request, CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Result.Failure<ServiceAccountDto>("Service account name is required");

        if (string.IsNullOrWhiteSpace(request.Email))
            return Result.Failure<ServiceAccountDto>("Email is required");

        // Check for duplicate email
        var existing = await _serviceAccountRepository.GetByEmailAsync(request.TenantId, request.Email, cancellationToken);
        if (existing != null)
            return Result.Failure<ServiceAccountDto>("A service account with this email already exists");

        var serviceAccount = new ServiceAccount
        {
            Id = Guid.NewGuid(),
            TenantId = request.TenantId,
            Name = request.Name.Trim(),
            Description = request.Description.Trim(),
            Email = request.Email.Trim().ToLowerInvariant(),
            Status = ServiceAccountStatus.Active,
            Roles = request.Roles,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = request.CreatedByUserId
        };

        var created = await _serviceAccountRepository.AddAsync(serviceAccount, cancellationToken);

        return Result.Success(new ServiceAccountDto
        {
            Id = created.Id,
            TenantId = created.TenantId,
            Name = created.Name,
            Description = created.Description,
            Email = created.Email,
            Status = created.Status,
            Roles = created.Roles,
            CreatedAt = created.CreatedAt,
            LastAccessAt = created.LastAccessAt,
            ApiKeyCount = 0
        });
    }
}
