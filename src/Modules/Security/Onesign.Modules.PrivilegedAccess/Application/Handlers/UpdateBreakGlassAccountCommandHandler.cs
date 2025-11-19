using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.Commands;
using Onesign.Modules.PrivilegedAccess.Application.DTOs;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Handlers;

public class UpdateBreakGlassAccountCommandHandler : IRequestHandler<UpdateBreakGlassAccountCommand, Result<BreakGlassAccountDto>>
{
    private readonly IBreakGlassAccountRepository _repository;

    public UpdateBreakGlassAccountCommandHandler(IBreakGlassAccountRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<BreakGlassAccountDto>> Handle(UpdateBreakGlassAccountCommand request, CancellationToken cancellationToken)
    {
        var account = await _repository.GetByIdAsync(request.AccountId, cancellationToken);
        if (account == null)
            return Result.Failure<BreakGlassAccountDto>("NotFound", "Break glass account not found");

        if (request.AllowedTenants != null)
            account.AllowedTenantsJson = JsonSerializer.Serialize(request.AllowedTenants);
        if (request.AllowedRoles != null)
            account.AllowedRolesJson = JsonSerializer.Serialize(request.AllowedRoles);
        if (request.IsEnabled.HasValue)
            account.IsEnabled = request.IsEnabled.Value;
        if (!string.IsNullOrEmpty(request.NewPassword))
            account.PasswordHash = HashPassword(request.NewPassword);

        await _repository.UpdateAsync(account, cancellationToken);

        var dto = new BreakGlassAccountDto
        {
            Id = account.Id,
            Username = account.Username,
            IsEnabled = account.IsEnabled,
            AllowedTenants = JsonSerializer.Deserialize<List<Guid>>(account.AllowedTenantsJson) ?? new(),
            AllowedRoles = JsonSerializer.Deserialize<List<string>>(account.AllowedRolesJson) ?? new(),
            LastUsedAt = account.LastUsedAt,
            CreatedAt = account.CreatedAt
        };

        return Result.Success(dto);
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var bytes = Encoding.UTF8.GetBytes(password);
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash);
    }
}
