using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Entities;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class UpdateEmailTemplateCommandHandler : IRequestHandler<UpdateEmailTemplateCommand, Result<EmailTemplateDto>>
{
    private readonly IEmailTemplateRepository _emailTemplateRepository;

    public UpdateEmailTemplateCommandHandler(IEmailTemplateRepository emailTemplateRepository)
    {
        _emailTemplateRepository = emailTemplateRepository;
    }

    public async Task<Result<EmailTemplateDto>> Handle(UpdateEmailTemplateCommand request, CancellationToken cancellationToken)
    {
        // Validate template type
        var validTypes = new[] { "welcome", "password_reset", "magic_link", "mfa_code", "account_locked" };
        if (!validTypes.Contains(request.Type.ToLowerInvariant()))
        {
            return Result.Failure<EmailTemplateDto>("INVALID_TEMPLATE_TYPE", $"Invalid template type: {request.Type}");
        }

        // Try to find existing template
        var template = await _emailTemplateRepository.GetByTypeAsync(request.TenantId, request.Type, cancellationToken);

        if (template == null)
        {
            // Create new template
            template = new EmailTemplate
            {
                Id = Guid.NewGuid(),
                TenantId = request.TenantId,
                Type = request.Type.ToLowerInvariant(),
                Name = request.Name,
                Subject = request.Subject,
                Body = request.Body,
                HtmlBody = request.HtmlBody,
                IsEnabled = request.IsEnabled,
                CreatedAt = DateTime.UtcNow
            };

            await _emailTemplateRepository.AddAsync(template, cancellationToken);
        }
        else
        {
            // Update existing template
            template.Name = request.Name;
            template.Subject = request.Subject;
            template.Body = request.Body;
            template.HtmlBody = request.HtmlBody;
            template.IsEnabled = request.IsEnabled;
            template.UpdatedAt = DateTime.UtcNow;

            await _emailTemplateRepository.UpdateAsync(template, cancellationToken);
        }

        return Result.Success(new EmailTemplateDto
        {
            Id = template.Id,
            Type = template.Type,
            Name = template.Name,
            Subject = template.Subject,
            Body = template.Body,
            HtmlBody = template.HtmlBody,
            IsEnabled = template.IsEnabled,
            CreatedAt = template.CreatedAt,
            UpdatedAt = template.UpdatedAt
        });
    }
}
