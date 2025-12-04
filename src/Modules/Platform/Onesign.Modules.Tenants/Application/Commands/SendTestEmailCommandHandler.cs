using System.Text.RegularExpressions;
using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class SendTestEmailCommand : IRequest<Result<bool>>
{
    public Guid TenantId { get; set; }
    public string Type { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class SendTestEmailCommandHandler : IRequestHandler<SendTestEmailCommand, Result<bool>>
{
    private readonly IEmailTemplateRepository _emailTemplateRepository;
    private readonly ITenantConfigRepository _tenantConfigRepository;
    private readonly ILogger<SendTestEmailCommandHandler> _logger;
    // TODO: Inject IEmailService when available

    public SendTestEmailCommandHandler(
        IEmailTemplateRepository emailTemplateRepository,
        ITenantConfigRepository tenantConfigRepository,
        ILogger<SendTestEmailCommandHandler> logger)
    {
        _emailTemplateRepository = emailTemplateRepository;
        _tenantConfigRepository = tenantConfigRepository;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(SendTestEmailCommand request, CancellationToken cancellationToken)
    {
        // Validate email format
        if (string.IsNullOrWhiteSpace(request.Email) || !IsValidEmail(request.Email))
        {
            return Result.Failure<bool>("INVALID_EMAIL", "Invalid email address");
        }

        var template = await _emailTemplateRepository.GetByTypeAsync(request.TenantId, request.Type, cancellationToken);

        if (template == null)
        {
            return Result.Failure<bool>("TEMPLATE_NOT_FOUND", $"Template of type '{request.Type}' not found");
        }

        if (!template.IsEnabled)
        {
            return Result.Failure<bool>("TEMPLATE_DISABLED", "This template is currently disabled");
        }

        // Get tenant config for company name
        var tenantConfig = await _tenantConfigRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var companyName = tenantConfig?.TenantName ?? "Your Company";

        // Build test variables
        var variables = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
        {
            { "user.name", "Test User" },
            { "user.firstName", "Test" },
            { "user.lastName", "User" },
            { "user.email", request.Email },
            { "reset_link", "https://example.com/reset?token=test-token-12345" },
            { "magic_link", "https://example.com/magic?token=test-token-12345" },
            { "mfa_code", "123456" },
            { "company.name", companyName },
            { "support.email", $"support@{companyName.ToLowerInvariant().Replace(" ", "")}.com" }
        };

        // Replace variables in subject and content
        var subject = ReplaceVariables($"[TEST] {template.Subject}", variables);
        var body = ReplaceVariables(template.Body ?? string.Empty, variables);
        var htmlBody = ReplaceVariables(template.HtmlBody ?? string.Empty, variables);

        // TODO: Send actual email using IEmailService
        // For now, we'll just log the email
        _logger.LogInformation(
            "Test email would be sent to {Email} with subject '{Subject}' for tenant {TenantId}",
            request.Email,
            subject,
            request.TenantId);

        // In production, this would be:
        // await _emailService.SendAsync(new EmailMessage
        // {
        //     To = request.Email,
        //     Subject = subject,
        //     TextBody = body,
        //     HtmlBody = htmlBody
        // }, cancellationToken);

        return Result.Success(true);
    }

    private static bool IsValidEmail(string email)
    {
        try
        {
            var addr = new System.Net.Mail.MailAddress(email);
            return addr.Address == email;
        }
        catch
        {
            return false;
        }
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
