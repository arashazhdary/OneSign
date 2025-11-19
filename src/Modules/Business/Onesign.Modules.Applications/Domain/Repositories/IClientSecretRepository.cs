using Onesign.Modules.Applications.Domain.Entities;

namespace Onesign.Modules.Applications.Domain.Repositories;

public interface IClientSecretRepository
{
    Task<ClientSecret?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<List<ClientSecret>> GetByApplicationClientIdAsync(Guid applicationClientId, CancellationToken cancellationToken = default);
    Task<ClientSecret> AddAsync(ClientSecret clientSecret, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task DeleteExpiredSecretsAsync(CancellationToken cancellationToken = default);
}

