namespace Onesign.Modules.Identity.Domain.Entities;

public class PasskeyCredential
{
    public Guid Id { get; set; }
    public Guid TenantUserId { get; set; }
    public byte[] CredentialId { get; set; } = Array.Empty<byte>();
    public byte[] PublicKey { get; set; } = Array.Empty<byte>();
    public uint SignCounter { get; set; }
    public string CredType { get; set; } = string.Empty;
    public Guid AaGuid { get; set; }
    public string? UserHandle { get; set; }
    public string? DeviceName { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? LastUsedAt { get; set; }
    public string? Transports { get; set; }
}
