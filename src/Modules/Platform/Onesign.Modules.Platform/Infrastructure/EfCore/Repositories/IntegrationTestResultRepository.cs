using Microsoft.EntityFrameworkCore;
using Onesign.Data.Contexts;
using Onesign.Modules.Platform.Domain.Entities;
using Onesign.Modules.Platform.Domain.Enums;
using Onesign.Modules.Platform.Domain.Repositories;
using Onesign.Modules.Platform.Infrastructure.EfCore.Entities;

namespace Onesign.Modules.Platform.Infrastructure.EfCore.Repositories;

public class IntegrationTestResultRepository : IIntegrationTestResultRepository
{
    private readonly OnesignDbContext _dbContext;

    public IntegrationTestResultRepository(OnesignDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<IntegrationTestResult?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var entity = await _dbContext.Set<IntegrationTestResultEntity>()
            .FirstOrDefaultAsync(x => x.Id == id, cancellationToken);

        return entity != null ? MapToDomain(entity) : null;
    }

    public async Task<IReadOnlyList<IntegrationTestResult>> GetByTestSuiteIdAsync(Guid testSuiteId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<IntegrationTestResultEntity>()
            .Where(x => x.TestSuiteId == testSuiteId)
            .OrderBy(x => x.TestName)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<IReadOnlyList<IntegrationTestResult>> GetAllAsync(int page, int pageSize, TestStatus? status, string? category, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<IntegrationTestResultEntity>().AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == (int)status.Value);
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(x => x.Category == category);
        }

        var entities = await query
            .OrderByDescending(x => x.StartedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task<int> GetTotalCountAsync(TestStatus? status, string? category, CancellationToken cancellationToken = default)
    {
        var query = _dbContext.Set<IntegrationTestResultEntity>().AsQueryable();

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == (int)status.Value);
        }

        if (!string.IsNullOrEmpty(category))
        {
            query = query.Where(x => x.Category == category);
        }

        return await query.CountAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<IntegrationTestResult>> GetLatestResultsAsync(int count, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<IntegrationTestResultEntity>()
            .OrderByDescending(x => x.StartedAt)
            .Take(count)
            .ToListAsync(cancellationToken);

        return entities.Select(MapToDomain).ToList();
    }

    public async Task AddAsync(IntegrationTestResult result, CancellationToken cancellationToken = default)
    {
        var entity = MapToEntity(result);
        await _dbContext.Set<IntegrationTestResultEntity>().AddAsync(entity, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task AddRangeAsync(IEnumerable<IntegrationTestResult> results, CancellationToken cancellationToken = default)
    {
        var entities = results.Select(MapToEntity);
        await _dbContext.Set<IntegrationTestResultEntity>().AddRangeAsync(entities, cancellationToken);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(IntegrationTestResult result, CancellationToken cancellationToken = default)
    {
        var existing = await _dbContext.Set<IntegrationTestResultEntity>()
            .FirstOrDefaultAsync(x => x.Id == result.Id, cancellationToken);

        if (existing == null)
            return;

        existing.TestSuiteId = result.TestSuiteId;
        existing.TestName = result.TestName;
        existing.Status = (int)result.Status;
        existing.StartedAt = result.StartedAt;
        existing.CompletedAt = result.CompletedAt;
        existing.ErrorMessage = result.ErrorMessage;
        existing.StackTrace = result.StackTrace;
        existing.Category = result.Category;

        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteByTestSuiteIdAsync(Guid testSuiteId, CancellationToken cancellationToken = default)
    {
        var entities = await _dbContext.Set<IntegrationTestResultEntity>()
            .Where(x => x.TestSuiteId == testSuiteId)
            .ToListAsync(cancellationToken);

        _dbContext.Set<IntegrationTestResultEntity>().RemoveRange(entities);
        await _dbContext.SaveChangesAsync(cancellationToken);
    }

    private static IntegrationTestResult MapToDomain(IntegrationTestResultEntity e) => new()
    {
        Id = e.Id,
        TestSuiteId = e.TestSuiteId,
        TestName = e.TestName,
        Status = (TestStatus)e.Status,
        StartedAt = e.StartedAt,
        CompletedAt = e.CompletedAt,
        ErrorMessage = e.ErrorMessage,
        StackTrace = e.StackTrace,
        Category = e.Category
    };

    private static IntegrationTestResultEntity MapToEntity(IntegrationTestResult d) => new()
    {
        Id = d.Id,
        TestSuiteId = d.TestSuiteId,
        TestName = d.TestName,
        Status = (int)d.Status,
        StartedAt = d.StartedAt,
        CompletedAt = d.CompletedAt,
        ErrorMessage = d.ErrorMessage,
        StackTrace = d.StackTrace,
        Category = d.Category
    };
}
