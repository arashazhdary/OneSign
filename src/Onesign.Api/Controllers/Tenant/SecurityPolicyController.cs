using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Security.Application.Commands;
using Onesign.Modules.Security.Application.DTOs;
using Onesign.Modules.Security.Application.Queries;
using Onesign.Shared.Localization;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/security/policy")]
public class SecurityPolicyController : Onesign.Api.Controllers.TenantControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILocalizationService _localizationService;

    public SecurityPolicyController(IMediator mediator, ILocalizationService localizationService)
    {
        _mediator = mediator;
        _localizationService = localizationService;
    }

    private new string GetCulture()
    {
        return HttpContext.Items["Culture"]?.ToString() ?? "en";
    }

    [HttpGet]
    public async Task<ActionResult<SecurityPolicyDto>> GetPolicy([FromQuery] Guid tenantId)
    {
        var query = new GetSecurityPolicyQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (result == null)
            return NotFound();

        return Ok(result);
    }

    [HttpPut]
    public async Task<ActionResult<SecurityPolicyDto>> UpdatePolicy(
        [FromQuery] Guid tenantId,
        [FromBody] UpdateSecurityPolicyRequest request)
    {
        var command = new UpdateSecurityPolicyCommand
        {
            TenantId = tenantId,
            MfaRequirement = request.MfaRequirement,
            AllowTrustedDevices = request.AllowTrustedDevices,
            TrustedDeviceExpireDays = request.TrustedDeviceExpireDays,
            SessionTimeoutMinutes = request.SessionTimeoutMinutes,
            MaxFailedLoginAttempts = request.MaxFailedLoginAttempts
        };

        var result = await _mediator.Send(command);
        return Ok(result);
    }

    [HttpGet("org-unit-rules")]
    public async Task<ActionResult<List<OrgUnitMfaRuleDto>>> GetOrgUnitRules([FromQuery] Guid tenantId)
    {
        var query = new GetOrgUnitMfaRulesQuery { TenantId = tenantId };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPut("org-unit-rules")]
    public async Task<IActionResult> UpdateOrgUnitRules(
        [FromQuery] Guid tenantId,
        [FromBody] UpdateOrgUnitMfaRulesRequest request)
    {
        var command = new UpdateOrgUnitMfaRulesCommand
        {
            TenantId = tenantId,
            Rules = request.Rules.Select(r => new Commands.OrgUnitMfaRuleItem
            {
                OrgUnitId = r.OrgUnitId,
                MfaRequirement = r.MfaRequirement
            }).ToList()
        };

        await _mediator.Send(command);
        return NoContent();
    }
}
