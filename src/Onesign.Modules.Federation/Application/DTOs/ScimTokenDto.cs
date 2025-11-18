using Onesign.Modules.Federation.Domain.Enums;

namespace Onesign.Modules.Federation.Application.DTOs;

public class ScimTokenDto
{
    public Guid Id { get; set; }
    public Guid TenantId { get; set; }
    public string Name { get; set; } = string.Empty;
    public ScimTokenStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? ExpiresAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public string? PlainToken { get; set; } // Only populated on creation
}
