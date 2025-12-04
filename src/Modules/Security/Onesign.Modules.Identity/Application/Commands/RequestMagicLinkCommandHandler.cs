using MediatR;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Email;
using Onesign.Shared.Result;
using System.Security.Cryptography;

namespace Onesign.Modules.Identity.Application.Commands;

public class RequestMagicLinkCommandHandler : IRequestHandler<RequestMagicLinkCommand, Result<string>>
{
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IMagicLinkTokenRepository _magicLinkTokenRepository;
    private readonly IEmailService? _emailService;

    public RequestMagicLinkCommandHandler(
        IGlobalUserRepository globalUserRepository,
        ITenantUserRepository tenantUserRepository,
        IMagicLinkTokenRepository magicLinkTokenRepository,
        IEmailService? emailService = null)
    {
        _globalUserRepository = globalUserRepository;
        _tenantUserRepository = tenantUserRepository;
        _magicLinkTokenRepository = magicLinkTokenRepository;
        _emailService = emailService;
    }

    public async Task<Result<string>> Handle(RequestMagicLinkCommand request, CancellationToken cancellationToken)
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

        // Generate secure token
        var token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
            .Replace("+", "-")
            .Replace("/", "_")
            .Replace("=", "");

        var magicLinkToken = new MagicLinkToken
        {
            Id = Guid.NewGuid(),
            TenantUserId = tenantUser.Id,
            Token = token,
            ExpiresAt = DateTime.UtcNow.AddMinutes(15), // 15 minutes expiration
            IsUsed = false,
            CreatedAt = DateTime.UtcNow
        };

        await _magicLinkTokenRepository.AddAsync(magicLinkToken, cancellationToken);

        // Send magic link email if email service is available
        if (_emailService != null)
        {
            var magicLinkUrl = $"/magic-link/verify?token={token}&tenantId={request.TenantId}";
            var emailBody = $@"
                <html>
                <body style=""font-family: Arial, sans-serif; line-height: 1.6; color: #333;"">
                    <div style=""max-width: 600px; margin: 0 auto; padding: 20px;"">
                        <h2 style=""color: #4F46E5;"">Sign in to OneSign</h2>
                        <p>You requested a magic link to sign in to your account. Click the button below to sign in:</p>
                        <div style=""text-align: center; margin: 30px 0;"">
                            <a href=""{magicLinkUrl}""
                               style=""background-color: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;"">
                                Sign In
                            </a>
                        </div>
                        <p style=""color: #666; font-size: 14px;"">Or copy and paste this link into your browser:</p>
                        <p style=""background-color: #f3f4f6; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;"">{magicLinkUrl}</p>
                        <p style=""color: #ef4444; font-weight: bold; margin-top: 20px;"">This link will expire in 15 minutes.</p>
                        <p style=""color: #666; font-size: 14px; margin-top: 20px;"">If you did not request this magic link, please ignore this email.</p>
                    </div>
                </body>
                </html>";

            await _emailService.SendEmailAsync(
                globalUser.Email,
                "Sign in to OneSign - Magic Link",
                emailBody,
                isHtml: true,
                cancellationToken);
        }

        return Result.Success(token);
    }
}
