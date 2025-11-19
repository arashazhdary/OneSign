using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Insights.Application.Commands;
using Onesign.Modules.Insights.Application.DTOs;
using Onesign.Modules.Insights.Application.Queries;
using Onesign.Modules.Insights.Application.Services;
using Onesign.Modules.Insights.Domain.Enums;
using System.Security.Claims;

namespace Onesign.Api.Controllers.Global;

[Route("api/global/insights")]
[ApiController]
public class GlobalInsightsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly IExportService _exportService;

    public GlobalInsightsController(IMediator mediator, IExportService exportService)
    {
        _mediator = mediator;
        _exportService = exportService;
    }

    /// <summary>
    /// Get overview of all tenants with filtering and pagination
    /// </summary>
    [HttpGet("tenants/overview")]
    public async Task<ActionResult<GlobalTenantOverviewDto>> GetTenantsOverview(
        [FromQuery] DateOnly? from = null,
        [FromQuery] DateOnly? to = null,
        [FromQuery] string? sortBy = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = new GetGlobalTenantsOverviewQuery
        {
            Date = to ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1)),
            Days = from.HasValue && to.HasValue
                ? (to.Value.ToDateTime(TimeOnly.MinValue) - from.Value.ToDateTime(TimeOnly.MinValue)).Days + 1
                : 1
        };

        var result = await _mediator.Send(query);

        // Apply pagination
        var pagedTenants = result.Tenants
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToList();

        // Apply sorting if specified
        if (!string.IsNullOrEmpty(sortBy))
        {
            pagedTenants = sortBy.ToLowerInvariant() switch
            {
                "users" => pagedTenants.OrderByDescending(t => t.TotalUsers).ToList(),
                "signins" => pagedTenants.OrderByDescending(t => t.TotalSignInCount).ToList(),
                "mfa" => pagedTenants.OrderByDescending(t => t.MfaAdoptionPercent).ToList(),
                "risk" => pagedTenants.OrderBy(t => t.RiskLevel == "High" ? 0 : t.RiskLevel == "Medium" ? 1 : 2).ToList(),
                _ => pagedTenants
            };
        }

        return Ok(new GlobalTenantOverviewDto
        {
            Tenants = pagedTenants,
            Summary = result.Summary
        });
    }

    /// <summary>
    /// Get list of risky tenants
    /// </summary>
    [HttpGet("tenants/risky")]
    public async Task<ActionResult<RiskyTenantsListDto>> GetRiskyTenants(
        [FromQuery] int days = 30,
        [FromQuery] int minRiskScore = 50,
        [FromQuery] int top = 100)
    {
        var query = new GetRiskyTenantsQuery
        {
            Days = days,
            MinRiskScore = minRiskScore,
            Top = top
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Export global tenant overview to CSV
    /// </summary>
    [HttpGet("export/tenants")]
    public async Task<IActionResult> ExportTenantsOverview(
        [FromQuery] DateOnly? from = null,
        [FromQuery] DateOnly? to = null,
        [FromQuery] string format = "csv")
    {
        if (format.ToLowerInvariant() != "csv")
            return BadRequest("Only CSV format is currently supported");

        var date = to ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var result = await _exportService.ExportGlobalOverviewToCsvAsync(date);

        if (!result.Success)
            return BadRequest(result.ErrorMessage);

        return File(result.Content, result.ContentType, result.FileName);
    }

    /// <summary>
    /// Get global report subscriptions
    /// </summary>
    [HttpGet("report-subscriptions")]
    public async Task<ActionResult<ReportSubscriptionListDto>> GetReportSubscriptions()
    {
        var query = new GetReportSubscriptionsQuery
        {
            ScopeType = ScopeType.Global,
            ScopeId = null
        };

        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Create a global report subscription
    /// </summary>
    [HttpPost("report-subscriptions")]
    public async Task<ActionResult<ReportSubscriptionDto>> CreateReportSubscription(
        [FromBody] GlobalCreateReportSubscriptionRequest request)
    {
        var userId = GetCurrentUserId();

        var command = new CreateReportSubscriptionCommand
        {
            ScopeType = ScopeType.Global,
            ScopeId = null,
            ReportType = request.ReportType,
            CronOrFrequency = request.CronOrFrequency,
            EmailRecipients = request.EmailRecipients,
            CreatedByUserId = userId
        };

        var result = await _mediator.Send(command);
        return CreatedAtAction(nameof(GetReportSubscriptions), result);
    }

    /// <summary>
    /// Update a global report subscription
    /// </summary>
    [HttpPut("report-subscriptions/{id}")]
    public async Task<ActionResult<ReportSubscriptionDto>> UpdateReportSubscription(
        Guid id,
        [FromBody] GlobalUpdateReportSubscriptionRequest request)
    {
        var userId = GetCurrentUserId();

        var command = new UpdateReportSubscriptionCommand
        {
            Id = id,
            ScopeType = ScopeType.Global,
            ScopeId = null,
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
    /// Delete a global report subscription
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

    private Guid GetCurrentUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("sub")?.Value;

        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
        {
            return Guid.Empty;
        }

        return userId;
    }
}

public class GlobalCreateReportSubscriptionRequest
{
    public ReportType ReportType { get; set; }
    public string CronOrFrequency { get; set; } = string.Empty;
    public List<string> EmailRecipients { get; set; } = new();
}

public class GlobalUpdateReportSubscriptionRequest
{
    public ReportType ReportType { get; set; }
    public string CronOrFrequency { get; set; } = string.Empty;
    public List<string> EmailRecipients { get; set; } = new();
    public bool IsActive { get; set; }
}
