using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Configuration;
using Onesign.Modules.Hunting.Application.Services;
using Onesign.Modules.Hunting.Domain.Enums;

namespace Onesign.Modules.Hunting.Application.Jobs;

/// <summary>
/// Background job that runs scheduled hunts periodically.
/// Checks for due hunts every minute and executes them using IScheduledHuntRunner.
/// </summary>
public class ScheduledHuntsRunnerJob : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ScheduledHuntsRunnerJob> _logger;
    private readonly IConfiguration _configuration;

    private DateTime _lastHourlyRun = DateTime.MinValue;
    private DateTime _lastDailyRun = DateTime.MinValue;
    private DateTime _lastWeeklyRun = DateTime.MinValue;

    public ScheduledHuntsRunnerJob(
        IServiceProvider serviceProvider,
        ILogger<ScheduledHuntsRunnerJob> logger,
        IConfiguration configuration)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
        _configuration = configuration;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var intervalSeconds = _configuration.GetValue("BackgroundServices:ScheduledHunts:IntervalSeconds", 60);
        var checkInterval = TimeSpan.FromSeconds(intervalSeconds);

        _logger.LogInformation("ScheduledHuntsRunnerJob starting with check interval of {Interval} seconds", intervalSeconds);

        // Initialize last run times to now so we don't immediately run all schedules
        var now = DateTime.UtcNow;
        _lastHourlyRun = now;
        _lastDailyRun = now;
        _lastWeeklyRun = now;

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await ProcessScheduledHuntsAsync(stoppingToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in ScheduledHuntsRunnerJob execution");
            }

            await Task.Delay(checkInterval, stoppingToken);
        }
    }

    private async Task ProcessScheduledHuntsAsync(CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        // Check if we should run hourly hunts (every hour at the top of the hour)
        if (ShouldRunHourly(now))
        {
            _logger.LogInformation("Running hourly scheduled hunts at {Time}", now);
            await RunHuntsForScheduleAsync(HuntScheduleSpec.Hourly, cancellationToken);
            _lastHourlyRun = now;
        }

        // Check if we should run daily hunts (once per day at midnight UTC)
        if (ShouldRunDaily(now))
        {
            _logger.LogInformation("Running daily scheduled hunts at {Time}", now);
            await RunHuntsForScheduleAsync(HuntScheduleSpec.Daily, cancellationToken);
            _lastDailyRun = now;
        }

        // Check if we should run weekly hunts (once per week on Monday at midnight UTC)
        if (ShouldRunWeekly(now))
        {
            _logger.LogInformation("Running weekly scheduled hunts at {Time}", now);
            await RunHuntsForScheduleAsync(HuntScheduleSpec.Weekly, cancellationToken);
            _lastWeeklyRun = now;
        }

        // Custom hunts are run based on their specific cron expressions
        // This would require a cron parser to determine if they are due
        // For now, we check them every minute
        await RunCustomHuntsAsync(cancellationToken);
    }

    private bool ShouldRunHourly(DateTime now)
    {
        // Run at the top of every hour
        return now.Minute == 0 &&
               (now - _lastHourlyRun).TotalMinutes >= 59;
    }

    private bool ShouldRunDaily(DateTime now)
    {
        // Run at midnight UTC each day
        return now.Hour == 0 && now.Minute == 0 &&
               (now - _lastDailyRun).TotalHours >= 23;
    }

    private bool ShouldRunWeekly(DateTime now)
    {
        // Run at midnight UTC on Monday
        return now.DayOfWeek == DayOfWeek.Monday &&
               now.Hour == 0 && now.Minute == 0 &&
               (now - _lastWeeklyRun).TotalDays >= 6;
    }

    private async Task RunHuntsForScheduleAsync(HuntScheduleSpec scheduleSpec, CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var huntRunner = scope.ServiceProvider.GetRequiredService<IScheduledHuntRunner>();

        try
        {
            await huntRunner.RunScheduledHuntsAsync(scheduleSpec, cancellationToken);
            _logger.LogInformation("Completed {ScheduleSpec} scheduled hunts", scheduleSpec);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running {ScheduleSpec} scheduled hunts", scheduleSpec);
        }
    }

    private async Task RunCustomHuntsAsync(CancellationToken cancellationToken)
    {
        using var scope = _serviceProvider.CreateScope();
        var huntRunner = scope.ServiceProvider.GetRequiredService<IScheduledHuntRunner>();

        try
        {
            // Custom hunts have specific timing - the runner will check if each is due
            await huntRunner.RunScheduledHuntsAsync(HuntScheduleSpec.Custom, cancellationToken);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error running custom scheduled hunts");
        }
    }
}
