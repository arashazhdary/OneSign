using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Logging.Abstractions;

namespace Onesign.Shared.Email;

/// <summary>
/// SMTP-based email service implementation.
/// </summary>
public class SmtpEmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<SmtpEmailService> _logger;

    public SmtpEmailService(IConfiguration configuration, ILogger<SmtpEmailService>? logger = null)
    {
        _configuration = configuration;
        _logger = logger ?? NullLogger<SmtpEmailService>.Instance;
    }

    public async Task<bool> SendEmailAsync(
        string to,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default)
    {
        return await SendEmailAsync(to, to, subject, body, isHtml, cancellationToken);
    }

    public async Task<bool> SendEmailAsync(
        string to,
        string toDisplayName,
        string subject,
        string body,
        bool isHtml = true,
        CancellationToken cancellationToken = default)
    {
        try
        {
            var smtpHost = _configuration["Email:Smtp:Host"] ?? "localhost";
            var smtpPort = int.Parse(_configuration["Email:Smtp:Port"] ?? "25");
            var smtpUsername = _configuration["Email:Smtp:Username"];
            var smtpPassword = _configuration["Email:Smtp:Password"];
            var fromEmail = _configuration["Email:From:Address"] ?? "noreply@onesign.local";
            var fromName = _configuration["Email:From:Name"] ?? "onesign SSO";
            var enableSsl = bool.Parse(_configuration["Email:Smtp:EnableSsl"] ?? "false");

            using var client = new SmtpClient(smtpHost, smtpPort)
            {
                EnableSsl = enableSsl,
                DeliveryMethod = SmtpDeliveryMethod.Network,
                UseDefaultCredentials = false
            };

            if (!string.IsNullOrEmpty(smtpUsername) && !string.IsNullOrEmpty(smtpPassword))
            {
                client.Credentials = new NetworkCredential(smtpUsername, smtpPassword);
            }

            using var message = new MailMessage
            {
                From = new MailAddress(fromEmail, fromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = isHtml
            };

            message.To.Add(new MailAddress(to, toDisplayName));

            await client.SendMailAsync(message, cancellationToken);

            _logger.LogInformation("Email sent successfully to {To} with subject: {Subject}", to, subject);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email to {To} with subject: {Subject}", to, subject);
            return false;
        }
    }
}

