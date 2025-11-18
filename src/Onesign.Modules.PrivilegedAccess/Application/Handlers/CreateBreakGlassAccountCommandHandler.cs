using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MediatR;
using Onesign.Modules.PrivilegedAccess.Application.Commands;
using Onesign.Modules.PrivilegedAccess.Application.DTOs;
using Onesign.Modules.PrivilegedAccess.Domain.Entities;
using Onesign.Modules.PrivilegedAccess.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.PrivilegedAccess.Application.Handlers;

public class CreateBreakGlassAccountCommandHandler : IRequestHandler<CreateBreakGlassAccountCommand, Result<BreakGlassAccountDto>>
{
    private readonly IBreakGlassAccountRepository _repository;

    public CreateBreakGlassAccountCommandHandler(IBreakGlassAccountRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<BreakGlassAccountDto>> Handle(CreateBreakGlassAccountCommand request, CancellationToken cancellationToken)
    {
        var existing = await _repository.GetByUsernameAsync(request.Username, cancellationToken);
        if (existing != null)
            return Result.Failure<BreakGlassAccountDto>("AlreadyExists", "A break glass account with this username already exists");

        var passwordHash = HashPassword(request.Password);

        var account = new BreakGlassAccount
        {
            Id = Guid.NewGuid(),
            Username = request.Username,
            PasswordHash = passwordHash,
            IsEnabled = request.IsEnabled,
            AllowedTenantsJson = JsonSerializer.Serialize(request.AllowedTenants),
            AllowedRolesJson = JsonSerializer.Serialize(request.AllowedRoles),
            CreatedAt = DateTime.UtcNow
        };

        await _repository.AddAsync(account, cancellationToken);

        var dto = new BreakGlassAccountDto
        {
            Id = account.Id,
            Username = account.Username,
            IsEnabled = account.IsEnabled,
            AllowedTenants = request.AllowedTenants,
            AllowedRoles = request.AllowedRoles,
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
