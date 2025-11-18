namespace Onesign.Modules.Privacy.Domain.Services;

public interface IDataDeletionService
{
    Task ExecuteDeleteAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);
}
