using Onesign.Modules.Platform.Domain.Entities;
using Onesign.Modules.Platform.Domain.Enums;

namespace Onesign.Modules.Platform.Domain.Repositories;

public interface IIntegrationTestResultRepository
{
    Task<IntegrationTestResult?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<IntegrationTestResult>> GetByTestSuiteIdAsync(Guid testSuiteId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<IntegrationTestResult>> GetAllAsync(int page, int pageSize, TestStatus? status, string? category, CancellationToken cancellationToken = default);
    Task<int> GetTotalCountAsync(TestStatus? status, string? category, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<IntegrationTestResult>> GetLatestResultsAsync(int count, CancellationToken cancellationToken = default);
    Task AddAsync(IntegrationTestResult result, CancellationToken cancellationToken = default);
    Task AddRangeAsync(IEnumerable<IntegrationTestResult> results, CancellationToken cancellationToken = default);
    Task UpdateAsync(IntegrationTestResult result, CancellationToken cancellationToken = default);
    Task DeleteByTestSuiteIdAsync(Guid testSuiteId, CancellationToken cancellationToken = default);
}
