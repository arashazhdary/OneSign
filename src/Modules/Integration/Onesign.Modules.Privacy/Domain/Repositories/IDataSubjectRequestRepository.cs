using Onesign.Modules.Privacy.Domain.Entities;
using Onesign.Modules.Privacy.Domain.Enums;

namespace Onesign.Modules.Privacy.Domain.Repositories;

public interface IDataSubjectRequestRepository
{
    Task<DataSubjectRequest?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<DataSubjectRequest>> GetByTenantIdAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DataSubjectRequest>> GetBySubjectIdAsync(Guid subjectId, CancellationToken cancellationToken = default);
    Task<IEnumerable<DataSubjectRequest>> GetByStatusAsync(DataSubjectRequestStatus status, CancellationToken cancellationToken = default);
    Task<IEnumerable<DataSubjectRequest>> GetByTypeAsync(DataSubjectRequestType type, CancellationToken cancellationToken = default);
    Task<IEnumerable<DataSubjectRequest>> GetPendingAsync(CancellationToken cancellationToken = default);
    Task<IEnumerable<DataSubjectRequest>> GetPendingRequestsAsync(Guid tenantId, CancellationToken cancellationToken = default);
    Task AddAsync(DataSubjectRequest request, CancellationToken cancellationToken = default);
    Task UpdateAsync(DataSubjectRequest request, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
