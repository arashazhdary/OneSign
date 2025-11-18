using System.Data;

namespace Onesign.Shared.Services;

/// <summary>
/// Factory interface for creating database connections based on tenant configuration.
/// Supports routing to shared or dedicated databases based on tenant isolation level.
/// </summary>
public interface ITenantDbConnectionFactory
{
    /// <summary>
    /// Creates a database connection for the specified tenant.
    /// Routes to shared or dedicated database based on tenant configuration.
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>An open database connection</returns>
    Task<IDbConnection> CreateConnectionAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the connection string for a specific tenant.
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The connection string for the tenant's database</returns>
    Task<string> GetConnectionStringAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Determines if a tenant uses a dedicated database.
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>True if the tenant has a dedicated database</returns>
    Task<bool> IsDedicatedDatabaseAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Gets the database isolation level for a tenant.
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>The database isolation level</returns>
    Task<TenantDatabaseIsolation> GetIsolationLevelAsync(Guid tenantId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Validates database connectivity for a tenant.
    /// </summary>
    /// <param name="tenantId">The tenant identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Connection validation result</returns>
    Task<ConnectionValidationResult> ValidateConnectionAsync(Guid tenantId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Tenant database isolation levels
/// </summary>
public enum TenantDatabaseIsolation
{
    /// <summary>
    /// Tenant shares database with other tenants (row-level isolation)
    /// </summary>
    Shared = 0,

    /// <summary>
    /// Tenant has a dedicated schema within shared database
    /// </summary>
    Schema = 1,

    /// <summary>
    /// Tenant has a dedicated database instance
    /// </summary>
    Dedicated = 2,

    /// <summary>
    /// Tenant has a dedicated database cluster
    /// </summary>
    Cluster = 3
}

/// <summary>
/// Result of database connection validation
/// </summary>
public class ConnectionValidationResult
{
    /// <summary>
    /// Whether the connection is valid and accessible
    /// </summary>
    public bool IsValid { get; set; }

    /// <summary>
    /// Connection latency in milliseconds
    /// </summary>
    public int LatencyMs { get; set; }

    /// <summary>
    /// Database server version
    /// </summary>
    public string ServerVersion { get; set; } = string.Empty;

    /// <summary>
    /// Error message if connection is invalid
    /// </summary>
    public string? ErrorMessage { get; set; }

    /// <summary>
    /// The isolation level of the connection
    /// </summary>
    public TenantDatabaseIsolation IsolationLevel { get; set; }
}
