using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Identity.Domain.Repositories;
using Onesign.Modules.Organization.Application.DTOs;
using Onesign.Modules.Organization.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Organization.Application.Queries;

public class GetDelegatedAdminsQueryHandler : IRequestHandler<GetDelegatedAdminsQuery, Result<List<DelegatedAdminDto>>>
{
    private readonly IDelegatedAdminRepository _delegatedAdminRepository;
    private readonly IOrgUnitRepository _orgUnitRepository;
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;
    private readonly ILogger<GetDelegatedAdminsQueryHandler> _logger;

    public GetDelegatedAdminsQueryHandler(
        IDelegatedAdminRepository delegatedAdminRepository,
        IOrgUnitRepository orgUnitRepository,
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository,
        ILogger<GetDelegatedAdminsQueryHandler> logger)
    {
        _delegatedAdminRepository = delegatedAdminRepository;
        _orgUnitRepository = orgUnitRepository;
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
        _logger = logger;
    }

    public async Task<Result<List<DelegatedAdminDto>>> Handle(GetDelegatedAdminsQuery request, CancellationToken cancellationToken)
    {
        var delegatedAdmins = await _delegatedAdminRepository.GetByTenantIdAsync(request.TenantId, cancellationToken);

        var dtos = new List<DelegatedAdminDto>();

        foreach (var delegatedAdmin in delegatedAdmins)
        {
            var tenantUser = await _tenantUserRepository.GetByIdAsync(delegatedAdmin.TenantUserId, cancellationToken);
            var globalUser = tenantUser != null 
                ? await _globalUserRepository.GetByIdAsync(tenantUser.GlobalUserId, cancellationToken)
                : null;
            var orgUnit = await _orgUnitRepository.GetByIdAsync(delegatedAdmin.OrgUnitId, cancellationToken);

            dtos.Add(new DelegatedAdminDto
            {
                Id = delegatedAdmin.Id,
                TenantUserId = delegatedAdmin.TenantUserId,
                UserEmail = globalUser?.Email,
                UserDisplayName = globalUser?.Email, // Using email as display name for now
                OrgUnitId = delegatedAdmin.OrgUnitId,
                OrgUnitName = orgUnit?.Name ?? string.Empty,
                ScopeType = delegatedAdmin.ScopeType,
                CreatedAt = delegatedAdmin.CreatedAt
            });
        }

        return Result.Success(dtos);
    }
}

