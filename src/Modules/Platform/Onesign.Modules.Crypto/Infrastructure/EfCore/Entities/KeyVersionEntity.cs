namespace Onesign.Modules.Crypto.Infrastructure.EfCore.Entities;

public class KeyVersionEntity
{
    public Guid Id { get; set; }
    public Guid KeySetId { get; set; }
    public string Kid { get; set; } = string.Empty;
    public string Algorithm { get; set; } = string.Empty;
    public byte[] KeyMaterial { get; set; } = Array.Empty<byte>();
    public DateTime CreatedAt { get; set; }
    public DateTime ActivatedAt { get; set; }
    public DateTime? ExpiredAt { get; set; }
    public int State { get; set; }
}
