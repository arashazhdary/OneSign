using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Domain.Services;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetCurrentUserScopeQueryHandler : IRequestHandler<GetCurrentUserScopeQuery, Result<CurrentUserScopeDto>>
{
    private readonly IOrgAuthorizationService _orgAuthorizationService;
    private readonly ILogger<GetCurrentUserScopeQueryHandler> _logger;

    public GetCurrentUserScopeQueryHandler(
        IOrgAuthorizationService orgAuthorizationService,
        ILogger<GetCurrentUserScopeQueryHandler> logger)
    {
        _orgAuthorizationService = orgAuthorizationService;
        _logger = logger;
    }

    public async Task<Result<CurrentUserScopeDto>> Handle(GetCurrentUserScopeQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Getting current user scope: TenantUserId={TenantUserId}", request.TenantUserId);

        try
        {
            var scope = await _orgAuthorizationService.GetEffectiveScopeAsync(request.TenantUserId, cancellationToken);

            var dto = new CurrentUserScopeDto
            {
                UserId = request.TenantUserId,
                IsGlobalAdmin = scope.IsGlobalAdmin,
                RootOrgUnitIds = scope.RootOrgUnitIds.ToList(),
                AllowedOrgUnitIds = scope.AllowedOrgUnitIds.ToList()
            };

            return Result.Success(dto);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting current user scope");
            return Result.Failure<CurrentUserScopeDto>("GET_SCOPE_FAILED", ex.Message);
        }
    }
}
