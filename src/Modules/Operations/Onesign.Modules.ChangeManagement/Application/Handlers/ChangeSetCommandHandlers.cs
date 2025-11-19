using System.Text.Json;
using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.ChangeManagement.Application.Commands;
using Onesign.Modules.ChangeManagement.Application.DTOs;
using Onesign.Modules.ChangeManagement.Application.Services;
using Onesign.Modules.ChangeManagement.Domain.Entities;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;
using Onesign.Shared.Result;

namespace Onesign.Modules.ChangeManagement.Application.Handlers;

public class CreateChangeSetCommandHandler : IRequestHandler<CreateChangeSetCommand, Result<ChangeSetDetailDto>>
{
    private readonly IChangeSetRepository _repository;
    private readonly ILogger<CreateChangeSetCommandHandler> _logger;

    public CreateChangeSetCommandHandler(IChangeSetRepository repository, ILogger<CreateChangeSetCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<ChangeSetDetailDto>> Handle(CreateChangeSetCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating change set for scope {ScopeType}/{ScopeId}", request.ScopeType, request.ScopeId);

        if (!Enum.TryParse<ChangeCategory>(request.Category, true, out var category))
            return Result.Failure<ChangeSetDetailDto>("InvalidCategory", "Invalid change category");

        var changeSet = new ChangeSet
        {
            Id = Guid.NewGuid(),
            ScopeType = request.ScopeType,
            ScopeId = request.ScopeId,
            Title = request.Title,
            Description = request.Description,
            Category = category,
            Status = ChangeSetStatus.Draft,
            RequestedByUserId = request.UserId,
            CreatedAt = DateTimeOffset.UtcNow
        };

        foreach (var itemDto in request.Items)
        {
            if (!Enum.TryParse<ChangeTargetType>(itemDto.TargetType, true, out var targetType))
                return Result.Failure<ChangeSetDetailDto>("InvalidTargetType", $"Invalid target type: {itemDto.TargetType}");

            if (!Enum.TryParse<ChangeOperation>(itemDto.Operation, true, out var operation))
                return Result.Failure<ChangeSetDetailDto>("InvalidOperation", $"Invalid operation: {itemDto.Operation}");

            changeSet.Items.Add(new ChangeItem
            {
                Id = Guid.NewGuid(),
                ChangeSetId = changeSet.Id,
                TargetType = targetType,
                TargetId = itemDto.TargetId,
                Operation = operation,
                CurrentValueJson = itemDto.CurrentValueJson,
                ProposedValueJson = itemDto.ProposedValueJson,
                Order = itemDto.Order
            });
        }

        await _repository.AddAsync(changeSet, cancellationToken);

        _logger.LogInformation("Created change set {ChangeSetId} with {ItemCount} items", changeSet.Id, changeSet.Items.Count);

        return Result.Success(MapToDetailDto(changeSet));
    }

    private static ChangeSetDetailDto MapToDetailDto(ChangeSet cs) => new()
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
}

public class UpdateChangeSetCommandHandler : IRequestHandler<UpdateChangeSetCommand, Result<ChangeSetDetailDto>>
{
    private readonly IChangeSetRepository _repository;
    private readonly ILogger<UpdateChangeSetCommandHandler> _logger;

    public UpdateChangeSetCommandHandler(IChangeSetRepository repository, ILogger<UpdateChangeSetCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result<ChangeSetDetailDto>> Handle(UpdateChangeSetCommand request, CancellationToken cancellationToken)
    {
        var changeSet = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (changeSet == null || changeSet.ScopeType != request.ScopeType || changeSet.ScopeId != request.ScopeId)
            return Result.Failure<ChangeSetDetailDto>("NotFound", "Change set not found");

        if (changeSet.Status != ChangeSetStatus.Draft)
            return Result.Failure<ChangeSetDetailDto>("InvalidStatus", "Only draft change sets can be updated");

        if (!Enum.TryParse<ChangeCategory>(request.Category, true, out var category))
            return Result.Failure<ChangeSetDetailDto>("InvalidCategory", "Invalid change category");

        changeSet.Title = request.Title;
        changeSet.Description = request.Description;
        changeSet.Category = category;
        changeSet.UpdatedAt = DateTimeOffset.UtcNow;

        changeSet.Items.Clear();
        foreach (var itemDto in request.Items)
        {
            if (!Enum.TryParse<ChangeTargetType>(itemDto.TargetType, true, out var targetType))
                return Result.Failure<ChangeSetDetailDto>("InvalidTargetType", $"Invalid target type: {itemDto.TargetType}");

            if (!Enum.TryParse<ChangeOperation>(itemDto.Operation, true, out var operation))
                return Result.Failure<ChangeSetDetailDto>("InvalidOperation", $"Invalid operation: {itemDto.Operation}");

            changeSet.Items.Add(new ChangeItem
            {
                Id = Guid.NewGuid(),
                ChangeSetId = changeSet.Id,
                TargetType = targetType,
                TargetId = itemDto.TargetId,
                Operation = operation,
                CurrentValueJson = itemDto.CurrentValueJson,
                ProposedValueJson = itemDto.ProposedValueJson,
                Order = itemDto.Order
            });
        }

        await _repository.UpdateAsync(changeSet, cancellationToken);

        _logger.LogInformation("Updated change set {ChangeSetId}", changeSet.Id);

        return Result.Success(MapToDetailDto(changeSet));
    }

    private static ChangeSetDetailDto MapToDetailDto(ChangeSet cs) => new()
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
}

public class SubmitChangeSetCommandHandler : IRequestHandler<SubmitChangeSetCommand, Result>
{
    private readonly IChangeSetRepository _repository;
    private readonly ISimulationEngine _simulationEngine;
    private readonly ILogger<SubmitChangeSetCommandHandler> _logger;

    public SubmitChangeSetCommandHandler(
        IChangeSetRepository repository,
        ISimulationEngine simulationEngine,
        ILogger<SubmitChangeSetCommandHandler> logger)
    {
        _repository = repository;
        _simulationEngine = simulationEngine;
        _logger = logger;
    }

    public async Task<Result> Handle(SubmitChangeSetCommand request, CancellationToken cancellationToken)
    {
        var changeSet = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (changeSet == null || changeSet.ScopeType != request.ScopeType || changeSet.ScopeId != request.ScopeId)
            return Result.Failure("NotFound", "Change set not found");

        if (changeSet.Status != ChangeSetStatus.Draft)
            return Result.Failure("InvalidStatus", "Only draft change sets can be submitted for review");

        if (!changeSet.Items.Any())
            return Result.Failure("NoItems", "Change set must have at least one item");

        // Run simulation before submitting
        var simulationResult = await _simulationEngine.SimulateAsync(changeSet, cancellationToken);
        changeSet.SimulationSummaryJson = JsonSerializer.Serialize(simulationResult);

        changeSet.Status = ChangeSetStatus.InReview;
        changeSet.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.UpdateAsync(changeSet, cancellationToken);

        _logger.LogInformation("Change set {ChangeSetId} submitted for review", changeSet.Id);

        return Result.Success();
    }
}

public class ApproveChangeSetCommandHandler : IRequestHandler<ApproveChangeSetCommand, Result>
{
    private readonly IChangeSetRepository _changeSetRepository;
    private readonly IChangeApprovalRepository _approvalRepository;
    private readonly IApprovalWorkflowService _approvalWorkflowService;
    private readonly ILogger<ApproveChangeSetCommandHandler> _logger;

    public ApproveChangeSetCommandHandler(
        IChangeSetRepository changeSetRepository,
        IChangeApprovalRepository approvalRepository,
        IApprovalWorkflowService approvalWorkflowService,
        ILogger<ApproveChangeSetCommandHandler> logger)
    {
        _changeSetRepository = changeSetRepository;
        _approvalRepository = approvalRepository;
        _approvalWorkflowService = approvalWorkflowService;
        _logger = logger;
    }

    public async Task<Result> Handle(ApproveChangeSetCommand request, CancellationToken cancellationToken)
    {
        var changeSet = await _changeSetRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (changeSet == null || changeSet.ScopeType != request.ScopeType || changeSet.ScopeId != request.ScopeId)
            return Result.Failure("NotFound", "Change set not found");

        if (changeSet.Status != ChangeSetStatus.InReview)
            return Result.Failure("InvalidStatus", "Change set is not in review status");

        if (!await _approvalWorkflowService.CanApproveAsync(changeSet, request.UserId, cancellationToken))
            return Result.Failure("CannotApprove", "User cannot approve this change set");

        var approval = new ChangeApproval
        {
            Id = Guid.NewGuid(),
            ChangeSetId = changeSet.Id,
            ApproverUserId = request.UserId,
            Decision = ApprovalDecision.Approved,
            Reason = request.Reason,
            DecidedAt = DateTimeOffset.UtcNow
        };

        await _approvalRepository.AddAsync(approval, cancellationToken);

        // Check if we have sufficient approvals
        changeSet.Approvals.Add(approval);
        if (await _approvalWorkflowService.HasSufficientApprovalsAsync(changeSet, cancellationToken))
        {
            changeSet.Status = ChangeSetStatus.Approved;
            changeSet.ApprovedByUserId = request.UserId;
            changeSet.ApprovedAt = DateTimeOffset.UtcNow;
            changeSet.UpdatedAt = DateTimeOffset.UtcNow;
            await _changeSetRepository.UpdateAsync(changeSet, cancellationToken);

            _logger.LogInformation("Change set {ChangeSetId} approved with sufficient approvals", changeSet.Id);
        }
        else
        {
            _logger.LogInformation("Approval recorded for change set {ChangeSetId}, waiting for more approvals", changeSet.Id);
        }

        return Result.Success();
    }
}

public class RejectChangeSetCommandHandler : IRequestHandler<RejectChangeSetCommand, Result>
{
    private readonly IChangeSetRepository _changeSetRepository;
    private readonly IChangeApprovalRepository _approvalRepository;
    private readonly IApprovalWorkflowService _approvalWorkflowService;
    private readonly ILogger<RejectChangeSetCommandHandler> _logger;

    public RejectChangeSetCommandHandler(
        IChangeSetRepository changeSetRepository,
        IChangeApprovalRepository approvalRepository,
        IApprovalWorkflowService approvalWorkflowService,
        ILogger<RejectChangeSetCommandHandler> logger)
    {
        _changeSetRepository = changeSetRepository;
        _approvalRepository = approvalRepository;
        _approvalWorkflowService = approvalWorkflowService;
        _logger = logger;
    }

    public async Task<Result> Handle(RejectChangeSetCommand request, CancellationToken cancellationToken)
    {
        var changeSet = await _changeSetRepository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (changeSet == null || changeSet.ScopeType != request.ScopeType || changeSet.ScopeId != request.ScopeId)
            return Result.Failure("NotFound", "Change set not found");

        if (changeSet.Status != ChangeSetStatus.InReview)
            return Result.Failure("InvalidStatus", "Change set is not in review status");

        if (!await _approvalWorkflowService.CanApproveAsync(changeSet, request.UserId, cancellationToken))
            return Result.Failure("CannotReject", "User cannot reject this change set");

        var approval = new ChangeApproval
        {
            Id = Guid.NewGuid(),
            ChangeSetId = changeSet.Id,
            ApproverUserId = request.UserId,
            Decision = ApprovalDecision.Rejected,
            Reason = request.Reason,
            DecidedAt = DateTimeOffset.UtcNow
        };

        await _approvalRepository.AddAsync(approval, cancellationToken);

        // Return to draft status on rejection
        changeSet.Status = ChangeSetStatus.Draft;
        changeSet.UpdatedAt = DateTimeOffset.UtcNow;
        await _changeSetRepository.UpdateAsync(changeSet, cancellationToken);

        _logger.LogInformation("Change set {ChangeSetId} rejected by user {UserId}. Reason: {Reason}",
            changeSet.Id, request.UserId, request.Reason);

        return Result.Success();
    }
}

public class ScheduleChangeSetCommandHandler : IRequestHandler<ScheduleChangeSetCommand, Result>
{
    private readonly IChangeSetRepository _repository;
    private readonly ILogger<ScheduleChangeSetCommandHandler> _logger;

    public ScheduleChangeSetCommandHandler(IChangeSetRepository repository, ILogger<ScheduleChangeSetCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<Result> Handle(ScheduleChangeSetCommand request, CancellationToken cancellationToken)
    {
        var changeSet = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (changeSet == null || changeSet.ScopeType != request.ScopeType || changeSet.ScopeId != request.ScopeId)
            return Result.Failure("NotFound", "Change set not found");

        if (changeSet.Status != ChangeSetStatus.Approved)
            return Result.Failure("InvalidStatus", "Only approved change sets can be scheduled");

        if (request.ScheduledFor <= DateTimeOffset.UtcNow)
            return Result.Failure("InvalidSchedule", "Scheduled time must be in the future");

        changeSet.Status = ChangeSetStatus.Scheduled;
        changeSet.ScheduledFor = request.ScheduledFor;
        changeSet.UpdatedAt = DateTimeOffset.UtcNow;

        await _repository.UpdateAsync(changeSet, cancellationToken);

        _logger.LogInformation("Change set {ChangeSetId} scheduled for {ScheduledFor}", changeSet.Id, request.ScheduledFor);

        return Result.Success();
    }
}

public class ApplyChangeSetCommandHandler : IRequestHandler<ApplyChangeSetCommand, Result>
{
    private readonly IChangeSetRepository _repository;
    private readonly IChangeSetExecutionService _executionService;
    private readonly ILogger<ApplyChangeSetCommandHandler> _logger;

    public ApplyChangeSetCommandHandler(
        IChangeSetRepository repository,
        IChangeSetExecutionService executionService,
        ILogger<ApplyChangeSetCommandHandler> logger)
    {
        _repository = repository;
        _executionService = executionService;
        _logger = logger;
    }

    public async Task<Result> Handle(ApplyChangeSetCommand request, CancellationToken cancellationToken)
    {
        var changeSet = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (changeSet == null || changeSet.ScopeType != request.ScopeType || changeSet.ScopeId != request.ScopeId)
            return Result.Failure("NotFound", "Change set not found");

        if (changeSet.Status != ChangeSetStatus.Approved && changeSet.Status != ChangeSetStatus.Scheduled)
            return Result.Failure("InvalidStatus", "Change set must be approved or scheduled to be applied");

        var success = await _executionService.ApplyAsync(changeSet, request.UserId, cancellationToken);

        if (!success)
            return Result.Failure("ApplyFailed", "Failed to apply change set");

        _logger.LogInformation("Change set {ChangeSetId} applied successfully", changeSet.Id);

        return Result.Success();
    }
}

public class RollbackChangeSetCommandHandler : IRequestHandler<RollbackChangeSetCommand, Result>
{
    private readonly IChangeSetRepository _repository;
    private readonly IChangeSetExecutionService _executionService;
    private readonly ILogger<RollbackChangeSetCommandHandler> _logger;

    public RollbackChangeSetCommandHandler(
        IChangeSetRepository repository,
        IChangeSetExecutionService executionService,
        ILogger<RollbackChangeSetCommandHandler> logger)
    {
        _repository = repository;
        _executionService = executionService;
        _logger = logger;
    }

    public async Task<Result> Handle(RollbackChangeSetCommand request, CancellationToken cancellationToken)
    {
        var changeSet = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (changeSet == null || changeSet.ScopeType != request.ScopeType || changeSet.ScopeId != request.ScopeId)
            return Result.Failure("NotFound", "Change set not found");

        if (changeSet.Status != ChangeSetStatus.Applied)
            return Result.Failure("InvalidStatus", "Only applied change sets can be rolled back");

        var success = await _executionService.RollbackAsync(changeSet, request.UserId, request.Reason, cancellationToken);

        if (!success)
            return Result.Failure("RollbackFailed", "Failed to rollback change set");

        _logger.LogInformation("Change set {ChangeSetId} rolled back successfully", changeSet.Id);

        return Result.Success();
    }
}

public class SimulateChangeSetCommandHandler : IRequestHandler<SimulateChangeSetCommand, Result<SimulationResultDto>>
{
    private readonly IChangeSetRepository _repository;
    private readonly ISimulationEngine _simulationEngine;
    private readonly ILogger<SimulateChangeSetCommandHandler> _logger;

    public SimulateChangeSetCommandHandler(
        IChangeSetRepository repository,
        ISimulationEngine simulationEngine,
        ILogger<SimulateChangeSetCommandHandler> logger)
    {
        _repository = repository;
        _simulationEngine = simulationEngine;
        _logger = logger;
    }

    public async Task<Result<SimulationResultDto>> Handle(SimulateChangeSetCommand request, CancellationToken cancellationToken)
    {
        var changeSet = await _repository.GetByIdWithDetailsAsync(request.Id, cancellationToken);
        if (changeSet == null || changeSet.ScopeType != request.ScopeType || changeSet.ScopeId != request.ScopeId)
            return Result.Failure<SimulationResultDto>("NotFound", "Change set not found");

        if (!changeSet.Items.Any())
            return Result.Failure<SimulationResultDto>("NoItems", "Change set has no items to simulate");

        var result = await _simulationEngine.SimulateAsync(changeSet, cancellationToken);

        // Store simulation result
        changeSet.SimulationSummaryJson = JsonSerializer.Serialize(result);
        changeSet.UpdatedAt = DateTimeOffset.UtcNow;
        await _repository.UpdateAsync(changeSet, cancellationToken);

        _logger.LogInformation("Simulation completed for change set {ChangeSetId}. Risk direction: {RiskDirection}",
            changeSet.Id, result.RiskDirection);

        return Result.Success(result);
    }
}
