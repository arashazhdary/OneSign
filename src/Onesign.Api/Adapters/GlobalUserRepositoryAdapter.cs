using Onesign.Modules.Security.Domain.Entities;
using Onesign.Modules.Security.Domain.Repositories;

namespace Onesign.Api.Adapters;

/// <summary>
/// Adapter to bridge Identity module's GlobalUserRepository to Security module's interface
/// </summary>
public class GlobalUserRepositoryAdapter : IGlobalUserRepository
{
    private readonly Onesign.Modules.Identity.Domain.Repositories.IGlobalUserRepository _identityRepo;

    public GlobalUserRepositoryAdapter(Onesign.Modules.Identity.Domain.Repositories.IGlobalUserRepository identityRepo)
    {
        _identityRepo = identityRepo;
    }

    public async Task<GlobalUser?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var identityUser = await _identityRepo.GetByIdAsync(id, cancellationToken);

        if (identityUser == null)
            return null;

        return new GlobalUser
        {
            Id = identityUser.Id,
            Email = identityUser.Email,
            PhoneNumber = null // Identity module's GlobalUser doesn't have PhoneNumber
        };
    }
}
