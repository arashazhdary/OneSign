using MediatR;
using Onesign.Modules.Developer.Application.DTOs;
using Onesign.Modules.Developer.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Developer.Application.Queries;

public class GetServiceAccountsQueryHandler : IRequestHandler<GetServiceAccountsQuery, Result<List<ServiceAccountDto>>>
{
    private readonly IServiceAccountRepository _serviceAccountRepository;

    public GetServiceAccountsQueryHandler(IServiceAccountRepository serviceAccountRepository)
    {
        _serviceAccountRepository = serviceAccountRepository;
    }

    public async Task<Result<List<ServiceAccountDto>>> Handle(GetServiceAccountsQuery request, CancellationToken cancellationToken)
    {
        var accounts = await _serviceAccountRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var dtos = accounts.Select(a => new ServiceAccountDto
        {
            Id = a.Id,
            TenantId = a.TenantId,
            Name = a.Name,
            Description = a.Description,
            Email = a.Email,
            Status = a.Status,
            Roles = a.Roles,
            CreatedAt = a.CreatedAt,
            LastAccessAt = a.LastAccessAt,
            ApiKeyCount = a.ApiKeys?.Count ?? 0
        }).ToList();

        return Result.Success(dtos);
    }
}
