using System.Text.RegularExpressions;
using MediatR;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;


public class PreviewEmailTemplateCommandHandler : IRequestHandler<PreviewEmailTemplateCommand, Result<EmailPreviewDto>>
{
    private readonly IEmailTemplateRepository _emailTemplateRepository;
    private readonly ITenantConfigRepository _tenantConfigRepository;

    public PreviewEmailTemplateCommandHandler(
        IEmailTemplateRepository emailTemplateRepository,
        ITenantConfigRepository tenantConfigRepository)
    {
        _emailTemplateRepository = emailTemplateRepository;
        _tenantConfigRepository = tenantConfigRepository;
    }

    public async Task<Result<EmailPreviewDto>> Handle(PreviewEmailTemplateCommand request, CancellationToken cancellationToken)
    {
        var template = await _emailTemplateRepository.GetByTypeAsync(request.TenantId, request.Type, cancellationToken);

        if (template == null)
        {
            return Result.Failure<EmailPreviewDto>("TEMPLATE_NOT_FOUND", $"Template of type '{request.Type}' not found");
        }

        // Get tenant config for company name
        var tenantConfig = await _tenantConfigRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var companyName = tenantConfig?.TenantName ?? "Your Company";

        // Build variables dictionary with defaults
        var variables = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "user.name", "John Doe" },
            { "user.firstName", "John" },
            { "user.lastName", "Doe" },
            { "user.email", request.Email },
            { "reset_link", "https://example.com/reset?token=sample-token" },
            { "magic_link", "https://example.com/magic?token=sample-token" },
            { "mfa_code", "123456" },
            { "company.name", companyName },
            { "support.email", "support@example.com" }
        };

        // Override with custom variables
        foreach (var variable in request.Variables)
        {
            variables[variable.Key] = variable.Value;
        }

        // Replace variables in subject, body, and htmlBody
        var subject = ReplaceVariables(template.Subject, variables);
        var body = ReplaceVariables(template.Body ?? string.Empty, variables);
        var htmlBody = ReplaceVariables(template.HtmlBody ?? string.Empty, variables);

        return Result.Success(new EmailPreviewDto
        {
            Subject = subject,
            Body = body,
            HtmlBody = htmlBody
        });
    }

    private static string ReplaceVariables(string content, Dictionary<string, string> variables)
    {
        if (string.IsNullOrEmpty(content))
            return content;

        // Replace {{variable.name}} patterns
        var pattern = @"\{\{([^}]+)\}\}";
        return Regex.Replace(content, pattern, match =>
        {
            var variableName = match.Groups[1].Value.Trim();
            return variables.TryGetValue(variableName, out var value) ? value : match.Value;
        });
    }
}
