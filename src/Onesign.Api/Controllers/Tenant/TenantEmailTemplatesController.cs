using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Tenants.Application.Commands;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

/// <summary>
/// Controller for managing tenant email templates
/// </summary>
[ApiController]
[Route("api/tenant/email-templates")]
public class TenantEmailTemplatesController : ControllerBase
{
    private readonly IMediator _mediator;

    public TenantEmailTemplatesController(IMediator mediator)
    {
        _mediator = mediator;
    }

    /// <summary>
    /// Get all email templates for a tenant
    /// </summary>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>List of email templates</returns>
    [HttpGet]
    [ProducesResponseType(typeof(List<EmailTemplateDto>), StatusCodes.Status200OK)]
    public async Task<ActionResult<List<EmailTemplateDto>>> GetEmailTemplates([FromQuery] Guid tenantId)
    {
        var query = new GetEmailTemplatesQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Get a specific email template by type
    /// </summary>
    /// <param name="type">Template type (welcome, password_reset, magic_link, mfa_code, account_locked)</param>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>Email template</returns>
    [HttpGet("{type}")]
    [ProducesResponseType(typeof(EmailTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<EmailTemplateDto>> GetEmailTemplateByType(
        string type,
        [FromQuery] Guid tenantId)
    {
        var query = new GetEmailTemplateByTypeQuery
        {
            TenantId = tenantId,
            Type = type
        };

        var result = await _mediator.Send(query);

        if (result == null)
        {
            return NotFound(new { message = $"Email template of type '{type}' not found" });
        }

        return Ok(result);
    }

    /// <summary>
    /// Update an email template
    /// </summary>
    /// <param name="type">Template type</param>
    /// <param name="request">Update request</param>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>Updated email template</returns>
    [HttpPut("{type}")]
    [ProducesResponseType(typeof(EmailTemplateDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EmailTemplateDto>> UpdateEmailTemplate(
        string type,
        [FromBody] UpdateEmailTemplateRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new UpdateEmailTemplateCommand
        {
            TenantId = tenantId,
            Type = type,
            Name = request.Name,
            Subject = request.Subject,
            Body = request.Body,
            HtmlBody = request.HtmlBody,
            IsEnabled = request.IsEnabled
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Preview an email template with sample variables
    /// </summary>
    /// <param name="type">Template type</param>
    /// <param name="request">Preview request with email and variables</param>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>Rendered email preview</returns>
    [HttpPost("{type}/preview")]
    [ProducesResponseType(typeof(EmailPreviewDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<EmailPreviewDto>> PreviewEmailTemplate(
        string type,
        [FromBody] PreviewEmailTemplateRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new PreviewEmailTemplateCommand
        {
            TenantId = tenantId,
            Type = type,
            Email = request.Email,
            Variables = request.Variables ?? new Dictionary<string, string>()
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = result.ErrorMessage });
        }

        return Ok(result.Value);
    }

    /// <summary>
    /// Send a test email using the template
    /// </summary>
    /// <param name="type">Template type</param>
    /// <param name="request">Test email request</param>
    /// <param name="tenantId">The tenant ID</param>
    /// <returns>Success message</returns>
    [HttpPost("{type}/test")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> SendTestEmail(
        string type,
        [FromBody] SendTestEmailRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new SendTestEmailCommand
        {
            TenantId = tenantId,
            Type = type,
            Email = request.Email
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = result.ErrorMessage });
        }

        return Ok(new { message = "Test email sent successfully" });
    }
}

/// <summary>
/// Email preview response
/// </summary>
public class EmailPreviewDto
{
    public string Subject { get; set; } = string.Empty;
    public string Body { get; set; } = string.Empty;
    public string HtmlBody { get; set; } = string.Empty;
}
