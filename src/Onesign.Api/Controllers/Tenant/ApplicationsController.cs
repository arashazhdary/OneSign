using MediatR;
using Microsoft.AspNetCore.Mvc;
using Onesign.Modules.Applications.Application.Commands;
using Onesign.Modules.Applications.Application.DTOs;
using Onesign.Modules.Applications.Application.Queries;
using Onesign.Modules.Organization.Application.Commands;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Application.Queries;
using Onesign.Shared.Localization;
using Onesign.Shared.Pagination;
using Onesign.Shared.Result;

namespace Onesign.Api.Controllers.Tenant;

[Route("api/tenant/applications")]
public class ApplicationsController : Onesign.Api.Controllers.TenantControllerBase
{
    private readonly IMediator _mediator;
    private readonly ILocalizationService _localizationService;

    public ApplicationsController(IMediator mediator, ILocalizationService localizationService)
    {
        _mediator = mediator;
        _localizationService = localizationService;
    }

    private new string GetCulture()
    {
        return HttpContext.Items["Culture"]?.ToString() ?? "en";
    }

    [HttpGet]
    public async Task<ActionResult<PagedResult<ApplicationClientDto>>> GetApplications(
        [FromQuery] Guid tenantId,
        [FromQuery] Guid? orgUnitId,
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize = 10)
    {
        var query = new GetApplicationsForTenantQuery
        {
            TenantId = tenantId,
            OrgUnitId = orgUnitId,
            PageNumber = pageNumber,
            PageSize = pageSize
        };
        var result = await _mediator.Send(query);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ApplicationClientDto>> CreateApplication(
        [FromBody] CreateApplicationClientRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new CreateApplicationClientCommand
        {
            TenantId = tenantId,
            Name = request.Name,
            ApplicationType = request.ApplicationType,
            GrantType = request.GrantType,
            RedirectUris = request.RedirectUris
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return CreatedAtAction(nameof(GetApplications), new { tenantId }, result.Value);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApplicationClientDto>> GetApplicationDetails(
        Guid id,
        [FromQuery] Guid tenantId)
    {
        var query = new GetApplicationDetailsQuery
        {
            ApplicationId = id,
            TenantId = tenantId
        };
        var result = await _mediator.Send(query);
        
        if (result == null)
        {
            return NotFound();
        }

        return Ok(result);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<ApplicationClientDto>> UpdateApplication(
        Guid id,
        [FromBody] UpdateApplicationClientRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new UpdateApplicationClientCommand
        {
            ApplicationId = id,
            TenantId = tenantId,
            Name = request.Name,
            ApplicationType = request.ApplicationType,
            GrantType = request.GrantType
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

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteApplication(
        Guid id,
        [FromQuery] Guid tenantId)
    {
        var command = new DeleteApplicationClientCommand
        {
            ApplicationId = id,
            TenantId = tenantId
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return NoContent();
    }

    [HttpPost("{id}/redirect-uris")]
    public async Task<ActionResult<RedirectUriDto>> AddRedirectUri(
        Guid id,
        [FromBody] AddRedirectUriRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new AddRedirectUriCommand
        {
            ApplicationId = id,
            TenantId = tenantId,
            Uri = request.Uri
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

    [HttpDelete("redirect-uris/{redirectUriId}")]
    public async Task<ActionResult> RemoveRedirectUri(
        Guid redirectUriId,
        [FromQuery] Guid tenantId)
    {
        var command = new RemoveRedirectUriCommand
        {
            RedirectUriId = redirectUriId,
            TenantId = tenantId
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return NoContent();
    }

    [HttpPost("{id}/secrets")]
    public async Task<ActionResult<ClientSecretDto>> AddClientSecret(
        Guid id,
        [FromBody] AddClientSecretRequest request,
        [FromQuery] Guid tenantId)
    {
        var command = new AddClientSecretCommand
        {
            ApplicationId = id,
            TenantId = tenantId,
            ExpiresAt = request.ExpiresAt
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

    [HttpDelete("secrets/{secretId}")]
    public async Task<ActionResult> RemoveClientSecret(
        Guid secretId,
        [FromQuery] Guid tenantId)
    {
        var command = new RemoveClientSecretCommand
        {
            SecretId = secretId,
            TenantId = tenantId
        };
        var result = await _mediator.Send(command);
        
        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return NoContent();
    }

    [HttpGet("{applicationId}/org-units")]
    public async Task<ActionResult<AssignApplicationOrgUnitsRequest>> GetApplicationOrgUnits(Guid applicationId, [FromQuery] Guid tenantId)
    {
        var query = new GetApplicationOrgUnitsQuery { ApplicationClientId = applicationId, TenantId = tenantId };
        var result = await _mediator.Send(query);

        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return Ok(result.Value);
    }

    [HttpPut("{applicationId}/org-units")]
    public async Task<ActionResult> AssignApplicationOrgUnits(Guid applicationId, [FromBody] AssignApplicationOrgUnitsRequest request, [FromQuery] Guid tenantId)
    {
        var command = new AssignApplicationOrgUnitsCommand
        {
            ApplicationClientId = applicationId,
            TenantId = tenantId,
            OrgUnitIds = request.OrgUnitIds,
            ActorId = GetCurrentUserId()
        };

        var result = await _mediator.Send(command);

        if (result.IsFailure)
        {
            var culture = GetCulture();
            var localizedMessage = _localizationService.GetString(result.ErrorCode ?? "UNKNOWN_ERROR", culture);
            return BadRequest(new { errorCode = result.ErrorCode, errorMessage = localizedMessage });
        }

        return NoContent();
    }
}

