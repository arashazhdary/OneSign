using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Tenants.Application.Commands;
using Onesign.Modules.Tenants.Application.DTOs;
using Onesign.Modules.Tenants.Application.Queries;
using Onesign.Shared.Localization;
using Onesign.Shared.Pagination;

namespace Onesign.Api.Controllers.Admin;

[ApiController]
[Route("api/admin/tenants")]
public class TenantsController : ControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILocalizationService _localizationService;

    public TenantsController(IMediator mediator, ILocalizationService localizationService)
    {
        _mediator = mediator;
        _localizationService = localizationService;
    }

    private string GetCulture()
    {
        return HttpContext.Items["Culture"]?.ToString() ?? "en";
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<TenantSummaryDto>>> GetTenants(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetTenantsQuery
        {
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    /// <summary>
    /// Creates a new tenant
    /// </summary>
    /// <param name="request">Tenant creation request</param>
    /// <returns>Created tenant information</returns>
    /// <response code="201">Tenant created successfully</response>
    /// <response code="400">Invalid request or tenant slug already exists</response>
    /// <remarks>
    /// Sample request:
    /// 
    ///     POST /api/admin/tenants
    ///     {
    ///         "name": "Acme Corporation",
    ///         "slug": "acme-corp"
    ///     }
    /// </remarks>
    [HttpPost]
    [ProducesResponseType(typeof(TenantDto), 201)]
    [ProducesResponseType(400)]
    public async Task<ActionResult<TenantDto>> CreateTenant([FromBody] CreateTenantRequest request)
    {
        var command = new CreateTenantCommand
        {
            Name = request.Name,
            Slug = request.Slug
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return CreatedAtAction(nameof(GetTenants), new { id = result.Value!.Id }, result.Value);
    }

    [HttpPatch("{tenantId}/status")]
    public async Task<ActionResult<TenantDto>> UpdateTenantStatus(
        Guid tenantId,
        [FromBody] UpdateTenantStatusRequest request)
    {
        var command = new UpdateTenantStatusCommand
        {
            TenantId = tenantId,
            Status = request.Status
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return Ok(result.Value);
    }
}

