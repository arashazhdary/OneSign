using MediatR;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Insights.Application.Commands;
using Onesign.Modules.Insights.Application.DTOs;
using Onesign.Modules.Insights.Application.Services;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Repositories;

namespace Onesign.Modules.Insights.Application.Handlers;

public class CreateReportSubscriptionCommandHandler : IRequestHandler<CreateReportSubscriptionCommand, ReportSubscriptionDto>
{
    private readonly IReportSubscriptionRepository _repository;
    private readonly ILogger<CreateReportSubscriptionCommandHandler> _logger;

    public CreateReportSubscriptionCommandHandler(
        IReportSubscriptionRepository repository,
        ILogger<CreateReportSubscriptionCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ReportSubscriptionDto> Handle(CreateReportSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = new ReportSubscription
        {
            Id = Guid.NewGuid(),
            ScopeType = request.ScopeType,
            ScopeId = request.ScopeId,
            ReportType = request.ReportType,
            CronOrFrequency = request.CronOrFrequency,
            EmailRecipients = string.Join(";", request.EmailRecipients),
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            CreatedByUserId = request.CreatedByUserId
        };

        await _repository.AddAsync(subscription, cancellationToken);

        _logger.LogInformation("Created report subscription {SubscriptionId} for {ReportType}", subscription.Id, request.ReportType);

        return MapToDto(subscription);
    }

    private static ReportSubscriptionDto MapToDto(ReportSubscription subscription) => new()
    {
        Id = subscription.Id,
        ScopeType = subscription.ScopeType,
        ScopeId = subscription.ScopeId,
        ReportType = subscription.ReportType,
        CronOrFrequency = subscription.CronOrFrequency,
        EmailRecipients = subscription.EmailRecipients.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
        IsActive = subscription.IsActive,
        CreatedAt = subscription.CreatedAt,
        CreatedByUserId = subscription.CreatedByUserId,
        UpdatedAt = subscription.UpdatedAt,
        UpdatedByUserId = subscription.UpdatedByUserId
    };
}

public class UpdateReportSubscriptionCommandHandler : IRequestHandler<UpdateReportSubscriptionCommand, ReportSubscriptionDto?>
{
    private readonly IReportSubscriptionRepository _repository;
    private readonly ILogger<UpdateReportSubscriptionCommandHandler> _logger;

    public UpdateReportSubscriptionCommandHandler(
        IReportSubscriptionRepository repository,
        ILogger<UpdateReportSubscriptionCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<ReportSubscriptionDto?> Handle(UpdateReportSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (subscription == null)
        {
            _logger.LogWarning("Report subscription {SubscriptionId} not found", request.Id);
            return null;
        }

        subscription.ScopeType = request.ScopeType;
        subscription.ScopeId = request.ScopeId;
        subscription.ReportType = request.ReportType;
        subscription.CronOrFrequency = request.CronOrFrequency;
        subscription.EmailRecipients = string.Join(";", request.EmailRecipients);
        subscription.IsActive = request.IsActive;
        subscription.UpdatedAt = DateTime.UtcNow;
        subscription.UpdatedByUserId = request.UpdatedByUserId;

        await _repository.UpdateAsync(subscription, cancellationToken);

        _logger.LogInformation("Updated report subscription {SubscriptionId}", subscription.Id);

        return MapToDto(subscription);
    }

    private static ReportSubscriptionDto MapToDto(ReportSubscription subscription) => new()
    {
        Id = subscription.Id,
        ScopeType = subscription.ScopeType,
        ScopeId = subscription.ScopeId,
        ReportType = subscription.ReportType,
        CronOrFrequency = subscription.CronOrFrequency,
        EmailRecipients = subscription.EmailRecipients.Split(';', StringSplitOptions.RemoveEmptyEntries).ToList(),
        IsActive = subscription.IsActive,
        CreatedAt = subscription.CreatedAt,
        CreatedByUserId = subscription.CreatedByUserId,
        UpdatedAt = subscription.UpdatedAt,
        UpdatedByUserId = subscription.UpdatedByUserId
    };
}

public class DeleteReportSubscriptionCommandHandler : IRequestHandler<DeleteReportSubscriptionCommand, bool>
{
    private readonly IReportSubscriptionRepository _repository;
    private readonly ILogger<DeleteReportSubscriptionCommandHandler> _logger;

    public DeleteReportSubscriptionCommandHandler(
        IReportSubscriptionRepository repository,
        ILogger<DeleteReportSubscriptionCommandHandler> logger)
    {
        _repository = repository;
        _logger = logger;
    }

    public async Task<bool> Handle(DeleteReportSubscriptionCommand request, CancellationToken cancellationToken)
    {
        var subscription = await _repository.GetByIdAsync(request.Id, cancellationToken);
        if (subscription == null)
        {
            _logger.LogWarning("Report subscription {SubscriptionId} not found for deletion", request.Id);
            return false;
        }

        await _repository.DeleteAsync(request.Id, cancellationToken);

        _logger.LogInformation("Deleted report subscription {SubscriptionId}", request.Id);

        return true;
    }
}

public class GenerateSnapshotCommandHandler : IRequestHandler<GenerateSnapshotCommand, GenerateSnapshotResult>
{
    private readonly IInsightsAggregationService _aggregationService;
    private readonly ILogger<GenerateSnapshotCommandHandler> _logger;

    public GenerateSnapshotCommandHandler(
        IInsightsAggregationService aggregationService,
        ILogger<GenerateSnapshotCommandHandler> logger)
    {
        _aggregationService = aggregationService;
        _logger = logger;
    }

    public async Task<GenerateSnapshotResult> Handle(GenerateSnapshotCommand request, CancellationToken cancellationToken)
    {
        try
        {
            _logger.LogInformation("Generating snapshots for date {Date}, TenantId: {TenantId}", request.Date, request.TenantId);

            var result = await _aggregationService.GenerateDailySnapshotsAsync(request.Date, request.TenantId, cancellationToken);

            _logger.LogInformation(
                "Generated {TenantSnapshots} tenant snapshots, {AppSnapshots} application snapshots, {UserPostures} user postures",
                result.TenantSnapshotsGenerated, result.ApplicationSnapshotsGenerated, result.UserPosturesUpdated);

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating snapshots for date {Date}", request.Date);
            return new GenerateSnapshotResult
            {
                Success = false,
                ErrorMessage = ex.Message
            };
        }
    }
}
