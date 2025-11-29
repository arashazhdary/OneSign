namespace Onesign.Modules.Security.Domain.Entities;

/// <summary>
/// Minimal TenantUser entity for Security module use
/// </summary>
public class TenantUser
{
    public Guid Id { get; set; }
    public Guid GlobalUserId { get; set; }
    public Guid TenantId { get; set; }
}
