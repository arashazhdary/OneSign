namespace Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

public class KeyRotationPolicyEntity
{
    public Guid Id { get; set; }
    public int ScopeType { get; set; }
    public string ScopeId { get; set; } = string.Empty;
    public int Purpose { get; set; }
    public int RotationPeriodDays { get; set; }
    public int OverlapPeriodDays { get; set; }
    public bool Enabled { get; set; }
}
