using MediatR;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class CompleteFirstLoginCommandHandler : IRequestHandler<CompleteFirstLoginCommand, Result<TenantUserDto>>
{
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly IPasswordHasher _passwordHasher;

    public CompleteFirstLoginCommandHandler(
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository,
        IPasswordHasher passwordHasher)
    {
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<TenantUserDto>> Handle(CompleteFirstLoginCommand request, CancellationToken cancellationToken)
    {
        var tenantUser = await _tenantUserRepository.GetByIdAsync(request.TenantUserId, cancellationToken);
        if (tenantUser == null)
        {
            return Result.Failure<TenantUserDto>("USER_NOT_FOUND", "User not found");
        }

        if (tenantUser.Status != TenantUserStatus.Invited)
        {
            return Result.Failure<TenantUserDto>("INVALID_STATUS", "User is not in invited status");
        }

        var globalUser = await _globalUserRepository.GetByIdAsync(tenantUser.GlobalUserId, cancellationToken);
        if (globalUser == null)
        {
            return Result.Failure<TenantUserDto>("USER_NOT_FOUND", "Global user not found");
        }

        globalUser.PasswordHash = _passwordHasher.HashPassword(request.Password);
        globalUser.EmailVerified = true;
        await _globalUserRepository.UpdateAsync(globalUser, cancellationToken);

        tenantUser.Status = TenantUserStatus.Active;
        tenantUser.FirstLoginAt = DateTime.UtcNow;
        await _tenantUserRepository.UpdateAsync(tenantUser, cancellationToken);

        return Result.Success(new TenantUserDto
        {
            Id = tenantUser.Id,
            GlobalUserId = tenantUser.GlobalUserId,
            Email = globalUser.Email,
            TenantId = tenantUser.TenantId,
            Status = tenantUser.Status,
            IsAdmin = tenantUser.IsAdmin,
            FirstLoginAt = tenantUser.FirstLoginAt,
            LastLoginAt = tenantUser.LastLoginAt,
            CreatedAt = tenantUser.CreatedAt
        });
    }
}

