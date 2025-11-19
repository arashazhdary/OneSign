using System.Diagnostics;
using System.Text.Json;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Hunting.Application.DTOs;
using Onesign.Modules.Hunting.Domain.Enums;
using Onesign.Shared.Result;

namespace Onesign.Modules.Hunting.Application.Services;

public class OqlExecutor : IOqlExecutor
{
    private readonly IOqlParser _parser;
    private readonly IEnumerable<IDatasetQueryService> _datasetServices;
    private readonly ILogger<OqlExecutor> _logger;

    public OqlExecutor(
        IOqlParser parser,
        IEnumerable<IDatasetQueryService> datasetServices,
        ILogger<OqlExecutor> logger)
    {
        _parser = parser;
        _datasetServices = datasetServices;
        _logger = logger;
    }

    public async Task<Result<HuntResultDto>> ExecuteAsync(
        string scopeType,
        Guid scopeId,
        OqlQueryDto query,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();

        var validationResult = _parser.ValidateQuery(query);
        if (validationResult.IsFailure)
        {
            return Result.Failure<HuntResultDto>(validationResult.ErrorCode!, validationResult.ErrorMessage);
        }

        var dataset = _parser.ParseDataset(query.Dataset);
        if (dataset == null)
        {
            return Result.Failure<HuntResultDto>("InvalidDataset", $"Unknown dataset: {query.Dataset}");
        }

        var datasetService = _datasetServices.FirstOrDefault(s => s.CanHandle(dataset.Value));
        if (datasetService == null)
        {
            return Result.Failure<HuntResultDto>("NoHandler", $"No handler for dataset: {query.Dataset}");
        }

        var (start, end) = _parser.ResolveTimeRange(query.TimeRange);
        var limit = query.Limit ?? 1000;

        _logger.LogInformation(
            "Executing OQL query on {Dataset} for scope {ScopeType}/{ScopeId}, time range {Start} to {End}",
            query.Dataset, scopeType, scopeId, start, end);

        try
        {
            var (rows, totalApprox, rowsScanned) = await datasetService.QueryAsync(
                scopeType,
                scopeId,
                start,
                end,
                query.Filter,
                query.Select,
                query.Sort,
                limit,
                cancellationToken);

            stopwatch.Stop();

            var result = new HuntResultDto
            {
                Rows = rows,
                TotalApprox = totalApprox,
                Meta = new HuntResultMetaDto
                {
                    Dataset = query.Dataset,
                    QueryStartTime = start,
                    QueryEndTime = end,
                    RowsScanned = rowsScanned,
                    RowsReturned = rows.Count,
                    ExecutionTimeMs = stopwatch.Elapsed.TotalMilliseconds,
                    ColumnsSelected = query.Select ?? new List<string>(),
                    SortColumn = query.Sort?.Column,
                    SortDirection = query.Sort?.Direction
                }
            };

            _logger.LogInformation(
                "OQL query completed in {ElapsedMs}ms. Scanned {Scanned} rows, returned {Returned} rows",
                stopwatch.Elapsed.TotalMilliseconds, rowsScanned, rows.Count);

            return Result.Success(result);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to execute OQL query on {Dataset}", query.Dataset);
            return Result.Failure<HuntResultDto>("ExecutionError", ex.Message);
        }
    }
}
