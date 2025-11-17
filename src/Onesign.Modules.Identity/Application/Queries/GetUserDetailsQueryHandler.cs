using MediatR;
using Onesign.Modules.Identity.Application.DTOs;
using Onesign.Modules.Identity.Domain.Repositories;

namespace Onesign.Modules.Identity.Application.Queries;

public class GetUserDetailsQueryHandler : IRequestHandler<GetUserDetailsQuery, TenantUserDto?>
{
    private readonly ITenantUserRepository _tenantUserRepository;
    private readonly IGlobalUserRepository _globalUserRepository;

    public GetUserDetailsQueryHandler(
        ITenantUserRepository tenantUserRepository,
        IGlobalUserRepository globalUserRepository)
    {
        _tenantUserRepository = tenantUserRepository;
        _globalUserRepository = globalUserRepository;
    }

    public async Task<TenantUserDto?> Handle(GetUserDetailsQuery request, CancellationToken cancellationToken)
    {
        var tenantUser = await _tenantUserRepository.GetByIdAsync(request.TenantUserId, cancellationToken);
        if (tenantUser == null)
        {
            return null;
        }

        var globalUser = await _globalUserRepository.GetByIdAsync(tenantUser.GlobalUserId, cancellationToken);

        return new TenantUserDto
        {
            Id = tenantUser.Id,
            GlobalUserId = tenantUser.GlobalUserId,
            Email = globalUser?.Email ?? string.Empty,
            TenantId = tenantUser.TenantId,
            Status = tenantUser.Status,
            IsAdmin = tenantUser.IsAdmin,
            FirstLoginAt = tenantUser.FirstLoginAt,
            LastLoginAt = tenantUser.LastLoginAt,
            CreatedAt = tenantUser.CreatedAt
        };
    }
}

