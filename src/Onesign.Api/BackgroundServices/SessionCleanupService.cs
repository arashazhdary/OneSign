using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Identity.Domain.Repositories;

namespace Onesign.Api.BackgroundServices;

public class SessionCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<SessionCleanupService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(1); // Run every hour

    public SessionCleanupService(
        IServiceProvider serviceProvider,
        ILogger<SessionCleanupService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var sessionRepository = scope.ServiceProvider.GetRequiredService<IUserLoginSessionRepository>();
                
                await sessionRepository.DeleteExpiredAsync(stoppingToken);
                _logger.LogInformation("Expired sessions cleaned up at {Time}", DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired sessions");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }
}

