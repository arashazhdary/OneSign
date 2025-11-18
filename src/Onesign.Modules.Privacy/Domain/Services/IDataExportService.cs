namespace Onesign.Modules.Privacy.Domain.Services;

public interface IDataExportService
{
    Task<string> ExportUserDataAsync(Guid tenantId, Guid userId, CancellationToken cancellationToken = default);
}
