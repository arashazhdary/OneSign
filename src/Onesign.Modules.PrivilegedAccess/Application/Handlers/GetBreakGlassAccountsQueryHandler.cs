using System.Text.Json;
using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.DTOs;
using Onesign.Modules.PrivilegedAccess.Application.Queries;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Handlers;

public class GetBreakGlassAccountsQueryHandler : IRequestHandler<GetBreakGlassAccountsQuery, Result<List<BreakGlassAccountDto>>>
{
    private readonly IBreakGlassAccountRepository _repository;

    public GetBreakGlassAccountsQueryHandler(IBreakGlassAccountRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<BreakGlassAccountDto>>> Handle(GetBreakGlassAccountsQuery request, CancellationToken cancellationToken)
    {
        var accounts = await _repository.GetAllAsync(cancellationToken);

        var dtos = accounts.Select(a => new BreakGlassAccountDto
        {
            Id = a.Id,
            Username = a.Username,
            IsEnabled = a.IsEnabled,
            AllowedTenants = JsonSerializer.Deserialize<List<Guid>>(a.AllowedTenantsJson) ?? new(),
            AllowedRoles = JsonSerializer.Deserialize<List<string>>(a.AllowedRolesJson) ?? new(),
            LastUsedAt = a.LastUsedAt,
            CreatedAt = a.CreatedAt
        }).ToList();

        return Result.Success(dtos);
    }
}
