using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Api.Adapters;

/// <summary>
/// Adapter to bridge Identity module's TenantUserRepository to Security module's interface
/// </summary>
public class TenantUserRepositoryAdapter : ITenantUserRepository
{
    private readonly Onesign.Modules.Identity.Domain.Repositories.ITenantUserRepository _identityRepo;

    public TenantUserRepositoryAdapter(Onesign.Modules.Identity.Domain.Repositories.ITenantUserRepository identityRepo)
    {
        _identityRepo = identityRepo;
    }

    public async Task<TenantUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var identityUser = await _identityRepo.GetByIdAsync(id, cancellationToken);

        if (identityUser == null)
            return null;

        return new TenantUser
        {
            Id = identityUser.Id,
            GlobalUserId = identityUser.GlobalUserId,
            TenantId = identityUser.TenantId
        };
    }
}
