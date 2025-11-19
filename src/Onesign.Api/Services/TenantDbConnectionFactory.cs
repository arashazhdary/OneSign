using System.Data;
using System.Diagnostics;
using Microsoft.Data.SqlClient;
using Onesign.Shared.Services;

namespace Onesign.Api.Services;

/// <summary>
/// Implementation of tenant database connection factory that routes connections
/// based on tenant configuration (shared vs dedicated database).
/// </summary>
public class TenantDbConnectionFactory : ITenantDbConnectionFactory
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<TenantDbConnectionFactory> _logger;
    private readonly Dictionary<Guid, TenantDatabaseConfig> _tenantConfigCache = new();
    private readonly SemaphoreSlim _cacheLock = new(1, 1);
    private readonly TimeSpan _cacheExpiry = TimeSpan.FromMinutes(5);
    private DateTime _lastCacheRefresh = DateTime.MinValue;

    public TenantDbConnectionFactory(IConfiguration configuration, ILogger<TenantDbConnectionFactory> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<IDbConnection> CreateConnectionAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var connectionString = await GetConnectionStringAsync(tenantId, cancellationToken);
        var connection = new SqlConnection(connectionString);

        try
        {
            await connection.OpenAsync(cancellationToken);
            _logger.LogDebug("Database connection opened for tenant {TenantId}", tenantId);
            return connection;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to open database connection for tenant {TenantId}", tenantId);
            await connection.DisposeAsync();
            throw;
        }
    }

    public async Task<string> GetConnectionStringAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var config = await GetTenantConfigAsync(tenantId, cancellationToken);

        if (config == null || config.IsolationLevel == TenantDatabaseIsolation.Shared)
        {
            var sharedConnectionString = _configuration.GetConnectionString("DefaultConnection")
                ?? throw new InvalidOperationException("Default connection string not configured");

            return sharedConnectionString;
        }

        if (!string.IsNullOrEmpty(config.DedicatedConnectionString))
        {
            return config.DedicatedConnectionString;
        }

        return BuildDedicatedConnectionString(tenantId, config);
    }

    public async Task<bool> IsDedicatedDatabaseAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var isolation = await GetIsolationLevelAsync(tenantId, cancellationToken);
        return isolation == TenantDatabaseIsolation.Dedicated || isolation == TenantDatabaseIsolation.Cluster;
    }

    public async Task<TenantDatabaseIsolation> GetIsolationLevelAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var config = await GetTenantConfigAsync(tenantId, cancellationToken);
        return config?.IsolationLevel ?? TenantDatabaseIsolation.Shared;
    }

    public async Task<ConnectionValidationResult> ValidateConnectionAsync(Guid tenantId, CancellationToken cancellationToken = default)
    {
        var result = new ConnectionValidationResult
        {
            IsolationLevel = await GetIsolationLevelAsync(tenantId, cancellationToken)
        };

        var stopwatch = Stopwatch.StartNew();

        try
        {
            using var connection = await CreateConnectionAsync(tenantId, cancellationToken);

            using var command = ((SqlConnection)connection).CreateCommand();
            command.CommandText = "SELECT @@VERSION";
            var version = await command.ExecuteScalarAsync(cancellationToken);

            stopwatch.Stop();

            result.IsValid = true;
            result.LatencyMs = (int)stopwatch.ElapsedMilliseconds;
            result.ServerVersion = version?.ToString() ?? "Unknown";

            _logger.LogInformation(
                "Connection validation successful for tenant {TenantId}. Latency: {LatencyMs}ms",
                tenantId, result.LatencyMs);
        }
        catch (Exception ex)
        {
            stopwatch.Stop();

            result.IsValid = false;
            result.LatencyMs = (int)stopwatch.ElapsedMilliseconds;
            result.ErrorMessage = ex.Message;

            _logger.LogError(ex, "Connection validation failed for tenant {TenantId}", tenantId);
        }

        return result;
    }

    private async Task<TenantDatabaseConfig?> GetTenantConfigAsync(Guid tenantId, CancellationToken cancellationToken)
    {
        await _cacheLock.WaitAsync(cancellationToken);
        try
        {
            if (DateTime.UtcNow - _lastCacheRefresh > _cacheExpiry)
            {
                await RefreshCacheAsync(cancellationToken);
            }

            return _tenantConfigCache.TryGetValue(tenantId, out var config) ? config : null;
        }
        finally
        {
            _cacheLock.Release();
        }
    }

    private async Task RefreshCacheAsync(CancellationToken cancellationToken)
    {
        _logger.LogDebug("Refreshing tenant database configuration cache");

        var dedicatedTenants = _configuration.GetSection("Tenants:Dedicated").Get<List<TenantDatabaseConfigEntry>>() ?? new();
        var schemaTenants = _configuration.GetSection("Tenants:Schema").Get<List<TenantDatabaseConfigEntry>>() ?? new();

        _tenantConfigCache.Clear();

        foreach (var entry in dedicatedTenants)
        {
            if (Guid.TryParse(entry.TenantId, out var tenantId))
            {
                _tenantConfigCache[tenantId] = new TenantDatabaseConfig
                {
                    TenantId = tenantId,
                    IsolationLevel = TenantDatabaseIsolation.Dedicated,
                    DedicatedConnectionString = entry.ConnectionString,
                    DatabaseServer = entry.Server,
                    DatabaseName = entry.Database
                };
            }
        }

        foreach (var entry in schemaTenants)
        {
            if (Guid.TryParse(entry.TenantId, out var tenantId))
            {
                _tenantConfigCache[tenantId] = new TenantDatabaseConfig
                {
                    TenantId = tenantId,
                    IsolationLevel = TenantDatabaseIsolation.Schema,
                    SchemaName = entry.Schema ?? $"tenant_{tenantId:N}"
                };
            }
        }

        _lastCacheRefresh = DateTime.UtcNow;
        await Task.CompletedTask;

        _logger.LogInformation(
            "Tenant database configuration cache refreshed. Dedicated: {DedicatedCount}, Schema: {SchemaCount}",
            dedicatedTenants.Count, schemaTenants.Count);
    }

    private string BuildDedicatedConnectionString(Guid tenantId, TenantDatabaseConfig config)
    {
        var baseConnection = _configuration.GetConnectionString("DedicatedTemplate")
            ?? _configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("No connection string template configured");

        var builder = new SqlConnectionStringBuilder(baseConnection);

        if (!string.IsNullOrEmpty(config.DatabaseServer))
        {
            builder.DataSource = config.DatabaseServer;
        }

        if (!string.IsNullOrEmpty(config.DatabaseName))
        {
            builder.InitialCatalog = config.DatabaseName;
        }
        else
        {
            builder.InitialCatalog = $"onesign_tenant_{tenantId:N}";
        }

        return builder.ConnectionString;
    }

    private class TenantDatabaseConfig
    {
        public Guid TenantId { get; set; }
        public TenantDatabaseIsolation IsolationLevel { get; set; }
        public string? DedicatedConnectionString { get; set; }
        public string? DatabaseServer { get; set; }
        public string? DatabaseName { get; set; }
        public string? SchemaName { get; set; }
    }

    private class TenantDatabaseConfigEntry
    {
        public string TenantId { get; set; } = string.Empty;
        public string? ConnectionString { get; set; }
        public string? Server { get; set; }
        public string? Database { get; set; }
        public string? Schema { get; set; }
    }
}
