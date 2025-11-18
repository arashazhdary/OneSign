using Onesign.Modules.Crypto.Domain.Enums;

namespace Onesign.Modules.Crypto.Domain.Entities;

public class KeyRotationPolicy
{
    public Guid Id { get; set; }
    public KeyScopeType ScopeType { get; set; }
    public string ScopeId { get; set; } = string.Empty;
    public KeyPurpose Purpose { get; set; }
    public int RotationPeriodDays { get; set; }
    public int OverlapPeriodDays { get; set; }
    public bool Enabled { get; set; }
}
