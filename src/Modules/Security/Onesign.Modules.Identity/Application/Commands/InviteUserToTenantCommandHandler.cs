using MediatR;
using Onesign.Modules.Audit.Application.Commands;
using Onesign.Modules.Audit.Domain.Enums;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Entities;
using Onesign.Modules.Identity.Domain.Enums;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Shared.Email;
using Onesign.Shared.Result;

namespace Onesign.Modules.Identity.Application.Commands;

public class InviteUserToTenantCommandHandler : IRequestHandler<InviteUserToTenantCommand, Result<TenantUserDto>>
{
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IMediator _mediator;
    private readonly IEmailService? _emailService;

    public InviteUserToTenantCommandHandler(
        IGlobalUserRepository globalUserRepository,
        ITenantUserRepository tenantUserRepository,
        IMediator mediator,
        IEmailService? emailService = null)
    {
        _globalUserRepository = globalUserRepository;
        _tenantUserRepository = tenantUserRepository;
        _mediator = mediator;
        _emailService = emailService;
    }

    public async Task<Result<TenantUserDto>> Handle(InviteUserToTenantCommand request, CancellationToken cancellationToken)
    {
        var globalUser = await _globalUserRepository.GetByEmailAsync(request.Email, cancellationToken);
        if (globalUser == null)
        {
            globalUser = new GlobalUser
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                EmailVerified = false,
                CreatedAt = DateTime.UtcNow
            };
            await _globalUserRepository.AddAsync(globalUser, cancellationToken);
        }

        var existingTenantUser = await _tenantUserRepository.GetByGlobalUserIdAndTenantIdAsync(
            globalUser.Id, request.TenantId, cancellationToken);
        if (existingTenantUser != null)
        {
            return Result.Failure<TenantUserDto>("USER_ALREADY_IN_TENANT", "User is already a member of this tenant");
        }

        var tenantUser = new TenantUser
        {
            Id = Guid.NewGuid(),
            GlobalUserId = globalUser.Id,
            TenantId = request.TenantId,
            Status = TenantUserStatus.Invited,
            IsAdmin = request.IsAdmin,
            CreatedAt = DateTime.UtcNow
        };

        var createdTenantUser = await _tenantUserRepository.AddAsync(tenantUser, cancellationToken);

        // Audit log
        await _mediator.Send(new AppendAuditEventCommand
        {
            TenantId = request.TenantId,
            ActorId = null, // Admin user ID should be passed from request
            EventType = AuditEventType.UserInvited,
            Description = $"User '{request.Email}' was invited to tenant (Admin: {request.IsAdmin})",
            Metadata = System.Text.Json.JsonSerializer.Serialize(new { TenantUserId = createdTenantUser.Id, Email = request.Email, IsAdmin = request.IsAdmin })
        }, cancellationToken);

        // Send invitation email if email service is available
        if (_emailService != null)
        {
            var loginUrl = $"/login?tenantId={request.TenantId}";
            var emailBody = $@"
                <html>
                <body>
                    <h2>You've been invited to join a tenant</h2>
                    <p>You have been invited to join a tenant on onesign SSO platform.</p>
                    <p>Your role: {(request.IsAdmin ? "Administrator" : "User")}</p>
                    <p>Click the link below to complete your registration and set your password:</p>
                    <p><a href=""{loginUrl}"">Complete Registration</a></p>
                    <p>Or copy and paste this link into your browser: {loginUrl}</p>
                    <p>If you did not expect this invitation, please ignore this email.</p>
                </body>
                </html>";

            await _emailService.SendEmailAsync(
                request.Email,
                "Invitation to join tenant",
                emailBody,
                isHtml: true,
                cancellationToken);
        }

        return Result.Success(new TenantUserDto
        {
            Id = createdTenantUser.Id,
            GlobalUserId = createdTenantUser.GlobalUserId,
            Email = globalUser.Email,
            TenantId = createdTenantUser.TenantId,
            Status = createdTenantUser.Status,
            IsAdmin = createdTenantUser.IsAdmin,
            FirstLoginAt = createdTenantUser.FirstLoginAt,
            LastLoginAt = createdTenantUser.LastLoginAt,
            CreatedAt = createdTenantUser.CreatedAt
        });
    }
}

