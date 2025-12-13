using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Repositories;

namespace Onesign.Modules.Tenants.Application.Queries;

public class GetEmailTemplatesQueryHandler : IRequestHandler<GetEmailTemplatesQuery, List<EmailTemplateDto>>
{
    private readonly IEmailTemplateRepository _emailTemplateRepository;

    public GetEmailTemplatesQueryHandler(IEmailTemplateRepository emailTemplateRepository)
    {
        _emailTemplateRepository = emailTemplateRepository;
    }

    public async Task<List<EmailTemplateDto>> Handle(GetEmailTemplatesQuery request, CancellationToken cancellationToken)
    {
        var templates = await _emailTemplateRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        // If no templates exist, return default templates
        if (templates == null || !templates.Any())
        {
            return GetDefaultTemplates();
        }

        return templates.Select(t => new EmailTemplateDto
        {
            Id = t.Id,
            Type = t.Type,
            Name = t.Name,
            Subject = t.Subject,
            Body = t.Body,
            HtmlBody = t.HtmlBody,
            IsEnabled = t.IsEnabled,
            CreatedAt = t.CreatedAt,
            UpdatedAt = t.UpdatedAt
        }).ToList();
    }

    private static List<EmailTemplateDto> GetDefaultTemplates()
    {
        return new List<EmailTemplateDto>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Type = "welcome",
                Name = "Welcome Email",
                Subject = "Welcome to {{company.name}}!",
                Body = "Hello {{user.firstName}},\n\nWelcome to {{company.name}}! We're excited to have you on board.\n\nBest regards,\nThe Team",
                HtmlBody = "<h1>Welcome to {{company.name}}!</h1><p>Hello {{user.firstName}},</p><p>Welcome to {{company.name}}! We're excited to have you on board.</p><p>Best regards,<br/>The Team</p>",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Type = "password_reset",
                Name = "Password Reset",
                Subject = "Reset Your Password",
                Body = "Hello {{user.firstName}},\n\nWe received a request to reset your password. Click the link below to reset it:\n\n{{reset_link}}\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Team",
                HtmlBody = "<h1>Reset Your Password</h1><p>Hello {{user.firstName}},</p><p>We received a request to reset your password. Click the link below to reset it:</p><p><a href=\"{{reset_link}}\">Reset Password</a></p><p>If you didn't request this, please ignore this email.</p><p>Best regards,<br/>The Team</p>",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Type = "magic_link",
                Name = "Magic Link Login",
                Subject = "Your Sign-In Link",
                Body = "Hello {{user.firstName}},\n\nClick the link below to sign in to your account:\n\n{{magic_link}}\n\nThis link will expire in 15 minutes.\n\nIf you didn't request this, please ignore this email.\n\nBest regards,\nThe Team",
                HtmlBody = "<h1>Your Sign-In Link</h1><p>Hello {{user.firstName}},</p><p>Click the link below to sign in to your account:</p><p><a href=\"{{magic_link}}\">Sign In</a></p><p>This link will expire in 15 minutes.</p><p>If you didn't request this, please ignore this email.</p><p>Best regards,<br/>The Team</p>",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Type = "mfa_code",
                Name = "MFA Verification Code",
                Subject = "Your Verification Code",
                Body = "Hello {{user.firstName}},\n\nYour verification code is: {{mfa_code}}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this, please contact support immediately.\n\nBest regards,\nThe Team",
                HtmlBody = "<h1>Your Verification Code</h1><p>Hello {{user.firstName}},</p><p>Your verification code is:</p><p style=\"font-size: 24px; font-weight: bold; letter-spacing: 4px;\">{{mfa_code}}</p><p>This code will expire in 5 minutes.</p><p>If you didn't request this, please contact support immediately.</p><p>Best regards,<br/>The Team</p>",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            },
            new()
            {
                Id = Guid.NewGuid(),
                Type = "account_locked",
                Name = "Account Locked",
                Subject = "Your Account Has Been Locked",
                Body = "Hello {{user.firstName}},\n\nYour account has been locked due to multiple failed login attempts.\n\nIf this was you, please wait 30 minutes before trying again, or contact support to unlock your account.\n\nIf this wasn't you, please contact support immediately.\n\nBest regards,\nThe Team",
                HtmlBody = "<h1>Your Account Has Been Locked</h1><p>Hello {{user.firstName}},</p><p>Your account has been locked due to multiple failed login attempts.</p><p>If this was you, please wait 30 minutes before trying again, or contact support to unlock your account.</p><p>If this wasn't you, please contact support immediately.</p><p>Best regards,<br/>The Team</p>",
                IsEnabled = true,
                CreatedAt = DateTime.UtcNow
            }
        };
    }
}
