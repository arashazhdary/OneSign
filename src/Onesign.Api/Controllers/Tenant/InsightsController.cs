using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Insights.Application.Commands;
using Onesign.Modules.Insights.Application.DTOs;
using Onesign.Modules.Insights.Application.Queries;
using Onesign.Modules.Insights.Application.Services;
using Onesign.Modules.Insights.Domain.Enums;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/insights")]
public class InsightsController : TenantControllerBase
{
    private readonly IMediator _mediator;
    private readonly IExportService _exportService;

    public InsightsController(IMediator mediator, IExportService exportService)
    {
        _mediator = mediator;
        _exportService = exportService;
    }

    /// <summary>
    /// Get tenant insights overview for a date range
    /// </summary>
    [HttpGet("overview")]
    public async Task<ActionResult<TenantInsightsOverviewDto>> GetOverview(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to)
    {
        var tenantId = GetCurrentTenantId();
        if (tenantId == Guid.Empty)
            return Unauthorized("Tenant ID not found in claims");

        var query = new GetTenantInsightsOverviewQuery
        {
            TenantId = tenantId,
            From = from,
            To = to
        };

        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound("No insights data found for the specified date range");

        return Ok(result);
    }

    /// <summary>
    /// Get application usage statistics for a specific date
    /// </summary>
    [HttpGet("apps")]
    public async Task<ActionResult<ApplicationUsageListDto>> GetApplicationUsage([FromQuery] DateOnly date)
    {
        var tenantId = GetCurrentTenantId();
        if (tenantId == Guid.Empty)
            return Unauthorized("Tenant ID not found in claims");

        var query = new GetApplicationUsageQuery
        {
            TenantId = tenantId,
            Date = date
        };

        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound("No application usage data found for the specified date");

        return Ok(result);
    }

    /// <summary>
    /// Get user security posture with filtering and pagination
    /// </summary>
    [HttpGet("users/security-posture")]
    public async Task<ActionResult<UserSecurityPostureListDto>> GetUserSecurityPosture(
        [FromQuery] string? sortBy = null,
        [FromQuery] bool? mfaEnabled = null,
        [FromQuery] bool? hasHighRisk = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var tenantId = GetCurrentTenantId();
        if (tenantId == Guid.Empty)
            return Unauthorized("Tenant ID not found in claims");

        var query = new GetUserSecurityPostureQuery
        {
            TenantId = tenantId,
            Page = page,
            PageSize = pageSize,
            MfaEnabled = mfaEnabled,
            MinHighRiskEvents = hasHighRisk == true ? 1 : null
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Export tenant insights overview to CSV
    /// </summary>
    [HttpGet("export/overview")]
    public async Task<IActionResult> ExportOverview(
        [FromQuery] DateOnly from,
        [FromQuery] DateOnly to,
        [FromQuery] string format = "csv")
    {
        var tenantId = GetCurrentTenantId();
        if (tenantId == Guid.Empty)
            return Unauthorized("Tenant ID not found in claims");

        if (format.ToLowerInvariant() != "csv")
            return BadRequest("Only CSV format is currently supported");

        var result = await _exportService.ExportTenantInsightsToCsvAsync(tenantId, from, to);

        if (!result.Success)
            return BadRequest(result.ErrorMessage);

        return File(result.Content, result.ContentType, result.FileName);
    }

    /// <summary>
    /// Export user security posture to CSV
    /// </summary>
    [HttpGet("export/users")]
    public async Task<IActionResult> ExportUserSecurityPosture([FromQuery] string format = "csv")
    {
        var tenantId = GetCurrentTenantId();
        if (tenantId == Guid.Empty)
            return Unauthorized("Tenant ID not found in claims");

        if (format.ToLowerInvariant() != "csv")
            return BadRequest("Only CSV format is currently supported");

        var result = await _exportService.ExportUserSecurityPostureToCsvAsync(tenantId);

        if (!result.Success)
            return BadRequest(result.ErrorMessage);

        return File(result.Content, result.ContentType, result.FileName);
    }

    /// <summary>
    /// Get report subscriptions for the current tenant
    /// </summary>
    [HttpGet("report-subscriptions")]
    public async Task<ActionResult<ReportSubscriptionListDto>> GetReportSubscriptions()
    {
        var tenantId = GetCurrentTenantId();
        if (tenantId == Guid.Empty)
            return Unauthorized("Tenant ID not found in claims");

        var query = new GetReportSubscriptionsQuery
        {
            ScopeType = ScopeType.Tenant,
            ScopeId = tenantId
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Create a new report subscription
    /// </summary>
    [HttpPost("report-subscriptions")]
    public async Task<ActionResult<ReportSubscriptionDto>> CreateReportSubscription(
        [FromBody] CreateReportSubscriptionRequest request)
    {
        var tenantId = GetCurrentTenantId();
        var userId = GetCurrentUserId();

        if (tenantId == Guid.Empty)
            return Unauthorized("Tenant ID not found in claims");

        var command = new CreateReportSubscriptionCommand
        {
            ScopeType = ScopeType.Tenant,
            ScopeId = tenantId,
            ReportType = request.ReportType,
            CronOrFrequency = request.CronOrFrequency,
            EmailRecipients = request.EmailRecipients,
            CreatedByUserId = userId
        };

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetReportSubscriptions), result);
    }

    /// <summary>
    /// Update an existing report subscription
    /// </summary>
    [HttpPut("report-subscriptions/{id}")]
    public async Task<ActionResult<ReportSubscriptionDto>> UpdateReportSubscription(
        Guid id,
        [FromBody] UpdateReportSubscriptionRequest request)
    {
        var tenantId = GetCurrentTenantId();
        var userId = GetCurrentUserId();

        if (tenantId == Guid.Empty)
            return Unauthorized("Tenant ID not found in claims");

        var command = new UpdateReportSubscriptionCommand
        {
            Id = id,
            ScopeType = ScopeType.Tenant,
            ScopeId = tenantId,
            ReportType = request.ReportType,
            CronOrFrequency = request.CronOrFrequency,
            EmailRecipients = request.EmailRecipients,
            IsActive = request.IsActive,
            UpdatedByUserId = userId
        };

        var result = await _mediator.Send(command);

        if (result == null)
            return NotFound("Report subscription not found");

        return Ok(result);
    }

    /// <summary>
    /// Delete a report subscription
    /// </summary>
    [HttpDelete("report-subscriptions/{id}")]
    public async Task<ActionResult> DeleteReportSubscription(Guid id)
    {
        var command = new DeleteReportSubscriptionCommand { Id = id };
        var result = await _mediator.Send(command);

        if (!result)
            return NotFound("Report subscription not found");

        return NoContent();
    }
}

public class CreateReportSubscriptionRequest
{
    public ReportType ReportType { get; set; }
    public string CronOrFrequency { get; set; } = string.Empty;
    public List<string> EmailRecipients { get; set; } = new();
}

public class UpdateReportSubscriptionRequest
{
    public ReportType ReportType { get; set; }
    public string CronOrFrequency { get; set; } = string.Empty;
    public List<string> EmailRecipients { get; set; } = new();
    public bool IsActive { get; set; }
}
