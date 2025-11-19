using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Onesign.Modules.Insights.Application.Services;
using Onesign.Modules.Insights.Domain.Repositories;
using Onesign.Modules.Insights.Domain.Entities;
using Onesign.Modules.Insights.Domain.Enums;

namespace Onesign.Modules.Insights.Application.Jobs;

/// <summary>
/// Background job that runs periodically to check and process scheduled report subscriptions.
/// It checks ReportSubscriptions that are due, generates reports using IReportGenerationService,
/// and sends them via NotificationCenter.
/// </summary>
public class ScheduledReportsJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ScheduledReportsJob> _logger;
    private readonly IConfiguration _configuration;

    public ScheduledReportsJob(
        IServiceProvider serviceProvider,
        ILogger<ScheduledReportsJob> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalMinutes = _configuration.GetValue("BackgroundServices:ScheduledReports:IntervalMinutes", 60);
        var checkInterval = TimeSpan.FromMinutes(intervalMinutes);

        _logger.LogInformation(
            "ScheduledReportsJob starting with interval of {Interval} minutes",
            intervalMinutes);

        // Initial delay to allow system startup
        await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessScheduledReportsAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                _logger.LogInformation("ScheduledReportsJob is stopping");
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ScheduledReportsJob execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task ProcessScheduledReportsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var reportService = scope.ServiceProvider.GetRequiredService<IReportGenerationService>();
        var subscriptionRepository = scope.ServiceProvider.GetRequiredService<IReportSubscriptionRepository>();

        _logger.LogInformation("Starting scheduled reports processing at {Time}", DateTime.UtcNow);

        try
        {
            // Get all active subscriptions
            var activeSubscriptions = await subscriptionRepository.GetActiveSubscriptionsAsync(cancellationToken);
            var now = DateTime.UtcNow;
            var processedCount = 0;
            var errorCount = 0;

            foreach (var subscription in activeSubscriptions)
            {
                try
                {
                    if (IsSubscriptionDue(subscription, now))
                    {
                        _logger.LogInformation(
                            "Processing scheduled report for subscription {SubscriptionId} (Type: {ReportType})",
                            subscription.Id,
                            subscription.ReportType);

                        await ProcessSubscriptionAsync(subscription, reportService, subscriptionRepository, cancellationToken);
                        processedCount++;
                    }
                }
                catch (Exception ex)
                {
                    errorCount++;
                    _logger.LogError(ex,
                        "Error processing subscription {SubscriptionId} (Type: {ReportType})",
                        subscription.Id,
                        subscription.ReportType);
                }
            }

            _logger.LogInformation(
                "Scheduled reports processing completed. Processed: {Processed}, Errors: {Errors}",
                processedCount,
                errorCount);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during scheduled reports processing");
            throw;
        }
    }

    private bool IsSubscriptionDue(ReportSubscription subscription, DateTime now)
    {
        // If never sent, it's due
        if (subscription.LastSentAt == null)
            return true;

        var lastSent = subscription.LastSentAt.Value;
        var frequency = subscription.CronOrFrequency.ToLowerInvariant();

        // Parse frequency string
        return frequency switch
        {
            "daily" => (now - lastSent).TotalDays >= 1,
            "weekly" => (now - lastSent).TotalDays >= 7,
            "monthly" => (now - lastSent).TotalDays >= 30,
            "quarterly" => (now - lastSent).TotalDays >= 90,
            _ => TryParseCronExpression(frequency, lastSent, now)
        };
    }

    private bool TryParseCronExpression(string cronExpression, DateTime lastSent, DateTime now)
    {
        // Simple cron parsing for common patterns
        // Format: "minute hour day month dayOfWeek" or specific patterns

        try
        {
            var parts = cronExpression.Split(' ', StringSplitOptions.RemoveEmptyEntries);

            if (parts.Length >= 2)
            {
                // Try to parse as "HH:MM" format
                if (parts.Length == 1 && cronExpression.Contains(':'))
                {
                    var timeParts = cronExpression.Split(':');
                    var hour = int.Parse(timeParts[0]);
                    var minute = int.Parse(timeParts[1]);

                    // Check if we've passed the scheduled time today and haven't sent today
                    var todayScheduled = now.Date.AddHours(hour).AddMinutes(minute);
                    return now >= todayScheduled && lastSent.Date < now.Date;
                }

                // Standard cron: check if hour matches
                if (parts.Length >= 2 && parts[0] == "0" && int.TryParse(parts[1], out var scheduledHour))
                {
                    return now.Hour == scheduledHour && now.Minute < 10 && lastSent.Date < now.Date;
                }
            }

            // Default: check if at least an hour has passed
            return (now - lastSent).TotalHours >= 1;
        }
        catch
        {
            // If parsing fails, default to hourly
            return (now - lastSent).TotalHours >= 1;
        }
    }

    private async Task ProcessSubscriptionAsync(
        ReportSubscription subscription,
        IReportGenerationService reportService,
        IReportSubscriptionRepository repository,
        CancellationToken cancellationToken)
    {
        // Determine date range based on report type
        var (from, to) = GetReportDateRange(subscription);

        // Generate the report
        var reportResult = await reportService.GenerateReportAsync(
            subscription.ReportType,
            subscription.ScopeId,
            from,
            to,
            cancellationToken);

        if (!reportResult.Success)
        {
            _logger.LogWarning(
                "Failed to generate report for subscription {SubscriptionId}: {ErrorMessage}",
                subscription.Id,
                reportResult.ErrorMessage);
            return;
        }

        // Send the report via notification
        try
        {
            await reportService.SendReportAsync(
                subscription,
                reportResult.Content,
                reportResult.ReportName,
                cancellationToken);

            // Update last sent timestamp
            subscription.LastSentAt = DateTime.UtcNow;
            await repository.UpdateAsync(subscription, cancellationToken);

            _logger.LogInformation(
                "Successfully sent report for subscription {SubscriptionId} to {RecipientCount} recipients",
                subscription.Id,
                subscription.EmailRecipients.Split(';').Length);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex,
                "Failed to send report for subscription {SubscriptionId}",
                subscription.Id);
            throw;
        }
    }

    private (DateOnly from, DateOnly to) GetReportDateRange(ReportSubscription subscription)
    {
        var to = DateOnly.FromDateTime(DateTime.UtcNow.AddDays(-1));
        var frequency = subscription.CronOrFrequency.ToLowerInvariant();

        var from = frequency switch
        {
            "daily" => to,
            "weekly" => to.AddDays(-7),
            "monthly" => to.AddDays(-30),
            "quarterly" => to.AddDays(-90),
            _ => to.AddDays(-7) // Default to weekly
        };

        return (from, to);
    }
}
