using MediatR;
using Onesign.Modules.Platform.Application.DTOs;
using Onesign.Modules.Platform.Application.Queries;
using Onesign.Modules.Platform.Application.Services;
using Onesign.Modules.Platform.Domain.Enums;
using Onesign.Modules.Platform.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.Platform.Application.Handlers;

public class GetPlatformVersionQueryHandler : IRequestHandler<GetPlatformVersionQuery, Result<PlatformVersionDto>>
{
    private readonly IPlatformVersionService _versionService;

    public GetPlatformVersionQueryHandler(IPlatformVersionService versionService)
    {
        _versionService = versionService;
    }

    public async Task<Result<PlatformVersionDto>> Handle(GetPlatformVersionQuery request, CancellationToken cancellationToken)
    {
        var version = await _versionService.GetCurrentVersionAsync(cancellationToken);

        if (version == null)
        {
            version = new PlatformVersionDto
            {
                Id = Guid.NewGuid(),
                Version = "1.0.0",
                ReleaseDate = DateTimeOffset.UtcNow,
                Description = "Initial release",
                IsCurrentVersion = true,
                CreatedAt = DateTimeOffset.UtcNow
            };
        }

        return Result.Success(version);
    }
}

public class GetPlatformVersionHistoryQueryHandler : IRequestHandler<GetPlatformVersionHistoryQuery, Result<PaginatedResultDto<PlatformVersionDto>>>
{
    private readonly IPlatformVersionService _versionService;

    public GetPlatformVersionHistoryQueryHandler(IPlatformVersionService versionService)
    {
        _versionService = versionService;
    }

    public async Task<Result<PaginatedResultDto<PlatformVersionDto>>> Handle(GetPlatformVersionHistoryQuery request, CancellationToken cancellationToken)
    {
        var versions = await _versionService.GetVersionHistoryAsync(request.Page, request.PageSize, cancellationToken);
        var totalCount = await _versionService.GetTotalVersionCountAsync(cancellationToken);

        return Result.Success(new PaginatedResultDto<PlatformVersionDto>
        {
            Items = versions,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        });
    }
}

public class GetPlatformHealthQueryHandler : IRequestHandler<GetPlatformHealthQuery, Result<PlatformHealthDto>>
{
    private readonly IPlatformHealthAggregator _healthAggregator;

    public GetPlatformHealthQueryHandler(IPlatformHealthAggregator healthAggregator)
    {
        _healthAggregator = healthAggregator;
    }

    public async Task<Result<PlatformHealthDto>> Handle(GetPlatformHealthQuery request, CancellationToken cancellationToken)
    {
        var health = await _healthAggregator.GetHealthReportAsync(cancellationToken);
        return Result.Success(health);
    }
}

public class GetComponentHealthQueryHandler : IRequestHandler<GetComponentHealthQuery, Result<ComponentHealthDto>>
{
    private readonly IPlatformHealthAggregator _healthAggregator;

    public GetComponentHealthQueryHandler(IPlatformHealthAggregator healthAggregator)
    {
        _healthAggregator = healthAggregator;
    }

    public async Task<Result<ComponentHealthDto>> Handle(GetComponentHealthQuery request, CancellationToken cancellationToken)
    {
        var health = await _healthAggregator.GetComponentHealthAsync(request.ComponentName, cancellationToken);
        return Result.Success(health);
    }
}

public class GetMigrationHistoryQueryHandler : IRequestHandler<GetMigrationHistoryQuery, Result<PaginatedResultDto<MigrationHistoryDto>>>
{
    private readonly IMigrationHistoryRepository _repository;

    public GetMigrationHistoryQueryHandler(IMigrationHistoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PaginatedResultDto<MigrationHistoryDto>>> Handle(GetMigrationHistoryQuery request, CancellationToken cancellationToken)
    {
        MigrationStatus? status = null;
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<MigrationStatus>(request.Status, true, out var s))
        {
            status = s;
        }

        var migrations = await _repository.GetAllAsync(request.Page, request.PageSize, status, cancellationToken);
        var totalCount = await _repository.GetTotalCountAsync(status, cancellationToken);

        var dtos = migrations.Select(m => new MigrationHistoryDto
        {
            Id = m.Id,
            MigrationName = m.MigrationName,
            AppliedAt = m.AppliedAt,
            AppliedByUserId = m.AppliedByUserId,
            Status = m.Status.ToString(),
            ErrorMessage = m.ErrorMessage,
            DurationMs = m.Duration.TotalMilliseconds
        }).ToList();

        return Result.Success(new PaginatedResultDto<MigrationHistoryDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        });
    }
}

public class GetMigrationByIdQueryHandler : IRequestHandler<GetMigrationByIdQuery, Result<MigrationHistoryDto>>
{
    private readonly IMigrationHistoryRepository _repository;

    public GetMigrationByIdQueryHandler(IMigrationHistoryRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<MigrationHistoryDto>> Handle(GetMigrationByIdQuery request, CancellationToken cancellationToken)
    {
        var migration = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (migration == null)
        {
            return Result.Failure<MigrationHistoryDto>("NotFound", "Migration not found");
        }

        return Result.Success(new MigrationHistoryDto
        {
            Id = migration.Id,
            MigrationName = migration.MigrationName,
            AppliedAt = migration.AppliedAt,
            AppliedByUserId = migration.AppliedByUserId,
            Status = migration.Status.ToString(),
            ErrorMessage = migration.ErrorMessage,
            DurationMs = migration.Duration.TotalMilliseconds
        });
    }
}

public class GetDiagnosticsQueryHandler : IRequestHandler<GetDiagnosticsQuery, Result<DiagnosticsDto>>
{
    private readonly IDiagnosticsService _diagnosticsService;

    public GetDiagnosticsQueryHandler(IDiagnosticsService diagnosticsService)
    {
        _diagnosticsService = diagnosticsService;
    }

    public async Task<Result<DiagnosticsDto>> Handle(GetDiagnosticsQuery request, CancellationToken cancellationToken)
    {
        var diagnostics = await _diagnosticsService.GetDiagnosticsAsync(cancellationToken);
        return Result.Success(diagnostics);
    }
}

public class GetIntegrationTestResultsQueryHandler : IRequestHandler<GetIntegrationTestResultsQuery, Result<PaginatedResultDto<IntegrationTestResultDto>>>
{
    private readonly IIntegrationTestResultRepository _repository;

    public GetIntegrationTestResultsQueryHandler(IIntegrationTestResultRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<PaginatedResultDto<IntegrationTestResultDto>>> Handle(GetIntegrationTestResultsQuery request, CancellationToken cancellationToken)
    {
        TestStatus? status = null;
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<TestStatus>(request.Status, true, out var s))
        {
            status = s;
        }

        var results = await _repository.GetAllAsync(request.Page, request.PageSize, status, request.Category, cancellationToken);
        var totalCount = await _repository.GetTotalCountAsync(status, request.Category, cancellationToken);

        var dtos = results.Select(r => new IntegrationTestResultDto
        {
            Id = r.Id,
            TestSuiteId = r.TestSuiteId,
            TestName = r.TestName,
            Status = r.Status.ToString(),
            StartedAt = r.StartedAt,
            CompletedAt = r.CompletedAt,
            ErrorMessage = r.ErrorMessage,
            StackTrace = r.StackTrace,
            Category = r.Category,
            DurationMs = r.CompletedAt.HasValue ? (r.CompletedAt.Value - r.StartedAt).TotalMilliseconds : null
        }).ToList();

        return Result.Success(new PaginatedResultDto<IntegrationTestResultDto>
        {
            Items = dtos,
            TotalCount = totalCount,
            Page = request.Page,
            PageSize = request.PageSize
        });
    }
}

public class GetTestSuiteResultsQueryHandler : IRequestHandler<GetTestSuiteResultsQuery, Result<TestSuiteResultDto>>
{
    private readonly IIntegrationTestResultRepository _repository;

    public GetTestSuiteResultsQueryHandler(IIntegrationTestResultRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<TestSuiteResultDto>> Handle(GetTestSuiteResultsQuery request, CancellationToken cancellationToken)
    {
        var results = await _repository.GetByTestSuiteIdAsync(request.TestSuiteId, cancellationToken);

        if (!results.Any())
        {
            return Result.Failure<TestSuiteResultDto>("NotFound", "Test suite not found");
        }

        var dtos = results.Select(r => new IntegrationTestResultDto
        {
            Id = r.Id,
            TestSuiteId = r.TestSuiteId,
            TestName = r.TestName,
            Status = r.Status.ToString(),
            StartedAt = r.StartedAt,
            CompletedAt = r.CompletedAt,
            ErrorMessage = r.ErrorMessage,
            StackTrace = r.StackTrace,
            Category = r.Category,
            DurationMs = r.CompletedAt.HasValue ? (r.CompletedAt.Value - r.StartedAt).TotalMilliseconds : null
        }).ToList();

        var startedAt = results.Min(r => r.StartedAt);
        var completedAt = results.Max(r => r.CompletedAt);

        return Result.Success(new TestSuiteResultDto
        {
            TestSuiteId = request.TestSuiteId,
            TotalTests = results.Count,
            Passed = results.Count(r => r.Status == TestStatus.Passed),
            Failed = results.Count(r => r.Status == TestStatus.Failed),
            Skipped = results.Count(r => r.Status == TestStatus.Skipped),
            StartedAt = startedAt,
            CompletedAt = completedAt,
            TotalDurationMs = completedAt.HasValue ? (completedAt.Value - startedAt).TotalMilliseconds : 0,
            Results = dtos
        });
    }
}

public class GetIntegrationTestResultByIdQueryHandler : IRequestHandler<GetIntegrationTestResultByIdQuery, Result<IntegrationTestResultDto>>
{
    private readonly IIntegrationTestResultRepository _repository;

    public GetIntegrationTestResultByIdQueryHandler(IIntegrationTestResultRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<IntegrationTestResultDto>> Handle(GetIntegrationTestResultByIdQuery request, CancellationToken cancellationToken)
    {
        var result = await _repository.GetByIdAsync(request.Id, cancellationToken);

        if (result == null)
        {
            return Result.Failure<IntegrationTestResultDto>("NotFound", "Test result not found");
        }

        return Result.Success(new IntegrationTestResultDto
        {
            Id = result.Id,
            TestSuiteId = result.TestSuiteId,
            TestName = result.TestName,
            Status = result.Status.ToString(),
            StartedAt = result.StartedAt,
            CompletedAt = result.CompletedAt,
            ErrorMessage = result.ErrorMessage,
            StackTrace = result.StackTrace,
            Category = result.Category,
            DurationMs = result.CompletedAt.HasValue ? (result.CompletedAt.Value - result.StartedAt).TotalMilliseconds : null
        });
    }
}
