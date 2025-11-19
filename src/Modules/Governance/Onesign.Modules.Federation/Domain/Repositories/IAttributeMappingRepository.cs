using Onesign.Modules.Federation.Domain.Entities;

namespace Onesign.Modules.Federation.Domain.Repositories;

public interface IAttributeMappingRepository
{
    Task<AttributeMapping?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<AttributeMapping>> GetBySamlProviderIdAsync(Guid samlProviderId, CancellationToken cancellationToken = default);
    Task<List<AttributeMapping>> GetByOidcProviderIdAsync(Guid oidcProviderId, CancellationToken cancellationToken = default);
    Task<AttributeMapping> AddAsync(AttributeMapping mapping, CancellationToken cancellationToken = default);
    Task UpdateAsync(AttributeMapping mapping, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
