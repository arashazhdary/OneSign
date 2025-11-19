using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Modules.ChangeManagement.Application.Queries;
using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;
using Onesign.Shared.Pagination;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Handlers;

public class GetChangeSetsQueryHandler : IRequestHandler<GetChangeSetsQuery, Result<PagedResult<ChangeSetDto>>>
{
    private readonly IChangeSetRepository _repository;
    private readonly ILogger<GetChangeSetsQueryHandler> _logger;

    public GetChangeSetsQueryHandler(IChangeSetRepository repository, ILogger<GetChangeSetsQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<PagedResult<ChangeSetDto>>> Handle(GetChangeSetsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Fetching change sets for scope {ScopeType}/{ScopeId}", request.ScopeType, request.ScopeId);

        ChangeSetStatus? status = null;
        if (!string.IsNullOrEmpty(request.Status) && Enum.TryParse<ChangeSetStatus>(request.Status, true, out var parsedStatus))
        {
            status = parsedStatus;
        }

        ChangeCategory? category = null;
        if (!string.IsNullOrEmpty(request.Category) && Enum.TryParse<ChangeCategory>(request.Category, true, out var parsedCategory))
        {
            category = parsedCategory;
        }

        var (items, totalCount) = await _repository.GetPagedAsync(
            request.ScopeType,
            request.ScopeId,
            status,
            category,
            request.RequestedByUserId,
            request.FromDate,
            request.ToDate,
            request.PageNumber,
            request.PageSize,
            cancellationToken);

        var result = new PagedResult<ChangeSetDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            PageNumber = request.PageNumber,
            PageSize = request.PageSize
        };

        return Result.Success(result);
    }

    private static ChangeSetDto MapToDto(ChangeSet cs) => new()
    {
        Id = cs.Id,
        ScopeType = cs.ScopeType,
        ScopeId = cs.ScopeId,
        Title = cs.Title,
        Description = cs.Description,
        Category = cs.Category.ToString(),
        Status = cs.Status.ToString(),
        RequestedByUserId = cs.RequestedByUserId,
        CreatedAt = cs.CreatedAt,
        UpdatedAt = cs.UpdatedAt,
        ApprovedByUserId = cs.ApprovedByUserId,
        ApprovedAt = cs.ApprovedAt,
        ScheduledFor = cs.ScheduledFor,
        AppliedAt = cs.AppliedAt,
        RolledBackAt = cs.RolledBackAt,
        RollbackReason = cs.RollbackReason,
        ItemCount = cs.Items.Count
    };
}

public class GetChangeSetDetailQueryHandler : IRequestHandler<GetChangeSetDetailQuery, Result<ChangeSetDetailDto>>
{
    private readonly IChangeSetRepository _repository;
    private readonly ILogger<GetChangeSetDetailQueryHandler> _logger;

    public GetChangeSetDetailQueryHandler(IChangeSetRepository repository, ILogger<GetChangeSetDetailQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<ChangeSetDetailDto>> Handle(GetChangeSetDetailQuery request, CancellationToken cancellationToken)
    {
        var changeSet = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (changeSet == null || changeSet.ScopeType != request.ScopeType || changeSet.ScopeId != request.ScopeId)
            return Result.Failure<ChangeSetDetailDto>("NotFound", "Change set not found");

        return Result.Success(MapToDetailDto(changeSet));
    }

    private static ChangeSetDetailDto MapToDetailDto(ChangeSet cs)
    {
        var dto = new ChangeSetDetailDto
        {
            Id = cs.Id,
            ScopeType = cs.ScopeType,
            ScopeId = cs.ScopeId,
            Title = cs.Title,
            Description = cs.Description,
            Category = cs.Category.ToString(),
            Status = cs.Status.ToString(),
            RequestedByUserId = cs.RequestedByUserId,
            CreatedAt = cs.CreatedAt,
            UpdatedAt = cs.UpdatedAt,
            ApprovedByUserId = cs.ApprovedByUserId,
            ApprovedAt = cs.ApprovedAt,
            ScheduledFor = cs.ScheduledFor,
            AppliedAt = cs.AppliedAt,
            RolledBackAt = cs.RolledBackAt,
            RollbackReason = cs.RollbackReason,
            Items = cs.Items.Select(i => new ChangeItemDto
            {
                Id = i.Id,
                ChangeSetId = i.ChangeSetId,
                TargetType = i.TargetType.ToString(),
                TargetId = i.TargetId,
                Operation = i.Operation.ToString(),
                CurrentValueJson = i.CurrentValueJson,
                ProposedValueJson = i.ProposedValueJson,
                Order = i.Order
            }).ToList(),
            Approvals = cs.Approvals.Select(a => new ChangeApprovalDto
            {
                Id = a.Id,
                ChangeSetId = a.ChangeSetId,
                ApproverUserId = a.ApproverUserId,
                Decision = a.Decision.ToString(),
                Reason = a.Reason,
                DecidedAt = a.DecidedAt
            }).ToList(),
            ExecutionLogs = cs.ExecutionLogs.Select(l => new ChangeExecutionLogDto
            {
                Id = l.Id,
                ChangeSetId = l.ChangeSetId,
                ItemId = l.ItemId,
                Step = l.Step.ToString(),
                Status = l.Status,
                Message = l.Message,
                CreatedAt = l.CreatedAt
            }).ToList()
        };

        // Parse simulation summary if available
        if (!string.IsNullOrEmpty(cs.SimulationSummaryJson))
        {
            try
            {
                dto.SimulationResult = JsonSerializer.Deserialize<SimulationResultDto>(cs.SimulationSummaryJson);
            }
            catch (JsonException)
            {
                // If parsing fails, leave SimulationResult as null
            }
        }

        return dto;
    }
}

public class GetChangeExecutionLogQueryHandler : IRequestHandler<GetChangeExecutionLogQuery, Result<List<ChangeExecutionLogDto>>>
{
    private readonly IChangeSetRepository _changeSetRepository;
    private readonly IChangeExecutionLogRepository _logRepository;
    private readonly ILogger<GetChangeExecutionLogQueryHandler> _logger;

    public GetChangeExecutionLogQueryHandler(
        IChangeSetRepository changeSetRepository,
        IChangeExecutionLogRepository logRepository,
        ILogger<GetChangeExecutionLogQueryHandler> logger)
    {
        _changeSetRepository = changeSetRepository;
        _logRepository = logRepository;
        _logger = logger;
    }

    public async Task<Result<List<ChangeExecutionLogDto>>> Handle(GetChangeExecutionLogQuery request, CancellationToken cancellationToken)
    {
        // Verify change set exists and belongs to scope
        var changeSet = await _changeSetRepository.GetByIdAsync(request.ChangeSetId, cancellationToken);
        if (changeSet == null || changeSet.ScopeType != request.ScopeType || changeSet.ScopeId != request.ScopeId)
            return Result.Failure<List<ChangeExecutionLogDto>>("NotFound", "Change set not found");

        IReadOnlyList<ChangeExecutionLog> logs;

        if (!string.IsNullOrEmpty(request.Step) && Enum.TryParse<ExecutionStep>(request.Step, true, out var step))
        {
            logs = await _logRepository.GetByChangeSetAndStepAsync(request.ChangeSetId, step, cancellationToken);
        }
        else
        {
            logs = await _logRepository.GetByChangeSetIdAsync(request.ChangeSetId, cancellationToken);
        }

        var result = logs.Select(l => new ChangeExecutionLogDto
        {
            Id = l.Id,
            ChangeSetId = l.ChangeSetId,
            ItemId = l.ItemId,
            Step = l.Step.ToString(),
            Status = l.Status,
            Message = l.Message,
            CreatedAt = l.CreatedAt
        }).ToList();

        return Result.Success(result);
    }
}

public class GetPendingApprovalsQueryHandler : IRequestHandler<GetPendingApprovalsQuery, Result<List<ChangeSetDto>>>
{
    private readonly IChangeSetRepository _repository;
    private readonly ILogger<GetPendingApprovalsQueryHandler> _logger;

    public GetPendingApprovalsQueryHandler(IChangeSetRepository repository, ILogger<GetPendingApprovalsQueryHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<List<ChangeSetDto>>> Handle(GetPendingApprovalsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogDebug("Fetching pending approvals for user {UserId}", request.UserId);

        var changeSets = await _repository.GetPendingApprovalsForUserAsync(request.UserId, cancellationToken);

        var result = changeSets.Select(cs => new ChangeSetDto
        {
            Id = cs.Id,
            ScopeType = cs.ScopeType,
            ScopeId = cs.ScopeId,
            Title = cs.Title,
            Description = cs.Description,
            Category = cs.Category.ToString(),
            Status = cs.Status.ToString(),
            RequestedByUserId = cs.RequestedByUserId,
            CreatedAt = cs.CreatedAt,
            UpdatedAt = cs.UpdatedAt,
            ApprovedByUserId = cs.ApprovedByUserId,
            ApprovedAt = cs.ApprovedAt,
            ScheduledFor = cs.ScheduledFor,
            AppliedAt = cs.AppliedAt,
            RolledBackAt = cs.RolledBackAt,
            RollbackReason = cs.RollbackReason,
            ItemCount = cs.Items.Count
        }).ToList();

        return Result.Success(result);
    }
}
