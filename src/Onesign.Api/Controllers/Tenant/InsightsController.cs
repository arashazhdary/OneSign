using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.IdentityInsights.Application.Queries;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/insights")]
public class InsightsController : TenantControllerBase
{
    private readonly IMediator _mediator;

    public InsightsController(IMediator mediator) => _mediator = mediator;

    [HttpGet]
    public async Task<ActionResult<List<InsightDto>>> GetInsights([FromQuery] GetInsightsQuery query)
    {
        var result = await _mediator.Send(query);
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult> GetInsight(Guid id)
    {
        return Ok(new object());
    }

    [HttpPost("{id}/resolve")]
    public async Task<ActionResult> ResolveInsight(Guid id)
    {
        return Ok();
    }

    [HttpPost("{id}/dismiss")]
    public async Task<ActionResult> DismissInsight(Guid id)
    {
        return Ok();
    }

    [HttpGet("users/{userId}/risk-profile")]
    public async Task<ActionResult<UserRiskProfileDto>> GetUserRiskProfile(Guid userId, [FromQuery] Guid tenantId)
    {
        var result = await _mediator.Send(new GetUserRiskProfileQuery { TenantId = tenantId, UserId = userId });
        return result.IsSuccess ? Ok(result.Data) : BadRequest(result.ErrorMessage);
    }

    [HttpGet("high-risk-users")]
    public async Task<ActionResult> GetHighRiskUsers([FromQuery] Guid tenantId, [FromQuery] int threshold = 70)
    {
        return Ok(new List<object>());
    }

    [HttpGet("tenant-risk")]
    public async Task<ActionResult> GetTenantRisk([FromQuery] Guid tenantId)
    {
        return Ok(new
        {
            TenantId = tenantId,
            RiskScore = 0,
            UsersCount = 0,
            HighRiskUsersCount = 0,
            MfaEnrollmentRate = 0.0m
        });
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult> GetInsightsDashboard([FromQuery] Guid tenantId)
    {
        return Ok(new
        {
            HighRiskUsersCount = 0,
            OpenInsightsCount = 0,
            TenantRiskScore = 0,
            RecentInsights = new List<object>()
        });
    }
}
