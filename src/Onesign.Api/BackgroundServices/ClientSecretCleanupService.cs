using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Onesign.Modules.Applications.Domain.Repositories;

namespace Onesign.Api.BackgroundServices;

public class ClientSecretCleanupService : BackgroundService
{
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<ClientSecretCleanupService> _logger;
    private readonly TimeSpan _checkInterval = TimeSpan.FromHours(6); // Run every 6 hours

    public ClientSecretCleanupService(
        IServiceProvider serviceProvider,
        ILogger<ClientSecretCleanupService> logger)
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
                var secretRepository = scope.ServiceProvider.GetRequiredService<Onesign.Modules.Applications.Domain.Repositories.IClientSecretRepository>();
                
                await secretRepository.DeleteExpiredSecretsAsync(stoppingToken);
                _logger.LogInformation("Expired client secrets cleaned up at {Time}", DateTime.UtcNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error cleaning up expired client secrets");
            }

            await Task.Delay(_checkInterval, stoppingToken);
        }
    }
}

