using System.Text.RegularExpressions;
using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Tenants.Domain.Repositories;
using Onesign.Shared.Email;
using Onesign.Shared.Result;

namespace Onesign.Modules.Tenants.Application.Commands;

public class SendTestEmailCommandHandler : IRequestHandler<SendTestEmailCommand, Result<bool>>
{
    private readonly IEmailTemplateRepository _emailTemplateRepository;
    private readonly ITenantConfigRepository _tenantConfigRepository;
    private readonly IEmailService _emailService;
    private readonly ILogger<SendTestEmailCommandHandler> _logger;

    public SendTestEmailCommandHandler(
        IEmailTemplateRepository emailTemplateRepository,
        ITenantConfigRepository tenantConfigRepository,
        IEmailService emailService,
        ILogger<SendTestEmailCommandHandler> logger)
    {
        _emailTemplateRepository = emailTemplateRepository;
        _tenantConfigRepository = tenantConfigRepository;
        _emailService = emailService;
        _logger = logger;
    }

    public async Task<Result<bool>> Handle(SendTestEmailCommand request, CancellationToken cancellationToken)
    {
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

        var tenantConfig = await _tenantConfigRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);
        var companyName = tenantConfig?.TenantName ?? "Your Company";

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
            { "support.email", $"support@{companyName.ToLowerInvariant().Replace(" ", "")}.com" },
        };

        var subject = ReplaceVariables($"[TEST] {template.Subject}", variables);
        var textBody = ReplaceVariables(template.Body ?? string.Empty, variables);
        var htmlBody = ReplaceVariables(template.HtmlBody ?? string.Empty, variables);

        var useHtml = !string.IsNullOrWhiteSpace(htmlBody);
        var body = useHtml ? htmlBody : textBody;
        if (string.IsNullOrWhiteSpace(body))
        {
            body = textBody;
            useHtml = false;
        }

        var sent = await _emailService.SendEmailAsync(
            request.Email,
            "Test User",
            subject,
            body,
            useHtml,
            cancellationToken);

        if (!sent)
        {
            _logger.LogWarning(
                "Test email was not sent to {Email} for tenant {TenantId} (email provider unavailable or misconfigured)",
                request.Email,
                request.TenantId);
            return Result.Failure<bool>(
                "EMAIL_SEND_FAILED",
                "Test email could not be sent. Verify SMTP/email provider configuration.");
        }

        _logger.LogInformation(
            "Test email sent to {Email} with subject '{Subject}' for tenant {TenantId}",
            request.Email,
            subject,
            request.TenantId);

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
        {
            return content;
        }

        var pattern = @"\{\{([^}]+)\}\}";
        return Regex.Replace(content, pattern, match =>
        {
            var variableName = match.Groups[1].Value.Trim();
            return variables.TryGetValue(variableName, out var value) ? value : match.Value;
        });
    }
}
