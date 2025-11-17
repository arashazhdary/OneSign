using MediatR;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Email;
using Onesign.Shared.Result;
using System.Security.Cryptography;

namespace Onesign.Modules.Identity.Application.Commands;

public class RequestPasswordResetCommandHandler : IRequestHandler<RequestPasswordResetCommand, Result<string>>
{
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IPasswordResetTokenRepository _passwordResetTokenRepository;
    private readonly IEmailService? _emailService;

    public RequestPasswordResetCommandHandler(
        IGlobalUserRepository globalUserRepository,
        ITenantUserRepository tenantUserRepository,
        IPasswordResetTokenRepository passwordResetTokenRepository,
        IEmailService? emailService = null)
    {
        _globalUserRepository = globalUserRepository;
        _tenantUserRepository = tenantUserRepository;
        _passwordResetTokenRepository = passwordResetTokenRepository;
        _emailService = emailService;
    }

    public async Task<Result<string>> Handle(RequestPasswordResetCommand request, CancellationToken cancellationToken)
    {
        var globalUser = await _globalUserRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (globalUser == null)
        {
            return Result.Failure<string>("USER_NOT_FOUND", "User not found");
        }

        var tenantUser = await _tenantUserRepository.GetByGlobalUserIdAndTenantIdAsync(
            globalUser.Id, request.TenantId, cancellationToken);
        if (tenantUser == null)
        {
            return Result.Failure<string>("USER_NOT_IN_TENANT", "User is not a member of this tenant");
        }

        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");

        var passwordResetToken = new PasswordResetToken
        {
            Id = Guid.NewGuid(),
            TenantUserId = tenantUser.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        await _passwordResetTokenRepository.AddAsync(passwordResetToken, cancellationToken);

        // Send password reset email if email service is available
        if (_emailService != null)
        {
            var resetUrl = $"/reset-password?token={token}&tenantId={request.TenantId}";
            var emailBody = $@"
                <html>
                <body>
                    <h2>Password Reset Request</h2>
                    <p>You have requested to reset your password. Click the link below to reset your password:</p>
                    <p><a href=""{resetUrl}"">Reset Password</a></p>
                    <p>Or copy and paste this link into your browser: {resetUrl}</p>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you did not request this password reset, please ignore this email.</p>
                </body>
                </html>";

            await _emailService.SendEmailAsync(
                globalUser.Email,
                "Password Reset Request",
                emailBody,
                isHtml: true,
                cancellationToken);
        }

        return Result.Success(token);
    }
}

