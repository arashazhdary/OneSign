using Onesign.Modules.Developer.Domain.Enums;

namespace Onesign.Modules.Developer.Application.DTOs;

public class ApiKeyDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public Guid? ServiceAccountId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string KeyPrefix { get; set; } = string.Empty;
    public ApiKeyStatus Status { get; set; }
    public List<string> Scopes { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
    public string? RevokedReason { get; set; }
}

public class CreateApiKeyResultDto
{
    public Guid Id { get; set; }
    public string PlainTextKey { get; set; } = string.Empty; // Only returned once
    public string KeyPrefix { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class ServiceAccountDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public ServiceAccountStatus Status { get; set; }
    public List<string> Roles { get; set; } = new();
    public DateTime CreatedAt { get; set; }
    public DateTime? LastAccessAt { get; set; }
    public int ApiKeyCount { get; set; }
}
