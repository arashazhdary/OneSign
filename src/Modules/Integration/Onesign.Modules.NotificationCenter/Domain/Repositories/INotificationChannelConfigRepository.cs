using Onesign.Modules.NotificationCenter.Domain.Entities;
using Onesign.Modules.NotificationCenter.Domain.Enums;

namespace Onesign.Modules.NotificationCenter.Domain.Repositories;

public interface INotificationChannelConfigRepository
{
    Task<NotificationChannelConfig?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<NotificationChannelConfig?> GetByChannelAsync(Guid tenantId, NotificationChannel channel, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<NotificationChannelConfig>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(NotificationChannelConfig config, CancellationToken cancellationToken = default);
    Task UpdateAsync(NotificationChannelConfig config, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
