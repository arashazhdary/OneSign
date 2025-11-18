namespace Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

public class KeySetEntity
{
    public Guid Id { get; set; }
    public int ScopeType { get; set; }
    public string ScopeId { get; set; } = string.Empty;
    public int Purpose { get; set; }
    public bool IsDefaultForScope { get; set; }
    public DateTime CreatedAt { get; set; }
}
