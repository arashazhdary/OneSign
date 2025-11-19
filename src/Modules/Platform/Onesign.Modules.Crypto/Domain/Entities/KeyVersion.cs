using Onesign.Modules.Crypto.Domain.Enums;

namespace Onesign.Modules.Crypto.Domain.Entities;

public class KeyVersion
{
    public Guid Id { get; set; }
    public Guid KeySetId { get; set; }
    public string Kid { get; set; } = string.Empty;
    public string Algorithm { get; set; } = string.Empty; // e.g., RS256, ES256
    public byte[] KeyMaterial { get; set; } = Array.Empty<byte>(); // encrypted blob
    public DateTime CreatedAt { get; set; }
    public DateTime ActivatedAt { get; set; }
    public DateTime? ExpiredAt { get; set; }
    public KeyVersionState State { get; set; }
}
