using Onesign.Modules.Crypto.Domain.Enums;

namespace Onesign.Modules.Crypto.Domain.Entities;

public class KeySet
{
    public Guid Id { get; set; }
    public Guid? TenantId { get; set; }
    public KeyScopeType ScopeType { get; set; }
    public string ScopeId { get; set; } = string.Empty;
    public KeyPurpose Purpose { get; set; }
    public bool IsDefaultForScope { get; set; }
    public DateTime CreatedAt { get; set; }
}
