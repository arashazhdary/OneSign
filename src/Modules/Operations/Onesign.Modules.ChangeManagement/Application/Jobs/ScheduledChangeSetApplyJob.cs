using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Modules.ChangeManagement.Application.Commands;
using Onesign.Modules.ChangeManagement.Domain.Enums;
using Onesign.Modules.ChangeManagement.Domain.Repositories;

namespace Onesign.Modules.ChangeManagement.Application.Jobs;

/// <summary>
/// Background job that monitors scheduled ChangeSets and applies them when their scheduled time is reached.
/// This ensures that approved changes are automatically applied at the designated time without manual intervention.
/// </summary>
public class ScheduledChangeSetApplyJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ScheduledChangeSetApplyJob> _logger;
    private readonly IConfiguration _configuration;

    private const int DefaultIntervalSeconds = 60;
    private const int BatchSize = 10;

    public ScheduledChangeSetApplyJob(
        IServiceProvider serviceProvider,
        ILogger<ScheduledChangeSetApplyJob> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalSeconds = _configuration.GetValue(
            "BackgroundServices:ScheduledChangeSetApply:IntervalSeconds",
            DefaultIntervalSeconds);

        var checkInterval = TimeSpan.FromSeconds(intervalSeconds);

        _logger.LogInformation(
            "ScheduledChangeSetApplyJob starting with interval of {Interval} seconds",
            intervalSeconds);

        // Wait a bit before first check to allow application to fully start
        await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessScheduledChangeSetsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                // Expected during shutdown
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ScheduledChangeSetApplyJob execution");
            }

            try
            {
                await Task.Delay(checkInterval, stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
        }

        _logger.LogInformation("ScheduledChangeSetApplyJob stopped");
    }

    private async Task ProcessScheduledChangeSetsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var changeSetRepository = scope.ServiceProvider.GetRequiredService<IChangeSetRepository>();
        var mediator = scope.ServiceProvider.GetRequiredService<IMediator>();

        var now = DateTimeOffset.UtcNow;

        // Get all scheduled change sets for both Tenant and Global scopes
        var tenantScheduledSets = await GetScheduledChangeSetsAsync(
            changeSetRepository, "Tenant", cancellationToken);

        var globalScheduledSets = await GetScheduledChangeSetsAsync(
            changeSetRepository, "Global", cancellationToken);

        var allScheduledSets = tenantScheduledSets.Concat(globalScheduledSets).ToList();

        // Filter to only those that are due
        var dueChangeSets = allScheduledSets
            .Where(cs => cs.ScheduledFor.HasValue && cs.ScheduledFor.Value <= now)
            .Take(BatchSize)
            .ToList();

        if (!dueChangeSets.Any())
        {
            return;
        }

        _logger.LogInformation(
            "Processing {Count} scheduled ChangeSets that are due",
            dueChangeSets.Count);

        foreach (var changeSet in dueChangeSets)
        {
            try
            {
                await ApplyScheduledChangeSetAsync(mediator, changeSet, cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error applying scheduled ChangeSet {ChangeSetId}",
                    changeSet.Id);
            }
        }

        _logger.LogInformation(
            "Scheduled ChangeSet processing completed at {Time}",
            DateTimeOffset.UtcNow);
    }

    private async Task<IEnumerable<ScheduledChangeSetInfo>> GetScheduledChangeSetsAsync(
        IChangeSetRepository repository,
        string scopeType,
        CancellationToken cancellationToken)
    {
        try
        {
            // Get change sets with Scheduled status
            // Note: For Global scope, we use Guid.Empty as the scopeId
            var scopeId = scopeType == "Global" ? Guid.Empty : Guid.Empty; // Will get all tenants' scheduled

            var (items, _) = await repository.GetPagedAsync(
                scopeType,
                scopeId,
                ChangeSetStatus.Scheduled,
                null, // category
                null, // requestedByUserId
                null, // fromDate
                null, // toDate
                1,
                BatchSize * 10, // Get more to filter client-side
                cancellationToken);

            return items.Select(cs => new ScheduledChangeSetInfo
            {
                Id = cs.Id,
                ScopeType = cs.ScopeType,
                ScopeId = cs.ScopeId,
                Title = cs.Title,
                ScheduledFor = cs.ScheduledFor,
                RequestedByUserId = cs.RequestedByUserId
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Error retrieving scheduled ChangeSets for scope {ScopeType}",
                scopeType);
            return Enumerable.Empty<ScheduledChangeSetInfo>();
        }
    }

    private async Task ApplyScheduledChangeSetAsync(
        IMediator mediator,
        ScheduledChangeSetInfo changeSet,
        CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "Applying scheduled ChangeSet {ChangeSetId} '{Title}' (scheduled for {ScheduledFor})",
            changeSet.Id,
            changeSet.Title,
            changeSet.ScheduledFor);

        var command = new ApplyChangeSetCommand
        {
            Id = changeSet.Id,
            ScopeType = changeSet.ScopeType,
            ScopeId = changeSet.ScopeId,
            UserId = Guid.Empty // System-initiated apply
        };

        var result = await mediator.Send(command, cancellationToken);

        if (result.IsSuccess)
        {
            _logger.LogInformation(
                "Successfully applied scheduled ChangeSet {ChangeSetId}",
                changeSet.Id);
        }
        else
        {
            _logger.LogError(
                "Failed to apply scheduled ChangeSet {ChangeSetId}: {Error}",
                changeSet.Id,
                result.ErrorMessage);
        }
    }

    private class ScheduledChangeSetInfo
    {
        public Guid Id { get; set; }
        public string ScopeType { get; set; } = string.Empty;
        public Guid ScopeId { get; set; }
        public string Title { get; set; } = string.Empty;
        public DateTimeOffset? ScheduledFor { get; set; }
        public Guid RequestedByUserId { get; set; }
    }
}
