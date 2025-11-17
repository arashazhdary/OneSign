using MediatR;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Identity.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class ConfirmPasswordResetCommandHandler : IRequestHandler<ConfirmPasswordResetCommand, Result<bool>>
{
    private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly IPasswordHasher _passwordHasher;

    public ConfirmPasswordResetCommandHandler(
        IPasswordResetTokenRepository passwordResetTokenRepository,
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository,
        IPasswordHasher passwordHasher)
    {
        _passwordResetTokenRepository = passwordResetTokenRepository;
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<Result<bool>> Handle(ConfirmPasswordResetCommand request, CancellationToken cancellationToken)
    {
        var resetToken = await _passwordResetTokenRepository.GetByTokenAsync(request.Token, cancellationToken);
        if (resetToken == null)
        {
            return Result.Failure<bool>("INVALID_TOKEN", "Invalid or expired reset token");
        }

        if (resetToken.IsUsed)
        {
            return Result.Failure<bool>("TOKEN_ALREADY_USED", "This reset token has already been used");
        }

        if (resetToken.ExpiresAt < DateTime.UtcNow)
        {
            return Result.Failure<bool>("TOKEN_EXPIRED", "Reset token has expired");
        }

        var tenantUser = await _tenantUserRepository.GetByIdAsync(resetToken.TenantUserId, cancellationToken);
        if (tenantUser == null)
        {
            return Result.Failure<bool>("USER_NOT_FOUND", "User not found");
        }

        var globalUser = await _globalUserRepository.GetByIdAsync(tenantUser.GlobalUserId, cancellationToken);
        if (globalUser == null)
        {
            return Result.Failure<bool>("USER_NOT_FOUND", "User not found");
        }

        globalUser.PasswordHash = _passwordHasher.HashPassword(request.NewPassword);
        await _globalUserRepository.UpdateAsync(globalUser, cancellationToken);

        resetToken.IsUsed = true;
        await _passwordResetTokenRepository.UpdateAsync(resetToken, cancellationToken);

        return Result.Success(true);
    }
}

